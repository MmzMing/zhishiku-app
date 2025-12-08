<template>
  <div class="app-monitor-page">
    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon" style="background: #409eff"><el-icon :size="28"><Timer /></el-icon></div>
          <div class="stat-info">
            <span class="stat-value">{{ performanceStats.avgLoadTime }}ms</span>
            <span class="stat-label">平均加载时间</span>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon" style="background: #f56c6c"><el-icon :size="28"><Warning /></el-icon></div>
          <div class="stat-info">
            <span class="stat-value">{{ performanceStats.errorCount }}</span>
            <span class="stat-label">今日错误</span>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon" style="background: #67c23a"><el-icon :size="28"><Connection /></el-icon></div>
          <div class="stat-info">
            <span class="stat-value">{{ performanceStats.apiSuccessRate }}%</span>
            <span class="stat-label">API成功率</span>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon" style="background: #e6a23c"><el-icon :size="28"><User /></el-icon></div>
          <div class="stat-info">
            <span class="stat-value">{{ performanceStats.activeSessions }}</span>
            <span class="stat-label">活跃会话</span>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 前端性能监控 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <span><el-icon><Stopwatch /></el-icon> 前端性能监控 (Core Web Vitals)</span>
          <el-date-picker v-model="dateRange" type="daterange" size="small" style="width: 240px" />
        </div>
      </template>
      <el-row :gutter="24">
        <el-col :span="6" v-for="metric in webVitals" :key="metric.name">
          <div class="metric-card" :class="metric.status">
            <div class="metric-header">
              <span class="metric-name">{{ metric.name }}</span>
              <el-tag :type="metric.status === 'good' ? 'success' : metric.status === 'needs-improvement' ? 'warning' : 'danger'" size="small">
                {{ metric.status === 'good' ? '良好' : metric.status === 'needs-improvement' ? '需改进' : '较差' }}
              </el-tag>
            </div>
            <div class="metric-value">{{ metric.value }}{{ metric.unit }}</div>
            <div class="metric-desc">{{ metric.description }}</div>
            <div class="metric-threshold">
              <span>目标: {{ metric.threshold }}{{ metric.unit }}</span>
              <span :class="metric.value <= metric.threshold ? 'pass' : 'fail'">
                {{ metric.value <= metric.threshold ? '达标' : '未达标' }}
              </span>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
    
    <el-row :gutter="16" style="margin-top: 16px">
      <!-- 错误追踪 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span><el-icon><Warning /></el-icon> 错误追踪 (Sentry)</span>
              <el-button type="danger" size="small" plain>查看Sentry</el-button>
            </div>
          </template>
          <div class="error-list">
            <div class="error-item" v-for="error in errors" :key="error.id">
              <div class="error-header">
                <el-tag :type="error.level === 'error' ? 'danger' : 'warning'" size="small">{{ error.level.toUpperCase() }}</el-tag>
                <span class="error-type">{{ error.type }}</span>
                <span class="error-count">{{ error.count }} 次</span>
              </div>
              <div class="error-message">{{ error.message }}</div>
              <div class="error-meta">
                <span>{{ error.file }}:{{ error.line }}</span>
                <span>{{ error.time }}</span>
              </div>
              <div class="error-actions">
                <el-button size="small" type="primary" link @click="viewErrorDetail(error)">详情</el-button>
                <el-button size="small" link @click="ignoreError(error)">忽略</el-button>
                <el-button size="small" link @click="resolveError(error)">已解决</el-button>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- API调用监控 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span><el-icon><Connection /></el-icon> API调用监控</span>
              <el-select v-model="apiTimeRange" size="small" style="width: 100px">
                <el-option label="1小时" value="1h" />
                <el-option label="6小时" value="6h" />
                <el-option label="24小时" value="24h" />
              </el-select>
            </div>
          </template>
          <el-table :data="apiStats" stripe size="small">
            <el-table-column prop="endpoint" label="接口" min-width="180" show-overflow-tooltip />
            <el-table-column prop="method" label="方法" width="70">
              <template #default="{ row }">
                <el-tag :type="getMethodType(row.method)" size="small">{{ row.method }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="calls" label="调用次数" width="90" sortable />
            <el-table-column prop="avgTime" label="平均耗时" width="90" sortable>
              <template #default="{ row }">
                <span :class="{ 'slow': row.avgTime > 500 }">{{ row.avgTime }}ms</span>
              </template>
            </el-table-column>
            <el-table-column prop="successRate" label="成功率" width="90">
              <template #default="{ row }">
                <span :class="{ 'low-rate': row.successRate < 99 }">{{ row.successRate }}%</span>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.successRate >= 99 ? 'success' : row.successRate >= 95 ? 'warning' : 'danger'" size="small">
                  {{ row.successRate >= 99 ? '正常' : row.successRate >= 95 ? '警告' : '异常' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 用户会话追踪 -->
    <el-card style="margin-top: 16px">
      <template #header>
        <div class="card-header">
          <span><el-icon><User /></el-icon> 用户会话追踪</span>
          <div>
            <el-input v-model="sessionSearch" placeholder="搜索用户/会话ID" style="width: 200px; margin-right: 12px" size="small" clearable />
            <el-button type="primary" size="small" @click="exportSessions">导出</el-button>
          </div>
        </div>
      </template>
      <el-table :data="sessions" stripe>
        <el-table-column prop="sessionId" label="会话ID" width="140" show-overflow-tooltip />
        <el-table-column label="用户" width="140">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :size="28" :src="row.avatar" />
              <span>{{ row.username }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="device" label="设备" width="120" />
        <el-table-column prop="browser" label="浏览器" width="100" />
        <el-table-column prop="startTime" label="开始时间" width="160" />
        <el-table-column prop="duration" label="时长" width="100" />
        <el-table-column prop="pageViews" label="页面浏览" width="90" />
        <el-table-column prop="actions" label="操作数" width="80" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.active ? 'success' : 'info'" size="small">{{ row.active ? '活跃' : '结束' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="viewSessionDetail(row)">详情</el-button>
            <el-button size="small" type="primary" link @click="replaySession(row)">回放</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 错误详情弹窗 -->
    <el-dialog v-model="errorDetailVisible" title="错误详情" width="700px">
      <div v-if="currentError" class="error-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="错误类型">{{ currentError.type }}</el-descriptions-item>
          <el-descriptions-item label="级别">
            <el-tag :type="currentError.level === 'error' ? 'danger' : 'warning'" size="small">{{ currentError.level.toUpperCase() }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="文件位置" :span="2">{{ currentError.file }}:{{ currentError.line }}</el-descriptions-item>
          <el-descriptions-item label="错误信息" :span="2">{{ currentError.message }}</el-descriptions-item>
          <el-descriptions-item label="发生次数">{{ currentError.count }} 次</el-descriptions-item>
          <el-descriptions-item label="最近发生">{{ currentError.time }}</el-descriptions-item>
        </el-descriptions>
        <div class="stack-trace">
          <h4>堆栈追踪</h4>
          <pre>{{ currentError.stack || 'Error: ' + currentError.message + '\n    at xxx.vue:123\n    at yyy.ts:456' }}</pre>
        </div>
      </div>
    </el-dialog>
    
    <!-- 会话详情弹窗 -->
    <el-dialog v-model="sessionDetailVisible" title="会话详情" width="800px">
      <div v-if="currentSession" class="session-detail">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="会话ID">{{ currentSession.sessionId }}</el-descriptions-item>
          <el-descriptions-item label="用户">{{ currentSession.username }}</el-descriptions-item>
          <el-descriptions-item label="设备">{{ currentSession.device }}</el-descriptions-item>
          <el-descriptions-item label="浏览器">{{ currentSession.browser }}</el-descriptions-item>
          <el-descriptions-item label="开始时间">{{ currentSession.startTime }}</el-descriptions-item>
          <el-descriptions-item label="时长">{{ currentSession.duration }}</el-descriptions-item>
        </el-descriptions>
        <h4 style="margin-top: 16px">用户行为轨迹</h4>
        <el-timeline>
          <el-timeline-item v-for="action in sessionActions" :key="action.id" :timestamp="action.time" placement="top">
            <el-tag :type="action.type === 'click' ? 'primary' : action.type === 'navigate' ? 'success' : 'info'" size="small">{{ action.type }}</el-tag>
            {{ action.description }}
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Timer, Warning, Connection, User, Stopwatch } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 统计数据
const performanceStats = reactive({
  avgLoadTime: 1250,
  errorCount: 23,
  apiSuccessRate: 99.2,
  activeSessions: 156
})

const dateRange = ref<[Date, Date] | null>(null)

// Web Vitals
const webVitals = ref([
  { name: 'FP', value: 800, unit: 'ms', threshold: 1000, status: 'good', description: 'First Paint 首次绘制' },
  { name: 'FCP', value: 1200, unit: 'ms', threshold: 1800, status: 'good', description: 'First Contentful Paint' },
  { name: 'LCP', value: 2500, unit: 'ms', threshold: 2500, status: 'good', description: 'Largest Contentful Paint' },
  { name: 'CLS', value: 0.08, unit: '', threshold: 0.1, status: 'good', description: 'Cumulative Layout Shift' },
])

// 错误列表
const errors = ref([
  { id: 1, type: 'TypeError', level: 'error', message: "Cannot read properties of undefined (reading 'id')", file: 'src/views/user/index.vue', line: 45, count: 12, time: '2024-01-15 14:30:00' },
  { id: 2, type: 'NetworkError', level: 'error', message: 'Failed to fetch /api/users', file: 'src/api/user.ts', line: 23, count: 5, time: '2024-01-15 14:25:00' },
  { id: 3, type: 'ChunkLoadError', level: 'warning', message: 'Loading chunk 7 failed', file: 'router/index.ts', line: 0, count: 3, time: '2024-01-15 14:20:00' },
])

// API统计
const apiTimeRange = ref('1h')
const apiStats = ref([
  { endpoint: '/api/users', method: 'GET', calls: 1520, avgTime: 45, successRate: 99.8 },
  { endpoint: '/api/videos', method: 'GET', calls: 890, avgTime: 120, successRate: 99.5 },
  { endpoint: '/api/blogs', method: 'POST', calls: 56, avgTime: 280, successRate: 98.2 },
  { endpoint: '/api/upload', method: 'POST', calls: 23, avgTime: 1500, successRate: 95.6 },
  { endpoint: '/api/auth/login', method: 'POST', calls: 256, avgTime: 85, successRate: 99.9 },
])

// 会话列表
const sessionSearch = ref('')
const sessions = ref([
  { sessionId: 'sess_abc123', username: '张三', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', device: 'Desktop', browser: 'Chrome', startTime: '2024-01-15 09:00:00', duration: '5h 30m', pageViews: 45, actions: 120, active: true },
  { sessionId: 'sess_def456', username: '李四', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2', device: 'Mobile', browser: 'Safari', startTime: '2024-01-15 10:30:00', duration: '2h 15m', pageViews: 28, actions: 65, active: true },
  { sessionId: 'sess_ghi789', username: '王五', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3', device: 'Tablet', browser: 'Firefox', startTime: '2024-01-15 08:00:00', duration: '1h 45m', pageViews: 15, actions: 35, active: false },
])

// 弹窗
const errorDetailVisible = ref(false)
const currentError = ref<typeof errors.value[0] | null>(null)

const sessionDetailVisible = ref(false)
const currentSession = ref<typeof sessions.value[0] | null>(null)

const sessionActions = ref([
  { id: 1, type: 'navigate', description: '访问首页', time: '09:00:00' },
  { id: 2, type: 'click', description: '点击视频列表', time: '09:00:15' },
  { id: 3, type: 'navigate', description: '进入视频详情页', time: '09:00:20' },
  { id: 4, type: 'scroll', description: '滚动页面', time: '09:01:00' },
  { id: 5, type: 'click', description: '点击收藏按钮', time: '09:02:30' },
])

function getMethodType(method: string) {
  const map: Record<string, string> = { GET: 'success', POST: 'primary', PUT: 'warning', DELETE: 'danger' }
  return map[method] || 'info'
}

function viewErrorDetail(error: typeof errors.value[0]) {
  currentError.value = error
  errorDetailVisible.value = true
}

function ignoreError(error: typeof errors.value[0]) {
  ElMessage.info(`已忽略错误: ${error.type}`)
}

function resolveError(error: typeof errors.value[0]) {
  ElMessage.success(`已标记为已解决: ${error.type}`)
}

function viewSessionDetail(session: typeof sessions.value[0]) {
  currentSession.value = session
  sessionDetailVisible.value = true
}

function replaySession(session: typeof sessions.value[0]) {
  ElMessage.info(`开始回放会话: ${session.sessionId}`)
}

function exportSessions() {
  ElMessage.success('会话数据导出成功')
}
</script>

<style scoped lang="scss">
.app-monitor-page {
  .stats-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 16px;
    
    .stat-card .stat-content {
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
      }
      
      .stat-info {
        .stat-value { display: block; font-size: 24px; font-weight: 600; color: var(--color-text-primary); }
        .stat-label { font-size: 13px; color: var(--color-text-tertiary); }
      }
    }
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    span { display: flex; align-items: center; gap: 8px; }
  }
  
  .metric-card {
    padding: 16px;
    border-radius: 8px;
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    
    &.good { border-left: 4px solid #67c23a; }
    &.needs-improvement { border-left: 4px solid #e6a23c; }
    &.poor { border-left: 4px solid #f56c6c; }
    
    .metric-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      .metric-name { font-weight: 600; font-size: 16px; }
    }
    
    .metric-value { font-size: 28px; font-weight: 700; color: var(--color-text-primary); }
    .metric-desc { font-size: 12px; color: var(--color-text-tertiary); margin: 8px 0; }
    .metric-threshold {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: var(--color-text-tertiary);
      .pass { color: #67c23a; }
      .fail { color: #f56c6c; }
    }
  }
  
  .error-list {
    .error-item {
      padding: 12px 0;
      border-bottom: 1px solid var(--color-border);
      &:last-child { border-bottom: none; }
      
      .error-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        .error-type { font-weight: 600; }
        .error-count { margin-left: auto; font-size: 12px; color: var(--color-text-tertiary); }
      }
      
      .error-message { font-size: 13px; color: var(--color-text-secondary); margin-bottom: 8px; word-break: break-all; }
      .error-meta { font-size: 12px; color: var(--color-text-tertiary); display: flex; justify-content: space-between; margin-bottom: 8px; }
      .error-actions { display: flex; gap: 8px; }
    }
  }
  
  .slow { color: #e6a23c; font-weight: 600; }
  .low-rate { color: #f56c6c; font-weight: 600; }
  
  .user-cell { display: flex; align-items: center; gap: 8px; }
  
  .error-detail {
    .stack-trace {
      margin-top: 16px;
      h4 { margin-bottom: 8px; }
      pre {
        background: #1e1e1e;
        color: #d4d4d4;
        padding: 16px;
        border-radius: 8px;
        overflow-x: auto;
        font-size: 13px;
        line-height: 1.5;
      }
    }
  }
}

@media (max-width: 1200px) {
  .app-monitor-page .stats-cards { grid-template-columns: repeat(2, 1fr); }
}
</style>
