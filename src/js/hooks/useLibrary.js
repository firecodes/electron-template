
import { ref, reactive,  isReactive, isRef  } from "vue";
import {shortcutConfig} from "@utils/shortcuts/ShortcutConfig";
import {api} from "@api/api";
import {updateAPI, fileAPI, libraryAPI, trayAPI, windowAPI} from "@js/api";
import {localCoverManager} from "@services/cover/LocalCoverManager";
import {EventEmitter, showToast} from '@utils';
import {cacheManager} from "@services/CacheManager";

class Library {
     // 存储所有 ref 的响应式对象，key 为 ref 名称，value 为组件实例
    data= reactive({});
    log= ref('')
    title =  ref('choose-file')
    src =  ref('')

    constructor() {
        this.library = [];
        this.filteredLibrary = [];
        this.components = {};
    }

    async refreshLibrary() {
        try {
            this.library = await libraryAPI.getTracks();
            this.filteredLibrary = [...this.library];
            this.updateTrackList('refresh');
        } catch (error) {
            console.error('❌ [App] refreshLibrary 失败:', error);
        }
    }
     handleSearchResults(results) {
        this.filteredLibrary = results;
        this.updateTrackList('search-results');
    }

    handleSearchCleared() {
        this.filteredLibrary = [...this.library];
        this.updateTrackList('search-cleared');
    }

    async loadInitialData() {
        try {
            // 首先尝试从缓存加载音乐库
            const hasCachedLibrary = await libraryAPI.hasCachedLibrary();
            if (hasCachedLibrary) {
                this.showCacheLoadingStatus();

                // 从缓存加载音乐库
                this.library = await api.loadCachedTracks();
                if (this.library.length > 0) {
                    this.filteredLibrary = [...this.library];
                    if (this.currentView === 'library') {
                        this.updateTrackList('cache-load');
                    }
                    this.hideCacheLoadingStatus();

                    // 预加载封面数据
                    await this.preloadTrackCovers();

                    // 在后台验证缓存
                    await this.validateCacheInBackground();
                    return;
                }
            }

            // 如果没有缓存或缓存为空，检查内存中的音乐库
            this.library = await libraryAPI.getTracks();
            if (this.library.length === 0) {
                this.showWelcomeScreen();
            } else {
                // 加载库视图
                this.filteredLibrary = [...this.library];
                if (this.currentView === 'library') {
                    this.updateTrackList('initial-load');
                }

                // 预加载封面数据
                await this.preloadTrackCovers();
            }

            // 确保桌面歌词按钮状态与设置同步
            await this.syncDesktopLyricsButtonState();
        } catch (error) {
            showToast('加载音乐库失败', 'error');
        }
    }

    async validateCacheInBackground() {
        try {
            api.on('cacheValidationCompleted', (result) => {
                // 如果有无效文件被清理，更新UI
                if (result.invalid > 0) {
                    console.warn(`已清理 ${result.invalid} 个无效的音乐文件`);
                    showToast(`已清理 ${result.invalid} 个无效的音乐文件`);

                    // 更新音乐库
                    if (result.tracks) {
                        this.library = result.tracks;
                        this.filteredLibrary = [...this.library];
                        this.updateTrackList('cache-validation');
                    }
                }
            });

            api.on('cacheValidationError', (error) => {
                console.warn('⚠️ 后台缓存验证失败:', error);
            });

            // 启动验证
            await api.validateCache();
        } catch (error) {
            console.warn('⚠️ 后台缓存验证失败:', error);
        }
    }

    // 同步桌面歌词按钮状态
    async syncDesktopLyricsButtonState() {
        try {
            if (this.components.player && this.components.settings) {
                // 从设置中获取桌面歌词状态
                const settings = cacheManager.getLocalCache('musicbox-settings') || {};
                const desktopLyricsEnabled = settings.hasOwnProperty('desktopLyrics') ? settings.desktopLyrics : true;

                // 更新Player组件的按钮状态
                await this.components.player.updateDesktopLyricsButtonVisibility(desktopLyricsEnabled);
            } else{
                console.error('❌ App: 同步桌面歌词 UI状态失败:');
            }
        } catch (error) {
            console.error('❌ App: 同步桌面歌词按钮状态失败:', error);
        }
    }
     showCacheLoadingStatus() {
        const statusElement = document.getElementById('cache-loading-status');
        if (statusElement) {
            statusElement.style.display = 'block';
            statusElement.textContent = '正在从缓存加载音乐库...';
        }
    }
    
    hideCacheLoadingStatus() {
        const statusElement = document.getElementById('cache-loading-status');
        if (statusElement) {
            statusElement.style.display = 'none';
        }
    }
    updateTrackList(source = 'unknown') {
        console.log('🔄 [App] updateTrackList 被调用，来源:', source, '当前视图:', this.currentView);

        // 如果是播放时长更新触发的调用，且当前不在音乐库页面，则跳过更新
        if (source === 'duration-update' && this.currentView !== 'library') {
            console.log('📝 [App] 跳过播放时长更新触发的音乐列表更新，当前视图:', this.currentView);
            return;
        }

        if (this.components.trackList) {
            this.components.trackList.setTracks(this.filteredLibrary);
        }
    }
   // 预加载歌曲封面
    async preloadTrackCovers() {
        try {
            // 检查是否启用了封面显示
            const settings = cacheManager.getLocalCache('musicbox-settings') || {};
            const showTrackCovers = settings.hasOwnProperty('showTrackCovers') ? settings.showTrackCovers : true;
            if (!showTrackCovers) {
                return;
            }

            // 防重复
            // 检查是否已经预加载过
            if (this.coversPreloadedByApp) {
                return;
            }

            // 预加载前12首歌曲的封面，避免阻塞UI
            // 为啥是12首？因为全屏状态下，一页最多显示12首歌😋
            // 坏了兄弟们，预加载12首似乎有点占内存，砍一半吧🥵
            const tracksToPreload = this.library.slice(0, 6);
            await localCoverManager.preloadCovers(tracksToPreload);
            this.coversPreloadedByApp = true;
        } catch (error) {
            console.warn('⚠️ App: 封面预加载失败:', error);
        }
    }

    
    showWelcomeScreen() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;

        contentArea.innerHTML = `
            <div class="welcome-screen">
                <div class="welcome-content">
                    <h1>欢迎！</h1>
                    <p>添加喜欢的音乐吧！</p>
                    <div class="welcome-actions">
                        <button class="primary-button" id="scan-folder-btn">
                            <svg class="icon" viewBox="0 0 24 24">
                                <path d="M10,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V8C22,6.89 21.1,6 20,6H12L10,4Z"/>
                            </svg>
                            添加音乐目录
                        </button>
                        <button class="secondary-button" id="add-files-btn">
                            <svg class="icon" viewBox="0 0 24 24">
                                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                            </svg>
                            添加音乐
                        </button>
                    </div>
                </div>
            </div>
        `;

        // 为主页按钮添加事件监听
        document.getElementById('scan-folder-btn')?.addEventListener('click', async () => {
            await this.scanMusicFolder();
        });
        document.getElementById('add-files-btn')?.addEventListener('click', async () => {
            await this.addMusicFiles();
        });
    }

    
    async scanMusicFolder() {
        try {
            const folderPath = await fileAPI.openDirectory();
            if (folderPath) {
                this.showScanProgress();
                const success = await api.scanDirectory(folderPath);
                if (success) {
                    showToast('音乐目录扫描成功', 'success');
                    // API层会自动触发音乐库更新事件，无需手动刷新
                } else {
                    showToast('音乐目录扫描失败', 'error');
                }
            }
        } catch (error) {
            showToast('音乐目录扫描失败', 'error');
        }
    }

    async addMusicFiles() {
        try {
            const filePaths = await fileAPI.openFiles();
            if (filePaths.length > 0) {
                let successCount = 0;
                for (const filePath of filePaths) {
                    // 获取文件元数据
                    const metadata = await libraryAPI.getTrackMetadata(filePath);
                    if (metadata) {
                        // 添加到音乐库缓存
                        const result = await api.addTrackToLibrary(metadata);
                        if (result && result.success) {
                            successCount++;
                            console.log('🎉 [App] 文件添加成功:', metadata.title);
                        }
                    }
                }

                // 显示结果提示
                if (successCount > 0) {
                    showToast(`成功添加 ${successCount} 首音乐`, 'success');
                } else {
                    showToast('添加音乐失败', 'error');
                }
            }
        } catch (error) {
            showToast('添加音乐失败', 'error');
        }
    }

    
    showScanProgress() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;

        contentArea.innerHTML = `
            <div class="scan-progress">
                <div class="scan-content">
                    <h2>扫描音乐库</h2>
                    <div class="progress-bar">
                        <div class="progress-fill" id="scan-progress-fill"></div>
                    </div>
                    <p id="scan-status">加载中...</p>
                </div>
            </div>
        `;
    }


     // 恢复播放状态
    async restorePlaybackState() {
        try {
            const settings = cacheManager.getLocalCache('musicbox-settings') || {};
            const playbackState = cacheManager.getLocalCache('playback-state');

            // 如果启用了记住播放位置且有保存的状态
            if (settings.rememberPosition && playbackState) {
                const {currentTrack, position, isPlaying, playlist, currentIndex, playMode} = playbackState;

                // 恢复播放模式
                if (playMode) {
                    api.setPlayMode(playMode);
                }

                // 恢复播放列表
                if (playlist && playlist.length > 0) {
                    // 验证播放列表中的文件是否存在
                    const validTracks = [];
                    let validCurrentIndex = -1;

                    for (let i = 0; i < playlist.length; i++) {
                        const track = playlist[i];
                        if (track && track.filePath) {
                            validTracks.push(track);
                            // 如果这是当前播放的歌曲，记录新的索引
                            if (i === currentIndex) {
                                validCurrentIndex = validTracks.length - 1;
                            }
                        }
                    }

                    if (validTracks.length > 0) {
                        // 设置播放列表到API和UI组件
                        await api.setPlaylist(validTracks, validCurrentIndex);

                        if (this.components.playlist) {
                            this.components.playlist.setTracks(validTracks, validCurrentIndex);
                        }

                        // 如果有当前播放的歌曲，加载它
                        if (validCurrentIndex >= 0 && validTracks[validCurrentIndex]) {
                            const trackToLoad = validTracks[validCurrentIndex];
                            const loadResult = await api.loadTrack(trackToLoad.filePath);
                            if (loadResult) {
                                // 恢复播放位置
                                if (position > 0) {
                                    const setPositionResult = await api.setPosition(position);
                                    console.log('App: setPosition 结果:', setPositionResult);
                                }

                                // 如果启用了自动播放且上次是播放状态
                                if (settings.autoplay && isPlaying) {
                                    setTimeout(async () => {
                                        await api.play();
                                    }, 1000);
                                }
                            }
                        }
                    } else {
                        console.warn('⚠️ App: 播放列表中没有有效歌曲');
                        if (settings.autoplay) {
                            await this.autoplayFirstTrack();
                        }
                    }
                } else if (currentTrack) {
                    // 兼容旧版本
                    console.log('💾 App: 恢复单个歌曲（兼容模式）:', currentTrack.title);
                    const loadResult = await api.loadTrack(currentTrack.filePath);
                    if (loadResult) {
                        if (position > 0) {
                            await api.setPosition(position);
                        }
                        if (settings.autoplay && isPlaying) {
                            setTimeout(async () => {
                                await api.play();
                            }, 1000);
                        }
                    }
                } else {
                    console.warn('⚠️ App: 没有保存的播放信息');
                    if (settings.autoplay) {
                        await this.autoplayFirstTrack();
                    }
                }
            } else if (settings.autoplay) {
                // 仅启用自动播放，播放第一首可用歌曲
                console.log('▶️ App: 仅启用自动播放，播放第一首歌曲');
                await this.autoplayFirstTrack();
            } else {
                console.log('ℹ️ App: 未启用自动播放或记住播放位置');
            }
        } catch (error) {
            console.error('❌ App: 恢复播放状态失败:', error);
        }
    }
  // 自动播放第一首歌曲
    async autoplayFirstTrack() {
        setTimeout(async () => {
            const tracks = await libraryAPI.getTracks();
            if (tracks && tracks.length > 0) {
                console.log('🎵 App: 加载第一首歌曲:', tracks[0].title);
                const loadResult = await api.loadTrack(tracks[0].filePath);
                console.log('📂 App: 加载结果:', loadResult);
                if (loadResult) {
                    await api.play();
                }
            } else {
                console.warn('⚠️ App: 音乐库为空，无法自动播放');
            }
        }, 1000);
    }
}

export function useLibrary(){
  const useClass = new Library();

//   onReady(() => {
//    useClass.initKeyboardShortcuts();
//   });

//   // 页面卸载时清理监听
//   onUnmounted(() => {
//   })
  return useClass;
};
