<template>
  <div class="server-monitor-page">
    <!-- 系统状态卡片 -->
    <div class="monitor-cards">
      <el-card class="monitor-card">
        <div class="card-content">
          <div class="card-title"><el-icon><Cpu /></el-icon> CPU 使用率</div>
          <el-progress type="dashboard" :percentage="systemInfo.cpu.usage" :color="getProgressColor(systemInfo.cpu.usage)" />
          <div class="card-info">{{ systemInfo.cpu.cores }} 核心 | {{ systemInfo.cpu.model }}</div>
        </div>
      </el-card>
      
      <el-card class="monitor-card">
        <div class="card-content">
          <div class="card-title"><el-icon><Coin /></el-icon> 内存使用</div>
          <el-progress type="dashboard" :percentage="memoryPercent" :color="getProgressColor(memoryPercent)" />
          <div class="card-info">{{ formatBytes(systemInfo.memory.used) }} / {{ formatBytes(systemInfo.memory.total) }}</div>
        </div>
      </el-card>
      
      <el-card class="monitor-card">
        <div class="card-content">
          <div class="card-title"><el-icon><Box /></el-icon> 磁盘使用</div>
          <el-progress type="dashboard" :percentage="diskPercent" :color="getProgressColor(diskPercent)" />
          <div class="card-info">{{ formatBytes(systemInfo.disk.used) }} / {{ formatBytes(systemInfo.disk.total) }}</div>
        </div>
      </el-card>
      
      <el-card class="monitor-card">
        <div class="card-content">
          <div class="card-title"><el-icon><Monitor /></el-icon> 系统信息</div>
          <div class="os-info">
            <p>{{ systemInfo.os.name }}</p>
            <p>{{ systemInfo.os.version }}</p>
            <p>运行时间: {{ formatUptime(systemInfo.os.uptime) }}</p>
          </div>
        </div>
      </el-card>
    </div>
    
    <el-row :gutter="16">
      <!-- 网络流量监控 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span><el-icon><Connection /></el-icon> 网络流量</span>
              <el-tag :type="networkStatus === 'normal' ? 'success' : 'warning'" size="small">
                {{ networkStatus === 'normal' ? '正常' : '拥堵' }}
              </el-tag>
            </div>
          </template>
          <div class="network-stats">
            <div class="stat-item">
              <span class="stat-label">上行速率</span>
              <span class="stat-value up">↑ {{ networkInfo.upload }} MB/s</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">下行速率</span>
              <span class="stat-value down">↓ {{ networkInfo.download }} MB/s</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">连接数</span>
              <span class="stat-value">{{ networkInfo.connections }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">带宽利用率</span>
              <span class="stat-value">{{ networkInfo.bandwidth }}%</span>
            </div>
          </div>
          <div class="network-chart">
            <div class="chart-bars">
              <div class="bar-item" v-for="(item, index) in networkHistory" :key="index">
                <div class="bar up" :style="{ height: item.upload * 2 + 'px' }"></div>
                <div class="bar down" :style="{ height: item.download * 2 + 'px' }"></div>
              </div>
            </div>
            <div class="chart-legend">
              <span class="legend-item"><i class="dot up"></i>上行</span>
              <span class="legend-item"><i class="dot down"></i>下行</span>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 服务健康检查 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span><el-icon><CircleCheck /></el-icon> 服务健康状态</span>
              <el-button size="small" text :icon="Refresh" @click="checkHealth">检查</el-button>
            </div>
          </template>
          <div class="health-list">
            <div class="health-item" v-for="service in services" :key="service.name">
              <div class="service-info">
                <el-icon :color="service.status === 'healthy' ? '#67c23a' : service.status === 'warning' ? '#e6a23c' : '#f56c6c'">
                  <component :is="service.status === 'healthy' ? 'CircleCheck' : service.status === 'warning' ? 'Warning' : 'CircleClose'" />
                </el-icon>
                <span class="service-name">{{ service.name }}</span>
              </div>
              <div class="service-meta">
                <span class="response-time">{{ service.responseTime }}ms</span>
                <el-tag :type="getHealthTagType(service.status)" size="small">{{ getHealthText(service.status) }}</el-tag>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="16" style="margin-top: 16px">
      <!-- 报警阈值设置 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span><el-icon><Bell /></el-icon> 报警阈值设置</span>
              <el-button type="primary" size="small" @click="saveAlertSettings">保存设置</el-button>
            </div>
          </template>
          <el-form label-width="120px">
            <el-form-item label="CPU 报警阈值">
              <el-slider v-model="alertSettings.cpu" :marks="{ 60: '60%', 80: '80%', 90: '90%' }" />
            </el-form-item>
            <el-form-item label="内存报警阈值">
              <el-slider v-model="alertSettings.memory" :marks="{ 60: '60%', 80: '80%', 90: '90%' }" />
            </el-form-item>
            <el-form-item label="磁盘报警阈值">
              <el-slider v-model="alertSettings.disk" :marks="{ 60: '60%', 80: '80%', 90: '90%' }" />
            </el-form-item>
            <el-form-item label="网络延迟阈值">
              <el-input-number v-model="alertSettings.networkLatency" :min="50" :max="1000" :step="50" />
              <span style="margin-left: 8px">ms</span>
            </el-form-item>
            <el-form-item label="通知方式">
              <el-checkbox-group v-model="alertSettings.notifyMethods">
                <el-checkbox value="email">邮件</el-checkbox>
                <el-checkbox value="sms">短信</el-checkbox>
                <el-checkbox value="webhook">Webhook</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      
      <!-- 报警历史 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span><el-icon><Warning /></el-icon> 报警历史</span>
              <el-link type="primary">查看全部</el-link>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="alert in alertHistory"
              :key="alert.id"
              :timestamp="alert.time"
              :type="alert.level === 'critical' ? 'danger' : alert.level === 'warning' ? 'warning' : 'info'"
              placement="top"
            >
              <div class="alert-content">
                <el-tag :type="alert.level === 'critical' ? 'danger' : 'warning'" size="small">{{ alert.type }}</el-tag>
                <span>{{ alert.message }}</span>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="16" style="margin-top: 16px">
      <!-- 在线用户 -->
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span><el-icon><User /></el-icon> 在线用户 ({{ onlineUsers.length }})</span>
              <el-button size="small" text :icon="Refresh" @click="loadData">刷新</el-button>
            </div>
          </template>
          <el-table :data="onlineUsers" stripe>
            <el-table-column prop="username" label="用户名" width="150" />
            <el-table-column prop="ip" label="IP地址" width="140" />
            <el-table-column prop="location" label="地理位置" width="160" />
            <el-table-column prop="browser" label="浏览器" width="120" />
            <el-table-column prop="os" label="操作系统" width="120" />
            <el-table-column prop="loginTime" label="登录时间" width="160" />
            <el-table-column prop="lastActive" label="最后活动" width="160" />
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button size="small" type="primary" link @click="viewSession(row)">详情</el-button>
                <el-button size="small" type="danger" link @click="kickUser(row)">下线</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue'
import { Cpu, Coin, Box, Monitor, User, Refresh, Connection, CircleCheck, CircleClose, Warning, Bell } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const systemInfo = ref({
  cpu: { usage: 45, cores: 8, model: 'Intel Xeon E5-2680' },
  memory: { total: 16 * 1024 * 1024 * 1024, used: 10 * 1024 * 1024 * 1024, free: 6 * 1024 * 1024 * 1024 },
  disk: { total: 500 * 1024 * 1024 * 1024, used: 280 * 1024 * 1024 * 1024, free: 220 * 1024 * 1024 * 1024 },
  os: { name: 'Linux', version: 'Ubuntu 22.04 LTS', uptime: 86400 * 30 }
})

const networkInfo = reactive({
  upload: 12.5,
  download: 45.8,
  connections: 256,
  bandwidth: 68
})

const networkStatus = computed(() => networkInfo.bandwidth > 80 ? 'congested' : 'normal')

const networkHistory = ref(Array.from({ length: 20 }, () => ({
  upload: Math.random() * 30,
  download: Math.random() * 60
})))

const services = ref([
  { name: 'Web Server (Nginx)', status: 'healthy', responseTime: 12 },
  { name: 'Database (MySQL)', status: 'healthy', responseTime: 8 },
  { name: 'Cache (Redis)', status: 'healthy', responseTime: 2 },
  { name: 'Message Queue (RabbitMQ)', status: 'warning', responseTime: 156 },
  { name: 'Search Engine (Elasticsearch)', status: 'healthy', responseTime: 25 },
  { name: 'Storage (MinIO)', status: 'healthy', responseTime: 18 },
])

const alertSettings = reactive({
  cpu: 80,
  memory: 85,
  disk: 90,
  networkLatency: 200,
  notifyMethods: ['email'] as string[]
})

const alertHistory = ref([
  { id: 1, type: 'CPU', level: 'warning', message: 'CPU使用率超过 80%', time: '2024-01-15 14:30:00' },
  { id: 2, type: '内存', level: 'critical', message: '内存使用率超过 90%', time: '2024-01-15 12:15:00' },
  { id: 3, type: '服务', level: 'warning', message: 'RabbitMQ 响应时间异常', time: '2024-01-15 10:00:00' },
])

const onlineUsers = ref([
  { id: 1, username: 'admin', ip: '192.168.1.100', location: '北京', browser: 'Chrome 120', os: 'Windows 11', loginTime: '2024-01-15 09:00:00', lastActive: '2024-01-15 14:30:00' },
  { id: 2, username: 'editor1', ip: '192.168.1.101', location: '上海', browser: 'Firefox 121', os: 'macOS 14', loginTime: '2024-01-15 10:30:00', lastActive: '2024-01-15 14:25:00' },
  { id: 3, username: 'user001', ip: '192.168.1.102', location: '广州', browser: 'Chrome 120', os: 'Windows 10', loginTime: '2024-01-15 11:00:00', lastActive: '2024-01-15 14:20:00' },
])

const memoryPercent = computed(() => Math.round((systemInfo.value.memory.used / systemInfo.value.memory.total) * 100))
const diskPercent = computed(() => Math.round((systemInfo.value.disk.used / systemInfo.value.disk.total) * 100))

function getProgressColor(percent: number): string {
  if (percent < 60) return '#67c23a'
  if (percent < 80) return '#e6a23c'
  return '#f56c6c'
}

function formatBytes(bytes: number): string {
  const gb = bytes / (1024 * 1024 * 1024)
  return gb.toFixed(1) + ' GB'
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  return `${days}天${hours}小时`
}

function getHealthTagType(status: string) {
  return status === 'healthy' ? 'success' : status === 'warning' ? 'warning' : 'danger'
}

function getHealthText(status: string) {
  return status === 'healthy' ? '健康' : status === 'warning' ? '警告' : '异常'
}

function checkHealth() {
  ElMessage.success('服务健康检查完成')
}

function saveAlertSettings() {
  ElMessage.success('报警设置已保存')
}

function viewSession(row: any) {
  ElMessage.info(`查看用户 ${row.username} 的会话详情`)
}

function kickUser(row: any) {
  ElMessageBox.confirm(`确定要强制下线用户 ${row.username} 吗？`, '警告', { type: 'warning' })
    .then(() => ElMessage.success('用户已下线'))
    .catch(() => {})
}

function loadData() {
  ElMessage.success('数据已刷新')
}

let refreshTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  refreshTimer = setInterval(() => {
    systemInfo.value.cpu.usage = Math.min(95, Math.max(20, systemInfo.value.cpu.usage + (Math.random() - 0.5) * 10))
    networkHistory.value.shift()
    networkHistory.value.push({ upload: Math.random() * 30, download: Math.random() * 60 })
  }, 2000)
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>

<style scoped lang="scss">
.server-monitor-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  .monitor-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    
    .monitor-card .card-content {
      text-align: center;
      
      .card-title {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-size: 16px;
        font-weight: 500;
        color: var(--color-text-primary);
        margin-bottom: 16px;
      }
      
      .card-info {
        margin-top: 12px;
        font-size: 13px;
        color: var(--color-text-secondary);
      }
      
      .os-info {
        text-align: left;
        padding: 16px;
        p {
          margin-bottom: 8px;
          color: var(--color-text-secondary);
          &:first-child { font-size: 18px; font-weight: 600; color: var(--color-text-primary); }
        }
      }
    }
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    span { display: flex; align-items: center; gap: 8px; }
  }
  
  .network-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 16px;
    
    .stat-item {
      text-align: center;
      .stat-label { display: block; font-size: 12px; color: var(--color-text-tertiary); margin-bottom: 4px; }
      .stat-value { font-size: 18px; font-weight: 600; &.up { color: #67c23a; } &.down { color: #409eff; } }
    }
  }
  
  .network-chart {
    .chart-bars {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      height: 80px;
      padding: 8px 0;
      
      .bar-item {
        display: flex;
        gap: 2px;
        align-items: flex-end;
        
        .bar {
          width: 8px;
          border-radius: 2px 2px 0 0;
          transition: height 0.3s;
          &.up { background: #67c23a; }
          &.down { background: #409eff; }
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
        .dot { width: 10px; height: 10px; border-radius: 50%; &.up { background: #67c23a; } &.down { background: #409eff; } }
      }
    }
  }
  
  .health-list {
    .health-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid var(--color-border);
      &:last-child { border-bottom: none; }
      
      .service-info {
        display: flex;
        align-items: center;
        gap: 10px;
        .service-name { font-weight: 500; }
      }
      
      .service-meta {
        display: flex;
        align-items: center;
        gap: 12px;
        .response-time { font-size: 13px; color: var(--color-text-tertiary); }
      }
    }
  }
  
  .alert-content {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

@media (max-width: 1200px) {
  .server-monitor-page .monitor-cards { grid-template-columns: repeat(2, 1fr); }
}
</style>
