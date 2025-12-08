/**
 * Mock 数据服务
 * 模拟后端 API 响应
 */

import type { UserInfo, UserListItem } from '@/types/user'
import type { Video } from '@/types/video'
import type { Blog } from '@/types/blog'

// 模拟延迟
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms))

// 模拟用户数据
export const mockUsers: UserListItem[] = [
  {
    id: '1',
    username: 'admin',
    nickname: '超级管理员',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    email: 'admin@example.com',
    phone: '13800138000',
    gender: 'male',
    roles: ['admin'],
    permissions: ['*'],
    points: 10000,
    level: 10,
    status: 'active',
    createdAt: '2024-01-01 00:00:00',
    lastLoginAt: '2024-12-08 10:00:00',
    roleNames: ['超级管理员'],
    loginCount: 100,
  },
  {
    id: '2',
    username: 'user1',
    nickname: '普通用户',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
    email: 'user1@example.com',
    phone: '13800138001',
    gender: 'female',
    roles: ['user'],
    permissions: ['read'],
    points: 500,
    level: 3,
    status: 'active',
    createdAt: '2024-03-15 08:30:00',
    lastLoginAt: '2024-12-07 15:20:00',
    roleNames: ['普通用户'],
    loginCount: 25,
  },
  {
    id: '3',
    username: 'editor',
    nickname: '内容编辑',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=editor',
    email: 'editor@example.com',
    phone: '13800138002',
    gender: 'male',
    roles: ['editor'],
    permissions: ['read', 'write', 'edit'],
    points: 1500,
    level: 5,
    status: 'active',
    createdAt: '2024-02-20 14:00:00',
    lastLoginAt: '2024-12-08 09:15:00',
    roleNames: ['内容编辑'],
    loginCount: 60,
  },
]

// 模拟视频数据
export const mockVideos: Video[] = Array.from({ length: 20 }, (_, i) => ({
  id: `video-${i + 1}`,
  title: `Vue 3 完整教程 第${i + 1}集 - ${['组合式API', '响应式原理', 'Pinia状态管理', '路由配置', '组件通信'][i % 5]}`,
  description: `这是一个关于Vue 3的详细教程视频，本集主要讲解${['组合式API的使用方法', '响应式系统的底层原理', 'Pinia状态管理的最佳实践', 'Vue Router的高级配置', '组件之间的各种通信方式'][i % 5]}。`,
  cover: `https://picsum.photos/seed/video${i + 1}/400/225`,
  url: `https://example.com/videos/video-${i + 1}.mp4`,
  duration: 600 + Math.floor(Math.random() * 1200),
  categoryId: 'cat-1',
  categoryName: '前端开发',
  tags: ['Vue 3', 'TypeScript', '前端'][i % 3] ? ['Vue 3', 'TypeScript'] : ['React', 'JavaScript'],
  author: {
    id: '1',
    nickname: '技术大牛',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher',
  },
  playCount: Math.floor(Math.random() * 10000) + 1000,
  likeCount: Math.floor(Math.random() * 500) + 50,
  collectCount: Math.floor(Math.random() * 200) + 20,
  commentCount: Math.floor(Math.random() * 100) + 10,
  isLiked: false,
  isCollected: false,
  status: 'published',
  resolution: ['720p', '1080p', '4k'][i % 3] as '720p' | '1080p' | '4k',
  fileSize: 100000000 + Math.floor(Math.random() * 500000000),
  createdAt: `2024-${String(Math.floor(i / 2) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')} 10:00:00`,
  publishedAt: `2024-${String(Math.floor(i / 2) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')} 12:00:00`,
}))

// 模拟博客数据
export const mockBlogs: Blog[] = Array.from({ length: 30 }, (_, i) => ({
  id: `blog-${i + 1}`,
  title: `${['深入理解', '快速入门', '最佳实践', '踩坑指南', '性能优化'][i % 5]} ${['Vue 3', 'React 18', 'TypeScript', 'Node.js', 'Docker'][i % 5]}`,
  summary: `本文将详细介绍${['Vue 3', 'React 18', 'TypeScript', 'Node.js', 'Docker'][i % 5]}的${['核心概念', '使用技巧', '常见问题', '高级特性', '实战案例'][i % 5]}，帮助你快速掌握相关技术。`,
  content: `# 标题

这是博客的正文内容...

## 第一部分

详细内容...

## 第二部分

更多内容...`,
  contentHtml: '<h1>标题</h1><p>这是博客的正文内容...</p>',
  cover: `https://picsum.photos/seed/blog${i + 1}/800/400`,
  categoryId: 'cat-' + ((i % 5) + 1),
  categoryName: ['前端开发', '后端开发', 'DevOps', '数据库', '架构设计'][i % 5],
  tags: [['Vue', 'JavaScript'], ['React', 'TypeScript'], ['Node.js', 'Express'], ['MySQL', 'Redis'], ['Docker', 'K8s']][i % 5],
  author: {
    id: String((i % 3) + 1),
    nickname: ['技术大牛', '前端小王', '后端老李'][i % 3],
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=author${i % 3}`,
  },
  readCount: Math.floor(Math.random() * 5000) + 500,
  likeCount: Math.floor(Math.random() * 300) + 30,
  collectCount: Math.floor(Math.random() * 100) + 10,
  commentCount: Math.floor(Math.random() * 50) + 5,
  isLiked: false,
  isCollected: false,
  status: 'published',
  isTop: i < 3,
  isOriginal: i % 3 !== 0,
  wordCount: 2000 + Math.floor(Math.random() * 3000),
  readTime: 5 + Math.floor(Math.random() * 10),
  createdAt: `2024-${String(Math.floor(i / 3) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')} 14:00:00`,
  updatedAt: `2024-${String(Math.floor(i / 3) + 1).padStart(2, '0')}-${String((i % 28) + 2).padStart(2, '0')} 10:00:00`,
  publishedAt: `2024-${String(Math.floor(i / 3) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')} 15:00:00`,
}))

// Mock API 服务
export const mockService = {
  // 用户登录
  async login(username: string, password: string): Promise<{ token: string; userInfo: UserInfo }> {
    await delay()
    
    if (password.length < 6) {
      throw { code: 400, message: '密码长度不能少于6位' }
    }

    // 查找用户或创建临时用户
    let user = mockUsers.find(u => u.username === username)
    if (!user) {
      user = {
        id: Date.now().toString(),
        username,
        nickname: username,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        email: `${username}@example.com`,
        phone: '',
        gender: 'unknown',
        roles: ['user'],
        permissions: ['read'],
        points: 100,
        level: 1,
        status: 'active',
        createdAt: new Date().toISOString(),
        roleNames: ['普通用户'],
        loginCount: 1,
      }
    }

    return {
      token: 'mock_token_' + Date.now(),
      userInfo: user,
    }
  },

  // 用户注册
  async register(data: { username: string; password: string; email: string }): Promise<{ userId: string }> {
    await delay()
    
    if (mockUsers.some(u => u.username === data.username)) {
      throw { code: 400, message: '用户名已存在' }
    }
    if (mockUsers.some(u => u.email === data.email)) {
      throw { code: 400, message: '邮箱已被注册' }
    }

    const userId = Date.now().toString()
    mockUsers.push({
      id: userId,
      username: data.username,
      nickname: data.username,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`,
      email: data.email,
      phone: '',
      gender: 'unknown',
      roles: ['user'],
      permissions: ['read'],
      points: 100,
      level: 1,
      status: 'active',
      createdAt: new Date().toISOString(),
      roleNames: ['普通用户'],
      loginCount: 0,
    })

    return { userId }
  },

  // 发送验证码
  async sendVerifyCode(email: string): Promise<void> {
    await delay()
    console.log(`验证码已发送到 ${email}: 123456`)
  },

  // 验证验证码
  async verifyCode(code: string): Promise<boolean> {
    await delay()
    return code === '123456'
  },

  // 获取图形验证码
  async getCaptcha(): Promise<{ captchaId: string; captchaImage: string }> {
    await delay()
    // 使用 SVG 生成简单验证码
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    const code = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    
    // 存储验证码（实际应该在后端存储）
    localStorage.setItem('mock_captcha', code.toLowerCase())
    
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <text x="50%" y="50%" font-size="24" font-family="Arial" font-weight="bold" fill="#333" text-anchor="middle" dominant-baseline="middle" transform="rotate(${Math.random() * 10 - 5}, 60, 20)">${code}</text>
      ${Array.from({ length: 5 }, () => `<line x1="${Math.random() * 120}" y1="${Math.random() * 40}" x2="${Math.random() * 120}" y2="${Math.random() * 40}" stroke="#ccc" stroke-width="1"/>`).join('')}
    </svg>`

    return {
      captchaId: 'captcha_' + Date.now(),
      captchaImage: 'data:image/svg+xml;base64,' + btoa(svg),
    }
  },

  // 验证图形验证码
  async verifyCaptcha(code: string): Promise<boolean> {
    await delay()
    const storedCode = localStorage.getItem('mock_captcha')
    return code.toLowerCase() === storedCode
  },

  // 获取用户列表
  async getUserList(params: { pageNum: number; pageSize: number; keyword?: string }) {
    await delay()
    let list = [...mockUsers]
    
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase()
      list = list.filter(u => 
        u.username.toLowerCase().includes(keyword) ||
        u.nickname.toLowerCase().includes(keyword) ||
        u.email.toLowerCase().includes(keyword)
      )
    }

    const start = (params.pageNum - 1) * params.pageSize
    const end = start + params.pageSize

    return {
      list: list.slice(start, end),
      total: list.length,
      pageNum: params.pageNum,
      pageSize: params.pageSize,
      pages: Math.ceil(list.length / params.pageSize),
    }
  },

  // 获取视频列表
  async getVideoList(params: { pageNum: number; pageSize: number; keyword?: string; categoryId?: string }) {
    await delay()
    let list = [...mockVideos]
    
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase()
      list = list.filter(v => 
        v.title.toLowerCase().includes(keyword) ||
        v.description.toLowerCase().includes(keyword)
      )
    }
    if (params.categoryId) {
      list = list.filter(v => v.categoryId === params.categoryId)
    }

    const start = (params.pageNum - 1) * params.pageSize
    const end = start + params.pageSize

    return {
      list: list.slice(start, end),
      total: list.length,
      pageNum: params.pageNum,
      pageSize: params.pageSize,
      pages: Math.ceil(list.length / params.pageSize),
    }
  },

  // 获取博客列表
  async getBlogList(params: { pageNum: number; pageSize: number; keyword?: string; categoryId?: string }) {
    await delay()
    let list = [...mockBlogs]
    
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase()
      list = list.filter(b => 
        b.title.toLowerCase().includes(keyword) ||
        b.summary.toLowerCase().includes(keyword)
      )
    }
    if (params.categoryId) {
      list = list.filter(b => b.categoryId === params.categoryId)
    }

    const start = (params.pageNum - 1) * params.pageSize
    const end = start + params.pageSize

    return {
      list: list.slice(start, end),
      total: list.length,
      pageNum: params.pageNum,
      pageSize: params.pageSize,
      pages: Math.ceil(list.length / params.pageSize),
    }
  },

  // 获取视频详情
  async getVideoDetail(id: string): Promise<Video | null> {
    await delay()
    return mockVideos.find(v => v.id === id) || null
  },

  // 获取博客详情
  async getBlogDetail(id: string): Promise<Blog | null> {
    await delay()
    return mockBlogs.find(b => b.id === id) || null
  },

  // 获取推荐视频
  async getRecommendVideos(limit: number = 6): Promise<Video[]> {
    await delay()
    return mockVideos.slice(0, limit)
  },

  // 获取热门博客
  async getHotBlogs(limit: number = 6): Promise<Blog[]> {
    await delay()
    return [...mockBlogs].sort((a, b) => b.readCount - a.readCount).slice(0, limit)
  },

  // 获取系统监控数据
  async getSystemInfo() {
    await delay()
    return {
      cpu: { usage: 35 + Math.random() * 30, cores: 8 },
      memory: { total: 16 * 1024 * 1024 * 1024, used: 8 * 1024 * 1024 * 1024 + Math.random() * 4 * 1024 * 1024 * 1024, free: 4 * 1024 * 1024 * 1024 },
      disk: { total: 500 * 1024 * 1024 * 1024, used: 250 * 1024 * 1024 * 1024, free: 250 * 1024 * 1024 * 1024 },
      os: { name: 'Linux', version: 'Ubuntu 22.04', uptime: 86400 * 30 },
    }
  },

  // 获取在线用户
  async getOnlineUsers() {
    await delay()
    return mockUsers.slice(0, 3).map(u => ({
      id: u.id,
      username: u.username,
      ip: '192.168.1.' + Math.floor(Math.random() * 255),
      loginTime: new Date().toISOString(),
    }))
  },
}

export default mockService
