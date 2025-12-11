/**
 * 通用类型定义
 */

// 分页结果类型
export interface PaginationResult<T = any> {
  list: T[]
  total: number
  pageNum: number
  pageSize: number
  pages?: number
}

// API响应基础类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data?: T
  timestamp: number
}

// 通用ID类型
export type ID = string

// 通用状态类型
export type Status = 'active' | 'disabled' | 'locked'

// 通用搜索参数类型
export interface SearchParams {
  keyword?: string
  pageNum?: number
  pageSize?: number
}

// 通用选项类型（用于select组件）
export interface Option {
  label: string
  value: string | number
  disabled?: boolean
}
