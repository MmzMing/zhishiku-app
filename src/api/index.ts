/**
 * API 统一导出
 */

export { userApi } from './modules/user'
export { videoApi } from './modules/video'
export { blogApi } from './modules/blog'
export { adminApi } from './modules/admin'
export { searchApi } from './modules/search'

// 导出类型
export type { FavoriteItem, HistoryItem, PointsRecord } from './modules/user'
export type { VideoComment, AuditRecord } from './modules/video'
export type { BlogAnalytics, TrendData } from './modules/blog'
export type {
  Role,
  Permission,
  Department,
  BehaviorStats,
  BehaviorRecord,
  ActivityTrendData,
  PointsRankItem,
  MallProduct,
  MallOrder,
  AppMonitorInfo,
  JvmInfo,
  CacheStats,
  AuditLog,
  AuditStats,
  DashboardStats,
  QuickStats,
  DashboardTrendData,
} from './modules/admin'
export type {
  SearchParams,
  SearchResult,
  SearchPageResult,
  SearchUserItem,
} from './modules/search'
