/**
 * 博客相关类型定义
 */

// 博客信息
export interface Blog {
  id: string
  title: string
  summary: string
  content: string
  contentHtml?: string
  cover?: string
  categoryId: string
  categoryName: string
  tags: string[]
  author: {
    id: string
    nickname: string
    avatar: string
  }
  readCount: number
  likeCount: number
  collectCount: number
  commentCount: number
  isLiked: boolean
  isCollected: boolean
  status: 'draft' | 'pending' | 'published' | 'rejected' | 'offline'
  isTop: boolean
  isOriginal: boolean
  sourceUrl?: string
  wordCount: number
  readTime: number // 预计阅读时间（分钟）
  createdAt: string
  updatedAt: string
  publishedAt?: string
}

// 博客查询参数
export interface BlogQueryParams {
  keyword?: string
  categoryId?: string
  status?: string
  authorId?: string
  tags?: string[]
  isTop?: boolean
  isOriginal?: boolean
  sortBy?: 'newest' | 'popular' | 'most_read'
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

// 博客分类
export interface BlogCategory {
  id: string
  name: string
  icon?: string
  description?: string
  sort: number
  parentId?: string
  children?: BlogCategory[]
  blogCount: number
}

// 博客标签
export interface BlogTag {
  id: string
  name: string
  color?: string
  blogCount: number
}

// 博客评论
export interface BlogComment {
  id: string
  blogId: string
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
  children?: BlogComment[]
}

// 博客目录
export interface BlogToc {
  id: string
  text: string
  level: number
  children?: BlogToc[]
}
