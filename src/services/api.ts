import { mockService } from '@/mock'
import type { User, LoginCredentials, Blog, Video, PaginationResult } from '@/types'

// API基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
const USE_MOCK = import.meta.env.DEV // 在开发环境使用mock数据

// 通用请求函数，用于未来替换为真实API调用
async function request<T = any>(url: string, options?: RequestInit): Promise<T> {
  // 实际项目中这里会发送真实的fetch请求
  console.warn(`API调用: ${url} - 目前使用mock数据`)
  throw new Error('Real API not implemented yet')
}

// 用户API
export const userApi = {
  // 登录
  login: async (credentials: LoginCredentials): Promise<{ token: string }> => {
    if (USE_MOCK) {
      return mockService.login(credentials)
    }
    return request<{ token: string }>('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    })
  },
  
  // 获取用户信息
  getProfile: async (): Promise<User> => {
    if (USE_MOCK) {
      return mockService.getCurrentUser()
    }
    return request<User>('/api/auth/profile')
  },
  
  // 获取用户列表
  getUserList: async (params: {
    pageNum: number
    pageSize: number
    keyword?: string
    status?: string
    roleId?: string
  }): Promise<PaginationResult<User>> => {
    if (USE_MOCK) {
      return mockService.getUserList(params)
    }
    return request<PaginationResult<User>>('/api/users', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
  },
  
  // 更新用户信息
  updateUser: async (id: string, data: Partial<User>): Promise<User> => {
    if (USE_MOCK) {
      // Mock服务暂未实现，返回空数据
      throw new Error('Mock API not implemented')
    }
    return request<User>(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
  },
  
  // 删除用户
  deleteUser: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      // Mock服务暂未实现，返回空数据
      throw new Error('Mock API not implemented')
    }
    return request<void>(`/api/users/${id}`, {
      method: 'DELETE'
    })
  }
}

// 博客API
export const blogApi = {
  // 获取博客列表
  getBlogList: async (params: {
    pageNum: number
    pageSize: number
    categoryId?: string
    keyword?: string
    sortBy?: string
  }): Promise<PaginationResult<Blog>> => {
    if (USE_MOCK) {
      return mockService.getBlogList(params)
    }
    return request<PaginationResult<Blog>>('/api/blogs', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
  },
  
  // 获取博客详情
  getBlogDetail: async (id: string): Promise<Blog> => {
    if (USE_MOCK) {
      return mockService.getBlogDetail(id)
    }
    return request<Blog>(`/api/blogs/${id}`)
  },
  
  // 获取热门博客
  getHotBlogs: async (limit: number = 5): Promise<Blog[]> => {
    if (USE_MOCK) {
      return mockService.getHotBlogs(limit)
    }
    return request<Blog[]>(`/api/blogs/hot?limit=${limit}`)
  }
}

// 视频API
export const videoApi = {
  // 获取推荐视频
  getRecommendVideos: async (limit: number = 6): Promise<Video[]> => {
    if (USE_MOCK) {
      return mockService.getRecommendVideos(limit)
    }
    return request<Video[]>(`/api/videos/recommend?limit=${limit}`)
  },
  
  // 获取视频列表
  getVideoList: async (params: {
    pageNum: number
    pageSize: number
    categoryId?: string
    keyword?: string
  }): Promise<PaginationResult<Video>> => {
    if (USE_MOCK) {
      return mockService.getVideoList(params)
    }
    return request<PaginationResult<Video>>('/api/videos', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// 导出所有API
export default {
  user: userApi,
  blog: blogApi,
  video: videoApi
}
