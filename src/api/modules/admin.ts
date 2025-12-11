/**
 * 后台管理相关 API
 */

import { createApi } from '@/api/factory'
import type { UserListItem, UserQueryParams, PageResult } from '@/types/user'

// 创建管理API模块
const adminApiInstance = createApi('admin')

export const adminApi = {
  // ========== 用户管理 ==========
  // 获取用户列表
  getUserList(params: UserQueryParams) {
    return adminApiInstance.get<PageResult<UserListItem>>('/users', params)
  },

  // 获取用户详情
  getUserDetail(id: string) {
    return adminApiInstance.get<UserListItem>(`/users/${id}`)
  },

  // 创建用户
  createUser(data: Partial<UserListItem> & { password: string }) {
    return adminApiInstance.post<{ id: string }>('/users', data)
  },

  // 更新用户
  updateUser(id: string, data: Partial<UserListItem>) {
    return adminApiInstance.put<void>(`/users/${id}`, data)
  },

  // 删除用户
  deleteUser(id: string) {
    return adminApiInstance.delete<void>(`/users/${id}`)
  },

  // 批量删除用户
  batchDeleteUsers(ids: string[]) {
    return adminApiInstance.post<void>('/users/batch-delete', { ids })
  },

  // 重置用户密码
  resetUserPassword(id: string) {
    return adminApiInstance.post<{ password: string }>(`/users/${id}/reset-password`)
  },

  // 修改用户状态
  changeUserStatus(id: string, status: 'active' | 'disabled' | 'locked') {
    return adminApiInstance.put<void>(`/users/${id}/status`, { status })
  },

  // ========== 角色管理 ==========
  // 获取角色列表
  getRoleList() {
    return adminApiInstance.get<{ id: string; name: string; code: string; description: string }[]>('/roles')
  },

  // ========== 字典管理 ==========
  // 获取字典类型列表
  getDictTypeList() {
    return adminApiInstance.get<{ id: string; name: string; code: string; status: string }[]>('/dict/types')
  },

  // 获取字典项列表
  getDictItemList(typeCode: string) {
    return adminApiInstance.get<{ id: string; label: string; value: string; sort: number }[]>('/dict/items', { typeCode })
  },

  // 创建字典项
  createDictItem(data: { typeCode: string; label: string; value: string; sort?: number }) {
    return adminApiInstance.post<{ id: string }>('/dict/items', data)
  },

  // 更新字典项
  updateDictItem(id: string, data: { label: string; value: string; sort?: number }) {
    return adminApiInstance.put<void>(`/dict/items/${id}`, data)
  },

  // 删除字典项
  deleteDictItem(id: string) {
    return adminApiInstance.delete<void>(`/dict/items/${id}`)
  },

  // ========== 积分管理 ==========
  // 获取积分规则列表
  getPointsRules() {
    return adminApiInstance.get<{ id: string; name: string; type: string; points: number; description: string }[]>('/points/rules')
  },

  // 获取积分流水
  getPointsRecords(params: { userId?: string; type?: string; pageNum: number; pageSize: number }) {
    return adminApiInstance.get<PageResult<{ id: string; userId: string; type: string; points: number; description: string; createdAt: string }>>('/points/records', params)
  },

  // ========== 系统监控 ==========
  // 获取系统信息
  getSystemInfo() {
    return adminApiInstance.get<{
      cpu: { usage: number; cores: number }
      memory: { total: number; used: number; free: number }
      disk: { total: number; used: number; free: number }
      os: { name: string; version: string; uptime: number }
    }>('/monitor/system')
  },

  // 获取在线用户
  getOnlineUsers() {
    return adminApiInstance.get<{ id: string; username: string; ip: string; loginTime: string }[]>('/monitor/online-users')
  },

  // 获取操作日志
  getOperationLogs(params: { userId?: string; module?: string; pageNum: number; pageSize: number }) {
    return adminApiInstance.get<PageResult<{ id: string; userId: string; username: string; module: string; action: string; ip: string; createdAt: string }>>('/logs/operation', params)
  },

  // 获取登录日志
  getLoginLogs(params: { userId?: string; status?: string; pageNum: number; pageSize: number }) {
    return adminApiInstance.get<PageResult<{ id: string; userId: string; username: string; ip: string; location: string; browser: string; os: string; status: string; message: string; createdAt: string }>>('/logs/login', params)
  },

  // ========== 角色管理完善 ==========
  // 获取角色详情
  getRoleDetail(id: string) {
    return adminApiInstance.get<Role>(`/roles/${id}`)
  },

  // 创建角色
  createRole(data: { name: string; code: string; description?: string; permissions?: string[] }) {
    return adminApiInstance.post<{ id: string }>('/roles', data)
  },

  // 更新角色
  updateRole(id: string, data: { name?: string; description?: string; permissions?: string[] }) {
    return adminApiInstance.put<void>(`/roles/${id}`, data)
  },

  // 删除角色
  deleteRole(id: string) {
    return adminApiInstance.delete<void>(`/roles/${id}`)
  },

  // 获取权限列表
  getPermissions() {
    return adminApiInstance.get<Permission[]>('/permissions')
  },

  // ========== 部门管理 ==========
  // 获取部门树
  getDepartmentTree() {
    return adminApiInstance.get<Department[]>('/departments/tree')
  },

  // 获取部门列表
  getDepartmentList(params?: { keyword?: string }) {
    return adminApiInstance.get<Department[]>('/departments', params as Record<string, unknown>)
  },

  // 获取部门详情
  getDepartmentDetail(id: string) {
    return adminApiInstance.get<Department>(`/departments/${id}`)
  },

  // 创建部门
  createDepartment(data: { name: string; parentId?: string; leaderId?: string; sort?: number }) {
    return adminApiInstance.post<{ id: string }>('/departments', data)
  },

  // 更新部门
  updateDepartment(id: string, data: { name?: string; leaderId?: string; sort?: number }) {
    return adminApiInstance.put<void>(`/departments/${id}`, data)
  },

  // 删除部门
  deleteDepartment(id: string) {
    return adminApiInstance.delete<void>(`/departments/${id}`)
  },

  // ========== 用户行为分析 ==========
  // 获取用户行为统计
  getBehaviorStats(params?: { startTime?: string; endTime?: string }) {
    return adminApiInstance.get<BehaviorStats>('/behavior/stats', params as Record<string, unknown>)
  },

  // 获取用户行为列表
  getBehaviorList(params: { userId?: string; type?: string; pageNum: number; pageSize: number }) {
    return adminApiInstance.get<PageResult<BehaviorRecord>>('/behavior/list', params)
  },

  // 获取用户活跃趋势
  getActivityTrends(params: { type: 'day' | 'week' | 'month'; startTime: string; endTime: string }) {
    return adminApiInstance.get<ActivityTrendData[]>('/behavior/trends', params as Record<string, unknown>)
  },

  // ========== 积分管理完善 ==========
  // 创建积分规则
  createPointsRule(data: { name: string; type: string; points: number; description?: string; enabled?: boolean }) {
    return adminApiInstance.post<{ id: string }>('/points/rules', data)
  },

  // 更新积分规则
  updatePointsRule(id: string, data: { name?: string; points?: number; description?: string; enabled?: boolean }) {
    return adminApiInstance.put<void>(`/points/rules/${id}`, data)
  },

  // 删除积分规则
  deletePointsRule(id: string) {
    return adminApiInstance.delete<void>(`/points/rules/${id}`)
  },

  // 获取积分排行榜
  getPointsRanking(params?: { limit?: number; type?: 'total' | 'month' | 'week' }) {
    return adminApiInstance.get<PointsRankItem[]>('/points/ranking', params as Record<string, unknown>)
  },

  // 手动调整用户积分
  adjustUserPoints(userId: string, data: { points: number; reason: string }) {
    return adminApiInstance.post<void>('/points/adjust', { userId, ...data })
  },

  // ========== 积分商城 ==========
  // 获取商品列表
  getMallProducts(params?: { status?: string; categoryId?: string; pageNum: number; pageSize: number }) {
    return adminApiInstance.get<PageResult<MallProduct>>('/points/mall/products', params)
  },

  // 创建商品
  createMallProduct(data: Partial<MallProduct>) {
    return adminApiInstance.post<{ id: string }>('/points/mall/products', data)
  },

  // 更新商品
  updateMallProduct(id: string, data: Partial<MallProduct>) {
    return adminApiInstance.put<void>(`/points/mall/products/${id}`, data)
  },

  // 删除商品
  deleteMallProduct(id: string) {
    return adminApiInstance.delete<void>(`/points/mall/products/${id}`)
  },

  // 获取兑换订单
  getMallOrders(params: { status?: string; userId?: string; pageNum: number; pageSize: number }) {
    return adminApiInstance.get<PageResult<MallOrder>>('/points/mall/orders', params)
  },

  // 处理兑换订单
  processMallOrder(id: string, data: { action: 'approve' | 'reject' | 'ship' | 'complete'; remark?: string }) {
    return adminApiInstance.post<void>(`/points/mall/orders/${id}/process`, data)
  },

  // ========== 字典管理完善 ==========
  // 创建字典类型
  createDictType(data: { name: string; code: string; status?: string }) {
    return adminApiInstance.post<{ id: string }>('/dict/types', data)
  },

  // 更新字典类型
  updateDictType(id: string, data: { name?: string; status?: string }) {
    return adminApiInstance.put<void>(`/dict/types/${id}`, data)
  },

  // 删除字典类型
  deleteDictType(id: string) {
    return adminApiInstance.delete<void>(`/dict/types/${id}`)
  },

  // ========== 系统监控完善 ==========
  // 获取应用监控信息
  getAppMonitor() {
    return adminApiInstance.get<AppMonitorInfo>('/monitor/app')
  },

  // 获取JVM信息
  getJvmInfo() {
    return adminApiInstance.get<JvmInfo>('/monitor/jvm')
  },

  // 获取缓存统计
  getCacheStats() {
    return adminApiInstance.get<CacheStats>('/monitor/cache')
  },

  // 清除缓存
  clearCache(type?: string) {
    return adminApiInstance.post<void>('/monitor/cache/clear', { type })
  },

  // 强制下线用户
  forceLogout(userId: string) {
    return adminApiInstance.post<void>('/monitor/force-logout', { userId })
  },

  // ========== 审计追踪 ==========
  // 获取审计日志
  getAuditLogs(params: { module?: string; action?: string; userId?: string; startTime?: string; endTime?: string; pageNum: number; pageSize: number }) {
    return adminApiInstance.get<PageResult<AuditLog>>('/audit/logs', params)
  },

  // 获取审计统计
  getAuditStats(params?: { startTime?: string; endTime?: string }) {
    return adminApiInstance.get<AuditStats>('/audit/stats', params as Record<string, unknown>)
  },

  // ========== 控制台统计 ==========
  // 获取控制台统计数据
  getDashboardStats() {
    return adminApiInstance.get<DashboardStats>('/dashboard/stats')
  },

  // 获取快捷统计
  getQuickStats() {
    return adminApiInstance.get<QuickStats>('/dashboard/quick-stats')
  },

  // 获取趋势图表数据
  getDashboardTrends(params: { type: 'day' | 'week' | 'month' }) {
    return adminApiInstance.get<DashboardTrendData[]>('/dashboard/trends', params as Record<string, unknown>)
  },
}

// ========== 类型定义 ==========

// 角色类型
export interface Role {
  id: string
  name: string
  code: string
  description?: string
  permissions: string[]
  userCount: number
  status: string
  createdAt: string
}

// 权限类型
export interface Permission {
  id: string
  name: string
  code: string
  type: 'menu' | 'button' | 'api'
  parentId?: string
  children?: Permission[]
}

// 部门类型
export interface Department {
  id: string
  name: string
  parentId?: string
  leaderId?: string
  leaderName?: string
  sort: number
  userCount: number
  children?: Department[]
  createdAt: string
}

// 用户行为统计
export interface BehaviorStats {
  totalUsers: number
  activeUsers: number
  newUsers: number
  totalPageViews: number
  avgSessionDuration: number
  bounceRate: number
}

// 用户行为记录
export interface BehaviorRecord {
  id: string
  userId: string
  username: string
  type: string
  typeName: string
  targetId?: string
  targetTitle?: string
  ip: string
  device: string
  createdAt: string
}

// 活跃趋势数据
export interface ActivityTrendData {
  date: string
  activeUsers: number
  newUsers: number
  pageViews: number
}

// 积分排行项
export interface PointsRankItem {
  rank: number
  userId: string
  username: string
  nickname: string
  avatar: string
  points: number
}

// 商城商品
export interface MallProduct {
  id: string
  name: string
  description: string
  cover: string
  points: number
  stock: number
  exchangeCount: number
  categoryId?: string
  status: 'on' | 'off'
  createdAt: string
}

// 商城订单
export interface MallOrder {
  id: string
  userId: string
  username: string
  productId: string
  productName: string
  points: number
  status: 'pending' | 'approved' | 'shipped' | 'completed' | 'rejected'
  remark?: string
  createdAt: string
}

// 应用监控信息
export interface AppMonitorInfo {
  uptime: number
  requestCount: number
  errorCount: number
  avgResponseTime: number
  activeConnections: number
}

// JVM信息
export interface JvmInfo {
  heapUsed: number
  heapMax: number
  nonHeapUsed: number
  threadCount: number
  gcCount: number
  gcTime: number
}

// 缓存统计
export interface CacheStats {
  hitCount: number
  missCount: number
  hitRate: number
  size: number
  keys: string[]
}

// 审计日志
export interface AuditLog {
  id: string
  userId: string
  username: string
  module: string
  action: string
  target?: string
  before?: string
  after?: string
  ip: string
  createdAt: string
}

// 审计统计
export interface AuditStats {
  totalOperations: number
  todayOperations: number
  topModules: { module: string; count: number }[]
  topActions: { action: string; count: number }[]
}

// 控制台统计
export interface DashboardStats {
  userCount: number
  videoCount: number
  blogCount: number
  todayViews: number
  weeklyGrowth: {
    users: number
    videos: number
    blogs: number
  }
}

// 快捷统计
export interface QuickStats {
  pendingAudits: number
  todayNewUsers: number
  onlineUsers: number
  systemAlerts: number
}

// 控制台趋势数据
export interface DashboardTrendData {
  date: string
  users: number
  videos: number
  blogs: number
  views: number
}

export default adminApi
