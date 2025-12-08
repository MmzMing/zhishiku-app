<template>
  <div class="blog-category-page">
    <el-row :gutter="16">
      <!-- 左侧：分类管理 -->
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>文章分类</span>
              <el-button type="primary" size="small" :icon="Plus" @click="handleAddCategory(null)">新增分类</el-button>
            </div>
          </template>
          
          <el-tree
            ref="categoryTree"
            :data="categoryList"
            node-key="id"
            :props="{ label: 'name', children: 'children' }"
            default-expand-all
            highlight-current
            draggable
            :expand-on-click-node="false"
            @node-click="handleCategoryClick"
          >
            <template #default="{ node, data }">
              <div class="tree-node">
                <div class="node-content">
                  <el-icon><FolderOpened /></el-icon>
                  <span>{{ data.name }}</span>
                  <el-tag size="small" type="info">{{ data.articleCount }}</el-tag>
                </div>
                <div class="node-actions">
                  <el-button size="small" type="primary" link :icon="Plus" @click.stop="handleAddCategory(data)" />
                  <el-button size="small" type="primary" link :icon="Edit" @click.stop="handleEditCategory(data)" />
                  <el-button size="small" type="danger" link :icon="Delete" @click.stop="handleDeleteCategory(data)" v-if="!data.children?.length" />
                </div>
              </div>
            </template>
          </el-tree>
        </el-card>
        
        <!-- 系列文章管理 -->
        <el-card style="margin-top: 16px">
          <template #header>
            <div class="card-header">
              <span>系列文章</span>
              <el-button type="primary" size="small" :icon="Plus" @click="showSeriesDialog = true">创建系列</el-button>
            </div>
          </template>
          
          <div class="series-list">
            <div class="series-item" v-for="series in seriesList" :key="series.id" @click="currentSeries = series">
              <div class="series-cover" v-if="series.cover">
                <img :src="series.cover" :alt="series.name" />
              </div>
              <div class="series-info">
                <div class="series-name">{{ series.name }}</div>
                <div class="series-meta">
                  <span>{{ series.articleCount }} 篇文章</span>
                  <span>{{ series.viewCount }} 阅读</span>
                </div>
                <el-progress :percentage="series.progress" :stroke-width="4" :show-text="false" />
              </div>
              <el-dropdown trigger="click" @click.stop>
                <el-button size="small" type="primary" link :icon="More" />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item>编辑</el-dropdown-item>
                    <el-dropdown-item>管理文章</el-dropdown-item>
                    <el-dropdown-item divided>删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 右侧：标签管理 -->
      <el-col :span="16">
        <!-- 标签云 -->
        <el-card>
          <template #header>
            <div class="card-header">
              <div class="header-left">
                <span>标签云管理</span>
                <el-tag size="small">共 {{ tagList.length }} 个标签</el-tag>
              </div>
              <div class="header-right">
                <el-input v-model="newTagName" placeholder="输入标签名" style="width: 150px" @keyup.enter="handleAddTag">
                  <template #append>
                    <el-button :icon="Plus" @click="handleAddTag" />
                  </template>
                </el-input>
              </div>
            </div>
          </template>
          
          <div class="tag-cloud">
            <el-tag
              v-for="tag in tagList"
              :key="tag.id"
              :type="tag.type"
              :size="getTagSize(tag.count)"
              :style="{ fontSize: getTagFontSize(tag.count) + 'px' }"
              closable
              @close="handleDeleteTag(tag)"
              @click="editingTag = tag"
              class="tag-item"
            >
              {{ tag.name }} ({{ tag.count }})
            </el-tag>
          </div>
          
          <div class="tag-stats">
            <div class="stat-item">
              <span class="label">热门标签</span>
              <div class="tags">
                <el-tag v-for="tag in hotTags" :key="tag.id" type="danger" size="small">{{ tag.name }}</el-tag>
              </div>
            </div>
            <div class="stat-item">
              <span class="label">最近使用</span>
              <div class="tags">
                <el-tag v-for="tag in recentTags" :key="tag.id" type="success" size="small">{{ tag.name }}</el-tag>
              </div>
            </div>
          </div>
        </el-card>
        
        <!-- 标签详情 -->
        <el-card style="margin-top: 16px" v-if="editingTag">
          <template #header>
            <div class="card-header">
              <span>标签详情: {{ editingTag.name }}</span>
              <el-button size="small" @click="editingTag = null">关闭</el-button>
            </div>
          </template>
          
          <el-form label-width="100px">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="标签名称">
                  <el-input v-model="editingTag.name" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="标签别名">
                  <el-input v-model="editingTag.slug" placeholder="URL友好名称" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="标签颜色">
                  <el-select v-model="editingTag.type" style="width: 100%">
                    <el-option label="默认" value="" />
                    <el-option label="成功" value="success" />
                    <el-option label="警告" value="warning" />
                    <el-option label="危险" value="danger" />
                    <el-option label="信息" value="info" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="文章数量">
                  <el-input :value="editingTag.count" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="标签描述">
                  <el-input v-model="editingTag.description" type="textarea" :rows="2" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item>
              <el-button type="primary" @click="handleSaveTag">保存修改</el-button>
              <el-button type="danger" @click="handleMergeTag">合并到其他标签</el-button>
            </el-form-item>
          </el-form>
        </el-card>
        
        <!-- 分类下的文章 -->
        <el-card style="margin-top: 16px" v-if="currentCategory">
          <template #header>
            <div class="card-header">
              <span>{{ currentCategory.name }} - 文章列表</span>
              <span class="count">共 {{ currentCategory.articleCount }} 篇</span>
            </div>
          </template>
          
          <el-table :data="categoryArticles" stripe>
            <el-table-column prop="title" label="文章标题" min-width="200" />
            <el-table-column prop="author" label="作者" width="100" />
            <el-table-column label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 'published' ? 'success' : 'info'" size="small">
                  {{ row.status === 'published' ? '已发布' : '草稿' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="readCount" label="阅读" width="80" />
            <el-table-column prop="publishedAt" label="发布时间" width="120" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 分类编辑弹窗 -->
    <el-dialog v-model="categoryDialogVisible" :title="isEditCategory ? '编辑分类' : '新增分类'" width="450px">
      <el-form :model="categoryForm" :rules="categoryRules" ref="categoryFormRef" label-width="100px">
        <el-form-item label="上级分类">
          <el-tree-select
            v-model="categoryForm.parentId"
            :data="categoryList"
            :props="{ label: 'name', value: 'id' }"
            placeholder="无（顶级分类）"
            clearable
            check-strictly
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="分类别名">
          <el-input v-model="categoryForm.slug" placeholder="URL友好名称（可选）" />
        </el-form-item>
        <el-form-item label="分类图标">
          <el-input v-model="categoryForm.icon" placeholder="图标类名" />
        </el-form-item>
        <el-form-item label="分类描述">
          <el-input v-model="categoryForm.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="categoryDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitCategory">确定</el-button>
      </template>
    </el-dialog>
    
    <!-- 系列创建弹窗 -->
    <el-dialog v-model="showSeriesDialog" title="创建系列文章" width="500px">
      <el-form label-width="100px">
        <el-form-item label="系列名称">
          <el-input v-model="seriesForm.name" placeholder="请输入系列名称" />
        </el-form-item>
        <el-form-item label="系列封面">
          <el-upload action="#" :auto-upload="false" list-type="picture-card" :limit="1">
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="系列描述">
          <el-input v-model="seriesForm.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="选择文章">
          <el-select v-model="seriesForm.articles" multiple placeholder="选择要加入系列的文章" style="width: 100%">
            <el-option v-for="article in allArticles" :key="article.id" :label="article.title" :value="article.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showSeriesDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreateSeries">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Plus, Edit, Delete, FolderOpened, More } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'

interface Category {
  id: string
  name: string
  slug: string
  icon: string
  description: string
  parentId: string | null
  articleCount: number
  children?: Category[]
}

interface Tag {
  id: string
  name: string
  slug: string
  type: '' | 'success' | 'warning' | 'danger' | 'info'
  count: number
  description: string
}

interface Series {
  id: string
  name: string
  cover: string
  description: string
  articleCount: number
  viewCount: number
  progress: number
}

const categoryTree = ref()
const categoryDialogVisible = ref(false)
const isEditCategory = ref(false)
const categoryFormRef = ref<FormInstance>()
const currentCategory = ref<Category | null>(null)
const editingTag = ref<Tag | null>(null)
const newTagName = ref('')
const showSeriesDialog = ref(false)
const currentSeries = ref<Series | null>(null)

// 分类列表
const categoryList = ref<Category[]>([
  {
    id: '1', name: '前端开发', slug: 'frontend', icon: '', description: '', parentId: null, articleCount: 45,
    children: [
      { id: '11', name: 'Vue.js', slug: 'vue', icon: '', description: '', parentId: '1', articleCount: 18 },
      { id: '12', name: 'React', slug: 'react', icon: '', description: '', parentId: '1', articleCount: 15 },
      { id: '13', name: 'TypeScript', slug: 'typescript', icon: '', description: '', parentId: '1', articleCount: 12 },
    ]
  },
  {
    id: '2', name: '后端开发', slug: 'backend', icon: '', description: '', parentId: null, articleCount: 38,
    children: [
      { id: '21', name: 'Node.js', slug: 'nodejs', icon: '', description: '', parentId: '2', articleCount: 20 },
      { id: '22', name: 'Java', slug: 'java', icon: '', description: '', parentId: '2', articleCount: 18 },
    ]
  },
  { id: '3', name: 'DevOps', slug: 'devops', icon: '', description: '', parentId: null, articleCount: 22 },
  { id: '4', name: '数据库', slug: 'database', icon: '', description: '', parentId: null, articleCount: 15 },
])

// 标签列表
const tagList = ref<Tag[]>([
  { id: '1', name: 'JavaScript', slug: 'javascript', type: '', count: 56, description: '' },
  { id: '2', name: 'Vue.js', slug: 'vue', type: 'success', count: 42, description: '' },
  { id: '3', name: 'React', slug: 'react', type: 'info', count: 38, description: '' },
  { id: '4', name: 'TypeScript', slug: 'typescript', type: 'warning', count: 35, description: '' },
  { id: '5', name: 'Node.js', slug: 'nodejs', type: '', count: 28, description: '' },
  { id: '6', name: 'CSS', slug: 'css', type: '', count: 25, description: '' },
  { id: '7', name: 'HTML', slug: 'html', type: '', count: 20, description: '' },
  { id: '8', name: 'Webpack', slug: 'webpack', type: 'danger', count: 15, description: '' },
  { id: '9', name: 'Git', slug: 'git', type: '', count: 12, description: '' },
  { id: '10', name: 'Docker', slug: 'docker', type: 'info', count: 10, description: '' },
])

const hotTags = computed(() => tagList.value.slice().sort((a, b) => b.count - a.count).slice(0, 5))
const recentTags = computed(() => tagList.value.slice(-5))

// 系列列表
const seriesList = ref<Series[]>([
  { id: '1', name: 'Vue3从入门到精通', cover: '', description: '', articleCount: 12, viewCount: 15600, progress: 80 },
  { id: '2', name: 'TypeScript实战指南', cover: '', description: '', articleCount: 8, viewCount: 8900, progress: 60 },
  { id: '3', name: '前端工程化实践', cover: '', description: '', articleCount: 6, viewCount: 5200, progress: 40 },
])

const allArticles = ref([
  { id: '1', title: 'Vue3 Composition API详解' },
  { id: '2', title: 'TypeScript泛型深入理解' },
  { id: '3', title: 'Webpack配置优化指南' },
])

// 分类下的文章
const categoryArticles = ref([
  { id: '1', title: 'Vue3响应式原理解析', author: '张三', status: 'published', readCount: 1280, publishedAt: '2024-01-10' },
  { id: '2', title: 'Pinia状态管理实战', author: '李四', status: 'published', readCount: 856, publishedAt: '2024-01-08' },
  { id: '3', title: 'Vue Router 4使用指南', author: '王五', status: 'draft', readCount: 0, publishedAt: '-' },
])

// 表单
const categoryForm = reactive({
  id: '',
  parentId: null as string | null,
  name: '',
  slug: '',
  icon: '',
  description: ''
})

const categoryRules: FormRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
}

const seriesForm = reactive({
  name: '',
  cover: '',
  description: '',
  articles: [] as string[]
})

function getTagSize(count: number): 'small' | 'default' | 'large' {
  if (count > 40) return 'large'
  if (count > 20) return 'default'
  return 'small'
}

function getTagFontSize(count: number): number {
  return Math.min(18, Math.max(12, 12 + count / 10))
}

function handleCategoryClick(data: Category) {
  currentCategory.value = data
}

function handleAddCategory(parent: Category | null) {
  isEditCategory.value = false
  Object.assign(categoryForm, { id: '', parentId: parent?.id || null, name: '', slug: '', icon: '', description: '' })
  categoryDialogVisible.value = true
}

function handleEditCategory(data: Category) {
  isEditCategory.value = true
  Object.assign(categoryForm, { id: data.id, parentId: data.parentId, name: data.name, slug: data.slug, icon: data.icon, description: data.description })
  categoryDialogVisible.value = true
}

function handleDeleteCategory(data: Category) {
  ElMessageBox.confirm(`确定要删除分类 "${data.name}" 吗？`, '警告', { type: 'warning' })
    .then(() => ElMessage.success('删除成功'))
    .catch(() => {})
}

function handleSubmitCategory() {
  if (!categoryFormRef.value) return
  categoryFormRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success(isEditCategory.value ? '编辑成功' : '新增成功')
      categoryDialogVisible.value = false
    }
  })
}

function handleAddTag() {
  if (!newTagName.value.trim()) return
  tagList.value.push({
    id: Date.now().toString(),
    name: newTagName.value.trim(),
    slug: newTagName.value.toLowerCase().replace(/\s+/g, '-'),
    type: '',
    count: 0,
    description: ''
  })
  newTagName.value = ''
  ElMessage.success('标签添加成功')
}

function handleDeleteTag(tag: Tag) {
  tagList.value = tagList.value.filter(t => t.id !== tag.id)
  ElMessage.success('标签删除成功')
}

function handleSaveTag() {
  ElMessage.success('标签保存成功')
  editingTag.value = null
}

function handleMergeTag() {
  ElMessage.info('合并标签功能开发中')
}

function handleCreateSeries() {
  ElMessage.success('系列创建成功')
  showSeriesDialog.value = false
}
</script>

<style scoped lang="scss">
.blog-category-page {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .header-left, .header-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .count {
      font-size: 13px;
      color: var(--color-text-tertiary);
    }
  }
  
  .tree-node {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-right: 8px;
    
    .node-content {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .node-actions {
      display: none;
    }
    
    &:hover .node-actions {
      display: flex;
    }
  }
  
  :deep(.el-tree-node__content) {
    height: 36px;
  }
  
  .series-list {
    .series-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 8px;
      cursor: pointer;
      transition: background 0.3s;
      
      &:hover {
        background: var(--color-bg-secondary);
      }
      
      .series-cover {
        width: 60px;
        height: 40px;
        border-radius: 4px;
        overflow: hidden;
        background: var(--color-bg-tertiary);
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
      
      .series-info {
        flex: 1;
        
        .series-name {
          font-weight: 500;
          margin-bottom: 4px;
        }
        
        .series-meta {
          font-size: 12px;
          color: var(--color-text-tertiary);
          display: flex;
          gap: 12px;
          margin-bottom: 4px;
        }
      }
    }
  }
  
  .tag-cloud {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    padding: 16px;
    background: var(--color-bg-secondary);
    border-radius: 8px;
    min-height: 150px;
    
    .tag-item {
      cursor: pointer;
      transition: transform 0.2s;
      
      &:hover {
        transform: scale(1.1);
      }
    }
  }
  
  .tag-stats {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    
    .stat-item {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .label {
        width: 80px;
        font-size: 13px;
        color: var(--color-text-secondary);
      }
      
      .tags {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
    }
  }
}
</style>
