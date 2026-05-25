# Electron + OpenHarmony + Vue3

使用 Vue3 开发鸿蒙桌面应用的框架。

## 项目结构

```
vue-app/
├── src/
│   ├── composables/
│   │   └── useOhos.ts      # 鸿蒙原生能力 Composable
│   ├── views/
│   │   ├── Home.vue        # 首页
│   │   └── Demo.vue        # 演示页
│   ├── router/
│   │   └── index.ts        # 路由配置
│   ├── styles/
│   │   └── global.css      # 全局样式
│   ├── App.vue             # 根组件
│   ├── main.ts             # 入口文件
│   └── env.d.ts            # 类型声明
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 在 Vue3 中使用鸿蒙原生能力

```vue
<script setup lang="ts">
import { useOhos } from '@/composables/useOhos'

const {
  // 系统信息
  getSystemInfo,
  isOhosEnv,
  
  // 文件操作
  openFile,
  openDirectory,
  saveFile,
  
  // 通知
  showNotification,
  
  // 剪贴板
  clipboard,
  
  // 窗口控制
  minimizeWindow,
  maximizeWindow,
  closeWindow,
  setWindowTitle,
  setWindowSize,
} = useOhos()

// 示例：打开文件
const handleOpenFile = async () => {
  const files = await openFile({
    title: '选择文件',
    filters: [
      { name: '图片', extensions: ['png', 'jpg', 'gif'] }
    ]
  })
  console.log('选中的文件:', files)
}

// 示例：发送通知
const handleNotify = async () => {
  await showNotification('标题', '这是通知内容')
}

// 示例：剪贴板
const handleClipboard = async () => {
  // 读取
  const text = await clipboard.read()
  
  // 写入
  await clipboard.write('Hello OpenHarmony!')
}
</script>
```

## 可用的原生能力

### 系统信息
- `getSystemInfo()` - 获取系统信息
- `isOhosEnv` - 是否在鸿蒙环境

### 文件操作
- `openFile(options?)` - 打开文件选择对话框
- `openDirectory(options?)` - 打开文件夹选择对话框
- `saveFile(options?)` - 打开保存文件对话框

### 通知
- `showNotification(title, body)` - 显示系统通知

### 剪贴板
- `clipboard.read()` - 读取剪贴板
- `clipboard.write(text)` - 写入剪贴板

### 窗口控制
- `minimizeWindow()` - 最小化窗口
- `maximizeWindow()` - 最大化/还原窗口
- `closeWindow()` - 关闭窗口
- `setWindowTitle(title)` - 设置窗口标题
- `setWindowSize(width, height)` - 设置窗口大小

## 扩展原生能力

如需添加更多原生能力，需要修改以下文件：

1. `../main.js` - 添加 IPC 处理器
2. `../preload.js` - 暴露 API 给渲染进程
3. `src/composables/useOhos.ts` - 添加 Vue3 封装

## 构建部署

1. 构建 Vue3 应用：
```bash
npm run build
```

2. 构建后的文件会输出到 `../dist/` 目录

3. 在 DevEco Studio 中构建鸿蒙应用：
```bash
# 在 ohos_hap 目录下
hvigorw assembleHap
```

## 注意事项

- 开发时需要先启动 Vite 开发服务器 (`npm run dev`)
- 生产构建前确保运行 `npm run build`
- 鸿蒙原生 API 只在 Electron 环境中可用，浏览器中会自动降级
