<template>
  <div class="logs-page">
    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-card class="stat-card" v-for="stat in logStats" :key="stat.level">
        <div class="stat-content" :class="stat.level">
          <div class="stat-value">{{ stat.count.toLocaleString() }}</div>
          <div class="stat-label">{{ stat.label }}</div>
          <div class="stat-trend" :class="stat.trend > 0 ? 'up' : 'down'">
            {{ stat.trend > 0 ? '↑' : '↓' }} {{ Math.abs(stat.trend) }}%
          </div>
        </div>
      </el-card>
    </div>
    
    <el-row :gutter="16">
      <!-- 日志查询 -->
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span><el-icon><Document /></el-icon> 日志查询</span>
              <div>
                <el-button :icon="Refresh" size="small" @click="refreshLogs">刷新</el-button>
                <el-button type="primary" :icon="Download" size="small" @click="exportLogs">导出</el-button>
              </div>
            </div>
          </template>
          
          <!-- 筛选区 -->
          <div class="filter-area">
            <el-input v-model="searchKeyword" placeholder="搜索关键词" style="width: 200px" clearable>
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
            <el-select v-model="filterLevel" placeholder="日志级别" style="width: 120px" clearable>
              <el-option label="全部" value="" />
              <el-option label="DEBUG" value="debug">
                <el-tag type="info" size="small">DEBUG</el-tag>
              </el-option>
              <el-option label="INFO" value="info">
                <el-tag type="success" size="small">INFO</el-tag>
              </el-option>
              <el-option label="WARN" value="warn">
                <el-tag type="warning" size="small">WARN</el-tag>
              </el-option>
              <el-option label="ERROR" value="error">
                <el-tag type="danger" size="small">ERROR</el-tag>
              </el-option>
            </el-select>
            <el-select v-model="filterSource" placeholder="日志来源" style="width: 140px" clearable>
              <el-option label="全部来源" value="" />
              <el-option label="应用服务" value="app" />
              <el-option label="Web服务" value="web" />
              <el-option label="数据库" value="db" />
              <el-option label="缓存服务" value="cache" />
              <el-option label="消息队列" value="mq" />
            </el-select>
            <el-date-picker v-model="dateRange" type="datetimerange" start-placeholder="开始时间" end-placeholder="结束时间" style="width: 340px" />
            <el-checkbox v-model="autoRefresh">自动刷新</el-checkbox>
          </div>
          
          <!-- 日志列表 -->
          <div class="log-viewer" ref="logViewerRef">
            <div class="log-entry" v-for="log in logs" :key="log.id" :class="log.level" @click="selectLog(log)">
              <span class="log-time">{{ log.time }}</span>
              <el-tag :type="getLevelType(log.level)" size="small" class="log-level">{{ log.level.toUpperCase() }}</el-tag>
              <span class="log-source">[{{ log.source }}]</span>
              <span class="log-message">{{ log.message }}</span>
            </div>
          </div>
          
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[50, 100, 200, 500]"
            layout="total, sizes, prev, pager, next"
            style="margin-top: 16px; justify-content: flex-end"
          />
        </el-card>
      </el-col>
      
      <!-- 右侧面板 -->
      <el-col :span="8">
        <!-- 日志详情 -->
        <el-card v-if="selectedLog">
          <template #header>
            <div class="card-header">
              <span>日志详情</span>
              <el-button type="text" size="small" @click="selectedLog = null">关闭</el-button>
            </div>
          </template>
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="时间">{{ selectedLog.time }}</el-descriptions-item>
            <el-descriptions-item label="级别">
              <el-tag :type="getLevelType(selectedLog.level)" size="small">{{ selectedLog.level.toUpperCase() }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="来源">{{ selectedLog.source }}</el-descriptions-item>
            <el-descriptions-item label="线程">{{ selectedLog.thread || 'main' }}</el-descriptions-item>
            <el-descriptions-item label="类名">{{ selectedLog.className || '-' }}</el-descriptions-item>
          </el-descriptions>
          <div class="log-detail-message">
            <h4>消息内容</h4>
            <pre>{{ selectedLog.message }}</pre>
          </div>
          <div v-if="selectedLog.stackTrace" class="log-stack-trace">
            <h4>堆栈信息</h4>
            <pre>{{ selectedLog.stackTrace }}</pre>
          </div>
        </el-card>
        
        <!-- 日志分析 -->
        <el-card :style="{ marginTop: selectedLog ? '16px' : '0' }">
          <template #header><span>日志分析</span></template>
          <div class="analysis-section">
            <h4>级别分布</h4>
            <div class="level-distribution">
              <div class="level-bar" v-for="item in levelDistribution" :key="item.level">
                <span class="level-name">{{ item.level }}</span>
                <el-progress :percentage="item.percentage" :stroke-width="12" :color="item.color" :show-text="false" />
                <span class="level-count">{{ item.count }}</span>
              </div>
            </div>
          </div>
          <div class="analysis-section">
            <h4>高频错误</h4>
            <div class="frequent-errors">
              <div class="error-item" v-for="error in frequentErrors" :key="error.pattern">
                <span class="error-pattern">{{ error.pattern }}</span>
                <el-tag type="danger" size="small">{{ error.count }} 次</el-tag>
              </div>
            </div>
          </div>
          <div class="analysis-section">
            <h4>时间趋势</h4>
            <div class="time-trend">
              <div class="trend-bar" v-for="(count, hour) in hourlyTrend" :key="hour">
                <div class="bar" :style="{ height: count / 10 + 'px' }"></div>
                <span class="hour">{{ hour }}h</span>
              </div>
            </div>
          </div>
        </el-card>
        
        <!-- 日志归档 -->
        <el-card style="margin-top: 16px">
          <template #header>
            <div class="card-header">
              <span>日志归档</span>
              <el-button type="primary" size="small" @click="showArchiveDialog">归档设置</el-button>
            </div>
          </template>
          <div class="archive-list">
            <div class="archive-item" v-for="archive in archives" :key="archive.id">
              <div class="archive-info">
                <el-icon><Folder /></el-icon>
                <div>
                  <span class="archive-name">{{ archive.name }}</span>
                  <span class="archive-meta">{{ archive.size }} | {{ archive.date }}</span>
                </div>
              </div>
              <div class="archive-actions">
                <el-button size="small" type="primary" link>下载</el-button>
                <el-button size="small" type="danger" link>删除</el-button>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 归档设置弹窗 -->
    <el-dialog v-model="archiveDialogVisible" title="归档设置" width="500px">
      <el-form label-width="120px">
        <el-form-item label="自动归档">
          <el-switch v-model="archiveSettings.enabled" />
        </el-form-item>
        <el-form-item label="归档周期" v-if="archiveSettings.enabled">
          <el-select v-model="archiveSettings.period" style="width: 100%">
            <el-option label="每天" value="daily" />
            <el-option label="每周" value="weekly" />
            <el-option label="每月" value="monthly" />
          </el-select>
        </el-form-item>
        <el-form-item label="保留时间">
          <el-input-number v-model="archiveSettings.retentionDays" :min="7" :max="365" />
          <span style="margin-left: 8px">天</span>
        </el-form-item>
        <el-form-item label="归档级别">
          <el-checkbox-group v-model="archiveSettings.levels">
            <el-checkbox value="debug">DEBUG</el-checkbox>
            <el-checkbox value="info">INFO</el-checkbox>
            <el-checkbox value="warn">WARN</el-checkbox>
            <el-checkbox value="error">ERROR</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="压缩格式">
          <el-radio-group v-model="archiveSettings.format">
            <el-radio value="gzip">.gz</el-radio>
            <el-radio value="zip">.zip</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="archiveDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveArchiveSettings">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Document, Search, Refresh, Download, Folder } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 统计数据
const logStats = ref([
  { level: 'total', label: '总日志', count: 125680, trend: 5.2 },
  { level: 'error', label: 'ERROR', count: 128, trend: -12.5 },
  { level: 'warn', label: 'WARN', count: 856, trend: 3.1 },
  { level: 'info', label: 'INFO', count: 98520, trend: 8.4 },
])

// 筛选条件
const searchKeyword = ref('')
const filterLevel = ref('')
const filterSource = ref('')
const dateRange = ref<[Date, Date] | null>(null)
const autoRefresh = ref(false)
const currentPage = ref(1)
const pageSize = ref(100)
const total = ref(125680)

// 日志列表
const logs = ref([
  { id: 1, time: '2024-01-15 14:30:25.123', level: 'error', source: 'app', message: 'NullPointerException: Cannot invoke method on null object', thread: 'http-nio-8080-exec-5', className: 'com.example.UserService', stackTrace: 'java.lang.NullPointerException\n\tat com.example.UserService.getUser(UserService.java:45)' },
  { id: 2, time: '2024-01-15 14:30:24.856', level: 'warn', source: 'db', message: 'Slow query detected: SELECT * FROM users WHERE ... (took 2356ms)', thread: 'pool-1-thread-3', className: 'com.example.repository.UserRepository' },
  { id: 3, time: '2024-01-15 14:30:24.452', level: 'info', source: 'web', message: 'Request completed: GET /api/users/123 - 200 OK (45ms)', thread: 'http-nio-8080-exec-2' },
  { id: 4, time: '2024-01-15 14:30:24.123', level: 'info', source: 'app', message: 'User login successful: userId=123, ip=192.168.1.100', thread: 'http-nio-8080-exec-1' },
  { id: 5, time: '2024-01-15 14:30:23.789', level: 'debug', source: 'cache', message: 'Cache hit for key: user:123', thread: 'pool-2-thread-1' },
  { id: 6, time: '2024-01-15 14:30:23.456', level: 'info', source: 'mq', message: 'Message consumed: queue=notification, messageId=abc123', thread: 'consumer-1' },
  { id: 7, time: '2024-01-15 14:30:22.789', level: 'error', source: 'app', message: 'Failed to send email: Connection timeout', thread: 'async-executor-3', stackTrace: 'java.net.SocketTimeoutException\n\tat EmailService.send(EmailService.java:78)' },
  { id: 8, time: '2024-01-15 14:30:22.123', level: 'warn', source: 'web', message: 'Rate limit exceeded for IP: 192.168.1.50', thread: 'http-nio-8080-exec-4' },
])

const selectedLog = ref<typeof logs.value[0] | null>(null)

// 分析数据
const levelDistribution = ref([
  { level: 'DEBUG', count: 25680, percentage: 20, color: '#909399' },
  { level: 'INFO', count: 98520, percentage: 78, color: '#67c23a' },
  { level: 'WARN', count: 856, percentage: 1, color: '#e6a23c' },
  { level: 'ERROR', count: 128, percentage: 1, color: '#f56c6c' },
])

const frequentErrors = ref([
  { pattern: 'NullPointerException', count: 45 },
  { pattern: 'Connection timeout', count: 28 },
  { pattern: 'Database connection failed', count: 15 },
  { pattern: 'Authentication failed', count: 12 },
])

const hourlyTrend = ref({
  0: 120, 1: 80, 2: 50, 3: 30, 4: 25, 5: 40,
  6: 150, 7: 320, 8: 580, 9: 720, 10: 850, 11: 920,
  12: 680, 13: 750, 14: 820, 15: 780, 16: 650, 17: 520,
  18: 380, 19: 290, 20: 220, 21: 180, 22: 150, 23: 130
})

// 归档
const archives = ref([
  { id: 1, name: 'logs-2024-01-14.gz', size: '256 MB', date: '2024-01-15 00:00' },
  { id: 2, name: 'logs-2024-01-13.gz', size: '312 MB', date: '2024-01-14 00:00' },
  { id: 3, name: 'logs-2024-01-12.gz', size: '289 MB', date: '2024-01-13 00:00' },
])

const archiveDialogVisible = ref(false)
const archiveSettings = reactive({
  enabled: true,
  period: 'daily',
  retentionDays: 30,
  levels: ['info', 'warn', 'error'] as string[],
  format: 'gzip'
})

function getLevelType(level: string) {
  const map: Record<string, string> = { debug: 'info', info: 'success', warn: 'warning', error: 'danger' }
  return map[level] || 'info'
}

function selectLog(log: typeof logs.value[0]) {
  selectedLog.value = log
}

function refreshLogs() {
  ElMessage.success('日志已刷新')
}

function exportLogs() {
  ElMessage.success('日志导出任务已创建')
}

function showArchiveDialog() {
  archiveDialogVisible.value = true
}

function saveArchiveSettings() {
  ElMessage.success('归档设置已保存')
  archiveDialogVisible.value = false
}
</script>

<style scoped lang="scss">
.logs-page {
  .stats-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 16px;
    
    .stat-card .stat-content {
      text-align: center;
      padding: 8px;
      
      &.error .stat-value { color: #f56c6c; }
      &.warn .stat-value { color: #e6a23c; }
      &.info .stat-value { color: #67c23a; }
      
      .stat-value { font-size: 28px; font-weight: 700; color: var(--color-text-primary); }
      .stat-label { font-size: 13px; color: var(--color-text-tertiary); margin-top: 4px; }
      .stat-trend { font-size: 12px; margin-top: 4px; &.up { color: #f56c6c; } &.down { color: #67c23a; } }
    }
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    span { display: flex; align-items: center; gap: 8px; }
  }
  
  .filter-area {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }
  
  .log-viewer {
    background: var(--color-bg-tertiary);
    border-radius: 8px;
    padding: 12px;
    max-height: 500px;
    overflow-y: auto;
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 13px;
    border: 1px solid var(--color-border);
    
    .log-entry {
      padding: 6px 8px;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      
      &:hover { background: var(--color-bg-secondary); }
      &.error { color: var(--color-error); }
      &.warn { color: var(--color-warning); }
      &.info { color: var(--color-text-primary); }
      &.debug { color: var(--color-text-tertiary); }
      
      .log-time { color: var(--color-info); min-width: 180px; }
      .log-level { min-width: 60px; }
      .log-source { color: var(--color-success); min-width: 60px; }
      .log-message { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    }
  }
  
  .log-detail-message, .log-stack-trace {
    margin-top: 16px;
    h4 { margin-bottom: 8px; font-size: 14px; color: var(--color-text-primary); }
    pre {
      background: var(--color-bg-tertiary);
      color: var(--color-text-primary);
      padding: 12px;
      border-radius: 6px;
      border: 1px solid var(--color-border);
      font-size: 12px;
      overflow-x: auto;
      max-height: 200px;
    }
  }
  
  .analysis-section {
    margin-bottom: 20px;
    &:last-child { margin-bottom: 0; }
    h4 { font-size: 14px; margin-bottom: 12px; }
  }
  
  .level-distribution .level-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
    .level-name { width: 50px; font-size: 12px; }
    .el-progress { flex: 1; }
    .level-count { width: 50px; text-align: right; font-size: 12px; color: var(--color-text-tertiary); }
  }
  
  .frequent-errors .error-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid var(--color-border);
    &:last-child { border-bottom: none; }
    .error-pattern { font-size: 13px; }
  }
  
  .time-trend {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    height: 80px;
    
    .trend-bar {
      display: flex;
      flex-direction: column;
      align-items: center;
      .bar { width: 8px; background: #409eff; border-radius: 2px 2px 0 0; }
      .hour { font-size: 10px; color: var(--color-text-tertiary); margin-top: 4px; }
    }
  }
  
  .archive-list .archive-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid var(--color-border);
    &:last-child { border-bottom: none; }
    
    .archive-info {
      display: flex;
      align-items: center;
      gap: 10px;
      .archive-name { display: block; font-weight: 500; }
      .archive-meta { font-size: 12px; color: var(--color-text-tertiary); }
    }
  }
}

@media (max-width: 1200px) {
  .logs-page .stats-cards { grid-template-columns: repeat(2, 1fr); }
}
</style>
