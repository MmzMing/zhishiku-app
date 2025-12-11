<template>
  <div class="points-records-page">
    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon" style="background: #409eff"><el-icon :size="28"><DataLine /></el-icon></div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.todayRecords.toLocaleString() }}</span>
            <span class="stat-label">今日流水</span>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon" style="background: #67c23a"><el-icon :size="28"><Plus /></el-icon></div>
          <div class="stat-info">
            <span class="stat-value positive">+{{ stats.todayEarn.toLocaleString() }}</span>
            <span class="stat-label">今日发放</span>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon" style="background: #f56c6c"><el-icon :size="28"><Minus /></el-icon></div>
          <div class="stat-info">
            <span class="stat-value negative">-{{ stats.todaySpend.toLocaleString() }}</span>
            <span class="stat-label">今日消耗</span>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon" style="background: #e6a23c"><el-icon :size="28"><WarningFilled /></el-icon></div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.anomalyCount }}</span>
            <span class="stat-label">异常记录</span>
          </div>
        </div>
      </el-card>
    </div>
    
    <el-row :gutter="16">
      <!-- 流水列表 -->
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>积分流水记录</span>
              <div class="header-actions">
                <el-button type="primary" :icon="Download" @click="exportRecords">导出</el-button>
              </div>
            </div>
          </template>
          
          <!-- 筛选区 -->
          <div class="filter-area">
            <el-input v-model="searchKeyword" placeholder="搜索用户/流水号" style="width: 200px" clearable>
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
            <el-select v-model="filterType" placeholder="类型" style="width: 120px" clearable>
              <el-option label="全部" value="" />
              <el-option label="获取" value="earn" />
              <el-option label="消费" value="spend" />
            </el-select>
            <el-select v-model="filterSource" placeholder="来源" style="width: 120px" clearable>
              <el-option label="全部来源" value="" />
              <el-option label="登录奖励" value="login" />
              <el-option label="内容创作" value="content" />
              <el-option label="互动奖励" value="interaction" />
              <el-option label="商城兑换" value="exchange" />
              <el-option label="购买消费" value="purchase" />
            </el-select>
            <el-date-picker v-model="dateRange" type="daterange" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 240px" />
            <el-checkbox v-model="showAnomalyOnly">仅异常</el-checkbox>
          </div>
          
          <!-- 流水表格 -->
          <el-table :data="records" stripe style="margin-top: 16px">
            <el-table-column prop="id" label="流水号" width="140" />
            <el-table-column label="用户" width="180">
              <template #default="{ row }">
                <div class="user-cell">
                  <el-avatar :size="32" :src="row.avatar" />
                  <div>
                    <span class="username">{{ row.username }}</span>
                    <span class="user-level">Lv.{{ row.level }}</span>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="类型" width="80">
              <template #default="{ row }">
                <el-tag :type="row.type === 'earn' ? 'success' : 'danger'" size="small">
                  {{ row.type === 'earn' ? '获取' : '消费' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="积分" width="100">
              <template #default="{ row }">
                <span :class="row.type === 'earn' ? 'positive' : 'negative'">
                  {{ row.type === 'earn' ? '+' : '-' }}{{ row.points }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="source" label="来源" width="120" />
            <el-table-column prop="description" label="描述" min-width="150" show-overflow-tooltip />
            <el-table-column prop="balance" label="余额" width="100" />
            <el-table-column prop="createTime" label="时间" width="160" />
            <el-table-column label="状态" width="80">
              <template #default="{ row }">
                <el-tag v-if="row.isAnomaly" type="warning" size="small">异常</el-tag>
                <el-tag v-else type="success" size="small">正常</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="{ row }">
                <div class="action-buttons">
                    <el-button size="small" type="primary" link @click="viewDetail(row)" class="action-btn">详情</el-button>
                    <el-button v-if="row.isAnomaly" size="small" type="danger" link @click="handleAnomaly(row)" class="action-btn">处理</el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
          
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[20, 50, 100]"
            layout="total, sizes, prev, pager, next"
            style="margin-top: 16px; justify-content: flex-end"
          />
        </el-card>
      </el-col>
      
      <!-- 右侧统计 -->
      <el-col :span="8">
        <!-- 变动趋势 -->
        <el-card>
          <template #header><span>积分变动趋势</span></template>
          <div class="chart-placeholder" style="height: 200px">
            <div class="trend-chart">
              <div class="trend-bar" v-for="(item, index) in trendData" :key="index">
                <div class="bar-group">
                  <div class="bar earn" :style="{ height: item.earn / 20 + 'px' }"></div>
                  <div class="bar spend" :style="{ height: item.spend / 20 + 'px' }"></div>
                </div>
                <span class="bar-label">{{ item.date }}</span>
              </div>
            </div>
          </div>
          <div class="chart-legend">
            <span class="legend-item"><i class="dot earn"></i>获取</span>
            <span class="legend-item"><i class="dot spend"></i>消费</span>
          </div>
        </el-card>
        
        <!-- 异常检测 -->
        <el-card style="margin-top: 16px">
          <template #header>
            <div class="card-header">
              <span>异常检测</span>
              <el-button type="text" size="small">全部处理</el-button>
            </div>
          </template>
          <div class="anomaly-list">
            <div class="anomaly-item" v-for="item in anomalies" :key="item.id">
              <div class="anomaly-info">
                <el-avatar :size="28" :src="item.avatar" />
                <div class="anomaly-detail">
                  <span class="anomaly-user">{{ item.username }}</span>
                  <span class="anomaly-desc">{{ item.description }}</span>
                </div>
              </div>
              <div class="anomaly-meta">
                <el-tag :type="item.severity === 'high' ? 'danger' : 'warning'" size="small">
                  {{ item.severity === 'high' ? '高风险' : '中风险' }}
                </el-tag>
                <el-button size="small" type="primary" link @click="handleAnomaly(item)">处理</el-button>
              </div>
            </div>
          </div>
        </el-card>
        
        <!-- 来源分布 -->
        <el-card style="margin-top: 16px">
          <template #header><span>来源分布</span></template>
          <div class="source-list">
            <div class="source-item" v-for="item in sourceDistribution" :key="item.source">
              <div class="source-info">
                <span class="source-name">{{ item.source }}</span>
                <span class="source-count">{{ item.count.toLocaleString() }} 笔</span>
              </div>
              <el-progress :percentage="item.percentage" :stroke-width="8" :show-text="false" :color="item.color" />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 详情弹窗 -->
    <el-dialog v-model="detailDialogVisible" title="流水详情" width="500px">
      <el-descriptions :column="2" border v-if="currentRecord">
        <el-descriptions-item label="流水号" :span="2">{{ currentRecord.id }}</el-descriptions-item>
        <el-descriptions-item label="用户">{{ currentRecord.username }}</el-descriptions-item>
        <el-descriptions-item label="类型">
          <el-tag :type="currentRecord.type === 'earn' ? 'success' : 'danger'" size="small">
            {{ currentRecord.type === 'earn' ? '获取' : '消费' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="积分">
          <span :class="currentRecord.type === 'earn' ? 'positive' : 'negative'">
            {{ currentRecord.type === 'earn' ? '+' : '-' }}{{ currentRecord.points }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="余额">{{ currentRecord.balance }}</el-descriptions-item>
        <el-descriptions-item label="来源">{{ currentRecord.source }}</el-descriptions-item>
        <el-descriptions-item label="时间">{{ currentRecord.createTime }}</el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">{{ currentRecord.description }}</el-descriptions-item>
        <el-descriptions-item label="IP地址" :span="2">{{ currentRecord.ip || '127.0.0.1' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
    
    <!-- 导出弹窗 -->
    <el-dialog v-model="exportDialogVisible" title="导出积分流水" width="400px">
      <el-form label-width="100px">
        <el-form-item label="导出范围">
          <el-radio-group v-model="exportOptions.scope">
            <el-radio value="current">当前筛选</el-radio>
            <el-radio value="all">全部数据</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="时间范围" v-if="exportOptions.scope === 'all'">
          <el-date-picker v-model="exportOptions.dateRange" type="daterange" style="width: 100%" />
        </el-form-item>
        <el-form-item label="导出格式">
          <el-radio-group v-model="exportOptions.format">
            <el-radio value="xlsx">Excel (.xlsx)</el-radio>
            <el-radio value="csv">CSV (.csv)</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="exportDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmExport">导出</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { DataLine, Plus, Minus, WarningFilled, Download, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 统计数据
const stats = reactive({
  todayRecords: 1256,
  todayEarn: 8500,
  todaySpend: 3200,
  anomalyCount: 5
})

// 筛选条件
const searchKeyword = ref('')
const filterType = ref('')
const filterSource = ref('')
const dateRange = ref<[Date, Date] | null>(null)
const showAnomalyOnly = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(1000)

// 流水记录
const records = ref([
  { id: 'P202401150001', username: '张三', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', level: 3, type: 'earn', points: 10, source: '登录奖励', description: '每日登录奖励', balance: 1520, createTime: '2024-01-15 09:30:00', isAnomaly: false },
  { id: 'P202401150002', username: '李四', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2', level: 5, type: 'earn', points: 50, source: '内容创作', description: '发布博客文章', balance: 3200, createTime: '2024-01-15 10:15:00', isAnomaly: false },
  { id: 'P202401150003', username: '王五', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3', level: 2, type: 'spend', points: 100, source: '商城兑换', description: '兑换VIP会员', balance: 800, createTime: '2024-01-15 11:00:00', isAnomaly: false },
  { id: 'P202401150004', username: '赵六', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4', level: 1, type: 'earn', points: 500, source: '系统', description: '短时间内获取大量积分', balance: 2100, createTime: '2024-01-15 11:30:00', isAnomaly: true },
  { id: 'P202401150005', username: '孙七', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5', level: 4, type: 'spend', points: 200, source: '商城兑换', description: '兑换实物商品', balance: 1500, createTime: '2024-01-15 12:00:00', isAnomaly: false },
])

// 趋势数据
const trendData = ref([
  { date: '12/09', earn: 1500, spend: 800 },
  { date: '12/10', earn: 1800, spend: 650 },
  { date: '12/11', earn: 1200, spend: 900 },
  { date: '12/12', earn: 2000, spend: 1100 },
  { date: '12/13', earn: 1600, spend: 750 },
  { date: '12/14', earn: 2200, spend: 1000 },
  { date: '12/15', earn: 1900, spend: 850 },
])

// 异常列表
const anomalies = ref([
  { id: 1, username: '赵六', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4', description: '短时间内获取500积分', severity: 'high' },
  { id: 2, username: '钱八', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=6', description: '频繁兑换操作', severity: 'medium' },
  { id: 3, username: '周九', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=7', description: '异地登录获取积分', severity: 'medium' },
])

// 来源分布
const sourceDistribution = ref([
  { source: '登录奖励', count: 12500, percentage: 35, color: '#409eff' },
  { source: '内容创作', count: 8200, percentage: 23, color: '#67c23a' },
  { source: '互动奖励', count: 6800, percentage: 19, color: '#e6a23c' },
  { source: '商城兑换', count: 5500, percentage: 15, color: '#f56c6c' },
  { source: '其他', count: 2800, percentage: 8, color: '#909399' },
])

// 详情弹窗
const detailDialogVisible = ref(false)
const currentRecord = ref<typeof records.value[0] | null>(null)

// 导出弹窗
const exportDialogVisible = ref(false)
const exportOptions = reactive({
  scope: 'current',
  dateRange: null as [Date, Date] | null,
  format: 'xlsx'
})

function viewDetail(record: typeof records.value[0]) {
  currentRecord.value = record
  detailDialogVisible.value = true
}

function handleAnomaly(item: any) {
  ElMessageBox.confirm('确定要处理该异常记录吗？', '处理异常', {
    confirmButtonText: '标记正常',
    cancelButtonText: '撤销积分',
    distinguishCancelAndClose: true,
    type: 'warning'
  })
    .then(() => ElMessage.success('已标记为正常'))
    .catch((action) => {
      if (action === 'cancel') ElMessage.warning('积分已撤销')
    })
}

function exportRecords() {
  exportDialogVisible.value = true
}

function confirmExport() {
  ElMessage.success('导出任务已创建，请稍后下载')
  exportDialogVisible.value = false
}
</script>

<style scoped lang="scss">
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
  padding: 0;
  margin: 0;
  align-items: flex-start;
}

.action-btn {
  padding: 2px 0;
  margin: 0;
  min-width: 60px;
  text-align: left;
  display: block;
  line-height: 1.5;
  height: auto;
}
.points-records-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  .stats-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    
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
        .stat-value {
          display: block;
          font-size: 24px;
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
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .filter-area {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
  }
  
  .positive { color: #67c23a; font-weight: 600; }
  .negative { color: #f56c6c; font-weight: 600; }
  
  .user-cell {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .username { display: block; font-weight: 500; }
    .user-level { font-size: 12px; color: var(--color-text-tertiary); }
  }
  
  .trend-chart {
    display: flex;
    justify-content: space-around;
    align-items: flex-end;
    height: 180px;
    padding-bottom: 20px;
    
    .trend-bar {
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .bar-group {
        display: flex;
        gap: 4px;
        align-items: flex-end;
        
        .bar {
          width: 16px;
          border-radius: 4px 4px 0 0;
          transition: height 0.3s;
          
          &.earn { background: #67c23a; }
          &.spend { background: #f56c6c; }
        }
      }
      
      .bar-label {
        font-size: 11px;
        color: var(--color-text-tertiary);
        margin-top: 8px;
      }
    }
  }
  
  .chart-legend {
    display: flex;
    justify-content: center;
    gap: 24px;
    margin-top: 8px;
    
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--color-text-secondary);
      
      .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        
        &.earn { background: #67c23a; }
        &.spend { background: #f56c6c; }
      }
    }
  }
  
  .anomaly-list {
    .anomaly-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid var(--color-border);
      
      &:last-child { border-bottom: none; }
      
      .anomaly-info {
        display: flex;
        align-items: center;
        gap: 10px;
        
        .anomaly-detail {
          .anomaly-user { display: block; font-weight: 500; font-size: 13px; }
          .anomaly-desc { font-size: 12px; color: var(--color-text-tertiary); }
        }
      }
      
      .anomaly-meta {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }
  }
  
  .source-list {
    .source-item {
      margin-bottom: 16px;
      
      &:last-child { margin-bottom: 0; }
      
      .source-info {
        display: flex;
        justify-content: space-between;
        margin-bottom: 6px;
        
        .source-name { font-size: 13px; }
        .source-count { font-size: 12px; color: var(--color-text-tertiary); }
      }
    }
  }
}

@media (max-width: 1200px) {
  .points-records-page .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
