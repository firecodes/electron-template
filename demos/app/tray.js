/**
 * HarmonyOS Electron - 系统托盘功能模块
 *
 * 功能:
 * - 创建系统托盘图标
 * - 托盘右键菜单
 * - 托盘点击事件处理
 * - 显示/隐藏主窗口
 * - 应用退出控制
 * - 平台兼容性处理
 */

const { Tray, Menu, app, nativeImage } = require('electron');
const path = require('path');

let tray = null;

/**
 * 创建系统托盘
 */
function createTray() {
    // 如果托盘已存在，先销毁
    if (tray) {
        tray.destroy();
    }

    // 获取托盘图标路径
    // 注意：鸿蒙平台的图标路径可能需要特殊处理
    const iconPath = getTrayIconPath();

    // 创建托盘
    tray = new Tray(iconPath);

    // 设置托盘工具提示
    tray.setToolTip('HarmonyOS Electron 系统信息查看器');

    // 创建托盘菜单
    const contextMenu = Menu.buildFromTemplate([
        {
            label: '显示主窗口',
            click: () => {
                showMainWindow();
            }
        },
        {
            label: '隐藏主窗口',
            click: () => {
                hideMainWindow();
            }
        },
        { type: 'separator' },
        {
            label: '系统信息',
            click: () => {
                showMainWindow();
                // 可以在这里添加导航到系统信息页面的逻辑
            }
        },
        {
            label: '日历',
            click: () => {
                // 触发打开日历窗口的事件
                if (global.openCalendarWindow) {
                    global.openCalendarWindow();
                }
            }
        },
        { type: 'separator' },
        {
            label: '退出应用',
            click: () => {
                quitApp();
            }
        }
    ]);

    // 设置托盘菜单
    tray.setContextMenu(contextMenu);

    // 托盘点击事件（单击）
    tray.on('click', () => {
        console.log('托盘被点击');
        toggleMainWindow();
    });

    // 托盘双击事件
    tray.on('double-click', () => {
        console.log('托盘被双击');
        showMainWindow();
    });

    // 托盘右键点击事件（可选，已经通过 setContextMenu 处理）
    tray.on('right-click', () => {
        console.log('托盘右键点击');
    });

    console.log('系统托盘创建成功');
}

/**
 * 获取托盘图标路径
 * @returns {string} 图标路径
 */
function getTrayIconPath() {
    // 尝试多个可能的图标路径
    const possiblePaths = [
        path.join(__dirname, 'tray-icon.png'),
        path.join(__dirname, 'electron_white.png'),
        path.join(__dirname, 'icons', 'tray.png'),
        path.join(__dirname, '..', 'assets', 'tray.png')
    ];

    for (const iconPath of possiblePaths) {
        try {
            // 检查文件是否存在
            const fs = require('fs');
            if (fs.existsSync(iconPath)) {
                console.log('使用托盘图标:', iconPath);
                return iconPath;
            }
        } catch (error) {
            continue;
        }
    }

    // 如果找不到图标，创建一个简单的图标
    console.warn('未找到托盘图标，使用默认图标');
    return createDefaultIcon();
}

/**
 * 创建默认托盘图标（当找不到图标文件时）
 * @returns {NativeImage} 默认图标
 */
function createDefaultIcon() {
    // 创建一个简单的 16x16 图标
    const size = 16;
    const buffer = Buffer.alloc(size * size * 4);

    // 填充蓝色背景
    for (let i = 0; i < buffer.length; i += 4) {
        buffer[i] = 0;     // R
        buffer[i + 1] = 122; // G
        buffer[i + 2] = 204; // B
        buffer[i + 3] = 255; // A
    }

    const image = nativeImage.createFromBuffer(buffer, {
        width: size,
        height: size
    });

    // 调整图标大小（不同平台可能需要不同尺寸）
    const resizedImage = image.resize({
        width: 16,
        height: 16,
        quality: 'best'
    });

    return resizedImage;
}

/**
 * 显示主窗口
 */
function showMainWindow() {
    if (global.mainWindow) {
        if (global.mainWindow.isMinimized()) {
            global.mainWindow.restore();
        }
        global.mainWindow.show();
        global.mainWindow.focus();
    }
}

/**
 * 隐藏主窗口
 */
function hideMainWindow() {
    if (global.mainWindow) {
        global.mainWindow.hide();
    }
}

/**
 * 切换主窗口显示状态
 */
function toggleMainWindow() {
    if (global.mainWindow) {
        if (global.mainWindow.isVisible()) {
            hideMainWindow();
        } else {
            showMainWindow();
        }
    }
}

/**
 * 退出应用
 */
function quitApp() {
    // 清理托盘
    if (tray) {
        tray.destroy();
        tray = null;
    }

    // 退出应用
    app.quit();
}

/**
 * 更新托盘菜单状态
 * @param {boolean} isWindowVisible 窗口是否可见
 */
function updateTrayMenu(isWindowVisible) {
    if (!tray) {
        return;
    }

    const contextMenu = Menu.buildFromTemplate([
        {
            label: isWindowVisible ? '隐藏主窗口' : '显示主窗口',
            click: () => {
                if (isWindowVisible) {
                    hideMainWindow();
                } else {
                    showMainWindow();
                }
            }
        },
        { type: 'separator' },
        {
            label: '系统信息',
            click: () => {
                showMainWindow();
            }
        },
        {
            label: '日历',
            click: () => {
                if (global.openCalendarWindow) {
                    global.openCalendarWindow();
                }
            }
        },
        { type: 'separator' },
        {
            label: '退出应用',
            click: () => {
                quitApp();
            }
        }
    ]);

    tray.setContextMenu(contextMenu);
}

/**
 * 显示托盘通知
 * @param {string} title 通知标题
 * @param {string} body 通知内容
 */
function showTrayNotification(title, body) {
    if (!tray) {
        return;
    }

    // 使用 Electron 的 Notification API
    const { Notification } = require('electron');

    if (Notification.isSupported()) {
        const notification = new Notification({
            title: title,
            body: body,
            icon: getTrayIconPath(),
            silent: false
        });

        notification.show();

        // 点击通知时显示主窗口
        notification.on('click', () => {
            showMainWindow();
        });
    }
}

/**
 * 设置托盘闪烁（提醒用户）
 * @param {boolean} flash 是否闪烁
 */
function setTrayFlash(flash) {
    if (!tray) {
        return;
    }

    if (flash) {
        // 鸿蒙平台可能不支持闪烁，这里做兼容处理
        try {
            tray.setImage(getTrayIconPath());
        } catch (error) {
            console.warn('托盘闪烁功能不支持:', error);
        }
    }
}

/**
 * 销毁托盘
 */
function destroyTray() {
    if (tray) {
        tray.destroy();
        tray = null;
        console.log('系统托盘已销毁');
    }
}

// 导出函数
module.exports = {
    createTray,
    showMainWindow,
    hideMainWindow,
    toggleMainWindow,
    updateTrayMenu,
    showTrayNotification,
    setTrayFlash,
    destroyTray,
    quitApp
};
