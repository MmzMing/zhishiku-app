/**
 * 主题工具函数
 * 用于主题切换、CSS变量管理等
 */

import { generateColorScale } from './colorUtils'

/**
 * 应用主题CSS变量
 */
export function applyThemeVariables(variables: Record<string, string>): void {
  const root = document.documentElement
  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value)
  })
}

/**
 * 切换主题类名
 */
export function toggleThemeClass(
  theme: 'light' | 'dark',
  element: HTMLElement = document.documentElement
): void {
  element.classList.remove('theme-light', 'theme-dark')
  element.classList.add(`theme-${theme}`)
  element.setAttribute('data-theme', theme)
}

/**
 * 检测系统主题偏好
 */
export function detectSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches 
    ? 'dark' 
    : 'light'
}

/**
 * 监听系统主题变化
 */
export function watchSystemTheme(
  callback: (theme: 'light' | 'dark') => void
): () => void {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  
  const handler = (event: MediaQueryListEvent) => {
    callback(event.matches ? 'dark' : 'light')
  }
  
  mediaQuery.addEventListener('change', handler)
  
  // 返回清理函数
  return () => mediaQuery.removeEventListener('change', handler)
}

/**
 * 保存主题配置
 */
export function saveThemeConfig(config: ThemeConfig): void {
  localStorage.setItem('theme-config', JSON.stringify(config))
}

/**
 * 加载主题配置
 */
export function loadThemeConfig(): ThemeConfig | null {
  const config = localStorage.getItem('theme-config')
  return config ? JSON.parse(config) : null
}

/**
 * 主题配置接口
 */
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'auto'
  primaryColor: string
  borderRadius: number
  fontSize: {
    base: string
    scale: number[]
  }
  spacing: {
    unit: number
    scale: number[]
  }
  customColors?: Record<string, string>
}

/**
 * 生成主题CSS变量对象
 */
export function generateThemeVariables(
  config: ThemeConfig,
  isDark: boolean = false
): Record<string, string> {
  const variables: Record<string, string> = {}
  
  // 基础变量
  variables['color-primary'] = config.primaryColor
  
  // 生成颜色色阶
  const colorScale = generateColorScale(config.primaryColor, 10, isDark)
  colorScale.forEach((color, index) => {
    variables[`color-primary-${(index + 1) * 100}`] = color
  })
  
  // 间距变量
  const spacingUnit = config.spacing?.unit || 4
  const spacingScale = config.spacing?.scale || [0, 0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3, 4]
  spacingScale.forEach((scale, index) => {
    variables[`spacing-${index}`] = `${scale * spacingUnit}px`
  })
  
  // 字体变量
  const fontSizeBase = config.fontSize?.base || '14px'
  const fontSizeScale = config.fontSize?.scale || [0.75, 0.875, 1, 1.125, 1.25, 1.5, 1.875, 2.25]
  fontSizeScale.forEach((scale, index) => {
    variables[`font-size-${index}`] = `calc(${fontSizeBase} * ${scale})`
  })
  
  // 圆角变量
  variables['border-radius-base'] = `${config.borderRadius}px`
  variables['border-radius-sm'] = `${Math.max(0, config.borderRadius - 2)}px`
  variables['border-radius-lg'] = `${config.borderRadius + 4}px`
  variables['border-radius-xl'] = `${config.borderRadius + 8}px`
  
  return variables
}

/**
 * 默认亮色主题配置
 */
export const defaultLightTheme: ThemeConfig = {
  mode: 'light',
  primaryColor: '#409EFF',
  borderRadius: 4,
  fontSize: {
    base: '14px',
    scale: [0.75, 0.875, 1, 1.125, 1.25, 1.5, 1.875, 2.25]
  },
  spacing: {
    unit: 4,
    scale: [0, 0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3, 4]
  }
}

/**
 * 默认暗黑主题配置
 */
export const defaultDarkTheme: ThemeConfig = {
  ...defaultLightTheme,
  mode: 'dark',
  primaryColor: '#58A6FF'
}

/**
 * 获取当前主题配置
 */
export function getCurrentThemeConfig(isDark: boolean): ThemeConfig {
  const savedConfig = loadThemeConfig()
  if (savedConfig) {
    return {
      ...savedConfig,
      mode: isDark ? 'dark' : 'light'
    }
  }
  return isDark ? defaultDarkTheme : defaultLightTheme
}
