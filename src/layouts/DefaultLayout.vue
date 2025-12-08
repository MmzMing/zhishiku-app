<template>
  <el-container class="default-layout">
    <!-- 侧边栏 -->
    <el-aside :width="sidebarWidth" class="layout-aside">
      <div class="logo-container">
        <img src="@/assets/logo.svg" alt="Logo" class="logo" />
        <h1 v-if="!isCollapse" class="site-title">知识库平台</h1>
      </div>
      
      <el-scrollbar class="menu-scrollbar">
        <el-menu
          :default-active="activeMenu"
          :collapse="isCollapse"
          :collapse-transition="false"
          background-color="var(--color-bg-secondary)"
          text-color="var(--color-text-primary)"
          active-text-color="var(--color-primary)"
          router
        >
          <el-menu-item index="/home">
            <el-icon><HomeFilled /></el-icon>
            <template #title>首页</template>
          </el-menu-item>
          
          <el-menu-item index="/dashboard">
            <el-icon><DataBoard /></el-icon>
            <template #title>仪表盘</template>
          </el-menu-item>
          
          <el-sub-menu index="/admin">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>管理后台</span>
            </template>
            <el-menu-item index="/admin/dashboard">管理面板</el-menu-item>
            <el-menu-item index="/admin/users">用户管理</el-menu-item>
            <el-menu-item index="/admin/videos">视频管理</el-menu-item>
            <el-menu-item index="/admin/blogs">博客管理</el-menu-item>
            <el-menu-item index="/admin/dict">字典管理</el-menu-item>
            <el-menu-item index="/admin/points">积分管理</el-menu-item>
            <el-menu-item index="/admin/monitor">系统监控</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-scrollbar>
    </el-aside>
    
    <el-container class="main-container">
      <!-- 头部 -->
      <el-header class="layout-header">
        <div class="header-left">
          <el-icon 
            class="collapse-btn" 
            :size="20"
            @click="toggleCollapse"
          >
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          
          <!-- 面包屑 -->
          <el-breadcrumb separator="/">
            <el-breadcrumb-item 
              v-for="item in breadcrumbs" 
              :key="item.path"
              :to="item.path"
            >
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <!-- 主题切换 -->
          <ThemeToggle />
          
          <!-- 全屏 -->
          <el-tooltip content="全屏" placement="bottom">
            <el-icon 
              class="header-icon" 
              :size="20"
              @click="toggleFullscreen"
            >
              <FullScreen />
            </el-icon>
          </el-tooltip>
          
          <!-- 用户下拉菜单 -->
          <el-dropdown trigger="click" @command="handleUserCommand">
            <div class="user-info">
              <el-avatar :size="32" :src="userAvatar">
                {{ userStore.userInfo?.nickname?.charAt(0) || 'U' }}
              </el-avatar>
              <span class="username">{{ userStore.userInfo?.nickname || '用户' }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item command="settings">
                  <el-icon><Setting /></el-icon>
                  设置
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <!-- 主内容区 -->
      <el-main class="layout-main">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <keep-alive>
              <component :is="Component" />
            </keep-alive>
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  HomeFilled, 
  DataBoard, 
  Setting, 
  Fold, 
  Expand,
  FullScreen,
  ArrowDown,
  User,
  SwitchButton
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/modules/user'
import { useAppStore } from '@/stores/modules/app'
import ThemeToggle from '@/components/base/ThemeToggle.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()

// 侧边栏折叠状态
const isCollapse = ref(false)

// 侧边栏宽度
const sidebarWidth = computed(() => isCollapse.value ? '64px' : '220px')

// 当前激活菜单
const activeMenu = computed(() => route.path)

// 用户头像
const userAvatar = computed(() => userStore.userInfo?.avatar || '')

// 面包屑
const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.meta?.title)
  return matched.map(item => ({
    path: item.path,
    title: item.meta.title as string
  }))
})

// 切换侧边栏折叠
function toggleCollapse() {
  isCollapse.value = !isCollapse.value
  appStore.toggleSidebar()
}

// 切换全屏
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

// 处理用户命令
async function handleUserCommand(command: string) {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      await userStore.logout()
      router.push('/login')
      break
  }
}
</script>

<style scoped lang="scss">
.default-layout {
  min-height: 100vh;
  
  .layout-aside {
    background-color: var(--color-bg-secondary);
    border-right: 1px solid var(--color-border-light);
    transition: width 0.3s ease;
    
    .logo-container {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 60px;
      padding: 0 16px;
      border-bottom: 1px solid var(--color-border-light);
      
      .logo {
        width: 32px;
        height: 32px;
      }
      
      .site-title {
        margin-left: 12px;
        font-size: 16px;
        font-weight: 600;
        color: var(--color-text-primary);
        white-space: nowrap;
      }
    }
    
    .menu-scrollbar {
      height: calc(100vh - 60px);
    }
    
    :deep(.el-menu) {
      border-right: none;
    }
  }
  
  .main-container {
    display: flex;
    flex-direction: column;
    
    .layout-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 60px;
      padding: 0 20px;
      background-color: var(--color-bg-primary);
      border-bottom: 1px solid var(--color-border-light);
      
      .header-left {
        display: flex;
        align-items: center;
        gap: 16px;
        
        .collapse-btn {
          cursor: pointer;
          color: var(--color-text-secondary);
          transition: color 0.2s;
          
          &:hover {
            color: var(--color-primary);
          }
        }
      }
      
      .header-right {
        display: flex;
        align-items: center;
        gap: 16px;
        
        .header-icon {
          cursor: pointer;
          color: var(--color-text-secondary);
          transition: color 0.2s;
          
          &:hover {
            color: var(--color-primary);
          }
        }
        
        .user-info {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: background-color 0.2s;
          
          &:hover {
            background-color: var(--color-neutral-100);
          }
          
          .username {
            font-size: 14px;
            color: var(--color-text-primary);
          }
        }
      }
    }
    
    .layout-main {
      flex: 1;
      padding: 20px;
      background-color: var(--color-bg-secondary);
      overflow-y: auto;
    }
  }
}

// 页面切换动画
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s ease;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
