/**
 * useOhos - Vue3 Composable 用于访问鸿蒙原生能力
 * 
 * 使用方式：
 * import { useOhos } from '@/composables/useOhos'
 * const { showNotification, openFile, clipboard } = useOhos()
 */

import { ref, readonly } from 'vue'

// 类型定义
interface OhosAPI {
  getSystemInfo: () => Promise<SystemInfo>
  file: {
    showOpenDialog: (options?: OpenDialogOptions) => Promise<DialogResult>
    showDirectoryDialog: (options?: OpenDialogOptions) => Promise<DialogResult>
    showSaveDialog: (options?: SaveDialogOptions) => Promise<SaveDialogResult>
  }
  notification: {
    show: (title: string, body: string) => Promise<boolean>
  }
  clipboard: {
    read: () => Promise<string>
    write: (text: string) => Promise<boolean>
  }
  window: {
    minimize: () => Promise<void>
    maximize: () => Promise<void>
    close: () => Promise<void>
    setTitle: (title: string) => Promise<void>
    setSize: (width: number, height: number) => Promise<void>
  }
  platform: string
  isOhos: boolean
}

interface SystemInfo {
  platform: string
  version: string
  deviceType: string
}

interface OpenDialogOptions {
  title?: string
  defaultPath?: string
  filters?: { name: string; extensions: string[] }[]
  properties?: string[]
}

interface SaveDialogOptions {
  title?: string
  defaultPath?: string
  filters?: { name: string; extensions: string[] }[]
}

interface DialogResult {
  canceled: boolean
  filePaths: string[]
}

interface SaveDialogResult {
  canceled: boolean
  filePath?: string
}

// 获取 ohos API
const getOhosAPI = (): OhosAPI | null => {
  return (window as any).ohos || null
}

// 检查是否在鸿蒙环境
export const isOhosEnv = (): boolean => {
  const ohos = getOhosAPI()
  return ohos?.isOhos === true
}

// 主 Composable
export function useOhos() {
  const ohos = getOhosAPI()
  const isReady = ref(!!ohos)
  const systemInfo = ref<SystemInfo | null>(null)

  // ============ 系统信息 ============
  const getSystemInfo = async (): Promise<SystemInfo | null> => {
    if (!ohos) return null
    try {
      const info = await ohos.getSystemInfo()
      systemInfo.value = info
      return info
    } catch (e) {
      console.error('获取系统信息失败:', e)
      return null
    }
  }

  // ============ 文件操作 ============
  const openFile = async (options?: OpenDialogOptions): Promise<string[]> => {
    if (!ohos) return []
    try {
      const result = await ohos.file.showOpenDialog(options)
      return result.canceled ? [] : result.filePaths
    } catch (e) {
      console.error('打开文件对话框失败:', e)
      return []
    }
  }

  const openDirectory = async (options?: OpenDialogOptions): Promise<string | null> => {
    if (!ohos) return null
    try {
      const result = await ohos.file.showDirectoryDialog(options)
      return result.canceled ? null : result.filePaths[0] || null
    } catch (e) {
      console.error('打开文件夹对话框失败:', e)
      return null
    }
  }

  const saveFile = async (options?: SaveDialogOptions): Promise<string | null> => {
    if (!ohos) return null
    try {
      const result = await ohos.file.showSaveDialog(options)
      return result.canceled ? null : result.filePath || null
    } catch (e) {
      console.error('保存文件对话框失败:', e)
      return null
    }
  }

  // ============ 通知 ============
  const showNotification = async (title: string, body: string): Promise<boolean> => {
    if (!ohos) {
      // 降级到浏览器通知
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body })
        return true
      }
      return false
    }
    try {
      return await ohos.notification.show(title, body)
    } catch (e) {
      console.error('显示通知失败:', e)
      return false
    }
  }

  // ============ 剪贴板 ============
  const clipboard = {
    read: async (): Promise<string> => {
      if (!ohos) {
        // 降级到浏览器 API
        try {
          return await navigator.clipboard.readText()
        } catch {
          return ''
        }
      }
      try {
        return await ohos.clipboard.read()
      } catch (e) {
        console.error('读取剪贴板失败:', e)
        return ''
      }
    },
    write: async (text: string): Promise<boolean> => {
      if (!ohos) {
        // 降级到浏览器 API
        try {
          await navigator.clipboard.writeText(text)
          return true
        } catch {
          return false
        }
      }
      try {
        return await ohos.clipboard.write(text)
      } catch (e) {
        console.error('写入剪贴板失败:', e)
        return false
      }
    },
  }

  // ============ 窗口控制 ============
  const minimizeWindow = async (): Promise<void> => {
    if (!ohos) return
    await ohos.window.minimize()
  }

  const maximizeWindow = async (): Promise<void> => {
    if (!ohos) return
    await ohos.window.maximize()
  }

  const closeWindow = async (): Promise<void> => {
    if (!ohos) {
      window.close()
      return
    }
    await ohos.window.close()
  }

  const setWindowTitle = async (title: string): Promise<void> => {
    document.title = title
    if (!ohos) return
    await ohos.window.setTitle(title)
  }

  const setWindowSize = async (width: number, height: number): Promise<void> => {
    if (!ohos) return
    await ohos.window.setSize(width, height)
  }

  return {
    // 状态
    isReady: readonly(isReady),
    systemInfo: readonly(systemInfo),
    isOhosEnv: isOhosEnv(),

    // 系统
    getSystemInfo,

    // 文件
    openFile,
    openDirectory,
    saveFile,

    // 通知
    showNotification,

    // 剪贴板
    clipboard,

    // 窗口
    minimizeWindow,
    maximizeWindow,
    closeWindow,
    setWindowTitle,
    setWindowSize,
  }
}

// 导出类型
export type { SystemInfo, OpenDialogOptions, SaveDialogOptions, DialogResult, SaveDialogResult }
