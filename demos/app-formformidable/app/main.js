const { app, BrowserWindow, Tray, nativeImage, Menu, shell, ipcMain, dialog, clipboard, systemPreferences } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const https = require('https');
const http = require('http');

// 导入OCR服务模块
require('./main/ocr-service.js');

let mainWindow;
let tray;
let aboutWindow = null;
let childWindow = null;
let floatWindow = null;
let snakeWindow = null;
let screenRecorderWindow = null;
let cameraWindow = null;
//created by AI
// 图片尺寸调节窗口变量
let imageResizerWindow = null;
//created by AI//
//created by AI
// 系统通知窗口变量
let notificationWindow = null;
//created by AI//
//created by AI
// 硬件信息窗口变量
let deviceInfoWindow = null;
//created by AI//
//created by AI
// IP地址获取窗口变量
let ipWindow = null;
//created by AI//
//created by AI
// OCR识别窗口变量
let ocrWindow = null;
//created by AI//

//created by AI
// web文件下载窗口变量
let webDownloadWindow = null;
//created by AI//

//created by AI
// 文件预览窗口变量
let filePreviewWindow = null;
//created by AI//

//created by AI
// 打印预览窗口变量
let printPreviewWindow = null;
//created by AI//

//created by AI
// 图片编辑窗口变量
let imageEditorWindow = null;
//created by AI//

//created by AI
// lodash三方库调用窗口变量
let lodashWindow = null;
//created by AI//

//created by AI
// axios三方库调用窗口变量
let axiosWindow = null;
// moment三方库调用窗口变量
let momentWindow = null;
// express三方库调用窗口变量
let expressWindow = null;
// formidable三方库调用窗口变量
let formidableWindow = null;
// 每日早报窗口变量
let zaobaoWindow = null;
//created by AI//

function createAboutWindow() {
    console.log('Creating About window...');
    
    if (aboutWindow) {
        console.log('About window already exists, focusing...');
        aboutWindow.focus();
        return;
    }

    aboutWindow = new BrowserWindow({
        width: 900,
        height: 700,
        title: '关于 - Harmony PC 开发者社区',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    const readmePath = path.join(__dirname, 'readme.html');
    console.log('Loading README from:', readmePath);
    aboutWindow.loadFile(readmePath);

    aboutWindow.on('closed', function() {
        console.log('About window closed');
        aboutWindow = null;
    });
}

function createChildWindow() {
    console.log('Creating Child window...');
    
    if (childWindow) {
        console.log('Child window already exists, focusing...');
        childWindow.focus();
        return;
    }

    childWindow = new BrowserWindow({
        parent: mainWindow,
        modal: true,
        width: 400,
        height: 300,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    childWindow.loadFile(path.join(__dirname, 'child.html'));

    childWindow.on('closed', function() {
        console.log('Child window closed');
        childWindow = null;
    });
}

function createFloatWindow() {
    console.log('Creating Float window...');
    console.log('mainWindow:', mainWindow ? 'exists' : 'null');
    
    if (floatWindow && !floatWindow.isDestroyed()) {
        console.log('Float window already exists, focusing...');
        floatWindow.focus();
        return;
    }
    
    floatWindow = null;

    try {
        floatWindow = new BrowserWindow({
            width: 300,
            height: 200,
            parent: mainWindow,
            alwaysOnTop: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });

        console.log('Float window created, loading float.html...');
        floatWindow.loadFile(path.join(__dirname, 'float.html'));

        floatWindow.on('closed', function() {
            console.log('Float window closed');
            floatWindow = null;
        });
        
        floatWindow.webContents.on('did-finish-load', function() {
            console.log('Float window content loaded');
        });
        
        floatWindow.webContents.on('did-fail-load', function(event, errorCode, errorDescription) {
            console.error('Float window failed to load:', errorCode, errorDescription);
        });
    } catch (error) {
        console.error('Failed to create float window:', error);
    }
}

function createSnakeWindow() {
    console.log('Creating Snake Game window...');
    
    if (snakeWindow && !snakeWindow.isDestroyed()) {
        console.log('Snake window already exists, focusing...');
        snakeWindow.focus();
        return;
    }
    
    snakeWindow = null;

    try {
        snakeWindow = new BrowserWindow({
            width: 480,
            height: 600,
            parent: mainWindow,
            title: '贪食蛇游戏',
            resizable: false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });

        console.log('Snake window created, loading snake.html...');
        snakeWindow.loadFile(path.join(__dirname, 'snake.html'));

        snakeWindow.on('closed', function() {
            console.log('Snake window closed');
            snakeWindow = null;
        });
        
        snakeWindow.webContents.on('did-finish-load', function() {
            console.log('Snake window content loaded');
        });
        
        snakeWindow.webContents.on('did-fail-load', function(event, errorCode, errorDescription) {
            console.error('Snake window failed to load:', errorCode, errorDescription);
        });
    } catch (error) {
        console.error('Failed to create snake window:', error);
    }
}

//created by AI
// 摄像头测试窗口创建函数
function createCameraWindow() {
    console.log('Creating Camera window...');
    
    if (cameraWindow && !cameraWindow.isDestroyed()) {
        console.log('Camera window already exists, focusing...');
        cameraWindow.focus();
        return;
    }
    
    cameraWindow = null;

    try {
        cameraWindow = new BrowserWindow({
            width: 950,
            height: 750,
            parent: mainWindow,
            title: '摄像头调用测试',
            resizable: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });

        console.log('Camera window created, loading camera.html...');
        cameraWindow.loadFile(path.join(__dirname, 'camera.html'));

        cameraWindow.on('closed', function() {
            console.log('Camera window closed');
            cameraWindow = null;
        });
        
        cameraWindow.webContents.on('did-finish-load', function() {
            console.log('Camera window content loaded');
        });
        
        cameraWindow.webContents.on('did-fail-load', function(event, errorCode, errorDescription) {
            console.error('Camera window failed to load:', errorCode, errorDescription);
        });
    } catch (error) {
        console.error('Failed to create Camera window:', error);
    }
}
//created by AI//

//created by AI
// 图片尺寸调节窗口创建函数
function createImageResizerWindow() {
    console.log('Creating Image Resizer window...');
    
    if (imageResizerWindow && !imageResizerWindow.isDestroyed()) {
        console.log('Image Resizer window already exists, focusing...');
        imageResizerWindow.focus();
        return;
    }
    
    imageResizerWindow = null;

    try {
        imageResizerWindow = new BrowserWindow({
            width: 900,
            height: 750,
            parent: mainWindow,
            title: '图片尺寸调节工具',
            resizable: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });

        console.log('Image Resizer window created, loading image-resizer.html...');
        imageResizerWindow.loadFile(path.join(__dirname, 'image-resizer.html'));

        imageResizerWindow.on('closed', function() {
            console.log('Image Resizer window closed');
            imageResizerWindow = null;
        });
        
        imageResizerWindow.webContents.on('did-finish-load', function() {
            console.log('Image Resizer window content loaded');
        });
        
        imageResizerWindow.webContents.on('did-fail-load', function(event, errorCode, errorDescription) {
            console.error('Image Resizer window failed to load:', errorCode, errorDescription);
        });
    } catch (error) {
        console.error('Failed to create Image Resizer window:', error);
    }
}
//created by AI//

//created by AI
// 系统通知窗口创建函数
function createNotificationWindow() {
    console.log('Creating Notification window...');
    
    if (notificationWindow && !notificationWindow.isDestroyed()) {
        console.log('Notification window already exists, focusing...');
        notificationWindow.focus();
        return;
    }
    
    notificationWindow = null;

    try {
        notificationWindow = new BrowserWindow({
            width: 700,
            height: 600,
            parent: mainWindow,
            title: '系统通知工具',
            resizable: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });

        console.log('Notification window created, loading notification.html...');
        notificationWindow.loadFile(path.join(__dirname, 'notification.html'));

        notificationWindow.on('closed', function() {
            console.log('Notification window closed');
            notificationWindow = null;
        });
        
        notificationWindow.webContents.on('did-finish-load', function() {
            console.log('Notification window content loaded');
        });
        
        notificationWindow.webContents.on('did-fail-load', function(event, errorCode, errorDescription) {
            console.error('Notification window failed to load:', errorCode, errorDescription);
        });
    } catch (error) {
        console.error('Failed to create Notification window:', error);
    }
}
//created by AI//

//created by AI
// 屏幕录制窗口创建函数
function createScreenRecorderWindow() {
    console.log('Creating Screen Recorder window...');
    
    if (screenRecorderWindow && !screenRecorderWindow.isDestroyed()) {
        console.log('Screen Recorder window already exists, focusing...');
        screenRecorderWindow.focus();
        return;
    }
    
    screenRecorderWindow = null;

    try {
        screenRecorderWindow = new BrowserWindow({
            width: 850,
            height: 700,
            parent: mainWindow,
            title: '屏幕录制器',
            resizable: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });

        console.log('Screen Recorder window created, loading screen-recorder.html...');
        screenRecorderWindow.loadFile(path.join(__dirname, 'screen-recorder.html'));

        screenRecorderWindow.on('closed', function() {
            console.log('Screen Recorder window closed');
            screenRecorderWindow = null;
        });
        
        screenRecorderWindow.webContents.on('did-finish-load', function() {
            console.log('Screen Recorder window content loaded');
        });
        
        screenRecorderWindow.webContents.on('did-fail-load', function(event, errorCode, errorDescription) {
            console.error('Screen Recorder window failed to load:', errorCode, errorDescription);
        });
    } catch (error) {
        console.error('Failed to create Screen Recorder window:', error);
    }
}
//created by AI//

//created by AI
// 硬件信息窗口创建函数
function createDeviceInfoWindow() {
    console.log('Creating Device Info window...');
    
    if (deviceInfoWindow && !deviceInfoWindow.isDestroyed()) {
        console.log('Device Info window already exists, focusing...');
        deviceInfoWindow.focus();
        return;
    }
    
    deviceInfoWindow = null;

    try {
        deviceInfoWindow = new BrowserWindow({
            width: 800,
            height: 700,
            parent: mainWindow,
            title: '硬件信息',
            resizable: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });

        console.log('Device Info window created, loading device-info.html...');
        deviceInfoWindow.loadFile(path.join(__dirname, 'device-info.html'));

        deviceInfoWindow.on('closed', function() {
            console.log('Device Info window closed');
            deviceInfoWindow = null;
        });
        
        deviceInfoWindow.webContents.on('did-finish-load', function() {
            console.log('Device Info window content loaded');
        });
        
        deviceInfoWindow.webContents.on('did-fail-load', function(event, errorCode, errorDescription) {
            console.error('Device Info window failed to load:', errorCode, errorDescription);
        });
    } catch (error) {
        console.error('Failed to create Device Info window:', error);
    }
}
//created by AI//

function createMenu() {
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'New Window',
                    accelerator: 'CmdOrCtrl+N',
                    click: function() {
                        const newWindow = new BrowserWindow({
                            width: 1200,
                            height: 800,
                            webPreferences: {
                                nodeIntegration: true,
                                contextIsolation: false
                            }
                        });
                        newWindow.loadFile(path.join(__dirname, 'index.html'));
                    }
                },
                {
                    label: 'Open Child Window',
                    accelerator: 'CmdOrCtrl+Shift+N',
                    click: function() {
                        console.log('Open Child Window menu clicked');
                        createChildWindow();
                    }
                },
                {
                    type: 'separator'
                },
                {
                    label: 'About',
                    accelerator: 'CmdOrCtrl+I',
                    click: function() {
                        console.log('About menu clicked');
                        createAboutWindow();
                    }
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Quit',
                    accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                    click: function() {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
                { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
                { type: 'separator' },
                { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
                { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
                { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
                { label: 'Select All', accelerator: 'CmdOrCtrl+A', role: 'selectall' }
            ]
        },
        {
            label: 'View',
            submenu: [
                {
                    label: 'Reload',
                    accelerator: 'CmdOrCtrl+R',
                    click: function(item, focusedWindow) {
                        if (focusedWindow) {
                            focusedWindow.reload();
                        }
                    }
                },
                {
                    label: 'Toggle Developer Tools',
                    accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
                    click: function(item, focusedWindow) {
                        if (focusedWindow) {
                            focusedWindow.webContents.toggleDevTools();
                        }
                    }
                },
                { type: 'separator' },
                { label: 'Actual Size', accelerator: 'CmdOrCtrl+0', role: 'resetzoom' },
                { label: 'Zoom In', accelerator: 'CmdOrCtrl+Plus', role: 'zoomin' },
                { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', role: 'zoomout' },
                { type: 'separator' },
                { label: 'Toggle Full Screen', accelerator: process.platform === 'darwin' ? 'Ctrl+Command+F' : 'F11', role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Window',
            submenu: [
                { label: 'Minimize', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
                { label: 'Close', accelerator: 'CmdOrCtrl+W', role: 'close' }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'Learn More',
                    click: function() {
                        shell.openExternal('https://www.harmonyos.com');
                    }
                }
            ]
        }
    ];

    if (process.platform === 'darwin') {
        template.unshift({
            label: app.getName(),
            submenu: [
                { label: 'About ' + app.getName(), role: 'about' },
                { type: 'separator' },
                { label: 'Services', role: 'services', submenu: [] },
                { type: 'separator' },
                { label: 'Hide ' + app.getName(), accelerator: 'Command+H', role: 'hide' },
                { label: 'Hide Others', accelerator: 'Command+Shift+H', role: 'hideothers' },
                { label: 'Show All', role: 'unhide' },
                { type: 'separator' },
                { label: 'Quit', accelerator: 'Command+Q', click: function() { app.quit(); } }
            ]
        });
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

function createWindow() {
    tray = new Tray(nativeImage.createFromPath(path.join(__dirname, 'electron_white.png')));
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    mainWindow.setWindowButtonVisibility(true);
    
    console.log('Loading main page from:', path.join(__dirname, 'index.html'));
    mainWindow.loadFile(path.join(__dirname, 'index.html'));
    
    createMenu();
}

app.whenReady().then(createWindow);

ipcMain.on('open-child', function() {
    console.log('IPC: open-child received');
    if (!childWindow) {
        createChildWindow();
    }
});

ipcMain.on('open-float', function() {
    console.log('IPC: open-float received');
    console.log('mainWindow exists:', !!mainWindow);
    if (!mainWindow) {
        console.error('mainWindow is not created yet');
        return;
    }
    createFloatWindow();
});

ipcMain.on('open-snake', function() {
    console.log('IPC: open-snake received');
    console.log('mainWindow exists:', !!mainWindow);
    if (!mainWindow) {
        console.error('mainWindow is not created yet');
        return;
    }
    createSnakeWindow();
});

ipcMain.handle('get-app-info', function() {
    console.log('IPC: get-app-info received');
    return {
        name: app.getName(),
        version: app.getVersion()
    };
});

app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function() {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// 文件选择器功能
ipcMain.on('open-file-picker', function() {
    console.log('IPC: open-file-picker received');
    if (!mainWindow) {
        console.error('mainWindow is not created yet');
        return;
    }
    
    // 打开文件选择对话框
    dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [
            { name: 'All Files', extensions: ['*'] }
        ]
    }).then((result) => {
        if (!result.canceled && result.filePaths.length > 0) {
            const filePath = result.filePaths[0];
            console.log('Selected file:', filePath);
            
            // 发送文件路径给渲染进程
            if (mainWindow) {
                mainWindow.webContents.send('file-selected', filePath);
            }
        }
    }).catch((err) => {
        console.error('File picker error:', err);
    });
});

// 复制到剪贴板功能
ipcMain.on('copy-to-clipboard', function(event, text) {
    console.log('IPC: copy-to-clipboard received');
    clipboard.writeText(text);
    console.log('Text copied to clipboard:', text);
});

// 读取剪贴板功能
ipcMain.handle('read-clipboard', function() {
    console.log('IPC: read-clipboard received');
    const content = clipboard.readText();
    console.log('Clipboard content:', content);
    return content;
});

//created by AI
// 图片尺寸调节窗口IPC处理
ipcMain.on('open-image-resizer', function() {
    console.log('IPC: open-image-resizer received');
    console.log('mainWindow exists:', !!mainWindow);
    if (!mainWindow) {
        console.error('mainWindow is not created yet');
        return;
    }
    createImageResizerWindow();
});

// 打开图片文件选择对话框
ipcMain.handle('select-image-file', async function() {
    console.log('IPC: select-image-file received');
    
    const result = await dialog.showOpenDialog(mainWindow, {
        title: '选择图片文件',
        properties: ['openFile'],
        filters: [
            { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });
    
    return result;
});

// 保存调整后的图片
ipcMain.handle('save-resized-image', async function(event, options) {
    console.log('IPC: save-resized-image received');
    
    const result = await dialog.showSaveDialog(mainWindow, {
        title: '保存调整后的图片',
        defaultPath: options.defaultName,
        filters: [
            { name: 'PNG Image', extensions: ['png'] },
            { name: 'JPEG Image', extensions: ['jpg', 'jpeg'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });
    
    return result;
});

// 写入图片文件
ipcMain.handle('write-image-file', async function(event, options) {
    console.log('IPC: write-image-file received');
    console.log('File path:', options.filePath);
    
    try {
        // 将 base64 数据转换为 Buffer
        const base64Data = options.dataUrl.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        await fs.promises.writeFile(options.filePath, buffer);
        console.log('Image file saved successfully');
        return { success: true };
    } catch (error) {
        console.error('Failed to write image file:', error);
        return { success: false, error: error.message };
    }
});
//created by AI//

//created by AI
// 系统通知窗口IPC处理
ipcMain.on('open-notification', function() {
    console.log('IPC: open-notification received');
    console.log('mainWindow exists:', !!mainWindow);
    if (!mainWindow) {
        console.error('mainWindow is not created yet');
        return;
    }
    createNotificationWindow();
});

// 显示系统通知
ipcMain.handle('show-system-notification', async function(event, options) {
    console.log('IPC: show-system-notification received', options);
    try {
        const { Notification } = require('electron');
        
        // 检查是否支持通知
        if (!Notification.isSupported()) {
            console.error('Notifications are not supported on this system');
            return { success: false, error: '当前系统不支持通知功能' };
        }
        
        // 创建并显示通知
        const notification = new Notification({
            title: options.title || '系统通知',
            body: options.body || '',
            icon: path.join(__dirname, 'icon.png')
        });
        
        notification.show();
        console.log('Notification shown successfully');
        return { success: true };
    } catch (error) {
        console.error('Failed to show notification:', error);
        return { success: false, error: error.message };
    }
});
//created by AI//

//created by AI
// 屏幕录制窗口IPC处理
ipcMain.on('open-screen-recorder', function() {
    console.log('IPC: open-screen-recorder received');
    console.log('mainWindow exists:', !!mainWindow);
    if (!mainWindow) {
        console.error('mainWindow is not created yet');
        return;
    }
    createScreenRecorderWindow();
});

//created by AI
// 硬件信息窗口IPC处理
ipcMain.on('open-device-info', function() {
    console.log('IPC: open-device-info received');
    console.log('mainWindow exists:', !!mainWindow);
    if (!mainWindow) {
        console.error('mainWindow is not created yet');
        return;
    }
    createDeviceInfoWindow();
});

// 获取设备信息
ipcMain.handle('get-device-info', async function() {
    console.log('IPC: get-device-info received');
    try {
        // 获取基础系统信息
        const deviceInfo = {
            // 基础设备信息
            deviceModel: os.hostname() || '未知设备',
            deviceType: 'pc',
            osVersion: os.release() || '未知',
            manufacturer: 'Electron App',
            
            // 存储信息
            totalMemory: os.totalmem() || 0,
            freeMemory: os.freemem() || 0,
            diskInfo: '未知',
            
            // 系统信息
            platform: os.platform() || '未知',
            arch: os.arch() || '未知',
            cpuCount: os.cpus() ? os.cpus().length : 0,
            hostname: os.hostname() || '未知'
        };
        
        // 尝试获取硬盘信息
        try {
            const { execSync } = require('child_process');
            // 尝试使用 df 命令获取磁盘信息（Linux/Mac）
            try {
                const dfOutput = execSync('df -h /', { encoding: 'utf8', timeout: 5000 });
                const lines = dfOutput.trim().split('\n');
                if (lines.length > 1) {
                    const parts = lines[1].split(/\s+/);
                    if (parts.length >= 4) {
                        const total = parts[1];
                        const used = parts[2];
                        const available = parts[3];
                        deviceInfo.diskInfo = '总容量: ' + total + ', 已用: ' + used + ', 可用: ' + available;
                    }
                }
            } catch (dfError) {
                // 如果 df 命令失败，使用 Node.js 的 fs 模块获取
                try {
                    const homeDir = os.homedir();
                    deviceInfo.diskInfo = '主目录: ' + homeDir;
                } catch (fsError) {
                    deviceInfo.diskInfo = '无法获取硬盘信息';
                }
            }
        } catch (e) {
            console.log('Disk info check failed:', e.message);
            deviceInfo.diskInfo = '无法获取硬盘信息';
        }
        
        console.log('Device info collected:', deviceInfo);
        return { success: true, data: deviceInfo };
    } catch (error) {
        console.error('Failed to get device info:', error);
        return { success: false, error: error.message };
    }
});
//created by AI//

// 获取屏幕源
ipcMain.handle('get-sources', async function() {
    console.log('IPC: get-sources received');
    try {
        const { desktopCapturer } = require('electron');
        const sources = await desktopCapturer.getSources({
            types: ['screen', 'window'],
            thumbnailSize: { width: 320, height: 180 }
        });
        console.log('Screen sources found:', sources.length);
        
        const sourcesWithThumbnails = sources.map(source => {
            console.log('Source:', source.name, 'has thumbnail:', !!source.thumbnail);
            return {
                id: source.id,
                name: source.name,
                thumbnail: source.thumbnail ? source.thumbnail.toDataURL() : ''
            };
        });
        
        console.log('Sources with thumbnails:', sourcesWithThumbnails);
        return sourcesWithThumbnails;
    } catch (error) {
        console.error('Failed to get sources:', error);
        return [];
    }
});

// 保存视频文件对话框
ipcMain.handle('save-video', async function(event, options) {
    console.log('IPC: save-video received');
    
    const result = await dialog.showSaveDialog(mainWindow, {
        title: '保存录制视频',
        defaultPath: options.defaultName,
        filters: [
            { name: 'WebM Video', extensions: ['webm'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });
    
    return result;
});

// 写入视频文件
ipcMain.handle('write-video-file', async function(event, options) {
    console.log('IPC: write-video-file received');
    console.log('File path:', options.filePath);
    console.log('Buffer size:', options.buffer.byteLength);
    
    try {
        const buffer = Buffer.from(options.buffer);
        await fs.promises.writeFile(options.filePath, buffer);
        console.log('Video file saved successfully');
        return { success: true };
    } catch (error) {
        console.error('Failed to write video file:', error);
        return { success: false, error: error.message };
    }
});
//created by AI//

//created by AI
// IP地址获取功能实现

// 获取IP地址信息
async function getIPAddresses() {
    const platform = process.platform;
    console.log('获取IP地址，平台:', platform);

    try {
        const networkInterfaces = os.networkInterfaces();
        const ipAddresses = [];

        for (const [interfaceName, addresses] of Object.entries(networkInterfaces)) {
            if (!addresses) continue;

            for (const address of addresses) {
                if (address.internal || address.family !== 'IPv4') {
                    continue;
                }

                ipAddresses.push({
                    interface: interfaceName,
                    address: address.address,
                    netmask: address.netmask,
                    mac: address.mac || null
                });
            }
        }

        ipAddresses.sort((a, b) => {
            const priority = (name) => {
                const lower = name.toLowerCase();
                if (lower.includes('ethernet') || lower.includes('eth')) return 1;
                if (lower.includes('wifi') || lower.includes('wlan') || lower.includes('airport')) return 2;
                if (lower.includes('en0') || lower.includes('en1')) return 3;
                return 4;
            };
            return priority(a.interface) - priority(b.interface);
        });

        const hostname = os.hostname();

        let publicIP = null;
        try {
            const publicIPServices = [
                'https://api.ipify.org?format=json',
                'https://api.ip.sb/ip',
                'https://ifconfig.me/ip'
            ];

            for (const service of publicIPServices) {
                try {
                    const parsedUrl = new URL(service);
                    const client = parsedUrl.protocol === 'https:' ? https : http;

                    const result = await new Promise((resolve, reject) => {
                        const req = client.get(service, (res) => {
                            let data = '';
                            res.on('data', (chunk) => { data += chunk; });
                            res.on('end', () => {
                                try {
                                    const json = JSON.parse(data);
                                    resolve(json.ip || data.trim());
                                } catch (e) {
                                    resolve(data.trim());
                                }
                            });
                        });
                        req.on('error', reject);
                        req.setTimeout(3000, () => {
                            req.destroy();
                            reject(new Error('Timeout'));
                        });
                    });

                    if (result && /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(result)) {
                        publicIP = result;
                        break;
                    }
                } catch (e) {
                    console.log(`Failed to get public IP from ${service}:`, e.message);
                }
            }
        } catch (e) {
            console.log('Failed to get public IP:', e.message);
        }

        return {
            success: true,
            hostname: hostname,
            ipAddresses: ipAddresses,
            publicIP: publicIP,
            platform: platform
        };
    } catch (error) {
        console.error('获取IP地址失败:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// 创建IP地址窗口
function createIPWindow() {
    console.log('Creating IP Address window...');
    
    if (ipWindow && !ipWindow.isDestroyed()) {
        console.log('IP window already exists, focusing...');
        ipWindow.focus();
        return;
    }
    
    ipWindow = null;

    try {
        ipWindow = new BrowserWindow({
            width: 500,
            height: 450,
            parent: mainWindow,
            title: 'IP地址信息',
            resizable: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });

        console.log('IP window created, loading ip.html...');
        ipWindow.loadFile(path.join(__dirname, 'ip.html'));

        ipWindow.on('closed', function() {
            console.log('IP window closed');
            ipWindow = null;
        });
        
        ipWindow.webContents.on('did-finish-load', function() {
            console.log('IP window content loaded');
        });
        
        ipWindow.webContents.on('did-fail-load', function(event, errorCode, errorDescription) {
            console.error('IP window failed to load:', errorCode, errorDescription);
        });
    } catch (error) {
        console.error('Failed to create IP window:', error);
    }
}

// IP地址窗口IPC处理
ipcMain.on('open-ip-window', function() {
    console.log('IPC: open-ip-window received');
    console.log('mainWindow exists:', !!mainWindow);
    if (!mainWindow) {
        console.error('mainWindow is not created yet');
        return;
    }
    createIPWindow();
});

// 获取IP地址IPC处理
ipcMain.handle('get-ip-addresses', async function() {
    console.log('IPC: get-ip-addresses received');
    return await getIPAddresses();
});
//created by AI//

//created by AI
// 摄像头窗口IPC处理
ipcMain.on('open-camera', function() {
    console.log('IPC: open-camera received');
    console.log('mainWindow exists:', !!mainWindow);
    if (!mainWindow) {
        console.error('mainWindow is not created yet');
        return;
    }
    createCameraWindow();
});

// 保存摄像头媒体文件对话框
ipcMain.handle('save-camera-media', async function(event, options) {
    console.log('IPC: save-camera-media received');
    
    const filters = options.type === 'image' 
        ? [
            { name: 'PNG Image', extensions: ['png'] },
            { name: 'JPEG Image', extensions: ['jpg', 'jpeg'] },
            { name: 'All Files', extensions: ['*'] }
        ]
        : [
            { name: 'WebM Video', extensions: ['webm'] },
            { name: 'All Files', extensions: ['*'] }
        ];
    
    const result = await dialog.showSaveDialog(mainWindow, {
        title: options.type === 'image' ? '保存照片' : '保存视频',
        defaultPath: options.defaultName,
        filters: filters
    });
    
    return result;
});

// 写入摄像头媒体文件
ipcMain.handle('write-camera-file', async function(event, options) {
    console.log('IPC: write-camera-file received');
    console.log('File path:', options.filePath);
    console.log('Buffer size:', options.buffer.byteLength);
    
    try {
        const buffer = Buffer.from(options.buffer);
        await fs.promises.writeFile(options.filePath, buffer);
        console.log('Camera media file saved successfully');
        return { success: true };
    } catch (error) {
        console.error('Failed to write camera file:', error);
        return { success: false, error: error.message };
    }
});
//created by AI//

//created by AI
// 摄像头权限请求 - 使用 systemPreferences.requestSystemPermission
ipcMain.handle('request-camera-permission', async function() {
    console.log('IPC: request-camera-permission received');
    try {
        // 请求权限
        var result = await systemPreferences.requestSystemPermission('camera');
        console.log('Camera permission request result:', result, 'type:', typeof result);
        
        // result 可能是布尔值 true/false，也可能是字符串 'granted'/'denied' 等
        var granted = result === true || result === 'granted';
        
        return {
            granted: granted,
            status: result
        };
    } catch (error) {
        console.error('Failed to request camera permission:', error);
        return {
            granted: false,
            status: 'error',
            error: error.message
        };
    }
});

// 打开应用权限设置页面
ipcMain.handle('open-permission-settings', async function() {
    console.log('IPC: open-permission-settings received');
    try {
        systemPreferences.openApplicationInfoEntry();
        return true;
    } catch (error) {
        console.error('Failed to open permission settings:', error);
        return false;
    }
});
//created by AI//

//created by AI
// OCR识别窗口创建函数
function createOCRWindow() {
    console.log('Creating OCR window...');
    
    if (ocrWindow && !ocrWindow.isDestroyed()) {
        console.log('OCR window already exists, focusing...');
        ocrWindow.focus();
        return;
    }
    
    ocrWindow = null;

    try {
        ocrWindow = new BrowserWindow({
            width: 900,
            height: 800,
            parent: mainWindow,
            title: 'OCR文字识别',
            resizable: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                webSecurity: false
            }
        });

        console.log('OCR window created, loading ocr.html...');
        ocrWindow.loadFile(path.join(__dirname, 'ocr.html'));

        ocrWindow.on('closed', function() {
            console.log('OCR window closed');
            ocrWindow = null;
        });
        
        ocrWindow.webContents.on('did-finish-load', function() {
            console.log('OCR window content loaded');
        });
        
        ocrWindow.webContents.on('did-fail-load', function(event, errorCode, errorDescription) {
            console.error('OCR window failed to load:', errorCode, errorDescription);
        });
    } catch (error) {
        console.error('Failed to create OCR window:', error);
    }
}

// OCR窗口IPC处理
ipcMain.on('open-ocr', function() {
    console.log('IPC: open-ocr received');
    console.log('mainWindow exists:', !!mainWindow);
    if (!mainWindow) {
        console.error('mainWindow is not created yet');
        return;
    }
    createOCRWindow();
});

// 保存OCR识别结果
ipcMain.handle('save-ocr-result', async function(event, options) {
    console.log('IPC: save-ocr-result received');
    
    const result = await dialog.showSaveDialog(mainWindow, {
        title: '保存识别结果',
        defaultPath: options.defaultName,
        filters: [
            { name: 'Text Files', extensions: ['txt'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });
    
    if (!result.canceled && result.filePath) {
        try {
            await fs.promises.writeFile(result.filePath, options.content, 'utf-8');
            console.log('OCR result saved successfully');
            return { success: true };
        } catch (error) {
            console.error('Failed to save OCR result:', error);
            return { success: false, error: error.message };
        }
    }
    
    return result;
});
//created by AI//

//created by AI
// web文件下载窗口创建函数
function createWebDownloadWindow() {
    console.log('Creating Web Download window...');
    
    if (webDownloadWindow && !webDownloadWindow.isDestroyed()) {
        console.log('Web Download window already exists, focusing...');
        webDownloadWindow.focus();
        return;
    }
    
    webDownloadWindow = null;

    try {
        // 创建浏览器窗口，添加更多安全设置
        webDownloadWindow = new BrowserWindow({
            width: 1000,
            height: 800,
            parent: mainWindow,
            title: 'Web文件下载',
            resizable: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                webSecurity: false,
                allowRunningInsecureContent: true,
                webviewTag: true,
                sandbox: false
            }
        });

        // 获取session并配置安全选项
        const session = webDownloadWindow.webContents.session;
        
        // 禁用证书验证（针对某些HTTPS网站可能有用）
        session.setCertificateVerifyProc((request, callback) => {
            callback(0); // 0表示信任证书
        });

        // 配置网络请求
        session.webRequest.onHeadersReceived((details, callback) => {
            callback({
                responseHeaders: {
                    ...details.responseHeaders,
                    'Content-Security-Policy': ['*']
                }
            });
        });

        // 配置User-Agent
        webDownloadWindow.webContents.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        console.log('Web Download window created, loading CSRC website...');
        
        // 添加更多事件监听器用于调试
        webDownloadWindow.webContents.on('did-start-loading', () => {
            console.log('开始加载网页...');
        });

        webDownloadWindow.webContents.on('did-stop-loading', () => {
            console.log('网页停止加载');
        });

        webDownloadWindow.webContents.on('dom-ready', () => {
            console.log('DOM加载完成');
        });

        webDownloadWindow.webContents.on('did-frame-finish-load', (event, isMainFrame) => {
            if (isMainFrame) {
                console.log('主框架加载完成');
            }
        });

        webDownloadWindow.webContents.on('page-title-updated', (event, title) => {
            console.log('页面标题更新:', title);
        });

        webDownloadWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
            console.error('网页加载失败:', {
                errorCode: errorCode,
                errorDescription: errorDescription,
                validatedURL: validatedURL,
                isMainFrame: isMainFrame
            });
            
            // 显示错误信息给用户
            dialog.showMessageBox(webDownloadWindow, {
                type: 'error',
                title: '网页加载失败',
                message: `无法加载网页: ${errorDescription}\n错误代码: ${errorCode}`
            });
        });

        webDownloadWindow.webContents.on('did-finish-load', () => {
            console.log('网页完全加载完成');
            
            // 尝试执行一些JavaScript来确保页面正常显示
            webDownloadWindow.webContents.executeJavaScript(`
                console.log('页面加载完成，当前URL:', window.location.href);
                console.log('页面标题:', document.title);
                console.log('页面内容长度:', document.body.innerHTML.length);
            `).then((result) => {
                console.log('JavaScript执行结果:', result);
            }).catch((error) => {
                console.error('JavaScript执行错误:', error);
            });
        });

        // 加载本地HTML文件，该文件会加载外部网页
        console.log('Loading web-download.html...');
        webDownloadWindow.loadFile(path.join(__dirname, 'web-download.html'));

        // 处理下载事件
        session.on('will-download', (event, item, webContents) => {
            console.log('准备下载文件:', {
                url: item.getURL(),
                filename: item.getFilename(),
                size: item.getTotalBytes()
            });
            
            // 弹出保存对话框让用户选择路径
            dialog.showSaveDialog(webDownloadWindow, {
                title: '保存文件',
                defaultPath: item.getFilename(),
                filters: [
                    { name: 'PDF Files', extensions: ['pdf'] },
                    { name: 'All Files', extensions: ['*'] }
                ]
            }).then((result) => {
                if (!result.canceled && result.filePath) {
                    console.log('用户选择的保存路径:', result.filePath);
                    // 设置下载路径
                    item.setSavePath(result.filePath);
                    
                    // 监听下载进度
                    item.on('updated', (e, state) => {
                        if (state === 'progressing') {
                            console.log('下载进度:', Math.round((item.getReceivedBytes() / item.getTotalBytes()) * 100) + '%');
                        }
                    });
                    
                    // 监听下载完成
                    item.on('done', (e, state) => {
                        if (state === 'completed') {
                            console.log('下载完成:', result.filePath);
                            dialog.showMessageBox(webDownloadWindow, {
                                type: 'info',
                                title: '下载完成',
                                message: `文件已成功下载到：${result.filePath}`
                            });
                        } else {
                            console.error('下载失败:', state);
                            dialog.showMessageBox(webDownloadWindow, {
                                type: 'error',
                                title: '下载失败',
                                message: `文件下载失败：${state}`
                            });
                        }
                    });
                } else {
                    console.log('用户取消了下载');
                }
            }).catch((err) => {
                console.error('保存对话框错误:', err);
            });
        });

        // 打开开发者工具以便调试
        webDownloadWindow.webContents.openDevTools();

        webDownloadWindow.on('closed', function() {
            console.log('Web Download window closed');
            webDownloadWindow = null;
        });
    } catch (error) {
        console.error('创建Web下载窗口失败:', error);
        dialog.showMessageBox(mainWindow, {
            type: 'error',
            title: '窗口创建失败',
            message: `无法创建下载窗口: ${error.message}`
        });
    }
}

// web文件下载窗口IPC处理
ipcMain.on('open-web-download', function() {
    console.log('IPC: open-web-download received');
    console.log('mainWindow exists:', !!mainWindow);
    if (!mainWindow) {
        console.error('mainWindow is not created yet');
        return;
    }
    createWebDownloadWindow();
});

// 处理文件下载请求
ipcMain.on('download-file', async function(event, options) {
    console.log('IPC: download-file received', options);
    
    try {
        // 弹出保存对话框
        const result = await dialog.showSaveDialog(webDownloadWindow, {
            title: '保存文件',
            defaultPath: options.filename || 'download',
            filters: [
                { name: 'PDF Files', extensions: ['pdf'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        });
        
        if (!result.canceled && result.filePath) {
            console.log('用户选择保存路径:', result.filePath);
            
            // 下载文件
            const fileUrl = options.url;
            const filePath = result.filePath;
            
            // 使用http/https模块下载文件
            const protocol = fileUrl.startsWith('https') ? https : http;
            
            const file = fs.createWriteStream(filePath);
            
            protocol.get(fileUrl, (response) => {
                // 处理重定向
                if (response.statusCode === 301 || response.statusCode === 302) {
                    const redirectUrl = response.headers.location;
                    console.log('重定向到:', redirectUrl);
                    protocol.get(redirectUrl, (redirectResponse) => {
                        redirectResponse.pipe(file);
                        file.on('finish', () => {
                            file.close();
                            console.log('文件下载完成:', filePath);
                            event.reply('download-complete', { 
                                success: true, 
                                filePath: filePath 
                            });
                        });
                    }).on('error', (err) => {
                        console.error('下载失败:', err);
                        event.reply('download-complete', { 
                            success: false, 
                            error: err.message 
                        });
                    });
                } else {
                    response.pipe(file);
                    file.on('finish', () => {
                        file.close();
                        console.log('文件下载完成:', filePath);
                        event.reply('download-complete', { 
                            success: true, 
                            filePath: filePath 
                        });
                    });
                }
            }).on('error', (err) => {
                console.error('下载失败:', err);
                event.reply('download-complete', { 
                    success: false, 
                    error: err.message 
                });
            });
        } else {
            console.log('用户取消了下载');
        }
    } catch (error) {
        console.error('下载处理失败:', error);
        event.reply('download-complete', { 
            success: false, 
            error: error.message 
        });
    }
});
//created by AI//

//created by AI
// 文件预览窗口创建函数
function createFilePreviewWindow() {
    console.log('Creating File Preview window...');
    
    if (filePreviewWindow && !filePreviewWindow.isDestroyed()) {
        console.log('File Preview window already exists, focusing...');
        filePreviewWindow.focus();
        return;
    }
    
    filePreviewWindow = null;

    try {
        filePreviewWindow = new BrowserWindow({
            width: 900,
            height: 700,
            parent: mainWindow,
            title: '文件上传预览',
            resizable: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                webSecurity: false
            }
        });

        console.log('File Preview window created, loading file-preview.html...');
        filePreviewWindow.loadFile(path.join(__dirname, 'file-preview.html'));

        filePreviewWindow.on('closed', function() {
            console.log('File Preview window closed');
            filePreviewWindow = null;
        });
        
        filePreviewWindow.webContents.on('did-finish-load', function() {
            console.log('File Preview window content loaded');
        });
        
        filePreviewWindow.webContents.on('did-fail-load', function(event, errorCode, errorDescription) {
            console.error('File Preview window failed to load:', errorCode, errorDescription);
        });
    } catch (error) {
        console.error('Failed to create File Preview window:', error);
    }
}

// 文件预览窗口IPC处理
ipcMain.on('open-upload-file', function() {
    console.log('IPC: open-upload-file received');
    console.log('mainWindow exists:', !!mainWindow);
    if (!mainWindow) {
        console.error('mainWindow is not created yet');
        return;
    }
    createFilePreviewWindow();
});

// 选择文件对话框
ipcMain.handle('select-preview-file', async function(event) {
    console.log('IPC: select-preview-file received');
    
    const result = await dialog.showOpenDialog(mainWindow, {
        title: '选择要预览的文件',
        properties: ['openFile'],
        filters: [
            { name: 'Text Files', extensions: ['txt'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });
    
    if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
        return { canceled: true };
    }
    
    const filePath = result.filePaths[0];
    const fileName = path.basename(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    
    console.log('选择的文件:', filePath, '大小:', sizeKB, 'KB');
    
    try {
        if (ext === '.txt') {
            // 读取TXT文件内容
            const content = fs.readFileSync(filePath, 'utf-8');
            
            return {
                canceled: false,
                fileName: fileName,
                filePath: filePath,
                fileType: 'txt',
                fileSize: sizeKB,
                content: content
            };
        } else {
            return {
                canceled: true,
                error: '不支持的文件格式，请选择 TXT 文件'
            };
        }
    } catch (error) {
        console.error('读取文件失败:', error);
        return {
            canceled: true,
            error: error.message
        };
    }
});
//created by AI//

//created by AI
// 打印预览窗口创建函数
function createPrintPreviewWindow() {
    console.log('Creating Print Preview window...');
    
    if (printPreviewWindow && !printPreviewWindow.isDestroyed()) {
        console.log('Print Preview window already exists, focusing...');
        printPreviewWindow.focus();
        return;
    }
    
    printPreviewWindow = null;

    try {
        printPreviewWindow = new BrowserWindow({
            width: 1100,
            height: 800,
            parent: mainWindow,
            title: '打印预览',
            resizable: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                webSecurity: false
            }
        });

        console.log('Print Preview window created, loading print-preview.html...');
        printPreviewWindow.loadFile(path.join(__dirname, 'print-preview.html'));

        printPreviewWindow.on('closed', function() {
            console.log('Print Preview window closed');
            printPreviewWindow = null;
        });
        
        printPreviewWindow.webContents.on('did-finish-load', function() {
            console.log('Print Preview window content loaded');
        });
        
        printPreviewWindow.webContents.on('did-fail-load', function(event, errorCode, errorDescription) {
            console.error('Print Preview window failed to load:', errorCode, errorDescription);
        });
    } catch (error) {
        console.error('Failed to create Print Preview window:', error);
    }
}

//created by AI
// 图片编辑窗口创建函数
function createImageEditorWindow() {
    console.log('Creating Image Editor window...');
    
    if (imageEditorWindow && !imageEditorWindow.isDestroyed()) {
        console.log('Image Editor window already exists, focusing...');
        imageEditorWindow.focus();
        return;
    }
    
    imageEditorWindow = null;

    try {
        imageEditorWindow = new BrowserWindow({
            width: 1000,
            height: 800,
            parent: mainWindow,
            title: '图片编辑',
            resizable: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });

        console.log('Image Editor window created, loading image-editor.html...');
        imageEditorWindow.loadFile(path.join(__dirname, 'image-editor.html'));

        imageEditorWindow.on('closed', function() {
            console.log('Image Editor window closed');
            imageEditorWindow = null;
        });
        
        imageEditorWindow.webContents.on('did-finish-load', function() {
            console.log('Image Editor window content loaded');
        });
        
        imageEditorWindow.webContents.on('did-fail-load', function(event, errorCode, errorDescription) {
            console.error('Image Editor window failed to load:', errorCode, errorDescription);
        });
    } catch (error) {
        console.error('Failed to create Image Editor window:', error);
    }
}
//created by AI//

//created by AI
// lodash三方库调用窗口创建函数
function createLodashWindow() {
    console.log('Creating Lodash window...');
    
    if (lodashWindow && !lodashWindow.isDestroyed()) {
        console.log('Lodash window already exists, focusing...');
        lodashWindow.focus();
        return;
    }
    
    lodashWindow = null;

    try {
        lodashWindow = new BrowserWindow({
            width: 800,
            height: 600,
            parent: mainWindow,
            title: 'lodash三方库演示',
            resizable: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });

        console.log('Lodash window created, loading lodash.html...');
        lodashWindow.loadFile(path.join(__dirname, 'lodash.html'));

        lodashWindow.on('closed', function() {
            console.log('Lodash window closed');
            lodashWindow = null;
        });
        
        lodashWindow.webContents.on('did-finish-load', function() {
            console.log('Lodash window content loaded');
        });
        
        lodashWindow.webContents.on('did-fail-load', function(event, errorCode, errorDescription) {
            console.error('Lodash window failed to load:', errorCode, errorDescription);
        });
    } catch (error) {
        console.error('Failed to create Lodash window:', error);
    }
}
//created by AI//

//created by AI
// axios三方库调用窗口创建函数
function createAxiosWindow() {
    console.log('Creating Axios window...');
    
    if (axiosWindow && !axiosWindow.isDestroyed()) {
        console.log('Axios window already exists, focusing...');
        axiosWindow.focus();
        return;
    }
    
    axiosWindow = null;

    try {
        axiosWindow = new BrowserWindow({
            width: 900,
            height: 700,
            parent: mainWindow,
            title: 'axios三方库演示',
            resizable: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });

        console.log('Axios window created, loading axios.html...');
        axiosWindow.loadFile(path.join(__dirname, 'axios.html'));

        axiosWindow.on('closed', function() {
            console.log('Axios window closed');
            axiosWindow = null;
        });
        
        axiosWindow.webContents.on('did-finish-load', function() {
            console.log('Axios window content loaded');
        });
        
        axiosWindow.webContents.on('did-fail-load', function(event, errorCode, errorDescription) {
            console.error('Axios window failed to load:', errorCode, errorDescription);
        });
    } catch (error) {
        console.error('Failed to create Axios window:', error);
    }
}

// moment三方库调用窗口创建函数
function createMomentWindow() {
    console.log('Creating Moment window...');
    
    if (momentWindow && !momentWindow.isDestroyed()) {
        console.log('Moment window already exists, focusing...');
        momentWindow.focus();
        return;
    }
    
    momentWindow = null;

    try {
        momentWindow = new BrowserWindow({
            width: 800,
            height: 700,
            parent: mainWindow,
            title: 'moment三方库演示',
            resizable: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });

        console.log('Moment window created, loading moment.html...');
        momentWindow.loadFile(path.join(__dirname, 'moment.html'));

        momentWindow.on('closed', function() {
            console.log('Moment window closed');
            momentWindow = null;
        });
        
        momentWindow.webContents.on('did-finish-load', function() {
            console.log('Moment window content loaded');
        });
        
        momentWindow.webContents.on('did-fail-load', function(event, errorCode, errorDescription) {
            console.error('Moment window failed to load:', errorCode, errorDescription);
        });
    } catch (error) {
        console.error('Failed to create Moment window:', error);
    }
}

//created by AI
// express三方库调用窗口创建函数
function createExpressWindow() {
    console.log('Creating Express window...');
    
    if (expressWindow && !expressWindow.isDestroyed()) {
        console.log('Express window already exists, focusing...');
        expressWindow.focus();
        return;
    }
    
    expressWindow = null;

    try {
        expressWindow = new BrowserWindow({
            width: 1000,
            height: 800,
            parent: mainWindow,
            title: 'express三方库演示',
            resizable: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });

        console.log('Express window created, loading express.html...');
        expressWindow.loadFile(path.join(__dirname, 'express.html'));

        expressWindow.on('closed', function() {
            console.log('Express window closed');
            expressWindow = null;
        });
        
        expressWindow.webContents.on('did-finish-load', function() {
            console.log('Express window content loaded');
        });
        
        expressWindow.webContents.on('did-fail-load', function(event, errorCode, errorDescription) {
            console.error('Express window failed to load:', errorCode, errorDescription);
        });
    } catch (error) {
        console.error('Failed to create Express window:', error);
    }
}
//created by AI//

//created by AI
// formidable三方库调用窗口创建函数
function createFormidableWindow() {
    console.log('Creating Formidable window...');
    
    if (formidableWindow && !formidableWindow.isDestroyed()) {
        console.log('Formidable window already exists, focusing...');
        formidableWindow.focus();
        return;
    }
    
    formidableWindow = null;

    try {
        formidableWindow = new BrowserWindow({
            width: 1000,
            height: 800,
            parent: mainWindow,
            title: 'formidable三方库演示 - 表单文件上传',
            resizable: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });

        console.log('Formidable window created, loading formidable.html...');
        formidableWindow.loadFile(path.join(__dirname, 'formidable.html'));

        formidableWindow.on('closed', function() {
            console.log('Formidable window closed');
            formidableWindow = null;
        });
        
        formidableWindow.webContents.on('did-finish-load', function() {
            console.log('Formidable window content loaded');
        });
        
        formidableWindow.webContents.on('did-fail-load', function(event, errorCode, errorDescription) {
            console.error('Formidable window failed to load:', errorCode, errorDescription);
        });
    } catch (error) {
        console.error('Failed to create Formidable window:', error);
    }
}
//created by AI//

// 打印预览窗口IPC处理
ipcMain.on('open-print-preview', function() {
    console.log('IPC: open-print-preview received');
    console.log('mainWindow exists:', !!mainWindow);
    if (!mainWindow) {
        console.error('mainWindow is not created yet');
        return;
    }
    createPrintPreviewWindow();
});

//created by AI
// 图片编辑窗口IPC处理
ipcMain.on('open-image-editor', function() {
    console.log('IPC: open-image-editor received');
    console.log('mainWindow exists:', !!mainWindow);
    if (!mainWindow) {
        console.error('mainWindow is not created yet');
        return;
    }
    createImageEditorWindow();
});
//created by AI//

//created by AI
// lodash三方库调用窗口IPC处理
ipcMain.on('open-lodash', function() {
    console.log('IPC: open-lodash received');
    console.log('mainWindow exists:', !!mainWindow);
    if (!mainWindow) {
        console.error('mainWindow is not created yet');
        return;
    }
    createLodashWindow();
});
//created by AI//

//created by AI
// axios三方库调用窗口IPC处理
ipcMain.on('open-axios', function() {
    console.log('IPC: open-axios received');
    console.log('mainWindow exists:', !!mainWindow);
    if (!mainWindow) {
        console.error('mainWindow is not created yet');
        return;
    }
    createAxiosWindow();
});

// moment三方库调用窗口IPC处理
ipcMain.on('open-moment', function() {
    console.log('IPC: open-moment received');
    console.log('mainWindow exists:', !!mainWindow);
    if (!mainWindow) {
        console.error('mainWindow is not created yet');
        return;
    }
    createMomentWindow();
});

//created by AI
// express三方库调用窗口IPC处理
ipcMain.on('open-express', function() {
    console.log('IPC: open-express received');
    console.log('mainWindow exists:', !!mainWindow);
    if (!mainWindow) {
        console.error('mainWindow is not created yet');
        return;
    }
    createExpressWindow();
});
//created by AI//

//created by AI
// formidable三方库调用窗口IPC处理
ipcMain.on('open-formidable', function() {
    console.log('IPC: open-formidable received');
    console.log('mainWindow exists:', !!mainWindow);
    if (!mainWindow) {
        console.error('mainWindow is not created yet');
        return;
    }
    createFormidableWindow();
});

// 选择上传文件对话框
ipcMain.handle('select-upload-file', async function(event, options) {
    console.log('IPC: select-upload-file received');
    
    const filters = options && options.type === 'image' 
        ? [
            { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'] },
            { name: 'All Files', extensions: ['*'] }
        ]
        : [
            { name: 'All Files', extensions: ['*'] }
        ];
    
    const result = await dialog.showOpenDialog(mainWindow, {
        title: '选择要上传的文件',
        properties: ['openFile'],
        filters: filters
    });
    
    return result;
});

// 读取文件内容
ipcMain.handle('read-upload-file', async function(event, filePath) {
    console.log('IPC: read-upload-file received');
    console.log('File path:', filePath);
    
    try {
        const stats = fs.statSync(filePath);
        const fileName = path.basename(filePath);
        const ext = path.extname(filePath).toLowerCase();
        const sizeKB = (stats.size / 1024).toFixed(2);
        
        // 读取文件为 base64
        const fileBuffer = fs.readFileSync(filePath);
        const base64Data = fileBuffer.toString('base64');
        
        return {
            success: true,
            fileName: fileName,
            filePath: filePath,
            ext: ext,
            size: sizeKB,
            sizeBytes: stats.size,
            base64Data: base64Data
        };
    } catch (error) {
        console.error('Failed to read file:', error);
        return {
            success: false,
            error: error.message
        };
    }
});

// 保存上传的文件
ipcMain.handle('save-uploaded-file', async function(event, options) {
    console.log('IPC: save-uploaded-file received');
    
    const result = await dialog.showSaveDialog(mainWindow, {
        title: '保存文件',
        defaultPath: options.defaultName,
        filters: [
            { name: 'All Files', extensions: ['*'] }
        ]
    });
    
    if (!result.canceled && result.filePath) {
        try {
            const buffer = Buffer.from(options.base64Data, 'base64');
            await fs.promises.writeFile(result.filePath, buffer);
            console.log('File saved successfully:', result.filePath);
            return { success: true, filePath: result.filePath };
        } catch (error) {
            console.error('Failed to save file:', error);
            return { success: false, error: error.message };
        }
    }
    
    return { canceled: true };
});
//created by AI//

// 选择打印文件对话框
ipcMain.handle('select-print-file', async function(event) {
    console.log('IPC: select-print-file received');
    
    const result = await dialog.showOpenDialog(mainWindow, {
        title: '选择要打印的文件',
        properties: ['openFile'],
        filters: [
            { name: 'Text Files', extensions: ['txt'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });
    
    if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
        return { canceled: true };
    }
    
    const filePath = result.filePaths[0];
    const fileName = path.basename(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    
    console.log('选择的打印文件:', filePath, '大小:', sizeKB, 'KB');
    
    try {
        if (ext === '.txt') {
            const content = fs.readFileSync(filePath, 'utf-8');
            
            return {
                canceled: false,
                fileName: fileName,
                filePath: filePath,
                fileType: 'txt',
                fileSize: sizeKB,
                content: content
            };
        } else {
            return {
                canceled: true,
                error: '不支持的文件格式，请选择 TXT 文件'
            };
        }
    } catch (error) {
        console.error('读取打印文件失败:', error);
        return {
            canceled: true,
            error: error.message
        };
    }
});

// 打印文档IPC处理
ipcMain.on('print-document', function(event) {
    console.log('IPC: print-document received');
    
    const window = BrowserWindow.fromWebContents(event.sender);
    if (!window) {
        console.error('无法获取窗口对象');
        return;
    }
    
    console.log('准备调用打印 API');
    
    try {
        // 优先使用浏览器原生打印
        window.webContents.executeJavaScript('window.print()').then(() => {
            console.log('打印对话框已打开');
        }).catch(err => {
            console.error('浏览器打印失败:', err);
            
            // 降级到Electron打印API
            if (window.webContents && typeof window.webContents.print === 'function') {
                window.webContents.print({
                    silent: false,
                    printBackground: true,
                    deviceName: ''
                }, (success, failureReason) => {
                    if (success) {
                        console.log('打印成功');
                    } else {
                        console.error('打印失败:', failureReason);
                    }
                });
            }
        });
    } catch (error) {
        console.error('打印过程中发生错误:', error);
    }
});
//created by AI//

// 每日早报窗口创建函数
function createZaobaoWindow() {
    console.log('Creating Zaobao window...');
    
    if (zaobaoWindow && !zaobaoWindow.isDestroyed()) {
        console.log('Zaobao window already exists, focusing...');
        zaobaoWindow.focus();
        return;
    }
    
    zaobaoWindow = null;

    try {
        zaobaoWindow = new BrowserWindow({
            width: 900,
            height: 800,
            parent: mainWindow,
            title: '每日早报',
            resizable: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });

        console.log('Zaobao window created, loading zaobao.html...');
        zaobaoWindow.loadFile(path.join(__dirname, 'zaobao.html'));

        zaobaoWindow.on('closed', function() {
            console.log('Zaobao window closed');
            zaobaoWindow = null;
        });
        
        zaobaoWindow.webContents.on('did-finish-load', function() {
            console.log('Zaobao window content loaded');
        });
        
        zaobaoWindow.webContents.on('did-fail-load', function(event, errorCode, errorDescription) {
            console.error('Zaobao window failed to load:', errorCode, errorDescription);
        });
    } catch (error) {
        console.error('Failed to create Zaobao window:', error);
    }
}

// 每日早报窗口IPC处理
ipcMain.on('open-zaobao', function() {
    console.log('IPC: open-zaobao received');
    console.log('mainWindow exists:', !!mainWindow);
    if (!mainWindow) {
        console.error('mainWindow is not created yet');
        return;
    }
    createZaobaoWindow();
});

// 获取早报数据
async function fetchZaobaoData() {
    console.log('Fetching zaobao data from real API...');
    try {
        // 使用真实的网络API调用
        return await new Promise((resolve, reject) => {
            const https = require('https');
            const postData = JSON.stringify({
                token: 'ycd0krwbhl5v2w6iafblj94y5vzqdj',
                format: 'json'
            });

            const options = {
                hostname: 'v3.alapi.cn',
                port: 443,
                path: '/api/zaobao',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                },
                // 忽略 SSL 证书验证（仅用于开发环境）
                rejectUnauthorized: false
            };

            const req = https.request(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        const result = JSON.parse(data);
                        console.log('Zaobao data fetched successfully from API:', result);
                        resolve(result);
                    } catch (e) {
                        console.error('Failed to parse API response:', e);
                        reject(new Error('解析API响应失败'));
                    }
                });
            });

            req.on('error', (e) => {
                console.error('API request failed:', e);
                reject(new Error('API请求失败: ' + e.message));
            });

            req.write(postData);
            req.end();
        });
    } catch (error) {
        console.error('Failed to fetch zaobao data:', error);
        return {
            code: 500,
            msg: '获取数据失败',
            error: error.message
        };
    }
}

// 获取早报数据IPC处理
ipcMain.handle('fetch-zaobao', async function() {
    console.log('IPC: fetch-zaobao received');
    return await fetchZaobaoData();
});
//created by AI//