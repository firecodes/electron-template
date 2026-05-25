<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useOhos } from '@/composables/useOhos'

const router = useRouter()
const {
  openFile,
  openDirectory,
  saveFile,
  showNotification,
  clipboard,
  minimizeWindow,
  maximizeWindow,
  closeWindow,
  setWindowTitle,
} = useOhos()

// 文件操作
const selectedFiles = ref<string[]>([])
const selectedDir = ref<string>('')

const handleOpenFile = async () => {
  const files = await openFile({
    title: '选择文件',
    filters: [
      { name: '所有文件', extensions: ['*'] },
      { name: '图片', extensions: ['png', 'jpg', 'jpeg', 'gif'] },
      { name: '文档', extensions: ['pdf', 'doc', 'docx', 'txt'] },
    ],
  })
  selectedFiles.value = files
}

const handleOpenDir = async () => {
  const dir = await openDirectory({ title: '选择文件夹' })
  selectedDir.value = dir || ''
}

const handleSaveFile = async () => {
  const path = await saveFile({
    title: '保存文件',
    filters: [{ name: '文本文件', extensions: ['txt'] }],
  })
  if (path) {
    await showNotification('保存成功', `文件已保存到: ${path}`)
  }
}

// 通知
const notificationTitle = ref('测试通知')
const notificationBody = ref('这是一条来自 Vue3 应用的通知')

const handleNotification = async () => {
  await showNotification(notificationTitle.value, notificationBody.value)
}

// 剪贴板
const clipboardText = ref('')
const clipboardInput = ref('')

const handleReadClipboard = async () => {
  clipboardText.value = await clipboard.read()
}

const handleWriteClipboard = async () => {
  if (clipboardInput.value) {
    await clipboard.write(clipboardInput.value)
    await showNotification('复制成功', '内容已复制到剪贴板')
  }
}

// 窗口
const windowTitle = ref('我的应用')

const handleSetTitle = async () => {
  await setWindowTitle(windowTitle.value)
}
</script>

<template>
  <div class="demo">
    <header class="demo-header">
      <button class="back-btn" @click="router.push('/')">
        <span>←</span>
      </button>
      <h1>原生能力演示</h1>
    </header>

    <div class="demo-content">
      <!-- 文件操作 -->
      <section class="demo-section ohos-card">
        <h3>📁 文件操作</h3>
        <div class="demo-actions">
          <button class="ohos-btn ohos-btn-primary" @click="handleOpenFile">
            选择文件
          </button>
          <button class="ohos-btn ohos-btn-secondary" @click="handleOpenDir">
            选择文件夹
          </button>
          <button class="ohos-btn ohos-btn-secondary" @click="handleSaveFile">
            保存文件
          </button>
        </div>
        <div class="demo-result" v-if="selectedFiles.length || selectedDir">
          <p v-if="selectedFiles.length">
            <strong>选中文件:</strong> {{ selectedFiles.join(', ') }}
          </p>
          <p v-if="selectedDir">
            <strong>选中文件夹:</strong> {{ selectedDir }}
          </p>
        </div>
      </section>

      <!-- 通知 -->
      <section class="demo-section ohos-card">
        <h3>🔔 系统通知</h3>
        <div class="demo-form">
          <input 
            v-model="notificationTitle" 
            class="ohos-input" 
            placeholder="通知标题"
          />
          <input 
            v-model="notificationBody" 
            class="ohos-input" 
            placeholder="通知内容"
          />
        </div>
        <button class="ohos-btn ohos-btn-primary" @click="handleNotification">
          发送通知
        </button>
      </section>

      <!-- 剪贴板 -->
      <section class="demo-section ohos-card">
        <h3>📋 剪贴板</h3>
        <div class="demo-form">
          <div class="clipboard-row">
            <button class="ohos-btn ohos-btn-secondary" @click="handleReadClipboard">
              读取剪贴板
            </button>
            <span class="clipboard-text">{{ clipboardText || '(空)' }}</span>
          </div>
          <div class="clipboard-row">
            <input 
              v-model="clipboardInput" 
              class="ohos-input" 
              placeholder="输入要复制的内容"
            />
            <button class="ohos-btn ohos-btn-primary" @click="handleWriteClipboard">
              复制
            </button>
          </div>
        </div>
      </section>

      <!-- 窗口控制 -->
      <section class="demo-section ohos-card">
        <h3>🪟 窗口控制</h3>
        <div class="demo-form">
          <div class="title-row">
            <input 
              v-model="windowTitle" 
              class="ohos-input" 
              placeholder="窗口标题"
            />
            <button class="ohos-btn ohos-btn-secondary" @click="handleSetTitle">
              设置标题
            </button>
          </div>
        </div>
        <div class="demo-actions">
          <button class="ohos-btn ohos-btn-secondary" @click="minimizeWindow">
            最小化
          </button>
          <button class="ohos-btn ohos-btn-secondary" @click="maximizeWindow">
            最大化
          </button>
          <button class="ohos-btn ohos-btn-primary" style="background: var(--ohos-danger)" @click="closeWindow">
            关闭窗口
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.demo {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.demo-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: var(--ohos-bg-card);
  border-bottom: 1px solid #F0F0F0;
}

.back-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: var(--ohos-bg-primary);
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-btn:active {
  background: #E5E7EB;
}

.demo-header h1 {
  font-size: 18px;
  font-weight: 500;
}

.demo-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 700px;
  margin: 0 auto;
  width: 100%;
}

.demo-section h3 {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 16px;
}

.demo-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.demo-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.demo-result {
  margin-top: 16px;
  padding: 12px;
  background: var(--ohos-bg-primary);
  border-radius: 8px;
  font-size: 13px;
  word-break: break-all;
}

.demo-result p {
  margin: 4px 0;
}

.clipboard-row,
.title-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.clipboard-row .ohos-input,
.title-row .ohos-input {
  flex: 1;
}

.clipboard-text {
  flex: 1;
  padding: 12px;
  background: var(--ohos-bg-primary);
  border-radius: 8px;
  font-size: 13px;
  color: var(--ohos-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
