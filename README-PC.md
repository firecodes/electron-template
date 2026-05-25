# HarmonyPC Electron

<div align="center">

本项目是由[华为云码道](https://www.huaweicloud.com/product/codearts/ai.html)助力开发

华为云码道（CodeArts）代码智能体是华为云打造的智能编码产品，深度融合IDE、自主开发模式与代码大模型能力，支持项目级代码生成、代码续写、研发知识问答、单元测试用例生成等核心功能，可高效提升开发者研发效率，带来优质的智能化编码体验。

**Electron for HarmonyOS PC - 跨平台桌面应用开发框架**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![HarmonyOS](https://img.shields.io/badge/HarmonyOS-6.0.2%2B-orange.svg)](https://developer.huawei.com/consumer/cn/harmonyos/)
[![Electron](https://img.shields.io/badge/Electron-34.0.0-green.svg)](https://www.electronjs.org/)

让 Electron 应用在鸿蒙 PC 平台上运行，构建真正的跨平台桌面应用。

[快速开始](#快速开始) • [文档](#文档) • [示例](#示例) • [贡献](#贡献)

</div>

---

## 项目简介

HarmonyPC Electron 是一个将 Electron 框架移植到 HarmonyOS PC 平台的项目。它允许开发者使用熟悉的 Web 技术（HTML、CSS、JavaScript）构建跨平台桌面应用，同时享受鸿蒙系统的原生特性。

### 核心特性

- ✅ **完整 Electron 支持** - 支持 Electron 34 的核心功能
- 🎯 **鸿蒙原生集成** - 深度集成 HarmonyOS 系统能力
- 🚀 **高性能** - 基于 Chromium 和 Node.js 的强大引擎
- 📱 **跨平台** - 一次开发，多平台运行
- 🔧 **丰富的 API** - 提供完整的系统级 API 访问
- 🌐 **活跃社区** - 持续更新和维护

### 应用场景

- 企业级桌面应用
- 开发工具和 IDE
- 多媒体应用
- 生产力工具
- 游戏和娱乐应用

---

## 快速开始

### 前置要求

- **开发环境**：Windows 10/11、macOS 10.15+ 或 Linux
- **DevEco Studio**：6.0.0 或更高版本
- **Node.js**：18.x 或更高版本
- **鸿蒙设备**：支持 HarmonyOS NEXT 的设备
- **华为开发者账号**：用于访问官方资源

### 安装步骤

#### 1. 克隆项目

```bash
git clone https://atomgit.com/jianguoxu/harmonypc-electron.git
cd harmonypc-electron
```

#### 2. 获取 Electron 编译产物

访问 [Electron HarmonyOS 仓库](https://devcloud.cn-north-4.huaweicloud.com/codehub/project/b19f5ea8ffd4492ea8c06ca2ebf3f858/codehub/2821214/home) 下载 Electron 34 编译产物。

#### 3. 解压编译产物

将下载的压缩包解压到项目目录，确保文件结构如下：

```
ohos_hap/
├── electron/
│   ├── libs/                 # 原生库文件
│   │   ├── libelectron.so   # Electron 核心引擎
│   │   ├── libadapter.so    # 鸿蒙适配层
│   │   ├── libffmpeg.so     # 多媒体支持
│   │   └── libc++_shared.so
│   └── src/
└── web_engine/              # Web 引擎适配模块
```

#### 4. 配置 Electron 应用

将你的 Electron 应用代码放置到：

```
web_engine/src/main/resources/resfile/resources/app/
```

#### 5. 使用 DevEco Studio 运行

1. 打开 DevEco Studio
2. 选择 `File` → `Open`，打开 `ohos_hap` 目录
3. 配置应用签名
4. 连接鸿蒙设备
5. 点击运行按钮

详细的环境搭建指南请参考：[环境搭建文档](docs/环境搭建.md)

---

## 项目结构

```
harmonypc-electron/
├── ohos_hap/                 # 鸿蒙 HAP 项目
│   ├── electron/            # Electron 原生模块
│   │   ├── libs/           # 原生库文件
│   │   ├── src/            # C++ 源代码
│   │   └── build-profile.json5
│   ├── web_engine/         # Web 引擎适配
│   │   ├── src/main/ets/   # ArkTS 源代码
│   │   └── src/main/resources/
│   ├── AppScope/           # 应用全局配置
│   ├── build-profile.json5 # 构建配置
│   └── docs/               # 项目文档
├── lib.unstripped/         # 未剥离的库文件
├── docs/                   # 文档目录
│   └── 环境搭建.md
└── README.md               # 项目说明
```

### 核心模块说明

#### electron 模块
- **libs/**: 包含 Electron 核心库文件
  - `libelectron.so`: Electron 主引擎
  - `libadapter.so`: 鸿蒙系统适配层
  - `libffmpeg.so`: 多媒体编解码支持
- **src/**: 原生 C++ 源代码

#### web_engine 模块
- **src/main/ets/**: ArkTS 实现的适配层
  - `components/`: 窗口和组件实现
  - `jsbindings/`: JavaScript 绑定
  - `common/`: 通用工具类
  - `utils/`: 辅助工具
- **src/main/resources/**: 资源文件

---

## 开发指南

### 创建 Electron 应用

#### 基础应用结构

```javascript
// main.js
const { app, BrowserWindow } = require('electron');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);
```

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Hello HarmonyOS!</title>
</head>
<body>
  <h1>欢迎使用 Electron on HarmonyOS!</h1>
</body>
</html>
```

```json
// package.json
{
  "name": "electron-harmonyos-app",
  "version": "1.0.0",
  "main": "main.js"
}
```

### 使用鸿蒙原生 API

Electron HarmonyOS 版本提供了访问鸿蒙原生 API 的能力：

```javascript
// 访问鸿蒙文件系统
const harmonyOS = require('harmonyos');
const fs = harmonyOS.fs;
```

### 性能优化

1. **减少包体积**
   - 只包含必要的依赖
   - 使用 Tree Shaking
   - 压缩资源文件

2. **提升启动速度**
   - 延迟加载非关键模块
   - 优化主进程代码
   - 使用代码分割

3. **内存优化**
   - 及时释放资源
   - 避免内存泄漏
   - 使用 DevTools 分析

---

## API 文档

### 支持的 Electron 模块

- ✅ `app` - 应用生命周期管理
- ✅ `BrowserWindow` - 窗口管理
- ✅ `ipcMain/ipcRenderer` - 进程间通信
- ✅ `Menu` - 菜单管理
- ✅ `Tray` - 系统托盘
- ✅ `Notification` - 通知
- ✅ `dialog` - 对话框
- ✅ `shell` - 系统操作
- ✅ `fs` - 文件系统
- ✅ `path` - 路径处理
- ✅ 更多模块持续更新中...

### 鸿蒙特性集成

- 🎨 系统主题适配
- 📱 分布式能力
- 🔔 原生通知
- 📁 文件访问权限
- 🔒 安全沙箱
- 🖥️ 多窗口管理

---

## 常见问题

### Q: 设备连接失败怎么办？

A: 请检查以下几点：
- 确认 USB 数据线正常工作
- 检查设备是否开启 USB 调试模式
- 尝试更换 USB 端口
- 在设备上重新授权 USB 调试

### Q: 编译失败如何解决？

A: 常见解决方法：
- 检查 SDK 是否完整安装
- 确认 Node.js 版本是否正确
- 清理项目缓存：`Build → Clean Project`
- 重新同步 Gradle

### Q: 应用无法启动？

A: 请检查：
- `libelectron.so` 等库文件是否完整
- 应用代码目录结构是否正确
- 查看 DevEco Studio 的 Logcat 日志
- 尝试卸载后重新安装

更多问题请参考：[常见问题排查](docs/环境搭建.md#常见问题排查)

---

## 贡献指南

我们欢迎所有形式的贡献！

### 如何贡献

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 开发规范

- 遵循 Electron 官方 API 设计
- 保持代码风格一致
- 添加必要的注释和文档
- 确保代码质量通过测试
- 及时更新相关文档

---

## 文档资源

### 详细文档

- [环境搭建指南](docs/环境搭建.md) - 详细的环境配置步骤
- [鸿蒙PC适配菜单栏自定义功能](docs/鸿蒙PC适配菜单栏自定义功能.md) - 菜单栏系统完整实现指南
- [系统信息Demo说明](docs/系统信息Demo说明.md) - 系统信息查看器技术深度解析
- [打印功能实现详解](docs/打印功能实现详解.md) - 打印和导出功能完整实现
- [开发模式检测实现](docs/开发模式检测实现.md) - 开发/生产模式检测方案

### 官方资源

- [Electron 官方文档](https://www.electronjs.org/docs) - Electron API 文档
- [鸿蒙开发者文档](https://developer.huawei.com/consumer/cn/doc/) - HarmonyOS 开发指南
- [DevEco Studio 使用指南](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/ide-overview-V5) - IDE 使用手册
- [常见问题解决](https://atomgit.com/openharmony-sig/electron) - 社区问题解答

---

## 版本历史

### v1.0.0 (2026-03-01)
- ✨ 初始版本发布
- ✅ 支持 Electron 34
- 🎯 完整的鸿蒙适配
- 📚 完善的文档

---

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

---

## 联系方式

- 项目主页: [https://atomgit.com/jianguoxu/harmonypc-electron](https://atomgit.com/jianguoxu/harmonypc-electron)
- 问题反馈: [Issues](https://atomgit.com/jianguoxu/harmonypc-electron/issues)
- 讨论区: [Discussions](https://atomgit.com/jianguoxu/harmonypc-electron/discussions)

---

## 致谢

感谢以下开源项目和社区：

- [Electron](https://www.electronjs.org/) - 跨平台桌面应用框架
- [HarmonyOS](https://www.harmonyos.com/) - 华为鸿蒙操作系统
- [Chromium](https://www.chromium.org/) - 开源浏览器项目
- [Node.js](https://nodejs.org/) - JavaScript 运行时环境

---

<div align="center">

**如果这个项目对你有帮助，请给我们一个 ⭐️**

Made with ❤️ by HarmonyPC Electron Team

</div>
