/**
 * API 接口统一导出
 */

// 导出配置和工厂
export * from './config'
export * from './factory'

// 导出API模块
export * from './modules/admin'
export * from './modules/blog'
export * from './modules/search'
export * from './modules/siteStats'
export * from './modules/user'
export * from './modules/video'

// 导出类型
export type * from './modules/admin'
export type * from './modules/blog'
export type * from './modules/search'
export type * from './modules/siteStats'
export type * from './modules/user'
export type * from './modules/video'

// 统一导出API对象
export const api = {
  admin: () => import('./modules/admin').then(m => m.adminApi),
  blog: () => import('./modules/blog').then(m => m.blogApi),
  search: () => import('./modules/search').then(m => m.searchApi),
  siteStats: () => import('./modules/siteStats').then(m => m.siteStatsApi),
  user: () => import('./modules/user').then(m => m.userApi),
  video: () => import('./modules/video').then(m => m.videoApi),
}
