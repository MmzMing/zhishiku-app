/**
 * 搜索相关 API
 */

import request from '@/utils/request'
import type { Video } from '@/types/video'
import type { Blog } from '@/types/blog'

const PREFIX = '/search'

export const searchApi = {
  // 综合搜索
  search(params: SearchParams) {
    return request.get<SearchResult>(`${PREFIX}`, params as unknown as Record<string, unknown>)
  },

  // 搜索视频
  searchVideos(params: SearchParams) {
    return request.get<SearchPageResult<Video>>(`${PREFIX}/videos`, params as unknown as Record<string, unknown>)
  },

  // 搜索博客
  searchBlogs(params: SearchParams) {
    return request.get<SearchPageResult<Blog>>(`${PREFIX}/blogs`, params as unknown as Record<string, unknown>)
  },

  // 搜索用户
  searchUsers(params: SearchParams) {
    return request.get<SearchPageResult<SearchUserItem>>(`${PREFIX}/users`, params as unknown as Record<string, unknown>)
  },

  // 获取热门搜索词
  getHotKeywords(limit?: number) {
    return request.get<string[]>(`${PREFIX}/hot-keywords`, { limit: limit || 10 })
  },

  // 获取搜索建议
  getSuggestions(keyword: string) {
    return request.get<string[]>(`${PREFIX}/suggestions`, { keyword })
  },

  // 获取搜索历史
  getHistory() {
    return request.get<string[]>(`${PREFIX}/history`)
  },

  // 清除搜索历史
  clearHistory() {
    return request.delete<void>(`${PREFIX}/history`)
  },

  // 删除单条搜索历史
  removeHistoryItem(keyword: string) {
    return request.delete<void>(`${PREFIX}/history/${encodeURIComponent(keyword)}`)
  },
}

// 搜索参数
export interface SearchParams {
  keyword: string
  type?: 'all' | 'video' | 'blog' | 'user'
  sortBy?: 'relevance' | 'newest' | 'popular'
  categoryId?: string
  tags?: string[]
  startTime?: string
  endTime?: string
  pageNum: number
  pageSize: number
}

// 综合搜索结果
export interface SearchResult {
  videos: {
    list: Video[]
    total: number
  }
  blogs: {
    list: Blog[]
    total: number
  }
  users: {
    list: SearchUserItem[]
    total: number
  }
}

// 搜索分页结果
export interface SearchPageResult<T> {
  list: T[]
  total: number
  pageNum: number
  pageSize: number
  pages: number
}

// 搜索用户项
export interface SearchUserItem {
  id: string
  username: string
  nickname: string
  avatar: string
  signature?: string
  videoCount: number
  blogCount: number
  followerCount: number
  isFollowed: boolean
}

export default searchApi
