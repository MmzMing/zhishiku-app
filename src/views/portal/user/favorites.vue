<template>
  <div class="user-favorites">
    <div class="page-header">
      <h3>我的收藏</h3>
      <el-radio-group v-model="activeTab" size="small">
        <el-radio-button value="video">视频</el-radio-button>
        <el-radio-button value="blog">博客</el-radio-button>
      </el-radio-group>
    </div>
    
    <div class="favorites-list" v-if="activeTab === 'video'">
      <div class="video-item" v-for="i in 4" :key="i">
        <div class="cover">
          <img :src="`https://picsum.photos/seed/fav${i}/320/180`" alt="封面" />
        </div>
        <div class="info">
          <h4>Vue 3 完整教程 - 第{{ i }}集</h4>
          <p>收藏于 2024-12-0{{ i }}</p>
        </div>
        <el-button type="danger" size="small">取消收藏</el-button>
      </div>
    </div>
    
    <div class="favorites-list" v-else>
      <div class="blog-item" v-for="i in 4" :key="i">
        <div class="info">
          <h4>深入理解 TypeScript 类型系统 - 第{{ i }}篇</h4>
          <p>收藏于 2024-12-0{{ i }}</p>
        </div>
        <el-button type="danger" size="small">取消收藏</el-button>
      </div>
    </div>
    
    <el-empty v-if="false" description="暂无收藏" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const activeTab = ref('video')
</script>

<style scoped lang="scss">
.user-favorites {
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
  
  .favorites-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .video-item {
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
      
      img {
        width: 100%;
        aspect-ratio: 16 / 9;
        object-fit: cover;
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
  
  .blog-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: var(--color-bg-secondary);
    border-radius: 10px;
    
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
