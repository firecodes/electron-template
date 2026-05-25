<script setup lang="ts">
import { onMounted } from 'vue'
import { useOhos } from './composables/useOhos'

const { setWindowTitle } = useOhos()

onMounted(() => {
  setWindowTitle('Electron OpenHarmony Vue3')
})
</script>

<template>
  <div class="app-container">
    <router-view />
  </div>
</template>

<style scoped>
.app-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>
