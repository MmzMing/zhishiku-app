/**
 * 用户相关类型定义
 */

// 登录参数
export interface LoginParams {
  username: string
  password: string
  captchaId?: string
  captchaCode?: string
  rememberMe?: boolean
}

// 注册参数
export interface RegisterParams {
  username: string
  password: string
  confirmPassword: string
  email: string
  verifyCode: string
  agreement: boolean
}

// 登录结果
export interface LoginResult {
  token: string
  refreshToken?: string
  expiresIn: number
  userInfo: UserInfo
}

// 用户信息
export interface UserInfo {
  id: string
  username: string
  nickname: string
  avatar: string
  email: string
  phone: string
  gender: 'male' | 'female' | 'unknown'
  birthday?: string
  signature?: string
  roles: string[]
  permissions: string[]
  points: number
  level: number
  status: 'active' | 'disabled' | 'locked'
  createdAt: string
  lastLoginAt?: string
}

// 用户列表项（后台管理用）
export interface UserListItem extends UserInfo {
  roleNames: string[]
  deptName?: string
  loginCount: number
}

// 用户查询参数
export interface UserQueryParams {
  keyword?: string
  status?: string
  roleId?: string
  deptId?: string
  startTime?: string
  endTime?: string
  pageNum: number
  pageSize: number
}

// 分页结果
export interface PageResult<T> {
  list: T[]
  total: number
  pageNum: number
  pageSize: number
  pages: number
}
