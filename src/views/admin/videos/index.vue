<template>
  <div class="video-management-page">
    <!-- 搜索筛选 -->
    <el-card class="filter-card">
      <el-form :model="queryParams" inline>
        <el-form-item label="关键词">
          <el-input v-model="queryParams.keyword" placeholder="视频标题" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="分类">
          <el-cascader 
            v-model="queryParams.categoryId" 
            :options="categoryOptions" 
            placeholder="全部分类" 
            clearable 
            :props="{ checkStrictly: true, emitPath: false }"
            style="width: 180px" 
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="已发布" value="published" />
            <el-option label="待审核" value="pending" />
            <el-option label="审核中" value="reviewing" />
            <el-option label="草稿" value="draft" />
            <el-option label="已下架" value="offline" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="queryParams.dateRange"
            type="daterange"
            range-separator="-"
            start-placeholder="开始"
            end-placeholder="结束"
            style="width: 240px"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 视频列表 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span>视频列表</span>
            <el-tag type="info" size="small">共 {{ total }} 个视频</el-tag>
          </div>
          <div class="header-right">
            <el-button-group v-if="selectedRows.length > 0">
              <el-button size="small" @click="handleBatchPublish">
                <el-icon><CircleCheck /></el-icon>批量发布
              </el-button>
              <el-button size="small" @click="handleBatchOffline">
                <el-icon><CircleClose /></el-icon>批量下架
              </el-button>
              <el-button size="small" @click="handleBatchMove">
                <el-icon><FolderOpened /></el-icon>批量移动
              </el-button>
              <el-button size="small" type="danger" @click="handleBatchDelete">
                <el-icon><Delete /></el-icon>批量删除
              </el-button>
            </el-button-group>
            <el-button type="primary" :icon="Upload" @click="showUploadDialog = true">上传视频</el-button>
            <el-button type="success" :icon="Plus" @click="$router.push('/admin/videos/create')">新建视频</el-button>
          </div>
        </div>
      </template>
      
      <el-table 
        :data="tableData" 
        v-loading="loading" 
        stripe 
        @selection-change="handleSelectionChange"
        row-key="id"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="视频信息" min-width="320">
          <template #default="{ row }">
            <div class="video-info">
              <div class="cover" @click="openPreview(row)">
                <img :src="row.cover" :alt="row.title" />
                <div class="play-overlay">
                  <el-icon :size="24"><VideoPlay /></el-icon>
                </div>
                <span class="duration-badge">{{ formatDuration(row.duration) }}</span>
              </div>
              <div class="info">
                <span class="title" :title="row.title">{{ row.title }}</span>
                <div class="meta">
                  <span class="author"><el-icon><User /></el-icon>{{ row.authorName || '管理员' }}</span>
                  <span class="size">{{ formatFileSize(row.fileSize) }}</span>
                </div>
                <div class="tags" v-if="row.tags?.length">
                  <el-tag v-for="tag in row.tags.slice(0, 3)" :key="tag" size="small" type="info">{{ tag }}</el-tag>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="categoryName" label="分类" width="100">
          <template #default="{ row }">
            <el-tag>{{ row.categoryName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="数据统计" width="140">
          <template #default="{ row }">
            <div class="stats">
              <span><el-icon><View /></el-icon> {{ formatNumber(row.playCount) }}</span>
              <span><el-icon><Star /></el-icon> {{ formatNumber(row.likeCount) }}</span>
              <span><el-icon><ChatDotRound /></el-icon> {{ formatNumber(row.commentCount || 0) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="发布时间" width="160">
          <template #default="{ row }">
            <div class="time-info">
              <span>{{ row.publishedAt?.split('T')[0] || '-' }}</span>
              <span class="time-sub">{{ row.publishedAt?.split('T')[1]?.slice(0, 5) || '' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="openPreview(row)">
              <el-icon><VideoPlay /></el-icon>预览
            </el-button>
            <el-button size="small" type="primary" link @click="$router.push(`/admin/videos/edit/${row.id}`)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-dropdown trigger="click" @command="(cmd: string) => handleMoreAction(cmd, row)">
              <el-button size="small" type="info" link>
                <el-icon><More /></el-icon>更多
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="copy">复制链接</el-dropdown-item>
                  <el-dropdown-item command="stats">数据统计</el-dropdown-item>
                  <el-dropdown-item command="logs">操作日志</el-dropdown-item>
                  <el-dropdown-item v-if="row.status === 'published'" command="offline" divided>下架</el-dropdown-item>
                  <el-dropdown-item v-else-if="row.status !== 'pending'" command="publish">发布</el-dropdown-item>
                  <el-dropdown-item command="delete" divided style="color: #f56c6c">删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-wrap">
        <div class="selection-info" v-if="selectedRows.length > 0">
          已选择 <strong>{{ selectedRows.length }}</strong> 项
          <el-button type="primary" link size="small" @click="clearSelection">清空</el-button>
        </div>
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>
    
    <!-- 视频预览弹窗 -->
    <el-dialog v-model="previewVisible" title="视频预览" width="800px" destroy-on-close>
      <div class="video-preview" v-if="previewVideo">
        <video 
          ref="videoPlayerRef"
          controls 
          :src="previewVideo.url || 'https://vjs.zencdn.net/v/oceans.mp4'" 
          :poster="previewVideo.cover"
          style="width: 100%; max-height: 450px;"
        ></video>
        <div class="preview-info">
          <h3>{{ previewVideo.title }}</h3>
          <p>{{ previewVideo.description }}</p>
          <div class="preview-meta">
            <span><el-icon><Clock /></el-icon>{{ formatDuration(previewVideo.duration) }}</span>
            <span><el-icon><View /></el-icon>{{ previewVideo.playCount }} 次播放</span>
            <span><el-icon><Star /></el-icon>{{ previewVideo.likeCount }} 赞</span>
          </div>
        </div>
      </div>
    </el-dialog>
    
    <!-- 上传视频弹窗 -->
    <el-dialog v-model="showUploadDialog" title="上传视频" width="700px" destroy-on-close>
      <div class="upload-dialog-content">
        <el-upload
          ref="uploadRef"
          class="video-upload-area"
          drag
          action="#"
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleUploadChange"
          accept=".mp4,.mov,.avi,.mkv,.webm,.flv"
          :multiple="true"
        >
          <div class="upload-content" v-if="uploadList.length === 0">
            <el-icon :size="48"><UploadFilled /></el-icon>
            <p class="upload-text">将视频拖到此处，或 <em>点击上传</em></p>
            <p class="upload-tip">支持 mp4, mov, avi, mkv, webm, flv 格式，单个文件最大 4GB</p>
          </div>
        </el-upload>
        
        <!-- 上传列表 -->
        <div class="upload-list" v-if="uploadList.length > 0">
          <div class="upload-item" v-for="(item, index) in uploadList" :key="index">
            <div class="item-info">
              <el-icon :size="24" class="file-icon"><VideoCamera /></el-icon>
              <div class="file-detail">
                <span class="file-name">{{ item.name }}</span>
                <span class="file-size">{{ formatFileSize(item.size) }}</span>
              </div>
            </div>
            <div class="item-progress" v-if="item.status === 'uploading'">
              <el-progress :percentage="item.progress" :stroke-width="6" />
              <span class="speed">{{ item.speed }}</span>
            </div>
            <div class="item-progress" v-else-if="item.status === 'transcoding'">
              <el-progress :percentage="item.transcodeProgress" :stroke-width="6" status="warning" />
              <span class="speed">转码中...</span>
            </div>
            <div class="item-status" v-else>
              <el-tag v-if="item.status === 'success'" type="success" size="small">上传成功</el-tag>
              <el-tag v-else-if="item.status === 'error'" type="danger" size="small">上传失败</el-tag>
              <el-tag v-else type="info" size="small">等待上传</el-tag>
            </div>
            <el-button type="danger" link :icon="Delete" @click="removeUploadItem(index)" />
          </div>
          
          <!-- 转码预览区域 -->
          <div class="transcode-preview" v-if="currentTranscodeItem">
            <div class="preview-header">
              <span>实时转码预览</span>
              <el-tag size="small" type="warning">{{ currentTranscodeItem.resolution || '720p' }}</el-tag>
            </div>
            <video 
              v-if="currentTranscodeItem.previewUrl"
              :src="currentTranscodeItem.previewUrl" 
              controls 
              muted
              class="preview-video"
            />
            <div class="transcode-info">
              <span><el-icon><Clock /></el-icon>预计剩余: {{ currentTranscodeItem.remainingTime || '--' }}</span>
              <span><el-icon><Cpu /></el-icon>编码: H.264</span>
            </div>
          </div>
          
          <!-- AI智能分类结果 -->
          <div class="ai-tags-section" v-if="aiTagsResult.length > 0">
            <div class="section-header">
              <span><el-icon><MagicStick /></el-icon>AI 智能标签识别</span>
            </div>
            <div class="ai-tags-list">
              <el-tag 
                v-for="tag in aiTagsResult" 
                :key="tag.name" 
                :type="tag.confidence > 0.8 ? 'success' : 'info'"
                size="small"
              >
                {{ tag.name }} ({{ Math.round(tag.confidence * 100) }}%)
              </el-tag>
            </div>
            <div class="ai-category">
              <span>推荐分类:</span>
              <el-tag type="primary">{{ aiSuggestedCategory }}</el-tag>
            </div>
          </div>
          
          <div class="upload-actions">
            <el-button @click="uploadList = []">清空列表</el-button>
            <el-button type="primary" @click="startUpload" :loading="isUploading">
              {{ isUploading ? '上传中...' : `开始上传 (${uploadList.length})` }}
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>
    
    <!-- 批量移动弹窗 -->
    <el-dialog v-model="showMoveDialog" title="批量移动分类" width="400px">
      <el-form>
        <el-form-item label="目标分类">
          <el-cascader 
            v-model="moveCategoryId" 
            :options="categoryOptions" 
            placeholder="选择分类" 
            :props="{ checkStrictly: true, emitPath: false }"
            style="width: 100%" 
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showMoveDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmBatchMove">确定移动</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { 
  Plus, Search, Refresh, Edit, Delete, View, Star, Upload, More,
  VideoPlay, User, Clock, CircleCheck, CircleClose, FolderOpened,
  UploadFilled, VideoCamera, ChatDotRound, Cpu, MagicStick
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type UploadFile } from 'element-plus'
import { mockService } from '@/mock'
import type { Video } from '@/types/video'

const loading = ref(false)
const tableData = ref<Video[]>([])
const total = ref(0)
const selectedRows = ref<Video[]>([])

// 查询参数
const queryParams = reactive({
  keyword: '',
  categoryId: '',
  status: '',
  dateRange: [] as string[],
  pageNum: 1,
  pageSize: 10
})

// 分类选项
const categoryOptions = [
  { value: 'cat-1', label: '前端开发', children: [
    { value: 'cat-1-1', label: 'Vue' },
    { value: 'cat-1-2', label: 'React' },
    { value: 'cat-1-3', label: 'Angular' }
  ]},
  { value: 'cat-2', label: '后端开发', children: [
    { value: 'cat-2-1', label: 'Node.js' },
    { value: 'cat-2-2', label: 'Java' },
    { value: 'cat-2-3', label: 'Python' }
  ]},
  { value: 'cat-3', label: '数据库', children: [
    { value: 'cat-3-1', label: 'MySQL' },
    { value: 'cat-3-2', label: 'MongoDB' },
    { value: 'cat-3-3', label: 'Redis' }
  ]},
  { value: 'cat-4', label: '运维部署' },
  { value: 'cat-5', label: '人工智能' }
]

// 预览相关
const previewVisible = ref(false)
const previewVideo = ref<Video | null>(null)
const videoPlayerRef = ref<HTMLVideoElement>()

// 上传相关
const showUploadDialog = ref(false)
const uploadRef = ref()
const isUploading = ref(false)
const uploadList = ref<{
  name: string
  size: number
  status: 'waiting' | 'uploading' | 'transcoding' | 'success' | 'error'
  progress: number
  transcodeProgress: number
  speed: string
  file: File
  previewUrl?: string
  resolution?: string
  remainingTime?: string
}[]>([])

// 批量移动
const showMoveDialog = ref(false)
const moveCategoryId = ref('')

// AI标签识别
const aiTagsResult = ref<{ name: string; confidence: number }[]>([])
const aiSuggestedCategory = ref('')

// 当前转码项
const currentTranscodeItem = computed(() => {
  return uploadList.value.find(item => item.status === 'transcoding')
})

// 格式化时长
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (!bytes) return '-'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
}

// 格式化数字
function formatNumber(num: number): string {
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
  return num.toString()
}

// 获取状态类型
function getStatusType(status: string): 'success' | 'warning' | 'info' | 'danger' {
  const map: Record<string, 'success' | 'warning' | 'info' | 'danger'> = {
    published: 'success',
    pending: 'warning',
    reviewing: 'info',
    draft: 'info',
    offline: 'danger'
  }
  return map[status] || 'info'
}

// 获取状态文本
function getStatusText(status: string): string {
  const map: Record<string, string> = {
    published: '已发布',
    pending: '待审核',
    reviewing: '审核中',
    draft: '草稿',
    offline: '已下架'
  }
  return map[status] || status
}

// 加载数据
async function loadData() {
  loading.value = true
  try {
    const result = await mockService.getVideoList({
      pageNum: queryParams.pageNum,
      pageSize: queryParams.pageSize,
      keyword: queryParams.keyword || undefined,
      categoryId: queryParams.categoryId || undefined
    })
    tableData.value = result.list
    total.value = result.total
  } catch (error) {
    console.error('加载视频列表失败', error)
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
  queryParams.dateRange = []
  queryParams.pageNum = 1
  loadData()
}

// 选择变化
function handleSelectionChange(rows: Video[]) {
  selectedRows.value = rows
}

function clearSelection() {
  selectedRows.value = []
}

// 视频预览
function openPreview(video: Video) {
  previewVideo.value = video
  previewVisible.value = true
}

// 更多操作
function handleMoreAction(command: string, row: Video) {
  switch (command) {
    case 'copy':
      navigator.clipboard.writeText(window.location.origin + '/portal/videos/' + row.id)
      ElMessage.success('链接已复制')
      break
    case 'stats':
      ElMessage.info('数据统计功能开发中')
      break
    case 'logs':
      ElMessage.info('操作日志功能开发中')
      break
    case 'offline':
      handleOffline(row)
      break
    case 'publish':
      handlePublish(row)
      break
    case 'delete':
      handleDelete(row)
      break
  }
}

async function handleDelete(row: Video) {
  try {
    await ElMessageBox.confirm(`确定要删除视频 "${row.title}" 吗？`, '提示', { type: 'warning' })
    ElMessage.success('删除成功')
    loadData()
  } catch {}
}

async function handleOffline(row: Video) {
  try {
    await ElMessageBox.confirm(`确定要下架视频 "${row.title}" 吗？`, '提示', { type: 'warning' })
    ElMessage.success('下架成功')
    loadData()
  } catch {}
}

async function handlePublish(row: Video) {
  try {
    await ElMessageBox.confirm(`确定要发布视频 "${row.title}" 吗？`, '提示', { type: 'info' })
    ElMessage.success('发布成功')
    loadData()
  } catch {}
}

// 批量操作
async function handleBatchPublish() {
  try {
    await ElMessageBox.confirm(`确定要发布选中的 ${selectedRows.value.length} 个视频吗？`, '批量发布', { type: 'info' })
    ElMessage.success('批量发布成功')
    selectedRows.value = []
    loadData()
  } catch {}
}

async function handleBatchOffline() {
  try {
    await ElMessageBox.confirm(`确定要下架选中的 ${selectedRows.value.length} 个视频吗？`, '批量下架', { type: 'warning' })
    ElMessage.success('批量下架成功')
    selectedRows.value = []
    loadData()
  } catch {}
}

function handleBatchMove() {
  moveCategoryId.value = ''
  showMoveDialog.value = true
}

async function confirmBatchMove() {
  if (!moveCategoryId.value) {
    ElMessage.warning('请选择目标分类')
    return
  }
  ElMessage.success(`已移动 ${selectedRows.value.length} 个视频`)
  showMoveDialog.value = false
  selectedRows.value = []
  loadData()
}

async function handleBatchDelete() {
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 个视频吗？此操作不可恢复！`, '批量删除', { type: 'error' })
    ElMessage.success('批量删除成功')
    selectedRows.value = []
    loadData()
  } catch {}
}

// 上传处理
function handleUploadChange(uploadFile: UploadFile) {
  if (uploadFile.raw) {
    uploadList.value.push({
      name: uploadFile.name,
      size: uploadFile.raw.size,
      status: 'waiting',
      progress: 0,
      transcodeProgress: 0,
      speed: '',
      file: uploadFile.raw
    })
  }
}

function removeUploadItem(index: number) {
  uploadList.value.splice(index, 1)
}

async function startUpload() {
  isUploading.value = true
  aiTagsResult.value = []
  
  for (const item of uploadList.value) {
    if (item.status === 'success') continue
    
    // 阶段1：上传
    item.status = 'uploading'
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(r => setTimeout(r, 80))
      item.progress = i
      item.speed = `${(Math.random() * 5 + 2).toFixed(1)} MB/s`
    }
    
    // 阶段2：转码
    item.status = 'transcoding'
    item.previewUrl = URL.createObjectURL(item.file)
    item.resolution = '720p'
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(r => setTimeout(r, 150))
      item.transcodeProgress = i
      item.remainingTime = `${Math.ceil((100 - i) / 10)}秒`
    }
    
    item.status = 'success'
    item.progress = 100
  }
  
  // AI标签识别模拟
  await simulateAITagging()
  
  isUploading.value = false
  ElMessage.success('所有视频上传并转码完成')
}

// AI标签识别模拟
async function simulateAITagging() {
  await new Promise(r => setTimeout(r, 500))
  aiTagsResult.value = [
    { name: '编程教程', confidence: 0.95 },
    { name: 'Vue.js', confidence: 0.88 },
    { name: '前端开发', confidence: 0.85 },
    { name: 'TypeScript', confidence: 0.72 },
    { name: 'Web开发', confidence: 0.68 }
  ]
  aiSuggestedCategory.value = '前端开发 > Vue.js'
}

onMounted(loadData)
</script>

<style scoped lang="scss">
.video-management-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  .filter-card {
    :deep(.el-form-item) {
      margin-bottom: 0;
    }
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }
  
  .video-info {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    
    .cover {
      width: 140px;
      flex-shrink: 0;
      border-radius: 6px;
      overflow: hidden;
      position: relative;
      cursor: pointer;
      
      img {
        width: 100%;
        aspect-ratio: 16 / 9;
        object-fit: cover;
        display: block;
      }
      
      .play-overlay {
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
      
      &:hover .play-overlay {
        opacity: 1;
      }
      
      .duration-badge {
        position: absolute;
        bottom: 4px;
        right: 4px;
        background: rgba(0, 0, 0, 0.75);
        color: #fff;
        font-size: 12px;
        padding: 2px 6px;
        border-radius: 4px;
      }
    }
    
    .info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
      
      .title {
        font-weight: 500;
        color: var(--color-text-primary);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      
      .meta {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 12px;
        color: var(--color-text-tertiary);
        
        span {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }
      
      .tags {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
        margin-top: 4px;
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
  
  .time-info {
    display: flex;
    flex-direction: column;
    font-size: 13px;
    
    .time-sub {
      font-size: 12px;
      color: var(--color-text-tertiary);
    }
  }
  
  .pagination-wrap {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
    
    .selection-info {
      font-size: 13px;
      color: var(--color-text-secondary);
      
      strong {
        color: var(--color-primary);
      }
    }
  }
}

// 视频预览
.video-preview {
  .preview-info {
    padding: 16px 0 0;
    
    h3 {
      margin: 0 0 8px;
      color: var(--color-text-primary);
    }
    
    p {
      color: var(--color-text-secondary);
      font-size: 14px;
      line-height: 1.6;
      margin: 0 0 12px;
    }
    
    .preview-meta {
      display: flex;
      gap: 20px;
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

// 上传弹窗
.upload-dialog-content {
  .video-upload-area {
    :deep(.el-upload-dragger) {
      width: 100%;
      height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .upload-content {
      text-align: center;
      color: var(--color-text-tertiary);
      
      .el-icon {
        color: var(--color-text-quaternary);
      }
      
      .upload-text {
        font-size: 16px;
        margin: 16px 0 8px;
        color: var(--color-text-secondary);
        
        em {
          color: var(--color-primary);
          font-style: normal;
        }
      }
      
      .upload-tip {
        font-size: 13px;
      }
    }
  }
  
  .upload-list {
    margin-top: 20px;
    
    .upload-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: var(--color-bg-secondary);
      border-radius: 8px;
      margin-bottom: 8px;
      
      .item-info {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
        min-width: 0;
        
        .file-icon {
          color: var(--color-primary);
        }
        
        .file-detail {
          display: flex;
          flex-direction: column;
          min-width: 0;
          
          .file-name {
            font-weight: 500;
            color: var(--color-text-primary);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          
          .file-size {
            font-size: 12px;
            color: var(--color-text-tertiary);
          }
        }
      }
      
      .item-progress {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 200px;
        
        .el-progress {
          flex: 1;
        }
        
        .speed {
          font-size: 12px;
          color: var(--color-text-tertiary);
          white-space: nowrap;
        }
      }
      
      .item-status {
        width: 80px;
        text-align: center;
      }
    }
    
    .upload-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 16px;
    }
    
    .transcode-preview {
      margin-top: 16px;
      padding: 16px;
      background: var(--color-bg-secondary);
      border-radius: 8px;
      border: 1px solid var(--color-border);
      
      .preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        font-weight: 500;
      }
      
      .preview-video {
        width: 100%;
        max-height: 200px;
        border-radius: 6px;
        background: #000;
      }
      
      .transcode-info {
        display: flex;
        gap: 20px;
        margin-top: 12px;
        font-size: 13px;
        color: var(--color-text-tertiary);
        
        span {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }
    }
    
    .ai-tags-section {
      margin-top: 16px;
      padding: 16px;
      background: linear-gradient(135deg, rgba(64, 158, 255, 0.1), rgba(103, 194, 58, 0.1));
      border-radius: 8px;
      border: 1px solid rgba(64, 158, 255, 0.2);
      
      .section-header {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
        margin-bottom: 12px;
        color: var(--color-primary);
        
        .el-icon {
          color: var(--color-primary);
        }
      }
      
      .ai-tags-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 12px;
      }
      
      .ai-category {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: var(--color-text-secondary);
      }
    }
  }
}
</style>
