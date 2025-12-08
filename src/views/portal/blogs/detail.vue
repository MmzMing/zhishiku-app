<template>
  <div class="blog-detail-page" v-loading="loading">
    <div class="page-container" v-if="blog">
      <!-- 文章内容 -->
      <article class="article-section">
        <header class="article-header">
          <div class="article-tags">
            <el-tag v-for="tag in blog.tags" :key="tag" effect="plain" size="small">{{ tag }}</el-tag>
            <el-tag v-if="blog.isOriginal" type="success" size="small">原创</el-tag>
          </div>
          <h1 class="article-title">{{ blog.title }}</h1>
          <div class="article-meta">
            <div class="author-info">
              <el-avatar :size="40" :src="blog.author.avatar" />
              <div class="info">
                <span class="author-name">{{ blog.author.nickname }}</span>
                <span class="publish-time">发布于 {{ blog.publishedAt?.split(' ')[0] }} · {{ blog.readTime }} 分钟阅读</span>
              </div>
            </div>
            <div class="article-stats">
              <span><el-icon><View /></el-icon> {{ blog.readCount }}</span>
              <span><el-icon><Star /></el-icon> {{ blog.likeCount }}</span>
            </div>
          </div>
        </header>
        
        <div class="article-cover" v-if="blog.cover">
          <img :src="blog.cover" :alt="blog.title" />
        </div>
        
        <div class="article-content markdown-body" v-html="blog.contentHtml || formatContent(blog.content)">
        </div>
        
        <footer class="article-footer">
          <div class="article-actions">
            <el-button 
              :type="blog.isLiked ? 'primary' : 'default'" 
              size="large"
              @click="handleLike"
            >
              <el-icon><Star /></el-icon>
              {{ blog.isLiked ? '已点赞' : '点赞' }} {{ blog.likeCount }}
            </el-button>
            <el-button 
              :type="blog.isCollected ? 'primary' : 'default'" 
              size="large"
              @click="handleCollect"
            >
              <el-icon><Folder /></el-icon>
              {{ blog.isCollected ? '已收藏' : '收藏' }} {{ blog.collectCount }}
            </el-button>
            <el-button size="large" @click="handleShare">
              <el-icon><Share /></el-icon>
              分享
            </el-button>
          </div>
          
          <div class="author-card">
            <el-avatar :size="64" :src="blog.author.avatar" />
            <div class="author-detail">
              <span class="name">{{ blog.author.nickname }}</span>
              <span class="desc">优质内容创作者</span>
            </div>
            <el-button type="primary" round>关注作者</el-button>
          </div>
        </footer>
      </article>
      
      <!-- 侧边栏 -->
      <aside class="sidebar-section">
        <div class="toc-card">
          <h3>目录</h3>
          <div class="toc-content">
            <div class="toc-item" v-for="i in 5" :key="i">
              {{ i }}. 第{{ i }}章节标题
            </div>
          </div>
        </div>
        
        <div class="recommend-card">
          <h3>相关推荐</h3>
          <div class="recommend-list">
            <div 
              v-for="item in recommendBlogs" 
              :key="item.id" 
              class="recommend-item"
              @click="$router.push(`/portal/blogs/${item.id}`)"
            >
              <span class="title">{{ item.title }}</span>
              <span class="views">{{ formatCount(item.readCount) }} 阅读</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
    
    <el-empty v-if="!loading && !blog" description="博客不存在或已下架" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { View, Star, Folder, Share } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { mockService } from '@/mock'
import type { Blog } from '@/types/blog'

const route = useRoute()

const blog = ref<Blog | null>(null)
const recommendBlogs = ref<Blog[]>([])
const loading = ref(false)

function formatCount(count: number): string {
  if (count >= 10000) return (count / 10000).toFixed(1) + 'w'
  if (count >= 1000) return (count / 1000).toFixed(1) + 'k'
  return count.toString()
}

function formatContent(content: string): string {
  return content
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\n/g, '<br/>')
}

function handleLike() {
  if (blog.value) {
    blog.value.isLiked = !blog.value.isLiked
    blog.value.likeCount += blog.value.isLiked ? 1 : -1
    ElMessage.success(blog.value.isLiked ? '点赞成功' : '取消点赞')
  }
}

function handleCollect() {
  if (blog.value) {
    blog.value.isCollected = !blog.value.isCollected
    blog.value.collectCount += blog.value.isCollected ? 1 : -1
    ElMessage.success(blog.value.isCollected ? '收藏成功' : '取消收藏')
  }
}

function handleShare() {
  navigator.clipboard.writeText(window.location.href)
  ElMessage.success('链接已复制到剪贴板')
}

async function loadBlog() {
  const id = route.params.id as string
  if (!id) return
  
  loading.value = true
  try {
    const [detail, recommend] = await Promise.all([
      mockService.getBlogDetail(id),
      mockService.getHotBlogs(5)
    ])
    blog.value = detail
    recommendBlogs.value = recommend.filter(b => b.id !== id)
  } catch (error) {
    console.error('加载博客失败', error)
  } finally {
    loading.value = false
  }
}

watch(() => route.params.id, loadBlog)
onMounted(loadBlog)
</script>

<style scoped lang="scss">
.blog-detail-page {
  padding: 32px 0;
  min-height: 600px;
  
  .page-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 32px;
  }
}

.article-section {
  background: var(--color-bg-primary);
  border-radius: 12px;
  padding: 40px;
  
  .article-header {
    margin-bottom: 32px;
    
    .article-tags {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }
    
    .article-title {
      font-size: 28px;
      font-weight: 700;
      color: var(--color-text-primary);
      line-height: 1.4;
      margin-bottom: 20px;
    }
    
    .article-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      
      .author-info {
        display: flex;
        align-items: center;
        gap: 12px;
        
        .info {
          .author-name {
            display: block;
            font-size: 15px;
            font-weight: 500;
            color: var(--color-text-primary);
          }
          
          .publish-time {
            font-size: 13px;
            color: var(--color-text-tertiary);
          }
        }
      }
      
      .article-stats {
        display: flex;
        gap: 20px;
        font-size: 14px;
        color: var(--color-text-tertiary);
        
        span {
          display: flex;
          align-items: center;
          gap: 6px;
        }
      }
    }
  }
  
  .article-cover {
    margin-bottom: 32px;
    border-radius: 8px;
    overflow: hidden;
    
    img {
      width: 100%;
      max-height: 400px;
      object-fit: cover;
    }
  }
  
  .article-content {
    font-size: 16px;
    line-height: 1.8;
    color: var(--color-text-primary);
    
    :deep(h1), :deep(h2), :deep(h3) {
      margin: 24px 0 16px;
      font-weight: 600;
    }
    
    :deep(h1) { font-size: 24px; }
    :deep(h2) { font-size: 20px; }
    :deep(h3) { font-size: 18px; }
    
    :deep(p) {
      margin-bottom: 16px;
    }
  }
  
  .article-footer {
    margin-top: 40px;
    padding-top: 32px;
    border-top: 1px solid var(--color-border);
    
    .article-actions {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-bottom: 32px;
    }
    
    .author-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 24px;
      background: var(--color-bg-secondary);
      border-radius: 12px;
      
      .author-detail {
        flex: 1;
        
        .name {
          display: block;
          font-size: 18px;
          font-weight: 600;
          color: var(--color-text-primary);
        }
        
        .desc {
          font-size: 14px;
          color: var(--color-text-tertiary);
        }
      }
    }
  }
}

.sidebar-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
  
  .toc-card, .recommend-card {
    background: var(--color-bg-primary);
    border-radius: 12px;
    padding: 20px;
    
    h3 {
      font-size: 16px;
      font-weight: 600;
      color: var(--color-text-primary);
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--color-border);
    }
  }
  
  .toc-item {
    padding: 8px 0;
    font-size: 14px;
    color: var(--color-text-secondary);
    cursor: pointer;
    
    &:hover {
      color: var(--color-primary);
    }
  }
  
  .recommend-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 12px 0;
    border-bottom: 1px solid var(--color-border);
    cursor: pointer;
    
    &:last-child {
      border-bottom: none;
    }
    
    &:hover .title {
      color: var(--color-primary);
    }
    
    .title {
      font-size: 14px;
      color: var(--color-text-primary);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      transition: color 0.3s;
    }
    
    .views {
      font-size: 12px;
      color: var(--color-text-tertiary);
    }
  }
}

@media (max-width: 1024px) {
  .blog-detail-page .page-container {
    grid-template-columns: 1fr;
  }
  
  .sidebar-section {
    display: none;
  }
}

@media (max-width: 640px) {
  .article-section {
    padding: 24px 16px;
    
    .article-header .article-title {
      font-size: 22px;
    }
    
    .article-footer .article-actions {
      flex-wrap: wrap;
    }
  }
}
</style>
