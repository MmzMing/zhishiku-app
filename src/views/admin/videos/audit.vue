<template>
  <div class="video-audit-page">
    <!-- 统计卡片 -->
    <div class="audit-stats">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon pending"><el-icon :size="28"><Clock /></el-icon></div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.pending }}</span>
            <span class="stat-label">待审核</span>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon reviewing"><el-icon :size="28"><View /></el-icon></div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.reviewing }}</span>
            <span class="stat-label">审核中</span>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon approved"><el-icon :size="28"><CircleCheck /></el-icon></div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.approved }}</span>
            <span class="stat-label">今日通过</span>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon rejected"><el-icon :size="28"><CircleClose /></el-icon></div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.rejected }}</span>
            <span class="stat-label">今日驳回</span>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 审核队列 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span>审核队列</span>
            <el-radio-group v-model="activeTab" size="small">
              <el-radio-button value="pending">待审核</el-radio-button>
              <el-radio-button value="reviewing">审核中</el-radio-button>
              <el-radio-button value="completed">已完成</el-radio-button>
            </el-radio-group>
          </div>
          <div class="header-right">
            <el-button :icon="Warning" @click="showViolationRecords">违规记录</el-button>
            <el-button type="primary" :icon="Aim" @click="handleAutoAudit" :loading="autoAuditing">
              AI 智能审核
            </el-button>
          </div>
        </div>
      </template>
      
      <el-table :data="auditList" v-loading="loading" stripe>
        <el-table-column label="视频信息" min-width="300">
          <template #default="{ row }">
            <div class="video-info">
              <div class="cover">
                <img :src="row.cover" :alt="row.title" />
              </div>
              <div class="info">
                <span class="title">{{ row.title }}</span>
                <div class="meta">
                  <span><el-icon><User /></el-icon>{{ row.authorName }}</span>
                  <span><el-icon><Clock /></el-icon>{{ row.submitTime }}</span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="AI预审结果" width="180">
          <template #default="{ row }">
            <div class="ai-result" v-if="row.aiResult">
              <el-tag :type="row.aiResult.passed ? 'success' : 'danger'" size="small">
                {{ row.aiResult.passed ? 'AI通过' : 'AI拦截' }}
              </el-tag>
              <div class="ai-tags" v-if="row.aiResult.tags?.length">
                <el-tag v-for="tag in row.aiResult.tags.slice(0, 2)" :key="tag" size="small" type="info">
                  {{ tag }}
                </el-tag>
              </div>
              <span class="ai-score">置信度: {{ row.aiResult.confidence }}%</span>
            </div>
            <span v-else class="text-tertiary">未检测</span>
          </template>
        </el-table-column>
        <el-table-column label="审核状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="审核人" width="120">
          <template #default="{ row }">
            <span v-if="row.auditor">{{ row.auditor }}</span>
            <span v-else class="text-tertiary">-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <template v-if="row.status === 'pending' || row.status === 'reviewing'">
              <el-button size="small" type="primary" @click="handlePreview(row)">
                <el-icon><VideoPlay /></el-icon>审核
              </el-button>
              <el-button size="small" type="success" @click="handleQuickApprove(row)">通过</el-button>
              <el-button size="small" type="danger" @click="handleQuickReject(row)">驳回</el-button>
            </template>
            <template v-else>
              <el-button size="small" type="info" link @click="handleViewLog(row)">查看日志</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          background
        />
      </div>
    </el-card>
    
    <!-- 审核日志 -->
    <el-card style="margin-top: 16px">
      <template #header>
        <div class="card-header">
          <span>审核日志</span>
          <el-button text :icon="Refresh" @click="loadLogs">刷新</el-button>
        </div>
      </template>
      
      <el-timeline>
        <el-timeline-item
          v-for="log in auditLogs"
          :key="log.id"
          :timestamp="log.time"
          :type="log.action === 'approved' ? 'success' : log.action === 'rejected' ? 'danger' : 'primary'"
          placement="top"
        >
          <div class="log-content">
            <span class="log-user">{{ log.auditor }}</span>
            <span class="log-action">{{ log.actionText }}</span>
            <span class="log-video">《{{ log.videoTitle }}》</span>
            <p class="log-reason" v-if="log.reason">原因: {{ log.reason }}</p>
          </div>
        </el-timeline-item>
      </el-timeline>
    </el-card>
    
    <!-- 审核弹窗 -->
    <el-dialog v-model="auditDialogVisible" title="视频审核" width="900px" destroy-on-close>
      <div class="audit-dialog" v-if="currentVideo">
        <div class="video-section">
          <video :src="currentVideo.url || 'https://vjs.zencdn.net/v/oceans.mp4'" controls style="width: 100%;" />
        </div>
        <div class="info-section">
          <h3>{{ currentVideo.title }}</h3>
          <p>{{ currentVideo.description }}</p>
          <div class="ai-analysis" v-if="currentVideo.aiResult">
            <h4>AI 分析结果</h4>
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item label="通过状态">
                <el-tag :type="currentVideo.aiResult.passed ? 'success' : 'danger'">
                  {{ currentVideo.aiResult.passed ? '通过' : '不通过' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="置信度">{{ currentVideo.aiResult.confidence }}%</el-descriptions-item>
              <el-descriptions-item label="识别标签" :span="2">
                <el-tag v-for="tag in currentVideo.aiResult.tags" :key="tag" size="small" style="margin-right: 4px">
                  {{ tag }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
        <div class="audit-form">
          <el-form :model="auditForm" label-width="80px">
            <el-form-item label="审核结果">
              <el-radio-group v-model="auditForm.result">
                <el-radio value="approved">通过</el-radio>
                <el-radio value="rejected">驳回</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="审核意见" v-if="auditForm.result === 'rejected'">
              <el-input v-model="auditForm.reason" type="textarea" :rows="3" placeholder="请输入驳回原因" />
            </el-form-item>
            <el-form-item label="违规类型" v-if="auditForm.result === 'rejected'">
              <el-checkbox-group v-model="auditForm.violationTypes">
                <el-checkbox value="content">内容违规</el-checkbox>
                <el-checkbox value="copyright">版权问题</el-checkbox>
                <el-checkbox value="quality">质量不合格</el-checkbox>
                <el-checkbox value="other">其他</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="处理操作" v-if="auditForm.result === 'rejected'">
              <el-checkbox-group v-model="auditForm.actions">
                <el-checkbox value="delete">删除视频</el-checkbox>
                <el-checkbox value="warn">警告作者</el-checkbox>
                <el-checkbox value="ban">封禁账号</el-checkbox>
                <el-checkbox value="limit">限制发布</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="封禁时长" v-if="auditForm.actions.includes('ban')">
              <el-select v-model="auditForm.banDuration" placeholder="选择封禁时长">
                <el-option label="1天" value="1d" />
                <el-option label="7天" value="7d" />
                <el-option label="30天" value="30d" />
                <el-option label="永久" value="forever" />
              </el-select>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <template #footer>
        <el-button @click="auditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAudit">提交审核结果</el-button>
      </template>
    </el-dialog>
    
    <!-- 违规处理记录弹窗 -->
    <el-dialog v-model="violationDialogVisible" title="违规处理记录" width="700px">
      <el-table :data="violationRecords" stripe>
        <el-table-column prop="videoTitle" label="视频名称" min-width="180" />
        <el-table-column prop="violationType" label="违规类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getViolationTagType(row.violationType)" size="small">
              {{ getViolationText(row.violationType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="action" label="处理操作" width="120">
          <template #default="{ row }">
            <el-tag :type="getActionTagType(row.action)" size="small">
              {{ getActionText(row.action) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="处理人" width="100" />
        <el-table-column prop="time" label="处理时间" width="160" />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleAppeal(row)">申诉</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { 
  Clock, View, CircleCheck, CircleClose, Aim, User, VideoPlay, Refresh, Warning
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

interface AuditVideo {
  id: string
  title: string
  cover: string
  url?: string
  description?: string
  authorName: string
  submitTime: string
  status: 'pending' | 'reviewing' | 'approved' | 'rejected'
  auditor?: string
  aiResult?: {
    passed: boolean
    confidence: number
    tags: string[]
  }
}

interface AuditLog {
  id: string
  auditor: string
  action: 'approved' | 'rejected' | 'reviewing'
  actionText: string
  videoTitle: string
  time: string
  reason?: string
}

const loading = ref(false)
const autoAuditing = ref(false)
const activeTab = ref('pending')
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)

const stats = reactive({
  pending: 23,
  reviewing: 5,
  approved: 42,
  rejected: 8
})

const auditList = ref<AuditVideo[]>([
  {
    id: '1',
    title: 'Vue 3 组合式 API 完全指南',
    cover: 'https://picsum.photos/seed/v1/320/180',
    authorName: '技术讲师A',
    submitTime: '2024-01-15 10:30',
    status: 'pending',
    aiResult: { passed: true, confidence: 95, tags: ['教程', '编程', 'Vue'] }
  },
  {
    id: '2',
    title: 'React Hooks 深入理解',
    cover: 'https://picsum.photos/seed/v2/320/180',
    authorName: '技术讲师B',
    submitTime: '2024-01-15 09:15',
    status: 'reviewing',
    auditor: 'admin',
    aiResult: { passed: true, confidence: 88, tags: ['教程', '编程', 'React'] }
  },
  {
    id: '3',
    title: 'Node.js 性能优化实战',
    cover: 'https://picsum.photos/seed/v3/320/180',
    authorName: '技术讲师C',
    submitTime: '2024-01-15 08:00',
    status: 'pending',
    aiResult: { passed: false, confidence: 72, tags: ['可能违规', '需人工审核'] }
  }
])

const auditLogs = ref<AuditLog[]>([
  { id: '1', auditor: 'admin', action: 'approved', actionText: '审核通过', videoTitle: 'TypeScript 入门教程', time: '2024-01-15 11:30:00' },
  { id: '2', auditor: 'editor', action: 'rejected', actionText: '审核驳回', videoTitle: '某某视频', time: '2024-01-15 11:15:00', reason: '内容质量不合格' },
  { id: '3', auditor: 'admin', action: 'approved', actionText: '审核通过', videoTitle: 'Docker 入门实战', time: '2024-01-15 10:45:00' },
  { id: '4', auditor: 'system', action: 'reviewing', actionText: 'AI预审核完成', videoTitle: 'Vue 3 组合式 API', time: '2024-01-15 10:30:00' }
])

// 审核弹窗
const auditDialogVisible = ref(false)
const currentVideo = ref<AuditVideo | null>(null)
const auditForm = reactive({
  result: 'approved' as 'approved' | 'rejected',
  reason: '',
  violationTypes: [] as string[],
  actions: [] as string[],
  banDuration: ''
})

// 违规记录
const violationDialogVisible = ref(false)
const violationRecords = ref([
  { id: '1', videoTitle: '某违规视频', violationType: 'content', action: 'delete', operator: 'admin', time: '2024-01-15 10:30:00' },
  { id: '2', videoTitle: '版权问题视频', violationType: 'copyright', action: 'warn', operator: 'editor', time: '2024-01-14 15:20:00' },
  { id: '3', videoTitle: '低质量视频', violationType: 'quality', action: 'limit', operator: 'admin', time: '2024-01-13 09:15:00' }
])

function getStatusType(status: string) {
  const map: Record<string, 'info' | 'warning' | 'success' | 'danger'> = {
    pending: 'warning',
    reviewing: 'info',
    approved: 'success',
    rejected: 'danger'
  }
  return map[status] || 'info'
}

function getStatusText(status: string) {
  const map: Record<string, string> = {
    pending: '待审核',
    reviewing: '审核中',
    approved: '已通过',
    rejected: '已驳回'
  }
  return map[status] || status
}

function handlePreview(row: AuditVideo) {
  currentVideo.value = row
  auditForm.result = 'approved'
  auditForm.reason = ''
  auditForm.violationTypes = []
  auditForm.actions = []
  auditForm.banDuration = ''
  auditDialogVisible.value = true
}

async function handleQuickApprove(row: AuditVideo) {
  try {
    await ElMessageBox.confirm(`确定通过视频 "${row.title}" 吗？`, '快速通过', { type: 'info' })
    ElMessage.success('审核通过')
  } catch {}
}

async function handleQuickReject(row: AuditVideo) {
  try {
    const { value } = await ElMessageBox.prompt('请输入驳回原因', '快速驳回', {
      inputPattern: /\S/,
      inputErrorMessage: '请输入驳回原因'
    })
    ElMessage.success('已驳回: ' + value)
  } catch {}
}

function handleViewLog(row: AuditVideo) {
  ElMessage.info(`查看 ${row.title} 的审核日志`)
}

function submitAudit() {
  if (auditForm.result === 'rejected' && !auditForm.reason) {
    ElMessage.warning('请输入驳回原因')
    return
  }
  ElMessage.success(auditForm.result === 'approved' ? '审核通过' : '已驳回')
  auditDialogVisible.value = false
}

async function handleAutoAudit() {
  autoAuditing.value = true
  await new Promise(r => setTimeout(r, 2000))
  autoAuditing.value = false
  ElMessage.success('AI 智能审核完成，已处理 15 个视频')
}

function loadLogs() {
  ElMessage.success('日志已刷新')
}

// 违规处理相关
function showViolationRecords() {
  violationDialogVisible.value = true
}

function getViolationTagType(type: string) {
  const map: Record<string, 'danger' | 'warning' | 'info'> = {
    content: 'danger',
    copyright: 'warning',
    quality: 'info',
    other: 'info'
  }
  return map[type] || 'info'
}

function getViolationText(type: string) {
  const map: Record<string, string> = {
    content: '内容违规',
    copyright: '版权问题',
    quality: '质量不合格',
    other: '其他'
  }
  return map[type] || type
}

function getActionTagType(action: string) {
  const map: Record<string, 'danger' | 'warning' | 'info'> = {
    delete: 'danger',
    ban: 'danger',
    warn: 'warning',
    limit: 'info'
  }
  return map[action] || 'info'
}

function getActionText(action: string) {
  const map: Record<string, string> = {
    delete: '删除视频',
    warn: '警告作者',
    ban: '封禁账号',
    limit: '限制发布'
  }
  return map[action] || action
}

function handleAppeal(row: any) {
  ElMessageBox.prompt('请输入申诉理由', '申诉处理', {
    inputType: 'textarea',
    inputPlaceholder: '请详细说明申诉理由...'
  }).then(({ value }) => {
    ElMessage.success('申诉已提交，等待处理')
  }).catch(() => {})
}

onMounted(() => {
  // 加载数据
})
</script>

<style scoped lang="scss">
.video-audit-page {
  .audit-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 16px;
    
    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;
        gap: 16px;
        
        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          
          &.pending { background: #e6a23c; }
          &.reviewing { background: #409eff; }
          &.approved { background: #67c23a; }
          &.rejected { background: #f56c6c; }
        }
        
        .stat-info {
          .stat-value {
            display: block;
            font-size: 28px;
            font-weight: 600;
            color: var(--color-text-primary);
          }
          
          .stat-label {
            font-size: 13px;
            color: var(--color-text-tertiary);
          }
        }
      }
    }
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }
  }
  
  .video-info {
    display: flex;
    gap: 12px;
    
    .cover {
      width: 120px;
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
      gap: 4px;
      
      .title {
        font-weight: 500;
        color: var(--color-text-primary);
      }
      
      .meta {
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
  
  .ai-result {
    display: flex;
    flex-direction: column;
    gap: 4px;
    
    .ai-tags {
      display: flex;
      gap: 4px;
    }
    
    .ai-score {
      font-size: 12px;
      color: var(--color-text-tertiary);
    }
  }
  
  .text-tertiary {
    color: var(--color-text-tertiary);
    font-size: 13px;
  }
  
  .pagination-wrap {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }
  
  .log-content {
    .log-user {
      font-weight: 500;
      color: var(--color-primary);
    }
    
    .log-action {
      margin: 0 8px;
    }
    
    .log-video {
      color: var(--color-text-secondary);
    }
    
    .log-reason {
      margin-top: 4px;
      font-size: 12px;
      color: var(--color-text-tertiary);
    }
  }
}

.audit-dialog {
  .video-section {
    margin-bottom: 16px;
  }
  
  .info-section {
    margin-bottom: 16px;
    
    h3 {
      margin: 0 0 8px;
      color: var(--color-text-primary);
    }
    
    p {
      color: var(--color-text-secondary);
      margin: 0 0 16px;
    }
    
    .ai-analysis {
      h4 {
        margin: 0 0 8px;
        font-size: 14px;
        color: var(--color-text-primary);
      }
    }
  }
}

@media (max-width: 1200px) {
  .video-audit-page .audit-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
