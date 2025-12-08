/**
 * 视频相关 API
 */

import request from '@/utils/request'
import type { Video, VideoQueryParams, PageResult } from '@/types/video'

const PREFIX = '/video'

export const videoApi = {
  // 获取视频列表
  getList(params: VideoQueryParams) {
    return request.get<PageResult<Video>>(`${PREFIX}/list`, params)
  },

  // 获取视频详情
  getDetail(id: string) {
    return request.get<Video>(`${PREFIX}/${id}`)
  },

  // 创建视频
  create(data: Partial<Video>) {
    return request.post<{ id: string }>(`${PREFIX}`, data)
  },

  // 更新视频
  update(id: string, data: Partial<Video>) {
    return request.put<void>(`${PREFIX}/${id}`, data)
  },

  // 删除视频
  delete(id: string) {
    return request.delete<void>(`${PREFIX}/${id}`)
  },

  // 批量删除
  batchDelete(ids: string[]) {
    return request.post<void>(`${PREFIX}/batch-delete`, { ids })
  },

  // 上传视频
  upload(file: File, onProgress?: (percent: number) => void) {
    return request.upload<{ url: string; videoId: string }>(`${PREFIX}/upload`, file)
  },

  // 获取分类列表
  getCategories() {
    return request.get<{ id: string; name: string; children?: unknown[] }[]>(`${PREFIX}/categories`)
  },

  // 点赞
  like(id: string) {
    return request.post<void>(`${PREFIX}/${id}/like`)
  },

  // 收藏
  collect(id: string) {
    return request.post<void>(`${PREFIX}/${id}/collect`)
  },

  // 获取推荐视频
  getRecommend(limit?: number) {
    return request.get<Video[]>(`${PREFIX}/recommend`, { limit: limit || 10 })
  },

  // 获取热门视频
  getHot(limit?: number) {
    return request.get<Video[]>(`${PREFIX}/hot`, { limit: limit || 10 })
  },

  // 增加播放量
  addPlayCount(id: string) {
    return request.post<void>(`${PREFIX}/${id}/play`)
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
  getComments(videoId: string, params: { pageNum: number; pageSize: number }) {
    return request.get<PageResult<VideoComment>>(`${PREFIX}/${videoId}/comments`, params)
  },

  // 发表评论
  addComment(videoId: string, data: { content: string; parentId?: string }) {
    return request.post<{ id: string }>(`${PREFIX}/${videoId}/comments`, data)
  },

  // 删除评论
  deleteComment(videoId: string, commentId: string) {
    return request.delete<void>(`${PREFIX}/${videoId}/comments/${commentId}`)
  },

  // 评论点赞
  likeComment(videoId: string, commentId: string) {
    return request.post<void>(`${PREFIX}/${videoId}/comments/${commentId}/like`)
  },

  // ========== 分类管理 ==========
  // 创建分类
  createCategory(data: { name: string; parentId?: string; icon?: string; sort?: number }) {
    return request.post<{ id: string }>(`${PREFIX}/categories`, data)
  },

  // 更新分类
  updateCategory(id: string, data: { name?: string; icon?: string; sort?: number }) {
    return request.put<void>(`${PREFIX}/categories/${id}`, data)
  },

  // 删除分类
  deleteCategory(id: string) {
    return request.delete<void>(`${PREFIX}/categories/${id}`)
  },

  // ========== 审核相关 ==========
  // 获取待审核视频列表
  getPendingList(params: VideoQueryParams) {
    return request.get<PageResult<Video>>(`${PREFIX}/audit/pending`, params)
  },

  // 审核通过
  approve(id: string, data?: { comment?: string }) {
    return request.post<void>(`${PREFIX}/audit/${id}/approve`, data)
  },

  // 审核拒绝
  reject(id: string, data: { reason: string }) {
    return request.post<void>(`${PREFIX}/audit/${id}/reject`, data)
  },

  // 获取审核历史
  getAuditHistory(id: string) {
    return request.get<AuditRecord[]>(`${PREFIX}/${id}/audit-history`)
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
