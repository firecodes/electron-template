
import { ref, reactive } from "vue";
import {shortcutConfig} from "@utils/shortcuts/ShortcutConfig";
import {api} from "@api/api";
import {EventEmitter, showToast} from '@utils';
import {cacheManager} from "@services/CacheManager";

class Keyboard {
     // 存储所有 ref 的响应式对象，key 为 ref 名称，value 为组件实例
    data= reactive({});
    log= ref('')
    title =  ref('choose-file')
    src =  ref('')

    constructor() {
        // super();
        // this.library = [];
        // this.filteredLibrary = [];
        // this.components = {};
    }
  // 统一的快捷键管理器
  initKeyboardShortcuts() {
    // 防抖机制，防止快速重复按键
    let lastKeyTime = 0;
    const DEBOUNCE_DELAY = 200; // 200ms防抖延迟

    document.addEventListener('keydown', async (e) => {
        // 如果焦点在输入框中，不处理快捷键
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        // 如果快捷键录制器正在录制，不处理应用快捷键
        if (shortcutRecorder && shortcutRecorder.isRecording) {
            return;
        }

        const currentTime = Date.now();
        const pressedKey = this.generateKeyString(e);

        const shortcuts = this.getEnabledShortcuts();
        const matchedShortcut = this.findMatchingShortcut(pressedKey, shortcuts);

        if (matchedShortcut) {
            // 对于播放/暂停快捷键，添加防抖机制
            if (matchedShortcut.id === 'playPause') {
                if (currentTime - lastKeyTime < DEBOUNCE_DELAY) {
                    console.log('🚫 快捷键防抖：忽略重复的播放/暂停快捷键');
                    return;
                }
                lastKeyTime = currentTime;
            }

            e.preventDefault();
            e.stopPropagation(); // 阻止事件冒泡
            console.log(`⌨️ 统一快捷键管理器：处理快捷键 ${matchedShortcut.name} (${pressedKey})`);

            // 执行快捷键对应的操作
            await this.executeShortcutAction(matchedShortcut.id);
            return;
        }
        // 处理文件操作快捷键（不在配置中的系统快捷键）
        await this.handleSystemShortcuts(e);
    });
  }
  
    // 初始化全局快捷键
    async initGlobalShortcuts() {
        await shortcutConfig.initializeGlobalShortcuts();

        // 监听全局快捷键触发事件
        window.addEventListener('globalShortcutTriggered', (event) => {
            const {shortcutId} = event.detail;
            // 执行对应的快捷键操作
            this.executeShortcutAction(shortcutId);
        });
    }

   // 执行快捷键对应的操作
  async executeShortcutAction(shortcutId) {
    switch (shortcutId) {
      case 'playPause':
        const player = this.getActivePlayer();
        if (player && typeof player.togglePlayPause === 'function') {
          await player.togglePlayPause();
        } else {
          console.warn('⚠️ 未找到活跃的播放器组件');
        }
        break;

      case 'previousTrack':
        await api.previousTrack();
        break;

      case 'nextTrack':
        await api.nextTrack();
        break;

      case 'volumeUp':
        const currentVolume = await api.getVolume();
        await api.setVolume(Math.min(1, currentVolume + 0.01));
        break;

      case 'volumeDown':
        const volume = await api.getVolume();
        await api.setVolume(Math.max(0, volume - 0.01));
        break;

      case 'search':
        document.getElementById('search-input')?.focus();
        break;

      case 'seekForward':
        await api.seekForward(3);
        break;

      case 'seekBackward':
        await api.seekBackward(3);
        break;

      case 'toggleLyrics':
        if (this.components.lyrics) {
          if (this.components.lyrics.isVisible) {
            this.components.lyrics.hide();
          } else {
            const currentTrack = api.getCurrentTrack();
            if (currentTrack) {
              await this.components.lyrics.show(currentTrack);
            }
          }
        }
        break;

      case 'exitLyrics':
        if (this.components.lyrics && this.components.lyrics.isVisible) {
          if (this.components.lyrics.isFullscreen) {
            this.components.lyrics.exitFullscreen();
          } else {
            this.components.lyrics.hide();
          }
        }
        break;

      case 'toggleFullscreen':
        if (this.components.lyrics && this.components.lyrics.isVisible) {
          this.components.lyrics.toggleFullscreen();
        }
        break;

      default:
        console.warn(`未知的快捷键操作: ${shortcutId}`);
    }
  }
  // 处理系统快捷键
  async handleSystemShortcuts(e) {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'o':
          e.preventDefault();
          // await this.addMusicFiles();
          break;
        case 'O':
          e.preventDefault();
           await this.openDirectoryDialog();
          break;
      }
    }
  }
// 生成按键字符串
  generateKeyString(event) {
    const keys = [];

    // 添加修饰键（按固定顺序）
    if (event.ctrlKey) keys.push('Ctrl');
    if (event.altKey) keys.push('Alt');
    if (event.shiftKey) keys.push('Shift');
    if (event.metaKey) keys.push('Cmd');

    // 添加主键
    const mainKey = this.normalizeKey(event);
    if (mainKey) keys.push(mainKey);
    return keys.join('+');
  }
  
  // 标准化按键名称
  normalizeKey(event) {
    const key = event.key;

    // 特殊键
    if (key === ' ') return 'Space';
    if (key === 'Escape') return 'Escape';
    if (key === 'Enter') return 'Enter';
    if (key === 'Tab') return 'Tab';
    if (key === 'Backspace') return 'Backspace';
    if (key === 'Delete') return 'Delete';

    // 方向键
    if (key === 'ArrowUp') return 'ArrowUp';
    if (key === 'ArrowDown') return 'ArrowDown';
    if (key === 'ArrowLeft') return 'ArrowLeft';
    if (key === 'ArrowRight') return 'ArrowRight';

    // 功能键
    if (key.startsWith('F') && key.length <= 3) return key;

    // 字母和数字
    if (key.length === 1 && /[a-zA-Z0-9]/.test(key)) {
      return key.toUpperCase();
    }

    return null;
  }
  // 获取当前启用的快捷键
  getEnabledShortcuts() {
    return shortcutConfig.getEnabledLocalShortcuts();
  }
  // 查找匹配的快捷键
  findMatchingShortcut(pressedKey, shortcuts) {
    for (const [_id, shortcut] of Object.entries(shortcuts)) {
      if (shortcut.key === pressedKey) {
        return shortcut;
      }
    }
    return null;
  }
  
    // 获取当前活跃的播放器组件
    getActivePlayer() {
        // 检查是否有歌词页面组件且可见
        if (this.components.lyrics && this.components.lyrics.isVisible) {
            // 如果歌词页面有播放器功能，返回歌词页面
            return this.components.lyrics;
        }
        // 否则返回主播放器
        if (this.components.player) {
            return this.components.player;
        }

        console.warn('⚠️ 未找到任何播放器组件');
        return null;
    }
    async openDirectoryDialog() {
        try {
            const directory = await fileAPI.openDirectoryDialog();
            if (directory) {
                await this.scanDirectory(directory);
            }
        } catch (error) {
           // this.showError('无法打开目录选择框');
        }
    }
    async scanDirectory(directoryPath) {
        try {
            this.showInfo('扫描音乐文件...');
            const success = await api.scanDirectory(directoryPath);
            if (success) {
               showToast('音乐目录扫描完成', 'success');
                // API层会自动触发音乐库更新事件，无需手动刷新
            } else {
               showToast('扫描失败', 'error');
            }
        } catch (error) {
            console.error('扫描失败：', error);
            showToast('扫描失败', 'error');
        }
    }
}

export function useKeyboard(){
  const useClass = new Keyboard();

//   onReady(() => {
//    useClass.initKeyboardShortcuts();
//   });

//   // 页面卸载时清理监听
//   onUnmounted(() => {
//   })
  return useClass;
};
