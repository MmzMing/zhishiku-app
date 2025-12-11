/**
 * 视频相关 API
 */

import { createApi } from '@/api/factory'
import type { Video, VideoQueryParams, PageResult } from '@/types/video'

// 创建视频API实例
const videoApiInstance = createApi('video')

export const videoApi = {
  // 获取视频列表
  getList(params: VideoQueryParams) {
    return videoApiInstance.get<PageResult<Video>>('/list', params)
  },

  // 获取视频详情
  getDetail(id: string) {
    return videoApiInstance.get<Video>(`/${id}`)
  },

  // 创建视频
  create(data: Partial<Video>) {
    return videoApiInstance.post<{ id: string }>('', data)
  },

  // 更新视频
  update(id: string, data: Partial<Video>) {
    return videoApiInstance.put<void>(`/${id}`, data)
  },

  // 删除视频
  delete(id: string) {
    return videoApiInstance.delete<void>(`/${id}`)
  },

  // 批量删除
  batchDelete(ids: string[]) {
    return videoApiInstance.post<void>('/batch-delete', { ids })
  },

  // 上传视频
  upload(file: File, onProgress?: (percent: number) => void) {
    return videoApiInstance.upload<{ url: string; videoId: string }>('/upload', file, onProgress)
  },

  // 获取分类列表
  getCategories() {
    return videoApiInstance.get<{ id: string; name: string; children?: unknown[] }[]>('/categories')
  },

  // 点赞
  like(id: string) {
    return videoApiInstance.post<void>(`/${id}/like`)
  },

  // 收藏
  collect(id: string) {
    return videoApiInstance.post<void>(`/${id}/collect`)
  },

  // 获取推荐视频
  getRecommend(limit?: number) {
    return videoApiInstance.get<Video[]>('/recommend', { limit: limit || 10 })
  },

  // 获取热门视频
  getHot(limit?: number) {
    return videoApiInstance.get<Video[]>('/hot', { limit: limit || 10 })
  },

  // 增加播放量
  addPlayCount(id: string) {
    return videoApiInstance.post<void>(`/${id}/play`)
  },

  // 取消点赞
  unlike(id: string) {
    return videoApiInstance.post<void>(`/${id}/unlike`)
  },

  // 取消收藏
  uncollect(id: string) {
    return videoApiInstance.post<void>(`/${id}/uncollect`)
  },

  // ========== 评论相关 ==========
  // 获取评论列表
  getComments(videoId: string, params: { pageNum: number; pageSize: number }) {
    return videoApiInstance.get<PageResult<VideoComment>>(`/${videoId}/comments`, params)
  },

  // 发表评论
  addComment(videoId: string, data: { content: string; parentId?: string }) {
    return videoApiInstance.post<{ id: string }>(`/${videoId}/comments`, data)
  },

  // 删除评论
  deleteComment(videoId: string, commentId: string) {
    return videoApiInstance.delete<void>(`/${videoId}/comments/${commentId}`)
  },

  // 评论点赞
  likeComment(videoId: string, commentId: string) {
    return videoApiInstance.post<void>(`/${videoId}/comments/${commentId}/like`)
  },

  // ========== 分类管理 ==========
  // 创建分类
  createCategory(data: { name: string; parentId?: string; icon?: string; sort?: number }) {
    return videoApiInstance.post<{ id: string }>('/categories', data)
  },

  // 更新分类
  updateCategory(id: string, data: { name?: string; icon?: string; sort?: number }) {
    return videoApiInstance.put<void>(`/categories/${id}`, data)
  },

  // 删除分类
  deleteCategory(id: string) {
    return videoApiInstance.delete<void>(`/categories/${id}`)
  },

  // ========== 审核相关 ==========
  // 获取待审核视频列表
  getPendingList(params: VideoQueryParams) {
    return videoApiInstance.get<PageResult<Video>>('/audit/pending', params)
  },

  // 审核通过
  approve(id: string, data?: { comment?: string }) {
    return videoApiInstance.post<void>(`/audit/${id}/approve`, data)
  },

  // 审核拒绝
  reject(id: string, data: { reason: string }) {
    return videoApiInstance.post<void>(`/audit/${id}/reject`, data)
  },

  // 获取审核历史
  getAuditHistory(id: string) {
    return videoApiInstance.get<AuditRecord[]>(`/${id}/audit-history`)
  },
}

// 视频评论类型
export interface VideoComment {
  id: string
  content: string
  author: {
    id: string
    nickname: string
    avatar: string
  }
  parentId?: string
  replyTo?: {
    id: string
    nickname: string
  }
  likeCount: number
  isLiked: boolean
  createdAt: string
  children?: VideoComment[]
}

// 审核记录类型
export interface AuditRecord {
  id: string
  action: 'approve' | 'reject'
  operator: {
    id: string
    nickname: string
  }
  reason?: string
  comment?: string
  createdAt: string
}

export default videoApi
