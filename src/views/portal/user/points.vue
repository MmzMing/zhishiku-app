<template>
  <div class="user-points">
    <div class="points-overview">
      <div class="points-card">
        <span class="label">当前积分</span>
        <span class="value">{{ userInfo?.points || 0 }}</span>
      </div>
      <div class="points-card">
        <span class="label">等级</span>
        <span class="value">Lv.{{ userInfo?.level || 1 }}</span>
      </div>
      <div class="points-card">
        <span class="label">今日可获得</span>
        <span class="value">50</span>
      </div>
    </div>
    
    <h3 class="section-title">积分任务</h3>
    <div class="task-list">
      <div class="task-item" v-for="task in tasks" :key="task.id">
        <div class="task-info">
          <el-icon :size="24" :style="{ color: task.color }"><component :is="task.icon" /></el-icon>
          <div class="task-detail">
            <span class="task-name">{{ task.name }}</span>
            <span class="task-desc">{{ task.desc }}</span>
          </div>
        </div>
        <div class="task-reward">
          <span class="points">+{{ task.points }}</span>
          <el-button type="primary" size="small" :disabled="task.done">
            {{ task.done ? '已完成' : '去完成' }}
          </el-button>
        </div>
      </div>
    </div>
    
    <h3 class="section-title">积分记录</h3>
    <div class="record-list">
      <div class="record-item" v-for="i in 5" :key="i">
        <div class="record-info">
          <span class="record-title">每日登录奖励</span>
          <span class="record-time">2024-12-0{{ i }} 10:00</span>
        </div>
        <span class="record-points positive">+10</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Calendar, Document, VideoPlay, ChatDotRound, Share } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/modules/user'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

const tasks = [
  { id: 1, name: '每日登录', desc: '每日首次登录', points: 10, icon: Calendar, color: '#409eff', done: true },
  { id: 2, name: '观看视频', desc: '观看1个视频', points: 5, icon: VideoPlay, color: '#67c23a', done: false },
  { id: 3, name: '阅读博客', desc: '阅读1篇博客', points: 5, icon: Document, color: '#e6a23c', done: false },
  { id: 4, name: '发表评论', desc: '发表1条评论', points: 10, icon: ChatDotRound, color: '#f56c6c', done: false },
  { id: 5, name: '分享内容', desc: '分享1个内容', points: 15, icon: Share, color: '#909399', done: false },
]
</script>

<style scoped lang="scss">
.user-points {
  .points-overview {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 32px;
    
    .points-card {
      text-align: center;
      padding: 24px;
      background: linear-gradient(135deg, var(--color-primary) 0%, #764ba2 100%);
      border-radius: 12px;
      color: #fff;
      
      .label {
        display: block;
        font-size: 14px;
        opacity: 0.9;
        margin-bottom: 8px;
      }
      
      .value {
        font-size: 28px;
        font-weight: 700;
      }
    }
  }
  
  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--color-border);
  }
  
  .task-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 32px;
    
    .task-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      background: var(--color-bg-secondary);
      border-radius: 10px;
      
      .task-info {
        display: flex;
        align-items: center;
        gap: 12px;
        
        .task-detail {
          .task-name {
            display: block;
            font-size: 15px;
            font-weight: 500;
            color: var(--color-text-primary);
          }
          
          .task-desc {
            font-size: 13px;
            color: var(--color-text-tertiary);
          }
        }
      }
      
      .task-reward {
        display: flex;
        align-items: center;
        gap: 12px;
        
        .points {
          font-size: 16px;
          font-weight: 600;
          color: #e6a23c;
        }
      }
    }
  }
  
  .record-list {
    .record-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 0;
      border-bottom: 1px solid var(--color-border);
      
      &:last-child {
        border-bottom: none;
      }
      
      .record-info {
        .record-title {
          display: block;
          font-size: 14px;
          color: var(--color-text-primary);
        }
        
        .record-time {
          font-size: 12px;
          color: var(--color-text-tertiary);
        }
      }
      
      .record-points {
        font-size: 16px;
        font-weight: 600;
        
        &.positive {
          color: #67c23a;
        }
        
        &.negative {
          color: #f56c6c;
        }
      }
    }
  }
}

@media (max-width: 640px) {
  .user-points .points-overview {
    grid-template-columns: 1fr;
  }
}
</style>
