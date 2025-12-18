<template>
  <div class="admin-layout" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <!-- 侧边栏 -->
    <aside class="admin-sidebar">
      <div class="sidebar-header">
        <img src="@/assets/logo.svg" alt="Logo" class="logo" />
        <span class="logo-text" v-show="!sidebarCollapsed">管理后台</span>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        :collapse="sidebarCollapsed"
        :collapse-transition="false"
        router
        class="sidebar-menu"
      >
        <template v-for="item in menuItems" :key="item.path">
          <el-menu-item v-if="!item.children" :index="item.path">
            <el-icon><component :is="item.icon" /></el-icon>
            <template #title>{{ item.title }}</template>
          </el-menu-item>
          
          <el-sub-menu v-else :index="item.path">
            <template #title>
              <el-icon><component :is="item.icon" /></el-icon>
              <span>{{ item.title }}</span>
            </template>
            <el-menu-item 
              v-for="child in item.children" 
              :key="child.path" 
              :index="child.path"
            >
              {{ child.title }}
            </el-menu-item>
          </el-sub-menu>
        </template>
      </el-menu>
    </aside>
    
    <!-- 主内容区 -->
    <div class="admin-main">
      <!-- 顶部导航 -->
      <header class="admin-header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="toggleSidebar">
            <Fold v-if="!sidebarCollapsed" />
            <Expand v-else />
          </el-icon>
          
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/admin' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <ThemeToggle />
          
          <el-dropdown trigger="click" @command="handleUserCommand">
            <div class="user-avatar">
              <el-avatar :size="32" :src="userInfo?.avatar">
                {{ userInfo?.nickname?.charAt(0) }}
              </el-avatar>
              <span class="user-name">{{ userInfo?.nickname }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>个人信息
                </el-dropdown-item>
                <el-dropdown-item command="password">
                  <el-icon><Lock /></el-icon>账号安全
                </el-dropdown-item>
                <el-dropdown-item command="portal">
                  <el-icon><House /></el-icon>返回前台
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>
      
      <!-- 内容区域 -->
      <main class="admin-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  Fold, Expand, ArrowDown, House, User, Lock, SwitchButton,
  Monitor, UserFilled, VideoPlay, Document, Collection, Medal, TrendCharts,
  FolderOpened, Checked, List, Avatar, Key, OfficeBuilding, DataAnalysis
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/modules/user'
import ThemeToggle from '@/components/base/ThemeToggle.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const sidebarCollapsed = ref(false)
const userInfo = computed(() => userStore.userInfo)

// 菜单项
const menuItems = [
  { path: '/admin/dashboard', title: '控制台', icon: Monitor },
  { 
    path: '/admin/personnel', 
    title: '人员管理', 
    icon: UserFilled,
    children: [
      { path: '/admin/users', title: '用户管理' },
      { path: '/admin/roles', title: '角色权限' },
      { path: '/admin/departments', title: '部门架构' },
      { path: '/admin/behavior', title: '用户行为' }
    ]
  },
  { 
    path: '/admin/videos', 
    title: '视频管理', 
    icon: VideoPlay,
    children: [
      { path: '/admin/videos', title: '视频列表' },
      { path: '/admin/videos/category', title: '分类管理' },
      { path: '/admin/videos/audit', title: '视频审核' }
    ]
  },
  { 
    path: '/admin/blogs', 
    title: '博客管理', 
    icon: Document,
    children: [
      { path: '/admin/blogs', title: '内容管理' },
      { path: '/admin/blogs/category', title: '分类标签' },
      { path: '/admin/blogs/analytics', title: '统计分析' }
    ]
  },
  { path: '/admin/dict', title: '字典管理', icon: Collection },
  { 
    path: '/admin/points', 
    title: '积分系统', 
    icon: Medal,
    children: [
      { path: '/admin/points', title: '积分规则' },
      { path: '/admin/points/records', title: '积分流水' },
      { path: '/admin/points/mall', title: '积分商城' },
      { path: '/admin/points/rank', title: '排行榜' }
    ]
  },
  { path: '/admin/monitor', title: '系统监控', icon: TrendCharts,
    children: [
      { path: '/admin/monitor', title: '服务器监控' },
      { path: '/admin/monitor/app', title: '应用监控' },
      { path: '/admin/monitor/logs', title: '日志管理' },
      { path: '/admin/monitor/audit', title: '审计追踪' }
    ]
  },
]

// 当前激活菜单
const activeMenu = computed(() => {
  const path = route.path
  // 处理详情/编辑页面
  if (path.includes('/admin/users')) return '/admin/users'
  if (path.includes('/admin/roles')) return '/admin/roles'
  if (path.includes('/admin/departments')) return '/admin/departments'
  if (path.includes('/admin/behavior')) return '/admin/behavior'
  if (path.includes('/admin/videos/')) return '/admin/videos'
  if (path.includes('/admin/blogs/')) return '/admin/blogs'
  return path
})

// 面包屑
const breadcrumbs = computed(() => {
  const crumbs: { path: string; title: string }[] = []
  const meta = route.meta
  if (meta?.title) {
    crumbs.push({ path: route.path, title: meta.title as string })
  }
  return crumbs
})

// 切换侧边栏
function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

// 返回前台
function goToPortal() {
  router.push('/portal')
}

// 用户菜单命令
function handleUserCommand(command: string) {
  switch (command) {
    case 'profile':
      router.push('/portal/user/profile')
      break
    case 'password':
      router.push('/portal/user/settings')
      break
    case 'portal':
      router.push('/portal')
      break
    case 'logout':
      handleLogout()
      break
  }
}

// 退出登录
async function handleLogout() {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      type: 'warning'
    })
    await userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  } catch {
    // 取消
  }
}
</script>

<style scoped lang="scss">
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: var(--color-bg-secondary);
}

.admin-sidebar {
  width: 240px;
  background: var(--color-bg-primary);
  transition: width 0.3s;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  
  .sidebar-collapsed & {
    width: 64px;
  }
  
  .sidebar-header {
    height: 60px;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 20px;
    
    .logo {
      width: 32px;
      height: 32px;
      flex-shrink: 0;
    }
    
    .logo-text {
      font-size: 16px;
      font-weight: 600;
      color: var(--color-text-primary);
      white-space: nowrap;
    }
  }
  
  .sidebar-menu {
    flex: 1;
    border: none;
    overflow-y: auto;
    background-color: var(--color-bg-primary);
    
    &:not(.el-menu--collapse) {
      width: 100%;
    }
    
    :deep(.el-menu-item),
    :deep(.el-sub-menu__title) {
      color: var(--color-text-secondary);
      
      &:hover {
        background-color: var(--color-bg-secondary);
        color: var(--color-text-primary);
      }
      
      &.is-active {
        color: var(--color-primary);
        background-color: var(--color-bg-secondary);
      }
    }
  }
}

.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.admin-header {
  height: 60px;
  background: var(--color-bg-primary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .collapse-btn {
      font-size: 20px;
      cursor: pointer;
      color: var(--color-text-secondary);
      transition: color 0.3s;
      
      &:hover {
        color: var(--color-primary);
      }
    }
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .user-avatar {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 6px 12px;
      border-radius: 8px;
      transition: background 0.3s;
      
      &:hover {
        background: var(--color-bg-secondary);
      }
      
      .user-name {
        font-size: 14px;
        color: var(--color-text-primary);
      }
    }
  }
}

.admin-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// 响应式
@media (max-width: 768px) {
  .admin-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 1000;
    transform: translateX(-100%);
    
    .sidebar-collapsed & {
      transform: translateX(0);
      width: 240px;
    }
  }
  
  .admin-header .user-name {
    display: none;
  }
}
</style>
