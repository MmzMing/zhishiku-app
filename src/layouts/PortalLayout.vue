<template>
  <div class="portal-layout" :class="{ 'is-scrolled': isScrolled }">
    <!-- 背景图层 -->
    <div class="portal-background"></div>
    <!-- 顶部导航栏 -->
    <header class="portal-header">
      <div class="header-container">
        <!-- Logo -->
        <div class="header-logo" @click="$router.push('/portal')">
          <img src="@/assets/logo.svg" alt="Logo" class="logo-img" />
          <span class="logo-text">知识库学习平台</span>
        </div>
        
        <!-- 主导航 -->
        <nav class="header-nav">
          <router-link 
            v-for="item in navItems" 
            :key="item.path"
            :to="item.path"
            class="nav-item"
            :class="{ active: isActiveRoute(item.path) }"
          >
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.title }}</span>
          </router-link>
        </nav>
        
        <!-- 搜索框 -->
        <div class="header-search">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索视频、博客..."
            :prefix-icon="Search"
            clearable
            @keyup.enter="handleSearch"
          />
        </div>
        
        <!-- 用户区域 -->
        <div class="header-user">
          <template v-if="isLoggedIn">
            <el-dropdown trigger="click" @command="handleUserCommand">
              <div class="user-avatar-wrap">
                <el-avatar :size="36" :src="userInfo?.avatar">
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
                  <el-dropdown-item command="admin" v-if="isAdmin">
                    <el-icon><Setting /></el-icon>后台管理
                  </el-dropdown-item>
                  <el-dropdown-item divided command="logout">
                    <el-icon><SwitchButton /></el-icon>退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <el-button type="primary" @click="$router.push('/login')">登录</el-button>
            <el-button @click="$router.push('/register')">注册</el-button>
          </template>
          
          <!-- 主题切换 -->
          <ThemeToggle />
        </div>
        
        <!-- 移动端菜单按钮 -->
        <div class="mobile-menu-btn" @click="showMobileMenu = true">
          <el-icon :size="24"><Menu /></el-icon>
        </div>
      </div>
    </header>
    
    <!-- 主内容区 -->
    <main class="portal-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    
    <!-- 页脚 -->
    <footer class="portal-footer">
      <div class="footer-container">
        <div class="footer-top">
          <div class="footer-brand">
            <img src="@/assets/logo.svg" alt="Logo" class="footer-logo" />
            <h3>知识库学习平台</h3>
            <p>专注于技术分享与学习的综合平台</p>
          </div>
          
          <div class="footer-links">
            <div class="link-group">
              <h4>学习资源</h4>
              <router-link to="/portal/videos">视频教程</router-link>
              <router-link to="/portal/blogs">技术博客</router-link>
              <a href="#">学习路线</a>
            </div>
            <div class="link-group">
              <h4>帮助中心</h4>
              <a href="#">常见问题</a>
              <a href="#">联系我们</a>
              <a href="#">意见反馈</a>
            </div>
            <div class="link-group">
              <h4>关于我们</h4>
              <a href="#">平台介绍</a>
              <a href="#">用户协议</a>
              <a href="#">隐私政策</a>
            </div>
          </div>
        </div>
        
      <div class="footer-bottom">
        <div class="footer-left">
          <SiteStats :no-border="true" />
        </div>
        <div class="footer-social">
          <a href="#"><el-icon :size="20"><ChatDotRound /></el-icon></a>
          <a href="#"><el-icon :size="20"><Connection /></el-icon></a>
        </div>
      </div>
      </div>
    </footer>
    
    <!-- 移动端侧边菜单 -->
    <el-drawer v-model="showMobileMenu" direction="ltr" size="280px" :show-close="false">
      <template #header>
        <div class="mobile-menu-header">
          <img src="@/assets/logo.svg" alt="Logo" class="logo" />
          <span>知识库</span>
        </div>
      </template>
      <div class="mobile-menu-content">
        <router-link 
          v-for="item in navItems" 
          :key="item.path"
          :to="item.path"
          class="mobile-nav-item"
          @click="showMobileMenu = false"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.title }}</span>
        </router-link>
      </div>
    </el-drawer>
    
    <!-- 回到顶部 -->
    <el-backtop :right="40" :bottom="40" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  Search, ArrowDown, User, Lock, Setting, 
  SwitchButton, Menu, HomeFilled, VideoPlay, Document, 
  ChatDotRound, Connection
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/modules/user'
import ThemeToggle from '@/components/base/ThemeToggle.vue'
import SiteStats from '@/components/SiteStats/SiteStats.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 导航项
const navItems = [
  { path: '/portal/home', title: '首页', icon: HomeFilled },
  { path: '/portal/videos', title: '视频教程', icon: VideoPlay },
  { path: '/portal/blogs', title: '技术博客', icon: Document },
]

// 状态
const searchKeyword = ref('')
const showMobileMenu = ref(false)
const isScrolled = ref(false)

// 计算属性
const isLoggedIn = computed(() => userStore.isLogin)
const userInfo = computed(() => userStore.userInfo)
const isAdmin = computed(() => userStore.hasRole('admin'))
const currentYear = computed(() => new Date().getFullYear())

// 判断是否为当前路由
function isActiveRoute(path: string): boolean {
  return route.path.startsWith(path)
}

// 搜索
function handleSearch() {
  if (searchKeyword.value.trim()) {
    router.push({ path: '/portal/search', query: { q: searchKeyword.value } })
  }
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
    case 'admin':
      router.push('/admin')
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
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/portal')
  } catch {
    // 取消操作
  }
}

// 防抖函数
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  
  return function executedFunction(...args: Parameters<T>): void {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout !== null) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

// 滚动监听，使用防抖优化
const debouncedHandleScroll = debounce(() => {
  isScrolled.value = window.scrollY > 50
}, 100)

onMounted(() => {
  window.addEventListener('scroll', debouncedHandleScroll)
})
onUnmounted(() => {
  window.removeEventListener('scroll', debouncedHandleScroll)
})
</script>

<style scoped lang="scss">
.portal-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-secondary);
  position: relative;
  overflow: hidden;
}

/* 背景图层样式 */
.portal-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  background-image: url('/picture/preview.jpg');
  background-size: cover;
  background-position: center;
  filter: brightness(0.8);
  transform: scale(1.05);
}

.portal-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: var(--color-bg-primary);
  transition: all 0.3s;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  
  .is-scrolled & {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }
  
  .header-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px;
    height: 64px;
    display: flex;
    align-items: center;
    gap: 32px;
  }
  
  .header-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    
    .logo-img {
      width: 36px;
      height: 36px;
    }
    
    .logo-text {
      font-size: 18px;
      font-weight: 600;
      color: var(--color-text-primary);
    }
  }
  
  .header-nav {
    display: flex;
    gap: 8px;
    
    .nav-item {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 8px;
      color: var(--color-text-secondary);
      text-decoration: none;
      transition: all 0.3s;
      font-size: 15px;
      
      &:hover {
        background: var(--color-bg-secondary);
        color: var(--color-text-primary);
      }
      
      &.active {
        background: var(--color-primary-light);
        color: var(--color-primary);
      }
    }
  }
  
  .header-search {
    flex: 1;
    max-width: 400px;
    
    :deep(.el-input__wrapper) {
      border-radius: 20px;
    }
  }
  
  .header-user {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .user-avatar-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 6px 12px;
      border-radius: 24px;
      transition: background 0.3s;
      
      &:hover {
        background: var(--color-bg-secondary);
      }
      
      .user-name {
        font-size: 14px;
        color: var(--color-text-primary);
        max-width: 100px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
  
  .mobile-menu-btn {
    display: none;
    padding: 8px;
    cursor: pointer;
    color: var(--color-text-primary);
  }
}

.portal-main {
  flex: 1;
  margin-top: 64px;
  min-height: calc(100vh - 64px - 300px);
  position: relative;
  z-index: 10;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  
  // 暗黑主题下的背景样式
  :global(.dark-theme) & {
    background: rgba(86, 86, 86, 0.3); // #565656 with 30% opacity
  }
}

.portal-footer {
  background: var(--color-bg-primary);
  border-top: 1px solid var(--color-border);
  position: relative;
  z-index: 100; // 确保在fixed背景图片之上显示
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  
  .footer-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 48px 24px 24px;
  }
  
  .footer-top {
    display: flex;
    gap: 64px;
    margin-bottom: 32px;
  }
  
  .footer-brand {
    flex: 1;
    
    .footer-logo {
      width: 48px;
      height: 48px;
      margin-bottom: 12px;
    }
    
    h3 {
      font-size: 18px;
      color: var(--color-text-primary);
      margin-bottom: 8px;
    }
    
    p {
      font-size: 14px;
      color: var(--color-text-secondary);
    }
  }
  
  .footer-links {
    display: flex;
    gap: 64px;
    
    .link-group {
      h4 {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-text-primary);
        margin-bottom: 16px;
      }
      
      a {
        display: block;
        font-size: 13px;
        color: var(--color-text-secondary);
        text-decoration: none;
        margin-bottom: 10px;
        transition: color 0.3s;
        
        &:hover {
          color: var(--color-primary);
        }
      }
    }
  }
  
  .footer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 24px;
  border-top: 1px solid var(--color-border);
    
    p {
      font-size: 13px;
      color: var(--color-text-tertiary);
    }
    
    .footer-social {
      display: flex;
      gap: 16px;
      
      a {
        color: var(--color-text-tertiary);
        transition: color 0.3s;
        
        &:hover {
          color: var(--color-primary);
        }
      }
    }
  }
  
  .footer-left {
    display: flex;
    align-items: center;
  }
  
  .site-stats-container {
    flex: 1;
    min-width: 300px;
  }
}

.mobile-menu-header {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .logo {
    width: 32px;
    height: 32px;
  }
  
  span {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text-primary);
  }
}

.mobile-menu-content {
  .mobile-nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    color: var(--color-text-primary);
    text-decoration: none;
    border-radius: 8px;
    transition: background 0.3s;
    
    &:hover {
      background: var(--color-bg-secondary);
    }
    
    &.router-link-active {
      background: var(--color-primary-light);
      color: var(--color-primary);
    }
  }
}

// 过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// 移动端适配
@media (max-width: 1024px) {
  .portal-header {
    .header-nav {
      display: none;
    }
    
    .mobile-menu-btn {
      display: block;
    }
  }
  
  .portal-footer {
    .footer-top {
      flex-direction: column;
      gap: 32px;
    }
    
    .footer-links {
      flex-wrap: wrap;
      gap: 32px;
    }

  }
}

@media (max-width: 640px) {
  .portal-header {
    .header-container {
      padding: 0 16px;
      gap: 12px;
    }
    
    .header-logo .logo-text {
      display: none;
    }
    
    .header-search {
      display: none;
    }
    
    .header-user {
      .el-button {
        padding: 8px 12px;
        font-size: 13px;
      }
      
      .user-name {
        display: none;
      }
    }
  }
  
  .portal-footer {
    .footer-bottom {
      flex-direction: column;
      gap: 16px;
      text-align: center;
    }
  }
}
</style>
