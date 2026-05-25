/**
 * Preload 脚本 - 桥接 Vue3 和鸿蒙原生能力
 * 在 Vue3 中通过 window.ohos 访问所有原生 API
 */
const { contextBridge, ipcRenderer } = require('electron');

// 暴露鸿蒙桥接 API 给 Vue3
contextBridge.exposeInMainWorld('ohos', {
    // ============ 系统信息 ============
    getSystemInfo: () => ipcRenderer.invoke('ohos:getSystemInfo'),

    // ============ 文件操作 ============
    file: {
        // 打开文件选择对话框
        showOpenDialog: (options = {}) => ipcRenderer.invoke('ohos:showOpenDialog', {
            properties: ['openFile'],
            ...options
        }),
        // 打开文件夹选择对话框
        showDirectoryDialog: (options = {}) => ipcRenderer.invoke('ohos:showOpenDialog', {
            properties: ['openDirectory'],
            ...options
        }),
        // 保存文件对话框
        showSaveDialog: (options = {}) => ipcRenderer.invoke('ohos:showSaveDialog', options),
    },

    // ============ 通知 ============
    notification: {
        show: (title, body) => ipcRenderer.invoke('ohos:showNotification', { title, body }),
    },

    // ============ 剪贴板 ============
    clipboard: {
        read: () => ipcRenderer.invoke('ohos:clipboard:read'),
        write: (text) => ipcRenderer.invoke('ohos:clipboard:write', text),
    },

    // ============ 窗口控制 ============
    window: {
        minimize: () => ipcRenderer.invoke('ohos:window:minimize'),
        maximize: () => ipcRenderer.invoke('ohos:window:maximize'),
        close: () => ipcRenderer.invoke('ohos:window:close'),
        setTitle: (title) => ipcRenderer.invoke('ohos:window:setTitle', title),
        setSize: (width, height) => ipcRenderer.invoke('ohos:window:setSize', { width, height }),
    },

    // ============ 事件监听 ============
    on: (channel, callback) => {
        const validChannels = ['window-focus', 'window-blur', 'theme-change'];
        if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, (event, ...args) => callback(...args));
        }
    },

    // ============ 平台信息 ============
    platform: 'ohos',
    isOhos: true,
});

// 暴露 Electron API（可选，用于高级功能）
contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: {
        invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
        on: (channel, callback) => ipcRenderer.on(channel, (event, ...args) => callback(...args)),
        once: (channel, callback) => ipcRenderer.once(channel, (event, ...args) => callback(...args)),
    }
});
