<template>
  <div class="home-page">
    <div class="welcome-section">
      <h1 class="welcome-title">欢迎来到知识库平台</h1>
      <p class="welcome-desc">一站式视频、博客、学习资源管理平台</p>
    </div>
    
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card">
          <el-icon :size="40" class="stat-icon primary">
            <VideoPlay />
          </el-icon>
          <div class="stat-info">
            <span class="stat-value">{{ stats.videos }}</span>
            <span class="stat-label">视频数量</span>
          </div>
        </div>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card">
          <el-icon :size="40" class="stat-icon success">
            <Document />
          </el-icon>
          <div class="stat-info">
            <span class="stat-value">{{ stats.blogs }}</span>
            <span class="stat-label">博客文章</span>
          </div>
        </div>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card">
          <el-icon :size="40" class="stat-icon warning">
            <User />
          </el-icon>
          <div class="stat-info">
            <span class="stat-value">{{ stats.users }}</span>
            <span class="stat-label">注册用户</span>
          </div>
        </div>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card">
          <el-icon :size="40" class="stat-icon danger">
            <Medal />
          </el-icon>
          <div class="stat-info">
            <span class="stat-value">{{ stats.points }}</span>
            <span class="stat-label">总积分</span>
          </div>
        </div>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" class="content-row">
      <el-col :xs="24" :md="16">
        <el-card class="content-card">
          <template #header>
            <div class="card-header">
              <span>最新视频</span>
              <el-button text type="primary">查看更多</el-button>
            </div>
          </template>
          
          <el-empty v-if="!latestVideos.length" description="暂无视频" />
          <div v-else class="video-grid">
            <div 
              v-for="video in latestVideos" 
              :key="video.id"
              class="video-item"
            >
              <div class="video-cover">
                <img :src="video.cover" :alt="video.title" />
                <span class="video-duration">{{ video.duration }}</span>
              </div>
              <h4 class="video-title">{{ video.title }}</h4>
              <span class="video-views">{{ video.views }} 次观看</span>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :md="8">
        <el-card class="content-card">
          <template #header>
            <div class="card-header">
              <span>热门博客</span>
              <el-button text type="primary">查看更多</el-button>
            </div>
          </template>
          
          <el-empty v-if="!hotBlogs.length" description="暂无博客" />
          <div v-else class="blog-list">
            <div 
              v-for="blog in hotBlogs" 
              :key="blog.id"
              class="blog-item"
            >
              <h4 class="blog-title">{{ blog.title }}</h4>
              <div class="blog-meta">
                <span>{{ blog.author }}</span>
                <span>{{ blog.date }}</span>
              </div>
            </div>
          </div>
        </el-card>
        
        <el-card class="content-card quick-links">
          <template #header>
            <span>快捷入口</span>
          </template>
          
          <div class="link-grid">
            <div class="link-item">
              <el-icon :size="24"><VideoPlay /></el-icon>
              <span>上传视频</span>
            </div>
            <div class="link-item">
              <el-icon :size="24"><Edit /></el-icon>
              <span>写博客</span>
            </div>
            <div class="link-item">
              <el-icon :size="24"><Medal /></el-icon>
              <span>积分商城</span>
            </div>
            <div class="link-item">
              <el-icon :size="24"><Setting /></el-icon>
              <span>系统设置</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { VideoPlay, Document, User, Medal, Edit, Setting } from '@element-plus/icons-vue'

// 统计数据
const stats = reactive({
  videos: 128,
  blogs: 256,
  users: 1024,
  points: 50000
})

// 最新视频
const latestVideos = ref([
  {
    id: 1,
    title: 'Vue 3 完整教程',
    cover: 'https://picsum.photos/300/200?random=1',
    duration: '45:30',
    views: 1234
  },
  {
    id: 2,
    title: 'TypeScript 入门指南',
    cover: 'https://picsum.photos/300/200?random=2',
    duration: '32:15',
    views: 987
  },
  {
    id: 3,
    title: 'Vite 构建工具详解',
    cover: 'https://picsum.photos/300/200?random=3',
    duration: '28:45',
    views: 654
  }
])

// 热门博客
const hotBlogs = ref([
  {
    id: 1,
    title: '如何优化前端性能',
    author: '张三',
    date: '2024-01-15'
  },
  {
    id: 2,
    title: 'Vue 3 组合式 API 最佳实践',
    author: '李四',
    date: '2024-01-14'
  },
  {
    id: 3,
    title: 'CSS Grid 布局完全指南',
    author: '王五',
    date: '2024-01-13'
  },
  {
    id: 4,
    title: '前端工程化实战经验',
    author: '赵六',
    date: '2024-01-12'
  }
])
</script>

<style scoped lang="scss">
.home-page {
  .welcome-section {
    text-align: center;
    padding: 40px 20px;
    background: linear-gradient(135deg, var(--el-color-primary-light-3), var(--el-color-primary));
    border-radius: 12px;
    margin-bottom: 24px;
    
    .welcome-title {
      font-size: 32px;
      font-weight: 600;
      color: #fff;
      margin-bottom: 12px;
    }
    
    .welcome-desc {
      font-size: 16px;
      color: rgba(255, 255, 255, 0.9);
    }
  }
  
  .stats-row {
    margin-bottom: 24px;
    
    .stat-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 24px;
      background-color: var(--color-bg-primary);
      border-radius: 12px;
      box-shadow: var(--shadow-sm);
      transition: transform 0.2s, box-shadow 0.2s;
      
      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-md);
      }
      
      .stat-icon {
        padding: 12px;
        border-radius: 12px;
        
        &.primary {
          background-color: var(--el-color-primary-light-9);
          color: var(--el-color-primary);
        }
        
        &.success {
          background-color: var(--el-color-success-light-9);
          color: var(--el-color-success);
        }
        
        &.warning {
          background-color: var(--el-color-warning-light-9);
          color: var(--el-color-warning);
        }
        
        &.danger {
          background-color: var(--el-color-danger-light-9);
          color: var(--el-color-danger);
        }
      }
      
      .stat-info {
        display: flex;
        flex-direction: column;
        
        .stat-value {
          font-size: 28px;
          font-weight: 600;
          color: var(--color-text-primary);
        }
        
        .stat-label {
          font-size: 14px;
          color: var(--color-text-secondary);
        }
      }
    }
  }
  
  .content-row {
    .content-card {
      margin-bottom: 20px;
      
      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
    }
    
    .video-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
      
      .video-item {
        cursor: pointer;
        
        .video-cover {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          
          img {
            width: 100%;
            aspect-ratio: 16/9;
            object-fit: cover;
          }
          
          .video-duration {
            position: absolute;
            right: 8px;
            bottom: 8px;
            padding: 2px 6px;
            background-color: rgba(0, 0, 0, 0.7);
            color: #fff;
            font-size: 12px;
            border-radius: 4px;
          }
        }
        
        .video-title {
          margin: 8px 0 4px;
          font-size: 14px;
          font-weight: 500;
          color: var(--color-text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .video-views {
          font-size: 12px;
          color: var(--color-text-secondary);
        }
      }
    }
    
    .blog-list {
      .blog-item {
        padding: 12px 0;
        border-bottom: 1px solid var(--color-border-light);
        cursor: pointer;
        
        &:last-child {
          border-bottom: none;
        }
        
        &:hover .blog-title {
          color: var(--el-color-primary);
        }
        
        .blog-title {
          font-size: 14px;
          font-weight: 500;
          color: var(--color-text-primary);
          margin-bottom: 6px;
          transition: color 0.2s;
        }
        
        .blog-meta {
          display: flex;
          gap: 12px;
          font-size: 12px;
          color: var(--color-text-secondary);
        }
      }
    }
    
    .quick-links {
      .link-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        
        .link-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px;
          background-color: var(--color-bg-secondary);
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.2s;
          
          &:hover {
            background-color: var(--el-color-primary-light-9);
            color: var(--el-color-primary);
          }
          
          span {
            font-size: 13px;
          }
        }
      }
    }
  }
}
</style>
