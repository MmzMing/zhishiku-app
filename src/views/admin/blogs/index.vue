<template>
  <div class="blog-management-page">
    <!-- 搜索筛选 -->
    <el-card class="filter-card">
      <el-form :model="queryParams" inline>
        <el-form-item label="关键词">
          <el-input v-model="queryParams.keyword" placeholder="博客标题" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="queryParams.categoryId" placeholder="全部" clearable style="width: 140px">
            <el-option label="前端开发" value="cat-1" />
            <el-option label="后端开发" value="cat-2" />
            <el-option label="DevOps" value="cat-3" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="已发布" value="published" />
            <el-option label="待审核" value="pending" />
            <el-option label="定时发布" value="scheduled" />
            <el-option label="草稿" value="draft" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间">
          <el-date-picker
            v-model="queryParams.dateRange"
            type="daterange"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 博客列表 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>文章列表</span>
          <div class="header-actions">
            <el-button :icon="ChatDotRound" @click="showCommentDialog = true">评论管理</el-button>
            <el-button type="primary" :icon="Edit" @click="$router.push('/admin/blogs/create')">写博客</el-button>
          </div>
        </div>
      </template>
      
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="100" />
        <el-table-column label="博客信息" min-width="300">
          <template #default="{ row }">
            <div class="blog-info">
              <div class="cover" v-if="row.cover"><img :src="row.cover" :alt="row.title" /></div>
              <div class="info">
                <span class="title">{{ row.title }}</span>
                <span class="summary">{{ row.summary }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="categoryName" label="分类" width="100" />
        <el-table-column label="数据" width="150">
          <template #default="{ row }">
            <div class="stats">
              <span><el-icon><View /></el-icon> {{ row.readCount }}</span>
              <span><el-icon><Star /></el-icon> {{ row.likeCount }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusText(row.status) }}</el-tag>
            <div v-if="row.status === 'scheduled'" class="schedule-time">
              {{ row.scheduledAt }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="SEO" width="80">
          <template #default="{ row }">
            <el-tooltip :content="getSeoTip(row)" placement="top">
              <el-icon :class="['seo-icon', row.seoScore >= 80 ? 'good' : row.seoScore >= 50 ? 'medium' : 'poor']"><Promotion /></el-icon>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="publishedAt" label="发布时间" width="170" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="$router.push(`/admin/blogs/edit/${row.id}`)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button v-if="row.status === 'pending'" size="small" type="success" link @click="handleAudit(row, 'approve')">
              <el-icon><Check /></el-icon>通过
            </el-button>
            <el-button v-if="row.status === 'pending'" size="small" type="warning" link @click="handleAudit(row, 'reject')">
              <el-icon><Close /></el-icon>拒绝
            </el-button>
            <el-button size="small" type="info" link @click="showSeoDialog(row)">
              <el-icon><Promotion /></el-icon>SEO
            </el-button>
            <el-button size="small" type="danger" link @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          background
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>
    
    <!-- SEO优化弹窗 -->
    <el-dialog v-model="seoDialogVisible" title="SEO优化工具" width="600px">
      <el-form label-width="120px" v-if="currentBlog">
        <el-form-item label="SEO评分">
          <el-progress :percentage="currentBlog.seoScore" :color="getSeoColor(currentBlog.seoScore)" :stroke-width="20" />
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="seoForm.keywords" placeholder="输入SEO关键词，用逗号分隔" />
        </el-form-item>
        <el-form-item label="Meta描述">
          <el-input v-model="seoForm.description" type="textarea" :rows="3" placeholder="输入页面描述（建议150字内）" />
          <div class="char-count">{{ seoForm.description?.length || 0 }} / 150</div>
        </el-form-item>
        <el-form-item label="URL别名">
          <el-input v-model="seoForm.slug" placeholder="URL友好名称" />
        </el-form-item>
        <el-form-item label="优化建议">
          <el-alert type="warning" :closable="false">
            <ul class="seo-tips">
              <li>标题长度建议在60字符内</li>
              <li>确保文章包含目标关键词</li>
              <li>添加内部链接和外部链接</li>
              <li>使用H2-H6标签结构化内容</li>
            </ul>
          </el-alert>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="seoDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveSeoSettings">保存</el-button>
      </template>
    </el-dialog>
    
    <!-- 评论管理弹窗 -->
    <el-dialog v-model="showCommentDialog" title="评论管理" width="800px">
      <el-tabs v-model="commentTab">
        <el-tab-pane label="待审核" name="pending">
          <el-table :data="pendingComments" stripe>
            <el-table-column label="用户" width="120">
              <template #default="{ row }">
                <div class="comment-user">
                  <el-avatar :size="24">{{ row.username?.charAt(0) }}</el-avatar>
                  <span>{{ row.username }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="content" label="评论内容" min-width="200" />
            <el-table-column prop="articleTitle" label="文章" width="150" show-overflow-tooltip />
            <el-table-column prop="createdAt" label="时间" width="120" />
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button size="small" type="success" link @click="approveComment(row)">通过</el-button>
                <el-button size="small" type="danger" link @click="rejectComment(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="全部评论" name="all">
          <el-table :data="allComments" stripe>
            <el-table-column label="用户" width="120">
              <template #default="{ row }">
                <div class="comment-user">
                  <el-avatar :size="24">{{ row.username?.charAt(0) }}</el-avatar>
                  <span>{{ row.username }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="content" label="评论内容" min-width="200" />
            <el-table-column prop="articleTitle" label="文章" width="150" show-overflow-tooltip />
            <el-table-column prop="createdAt" label="时间" width="120" />
            <el-table-column label="操作" width="80">
              <template #default="{ row }">
                <el-button size="small" type="danger" link @click="rejectComment(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, Edit, Delete, View, Star, ChatDotRound, Check, Close, Promotion } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { mockService } from '@/mock'
import type { Blog } from '@/types/blog'

const loading = ref(false)
const tableData = ref<Blog[]>([])
const total = ref(0)

const queryParams = reactive({
  keyword: '',
  categoryId: '',
  status: '',
  dateRange: null as [Date, Date] | null,
  pageNum: 1,
  pageSize: 10
})

async function loadData() {
  loading.value = true
  try {
    const result = await mockService.getBlogList({
      pageNum: queryParams.pageNum,
      pageSize: queryParams.pageSize,
      keyword: queryParams.keyword || undefined,
      categoryId: queryParams.categoryId || undefined
    })
    tableData.value = result.list
    total.value = result.total
  } catch (error) {
    console.error('加载博客列表失败', error)
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  queryParams.pageNum = 1
  loadData()
}

function handleReset() {
  queryParams.keyword = ''
  queryParams.categoryId = ''
  queryParams.status = ''
  queryParams.dateRange = null
  queryParams.pageNum = 1
  loadData()
}

async function handleDelete(row: Blog) {
  try {
    await ElMessageBox.confirm(`确定要删除博客 "${row.title}" 吗？`, '提示', { type: 'warning' })
    ElMessage.success('删除成功')
    loadData()
  } catch {}
}

// 状态相关
function getStatusType(status: string) {
  const map: Record<string, 'success' | 'warning' | 'info' | 'primary' | 'danger'> = {
    published: 'success',
    pending: 'warning',
    scheduled: 'primary',
    draft: 'info'
  }
  return map[status] || 'info'
}

function getStatusText(status: string) {
  const map: Record<string, string> = {
    published: '已发布',
    pending: '待审核',
    scheduled: '定时发布',
    draft: '草稿'
  }
  return map[status] || status
}

// 审核
function handleAudit(row: Blog, action: 'approve' | 'reject') {
  ElMessage.success(action === 'approve' ? '审核通过' : '已拒绝')
}

// SEO相关
const seoDialogVisible = ref(false)
const currentBlog = ref<Blog | null>(null)
const seoForm = reactive({
  keywords: '',
  description: '',
  slug: ''
})

function getSeoTip(row: Blog) {
  const score = (row as any).seoScore || 50
  if (score >= 80) return 'SEO评分优秀: ' + score
  if (score >= 50) return 'SEO评分中等: ' + score
  return 'SEO评分较低: ' + score
}

function getSeoColor(score: number) {
  if (score >= 80) return '#67c23a'
  if (score >= 50) return '#e6a23c'
  return '#f56c6c'
}

function showSeoDialog(row: Blog) {
  currentBlog.value = { ...row, seoScore: (row as any).seoScore || 65 } as any
  seoForm.keywords = ''
  seoForm.description = (row as any).summary || ''
  seoForm.slug = row.id
  seoDialogVisible.value = true
}

function saveSeoSettings() {
  ElMessage.success('SEO设置已保存')
  seoDialogVisible.value = false
}

// 评论管理
const showCommentDialog = ref(false)
const commentTab = ref('pending')

const pendingComments = ref([
  { id: '1', username: '用户A', content: '写得太好了，学习了！', articleTitle: 'Vue3入门教程', createdAt: '2024-01-15' },
  { id: '2', username: '用户B', content: '请问这个怎么实现？', articleTitle: 'TypeScript最佳实践', createdAt: '2024-01-15' },
])

const allComments = ref([
  { id: '1', username: '用户A', content: '写得太好了，学习了！', articleTitle: 'Vue3入门教程', createdAt: '2024-01-15' },
  { id: '2', username: '用户C', content: '非常详细的教程', articleTitle: 'React Hooks详解', createdAt: '2024-01-14' },
])

function approveComment(row: any) {
  pendingComments.value = pendingComments.value.filter(c => c.id !== row.id)
  ElMessage.success('评论已通过')
}

function rejectComment(row: any) {
  pendingComments.value = pendingComments.value.filter(c => c.id !== row.id)
  allComments.value = allComments.value.filter(c => c.id !== row.id)
  ElMessage.success('评论已删除')
}

onMounted(loadData)
</script>

<style scoped lang="scss">
.blog-management-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .blog-info {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .cover {
      width: 100px;
      flex-shrink: 0;
      border-radius: 6px;
      overflow: hidden;
      
      img {
        width: 100%;
        aspect-ratio: 16 / 9;
        object-fit: cover;
      }
    }
    
    .info {
      display: flex;
      flex-direction: column;
      
      .title {
        font-weight: 500;
        color: var(--color-text-primary);
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      
      .summary {
        font-size: 12px;
        color: var(--color-text-tertiary);
        margin-top: 4px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }
  }
  
  .stats {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 13px;
    color: var(--color-text-secondary);
    
    span {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
  
  .pagination-wrap {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }
  
  .header-actions {
    display: flex;
    gap: 12px;
  }
  
  .schedule-time {
    font-size: 11px;
    color: var(--color-text-tertiary);
    margin-top: 2px;
  }
  
  .seo-icon {
    font-size: 18px;
    cursor: pointer;
    
    &.good { color: #67c23a; }
    &.medium { color: #e6a23c; }
    &.poor { color: #f56c6c; }
  }
  
  .char-count {
    font-size: 12px;
    color: var(--color-text-tertiary);
    text-align: right;
    margin-top: 4px;
  }
  
  .seo-tips {
    margin: 0;
    padding-left: 16px;
    font-size: 13px;
    
    li {
      margin-bottom: 4px;
    }
  }
  
  .comment-user {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}
</style>
