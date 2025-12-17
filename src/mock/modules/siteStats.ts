/**
 * 网站统计相关模拟数据
 */

import type { SiteStatsResponse } from '@/types/siteStats'

// 模拟统计数据
export const mockStatsData: SiteStatsResponse = {
  visitors: 1250,
  pageviews: 3628,
  todayVisitors: 89,
  todayPageviews: 234,
  updatedAt: new Date().toISOString()
}

// 获取网站统计数据
export const getMockSiteStats = async (): Promise<{ code: number; message: string; data: SiteStatsResponse }> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300))
  
  return {
    code: 200,
    message: '获取统计数据成功',
    data: mockStatsData
  }
}

// 记录页面访问
export const recordMockVisit = async (path: string): Promise<{ code: number; message: string; data: { success: boolean } }> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 200))
  
  // 模拟增加访问次数
  mockStatsData.pageviews += 1
  mockStatsData.todayPageviews += 1
  mockStatsData.updatedAt = new Date().toISOString()
  
  return {
    code: 200,
    message: '记录访问成功',
    data: { success: true }
  }
}

