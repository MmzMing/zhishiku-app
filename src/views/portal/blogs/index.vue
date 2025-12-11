<template>
  <div class="portal-blogs">
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
            <el-option label="最多阅读" value="most_read" />
            <el-option label="最多点赞" value="popular" />
          </el-select>
        </div>
      </div>
      
      <!-- 博客列表 -->
      <div class="blog-list" v-loading="loading">
        <div 
          v-for="blog in blogs" 
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
                v-for="tag in blog.tags.slice(0, 3)" 
                :key="tag" 
                size="small"
                effect="plain"
              >
                {{ tag }}
              </el-tag>
              <el-tag v-if="blog.isTop" size="small" type="danger">置顶</el-tag>
            </div>
            <h3 class="blog-title">{{ blog.title }}</h3>
            <p class="blog-summary">{{ blog.summary }}</p>
            <div class="blog-footer">
              <div class="blog-author">
                <el-avatar :size="32" :src="blog.author.avatar" />
                <div class="author-info">
                  <span class="author-name">{{ blog.author.nickname }}</span>
                  <span class="publish-time">{{ blog.publishedAt?.split(' ')[0] }}</span>
                </div>
              </div>
              <div class="blog-stats">
                <span><el-icon><View /></el-icon> {{ formatCount(blog.readCount) }}</span>
                <span><el-icon><Star /></el-icon> {{ formatCount(blog.likeCount) }}</span>
                <span><el-icon><ChatDotRound /></el-icon> {{ blog.commentCount }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 空状态 -->
      <el-empty v-if="!loading && blogs.length === 0" description="暂无博客" />
      
      <!-- 分页 -->
      <div class="pagination-wrap" v-if="total > pageSize">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          background
          @current-change="loadBlogs"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { View, Star, ChatDotRound } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { blogApi } from '@/services/api'
import type { Blog } from '@/types/blog'

const route = useRoute()

// 分类
const categories = [
  { id: '', name: '全部' },
  { id: 'cat-1', name: '前端开发' },
  { id: 'cat-2', name: '后端开发' },
  { id: 'cat-3', name: 'DevOps' },
  { id: 'cat-4', name: '数据库' },
  { id: 'cat-5', name: '架构设计' },
]

// 状态
const blogs = ref<Blog[]>([])
const loading = ref(false)
const currentCategory = ref('')
const sortBy = ref('newest')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

function formatCount(count: number): string {
  if (count >= 10000) return (count / 10000).toFixed(1) + 'w'
  if (count >= 1000) return (count / 1000).toFixed(1) + 'k'
  return count.toString()
}

async function loadBlogs() {
  loading.value = true
  try {
    // 使用API服务层调用，便于后续切换到真实API
    const result = await blogApi.getBlogList({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      categoryId: currentCategory.value || undefined,
      sortBy: sortBy.value
    })
    blogs.value = result.list
    total.value = result.total
  } catch (error) {
    console.error('加载博客失败', error)
    ElMessage.error('加载博客列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

watch([currentCategory, sortBy], () => {
  currentPage.value = 1
  loadBlogs()
})

onMounted(() => {
  if (route.query.category) {
    currentCategory.value = route.query.category as string
  }
  loadBlogs()
})
</script>

<style scoped lang="scss">
.portal-blogs {
  padding: 32px 0;
  
  .page-container {
    max-width: 1000px;
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
    gap: 8px;
    flex-wrap: wrap;
    
    .filter-tab {
      padding: 8px 16px;
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

.blog-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 400px;
}

.blog-card {
  display: flex;
  gap: 24px;
  padding: 24px;
  background: var(--color-bg-primary);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }
  
  .blog-cover {
    width: 240px;
    flex-shrink: 0;
    border-radius: 8px;
    overflow: hidden;
    
    img {
      width: 100%;
      height: 160px;
      object-fit: cover;
    }
  }
  
  .blog-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    
    .blog-tags {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }
    
    .blog-title {
      font-size: 20px;
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
      flex: 1;
      font-size: 14px;
      color: var(--color-text-secondary);
      line-height: 1.7;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin-bottom: 16px;
    }
    
    .blog-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      
      .blog-author {
        display: flex;
        align-items: center;
        gap: 10px;
        
        .author-info {
          .author-name {
            display: block;
            font-size: 14px;
            font-weight: 500;
            color: var(--color-text-primary);
          }
          
          .publish-time {
            font-size: 12px;
            color: var(--color-text-tertiary);
          }
        }
      }
      
      .blog-stats {
        display: flex;
        gap: 16px;
        font-size: 13px;
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

@media (max-width: 768px) {
  .filter-section {
    flex-direction: column;
    gap: 16px;
  }
  
  .blog-card {
    flex-direction: column;
    
    .blog-cover {
      width: 100%;
      
      img {
        height: 180px;
      }
    }
  }
}
</style>
