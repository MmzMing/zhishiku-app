/**
 * 搜索相关 API
 */

import type { Video } from '@/types/video'
import type { Blog } from '@/types/blog'
import { createApi } from '@/api/factory'

// 创建搜索API实例
const searchApiInstance = createApi('search')

export const searchApi = {
  // 综合搜索
  search(params: SearchParams) {
    return searchApiInstance.get<SearchResult>('', params)
  },

  // 搜索视频
  searchVideos(params: SearchParams) {
    return searchApiInstance.get<SearchPageResult<Video>>('/videos', params)
  },

  // 搜索博客
  searchBlogs(params: SearchParams) {
    return searchApiInstance.get<SearchPageResult<Blog>>('/blogs', params)
  },

  // 搜索用户
  searchUsers(params: SearchParams) {
    return searchApiInstance.get<SearchPageResult<SearchUserItem>>('/users', params)
  },

  // 获取热门搜索词
  getHotKeywords(limit?: number) {
    return searchApiInstance.get<string[]>('/hot-keywords', { limit: limit || 10 })
  },

  // 获取搜索建议
  getSuggestions(keyword: string) {
    return searchApiInstance.get<string[]>('/suggestions', { keyword })
  },

  // 获取搜索历史
  getHistory() {
    return searchApiInstance.get<string[]>('/history')
  },

  // 清除搜索历史
  clearHistory() {
    return searchApiInstance.delete<void>('/history')
  },

  // 删除单条搜索历史
  removeHistoryItem(keyword: string) {
    return searchApiInstance.delete<void>(`/history/${encodeURIComponent(keyword)}`)
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
