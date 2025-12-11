/**
 * API 配置文件
 * 集中管理API地址和配置，方便统一修改
 */

// API基础地址
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// API超时时间（毫秒）
export const API_TIMEOUT = 15000

// API模块前缀配置
export const API_MODULES = {
  USER: '/user',
  VIDEO: '/video', 
  BLOG: '/blog',
  ADMIN: '/admin',
  SEARCH: '/search'
}

// 请求头配置
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json'
}

// 业务错误码
export const ERROR_CODES = {
  SUCCESS: 0,
  TOKEN_EXPIRED: 10001,
  TOKEN_INVALID: 10002,
  PERMISSION_DENIED: 10003,
  PARAM_ERROR: 400,
  NOT_FOUND: 404,
  SERVER_ERROR: 500
}

// 错误消息映射
export const ERROR_MESSAGES: Record<number, string> = {
  400: '请求参数错误',
  401: '未授权，请重新登录',
  403: '拒绝访问',
  404: '请求资源不存在',
  405: '请求方法不允许',
  408: '请求超时',
  500: '服务器内部错误',
  501: '服务未实现',
  502: '网关错误',
  503: '服务不可用',
  504: '网关超时'
}

/**
 * 构建完整的API地址
 * @param moduleName 模块名称
 * @param path 接口路径
 * @returns 完整的API地址
 */
export function buildApiUrl(moduleName: string, path: string = ''): string {
  const modulePrefix = API_MODULES[moduleName as keyof typeof API_MODULES] || ''
  // 确保路径格式正确，避免重复的斜杠
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${modulePrefix}${cleanPath}`
}

export default {
  API_BASE_URL,
  API_TIMEOUT,
  API_MODULES,
  DEFAULT_HEADERS,
  ERROR_CODES,
  ERROR_MESSAGES,
  buildApiUrl
}