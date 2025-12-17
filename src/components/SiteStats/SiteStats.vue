<template>
  <div class="site-stats" :class="{ 'no-border': noBorder }">
    <div class="stats-item">
      <el-icon class="stats-icon"><Timer /></el-icon>
      <div class="stats-content">
        <span class="stats-label">本站已运行</span>
        <span class="stats-value">{{ runtimeFormatted }}</span>
      </div>
    </div>
    <div class="stats-divider"></div>
    <div class="stats-item">
      <el-icon class="stats-icon"><View /></el-icon>
      <div class="stats-content">
        <span class="stats-label">访问统计</span>
        <span class="stats-value">访问人数 {{ visitStats.visitors }} / 访问次数 {{ visitStats.pageviews }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Timer, View } from '@element-plus/icons-vue'
import { getSiteStats } from '@/api/modules/siteStats'

// 定义props
const props = defineProps<{
  noBorder?: boolean
}>()

// 网站创建时间（示例日期，根据实际情况修改）
const SITE_CREATED_DATE = new Date('2024-01-01T00:00:00')

// 状态数据
const currentTime = ref(new Date())
const visitStats = ref({
  visitors: 0,
  pageviews: 0
})
const loading = ref(false)
const timer = ref<number | null>(null)

// 计算格式化的运行时间
const runtimeFormatted = computed(() => {
  const diffMs = currentTime.value.getTime() - SITE_CREATED_DATE.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  
  return `${diffDays}天 ${diffHours}时 ${diffMinutes}分`
})

// 获取访问统计数据
const fetchStats = async () => {
  try {
    loading.value = true
    const response = await getSiteStats()
    if (response && response.data) {
      visitStats.value = {
        visitors: response.data.visitors || 0,
        pageviews: response.data.pageviews || 0
      }
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
    // 如果API调用失败，使用模拟数据
    visitStats.value = {
      visitors: 0,
      pageviews: 0
    }
  } finally {
    loading.value = false
  }
}

// 更新当前时间
const updateCurrentTime = () => {
  currentTime.value = new Date()
}

onMounted(() => {
  // 获取统计数据
  fetchStats()
  
  // 设置定时器更新时间
  timer.value = window.setInterval(updateCurrentTime, 60000) // 每分钟更新一次
})

onUnmounted(() => {
  // 清理定时器
  if (timer.value !== null) {
    clearInterval(timer.value)
  }
})
</script>

<style scoped lang="scss">
.site-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 16px 0;
  background: var(--color-bg-secondary);
  border-radius: 8px;
  margin-bottom: 24px;
  color: var(--color-text-secondary);
  font-size: 14px;
  
  &.no-border {
    background: transparent;
    padding: 0;
    margin-bottom: 0;
  }

  .stats-item {
    display: flex;
    align-items: center;
    gap: 8px;

    .stats-icon {
      font-size: 18px;
      color: var(--color-primary);
    }

    .stats-content {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .stats-label {
        font-size: 12px;
        opacity: 0.8;
      }

      .stats-value {
        font-size: 14px;
        font-weight: 500;
        color: var(--color-text-primary);
      }
    }
  }

  .stats-divider {
    width: 1px;
    height: 40px;
    background: var(--color-border);
  }

  // 动画效果
  .stats-value {
    transition: color 0.3s ease;

    &:hover {
      color: var(--color-primary);
    }
  }

  // 响应式设计
  @media (max-width: 640px) {
    flex-direction: column;
    gap: 16px;
    padding: 12px;

    .stats-divider {
      width: 40px;
      height: 1px;
    }
  }
}
</style>
