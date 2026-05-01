
// import { ref, reactive,  isReactive, isRef  } from "vue";
// import {shortcutConfig} from "@utils/shortcuts/ShortcutConfig";
// import {api} from "@api/api";

// class App {
    // // 存储所有 ref 的响应式对象，key 为 ref 名称，value 为组件实例
    // data= reactive({});
    // log= ref('')
    // title =  ref('choose-file')
    // src =  ref('')

//   initEvent(){
//        // 添加播放列表按钮
//         const addPlaylistBtn = document.getElementById('add-playlist-btn');
//         if (addPlaylistBtn) {
//             this.addManagedEventListener(addPlaylistBtn, 'click', () => {
//                 this.showCreatePlaylistDialog();
//             });
//         }
//    // API events - 使用管理的API事件监听器
//         this.addManagedAPIEventListener('libraryUpdated', async (_data) => {
//             await this.refreshLibrary();
//         });

//         this.addManagedAPIEventListener('playlistChanged', (tracks) => {
//             console.log('🎵 API播放列表改变:', tracks.length, '首歌曲');
//             // 确保播放列表组件与API同步
//             if (this.components.playlist && tracks.length > 0) {
//                 this.components.playlist.setTracks(tracks, api.currentIndex);
//             }
//         });

//         this.addManagedAPIEventListener('libraryTrackDurationUpdated', ({filePath, duration}) => {
//             console.log('🎵 更新音乐库歌曲时长:', filePath, duration.toFixed(2) + 's');
//             this.updateLibraryTrackDuration(filePath, duration);
//         });

//         this.addManagedAPIEventListener('playModeChanged', (mode) => {
//             this.components.player.updatePlayModeDisplay(mode);
//         });

//         // Update lyrics page when track changes
//         this.addManagedAPIEventListener('trackChanged', async (track) => {
//             if (this.components.lyrics && this.components.lyrics.isVisible) {
//                 await this.components.lyrics.show(track);
//             }
//         });

//         // Update lyrics page progress
//         this.addManagedAPIEventListener('positionChanged', (position) => {
//             if (this.components.lyrics && this.components.lyrics.isVisible) {
//                 // 使用当前歌曲的时长以避免使用可能过期的全局 api.duration
//                 const duration = (api.currentTrack && api.currentTrack.duration) ? api.currentTrack.duration : api.duration;
//                 this.components.lyrics.updateProgress(position, duration);
//             }
//         });

//         // Update lyrics page play button
//         this.addManagedAPIEventListener('playbackStateChanged', (state) => {
//             if (this.components.lyrics && this.components.lyrics.isVisible) {
//                 this.components.lyrics.updatePlayButton(state === 'playing');
//             }
//         });

//         api.on('scanProgress', (progress) => {
//             this.updateScanProgress(progress);
//         });
//       // 添加拖放支持
//         document.addEventListener('dragover', (e) => {
//             e.preventDefault();
//             e.dataTransfer.dropEffect = 'copy';
//         });

//         document.addEventListener('drop', async (e) => {
//             e.preventDefault();
//             await this.handleFileDrop(e);
//         });

//           const searchInput = document.getElementById('search-input');
//         if (searchInput) {
//             searchInput.placeholder = '搜索... (Ctrl+O 添加音乐, Ctrl+Shift+O 添加音乐目录)';
//         }
//   }
//    // 添加管理的事件监听器
//     addManagedEventListener(element, event, handler, options) {
//         element.addEventListener(event, handler, options);
//         // this.eventListeners.push({element, event, handler, options});
//     }
// }

// export function useApp(){
//   const useClass = new App();

// //   onReady(() => {
// //    useClass.initKeyboardShortcuts();
// //   });

// //   // 页面卸载时清理监听
// //   onUnmounted(() => {
// //   })
//   return useClass;
// };
