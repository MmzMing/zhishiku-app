<template>
  <div class="audit-page">
    <!-- 顶部Tab -->
    <el-tabs v-model="activeTab">
      <el-tab-pane label="敏感操作记录" name="sensitive" />
      <el-tab-pane label="数据变更追踪" name="changes" />
      <el-tab-pane label="用户行为分析" name="behavior" />
      <el-tab-pane label="合规性报告" name="compliance" />
    </el-tabs>
    
    <!-- 敏感操作记录 -->
    <div v-if="activeTab === 'sensitive'">
      <el-card>
        <template #header>
          <div class="card-header">
            <span><el-icon><Lock /></el-icon> 敏感操作记录</span>
            <div>
              <el-date-picker v-model="sensitiveDateRange" type="daterange" size="small" style="width: 240px; margin-right: 12px" />
              <el-button type="primary" size="small" @click="exportSensitive">导出</el-button>
            </div>
          </div>
        </template>
        
        <div class="filter-bar">
          <el-input v-model="sensitiveSearch" placeholder="搜索用户/操作" style="width: 200px" clearable />
          <el-select v-model="sensitiveType" placeholder="操作类型" style="width: 140px" clearable>
            <el-option label="全部" value="" />
            <el-option label="用户删除" value="user_delete" />
            <el-option label="权限变更" value="permission_change" />
            <el-option label="密码重置" value="password_reset" />
            <el-option label="数据导出" value="data_export" />
            <el-option label="系统配置" value="system_config" />
          </el-select>
          <el-select v-model="sensitiveRisk" placeholder="风险等级" style="width: 120px" clearable>
            <el-option label="全部" value="" />
            <el-option label="高风险" value="high" />
            <el-option label="中风险" value="medium" />
            <el-option label="低风险" value="low" />
          </el-select>
        </div>
        
        <el-table :data="sensitiveOperations" stripe style="margin-top: 16px">
          <el-table-column prop="id" label="操作ID" width="120" />
          <el-table-column label="操作者" width="150">
            <template #default="{ row }">
              <div class="user-cell">
                <el-avatar :size="28" :src="row.avatar" />
                <span>{{ row.operator }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="operation" label="操作类型" width="120">
            <template #default="{ row }">
              <el-tag size="small">{{ row.operation }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="target" label="操作对象" width="150" />
          <el-table-column prop="detail" label="操作详情" min-width="200" show-overflow-tooltip />
          <el-table-column label="风险等级" width="100">
            <template #default="{ row }">
              <el-tag :type="row.risk === 'high' ? 'danger' : row.risk === 'medium' ? 'warning' : 'success'" size="small">
                {{ row.risk === 'high' ? '高' : row.risk === 'medium' ? '中' : '低' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="ip" label="IP地址" width="130" />
          <el-table-column prop="time" label="操作时间" width="160" />
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <el-button size="small" type="primary" link @click="viewSensitiveDetail(row)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
    
    <!-- 数据变更追踪 -->
    <div v-if="activeTab === 'changes'">
      <el-row :gutter="16">
        <el-col :span="16">
          <el-card>
            <template #header>
              <div class="card-header">
                <span><el-icon><Edit /></el-icon> 数据变更记录</span>
                <el-button type="primary" size="small" @click="exportChanges">导出</el-button>
              </div>
            </template>
            
            <div class="filter-bar">
              <el-select v-model="changeTable" placeholder="数据表" style="width: 150px" clearable>
                <el-option label="全部" value="" />
                <el-option label="users" value="users" />
                <el-option label="videos" value="videos" />
                <el-option label="blogs" value="blogs" />
                <el-option label="orders" value="orders" />
                <el-option label="permissions" value="permissions" />
              </el-select>
              <el-select v-model="changeAction" placeholder="操作类型" style="width: 120px" clearable>
                <el-option label="全部" value="" />
                <el-option label="INSERT" value="insert" />
                <el-option label="UPDATE" value="update" />
                <el-option label="DELETE" value="delete" />
              </el-select>
              <el-date-picker v-model="changeDateRange" type="daterange" style="width: 240px" />
            </div>
            
            <el-table :data="dataChanges" stripe style="margin-top: 16px">
              <el-table-column prop="id" label="变更ID" width="100" />
              <el-table-column prop="table" label="数据表" width="100" />
              <el-table-column label="操作" width="90">
                <template #default="{ row }">
                  <el-tag :type="row.action === 'insert' ? 'success' : row.action === 'update' ? 'warning' : 'danger'" size="small">
                    {{ row.action.toUpperCase() }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="recordId" label="记录ID" width="100" />
              <el-table-column prop="operator" label="操作者" width="100" />
              <el-table-column prop="time" label="变更时间" width="160" />
              <el-table-column label="操作" width="120" fixed="right">
                <template #default="{ row }">
                  <el-button size="small" type="primary" link @click="viewChangeDiff(row)">查看差异</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card>
            <template #header><span>变更统计</span></template>
            <div class="change-stats">
              <div class="stat-item" v-for="stat in changeStats" :key="stat.table">
                <div class="stat-info">
                  <span class="stat-table">{{ stat.table }}</span>
                  <span class="stat-count">{{ stat.total }} 次</span>
                </div>
                <div class="stat-bars">
                  <span class="bar insert" :style="{ width: stat.insert + '%' }"></span>
                  <span class="bar update" :style="{ width: stat.update + '%' }"></span>
                  <span class="bar delete" :style="{ width: stat.delete + '%' }"></span>
                </div>
              </div>
            </div>
            <div class="stats-legend">
              <span class="legend-item"><i class="dot insert"></i>INSERT</span>
              <span class="legend-item"><i class="dot update"></i>UPDATE</span>
              <span class="legend-item"><i class="dot delete"></i>DELETE</span>
            </div>
          </el-card>
          
          <el-card style="margin-top: 16px">
            <template #header><span>最近回滚</span></template>
            <el-timeline>
              <el-timeline-item v-for="rollback in recentRollbacks" :key="rollback.id" :timestamp="rollback.time" placement="top">
                <p><strong>{{ rollback.operator }}</strong> 回滚了 <el-tag size="small">{{ rollback.table }}</el-tag></p>
                <p class="rollback-reason">原因: {{ rollback.reason }}</p>
              </el-timeline-item>
            </el-timeline>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 用户行为分析 -->
    <div v-if="activeTab === 'behavior'">
      <el-row :gutter="16">
        <el-col :span="16">
          <el-card>
            <template #header>
              <div class="card-header">
                <span><el-icon><DataAnalysis /></el-icon> 行为分析</span>
                <el-select v-model="behaviorTimeRange" size="small" style="width: 120px">
                  <el-option label="今日" value="today" />
                  <el-option label="本周" value="week" />
                  <el-option label="本月" value="month" />
                </el-select>
              </div>
            </template>
            
            <div class="behavior-overview">
              <div class="behavior-stat" v-for="stat in behaviorStats" :key="stat.label">
                <div class="stat-value">{{ stat.value.toLocaleString() }}</div>
                <div class="stat-label">{{ stat.label }}</div>
                <div class="stat-trend" :class="stat.trend > 0 ? 'up' : 'down'">
                  {{ stat.trend > 0 ? '↑' : '↓' }} {{ Math.abs(stat.trend) }}%
                </div>
              </div>
            </div>
            
            <h4 style="margin: 24px 0 16px">行为模式识别</h4>
            <el-table :data="behaviorPatterns" stripe>
              <el-table-column prop="pattern" label="行为模式" min-width="200" />
              <el-table-column prop="users" label="涉及用户" width="100" />
              <el-table-column prop="frequency" label="发生频率" width="100" />
              <el-table-column label="风险等级" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.risk === 'high' ? 'danger' : row.risk === 'medium' ? 'warning' : 'info'" size="small">
                    {{ row.risk === 'high' ? '高' : row.risk === 'medium' ? '中' : '正常' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120">
                <template #default="{ row }">
                  <div class="action-buttons">
                    <el-button size="small" type="primary" link class="action-btn">详情</el-button>
                    <el-button v-if="row.risk !== 'normal'" size="small" type="warning" link class="action-btn">处理</el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card>
            <template #header><span>异常行为预警</span></template>
            <div class="anomaly-alerts">
              <div class="alert-item" v-for="alert in anomalyAlerts" :key="alert.id">
                <el-icon :color="alert.level === 'critical' ? '#f56c6c' : '#e6a23c'"><Warning /></el-icon>
                <div class="alert-content">
                  <span class="alert-title">{{ alert.title }}</span>
                  <span class="alert-desc">{{ alert.description }}</span>
                  <span class="alert-time">{{ alert.time }}</span>
                </div>
                <el-button size="small" type="primary" @click="handleAlert(alert)">处理</el-button>
              </div>
            </div>
          </el-card>
          
          <el-card style="margin-top: 16px">
            <template #header><span>高频操作用户</span></template>
            <div class="high-frequency-users">
              <div class="user-item" v-for="(user, index) in highFrequencyUsers" :key="user.id">
                <span class="rank">{{ index + 1 }}</span>
                <el-avatar :size="32" :src="user.avatar" />
                <div class="user-info">
                  <span class="username">{{ user.username }}</span>
                  <span class="actions">{{ user.actions }} 次操作</span>
                </div>
                <el-button size="small" type="primary" link>查看</el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 合规性报告 -->
    <div v-if="activeTab === 'compliance'">
      <el-row :gutter="16">
        <el-col :span="16">
          <el-card>
            <template #header>
              <div class="card-header">
                <span><el-icon><Document /></el-icon> 合规性报告</span>
                <el-button type="primary" size="small" @click="generateReport">生成报告</el-button>
              </div>
            </template>
            
            <div class="compliance-overview">
              <div class="compliance-score">
                <el-progress type="dashboard" :percentage="complianceScore" :width="150" :stroke-width="12" :color="getScoreColor(complianceScore)">
                  <template #default>
                    <div class="score-content">
                      <span class="score-value">{{ complianceScore }}</span>
                      <span class="score-label">合规评分</span>
                    </div>
                  </template>
                </el-progress>
              </div>
              <div class="compliance-items">
                <div class="item" v-for="item in complianceItems" :key="item.name">
                  <div class="item-header">
                    <span class="item-name">{{ item.name }}</span>
                    <el-tag :type="item.status === 'pass' ? 'success' : item.status === 'warning' ? 'warning' : 'danger'" size="small">
                      {{ item.status === 'pass' ? '合规' : item.status === 'warning' ? '待改进' : '不合规' }}
                    </el-tag>
                  </div>
                  <el-progress :percentage="item.score" :stroke-width="8" :color="getScoreColor(item.score)" :show-text="false" />
                  <span class="item-score">{{ item.score }}分</span>
                </div>
              </div>
            </div>
          </el-card>
          
          <el-card style="margin-top: 16px">
            <template #header><span>历史报告</span></template>
            <el-table :data="reportHistory" stripe>
              <el-table-column prop="id" label="报告编号" width="140" />
              <el-table-column prop="period" label="报告周期" width="200" />
              <el-table-column prop="score" label="合规评分" width="100">
                <template #default="{ row }">
                  <span :style="{ color: getScoreColor(row.score) }">{{ row.score }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="generator" label="生成人" width="100" />
              <el-table-column prop="createTime" label="生成时间" width="160" />
              <el-table-column label="操作" width="150" fixed="right">
                <template #default="{ row }">
                  <div class="action-buttons">
                    <el-button size="small" type="primary" link @click="viewReport(row)" class="action-btn">查看</el-button>
                    <el-button size="small" link @click="downloadReport(row)" class="action-btn">下载</el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card>
            <template #header><span>合规问题</span></template>
            <div class="compliance-issues">
              <div class="issue-item" v-for="issue in complianceIssues" :key="issue.id">
                <el-icon :color="issue.severity === 'critical' ? '#f56c6c' : '#e6a23c'"><WarningFilled /></el-icon>
                <div class="issue-content">
                  <span class="issue-title">{{ issue.title }}</span>
                  <span class="issue-desc">{{ issue.description }}</span>
                </div>
                <el-button size="small" type="primary" @click="fixIssue(issue)">修复</el-button>
              </div>
            </div>
          </el-card>
          
          <el-card style="margin-top: 16px">
            <template #header><span>合规标准</span></template>
            <div class="standards-list">
              <div class="standard-item" v-for="standard in complianceStandards" :key="standard.name">
                <el-icon :color="standard.compliant ? '#67c23a' : '#f56c6c'">
                  <component :is="standard.compliant ? 'CircleCheck' : 'CircleClose'" />
                </el-icon>
                <span class="standard-name">{{ standard.name }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 变更差异弹窗 -->
    <el-dialog v-model="diffDialogVisible" title="数据变更差异" width="700px">
      <div class="diff-viewer" v-if="currentChange">
        <div class="diff-section">
          <h4>变更前</h4>
          <pre class="before">{{ currentChange.before || '无数据' }}</pre>
        </div>
        <div class="diff-section">
          <h4>变更后</h4>
          <pre class="after">{{ currentChange.after || '无数据' }}</pre>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Lock, Edit, DataAnalysis, Document, Warning, WarningFilled, CircleCheck, CircleClose } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('sensitive')

// 敏感操作
const sensitiveDateRange = ref<[Date, Date] | null>(null)
const sensitiveSearch = ref('')
const sensitiveType = ref('')
const sensitiveRisk = ref('')
const sensitiveOperations = ref([
  { id: 'OP001', operator: 'admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', operation: '用户删除', target: 'user_123', detail: '删除用户账号及相关数据', risk: 'high', ip: '192.168.1.100', time: '2024-01-15 14:30:00' },
  { id: 'OP002', operator: 'admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', operation: '权限变更', target: 'role_editor', detail: '修改编辑者角色权限配置', risk: 'medium', ip: '192.168.1.100', time: '2024-01-15 14:25:00' },
  { id: 'OP003', operator: 'manager', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2', operation: '密码重置', target: 'user_456', detail: '重置用户登录密码', risk: 'medium', ip: '192.168.1.101', time: '2024-01-15 14:20:00' },
  { id: 'OP004', operator: 'admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', operation: '数据导出', target: 'users', detail: '导出全部用户数据', risk: 'high', ip: '192.168.1.100', time: '2024-01-15 14:15:00' },
])

// 数据变更
const changeTable = ref('')
const changeAction = ref('')
const changeDateRange = ref<[Date, Date] | null>(null)
const dataChanges = ref([
  { id: 'C001', table: 'users', action: 'update', recordId: '123', operator: 'admin', time: '2024-01-15 14:30:00', before: '{"name": "张三", "email": "old@test.com"}', after: '{"name": "张三", "email": "new@test.com"}' },
  { id: 'C002', table: 'videos', action: 'insert', recordId: '456', operator: 'editor', time: '2024-01-15 14:25:00', before: null, after: '{"title": "新视频", "status": "draft"}' },
  { id: 'C003', table: 'blogs', action: 'delete', recordId: '789', operator: 'admin', time: '2024-01-15 14:20:00', before: '{"title": "旧博客"}', after: null },
])

const changeStats = ref([
  { table: 'users', total: 256, insert: 20, update: 70, delete: 10 },
  { table: 'videos', total: 189, insert: 40, update: 55, delete: 5 },
  { table: 'blogs', total: 145, insert: 35, update: 60, delete: 5 },
  { table: 'orders', total: 98, insert: 80, update: 18, delete: 2 },
])

const recentRollbacks = ref([
  { id: 1, operator: 'admin', table: 'users', reason: '误删除用户数据', time: '2024-01-15 10:30' },
  { id: 2, operator: 'manager', table: 'videos', reason: '状态更新错误', time: '2024-01-14 16:20' },
])

// 行为分析
const behaviorTimeRange = ref('today')
const behaviorStats = ref([
  { label: '总操作数', value: 12580, trend: 8.5 },
  { label: '活跃用户', value: 856, trend: 5.2 },
  { label: '异常行为', value: 12, trend: -15.3 },
  { label: '高频操作', value: 45, trend: 3.1 },
])

const behaviorPatterns = ref([
  { pattern: '频繁登录失败后成功登录', users: 3, frequency: '5次/天', risk: 'high' },
  { pattern: '非工作时间批量下载', users: 2, frequency: '2次/周', risk: 'medium' },
  { pattern: '短时间内大量删除操作', users: 1, frequency: '1次/周', risk: 'high' },
  { pattern: '常规数据浏览模式', users: 580, frequency: '持续', risk: 'normal' },
])

const anomalyAlerts = ref([
  { id: 1, title: '异常登录行为', description: '用户 user_123 在异地登录', level: 'critical', time: '5分钟前' },
  { id: 2, title: '大量数据导出', description: '用户 admin 导出超过1000条数据', level: 'warning', time: '15分钟前' },
  { id: 3, title: '权限越级访问', description: '用户 editor 尝试访问管理员功能', level: 'warning', time: '30分钟前' },
])

const highFrequencyUsers = ref([
  { id: 1, username: 'admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', actions: 256 },
  { id: 2, username: 'editor1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2', actions: 189 },
  { id: 3, username: 'manager', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3', actions: 145 },
])

// 合规报告
const complianceScore = ref(85)
const complianceItems = ref([
  { name: '访问控制', score: 92, status: 'pass' },
  { name: '数据加密', score: 88, status: 'pass' },
  { name: '日志记录', score: 95, status: 'pass' },
  { name: '密码策略', score: 75, status: 'warning' },
  { name: '会话管理', score: 82, status: 'pass' },
])

const reportHistory = ref([
  { id: 'RPT-2024-01', period: '2024年1月', score: 85, generator: 'admin', createTime: '2024-01-15 00:00:00' },
  { id: 'RPT-2023-12', period: '2023年12月', score: 82, generator: 'admin', createTime: '2024-01-01 00:00:00' },
  { id: 'RPT-2023-11', period: '2023年11月', score: 78, generator: 'admin', createTime: '2023-12-01 00:00:00' },
])

const complianceIssues = ref([
  { id: 1, title: '密码强度不足', description: '12个用户使用弱密码', severity: 'warning' },
  { id: 2, title: '会话超时过长', description: '当前会话超时设置为24小时', severity: 'warning' },
])

const complianceStandards = ref([
  { name: 'GDPR 数据保护', compliant: true },
  { name: 'ISO 27001 信息安全', compliant: true },
  { name: 'SOC 2 Type II', compliant: true },
  { name: 'PCI DSS 支付安全', compliant: false },
])

// 弹窗
const diffDialogVisible = ref(false)
const currentChange = ref<typeof dataChanges.value[0] | null>(null)

function getScoreColor(score: number) {
  if (score >= 90) return '#67c23a'
  if (score >= 70) return '#e6a23c'
  return '#f56c6c'
}

function viewSensitiveDetail(row: any) {
  ElMessage.info(`查看敏感操作详情: ${row.id}`)
}

function exportSensitive() {
  ElMessage.success('敏感操作记录导出成功')
}

function exportChanges() {
  ElMessage.success('数据变更记录导出成功')
}

function viewChangeDiff(row: typeof dataChanges.value[0]) {
  currentChange.value = row
  diffDialogVisible.value = true
}

function handleAlert(alert: any) {
  ElMessage.success(`已处理预警: ${alert.title}`)
}

function generateReport() {
  ElMessage.success('合规报告生成中...')
}

function viewReport(row: any) {
  ElMessage.info(`查看报告: ${row.id}`)
}

function downloadReport(row: any) {
  ElMessage.success(`下载报告: ${row.id}`)
}

function fixIssue(issue: any) {
  ElMessage.success(`开始修复: ${issue.title}`)
}
</script>

<style scoped lang="scss">
.audit-page {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    span { display: flex; align-items: center; gap: 8px; }
  }
  
  .filter-bar {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
  }
  
  .user-cell { display: flex; align-items: center; gap: 8px; }
  
  .change-stats {
    .stat-item {
      margin-bottom: 16px;
      .stat-info { display: flex; justify-content: space-between; margin-bottom: 6px; .stat-table { font-weight: 500; } .stat-count { font-size: 12px; color: var(--color-text-tertiary); } }
      .stat-bars { display: flex; height: 8px; border-radius: 4px; overflow: hidden; .bar { height: 100%; &.insert { background: #67c23a; } &.update { background: #e6a23c; } &.delete { background: #f56c6c; } } }
    }
  }
  
  .stats-legend { display: flex; justify-content: center; gap: 16px; margin-top: 16px; .legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; .dot { width: 10px; height: 10px; border-radius: 50%; &.insert { background: #67c23a; } &.update { background: #e6a23c; } &.delete { background: #f56c6c; } } } }
  
  .rollback-reason { font-size: 12px; color: var(--color-text-tertiary); }
  
  .behavior-overview { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; .behavior-stat { text-align: center; padding: 16px; background: var(--color-bg-secondary); border-radius: 8px; .stat-value { font-size: 28px; font-weight: 700; } .stat-label { font-size: 13px; color: var(--color-text-tertiary); margin-top: 4px; } .stat-trend { font-size: 12px; margin-top: 4px; &.up { color: #f56c6c; } &.down { color: #67c23a; } } } }
  
  .anomaly-alerts .alert-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--color-border); &:last-child { border-bottom: none; } .alert-content { flex: 1; .alert-title { display: block; font-weight: 500; } .alert-desc { font-size: 12px; color: var(--color-text-tertiary); } .alert-time { font-size: 11px; color: var(--color-text-tertiary); } } }
  
  .high-frequency-users .user-item { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--color-border); &:last-child { border-bottom: none; } .rank { width: 20px; text-align: center; font-weight: 600; color: #f56c6c; } .user-info { flex: 1; .username { display: block; font-weight: 500; } .actions { font-size: 12px; color: var(--color-text-tertiary); } } }
  
  .compliance-overview { display: flex; gap: 40px; .compliance-score { .score-content { text-align: center; .score-value { font-size: 36px; font-weight: 700; } .score-label { display: block; font-size: 14px; color: var(--color-text-tertiary); } } } .compliance-items { flex: 1; .item { margin-bottom: 16px; .item-header { display: flex; justify-content: space-between; margin-bottom: 6px; .item-name { font-weight: 500; } } .item-score { font-size: 12px; color: var(--color-text-tertiary); } } } }
  
  .compliance-issues .issue-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--color-border); &:last-child { border-bottom: none; } .issue-content { flex: 1; .issue-title { display: block; font-weight: 500; } .issue-desc { font-size: 12px; color: var(--color-text-tertiary); } } }
  
  .standards-list .standard-item { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--color-border); &:last-child { border-bottom: none; } }
  
  .diff-viewer { .diff-section { margin-bottom: 16px; h4 { margin-bottom: 8px; } pre { background: #1e1e1e; color: #d4d4d4; padding: 12px; border-radius: 6px; font-size: 12px; overflow-x: auto; &.before { border-left: 4px solid #f56c6c; } &.after { border-left: 4px solid #67c23a; } } } }
  
  // 操作按钮统一样式
  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 60px;
  }
  
  .action-btn {
    min-width: 60px;
    padding: 4px 0;
    margin: 0;
  }
}
</style>
