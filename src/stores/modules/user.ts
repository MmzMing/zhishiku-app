/**
 * 用户状态管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo as UserInfoType } from '@/types/user'

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

// JWT Token信息接口
export interface JwtToken {
  access_token: string
  token_type: string
  refresh_token: string
  expires_in: number
  scope: string
}

// OAuth2响应接口
export interface OAuth2Response {
  access_token: string
  token_type: string
  refresh_token: string
  expires_in: number
  scope: string
  user: UserInfo
}

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref<string>('')
  const refreshToken = ref<string>('')
  const userInfo = ref<UserInfo | null>(null)
  const permissions = ref<string[]>([])
  const roles = ref<string[]>([])
  const expiresIn = ref<number>(0)
  const tokenType = ref<string>('Bearer')

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
   * 模拟OAuth2登录流程
   */
  async function login(credentials: LoginCredentials): Promise<boolean> {
    try {
      // 检查是否为超级用户登录 (admin/123456)
      if (credentials.username === 'admin' && credentials.password === '123456') {
        // 设置超级用户token
        token.value = 'super_admin_token_' + Date.now()
        refreshToken.value = 'super_admin_refresh_token_' + Date.now()
        tokenType.value = 'Bearer'
        expiresIn.value = Date.now() + 3600 * 1000 // 1小时后过期
        
        // 保存token到localStorage
        if (credentials.rememberMe) {
          localStorage.setItem('access_token', token.value)
          localStorage.setItem('refresh_token', refreshToken.value)
          localStorage.setItem('token_type', tokenType.value)
        } else {
          sessionStorage.setItem('access_token', token.value)
          sessionStorage.setItem('refresh_token', refreshToken.value)
          sessionStorage.setItem('token_type', tokenType.value)
        }
        
        // 设置超级用户信息
        userInfo.value = {
          id: '0',
          username: 'admin',
          nickname: '超级管理员',
          avatar: '',
          email: 'admin@zhishiku.com',
          phone: '13800138000',
          roles: ['admin', 'super'],
          permissions: ['*'] // 所有权限
        }
        
        roles.value = userInfo.value.roles
        permissions.value = userInfo.value.permissions
        
        return true
      }
      
      // 如果不是超级管理员，则模拟登录失败
      console.error('登录失败: 仅支持超级管理员登录')
      return false
      
      /*
      // TODO: 实际开发中应调用后端OAuth2登录接口
      const formData = new FormData()
      formData.append('username', credentials.username)
      formData.append('password', credentials.password)
      formData.append('grant_type', 'password')
      formData.append('client_id', 'web_app')
      formData.append('client_secret', 'web_app')
      
      const response = await fetch('/oauth/token', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': 'Basic ' + btoa('web_app:web_app')
        }
      })
      
      if (response.ok) {
        const data: OAuth2Response = await response.json()
        token.value = data.access_token
        refreshToken.value = data.refresh_token
        tokenType.value = data.token_type
        expiresIn.value = Date.now() + data.expires_in * 1000
        
        // 保存token到localStorage
        if (credentials.rememberMe) {
          localStorage.setItem('access_token', token.value)
          localStorage.setItem('refresh_token', refreshToken.value)
          localStorage.setItem('token_type', tokenType.value)
        } else {
          sessionStorage.setItem('access_token', token.value)
          sessionStorage.setItem('refresh_token', refreshToken.value)
          sessionStorage.setItem('token_type', tokenType.value)
        }
        
        // 获取用户信息
        await getUserInfo()
        return true
      } else {
        throw new Error('登录失败')
      }
      */
    } catch (error) {
      console.error('登录失败:', error)
      return false
    }
  }

  /**
   * 刷新Token
   */
  async function refreshTokenFunc(): Promise<boolean> {
    try {
      // TODO: 实际开发中应调用后端刷新token接口
      /*
      const formData = new FormData()
      formData.append('grant_type', 'refresh_token')
      formData.append('refresh_token', refreshToken.value)
      formData.append('client_id', 'web_app')
      formData.append('client_secret', 'web_app')
      
      const response = await fetch('/oauth/token', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': 'Basic ' + btoa('web_app:web_app')
        }
      })
      
      if (response.ok) {
        const data: OAuth2Response = await response.json()
        token.value = data.access_token
        refreshToken.value = data.refresh_token
        tokenType.value = data.token_type
        expiresIn.value = Date.now() + data.expires_in * 1000
        
        // 更新存储中的token
        const storage = localStorage.getItem('access_token') ? localStorage : sessionStorage
        storage.setItem('access_token', token.value)
        storage.setItem('refresh_token', refreshToken.value)
        storage.setItem('token_type', tokenType.value)
        
        return true
      } else {
        throw new Error('刷新token失败')
      }
      */
      
      // 模拟刷新成功
      token.value = 'mock_access_token_' + Date.now()
      refreshToken.value = 'mock_refresh_token_' + Date.now()
      tokenType.value = 'Bearer'
      expiresIn.value = Date.now() + 3600 * 1000 // 1小时后过期
      
      // 更新存储中的token
      const storage = localStorage.getItem('access_token') ? localStorage : sessionStorage
      storage.setItem('access_token', token.value)
      storage.setItem('refresh_token', refreshToken.value)
      storage.setItem('token_type', tokenType.value)
      
      return true
    } catch (error) {
      console.error('刷新token失败:', error)
      return false
    }
  }

  /**
   * 登出
   */
  async function logout(): Promise<void> {
    try {
      // TODO: 实际开发中应调用后端登出接口
      /*
      await fetch('/oauth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `${tokenType.value} ${token.value}`
        }
      })
      */
    } catch (error) {
      console.error('登出请求失败:', error)
    } finally {
      // 清除状态
      token.value = ''
      refreshToken.value = ''
      userInfo.value = null
      permissions.value = []
      roles.value = []
      expiresIn.value = 0
      tokenType.value = 'Bearer'
      
      // 清除存储
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('token_type')
      sessionStorage.removeItem('access_token')
      sessionStorage.removeItem('refresh_token')
      sessionStorage.removeItem('token_type')
    }
  }

  /**
   * 获取用户信息
   */
  async function getUserInfo(): Promise<UserInfo | null> {
    try {
      // TODO: 实际开发中应调用后端获取用户信息接口
      /*
      const response = await fetch('/api/user/info', {
        headers: {
          'Authorization': `${tokenType.value} ${token.value}`
        }
      })
      
      if (response.ok) {
        const userData: UserInfoType = await response.json()
        userInfo.value = {
          id: userData.id,
          username: userData.username,
          nickname: userData.nickname || userData.username,
          avatar: userData.avatar || '',
          email: userData.email || '',
          phone: userData.phone || '',
          roles: userData.roles || [],
          permissions: userData.permissions || []
        }
        
        roles.value = userInfo.value.roles
        permissions.value = userInfo.value.permissions
        
        return userInfo.value
      } else {
        throw new Error('获取用户信息失败')
      }
      */
      
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
    const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
    const refreshTokenVal = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token')
    const tokenTypeVal = localStorage.getItem('token_type') || sessionStorage.getItem('token_type')
    
    if (accessToken && refreshTokenVal) {
      token.value = accessToken
      refreshToken.value = refreshTokenVal
      tokenType.value = tokenTypeVal || 'Bearer'
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

  /**
   * 检查token是否即将过期（5分钟内）
   */
  function isTokenExpiringSoon(): boolean {
    if (!expiresIn.value) return false
    const now = Date.now()
    const fiveMinutes = 5 * 60 * 1000
    return expiresIn.value - now < fiveMinutes
  }

  return {
    // 状态
    token,
    refreshToken,
    userInfo,
    permissions,
    roles,
    expiresIn,
    tokenType,
    
    // 计算属性
    isLogin,
    hasPermission,
    hasRole,
    isTokenExpiringSoon,
    
    // 方法
    login,
    logout,
    getUserInfo,
    refreshTokenFunc,
    init,
    updateUserInfo
  }
})