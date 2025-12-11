<template>
  <div class="user-history">
    <div class="page-header">
      <h3>观看历史</h3>
      <el-button type="danger" size="small" @click="clearHistory">清空历史</el-button>
    </div>
    
    <div class="history-list">
      <div class="history-item" v-for="i in 6" :key="i">
        <div class="cover">
          <img :src="`https://picsum.photos/seed/hist${i}/320/180`" alt="封面" />
          <span class="progress" :style="{ width: `${30 + i * 10}%` }"></span>
        </div>
        <div class="info">
          <h4>React 18 新特性详解 - 第{{ i }}集</h4>
          <p>观看至 {{ 30 + i * 10 }}% · {{ i }}小时前</p>
        </div>
        <el-button type="primary" size="small">继续观看</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'

function clearHistory() {
  ElMessageBox.confirm('确定要清空观看历史吗？', '提示', {
    type: 'warning',
  }).then(() => {
    ElMessage.success('已清空')
  }).catch(() => {})
}
</script>

<style scoped lang="scss">
.user-history {
  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    
    h3 {
      font-size: 18px;
      font-weight: 600;
      color: var(--color-text-primary);
    }
  }
  
  .history-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .history-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: var(--color-bg-secondary);
    border-radius: 10px;
    
    .cover {
      width: 160px;
      flex-shrink: 0;
      border-radius: 8px;
      overflow: hidden;
      position: relative;
      
      img {
        width: 100%;
        aspect-ratio: 16 / 9;
        object-fit: cover;
      }
      
      .progress {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        background: var(--color-primary);
      }
    }
    
    .info {
      flex: 1;
      
      h4 {
        font-size: 15px;
        color: var(--color-text-primary);
        margin-bottom: 8px;
      }
      
      p {
        font-size: 13px;
        color: var(--color-text-tertiary);
      }
    }
  }
}
</style>
