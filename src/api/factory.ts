/**
 * API 工厂类
 * 用于统一创建和管理API模块，实现接口的标准化封装
 */

import request from '@/utils/request'
import { buildApiUrl } from './config'
import type { AxiosRequestConfig } from 'axios'

// 扩展请求配置接口
interface ApiRequestConfig extends AxiosRequestConfig {
  showLoading?: boolean
  showError?: boolean
  withToken?: boolean
}

// 响应数据接口
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

/**
 * API工厂类
 */
export class ApiFactory {
  private moduleName: string

  /**
   * 构造函数
   * @param moduleName 模块名称
   */
  constructor(moduleName: string) {
    this.moduleName = moduleName
  }

  /**
   * 构建完整的API路径
   * @param path 接口路径
   * @returns 完整的API路径
   */
  private getApiUrl(path: string): string {
    return buildApiUrl(this.moduleName, path)
  }

  /**
   * GET请求
   * @param path 接口路径
   * @param params 请求参数
   * @param config 请求配置
   * @returns Promise对象
   */
  get<T = unknown>(path: string, params?: Record<string, unknown>, config?: ApiRequestConfig): Promise<T> {
    return request.get<T>(this.getApiUrl(path), params, config)
  }

  /**
   * POST请求
   * @param path 接口路径
   * @param data 请求数据
   * @param config 请求配置
   * @returns Promise对象
   */
  post<T = unknown>(path: string, data?: unknown, config?: ApiRequestConfig): Promise<T> {
    return request.post<T>(this.getApiUrl(path), data, config)
  }

  /**
   * PUT请求
   * @param path 接口路径
   * @param data 请求数据
   * @param config 请求配置
   * @returns Promise对象
   */
  put<T = unknown>(path: string, data?: unknown, config?: ApiRequestConfig): Promise<T> {
    return request.put<T>(this.getApiUrl(path), data, config)
  }

  /**
   * DELETE请求
   * @param path 接口路径
   * @param params 请求参数
   * @param config 请求配置
   * @returns Promise对象
   */
  delete<T = unknown>(path: string, params?: Record<string, unknown>, config?: ApiRequestConfig): Promise<T> {
    return request.delete<T>(this.getApiUrl(path), params, config)
  }

  /**
   * PATCH请求
   * @param path 接口路径
   * @param data 请求数据
   * @param config 请求配置
   * @returns Promise对象
   */
  patch<T = unknown>(path: string, data?: unknown, config?: ApiRequestConfig): Promise<T> {
    return request.patch<T>(this.getApiUrl(path), data, config)
  }

  /**
   * 上传文件
   * @param path 接口路径
   * @param file 文件对象
   * @param config 请求配置
   * @returns Promise对象
   */
  upload<T = unknown>(path: string, file: File, config?: ApiRequestConfig): Promise<T> {
    return request.upload<T>(this.getApiUrl(path), file, config)
  }

  /**
   * 下载文件
   * @param path 接口路径
   * @param params 请求参数
   * @param filename 文件名
   * @returns Promise对象
   */
  download(path: string, params?: Record<string, unknown>, filename?: string): Promise<void> {
    return request.download(this.getApiUrl(path), params, filename)
  }
}

/**
 * 创建API模块的辅助函数
 * @param moduleName 模块名称
 * @returns ApiFactory实例
 */
export function createApi(moduleName: string): ApiFactory {
  return new ApiFactory(moduleName)
}

export default ApiFactory