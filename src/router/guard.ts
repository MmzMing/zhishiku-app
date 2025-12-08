/**
 * 路由守卫
 */

import type { Router, RouteLocationNormalized } from 'vue-router'
import { useUserStore } from '@/stores/modules/user'
import NProgress from 'nprogress'

// 白名单路由（不需要登录）
const whiteList = ['/login', '/register', '/404']

/**
 * 设置路由守卫
 */
export function setupRouterGuard(router: Router): void {
  // 前置守卫
  router.beforeEach(async (to, _from, next) => {
    // 开始进度条
    NProgress.start()
    
    // 设置页面标题
    document.title = getPageTitle(to)
    
    // 获取用户 store
    const userStore = useUserStore()
    const token = userStore.token
    
    if (token) {
      // 已登录
      if (to.path === '/login') {
        // 已登录访问登录页，重定向到首页
        next({ path: '/' })
        NProgress.done()
      } else {
        // 检查是否有用户信息
        if (userStore.userInfo) {
          // 检查权限
          if (hasPermission(to, userStore)) {
            next()
          } else {
            next({ path: '/404' })
            NProgress.done()
          }
        } else {
          // 尝试获取用户信息
          try {
            await userStore.getUserInfo()
            // 重新导航
            next({ ...to, replace: true })
          } catch (_error) {
            // 获取用户信息失败，清除token并重定向到登录页
            await userStore.logout()
            next(`/login?redirect=${to.path}`)
            NProgress.done()
          }
        }
      }
    } else {
      // 未登录
      if (whiteList.includes(to.path) || !to.meta.requiresAuth) {
        // 在白名单中或不需要登录，直接放行
        next()
      } else {
        // 重定向到登录页
        next(`/login?redirect=${to.path}`)
        NProgress.done()
      }
    }
  })
  
  // 后置守卫
  router.afterEach(() => {
    // 结束进度条
    NProgress.done()
  })
  
  // 错误处理
  router.onError((error) => {
    console.error('路由错误:', error)
    NProgress.done()
  })
}

/**
 * 获取页面标题
 */
function getPageTitle(to: RouteLocationNormalized): string {
  const title = to.meta.title as string
  const appTitle = '知识库平台'
  
  if (title) {
    return `${title} - ${appTitle}`
  }
  
  return appTitle
}

/**
 * 检查权限
 */
function hasPermission(
  to: RouteLocationNormalized,
  userStore: ReturnType<typeof useUserStore>
): boolean {
  // 检查角色权限
  const requiredRoles = to.meta.roles as string[] | undefined
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRole = requiredRoles.some(role => userStore.roles.includes(role))
    if (!hasRole) {
      return false
    }
  }
  
  // 检查权限点
  const requiredPermissions = to.meta.permissions as string[] | undefined
  if (requiredPermissions && requiredPermissions.length > 0) {
    // 超级管理员拥有所有权限
    if (userStore.permissions.includes('*')) {
      return true
    }
    
    const hasPermission = requiredPermissions.some(
      permission => userStore.permissions.includes(permission)
    )
    if (!hasPermission) {
      return false
    }
  }
  
  return true
}
