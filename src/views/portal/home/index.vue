<template>
  <div class="portal-home">
    <!-- 英雄区域 -->
    <section class="hero-section">
      <div class="hero-container">
        <div class="hero-content">
          <h1 class="hero-title">探索知识的海洋</h1>
          <p class="hero-desc">海量视频教程、技术博客，助你快速提升技能</p>
          <div class="hero-search">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索你想学习的内容..."
              size="large"
              clearable
              @keyup.enter="handleSearch"
            >
              <template #append>
                <el-button type="primary" @click="handleSearch">
                  <el-icon><Search /></el-icon>
                  搜索
                </el-button>
              </template>
            </el-input>
          </div>
          <div class="hero-tags">
            <span>热门搜索：</span>
            <el-tag 
              v-for="tag in hotTags" 
              :key="tag" 
              class="hot-tag"
              @click="searchKeyword = tag; handleSearch()"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>
        <div class="hero-stats">
          <div class="stat-item">
            <span class="stat-value">{{ stats.videos }}+</span>
            <span class="stat-label">视频教程</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.blogs }}+</span>
            <span class="stat-label">技术博客</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.users }}+</span>
            <span class="stat-label">注册用户</span>
          </div>
        </div>
      </div>
    </section>
    
    <!-- 分类导航 -->
    <section class="category-section">
      <div class="section-container">
        <div class="category-grid">
          <div 
            v-for="cat in categories" 
            :key="cat.id" 
            class="category-card"
            @click="$router.push({ path: '/portal/videos', query: { category: cat.id } })"
          >
            <div class="category-icon" :style="{ background: cat.color }">
              <el-icon :size="28"><component :is="cat.icon" /></el-icon>
            </div>
            <span class="category-name">{{ cat.name }}</span>
          </div>
        </div>
      </div>
    </section>
    
    <!-- 推荐视频 -->
    <section class="video-section">
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title">
            <el-icon><VideoPlay /></el-icon>
            推荐视频
          </h2>
          <el-link type="primary" :underline="false" @click="$router.push('/portal/videos')">
            查看更多 <el-icon><ArrowRight /></el-icon>
          </el-link>
        </div>
        
        <div class="video-grid" v-loading="videosLoading">
          <div 
            v-for="video in recommendVideos" 
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
              <div class="video-meta">
                <span><el-icon><View /></el-icon> {{ formatCount(video.playCount) }}</span>
                <span><el-icon><Star /></el-icon> {{ formatCount(video.likeCount) }}</span>
              </div>
              <div class="video-author">
                <el-avatar :size="24" :src="video.author.avatar" />
                <span>{{ video.author.nickname }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- 热门博客 -->
    <section class="blog-section">
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title">
            <el-icon><Document /></el-icon>
            热门博客
          </h2>
          <el-link type="primary" :underline="false" @click="$router.push('/portal/blogs')">
            查看更多 <el-icon><ArrowRight /></el-icon>
          </el-link>
        </div>
        
        <div class="blog-grid" v-loading="blogsLoading">
          <div 
            v-for="blog in hotBlogs" 
            :key="blog.id" 
            class="blog-card"
            @click="$router.push(`/portal/blogs/${blog.id}`)"
          >
            <div class="blog-cover" v-if="blog.cover">
              <img :src="blog.cover" :alt="blog.title" />
            </div>
            <div class="blog-content">
              <div class="blog-tags">
                <el-tag 
                  v-for="tag in blog.tags.slice(0, 2)" 
                  :key="tag" 
                  size="small"
                  effect="plain"
                >
                  {{ tag }}
                </el-tag>
              </div>
              <h3 class="blog-title">{{ blog.title }}</h3>
              <p class="blog-summary">{{ blog.summary }}</p>
              <div class="blog-footer">
                <div class="blog-author">
                  <el-avatar :size="28" :src="blog.author.avatar" />
                  <span>{{ blog.author.nickname }}</span>
                </div>
                <div class="blog-stats">
                  <span><el-icon><View /></el-icon> {{ formatCount(blog.readCount) }}</span>
                  <span><el-icon><ChatDotRound /></el-icon> {{ blog.commentCount }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- 功能特点 -->
    <section class="feature-section">
      <div class="section-container">
        <h2 class="section-title center">为什么选择我们?</h2>
        <div class="feature-grid">
          <div class="feature-card" v-for="feature in features" :key="feature.title">
            <div class="feature-icon" :style="{ background: feature.color }">
              <el-icon :size="32"><component :is="feature.icon" /></el-icon>
            </div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.desc }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Search, VideoPlay, Document, ArrowRight, View, Star, 
  ChatDotRound, Monitor, Notebook, Files, Setting,
  Trophy, Clock, Headset
} from '@element-plus/icons-vue'
import { mockService } from '@/mock'
import type { Video } from '@/types/video'
import type { Blog } from '@/types/blog'

const router = useRouter()

// 状态
const searchKeyword = ref('')
const recommendVideos = ref<Video[]>([])
const hotBlogs = ref<Blog[]>([])
const videosLoading = ref(false)
const blogsLoading = ref(false)

// 统计数据
const stats = ref({
  videos: 500,
  blogs: 1200,
  users: 10000
})

// 热门搜索标签
const hotTags = ['Vue 3', 'React', 'TypeScript', 'Node.js', 'Python']

// 分类
const categories = [
  { id: '1', name: '前端开发', icon: Monitor, color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: '2', name: '后端开发', icon: Setting, color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { id: '3', name: '数据库', icon: Files, color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { id: '4', name: '运维部署', icon: Notebook, color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
]

// 功能特点
const features = [
  { title: '海量资源', desc: '覆盖前端、后端、运维等多个领域的优质内容', icon: Files, color: '#667eea' },
  { title: '积分激励', desc: '学习获得积分，兑换更多精品课程', icon: Trophy, color: '#f5576c' },
  { title: '随时学习', desc: '支持多端访问，碎片时间高效学习', icon: Clock, color: '#43e97b' },
  { title: '互动社区', desc: '与技术大牛交流，解决学习疑惑', icon: Headset, color: '#4facfe' },
]

// 格式化时长
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 格式化数量
function formatCount(count: number): string {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + 'w'
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k'
  }
  return count.toString()
}

// 搜索
function handleSearch() {
  if (searchKeyword.value.trim()) {
    router.push({ path: '/portal/search', query: { q: searchKeyword.value } })
  }
}

// 加载数据
async function loadData() {
  videosLoading.value = true
  blogsLoading.value = true
  
  try {
    const [videos, blogs] = await Promise.all([
      mockService.getRecommendVideos(8),
      mockService.getHotBlogs(6)
    ])
    
    recommendVideos.value = videos
    hotBlogs.value = blogs
  } catch (error) {
    console.error('加载数据失败', error)
  } finally {
    videosLoading.value = false
    blogsLoading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.portal-home {
  .section-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px;
  }
  
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    
    .section-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 22px;
      font-weight: 600;
      color: var(--color-text-primary);
      
      &.center {
        justify-content: center;
        margin-bottom: 40px;
      }
    }
  }
}

// 英雄区域
.hero-section {
  background: linear-gradient(135deg, var(--color-primary) 0%, #764ba2 100%);
  padding: 80px 24px;
  
  .hero-container {
    max-width: 1200px;
    margin: 0 auto;
    text-align: center;
    color: #fff;
  }
  
  .hero-title {
    font-size: 48px;
    font-weight: 700;
    margin-bottom: 16px;
  }
  
  .hero-desc {
    font-size: 18px;
    opacity: 0.9;
    margin-bottom: 32px;
  }
  
  .hero-search {
    max-width: 600px;
    margin: 0 auto 24px;
    
    :deep(.el-input-group__append) {
      background: var(--color-primary);
      border: none;
      
      .el-button {
        color: #fff;
      }
    }
  }
  
  .hero-tags {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    font-size: 14px;
    
    .hot-tag {
      cursor: pointer;
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: #fff;
      
      &:hover {
        background: rgba(255, 255, 255, 0.3);
      }
    }
  }
  
  .hero-stats {
    display: flex;
    justify-content: center;
    gap: 64px;
    margin-top: 48px;
    
    .stat-item {
      text-align: center;
      
      .stat-value {
        display: block;
        font-size: 36px;
        font-weight: 700;
      }
      
      .stat-label {
        font-size: 14px;
        opacity: 0.8;
      }
    }
  }
}

// 分类区域
.category-section {
  padding: 40px 24px;
  background: var(--color-bg-primary);
  
  .category-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
  
  .category-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 24px;
    background: var(--color-bg-secondary);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    }
    
    .category-icon {
      width: 60px;
      height: 60px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }
    
    .category-name {
      font-size: 15px;
      font-weight: 500;
      color: var(--color-text-primary);
    }
  }
}

// 视频区域
.video-section {
  padding: 48px 24px;
  
  .video-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
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
        margin-bottom: 10px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        line-height: 1.4;
        height: 42px;
      }
      
      .video-meta {
        display: flex;
        gap: 16px;
        font-size: 13px;
        color: var(--color-text-tertiary);
        margin-bottom: 12px;
        
        span {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }
      
      .video-author {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: var(--color-text-secondary);
      }
    }
  }
}

// 博客区域
.blog-section {
  padding: 48px 24px;
  background: var(--color-bg-primary);
  
  .blog-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
  
  .blog-card {
    background: var(--color-bg-secondary);
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
    }
    
    .blog-cover {
      aspect-ratio: 16 / 9;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    
    .blog-content {
      padding: 20px;
      
      .blog-tags {
        display: flex;
        gap: 8px;
        margin-bottom: 12px;
      }
      
      .blog-title {
        font-size: 17px;
        font-weight: 600;
        color: var(--color-text-primary);
        margin-bottom: 10px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        line-height: 1.4;
      }
      
      .blog-summary {
        font-size: 14px;
        color: var(--color-text-secondary);
        margin-bottom: 16px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        line-height: 1.6;
      }
      
      .blog-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        
        .blog-author {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--color-text-secondary);
        }
        
        .blog-stats {
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
}

// 功能特点
.feature-section {
  padding: 64px 24px;
  
  .feature-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }
  
  .feature-card {
    text-align: center;
    padding: 32px 24px;
    background: var(--color-bg-primary);
    border-radius: 16px;
    transition: all 0.3s;
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
    }
    
    .feature-icon {
      width: 72px;
      height: 72px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      color: #fff;
    }
    
    h3 {
      font-size: 18px;
      font-weight: 600;
      color: var(--color-text-primary);
      margin-bottom: 10px;
    }
    
    p {
      font-size: 14px;
      color: var(--color-text-secondary);
      line-height: 1.6;
    }
  }
}

// 响应式
@media (max-width: 1024px) {
  .video-section .video-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .blog-section .blog-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .feature-section .feature-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: 48px 16px;
    
    .hero-title {
      font-size: 28px;
    }
    
    .hero-desc {
      font-size: 15px;
    }
    
    .hero-stats {
      gap: 32px;
      
      .stat-value {
        font-size: 24px;
      }
    }
  }
  
  .category-section .category-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .video-section .video-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .blog-section .blog-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .video-section .video-grid,
  .feature-section .feature-grid {
    grid-template-columns: 1fr;
  }
}
</style>
