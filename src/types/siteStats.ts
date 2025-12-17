/**
 * 网站统计相关类型定义
 */

/**
 * 网站统计数据响应
 */
export interface SiteStatsResponse {
  /**
   * 访问人数
   */
  visitors: number
  
  /**
   * 访问次数
   */
  pageviews: number
  
  /**
   * 今日访问人数
   */
  todayVisitors?: number
  
  /**
   * 今日访问次数
   */
  todayPageviews?: number
  
  /**
   * 数据更新时间
   */
  updatedAt?: string
}

/**
 * 访问记录请求参数
 */
export interface VisitRecordParams {
  /**
   * 页面路径
   */
  path: string
  
  /**
   * 页面标题
   */
  title?: string
  
  /**
   * 来源URL
   */
  referrer?: string
}
