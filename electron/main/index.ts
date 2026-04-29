import { app, BrowserWindow, shell, ipcMain } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs   > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.APP_ROOT = path.join(__dirname, '../..')

export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

import './main';



// let win: BrowserWindow | null = null
// const preload = path.join(__dirname, '../preload/index.mjs')
// const indexHtml = path.join(RENDERER_DIST, 'index.html')

// async function createWindow() {
//   win = new BrowserWindow({
//     title: 'Main window',
//     icon: path.join(process.env.VITE_PUBLIC, 'favicon.ico'),
//     webPreferences: {
//       preload,
//       // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
//       // nodeIntegration: true,

//       // Consider using contextBridge.exposeInMainWorld
//       // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
//       // contextIsolation: false,
//     },
//   })

//   if (VITE_DEV_SERVER_URL) { // #298
//     win.loadURL(VITE_DEV_SERVER_URL)
//     // Open devTool if the app is not packaged
//     win.webContents.openDevTools()
//   } else {
//     win.loadFile(indexHtml)
//   }

//   // Test actively push message to the Electron-Renderer
//   win.webContents.on('did-finish-load', () => {
//     win?.webContents.send('main-process-message', new Date().toLocaleString())
//   })

//   // Make all links open with the browser, not with the application
//   win.webContents.setWindowOpenHandler(({ url }) => {
//     if (url.startsWith('https:')) shell.openExternal(url)
//     return { action: 'deny' }
//   })
//   // win.webContents.on('will-navigate', (event, url) => { }) #344
// }

// app.whenReady().then(createWindow)

// app.on('window-all-closed', () => {
//   win = null
//   if (process.platform !== 'darwin') app.quit()
// })

// app.on('second-instance', () => {
//   if (win) {
//     // Focus on the main window if the user tried to open another
//     if (win.isMinimized()) win.restore()
//     win.focus()
//   }
// })

// app.on('activate', () => {
//   const allWindows = BrowserWindow.getAllWindows()
//   if (allWindows.length) {
//     allWindows[0].focus()
//   } else {
//     createWindow()
//   }
// })

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





// import {AppCore} from './core/AppCore';

// // 必须在 app ready 之前调用（硬件加速设置在 Application.applyConfiguration 中处理）
// const application = new AppCore();
// let win: BrowserWindow | null = null

// app.whenReady().then(async () => {
//     // 尝试启用垃圾回收
//     if (typeof global.gc !== 'function') {
//         try {
//             require('v8').setFlagsFromString('--expose_gc');
//             (global as any).gc = require('vm').runInNewContext('gc');
//             console.log('🔧 主进程: 尝试手动启用垃圾回收功能');
//         } catch (e: any) {
//             console.warn('⚠️ 主进程: 手动启用垃圾回收失败:', e.message);
//         }
//     }

//     await application.start();

//     app.on('second-instance', () => {
//         if (win) {
//             // Focus on the main window if the user tried to open another
//             if (win.isMinimized()) win.restore()
//             win.focus()
//         }
//     })

//     app.on('activate', async () => {
//         const allWindows = BrowserWindow.getAllWindows()
//         if (allWindows.length) {
//             allWindows[0].focus()
//         } else {
//            win = await application.createMainWindow();
//         }
//     });
// });

// app.on('window-all-closed', () => {
//     if (process.platform !== 'darwin') {
//         app.quit();
//     }
// });

// app.on('before-quit', async () => {
//     await application.stop();
// });



// // // New window example arg: new windows url
// // ipcMain.handle('open-win', (_, arg) => {
// //   const childWindow = new BrowserWindow({
// //     webPreferences: {
// //       preload,
// //       nodeIntegration: true,
// //       contextIsolation: false,
// //     },
// //   })

// //   if (VITE_DEV_SERVER_URL) {
// //     childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`)
// //   } else {
// //     childWindow.loadFile(indexHtml, { hash: arg })
// //   }
// // })