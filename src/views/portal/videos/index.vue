<template>
  <div class="portal-videos">
    <div class="page-container">
      <!-- 筛选区域 -->
      <div class="filter-section">
        <div class="filter-tabs">
          <span 
            v-for="cat in categories" 
            :key="cat.id"
            class="filter-tab"
            :class="{ active: currentCategory === cat.id }"
            @click="currentCategory = cat.id"
          >
            {{ cat.name }}
          </span>
        </div>
        
        <div class="filter-sort">
          <el-select v-model="sortBy" placeholder="排序方式" style="width: 140px">
            <el-option label="最新发布" value="newest" />
            <el-option label="最多播放" value="most_played" />
            <el-option label="最多点赞" value="popular" />
          </el-select>
        </div>
      </div>
      
      <!-- 视频列表 -->
      <div class="video-list" v-loading="loading">
        <div 
          v-for="video in videos" 
          :key="video.id" 
          class="video-card"
          @click="$router.push(`/portal/videos/${video.id}`)"
        >
          <div class="video-cover">
            <img :src="video.cover" :alt="video.title" />
            <span class="video-duration">{{ formatDuration(video.duration) }}</span>
            <div class="video-play-mask">
              <el-icon :size="48"><VideoPlay /></el-icon>
            </div>
          </div>
          <div class="video-info">
            <h3 class="video-title">{{ video.title }}</h3>
            <p class="video-desc">{{ video.description }}</p>
            <div class="video-meta">
              <div class="video-author">
                <el-avatar :size="28" :src="video.author.avatar" />
                <span>{{ video.author.nickname }}</span>
              </div>
              <div class="video-stats">
                <span><el-icon><View /></el-icon> {{ formatCount(video.playCount) }}</span>
                <span><el-icon><Star /></el-icon> {{ formatCount(video.likeCount) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 空状态 -->
      <el-empty v-if="!loading && videos.length === 0" description="暂无视频" />
      
      <!-- 分页 -->
      <div class="pagination-wrap" v-if="total > pageSize">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          background
          @current-change="loadVideos"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { VideoPlay, View, Star } from '@element-plus/icons-vue'
import { mockService } from '@/mock'
import type { Video } from '@/types/video'

const route = useRoute()

// 分类
const categories = [
  { id: '', name: '全部' },
  { id: 'cat-1', name: '前端开发' },
  { id: 'cat-2', name: '后端开发' },
  { id: 'cat-3', name: '数据库' },
  { id: 'cat-4', name: '运维部署' },
]

// 状态
const videos = ref<Video[]>([])
const loading = ref(false)
const currentCategory = ref('')
const sortBy = ref('newest')
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)

// 格式化时长
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 格式化数量
function formatCount(count: number): string {
  if (count >= 10000) return (count / 10000).toFixed(1) + 'w'
  if (count >= 1000) return (count / 1000).toFixed(1) + 'k'
  return count.toString()
}

// 加载视频
async function loadVideos() {
  loading.value = true
  try {
    const result = await mockService.getVideoList({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      categoryId: currentCategory.value || undefined,
    })
    videos.value = result.list
    total.value = result.total
  } catch (error) {
    console.error('加载视频失败', error)
  } finally {
    loading.value = false
  }
}

// 监听筛选条件变化
watch([currentCategory, sortBy], () => {
  currentPage.value = 1
  loadVideos()
})

onMounted(() => {
  // 从URL获取分类参数
  if (route.query.category) {
    currentCategory.value = route.query.category as string
  }
  loadVideos()
})
</script>

<style scoped lang="scss">
.portal-videos {
  padding: 32px 0;
  
  .page-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px;
  }
}

.filter-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  padding: 20px 24px;
  background: var(--color-bg-primary);
  border-radius: 12px;
  
  .filter-tabs {
    display: flex;
    gap: 12px;
    
    .filter-tab {
      padding: 8px 20px;
      border-radius: 20px;
      font-size: 14px;
      color: var(--color-text-secondary);
      cursor: pointer;
      transition: all 0.3s;
      
      &:hover {
        background: var(--color-bg-secondary);
      }
      
      &.active {
        background: var(--color-primary);
        color: #fff;
      }
    }
  }
}

.video-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  min-height: 400px;
}

.video-card {
  background: var(--color-bg-primary);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
    
    .video-cover .video-play-mask {
      opacity: 1;
    }
  }
  
  .video-cover {
    position: relative;
    aspect-ratio: 16 / 9;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .video-duration {
      position: absolute;
      bottom: 8px;
      right: 8px;
      padding: 2px 8px;
      background: rgba(0, 0, 0, 0.7);
      color: #fff;
      font-size: 12px;
      border-radius: 4px;
    }
    
    .video-play-mask {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      opacity: 0;
      transition: opacity 0.3s;
    }
  }
  
  .video-info {
    padding: 16px;
    
    .video-title {
      font-size: 15px;
      font-weight: 500;
      color: var(--color-text-primary);
      margin-bottom: 8px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      line-height: 1.4;
    }
    
    .video-desc {
      font-size: 13px;
      color: var(--color-text-tertiary);
      margin-bottom: 12px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .video-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      
      .video-author {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: var(--color-text-secondary);
      }
      
      .video-stats {
        display: flex;
        gap: 12px;
        font-size: 12px;
        color: var(--color-text-tertiary);
        
        span {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }
    }
  }
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

@media (max-width: 1200px) {
  .video-list {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .filter-section {
    flex-direction: column;
    gap: 16px;
    
    .filter-tabs {
      flex-wrap: wrap;
    }
  }
  
  .video-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .video-list {
    grid-template-columns: 1fr;
  }
}
</style>
