<script setup lang="ts">
import { onMounted } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { useUserStore } from '@/stores/modules/user'
import { useAppStore } from '@/stores/modules/app'

// 初始化主题
const { initTheme } = useTheme()
const userStore = useUserStore()
const appStore = useAppStore()

onMounted(() => {
  // 初始化主题
  initTheme()
  
  // 初始化用户状态
  userStore.init()
  
  // 初始化应用状态
  appStore.init()
})
</script>

<template>
  <router-view />
</template>

<style>
#app {
  min-height: 100vh;
}
</style>
