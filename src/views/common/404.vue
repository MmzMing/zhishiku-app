<template>
  <div class="not-found-page">
    <div class="content">
      <h1 class="error-code">404</h1>
      <h2 class="error-title">页面未找到</h2>
      <p class="error-desc">抱歉，您访问的页面不存在或已被移除</p>
      
      <div class="actions">
        <el-button type="primary" size="large" @click="goHome">
          返回首页
        </el-button>
        <el-button size="large" @click="goBack">
          返回上一页
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/')
}

function goBack() {
  router.go(-1)
}
</script>

<style scoped lang="scss">
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-secondary);
  
  .content {
    text-align: center;
    padding: 40px;
    
    .error-code {
      font-size: 120px;
      font-weight: 700;
      color: var(--el-color-primary);
      line-height: 1;
      margin-bottom: 24px;
    }
    
    .error-title {
      font-size: 28px;
      font-weight: 600;
      color: var(--color-text-primary);
      margin-bottom: 16px;
    }
    
    .error-desc {
      font-size: 16px;
      color: var(--color-text-secondary);
      margin-bottom: 32px;
    }
    
    .actions {
      display: flex;
      justify-content: center;
      gap: 16px;
    }
  }
}
</style>
