# 鸿蒙PC适配菜单栏自定义功能

[欢迎加入开源鸿蒙PC社区](https://harmonypc.csdn.net/)

[项目地址](https://atomgit.com/jianguoxu/harmonypc-electron)

## 目录

- [引言](#引言)
- [Electron 菜单系统概述](#electron-菜单系统概述)
- [鸿蒙PC平台适配要点](#鸿蒙pc平台适配要点)
- [完整实现方案](#完整实现方案)
- [核心代码解析](#核心代码解析)
- [帮助窗口系统](#帮助窗口系统)
- [平台差异处理](#平台差异处理)
- [最佳实践](#最佳实践)
- [常见问题与解决方案](#常见问题与解决方案)
- [总结](#总结)

![image-20260302194223591](https://nutpi-e41b.obs.cn-north-4.myhuaweicloud.com/image-20260303125524838.png)

## 引言

在桌面应用开发中，菜单栏是用户与应用交互的重要界面元素。对于基于 Electron 的鸿蒙 PC 应用来说，一个设计良好的菜单系统不仅能提升用户体验，还能让应用更好地融入不同操作系统的原生环境。

本文将详细介绍如何在鸿蒙 PC 平台上为 Electron 应用实现完整的菜单栏自定义功能，包括：

- 📋 自定义菜单栏的创建与管理
- 🎯 菜单项与快捷键的绑定
- 🔗 IPC 通信实现菜单功能
- 📚 帮助窗口系统的实现
- 🍎 macOS 与 Windows/Linux 的平台适配
- 🎨 现代化的帮助页面设计

我们将通过一个完整的系统信息查看器示例，展示从菜单设计到功能实现的全过程。

---

## Electron 菜单系统概述

### 菜单系统架构

Electron 的菜单系统主要由以下核心组件构成：

```
┌─────────────────────────────────────┐
│         Electron 菜单系统           │
├─────────────────────────────────────┤
│  Menu (菜单类)                       │
│  ├─ MenuItem (菜单项)                │
│  │  ├─ label (标签)                  │
│  │  ├─ accelerator (快捷键)          │
│  │  ├─ click (点击事件)             │
│  │  └─ role (预定义角色)            │
│  └─ Submenu (子菜单)                 │
├─────────────────────────────────────┤
│  Menu API                            │
│  ├─ Menu.buildFromTemplate()        │
│  ├─ Menu.setApplicationMenu()       │
│  └─ BrowserWindow.setMenu()         │
└─────────────────────────────────────┘
```

### 核心概念

#### 1. Menu Template（菜单模板）

菜单模板是一个 JavaScript 数组，用于定义菜单的结构：

```javascript
const template = [
    {
        label: '文件',
        submenu: [
            { label: '新建', accelerator: 'CmdOrCtrl+N', click: () => {} },
            { label: '打开', accelerator: 'CmdOrCtrl+O', click: () => {} },
            { type: 'separator' },
            { label: '退出', click: () => app.quit() }
        ]
    }
];
```

#### 2. Accelerator（快捷键）

快捷键语法支持跨平台：

```javascript
// Windows/Linux 专用
accelerator: 'Ctrl+S'

// macOS 专用
accelerator: 'Cmd+S'

// 跨平台（自动适配）
accelerator: 'CmdOrCtrl+S'

// 组合键示例
accelerator: 'CmdOrCtrl+Shift+R'
accelerator: 'Alt+Cmd+I'
accelerator: 'Ctrl+Shift+Alt+Delete'
```

#### 3. Role（预定义角色）

Electron 提供了许多预定义角色，自动实现标准功能：

```javascript
{ label: '撤销', accelerator: 'CmdOrCtrl+Z', role: 'undo' }
{ label: '剪切', accelerator: 'CmdOrCtrl+X', role: 'cut' }
{ label: '复制', accelerator: 'CmdOrCtrl+C', role: 'copy' }
{ label: '粘贴', accelerator: 'CmdOrCtrl+V', role: 'paste' }
{ label: '全选', accelerator: 'CmdOrCtrl+A', role: 'selectall' }
```

#### 4. Menu Type（菜单类型）

- `normal`: 普通菜单项（默认）
- `separator`: 分隔线
- `submenu`: 子菜单
- `checkbox`: 复选框
- `radio`: 单选按钮

---

## 鸿蒙PC平台适配要点

### 平台特性

鸿蒙 PC 平台在菜单系统方面有以下特点：

1. **兼容性优先**
   - 鸿蒙 PC 支持标准的 Electron Menu API
   - 与 Windows/Linux 菜单行为一致
   - 支持完整的快捷键系统

2. **本地化支持**
   - 中文标签显示正常
   - 系统字体适配
   - 右键菜单本地化

3. **性能优化**
   - 菜单渲染性能良好
   - 支持大量菜单项
   - 动态菜单更新流畅

### 与 macOS 的差异

| 特性 | macOS | 鸿蒙 PC / Windows | 说明 |
|------|-------|------------------|------|
| 应用菜单 | ✅ 独立应用名菜单 | ❌ 无应用菜单 | macOS 有特殊的第一个菜单 |
| 菜单位置 | 屏幕顶部 | 窗口顶部 | macOS 菜单栏在屏幕顶部 |
| 隐藏/显示 | ✅ 系统级 | ❌ 应用级 | macOS 可以隐藏其他应用 |
| 服务菜单 | ✅ 集成 | ❌ 无 | macOS 有系统服务集成 |
| 触控栏 | ✅ 支持 | ❌ 不支持 | MacBook 特有功能 |

---

## 完整实现方案

### 项目结构

```
ohos_hap/web_engine/src/main/resources/resfile/resources/app/
├── main.js              # 主进程（菜单创建）
├── system-info.html     # 主窗口（IPC 监听）
├── help.html            # 帮助窗口
└── package.json         # 项目配置
```

### 实现步骤

#### 步骤 1: 导入 Menu 模块

```javascript
const { app, BrowserWindow, ipcMain, screen, dialog, Menu } = require('electron');
```

#### 步骤 2: 创建菜单模板

```javascript
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
```

#### 步骤 3: 在创建窗口时调用

```javascript
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    mainWindow.setWindowButtonVisibility(true);

    const indexPath = path.join(__dirname, 'system-info.html');
    mainWindow.loadFile(indexPath);

    if (isDevelopment()) {
        mainWindow.webContents.openDevTools();
    }

    // 创建菜单
    createMenu();
}
```

#### 步骤 4: 渲染进程监听 IPC 事件

```javascript
// 在 system-info.html 的 <script> 标签中
const { ipcRenderer } = require('electron');

/**
 * 监听来自菜单栏的刷新命令
 */
ipcRenderer.on('refresh-system-info', () => {
    console.log('收到刷新命令');
    loadSystemInfo();
});

/**
 * 监听来自菜单栏的导出命令
 */
ipcRenderer.on('export-system-info', () => {
    console.log('收到导出命令');
    exportSystemInfo();
});
```

---

## 核心代码解析

### 1. IPC 通信机制

菜单栏与渲染进程之间的通信流程：

```
┌─────────────┐                    ┌─────────────┐
│   主进程     │                    │  渲染进程    │
│  (main.js)  │                    │ (renderer)  │
└──────┬──────┘                    └──────┬──────┘
       │                                  │
       │ 1. 用户点击菜单项                 │
       │    click() 回调触发               │
       │                                  │
       │ 2. 发送 IPC 消息                  │
       │    webContents.send()  ──────────┼──> 3. 监听 IPC 事件
       │    'refresh-system-info'         │     ipcRenderer.on()
       │                                  │
       │                                  │ 4. 执行功能函数
       │                                  │    loadSystemInfo()
       │                                  │
       │ 5. 可选：返回结果                  │
       │    ipcRenderer.invoke() <────────┼── 6. 调用主进程方法
       │                                  │
       │                                  │
```

### 2. 菜单模板结构详解

#### 文件菜单

```javascript
{
    label: '文件',
    submenu: [
        // 功能菜单项
        {
            label: '刷新系统信息',
            accelerator: 'CmdOrCtrl+R',  // 跨平台快捷键
            click: () => {
                // 发送 IPC 消息到渲染进程
                if (mainWindow) {
                    mainWindow.webContents.send('refresh-system-info');
                }
            }
        },
        // 分隔线
        { type: 'separator' },
        // 退出菜单项
        {
            label: '退出',
            // 平台特定快捷键
            accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
            click: () => {
                app.quit();  // 退出应用
            }
        }
    ]
}
```

#### 编辑菜单（使用预定义角色）

```javascript
{
    label: '编辑',
    submenu: [
        // 使用 role 自动实现撤销功能
        { label: '撤销', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: '重做', accelerator: 'CmdOrCtrl+Y', role: 'redo' },
        { type: 'separator' },
        // 使用 role 自动实现剪切功能
        { label: '剪切', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: '复制', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: '粘贴', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { type: 'separator' },
        { label: '全选', accelerator: 'CmdOrCtrl+A', role: 'selectall' }
    ]
}
```

#### 查看菜单（窗口操作）

```javascript
{
    label: '查看',
    submenu: [
        {
            label: '刷新页面',
            accelerator: 'CmdOrCtrl+Shift+R',
            click: () => {
                if (mainWindow) {
                    mainWindow.reload();  // 重新加载页面
                }
            }
        },
        {
            label: '开发者工具',
            // 平台特定快捷键
            accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
            click: () => {
                if (mainWindow) {
                    mainWindow.webContents.toggleDevTools();  // 切换开发者工具
                }
            }
        },
        { type: 'separator' },
        // 缩放控制
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
}
```

### 3. macOS 特有菜单

```javascript
// 仅在 macOS 平台添加
if (process.platform === 'darwin') {
    template.unshift({
        label: app.getName(),  // 使用应用名称
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
```

**关键点：**
- `template.unshift()` 将应用菜单插入到最前面
- `app.getName()` 获取应用名称
- 使用 `role` 实现系统级功能
- macOS 特有的隐藏/显示功能

---

## 帮助窗口系统

### 窗口管理

```javascript
let helpWindow;

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
        parent: mainWindow ? mainWindow : null,  // 设置父窗口
        modal: false  // 非模态窗口
    });

    const helpPath = path.join(__dirname, 'help.html');
    helpWindow.loadFile(helpPath);

    helpWindow.on('closed', () => {
        helpWindow = null;  // 清理引用
    });

    // 开发模式下自动打开 DevTools
    if (isDevelopment()) {
        helpWindow.webContents.openDevTools();
    }
}
```

### 单例模式实现

```javascript
// 检查窗口是否已存在
if (helpWindow) {
    helpWindow.focus();  // 聚焦现有窗口
    return;
}
```

**好处：**
- 避免创建多个帮助窗口
- 节省系统资源
- 提供一致的用户体验

### 帮助页面设计

#### HTML 结构

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>帮助 - 系统信息查看器</title>
    <style>
        /* 样式代码 */
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📚 系统信息查看器</h1>
            <p>帮助文档 - 使用指南</p>
        </div>

        <div class="content">
            <!-- 欢迎 -->
            <div class="section">
                <h2>欢迎使用</h2>
                <p>欢迎使用系统信息查看器！</p>
            </div>

            <!-- 功能介绍 -->
            <div class="section">
                <h2>功能介绍</h2>
                <div class="feature-grid">
                    <div class="feature-card">
                        <h4>🖥️ 系统信息</h4>
                        <p>查看操作系统版本、架构、主机名等基本信息</p>
                    </div>
                    <!-- 更多功能卡片 -->
                </div>
            </div>

            <!-- 快捷键 -->
            <div class="section">
                <h2>快捷键</h2>
                <table class="shortcut-table">
                    <thead>
                        <tr>
                            <th>功能</th>
                            <th>Windows/Linux</th>
                            <th>macOS</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>刷新系统信息</td>
                            <td><code>Ctrl+R</code></td>
                            <td><code>Cmd+R</code></td>
                        </tr>
                        <!-- 更多快捷键 -->
                    </tbody>
                </table>
            </div>

            <!-- 其他章节 -->
        </div>

        <div class="footer">
            <p>© 2024 HarmonyPC Electron Team</p>
        </div>
    </div>
</body>
</html>
```

#### CSS 样式

```css
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #333;
    line-height: 1.6;
    padding: 20px;
}

.container {
    max-width: 900px;
    margin: 0 auto;
    background: white;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    overflow: hidden;
}

.header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 40px;
    text-align: center;
}

.header h1 {
    font-size: 2.5em;
    margin-bottom: 10px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.content {
    padding: 40px;
}

.section {
    margin-bottom: 40px;
}

.section h2 {
    color: #667eea;
    font-size: 1.8em;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 3px solid #667eea;
}

.feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin: 20px 0;
}

.feature-card {
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    padding: 20px;
    border-radius: 10px;
    border-left: 4px solid #667eea;
}

.feature-card h4 {
    color: #667eea;
    margin-bottom: 10px;
    font-size: 1.1em;
}

.shortcut-table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    background: #f9f9f9;
    border-radius: 10px;
    overflow: hidden;
}

.shortcut-table th,
.shortcut-table td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #ddd;
}

.shortcut-table th {
    background: #667eea;
    color: white;
    font-weight: bold;
}

.shortcut-table td code {
    background: #667eea;
    color: white;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 0.9em;
}

.info-box {
    background: #e3f2fd;
    border-left: 4px solid #2196f3;
    padding: 15px;
    margin: 20px 0;
    border-radius: 5px;
}

.footer {
    background: #f5f5f5;
    padding: 20px;
    text-align: center;
    color: #666;
    font-size: 0.9em;
}

@media print {
    body {
        background: white;
        padding: 0;
    }

    .container {
        box-shadow: none;
        border-radius: 0;
    }

    .header {
        background: white;
        color: #333;
        border-bottom: 2px solid #667eea;
    }
}
```

---

## 平台差异处理

### 1. 快捷键适配

#### 跨平台快捷键

```javascript
// 使用 CmdOrCtrl 自动适配
accelerator: 'CmdOrCtrl+R'  // Windows/Linux: Ctrl+R, macOS: Cmd+R

// 使用 Command 适配 macOS
accelerator: process.platform === 'darwin' ? 'Command+H' : 'Ctrl+H'
```

#### 平台特定快捷键

```javascript
// 开发者工具
accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Ctrl+Shift+I'

// 退出应用
accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q'
```

### 2. 菜单结构适配

#### Windows/Linux 菜单结构

```javascript
const template = [
    { label: '文件', submenu: [...] },
    { label: '编辑', submenu: [...] },
    { label: '查看', submenu: [...] },
    { label: '帮助', submenu: [...] }
];
```

#### macOS 菜单结构

```javascript
const template = [
    // 应用菜单（macOS 特有）
    {
        label: app.getName(),
        submenu: [
            { label: '关于', role: 'about' },
            { type: 'separator' },
            { label: '服务', role: 'services', submenu: [] },
            { type: 'separator' },
            { label: '隐藏', role: 'hide' },
            { label: '隐藏其他', role: 'hideothers' },
            { label: '显示全部', role: 'unhide' },
            { type: 'separator' },
            { label: '退出', role: 'quit' }
        ]
    },
    // 标准菜单
    { label: '文件', submenu: [...] },
    { label: '编辑', submenu: [...] },
    { label: '查看', submenu: [...] },
    { label: '帮助', submenu: [...] }
];
```

### 3. 窗口行为适配

```javascript
// macOS 特有行为
if (process.platform === 'darwin') {
    // 窗口关闭时隐藏而非退出
    app.on('window-all-closed', () => {
        // macOS 不退出应用
    });

    // 点击 Dock 图标时重新创建窗口
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
} else {
    // Windows/Linux 关闭窗口时退出应用
    app.on('window-all-closed', () => {
        app.quit();
    });
}
```

---

## 最佳实践

### 1. 菜单设计原则

#### 遵循平台规范

- **Windows/Linux**: 文件、编辑、查看、帮助
- **macOS**: 应用名、文件、编辑、查看、帮助

#### 合理分组

```javascript
{
    label: '文件',
    submenu: [
        // 主要操作
        { label: '新建', accelerator: 'CmdOrCtrl+N', click: () => {} },
        { label: '打开', accelerator: 'CmdOrCtrl+O', click: () => {} },
        { label: '保存', accelerator: 'CmdOrCtrl+S', click: () => {} },
        { type: 'separator' },  // 分隔线
        // 次要操作
        { label: '导出', accelerator: 'CmdOrCtrl+E', click: () => {} },
        { label: '打印', accelerator: 'CmdOrCtrl+P', click: () => {} },
        { type: 'separator' },
        // 系统操作
        { label: '退出', click: () => app.quit() }
    ]
}
```

#### 使用预定义角色

```javascript
// ✅ 推荐：使用预定义角色
{ label: '撤销', accelerator: 'CmdOrCtrl+Z', role: 'undo' }
{ label: '剪切', accelerator: 'CmdOrCtrl+X', role: 'cut' }
{ label: '复制', accelerator: 'CmdOrCtrl+C', role: 'copy' }

// ❌ 不推荐：自己实现
{ label: '撤销', accelerator: 'CmdOrCtrl+Z', click: () => { /* 自己实现 */ } }
```

### 2. 快捷键设计原则

#### 使用标准快捷键

```javascript
// ✅ 标准快捷键
accelerator: 'CmdOrCtrl+N'  // 新建
accelerator: 'CmdOrCtrl+O'  // 打开
accelerator: 'CmdOrCtrl+S'  // 保存
accelerator: 'CmdOrCtrl+P'  // 打印
accelerator: 'CmdOrCtrl+Q'  // 退出

// ❌ 避免使用非标准快捷键
accelerator: 'CmdOrCtrl+K'  // 不常见的快捷键
```

#### 避免快捷键冲突

```javascript
// 检查系统快捷键冲突
// F1: 帮助（系统保留）
// F5: 刷新（浏览器保留）
// CmdOrCtrl+C: 复制（系统保留）

// ✅ 应用自定义快捷键
accelerator: 'CmdOrCtrl+Shift+R'  // 刷新系统信息
accelerator: 'CmdOrCtrl+E'  // 导出报告
```

### 3. IPC 通信最佳实践

#### 单向通信（主进程 → 渲染进程）

```javascript
// 主进程发送消息
mainWindow.webContents.send('refresh-system-info');

// 渲染进程监听
ipcRenderer.on('refresh-system-info', () => {
    loadSystemInfo();
});
```

#### 双向通信（渲染进程 ↔ 主进程）

```javascript
// 渲染进程调用主进程
const result = await ipcRenderer.invoke('export-to-file', data);

// 主进程处理
ipcMain.handle('export-to-file', async (event, data) => {
    // 处理逻辑
    return { success: true, filePath: '...' };
});
```

#### 错误处理

```javascript
// 主进程
ipcMain.handle('export-to-file', async (event, data) => {
    try {
        // 处理逻辑
        return { success: true };
    } catch (error) {
        console.error('Export error:', error);
        return { success: false, error: error.message };
    }
});

// 渲染进程
try {
    const result = await ipcRenderer.invoke('export-to-file', data);
    if (result.success) {
        alert('导出成功！');
    } else {
        alert('导出失败: ' + result.error);
    }
} catch (error) {
    console.error('Error:', error);
}
```

### 4. 窗口管理最佳实践

#### 单例窗口

```javascript
let helpWindow;

function createHelpWindow() {
    if (helpWindow) {
        helpWindow.focus();  // 聚焦现有窗口
        return;
    }
    
    helpWindow = new BrowserWindow({ /* ... */ });
    helpWindow.on('closed', () => {
        helpWindow = null;  // 清理引用
    });
}
```

#### 窗口生命周期管理

```javascript
// 创建窗口
const win = new BrowserWindow({ /* ... */ });

// 加载页面
win.loadFile('index.html');

// 监听事件
win.on('ready-to-show', () => {
    win.show();
});

win.on('closed', () => {
    // 清理资源
    win = null;
});

// 关闭窗口
win.close();
```

---

## 常见问题与解决方案

### 1. 菜单不显示

**问题：** 设置了菜单但窗口中没有显示

**原因：**
- 没有调用 `Menu.setApplicationMenu()`
- 在鸿蒙 PC 上，菜单显示在窗口顶部，而不是屏幕顶部

**解决方案：**

```javascript
// ✅ 正确：设置应用菜单
const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

// ❌ 错误：忘记设置菜单
const menu = Menu.buildFromTemplate(template);
// 缺少 Menu.setApplicationMenu(menu)
```

### 2. 快捷键不工作

**问题：** 设置了快捷键但按下没有反应

**原因：**
- 快捷键被系统占用
- 快捷键格式错误
- 菜单项被禁用

**解决方案：**

```javascript
// ✅ 正确：使用标准格式
accelerator: 'CmdOrCtrl+R'
accelerator: 'Alt+Cmd+I'

// ❌ 错误：格式错误
accelerator: 'Ctrl+Shift+R'  // 应该是 CmdOrCtrl
accelerator: 'Cmd + R'  // 不应该有空格

// 检查菜单项是否被禁用
menuItem.enabled = true;
```

### 3. IPC 通信失败

**问题：** 发送 IPC 消息后没有响应

**原因：**
- 渲染进程没有监听对应的事件
- 窗口已关闭
- 事件名称不匹配

**解决方案：**

```javascript
// 主进程
mainWindow.webContents.send('refresh-system-info');

// 渲染进程
// ✅ 正确：事件名称匹配
ipcRenderer.on('refresh-system-info', () => {
    console.log('收到消息');
});

// ❌ 错误：事件名称不匹配
ipcRenderer.on('refresh', () => {  // 名称不匹配
    console.log('不会触发');
});
```

### 4. 帮助窗口重复创建

**问题：** 每次点击帮助都创建新窗口

**解决方案：**

```javascript
// ✅ 正确：使用单例模式
let helpWindow;

function createHelpWindow() {
    if (helpWindow) {
        helpWindow.focus();  // 聚焦现有窗口
        return;
    }
    
    helpWindow = new BrowserWindow({ /* ... */ });
    helpWindow.on('closed', () => {
        helpWindow = null;  // 清理引用
    });
}

// ❌ 错误：每次都创建新窗口
function createHelpWindow() {
    const helpWindow = new BrowserWindow({ /* ... */ });
    // 没有检查是否已存在
}
```

### 5. macOS 菜单位置错误

**问题：** macOS 上菜单显示在窗口顶部而不是屏幕顶部

**原因：** 没有使用 `Menu.setApplicationMenu()`

**解决方案：**

```javascript
// ✅ 正确：设置应用菜单
const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

// ❌ 错误：设置窗口菜单
const menu = Menu.buildFromTemplate(template);
mainWindow.setMenu(menu);  // macOS 上不推荐
```

---

## 总结

本文详细介绍了如何在鸿蒙 PC 平台上为 Electron 应用实现完整的菜单栏自定义功能。通过系统信息查看器的示例，我们学习了：

### 核心要点

1. **菜单系统架构**
   - Electron 菜单系统的组成
   - Menu Template 的结构
   - Accelerator 和 Role 的使用

2. **平台适配**
   - 鸿蒙 PC 与 macOS 的差异
   - 快捷键的跨平台适配
   - 菜单结构的平台差异

3. **IPC 通信**
   - 主进程与渲染进程的通信
   - 单向和双向通信模式
   - 错误处理机制

4. **帮助窗口**
   - 单例窗口管理
   - 窗口生命周期
   - 帮助页面设计

5. **最佳实践**
   - 菜单设计原则
   - 快捷键设计规范
   - 代码组织方式

### 技术亮点

- ✨ 完整的菜单栏系统
- 🎯 跨平台快捷键支持
- 🔗 高效的 IPC 通信
- 📚 精美的帮助页面
- 🍎 平台特定优化

### 应用价值

通过实现自定义菜单栏，我们可以：
- 提升用户体验
- 增强应用专业性
- 提供便捷的操作方式
- 融入不同操作系统的原生环境

### 后续扩展

基于本文的基础，您可以进一步实现：
- 动态菜单项（根据应用状态变化）
- 上下文菜单（右键菜单）
- 自定义菜单样式
- 菜单国际化（多语言支持）
- 菜单主题定制

---

**参考资料：**

- [Electron 官方文档 - Menu](https://www.electronjs.org/docs/latest/api/menu)
- [Electron 官方文档 - MenuItem](https://www.electronjs.org/docs/latest/api/menu-item)
- [Electron 官方文档 - IPC](https://www.electronjs.org/docs/latest/tutorial/ipc)
- [HarmonyOS 开发者文档](https://developer.huawei.com/consumer/cn/harmonyos/)

---

**项目地址：** [HarmonyPC Electron](https://atomgit.com/jianguoxu/harmonypc-electron)

**作者：** HarmonyPC Electron Team

**日期：** 2024

---

🎯 **本文完**
