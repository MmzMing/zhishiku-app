<template>
  <div class="behavior-page">
    <!-- 统计卡片 -->
    <div class="stat-cards">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon active"><el-icon :size="28"><User /></el-icon></div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.activeToday }}</span>
            <span class="stat-label">今日活跃</span>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon online"><el-icon :size="28"><Connection /></el-icon></div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.onlineNow }}</span>
            <span class="stat-label">当前在线</span>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon contribution"><el-icon :size="28"><Star /></el-icon></div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.contributions }}</span>
            <span class="stat-label">今日贡献</span>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon warning"><el-icon :size="28"><Warning /></el-icon></div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.abnormal }}</span>
            <span class="stat-label">异常行为</span>
          </div>
        </div>
      </el-card>
    </div>
    
    <el-row :gutter="16">
      <!-- 操作日志 -->
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <div class="header-left">
                <span>操作日志追踪</span>
                <el-radio-group v-model="logTimeRange" size="small">
                  <el-radio-button value="today">今天</el-radio-button>
                  <el-radio-button value="week">本周</el-radio-button>
                  <el-radio-button value="month">本月</el-radio-button>
                </el-radio-group>
              </div>
              <div class="header-right">
                <el-input v-model="logSearch" placeholder="搜索用户/操作..." clearable :prefix-icon="Search" style="width: 200px" />
                <el-button :icon="Download">导出</el-button>
              </div>
            </div>
          </template>
          
          <el-table :data="operationLogs" stripe v-loading="loading">
            <el-table-column label="用户" width="160">
              <template #default="{ row }">
                <div class="user-info">
                  <el-avatar :size="28" :src="row.avatar">{{ row.username?.charAt(0) }}</el-avatar>
                  <span>{{ row.username }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="操作类型" width="120">
              <template #default="{ row }">
                <el-tag :type="getActionType(row.action)" size="small">{{ row.action }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="target" label="操作对象" min-width="200" show-overflow-tooltip />
            <el-table-column prop="ip" label="IP地址" width="130" />
            <el-table-column prop="location" label="地区" width="100" />
            <el-table-column prop="time" label="操作时间" width="160" />
            <el-table-column label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.success ? 'success' : 'danger'" size="small">
                  {{ row.success ? '成功' : '失败' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
          
          <div class="pagination-wrap">
            <el-pagination
              :total="100"
              :page-size="10"
              layout="total, prev, pager, next"
              background
            />
          </div>
        </el-card>
        
        <!-- 异常行为检测 -->
        <el-card style="margin-top: 16px">
          <template #header>
            <div class="card-header">
              <span>异常行为检测</span>
              <el-button type="danger" size="small">处理全部</el-button>
            </div>
          </template>
          
          <div class="abnormal-list">
            <div class="abnormal-item" v-for="item in abnormalBehaviors" :key="item.id">
              <div class="item-icon" :class="item.level">
                <el-icon><WarningFilled /></el-icon>
              </div>
              <div class="item-content">
                <div class="item-header">
                  <span class="user">{{ item.username }}</span>
                  <el-tag :type="item.level === 'high' ? 'danger' : item.level === 'medium' ? 'warning' : 'info'" size="small">
                    {{ item.level === 'high' ? '高风险' : item.level === 'medium' ? '中风险' : '低风险' }}
                  </el-tag>
                </div>
                <div class="item-desc">{{ item.description }}</div>
                <div class="item-meta">
                  <span>{{ item.time }}</span>
                  <span>IP: {{ item.ip }}</span>
                </div>
              </div>
              <div class="item-actions">
                <el-button size="small" type="warning">警告</el-button>
                <el-button size="small" type="danger">封禁</el-button>
                <el-button size="small">忽略</el-button>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 右侧统计 -->
      <el-col :span="8">
        <!-- 活跃度排行 -->
        <el-card>
          <template #header>
            <div class="card-header">
              <span>活跃度排行</span>
              <el-select v-model="rankTimeRange" size="small" style="width: 100px">
                <el-option label="今日" value="today" />
                <el-option label="本周" value="week" />
                <el-option label="本月" value="month" />
              </el-select>
            </div>
          </template>
          
          <div class="rank-list">
            <div class="rank-item" v-for="(user, index) in activeRank" :key="user.id">
              <div class="rank-num" :class="{ top: index < 3 }">{{ index + 1 }}</div>
              <el-avatar :size="32" :src="user.avatar">{{ user.name?.charAt(0) }}</el-avatar>
              <div class="rank-info">
                <span class="name">{{ user.name }}</span>
                <el-progress :percentage="user.score" :stroke-width="6" :show-text="false" />
              </div>
              <span class="score">{{ user.score }}分</span>
            </div>
          </div>
        </el-card>
        
        <!-- 贡献度统计 -->
        <el-card style="margin-top: 16px">
          <template #header>
            <div class="card-header">
              <span>贡献度统计</span>
            </div>
          </template>
          
          <div class="contribution-stats">
            <div class="contrib-item" v-for="item in contributionStats" :key="item.type">
              <div class="contrib-header">
                <span class="label">{{ item.label }}</span>
                <span class="value">{{ item.value }}</span>
              </div>
              <el-progress :percentage="item.percentage" :color="item.color" :stroke-width="8" :show-text="false" />
            </div>
          </div>
        </el-card>
        
        <!-- 登录趋势 -->
        <el-card style="margin-top: 16px">
          <template #header>
            <span>登录趋势（近7天）</span>
          </template>
          
          <div class="login-trend">
            <div class="trend-bar" v-for="day in loginTrend" :key="day.date">
              <div class="bar" :style="{ height: day.count / 5 + 'px' }"></div>
              <span class="date">{{ day.date }}</span>
            </div>
          </div>
          <div class="trend-summary">
            <span>日均登录: <strong>{{ Math.round(loginTrend.reduce((a, b) => a + b.count, 0) / 7) }}</strong> 人次</span>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { User, Connection, Star, Warning, WarningFilled, Search, Download } from '@element-plus/icons-vue'

const loading = ref(false)
const logTimeRange = ref('today')
const logSearch = ref('')
const rankTimeRange = ref('today')

const stats = reactive({
  activeToday: 1256,
  onlineNow: 328,
  contributions: 456,
  abnormal: 12
})

// 操作日志
const operationLogs = ref([
  { id: '1', username: '张三', avatar: '', action: '登录', target: '系统登录', ip: '192.168.1.100', location: '北京', time: '2024-01-15 14:30:00', success: true },
  { id: '2', username: '李四', avatar: '', action: '上传', target: '视频：Vue3入门教程', ip: '192.168.1.101', location: '上海', time: '2024-01-15 14:25:00', success: true },
  { id: '3', username: '王五', avatar: '', action: '编辑', target: '博客：TypeScript最佳实践', ip: '192.168.1.102', location: '广州', time: '2024-01-15 14:20:00', success: true },
  { id: '4', username: '赵六', avatar: '', action: '删除', target: '评论：#12345', ip: '192.168.1.103', location: '深圳', time: '2024-01-15 14:15:00', success: true },
  { id: '5', username: '孙七', avatar: '', action: '登录', target: '系统登录', ip: '45.32.12.89', location: '未知', time: '2024-01-15 14:10:00', success: false },
])

// 异常行为
const abnormalBehaviors = ref([
  { id: '1', username: '可疑用户A', level: 'high', description: '短时间内多次尝试登录失败（23次）', ip: '45.32.12.89', time: '10分钟前' },
  { id: '2', username: '异常账户B', level: 'medium', description: '异地登录检测：从北京切换到美国', ip: '142.250.185.46', time: '25分钟前' },
  { id: '3', username: '用户C', level: 'low', description: '频繁刷新页面（每秒10次以上）', ip: '192.168.1.150', time: '1小时前' },
])

// 活跃度排行
const activeRank = ref([
  { id: '1', name: '技术达人', avatar: '', score: 98 },
  { id: '2', name: '知识分享者', avatar: '', score: 92 },
  { id: '3', name: '学习先锋', avatar: '', score: 88 },
  { id: '4', name: '勤奋用户', avatar: '', score: 75 },
  { id: '5', name: '积极学员', avatar: '', score: 68 },
])

// 贡献度统计
const contributionStats = ref([
  { type: 'video', label: '上传视频', value: 156, percentage: 78, color: '#409eff' },
  { type: 'blog', label: '发布博客', value: 89, percentage: 65, color: '#67c23a' },
  { type: 'comment', label: '发表评论', value: 1256, percentage: 90, color: '#e6a23c' },
  { type: 'like', label: '点赞互动', value: 3890, percentage: 95, color: '#f56c6c' },
])

// 登录趋势
const loginTrend = ref([
  { date: '周一', count: 320 },
  { date: '周二', count: 380 },
  { date: '周三', count: 420 },
  { date: '周四', count: 350 },
  { date: '周五', count: 290 },
  { date: '周六', count: 180 },
  { date: '周日', count: 150 },
])

function getActionType(action: string) {
  const map: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
    '登录': 'success',
    '上传': 'info',
    '编辑': 'warning',
    '删除': 'danger'
  }
  return map[action] || 'info'
}
</script>

<style scoped lang="scss">
.behavior-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  .stat-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    
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
          
          &.active { background: linear-gradient(135deg, #409eff, #66b1ff); }
          &.online { background: linear-gradient(135deg, #67c23a, #85ce61); }
          &.contribution { background: linear-gradient(135deg, #e6a23c, #ebb563); }
          &.warning { background: linear-gradient(135deg, #f56c6c, #f89898); }
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
    
    .header-left, .header-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .pagination-wrap {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }
  
  .abnormal-list {
    .abnormal-item {
      display: flex;
      gap: 16px;
      padding: 16px;
      background: var(--color-bg-secondary);
      border-radius: 8px;
      margin-bottom: 12px;
      
      .item-icon {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        
        &.high { background: #fef0f0; color: #f56c6c; }
        &.medium { background: #fdf6ec; color: #e6a23c; }
        &.low { background: #f4f4f5; color: #909399; }
      }
      
      .item-content {
        flex: 1;
        
        .item-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
          
          .user {
            font-weight: 500;
            color: var(--color-text-primary);
          }
        }
        
        .item-desc {
          font-size: 13px;
          color: var(--color-text-secondary);
          margin-bottom: 4px;
        }
        
        .item-meta {
          font-size: 12px;
          color: var(--color-text-tertiary);
          display: flex;
          gap: 16px;
        }
      }
      
      .item-actions {
        display: flex;
        gap: 8px;
        align-items: flex-start;
      }
    }
  }
  
  .rank-list {
    .rank-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid var(--color-border);
      
      &:last-child {
        border-bottom: none;
      }
      
      .rank-num {
        width: 24px;
        height: 24px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 600;
        background: var(--color-bg-secondary);
        color: var(--color-text-tertiary);
        
        &.top {
          background: linear-gradient(135deg, #f7ba2a, #f5a623);
          color: #fff;
        }
      }
      
      .rank-info {
        flex: 1;
        
        .name {
          display: block;
          font-weight: 500;
          margin-bottom: 4px;
        }
      }
      
      .score {
        font-weight: 600;
        color: var(--color-primary);
      }
    }
  }
  
  .contribution-stats {
    .contrib-item {
      margin-bottom: 20px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .contrib-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        
        .label {
          color: var(--color-text-secondary);
        }
        
        .value {
          font-weight: 600;
          color: var(--color-text-primary);
        }
      }
    }
  }
  
  .login-trend {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    height: 120px;
    padding-bottom: 24px;
    
    .trend-bar {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .bar {
        width: 24px;
        background: linear-gradient(180deg, var(--color-primary), rgba(64, 158, 255, 0.3));
        border-radius: 4px 4px 0 0;
        min-height: 10px;
      }
      
      .date {
        font-size: 11px;
        color: var(--color-text-tertiary);
        margin-top: 8px;
      }
    }
  }
  
  .trend-summary {
    text-align: center;
    font-size: 13px;
    color: var(--color-text-secondary);
    padding-top: 12px;
    border-top: 1px solid var(--color-border);
    
    strong {
      color: var(--color-primary);
      font-size: 18px;
    }
  }
}

@media (max-width: 1200px) {
  .behavior-page .stat-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
