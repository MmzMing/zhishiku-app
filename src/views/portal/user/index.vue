<template>
  <div class="user-center">
    <div class="page-container">
      <!-- 用户信息头部 -->
      <div class="user-header">
        <div class="user-cover"></div>
        <div class="user-info">
          <el-avatar :size="100" :src="userInfo?.avatar">
            {{ userInfo?.nickname?.charAt(0) }}
          </el-avatar>
          <div class="user-detail">
            <h2 class="user-name">{{ userInfo?.nickname || '未登录' }}</h2>
            <p class="user-signature">{{ userInfo?.signature || '这个人很懒，什么都没写' }}</p>
            <div class="user-stats">
              <div class="stat-item">
                <span class="value">{{ userInfo?.points || 0 }}</span>
                <span class="label">积分</span>
              </div>
              <div class="stat-item">
                <span class="value">Lv.{{ userInfo?.level || 1 }}</span>
                <span class="label">等级</span>
              </div>
              <div class="stat-item">
                <span class="value">32</span>
                <span class="label">收藏</span>
              </div>
              <div class="stat-item">
                <span class="value">128</span>
                <span class="label">历史</span>
              </div>
            </div>
          </div>
          <el-button type="primary" size="small" @click="$router.push('/portal/user/settings')">
            <el-icon><Edit /></el-icon>
            编辑资料
          </el-button>
        </div>
      </div>
      
      <!-- 侧边导航 + 内容 -->
      <div class="user-content">
        <nav class="user-nav">
          <router-link 
            v-for="item in navItems" 
            :key="item.path"
            :to="item.path"
            class="nav-item"
          >
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.title }}</span>
          </router-link>
        </nav>
        
        <div class="user-main">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { User, Star, Clock, Medal, Setting, Edit } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/modules/user'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

const navItems = [
  { path: '/portal/user/profile', title: '个人资料', icon: User },
  { path: '/portal/user/favorites', title: '我的收藏', icon: Star },
  { path: '/portal/user/history', title: '观看历史', icon: Clock },
  { path: '/portal/user/points', title: '我的积分', icon: Medal },
  { path: '/portal/user/settings', title: '账号设置', icon: Setting },
]
</script>

<style scoped lang="scss">
.user-center {
  padding: 32px 0;
  
  .page-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
  }
}

.user-header {
  position: relative;
  margin-bottom: 32px;
  
  .user-cover {
    height: 200px;
    background: linear-gradient(135deg, var(--color-primary) 0%, #764ba2 100%);
    border-radius: 16px 16px 0 0;
  }
  
  .user-info {
    display: flex;
    align-items: flex-end;
    gap: 24px;
    padding: 0 32px 24px;
    background: var(--color-bg-primary);
    border-radius: 0 0 16px 16px;
    margin-top: -50px;
    position: relative;
    
    .el-avatar {
      border: 4px solid var(--color-bg-primary);
      flex-shrink: 0;
    }
    
    .user-detail {
      flex: 1;
      padding-top: 60px;
      
      .user-name {
        font-size: 24px;
        font-weight: 600;
        color: var(--color-text-primary);
        margin-bottom: 8px;
      }
      
      .user-signature {
        font-size: 14px;
        color: var(--color-text-secondary);
        margin-bottom: 16px;
      }
      
      .user-stats {
        display: flex;
        gap: 32px;
        
        .stat-item {
          text-align: center;
          
          .value {
            display: block;
            font-size: 20px;
            font-weight: 600;
            color: var(--color-text-primary);
          }
          
          .label {
            font-size: 13px;
            color: var(--color-text-tertiary);
          }
        }
      }
    }
  }
}

.user-content {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 24px;
  
  .user-nav {
    background: var(--color-bg-primary);
    border-radius: 12px;
    padding: 16px;
    height: fit-content;
    
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      border-radius: 8px;
      color: var(--color-text-secondary);
      text-decoration: none;
      transition: all 0.3s;
      
      &:hover {
        background: var(--color-bg-secondary);
        color: var(--color-text-primary);
      }
      
      &.router-link-active {
        background: var(--color-primary-light);
        color: var(--color-primary);
      }
    }
  }
  
  .user-main {
    background: var(--color-bg-primary);
    border-radius: 12px;
    padding: 24px;
    min-height: 400px;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .user-header .user-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
    
    .user-detail {
      padding-top: 16px;
      
      .user-stats {
        justify-content: center;
      }
    }
  }
  
  .user-content {
    grid-template-columns: 1fr;
    
    .user-nav {
      display: flex;
      overflow-x: auto;
      gap: 8px;
      
      .nav-item {
        white-space: nowrap;
      }
    }
  }
}
</style>
