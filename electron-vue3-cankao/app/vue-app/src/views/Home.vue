<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOhos } from '@/composables/useOhos'

const router = useRouter()
const { getSystemInfo, isOhosEnv } = useOhos()

const systemInfo = ref<any>(null)

onMounted(async () => {
  systemInfo.value = await getSystemInfo()
})

const features = [
  { icon: '📁', title: '文件操作', desc: '打开/保存文件对话框', route: '/demo' },
  { icon: '🔔', title: '系统通知', desc: '发送原生通知', route: '/demo' },
  { icon: '📋', title: '剪贴板', desc: '读写剪贴板内容', route: '/demo' },
  { icon: '🪟', title: '窗口控制', desc: '最小化/最大化/关闭', route: '/demo' },
]
</script>

<template>
  <div class="home">
    <header class="header">
      <h1>Electron + OpenHarmony + Vue3</h1>
      <p class="subtitle">使用 Vue3 开发鸿蒙桌面应用</p>
    </header>

    <section class="info-card ohos-card">
      <h3>运行环境</h3>
      <div class="info-grid">
        <div class="info-item">
          <span class="label">平台</span>
          <span class="value">{{ systemInfo?.platform || '加载中...' }}</span>
        </div>
        <div class="info-item">
          <span class="label">版本</span>
          <span class="value">{{ systemInfo?.version || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">设备类型</span>
          <span class="value">{{ systemInfo?.deviceType || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">鸿蒙环境</span>
          <span class="value" :class="{ active: isOhosEnv }">
            {{ isOhosEnv ? '✓ 是' : '✗ 否' }}
          </span>
        </div>
      </div>
    </section>

    <section class="features">
      <h3>原生能力</h3>
      <div class="feature-grid">
        <div 
          v-for="feature in features" 
          :key="feature.title"
          class="feature-card ohos-card"
          @click="router.push(feature.route)"
        >
          <span class="feature-icon">{{ feature.icon }}</span>
          <span class="feature-title">{{ feature.title }}</span>
          <span class="feature-desc">{{ feature.desc }}</span>
        </div>
      </div>
    </section>

    <footer class="footer">
      <button class="ohos-btn ohos-btn-primary" @click="router.push('/demo')">
        查看演示
      </button>
    </footer>
  </div>
</template>

<style scoped>
.home {
  height: 100vh;
  padding: 40px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
  max-width: 900px;
  margin: 0 auto;
}

.header {
  text-align: center;
}

.header h1 {
  font-size: 28px;
  font-weight: 500;
  margin-bottom: 8px;
}

.subtitle {
  color: var(--ohos-text-secondary);
  font-size: 15px;
}

.info-card h3,
.features h3 {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 16px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--ohos-bg-primary);
  border-radius: 10px;
}

.info-item .label {
  color: var(--ohos-text-secondary);
}

.info-item .value {
  font-weight: 500;
}

.info-item .value.active {
  color: var(--ohos-success);
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.feature-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.feature-card:active {
  transform: scale(0.98);
}

.feature-icon {
  font-size: 36px;
}

.feature-title {
  font-size: 15px;
  font-weight: 500;
}

.feature-desc {
  font-size: 12px;
  color: var(--ohos-text-secondary);
}

.footer {
  text-align: center;
  padding-top: 16px;
}

@media (max-width: 600px) {
  .home {
    padding: 24px;
  }
  
  .info-grid,
  .feature-grid {
    grid-template-columns: 1fr;
  }
}
</style>
