const { app, BrowserWindow, Tray, nativeImage, Menu, shell, ipcMain, dialog, clipboard } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let tray;
let aboutWindow = null;
let childWindow = null;
let floatWindow = null;
let snakeWindow = null;
let screenRecorderWindow = null;

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