/**
 * 视频相关类型定义
 */

// 视频信息
export interface Video {
  id: string
  title: string
  description: string
  cover: string
  url: string
  duration: number // 时长（秒）
  categoryId: string
  categoryName: string
  tags: string[]
  author: {
    id: string
    nickname: string
    avatar: string
  }
  playCount: number
  likeCount: number
  collectCount: number
  commentCount: number
  isLiked: boolean
  isCollected: boolean
  status: 'draft' | 'pending' | 'published' | 'rejected' | 'offline'
  resolution: '480p' | '720p' | '1080p' | '4k'
  fileSize: number
  createdAt: string
  publishedAt?: string
}

// 视频查询参数
export interface VideoQueryParams {
  keyword?: string
  categoryId?: string
  status?: string
  authorId?: string
  tags?: string[]
  resolution?: string
  sortBy?: 'newest' | 'popular' | 'most_played'
  startTime?: string
  endTime?: string
  pageNum: number
  pageSize: number
}

// 分页结果
export interface PageResult<T> {
  list: T[]
  total: number
  pageNum: number
  pageSize: number
  pages: number
}

// 视频分类
export interface VideoCategory {
  id: string
  name: string
  icon?: string
  sort: number
  parentId?: string
  children?: VideoCategory[]
  videoCount: number
}

// 视频章节
export interface VideoChapter {
  id: string
  title: string
  startTime: number // 开始时间（秒）
  endTime: number
}

// 视频字幕
export interface VideoSubtitle {
  id: string
  language: string
  url: string
  isDefault: boolean
}
