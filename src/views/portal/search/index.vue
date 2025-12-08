<template>
  <div class="search-page">
    <div class="page-container">
      <div class="search-header">
        <el-input
          v-model="keyword"
          placeholder="搜索视频、博客..."
          size="large"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
          </template>
        </el-input>
      </div>
      
      <div class="search-filter">
        <el-radio-group v-model="searchType">
          <el-radio-button value="all">全部</el-radio-button>
          <el-radio-button value="video">视频</el-radio-button>
          <el-radio-button value="blog">博客</el-radio-button>
        </el-radio-group>
        
        <span class="result-count">共找到 {{ total }} 条结果</span>
      </div>
      
      <div class="search-results" v-loading="loading">
        <!-- 视频结果 -->
        <template v-if="searchType !== 'blog'">
          <div 
            v-for="video in videos" 
            :key="video.id" 
            class="result-card video"
            @click="$router.push(`/portal/videos/${video.id}`)"
          >
            <div class="result-cover">
              <img :src="video.cover" :alt="video.title" />
              <span class="type-tag">视频</span>
            </div>
            <div class="result-info">
              <h3>{{ video.title }}</h3>
              <p>{{ video.description }}</p>
              <div class="result-meta">
                <span>{{ video.author.nickname }}</span>
                <span>{{ formatCount(video.playCount) }} 播放</span>
              </div>
            </div>
          </div>
        </template>
        
        <!-- 博客结果 -->
        <template v-if="searchType !== 'video'">
          <div 
            v-for="blog in blogs" 
            :key="blog.id" 
            class="result-card blog"
            @click="$router.push(`/portal/blogs/${blog.id}`)"
          >
            <div class="result-cover" v-if="blog.cover">
              <img :src="blog.cover" :alt="blog.title" />
              <span class="type-tag">博客</span>
            </div>
            <div class="result-info">
              <h3>{{ blog.title }}</h3>
              <p>{{ blog.summary }}</p>
              <div class="result-meta">
                <span>{{ blog.author.nickname }}</span>
                <span>{{ formatCount(blog.readCount) }} 阅读</span>
              </div>
            </div>
          </div>
        </template>
      </div>
      
      <el-empty v-if="!loading && total === 0" description="未找到相关内容" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { mockService } from '@/mock'
import type { Video } from '@/types/video'
import type { Blog } from '@/types/blog'

const route = useRoute()

const keyword = ref('')
const searchType = ref('all')
const loading = ref(false)
const videos = ref<Video[]>([])
const blogs = ref<Blog[]>([])

const total = computed(() => {
  if (searchType.value === 'video') return videos.value.length
  if (searchType.value === 'blog') return blogs.value.length
  return videos.value.length + blogs.value.length
})

function formatCount(count: number): string {
  if (count >= 10000) return (count / 10000).toFixed(1) + 'w'
  if (count >= 1000) return (count / 1000).toFixed(1) + 'k'
  return count.toString()
}

async function handleSearch() {
  if (!keyword.value.trim()) return
  
  loading.value = true
  try {
    const [videoRes, blogRes] = await Promise.all([
      mockService.getVideoList({ pageNum: 1, pageSize: 10, keyword: keyword.value }),
      mockService.getBlogList({ pageNum: 1, pageSize: 10, keyword: keyword.value }),
    ])
    videos.value = videoRes.list
    blogs.value = blogRes.list
  } catch (error) {
    console.error('搜索失败', error)
  } finally {
    loading.value = false
  }
}

watch(() => route.query.q, (q) => {
  if (q) {
    keyword.value = q as string
    handleSearch()
  }
}, { immediate: true })

onMounted(() => {
  if (route.query.q) {
    keyword.value = route.query.q as string
    handleSearch()
  }
})
</script>

<style scoped lang="scss">
.search-page {
  padding: 32px 0;
  
  .page-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 24px;
  }
}

.search-header {
  margin-bottom: 24px;
}

.search-filter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  
  .result-count {
    font-size: 14px;
    color: var(--color-text-secondary);
  }
}

.search-results {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 300px;
}

.result-card {
  display: flex;
  gap: 20px;
  padding: 20px;
  background: var(--color-bg-primary);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }
  
  .result-cover {
    width: 200px;
    flex-shrink: 0;
    border-radius: 8px;
    overflow: hidden;
    position: relative;
    
    img {
      width: 100%;
      aspect-ratio: 16 / 9;
      object-fit: cover;
    }
    
    .type-tag {
      position: absolute;
      top: 8px;
      left: 8px;
      padding: 2px 8px;
      background: var(--color-primary);
      color: #fff;
      font-size: 12px;
      border-radius: 4px;
    }
  }
  
  .result-info {
    flex: 1;
    min-width: 0;
    
    h3 {
      font-size: 18px;
      font-weight: 600;
      color: var(--color-text-primary);
      margin-bottom: 10px;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    p {
      font-size: 14px;
      color: var(--color-text-secondary);
      line-height: 1.6;
      margin-bottom: 16px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .result-meta {
      display: flex;
      gap: 20px;
      font-size: 13px;
      color: var(--color-text-tertiary);
    }
  }
}

@media (max-width: 640px) {
  .result-card {
    flex-direction: column;
    
    .result-cover {
      width: 100%;
    }
  }
}
</style>
