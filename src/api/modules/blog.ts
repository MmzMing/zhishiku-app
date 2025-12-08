/**
 * 博客相关 API
 */

import request from '@/utils/request'
import type { Blog, BlogQueryParams, PageResult } from '@/types/blog'

const PREFIX = '/blog'

export const blogApi = {
  // 获取博客列表
  getList(params: BlogQueryParams) {
    return request.get<PageResult<Blog>>(`${PREFIX}/list`, params)
  },

  // 获取博客详情
  getDetail(id: string) {
    return request.get<Blog>(`${PREFIX}/${id}`)
  },

  // 创建博客
  create(data: Partial<Blog>) {
    return request.post<{ id: string }>(`${PREFIX}`, data)
  },

  // 更新博客
  update(id: string, data: Partial<Blog>) {
    return request.put<void>(`${PREFIX}/${id}`, data)
  },

  // 删除博客
  delete(id: string) {
    return request.delete<void>(`${PREFIX}/${id}`)
  },

  // 批量删除
  batchDelete(ids: string[]) {
    return request.post<void>(`${PREFIX}/batch-delete`, { ids })
  },

  // 发布博客
  publish(id: string) {
    return request.post<void>(`${PREFIX}/${id}/publish`)
  },

  // 下线博客
  offline(id: string) {
    return request.post<void>(`${PREFIX}/${id}/offline`)
  },

  // 保存草稿
  saveDraft(data: Partial<Blog>) {
    return request.post<{ id: string }>(`${PREFIX}/draft`, data)
  },

  // 获取分类列表
  getCategories() {
    return request.get<{ id: string; name: string; children?: unknown[] }[]>(`${PREFIX}/categories`)
  },

  // 获取标签列表
  getTags() {
    return request.get<{ id: string; name: string; count: number }[]>(`${PREFIX}/tags`)
  },

  // 点赞
  like(id: string) {
    return request.post<void>(`${PREFIX}/${id}/like`)
  },

  // 收藏
  collect(id: string) {
    return request.post<void>(`${PREFIX}/${id}/collect`)
  },

  // 获取推荐博客
  getRecommend(limit?: number) {
    return request.get<Blog[]>(`${PREFIX}/recommend`, { limit: limit || 10 })
  },

  // 获取热门博客
  getHot(limit?: number) {
    return request.get<Blog[]>(`${PREFIX}/hot`, { limit: limit || 10 })
  },

  // 上传图片
  uploadImage(file: File) {
    return request.upload<{ url: string }>(`${PREFIX}/upload-image`, file)
  },

  // 取消点赞
  unlike(id: string) {
    return request.post<void>(`${PREFIX}/${id}/unlike`)
  },

  // 取消收藏
  uncollect(id: string) {
    return request.post<void>(`${PREFIX}/${id}/uncollect`)
  },

  // ========== 评论相关 ==========
  // 获取评论列表
  getComments(blogId: string, params: { pageNum: number; pageSize: number }) {
    return request.get<PageResult<BlogComment>>(`${PREFIX}/${blogId}/comments`, params)
  },

  // 发表评论
  addComment(blogId: string, data: { content: string; parentId?: string }) {
    return request.post<{ id: string }>(`${PREFIX}/${blogId}/comments`, data)
  },

  // 删除评论
  deleteComment(blogId: string, commentId: string) {
    return request.delete<void>(`${PREFIX}/${blogId}/comments/${commentId}`)
  },

  // 评论点赞
  likeComment(blogId: string, commentId: string) {
    return request.post<void>(`${PREFIX}/${blogId}/comments/${commentId}/like`)
  },

  // ========== 分类管理 ==========
  // 创建分类
  createCategory(data: { name: string; parentId?: string; icon?: string; description?: string; sort?: number }) {
    return request.post<{ id: string }>(`${PREFIX}/categories`, data)
  },

  // 更新分类
  updateCategory(id: string, data: { name?: string; icon?: string; description?: string; sort?: number }) {
    return request.put<void>(`${PREFIX}/categories/${id}`, data)
  },

  // 删除分类
  deleteCategory(id: string) {
    return request.delete<void>(`${PREFIX}/categories/${id}`)
  },

  // ========== 标签管理 ==========
  // 创建标签
  createTag(data: { name: string; color?: string }) {
    return request.post<{ id: string }>(`${PREFIX}/tags`, data)
  },

  // 更新标签
  updateTag(id: string, data: { name?: string; color?: string }) {
    return request.put<void>(`${PREFIX}/tags/${id}`, data)
  },

  // 删除标签
  deleteTag(id: string) {
    return request.delete<void>(`${PREFIX}/tags/${id}`)
  },

  // ========== 统计分析 ==========
  // 获取博客统计数据
  getAnalytics(params?: { startTime?: string; endTime?: string }) {
    return request.get<BlogAnalytics>(`${PREFIX}/analytics`, params as Record<string, unknown>)
  },

  // 获取趋势数据
  getTrends(params: { type: 'day' | 'week' | 'month'; startTime: string; endTime: string }) {
    return request.get<TrendData[]>(`${PREFIX}/analytics/trends`, params as Record<string, unknown>)
  },

  // 获取排行榜
  getRanking(params: { type: 'read' | 'like' | 'collect'; limit?: number }) {
    return request.get<Blog[]>(`${PREFIX}/ranking`, params as Record<string, unknown>)
  },
}

// 博客统计数据类型
export interface BlogAnalytics {
  totalBlogs: number
  totalReads: number
  totalLikes: number
  totalCollects: number
  totalComments: number
  todayBlogs: number
  todayReads: number
  weeklyGrowth: {
    blogs: number
    reads: number
  }
}

// 趋势数据类型
export interface TrendData {
  date: string
  blogs: number
  reads: number
  likes: number
}

// 导入评论类型
import type { BlogComment } from '@/types/blog'

export default blogApi
