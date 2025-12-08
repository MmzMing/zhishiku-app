/**
 * 用户状态管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 用户信息接口
export interface UserInfo {
  id: string
  username: string
  nickname: string
  avatar: string
  email: string
  phone: string
  roles: string[]
  permissions: string[]
}

// 登录凭证接口
export interface LoginCredentials {
  username: string
  password: string
  captcha?: string
  rememberMe?: boolean
}

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref<string>('')
  const userInfo = ref<UserInfo | null>(null)
  const permissions = ref<string[]>([])
  const roles = ref<string[]>([])

  // 计算属性
  const isLogin = computed(() => !!token.value)
  
  const hasPermission = computed(() => {
    return (permission: string) => permissions.value.includes(permission)
  })
  
  const hasRole = computed(() => {
    return (role: string) => roles.value.includes(role)
  })

  // 方法
  /**
   * 登录
   */
  async function login(credentials: LoginCredentials): Promise<boolean> {
    try {
      // TODO: 调用登录API
      // const response = await api.user.login(credentials)
      
      // 模拟登录成功
      token.value = 'mock_token_' + Date.now()
      
      // 保存token到localStorage
      if (credentials.rememberMe) {
        localStorage.setItem('token', token.value)
      } else {
        sessionStorage.setItem('token', token.value)
      }
      
      // 获取用户信息
      await getUserInfo()
      
      return true
    } catch (error) {
      console.error('登录失败:', error)
      return false
    }
  }

  /**
   * 登出
   */
  async function logout(): Promise<void> {
    try {
      // TODO: 调用登出API
      // await api.user.logout()
    } catch (error) {
      console.error('登出失败:', error)
    } finally {
      // 清除状态
      token.value = ''
      userInfo.value = null
      permissions.value = []
      roles.value = []
      
      // 清除存储
      localStorage.removeItem('token')
      sessionStorage.removeItem('token')
    }
  }

  /**
   * 获取用户信息
   */
  async function getUserInfo(): Promise<UserInfo | null> {
    try {
      // TODO: 调用获取用户信息API
      // const response = await api.user.getUserInfo()
      
      // 模拟用户信息
      userInfo.value = {
        id: '1',
        username: 'admin',
        nickname: '管理员',
        avatar: '',
        email: 'admin@example.com',
        phone: '13800138000',
        roles: ['admin'],
        permissions: ['*']
      }
      
      roles.value = userInfo.value.roles
      permissions.value = userInfo.value.permissions
      
      return userInfo.value
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return null
    }
  }

  /**
   * 初始化 - 检查本地存储的token
   */
  function init(): void {
    const savedToken = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (savedToken) {
      token.value = savedToken
      getUserInfo()
    }
  }

  /**
   * 更新用户信息
   */
  function updateUserInfo(info: Partial<UserInfo>): void {
    if (userInfo.value) {
      userInfo.value = { ...userInfo.value, ...info }
    }
  }

  return {
    // 状态
    token,
    userInfo,
    permissions,
    roles,
    
    // 计算属性
    isLogin,
    hasPermission,
    hasRole,
    
    // 方法
    login,
    logout,
    getUserInfo,
    init,
    updateUserInfo
  }
})
