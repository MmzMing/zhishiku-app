/**
 * 博客相关 API
 */

import { createApi } from '@/api/factory'
import type { Blog, BlogQueryParams, PageResult } from '@/types/blog'

// 创建博客API模块
const blogApiInstance = createApi('blog')

export const blogApi = {
  // 获取博客列表
  getList(params: BlogQueryParams) {
    return blogApiInstance.get<PageResult<Blog>>('/list', params)
  },

  // 获取博客详情
  getDetail(id: string) {
    return blogApiInstance.get<Blog>(`/${id}`)
  },

  // 创建博客
  create(data: Partial<Blog>) {
    return blogApiInstance.post<{ id: string }>('', data)
  },

  // 更新博客
  update(id: string, data: Partial<Blog>) {
    return blogApiInstance.put<void>(`/${id}`, data)
  },

  // 删除博客
  delete(id: string) {
    return blogApiInstance.delete<void>(`/${id}`)
  },

  // 批量删除
  batchDelete(ids: string[]) {
    return blogApiInstance.post<void>('/batch-delete', { ids })
  },

  // 发布博客
  publish(id: string) {
    return blogApiInstance.post<void>(`/${id}/publish`)
  },

  // 下线博客
  offline(id: string) {
    return blogApiInstance.post<void>(`/${id}/offline`)
  },

  // 保存草稿
  saveDraft(data: Partial<Blog>) {
    return blogApiInstance.post<{ id: string }>('/draft', data)
  },

  // 获取分类列表
  getCategories() {
    return blogApiInstance.get<{ id: string; name: string; children?: unknown[] }[]>('/categories')
  },

  // 获取标签列表
  getTags() {
    return blogApiInstance.get<{ id: string; name: string; count: number }[]>('/tags')
  },

  // 点赞
  like(id: string) {
    return blogApiInstance.post<void>(`/${id}/like`)
  },

  // 收藏
  collect(id: string) {
    return blogApiInstance.post<void>(`/${id}/collect`)
  },

  // 获取推荐博客
  getRecommend(limit?: number) {
    return blogApiInstance.get<Blog[]>('/recommend', { limit: limit || 10 })
  },

  // 获取热门博客
  getHot(limit?: number) {
    return blogApiInstance.get<Blog[]>('/hot', { limit: limit || 10 })
  },

  // 上传图片
  uploadImage(file: File) {
    return blogApiInstance.upload<{ url: string }>('/upload-image', file)
  },

  // 取消点赞
  unlike(id: string) {
    return blogApiInstance.post<void>(`/${id}/unlike`)
  },

  // 取消收藏
  uncollect(id: string) {
    return blogApiInstance.post<void>(`/${id}/uncollect`)
  },

  // ========== 评论相关 ==========
  // 获取评论列表
  getComments(blogId: string, params: { pageNum: number; pageSize: number }) {
    return blogApiInstance.get<PageResult<BlogComment>>(`/${blogId}/comments`, params)
  },

  // 发表评论
  addComment(blogId: string, data: { content: string; parentId?: string }) {
    return blogApiInstance.post<{ id: string }>(`/${blogId}/comments`, data)
  },

  // 删除评论
  deleteComment(blogId: string, commentId: string) {
    return blogApiInstance.delete<void>(`/${blogId}/comments/${commentId}`)
  },

  // 评论点赞
  likeComment(blogId: string, commentId: string) {
    return blogApiInstance.post<void>(`/${blogId}/comments/${commentId}/like`)
  },

  // ========== 分类管理 ==========
  // 创建分类
  createCategory(data: { name: string; parentId?: string; icon?: string; description?: string; sort?: number }) {
    return blogApiInstance.post<{ id: string }>('/categories', data)
  },

  // 更新分类
  updateCategory(id: string, data: { name?: string; icon?: string; description?: string; sort?: number }) {
    return blogApiInstance.put<void>(`/categories/${id}`, data)
  },

  // 删除分类
  deleteCategory(id: string) {
    return blogApiInstance.delete<void>(`/categories/${id}`)
  },

  // ========== 标签管理 ==========
  // 创建标签
  createTag(data: { name: string; color?: string }) {
    return blogApiInstance.post<{ id: string }>('/tags', data)
  },

  // 更新标签
  updateTag(id: string, data: { name?: string; color?: string }) {
    return blogApiInstance.put<void>(`/tags/${id}`, data)
  },

  // 删除标签
  deleteTag(id: string) {
    return blogApiInstance.delete<void>(`/tags/${id}`)
  },

  // ========== 统计分析 ==========
  // 获取博客统计数据
  getAnalytics(params?: { startTime?: string; endTime?: string }) {
    return blogApiInstance.get<BlogAnalytics>('/analytics', params as Record<string, unknown>)
  },

  // 获取趋势数据
  getTrends(params: { type: 'day' | 'week' | 'month'; startTime: string; endTime: string }) {
    return blogApiInstance.get<TrendData[]>('/analytics/trends', params as Record<string, unknown>)
  },

  // 获取排行榜
  getRanking(params: { type: 'read' | 'like' | 'collect'; limit?: number }) {
    return blogApiInstance.get<Blog[]>('/ranking', params as Record<string, unknown>)
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
