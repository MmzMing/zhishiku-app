/**
 * Axios 请求封装
 * 统一处理请求拦截、响应拦截、错误处理
 */

import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/modules/user'
import router from '@/router'

// 响应数据接口
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

// 请求配置扩展
interface RequestConfig extends AxiosRequestConfig {
  // 是否显示loading
  showLoading?: boolean
  // 是否显示错误提示
  showError?: boolean
  // 是否需要token
  withToken?: boolean
}

// 错误码映射
const ERROR_MESSAGES: Record<number, string> = {
  400: '请求参数错误',
  401: '未授权，请重新登录',
  403: '拒绝访问',
  404: '请求资源不存在',
  405: '请求方法不允许',
  408: '请求超时',
  500: '服务器内部错误',
  501: '服务未实现',
  502: '网关错误',
  503: '服务不可用',
  504: '网关超时',
}

// 业务错误码
const BUSINESS_ERROR_CODES = {
  SUCCESS: 0,
  TOKEN_EXPIRED: 10001,
  TOKEN_INVALID: 10002,
  PERMISSION_DENIED: 10003,
}

class Request {
  private instance: AxiosInstance
  private pendingRequests: Map<string, AbortController> = new Map()

  constructor() {
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  // 生成请求唯一标识
  private generateRequestKey(config: AxiosRequestConfig): string {
    const { method, url, params, data } = config
    return [method, url, JSON.stringify(params), JSON.stringify(data)].join('&')
  }

  // 添加待处理请求
  private addPendingRequest(config: InternalAxiosRequestConfig): void {
    const requestKey = this.generateRequestKey(config)
    if (this.pendingRequests.has(requestKey)) {
      // 取消之前的重复请求
      const controller = this.pendingRequests.get(requestKey)
      controller?.abort()
      this.pendingRequests.delete(requestKey)
    }
    const controller = new AbortController()
    config.signal = controller.signal
    this.pendingRequests.set(requestKey, controller)
  }

  // 移除已完成请求
  private removePendingRequest(config: AxiosRequestConfig): void {
    const requestKey = this.generateRequestKey(config)
    this.pendingRequests.delete(requestKey)
  }

  // 设置拦截器
  private setupInterceptors(): void {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // 添加到待处理请求
        this.addPendingRequest(config)

        // 添加token
        const userStore = useUserStore()
        const token = userStore.token
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }

        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        // 移除已完成请求
        this.removePendingRequest(response.config)

        const { data } = response

        // 判断业务状态码
        if (data.code === BUSINESS_ERROR_CODES.SUCCESS) {
          return data as unknown as AxiosResponse
        }

        // 处理业务错误
        return this.handleBusinessError(data)
      },
      (error) => {
        // 移除已完成请求
        if (error.config) {
          this.removePendingRequest(error.config)
        }

        // 处理HTTP错误
        return this.handleHttpError(error)
      }
    )
  }

  // 处理业务错误
  private handleBusinessError(data: ApiResponse): Promise<never> {
    const { code, message } = data

    switch (code) {
      case BUSINESS_ERROR_CODES.TOKEN_EXPIRED:
      case BUSINESS_ERROR_CODES.TOKEN_INVALID:
        // Token过期或无效
        this.handleTokenError()
        break
      case BUSINESS_ERROR_CODES.PERMISSION_DENIED:
        ElMessage.error('权限不足')
        break
      default:
        ElMessage.error(message || '请求失败')
    }

    return Promise.reject(data)
  }

  // 处理HTTP错误
  private handleHttpError(error: unknown): Promise<never> {
    if (axios.isCancel(error)) {
      console.log('请求已取消:', error)
      return Promise.reject(error)
    }

    const axiosError = error as { response?: AxiosResponse; message?: string }
    const status = axiosError.response?.status
    const message = status ? ERROR_MESSAGES[status] : axiosError.message || '网络异常'

    if (status === 401) {
      this.handleTokenError()
    } else {
      ElMessage.error(message)
    }

    return Promise.reject(error)
  }

  // 处理Token错误
  private handleTokenError(): void {
    const userStore = useUserStore()
    
    ElMessageBox.confirm('登录已过期，请重新登录', '提示', {
      confirmButtonText: '重新登录',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(() => {
      userStore.logout()
      router.push('/login')
    }).catch(() => {
      // 取消操作
    })
  }

  // 通用请求方法
  async request<T = unknown>(config: RequestConfig): Promise<T> {
    const response = await this.instance.request<unknown, ApiResponse<T>>(config)
    return response.data as T
  }

  // GET请求
  async get<T = unknown>(url: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url, params })
  }

  // POST请求
  async post<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data })
  }

  // PUT请求
  async put<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT', url, data })
  }

  // DELETE请求
  async delete<T = unknown>(url: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url, params })
  }

  // PATCH请求
  async patch<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PATCH', url, data })
  }

  // 上传文件
  async upload<T = unknown>(url: string, file: File, config?: RequestConfig): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)
    
    return this.request<T>({
      ...config,
      method: 'POST',
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  }

  // 下载文件
  async download(url: string, params?: Record<string, unknown>, filename?: string): Promise<void> {
    const response = await this.instance.request({
      method: 'GET',
      url,
      params,
      responseType: 'blob',
    })

    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  }

  // 取消所有请求
  cancelAllRequests(): void {
    this.pendingRequests.forEach((controller) => {
      controller.abort()
    })
    this.pendingRequests.clear()
  }
}

// 导出单例
const request = new Request()

export default request
export { request }
