/**
 * HarmonyOS Electron 系统信息查看器 - 主进程
 *
 * 功能:
 * - 创建应用窗口
 * - 收集系统信息
 * - 处理 IPC 通信
 * - 打印服务
 * - 自定义菜单栏
 * - 帮助窗口
 */

const { app, BrowserWindow, ipcMain, screen, dialog, Menu } = require('electron');
const path = require('path');
const os = require('os');
const fs = require('fs').promises;

let mainWindow;
let helpWindow;
let calendarWindow;

/**
 * 检查是否在开发模式运行
 * 参考: docs/开发模式检测实现.md
 * @returns {boolean} 是否为开发模式
 */
function isDevelopment() {
    // 方法1: 检查 NODE_ENV 环境变量
    if (process.env.NODE_ENV === 'development') {
        return true;
    }
    // 方法2: 检查 app.isPackaged (Electron 内置方法)
    if (!app.isPackaged) {
        return true;
    }
    // 方法3: 检查是否在调试模式
    if (process.defaultApp || /[\\/]electron/.test(process.execPath)) {
        return true;
    }
    // 方法4: 检查命令行参数
    if (process.argv.includes('--dev') || process.argv.includes('--debug')) {
        return true;
    }
    return false;
}

/**
 * 获取应用模式信息
 * @returns {Object} 模式信息对象
 */
function getAppModeInfo() {
    return {
        isDevelopment: isDevelopment(),
        isProduction: !isDevelopment(),
        isPackaged: app.isPackaged,
        nodeEnv: process.env.NODE_ENV || 'undefined',
        electronVersion: process.versions.electron,
        platform: process.platform,
        arch: process.arch
    };
}

/**
 * 创建应用窗口
 */
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    // mainWindow.setWindowButtonVisibility(true);

    // Load the system info page
    const indexPath = path.join(__dirname, 'system-info.html');
    mainWindow.loadFile(indexPath);


    // 创建菜单
    createMenu();
}

/**
 * 创建帮助窗口
 */
function createHelpWindow() {
    // 如果帮助窗口已存在，则聚焦它
    if (helpWindow) {
        helpWindow.focus();
        return;
    }

    helpWindow = new BrowserWindow({
        width: 900,
        height: 700,
        title: '帮助 - 系统信息查看器',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        parent: mainWindow ? mainWindow : null,
        modal: false
    });

    const helpPath = path.join(__dirname, 'help.html');
    helpWindow.loadFile(helpPath);

    helpWindow.on('closed', () => {
        helpWindow = null;
    });

}

  /**
   * 创建日历窗口
   */
  function createCalendarWindow() {
      // 如果日历窗口已存在，则聚焦它
      if (calendarWindow) {
          calendarWindow.focus();
          return;
      }

      calendarWindow = new BrowserWindow({
          width: 1000,
          height: 800,
          title: '日历 - 系统信息查看器',
          webPreferences: {
              nodeIntegration: true,
              contextIsolation: false
          },
          parent: mainWindow ? mainWindow : null,
          modal: false
      });

      const calendarPath = path.join(__dirname, 'calendar.html');
      calendarWindow.loadFile(calendarPath);

      calendarWindow.on('closed', () => {
          calendarWindow = null;
      });
  }


/**
 * 创建应用菜单
 */
function createMenu() {
    const template = [
        {
            label: '文件',
            submenu: [
                {
                    label: '刷新系统信息',
                    accelerator: 'CmdOrCtrl+R',
                    click: () => {
                        if (mainWindow) {
                            mainWindow.webContents.send('refresh-system-info');
                        }
                    }
                },
                { type: 'separator' },
                {
                    label: '导出报告',
                    accelerator: 'CmdOrCtrl+E',
                    click: () => {
                        if (mainWindow) {
                            mainWindow.webContents.send('export-system-info');
                        }
                    }
                },
                { type: 'separator' },
                {
                    label: '打印',
                    accelerator: 'CmdOrCtrl+P',
                    click: () => {
                        if (mainWindow) {
                            mainWindow.webContents.print();
                        }
                    }
                },
                { type: 'separator' },
                {
                    label: '退出',
                    accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: '编辑',
            submenu: [
                { label: '撤销', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
                { label: '重做', accelerator: 'CmdOrCtrl+Y', role: 'redo' },
                { type: 'separator' },
                { label: '剪切', accelerator: 'CmdOrCtrl+X', role: 'cut' },
                { label: '复制', accelerator: 'CmdOrCtrl+C', role: 'copy' },
                { label: '粘贴', accelerator: 'CmdOrCtrl+V', role: 'paste' },
                { type: 'separator' },
                { label: '全选', accelerator: 'CmdOrCtrl+A', role: 'selectall' }
            ]
        },
        {
            label: '查看',
            submenu: [
                {
                    label: '刷新页面',
                    accelerator: 'CmdOrCtrl+Shift+R',
                    click: () => {
                        if (mainWindow) {
                            mainWindow.reload();
                        }
                    }
                },
                {
                    label: '开发者工具',
                    accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
                    click: () => {
                        if (mainWindow) {
                            mainWindow.webContents.toggleDevTools();
                        }
                    }
                },
                { type: 'separator' },
                {
                    label: '实际大小',
                    accelerator: 'CmdOrCtrl+0',
                    click: (menuItem, browserWindow) => {
                        if (browserWindow) {
                            browserWindow.webContents.setZoomLevel(0);
                        }
                    }
                },
                {
                    label: '放大',
                    accelerator: 'CmdOrCtrl+Plus',
                    click: (menuItem, browserWindow) => {
                        if (browserWindow) {
                            browserWindow.webContents.getZoomLevel((level) => {
                                browserWindow.webContents.setZoomLevel(level + 0.5);
                            });
                        }
                    }
                },
                {
                    label: '缩小',
                    accelerator: 'CmdOrCtrl+-',
                    click: (menuItem, browserWindow) => {
                        if (browserWindow) {
                            browserWindow.webContents.getZoomLevel((level) => {
                                browserWindow.webContents.setZoomLevel(level - 0.5);
                            });
                        }
                    }
                }
            ]
        },
        {
            label: '帮助',
            submenu: [
                {
                    label: '使用帮助',
                    accelerator: 'F1',
                    click: () => {
                        createHelpWindow();
                    }
                },
                {
                    label: '关于',
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: '关于系统信息查看器',
                            message: '系统信息查看器 v1.0.0',
                            detail: '基于 Electron for HarmonyOS PC 的系统信息查看工具\n\n本应用展示了 Electron 在鸿蒙 PC 平台上的核心功能：\n• 系统信息采集\n• 多窗口管理\n• 菜单栏定制\n• IPC 通信\n• 打印和导出功能\n\n技术栈：\n• Electron 34.0.0\n• HarmonyOS PC\n• Node.js\n• Chromium',
                            buttons: ['确定']
                        });
                    }
                }
            ]
        }
    ];

    // macOS 特有菜单
    if (process.platform === 'darwin') {
        template.unshift({
            label: app.getName(),
            submenu: [
                {
                    label: '关于 ' + app.getName(),
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: '关于系统信息查看器',
                            message: '系统信息查看器 v1.0.0',
                            detail: '基于 Electron for HarmonyOS PC 的系统信息查看工具',
                            buttons: ['确定']
                        });
                    }
                },
                { type: 'separator' },
                { label: '服务', role: 'services', submenu: [] },
                { type: 'separator' },
                { label: '隐藏 ' + app.getName(), accelerator: 'Command+H', role: 'hide' },
                { label: '隐藏其他', accelerator: 'Command+Shift+H', role: 'hideothers' },
                { label: '显示全部', role: 'unhide' },
                { type: 'separator' },
                { label: '退出', accelerator: 'Command+Q', click: () => { app.quit(); } }
            ]
        });
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// IPC handler for getting system information
ipcMain.handle('get-system-info', async () => {
    const appModeInfo = getAppModeInfo();
    const systemInfo = {
        // OS Information
        platform: os.platform(),
        arch: os.arch(),
        release: os.release(),
        hostname: os.hostname(),
        type: os.type(),

        // CPU Information
        cpus: os.cpus(),
        cpuCount: os.cpus().length,
        cpuModel: os.cpus()[0]?.model || 'Unknown',

        // Memory Information
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
        usedMemory: os.totalmem() - os.freemem(),
        memoryUsagePercent: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2),

        // Network Information
        networkInterfaces: os.networkInterfaces(),

        // System Uptime
        uptime: os.uptime(),
        uptimeFormatted: formatUptime(os.uptime()),

        // Home Directory
        homedir: os.homedir(),
        tmpdir: os.tmpdir(),

        // User Information
        userInfo: os.userInfo(),

        // Display Information (Electron specific)
        displays: screen.getAllDisplays(),
        primaryDisplay: screen.getPrimaryDisplay(),

        // Locale Information (HarmonyOS specific)
        locale: app.getLocale(),
        systemLocale: app.getSystemLocale(),

        // App Information
        appVersion: app.getVersion(),
        appName: app.getName(),
        appPath: app.getAppPath(),

        // Electron Version
        electronVersion: process.versions.electron,
        chromeVersion: process.versions.chrome,
        nodeVersion: process.versions.node,

        // 应用模式信息 (开发模式检测)
        appMode: appModeInfo,

        // Timestamp
        timestamp: new Date().toISOString()
    };

    return systemInfo;
});

// IPC handler: 检查开发模式
ipcMain.handle('is-development', () => {
    return isDevelopment();
});

// IPC handler: 获取应用模式信息
ipcMain.handle('get-app-mode-info', () => {
    return getAppModeInfo();
});

// IPC handler for exporting system info to file
ipcMain.handle('export-to-file', async (event, info) => {
    try {
        const content = generateReportContent(info);

        const result = await dialog.showSaveDialog(mainWindow, {
            title: '导出系统信息报告',
            defaultPath: `系统信息报告_${new Date().toISOString().split('T')[0]}.txt`,
            filters: [
                { name: '文本文件', extensions: ['txt'] },
                { name: '所有文件', extensions: ['*'] }
            ]
        });

        if (result.canceled || !result.filePath) {
            return { success: false, error: '用户取消了保存' };
        }

        await fs.writeFile(result.filePath, content, 'utf-8');
        return { success: true, filePath: result.filePath };
    } catch (error) {
        console.error('Export error:', error);
        return { success: false, error: error.message };
    }
});

// Helper function to generate report content
function generateReportContent(info) {
    const lines = [];
    lines.push('========================================');
    lines.push('       系统信息报告');
    lines.push('========================================');
    lines.push('');
    lines.push(`生成时间: ${new Date(info.timestamp).toLocaleString('zh-CN')}`);
    lines.push('');
    lines.push('----------------------------------------');
    lines.push('操作系统信息');
    lines.push('----------------------------------------');
    lines.push(`平台: ${info.platform}`);
    lines.push(`架构: ${info.arch}`);
    lines.push(`系统版本: ${info.release}`);
    lines.push(`主机名: ${info.hostname}`);
    lines.push(`系统类型: ${info.type}`);
    lines.push('');
    lines.push('----------------------------------------');
    lines.push('CPU 信息');
    lines.push('----------------------------------------');
    lines.push(`CPU 型号: ${info.cpuModel}`);
    lines.push(`CPU 核心数: ${info.cpuCount}`);
    lines.push('');
    lines.push('----------------------------------------');
    lines.push('内存信息');
    lines.push('----------------------------------------');
    lines.push(`总内存: ${formatBytes(info.totalMemory)}`);
    lines.push(`可用内存: ${formatBytes(info.freeMemory)}`);
    lines.push(`已用内存: ${formatBytes(info.usedMemory)}`);
    lines.push(`内存使用率: ${info.memoryUsagePercent}%`);
    lines.push('');
    lines.push('----------------------------------------');
    lines.push('显示器信息');
    lines.push('----------------------------------------');
    lines.push(`显示器数量: ${info.displays.length}`);
    if (info.primaryDisplay) {
        lines.push(`主显示器分辨率: ${info.primaryDisplay.size.width} x ${info.primaryDisplay.size.height}`);
    }
    lines.push('');
    lines.push('----------------------------------------');
    lines.push('系统运行时间');
    lines.push('----------------------------------------');
    lines.push(`运行时间: ${info.uptimeFormatted}`);
    lines.push('');
    lines.push('----------------------------------------');
    lines.push('应用信息');
    lines.push('----------------------------------------');
    lines.push(`应用名称: ${info.appName}`);
    lines.push(`应用版本: ${info.appVersion}`);
    lines.push(`Electron 版本: ${info.electronVersion}`);
    lines.push(`Node.js 版本: ${info.nodeVersion}`);
    if (info.appMode) {
        lines.push('');
        lines.push('----------------------------------------');
        lines.push('应用模式信息');
        lines.push('----------------------------------------');
        lines.push(`运行模式: ${info.appMode.isDevelopment ? '🔧 开发模式' : '🚀 生产模式'}`);
        lines.push(`是否打包: ${info.appMode.isPackaged ? '是' : '否'}`);
        lines.push(`NODE_ENV: ${info.appMode.nodeEnv}`);
    }
    lines.push('');
    lines.push('========================================');
    lines.push('       报告结束');
    lines.push('========================================');
    return lines.join('\n');
}

// Helper function to format bytes
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// Helper function to format uptime
function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts = [];
    if (days > 0) parts.push(`${days}天`);
    if (hours > 0) parts.push(`${hours}小时`);
    if (minutes > 0) parts.push(`${minutes}分钟`);
    if (secs > 0) parts.push(`${secs}秒`);

    return parts.join(' ') || '0秒';
}


  // IPC handler for opening calendar window
  ipcMain.on('open-calendar', () => {
      createCalendarWindow();
  });

app.whenReady().then(() => {
    const mode = isDevelopment() ? '开发' : '生产';
    console.log(`应用启动模式: ${mode}`);
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
