/**
 * 用户相关 API
 */

import request from '@/utils/request'
import type { LoginParams, RegisterParams, UserInfo, LoginResult } from '@/types/user'

const PREFIX = '/user'

export const userApi = {
  // 登录
  login(data: LoginParams) {
    return request.post<LoginResult>(`${PREFIX}/login`, data)
  },

  // 注册
  register(data: RegisterParams) {
    return request.post<{ userId: string }>(`${PREFIX}/register`, data)
  },

  // 获取用户信息
  getUserInfo() {
    return request.get<UserInfo>(`${PREFIX}/info`)
  },

  // 修改用户信息
  updateUserInfo(data: Partial<UserInfo>) {
    return request.put<void>(`${PREFIX}/info`, data)
  },

  // 修改密码
  changePassword(data: { oldPassword: string; newPassword: string }) {
    return request.put<void>(`${PREFIX}/password`, data)
  },

  // 发送验证码
  sendVerifyCode(data: { email?: string; phone?: string; type: 'register' | 'reset' | 'bind' }) {
    return request.post<void>(`${PREFIX}/verify-code`, data)
  },

  // 验证验证码
  verifyCode(data: { email?: string; phone?: string; code: string }) {
    return request.post<{ verified: boolean }>(`${PREFIX}/verify`, data)
  },

  // 重置密码
  resetPassword(data: { email: string; code: string; newPassword: string }) {
    return request.post<void>(`${PREFIX}/reset-password`, data)
  },

  // 登出
  logout() {
    return request.post<void>(`${PREFIX}/logout`)
  },

  // 刷新Token
  refreshToken() {
    return request.post<{ token: string }>(`${PREFIX}/refresh-token`)
  },

  // 获取图形验证码
  getCaptcha() {
    return request.get<{ captchaId: string; captchaImage: string }>(`${PREFIX}/captcha`)
  },

  // 验证图形验证码
  verifyCaptcha(data: { captchaId: string; captchaCode: string }) {
    return request.post<{ verified: boolean }>(`${PREFIX}/captcha/verify`, data)
  },

  // ========== 收藏相关 ==========
  // 获取收藏列表
  getFavorites(params: { type?: 'video' | 'blog'; pageNum: number; pageSize: number }) {
    return request.get<PageResult<FavoriteItem>>(`${PREFIX}/favorites`, params)
  },

  // 取消收藏
  removeFavorite(id: string, type: 'video' | 'blog') {
    return request.delete<void>(`${PREFIX}/favorites/${id}`, { type })
  },

  // 批量取消收藏
  batchRemoveFavorites(ids: string[], type: 'video' | 'blog') {
    return request.post<void>(`${PREFIX}/favorites/batch-remove`, { ids, type })
  },

  // ========== 历史记录 ==========
  // 获取观看/阅读历史
  getHistory(params: { type?: 'video' | 'blog'; pageNum: number; pageSize: number }) {
    return request.get<PageResult<HistoryItem>>(`${PREFIX}/history`, params)
  },

  // 删除历史记录
  removeHistory(id: string) {
    return request.delete<void>(`${PREFIX}/history/${id}`)
  },

  // 清空历史记录
  clearHistory(type?: 'video' | 'blog') {
    return request.delete<void>(`${PREFIX}/history/clear`, { type })
  },

  // ========== 积分相关 ==========
  // 获取我的积分信息
  getMyPoints() {
    return request.get<{ total: number; available: number; frozen: number; level: number; levelName: string }>(`${PREFIX}/points`)
  },

  // 获取积分明细
  getPointsDetails(params: { type?: string; pageNum: number; pageSize: number }) {
    return request.get<PageResult<PointsRecord>>(`${PREFIX}/points/records`, params)
  },

  // 签到
  checkIn() {
    return request.post<{ points: number; continuousDays: number }>(`${PREFIX}/points/check-in`)
  },

  // 获取签到状态
  getCheckInStatus() {
    return request.get<{ checkedToday: boolean; continuousDays: number; monthlyCheckIns: number[] }>(`${PREFIX}/points/check-in/status`)
  },

  // ========== 账号设置 ==========
  // 绑定邮箱
  bindEmail(data: { email: string; code: string }) {
    return request.post<void>(`${PREFIX}/bindEmail`, data)
  },

  // 绑定手机
  bindPhone(data: { phone: string; code: string }) {
    return request.post<void>(`${PREFIX}/bind-phone`, data)
  },

  // 上传头像
  uploadAvatar(file: File) {
    return request.upload<{ url: string }>(`${PREFIX}/avatar`, file)
  },

  // 注销账号
  deleteAccount(data: { password: string; reason?: string }) {
    return request.post<void>(`${PREFIX}/delete-account`, data)
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

// 导入分页类型
import type { PageResult } from '@/types/user'

export default userApi
