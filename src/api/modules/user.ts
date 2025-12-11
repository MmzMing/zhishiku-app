/**
 * 用户相关 API
 */

import { createApi } from '@/api/factory'
import type { LoginParams, RegisterParams, UserInfo, LoginResult, PageResult } from '@/types/user'

// 创建用户API模块
const userApiInstance = createApi('user')

export const userApi = {
  // 登录
  login(data: LoginParams) {
    return userApiInstance.post<LoginResult>('/login', data)
  },

  // 注册
  register(data: RegisterParams) {
    return userApiInstance.post<{ userId: string }>('/register', data)
  },

  // 获取用户信息
  getUserInfo() {
    return userApiInstance.get<UserInfo>('/info')
  },

  // 修改用户信息
  updateUserInfo(data: Partial<UserInfo>) {
    return userApiInstance.put<void>('/info', data)
  },

  // 修改密码
  changePassword(data: { oldPassword: string; newPassword: string }) {
    return userApiInstance.put<void>('/password', data)
  },

  // 发送验证码
  sendVerifyCode(data: { email?: string; phone?: string; type: 'register' | 'reset' | 'bind' }) {
    return userApiInstance.post<void>('/verify-code', data)
  },

  // 验证验证码
  verifyCode(data: { email?: string; phone?: string; code: string }) {
    return userApiInstance.post<{ verified: boolean }>('/verify', data)
  },

  // 重置密码
  resetPassword(data: { email: string; code: string; newPassword: string }) {
    return userApiInstance.post<void>('/reset-password', data)
  },

  // 登出
  logout() {
    return userApiInstance.post<void>('/logout')
  },

  // 刷新Token
  refreshToken() {
    return userApiInstance.post<{ token: string }>('/refresh-token')
  },

  // 获取图形验证码
  getCaptcha() {
    return userApiInstance.get<{ captchaId: string; captchaImage: string }>('/captcha')
  },

  // 验证图形验证码
  verifyCaptcha(data: { captchaId: string; captchaCode: string }) {
    return userApiInstance.post<{ verified: boolean }>('/captcha/verify', data)
  },

  // ========== 收藏相关 ==========
  // 获取收藏列表
  getFavorites(params: { type?: 'video' | 'blog'; pageNum: number; pageSize: number }) {
    return userApiInstance.get<PageResult<FavoriteItem>>('/favorites', params)
  },

  // 取消收藏
  removeFavorite(id: string, type: 'video' | 'blog') {
    return userApiInstance.delete<void>(`/favorites/${id}`, { type })
  },

  // 批量取消收藏
  batchRemoveFavorites(ids: string[], type: 'video' | 'blog') {
    return userApiInstance.post<void>('/favorites/batch-remove', { ids, type })
  },

  // ========== 历史记录 ==========
  // 获取观看/阅读历史
  getHistory(params: { type?: 'video' | 'blog'; pageNum: number; pageSize: number }) {
    return userApiInstance.get<PageResult<HistoryItem>>('/history', params)
  },

  // 删除历史记录
  removeHistory(id: string) {
    return userApiInstance.delete<void>(`/history/${id}`)
  },

  // 清空历史记录
  clearHistory(type?: 'video' | 'blog') {
    return userApiInstance.delete<void>('/history/clear', { type })
  },

  // ========== 积分相关 ==========
  // 获取我的积分信息
  getMyPoints() {
    return userApiInstance.get<{ total: number; available: number; frozen: number; level: number; levelName: string }>('/points')
  },

  // 获取积分明细
  getPointsDetails(params: { type?: string; pageNum: number; pageSize: number }) {
    return userApiInstance.get<PageResult<PointsRecord>>('/points/records', params)
  },

  // 签到
  checkIn() {
    return userApiInstance.post<{ points: number; continuousDays: number }>('/points/check-in')
  },

  // 获取签到状态
  getCheckInStatus() {
    return userApiInstance.get<{ checkedToday: boolean; continuousDays: number; monthlyCheckIns: number[] }>('/points/check-in/status')
  },

  // ========== 账号设置 ==========
  // 绑定邮箱
  bindEmail(data: { email: string; code: string }) {
    return userApiInstance.post<void>('/bindEmail', data)
  },

  // 绑定手机
  bindPhone(data: { phone: string; code: string }) {
    return userApiInstance.post<void>('/bind-phone', data)
  },

  // 上传头像
  uploadAvatar(file: File) {
    return userApiInstance.upload<{ url: string }>('/avatar', file)
  },

  // 注销账号
  deleteAccount(data: { password: string; reason?: string }) {
    return userApiInstance.post<void>('/delete-account', data)
  },
}

// 收藏项类型
export interface FavoriteItem {
  id: string
  targetId: string
  type: 'video' | 'blog'
  title: string
  cover?: string
  createdAt: string
}

// 历史记录类型
export interface HistoryItem {
  id: string
  targetId: string
  type: 'video' | 'blog'
  title: string
  cover?: string
  progress?: number
  duration?: number
  viewedAt: string
}

// 积分记录类型
export interface PointsRecord {
  id: string
  type: string
  typeName: string
  points: number
  balance: number
  description: string
  createdAt: string
}

export default userApi
