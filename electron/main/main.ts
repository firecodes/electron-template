/**
 * 应用入口文件
 * 使用新架构的 Application 类替代旧的全局变量模式
 */

import {app, BrowserWindow, ipcMain} from 'electron';
import {AppCore} from './core/AppCore';

// 必须在 app ready 之前调用（硬件加速设置在 Application.applyConfiguration 中处理）
const application = new AppCore();
let win: BrowserWindow | null = null

app.whenReady().then(async () => {
    // 尝试启用垃圾回收
    if (typeof global.gc !== 'function') {
        try {
            require('v8').setFlagsFromString('--expose_gc');
            (global as any).gc = require('vm').runInNewContext('gc');
            console.log('🔧 主进程: 尝试手动启用垃圾回收功能');
        } catch (e: any) {
            console.warn('⚠️ 主进程: 手动启用垃圾回收失败:', e.message);
        }
    }

    await application.start();

    win = await application.createMainWindow();
    app.on('second-instance', () => {
        if (win) {
            // Focus on the main window if the user tried to open another
            if (win.isMinimized()) win.restore()
            win.focus()
        }
    })

    console.log(`app activate start 22222`);
    app.on('activate', async () => {
        console.log(`app activate start 111`);
        const allWindows = BrowserWindow.getAllWindows()
        console.log(`🔄 activate ${allWindows.length}`);
        if (allWindows.length) {
            allWindows[0].focus()
        } else {
           win = await application.createMainWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', async () => {
    await application.stop();
});



// // New window example arg: new windows url
// ipcMain.handle('open-win', (_, arg) => {
//   const childWindow = new BrowserWindow({
//     webPreferences: {
//       preload,
//       nodeIntegration: true,
//       contextIsolation: false,
//     },
//   })

//   if (VITE_DEV_SERVER_URL) {
//     childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`)
//   } else {
//     childWindow.loadFile(indexHtml, { hash: arg })
//   }
// })