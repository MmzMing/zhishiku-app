/**
 * 网站统计相关 API
 */

import { createApi } from '@/api/factory'
import { getMockSiteStats, recordMockVisit } from '@/mock/modules/siteStats'
import type { SiteStatsResponse } from '@/types/siteStats'

// 创建统计API模块
const siteStatsApiInstance = createApi('stats')

// 网站统计API
export const siteStatsApi = {
  /**
   * 获取网站统计数据
   * @returns 包含访问人数和访问次数的统计数据
   */
  async getSiteStats() {
    try {
      return await siteStatsApiInstance.get<SiteStatsResponse>('/site')
    } catch (error) {
      console.warn('统计API调用失败，使用模拟数据:', error)
      // 回退到模拟数据
      return await getMockSiteStats()
    }
  },

  /**
   * 记录页面访问
   * @param path 页面路径
   * @returns 操作结果
   */
  async recordVisit(path: string) {
    try {
      return await siteStatsApiInstance.post<{ success: boolean }>('/visit', { path })
    } catch (error) {
      console.warn('记录访问API调用失败，使用模拟数据:', error)
      // 回退到模拟数据
      return await recordMockVisit(path)
    }
  }
}

// 导出便捷方法
export const getSiteStats = siteStatsApi.getSiteStats
export const recordVisit = siteStatsApi.recordVisit

export default siteStatsApi
