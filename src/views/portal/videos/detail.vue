<template>
  <div class="video-detail-page" v-loading="loading">
    <div class="page-container" v-if="video">
      <!-- 视频播放器区域 -->
      <div class="player-section">
        <div class="player-wrap">
          <div class="video-player">
            <!-- 这里可以集成真实的视频播放器 -->
            <div class="player-placeholder">
              <img :src="video.cover" :alt="video.title" />
              <div class="play-button" @click="playVideo">
                <el-icon :size="64"><VideoPlay /></el-icon>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 视频信息 -->
        <div class="video-info-section">
          <h1 class="video-title">{{ video.title }}</h1>
          <div class="video-meta">
            <span><el-icon><View /></el-icon> {{ formatCount(video.playCount) }} 播放</span>
            <span><el-icon><Clock /></el-icon> {{ video.publishedAt?.split(' ')[0] }}</span>
            <el-tag size="small">{{ video.categoryName }}</el-tag>
          </div>
          
          <div class="video-actions">
            <el-button :type="video.isLiked ? 'primary' : 'default'" @click="handleLike">
              <el-icon><Star /></el-icon>
              {{ video.isLiked ? '已点赞' : '点赞' }} {{ formatCount(video.likeCount) }}
            </el-button>
            <el-button :type="video.isCollected ? 'primary' : 'default'" @click="handleCollect">
              <el-icon><Folder /></el-icon>
              {{ video.isCollected ? '已收藏' : '收藏' }} {{ formatCount(video.collectCount) }}
            </el-button>
            <el-button @click="handleShare">
              <el-icon><Share /></el-icon>
              分享
            </el-button>
          </div>
          
          <div class="video-author">
            <el-avatar :size="48" :src="video.author.avatar" />
            <div class="author-info">
              <span class="author-name">{{ video.author.nickname }}</span>
              <span class="author-desc">优质内容创作者</span>
            </div>
            <el-button type="primary" round>关注</el-button>
          </div>
          
          <div class="video-desc">
            <h3>视频简介</h3>
            <p>{{ video.description }}</p>
            <div class="video-tags">
              <el-tag v-for="tag in video.tags" :key="tag" effect="plain" size="small">
                {{ tag }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 侧边栏：推荐视频 -->
      <div class="sidebar-section">
        <h3 class="sidebar-title">相关推荐</h3>
        <div class="recommend-list">
          <div 
            v-for="item in recommendVideos" 
            :key="item.id" 
            class="recommend-card"
            @click="$router.push(`/portal/videos/${item.id}`)"
          >
            <div class="recommend-cover">
              <img :src="item.cover" :alt="item.title" />
              <span class="duration">{{ formatDuration(item.duration) }}</span>
            </div>
            <div class="recommend-info">
              <h4>{{ item.title }}</h4>
              <span class="author">{{ item.author.nickname }}</span>
              <span class="views">{{ formatCount(item.playCount) }} 播放</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 加载失败 -->
    <el-empty v-if="!loading && !video" description="视频不存在或已下架" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { VideoPlay, View, Clock, Star, Folder, Share } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { mockService } from '@/mock'
import type { Video } from '@/types/video'

const route = useRoute()

const video = ref<Video | null>(null)
const recommendVideos = ref<Video[]>([])
const loading = ref(false)

function formatCount(count: number): string {
  if (count >= 10000) return (count / 10000).toFixed(1) + 'w'
  if (count >= 1000) return (count / 1000).toFixed(1) + 'k'
  return count.toString()
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function playVideo() {
  ElMessage.info('视频播放功能开发中...')
}

function handleLike() {
  if (video.value) {
    video.value.isLiked = !video.value.isLiked
    video.value.likeCount += video.value.isLiked ? 1 : -1
    ElMessage.success(video.value.isLiked ? '点赞成功' : '取消点赞')
  }
}

function handleCollect() {
  if (video.value) {
    video.value.isCollected = !video.value.isCollected
    video.value.collectCount += video.value.isCollected ? 1 : -1
    ElMessage.success(video.value.isCollected ? '收藏成功' : '取消收藏')
  }
}

function handleShare() {
  navigator.clipboard.writeText(window.location.href)
  ElMessage.success('链接已复制到剪贴板')
}

async function loadVideo() {
  const id = route.params.id as string
  if (!id) return
  
  loading.value = true
  try {
    const [detail, recommend] = await Promise.all([
      mockService.getVideoDetail(id),
      mockService.getRecommendVideos(6)
    ])
    video.value = detail
    recommendVideos.value = recommend.filter(v => v.id !== id)
  } catch (error) {
    console.error('加载视频失败', error)
  } finally {
    loading.value = false
  }
}

watch(() => route.params.id, loadVideo)
onMounted(loadVideo)
</script>

<style scoped lang="scss">
.video-detail-page {
  padding: 32px 0;
  min-height: 600px;
  
  .page-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px;
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 32px;
  }
}

.player-section {
  .player-wrap {
    border-radius: 12px;
    overflow: hidden;
    background: #000;
    
    .video-player {
      aspect-ratio: 16 / 9;
      
      .player-placeholder {
        width: 100%;
        height: 100%;
        position: relative;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .play-button {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.4);
          color: #fff;
          cursor: pointer;
          transition: background 0.3s;
          
          &:hover {
            background: rgba(0, 0, 0, 0.5);
          }
        }
      }
    }
  }
  
  .video-info-section {
    padding: 24px 0;
    
    .video-title {
      font-size: 22px;
      font-weight: 600;
      color: var(--color-text-primary);
      margin-bottom: 12px;
    }
    
    .video-meta {
      display: flex;
      align-items: center;
      gap: 20px;
      color: var(--color-text-secondary);
      font-size: 14px;
      margin-bottom: 20px;
      
      span {
        display: flex;
        align-items: center;
        gap: 6px;
      }
    }
    
    .video-actions {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
    }
    
    .video-author {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: var(--color-bg-primary);
      border-radius: 12px;
      margin-bottom: 24px;
      
      .author-info {
        flex: 1;
        
        .author-name {
          display: block;
          font-size: 16px;
          font-weight: 500;
          color: var(--color-text-primary);
        }
        
        .author-desc {
          font-size: 13px;
          color: var(--color-text-tertiary);
        }
      }
    }
    
    .video-desc {
      background: var(--color-bg-primary);
      border-radius: 12px;
      padding: 20px;
      
      h3 {
        font-size: 16px;
        font-weight: 500;
        color: var(--color-text-primary);
        margin-bottom: 12px;
      }
      
      p {
        font-size: 14px;
        color: var(--color-text-secondary);
        line-height: 1.8;
        margin-bottom: 16px;
      }
      
      .video-tags {
        display: flex;
        gap: 8px;
      }
    }
  }
}

.sidebar-section {
  .sidebar-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 20px;
  }
  
  .recommend-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .recommend-card {
    display: flex;
    gap: 12px;
    padding: 12px;
    background: var(--color-bg-primary);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
      transform: translateX(4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
    
    .recommend-cover {
      width: 160px;
      flex-shrink: 0;
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      
      img {
        width: 100%;
        aspect-ratio: 16 / 9;
        object-fit: cover;
      }
      
      .duration {
        position: absolute;
        bottom: 4px;
        right: 4px;
        padding: 2px 6px;
        background: rgba(0, 0, 0, 0.7);
        color: #fff;
        font-size: 11px;
        border-radius: 4px;
      }
    }
    
    .recommend-info {
      flex: 1;
      min-width: 0;
      
      h4 {
        font-size: 14px;
        font-weight: 500;
        color: var(--color-text-primary);
        margin-bottom: 8px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        line-height: 1.4;
      }
      
      .author, .views {
        display: block;
        font-size: 12px;
        color: var(--color-text-tertiary);
        margin-top: 4px;
      }
    }
  }
}

@media (max-width: 1024px) {
  .video-detail-page .page-container {
    grid-template-columns: 1fr;
  }
  
  .sidebar-section {
    .recommend-list {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
    }
  }
}

@media (max-width: 640px) {
  .sidebar-section .recommend-list {
    grid-template-columns: 1fr;
  }
  
  .video-actions {
    flex-wrap: wrap;
  }
}
</style>
