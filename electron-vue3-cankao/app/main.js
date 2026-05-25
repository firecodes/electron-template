const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
app.disableHardwareAcceleration();

// 是否为开发模式
// const isDev = process.env.NODE_ENV === 'development';
const isDev = false;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    // mainWindow.setWindowButtonVisibility(true);

    // 开发模式加载 Vite 开发服务器，生产模式加载打包后的文件
    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        // mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// ============ IPC 处理器 - 桥接鸿蒙原生能力 ============

// 系统信息
ipcMain.handle('ohos:getSystemInfo', async () => {
    // 这些会通过 JsBinding 调用鸿蒙原生 API
    return {
        platform: 'HarmonyOS',
        version: '5.0',
        deviceType: 'tablet'
    };
});

// 文件操作
ipcMain.handle('ohos:showOpenDialog', async (event, options) => {
    const { dialog } = require('electron');
    return await dialog.showOpenDialog(mainWindow, options);
});

ipcMain.handle('ohos:showSaveDialog', async (event, options) => {
    const { dialog } = require('electron');
    return await dialog.showSaveDialog(mainWindow, options);
});

// 通知
ipcMain.handle('ohos:showNotification', async (event, { title, body }) => {
    const { Notification } = require('electron');
    new Notification({ title, body }).show();
    return true;
});

// 剪贴板
ipcMain.handle('ohos:clipboard:read', async () => {
    const { clipboard } = require('electron');
    return clipboard.readText();
});

ipcMain.handle('ohos:clipboard:write', async (event, text) => {
    const { clipboard } = require('electron');
    clipboard.writeText(text);
    return true;
});

// 窗口控制
ipcMain.handle('ohos:window:minimize', async () => {
    mainWindow?.minimize();
});

ipcMain.handle('ohos:window:maximize', async () => {
    if (mainWindow?.isMaximized()) {
        mainWindow.unmaximize();
    } else {
        mainWindow?.maximize();
    }
});

ipcMain.handle('ohos:window:close', async () => {
    mainWindow?.close();
});

ipcMain.handle('ohos:window:setTitle', async (event, title) => {
    mainWindow?.setTitle(title);
});

ipcMain.handle('ohos:window:setSize', async (event, { width, height }) => {
    mainWindow?.setSize(width, height);
});

// 应用生命周期
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
