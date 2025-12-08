/**
 * 主题管理 Composable
 * 提供主题切换、主题配置等功能
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { 
  type ThemeConfig,
  defaultLightTheme,
  defaultDarkTheme,
  generateThemeVariables,
  applyThemeVariables,
  toggleThemeClass,
  saveThemeConfig
} from '@/utils/themeUtils'

// 主题模式定义
export type ThemeMode = 'light' | 'dark' | 'auto'

// 当前主题模式（全局状态）
const themeMode = ref<ThemeMode>('light')

// 主题配置（全局状态）
const themeConfig = ref<ThemeConfig>(defaultLightTheme)

// 清理函数
let cleanupWatcher: (() => void) | null = null

export function useTheme() {
  // 是否暗黑模式
  const isDark = computed(() => {
    if (themeMode.value === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return themeMode.value === 'dark'
  })

  // 初始化主题
  const initTheme = () => {
    // 1. 从localStorage读取用户设置
    const savedTheme = localStorage.getItem('theme-mode') as ThemeMode
    if (savedTheme) {
      themeMode.value = savedTheme
    } else {
      // 2. 检测系统偏好
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      themeMode.value = prefersDark ? 'dark' : 'light'
    }
    
    // 3. 应用主题
    applyTheme()
    
    // 4. 监听系统主题变化
    watchSystemTheme()
  }

  // 切换主题模式
  const toggleTheme = (mode?: ThemeMode) => {
    if (mode) {
      themeMode.value = mode
    } else {
      // 循环切换: light -> dark -> auto -> light
      const modes: ThemeMode[] = ['light', 'dark', 'auto']
      const currentIndex = modes.indexOf(themeMode.value)
      const nextMode = modes[(currentIndex + 1) % modes.length]
      themeMode.value = nextMode ?? 'light'
    }
    
    localStorage.setItem('theme-mode', themeMode.value)
    applyTheme()
  }

  // 应用主题到DOM
  const applyTheme = () => {
    const html = document.documentElement
    
    // 设置主题属性
    if (themeMode.value === 'auto') {
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      toggleThemeClass(isSystemDark ? 'dark' : 'light', html)
    } else {
      toggleThemeClass(themeMode.value, html)
    }
    
    // 设置主题配置
    updateCSSVariables()
    
    // 触发主题变更事件
    window.dispatchEvent(new CustomEvent('theme-change', { 
      detail: { mode: themeMode.value, isDark: isDark.value }
    }))
  }

  // 更新CSS变量
  const updateCSSVariables = () => {
    const config = isDark.value ? defaultDarkTheme : defaultLightTheme
    
    // 更新主题配置
    themeConfig.value = config
    
    // 生成并应用CSS变量
    const variables = generateThemeVariables(config, isDark.value)
    applyThemeVariables(variables)
    
    // 设置基础CSS变量
    const root = document.documentElement
    root.style.setProperty('--color-primary', config.primaryColor)
    root.style.setProperty('--border-radius-base', `${config.borderRadius}px`)
    root.style.setProperty('--font-size-base', config.fontSize.base)
    root.style.setProperty('--spacing-unit', `${config.spacing.unit}px`)
    
    // 如果存在自定义颜色，也设置到CSS变量
    if (config.customColors) {
      Object.entries(config.customColors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value)
      })
    }
  }

  // 监听系统主题变化
  const watchSystemTheme = () => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      if (themeMode.value === 'auto') {
        const html = document.documentElement
        toggleThemeClass(e.matches ? 'dark' : 'light', html)
        updateCSSVariables()
      }
    }
    
    mediaQuery.addEventListener('change', handler)
    
    // 保存清理函数
    cleanupWatcher = () => mediaQuery.removeEventListener('change', handler)
  }

  // 自定义主题颜色
  const setPrimaryColor = (color: string) => {
    themeConfig.value.primaryColor = color
    updateCSSVariables()
    
    // 保存到用户配置
    saveThemeConfig(themeConfig.value)
  }

  // 获取主题模式图标
  const themeIcon = computed(() => {
    switch (themeMode.value) {
      case 'light': return 'Sunny'
      case 'dark': return 'Moon'
      default: return 'Setting'
    }
  })

  // 获取主题模式文本
  const themeText = computed(() => {
    switch (themeMode.value) {
      case 'light': return '亮色主题'
      case 'dark': return '暗黑主题'
      default: return '跟随系统'
    }
  })

  // 组件挂载时初始化
  onMounted(() => {
    initTheme()
  })

  // 组件卸载时清理
  onUnmounted(() => {
    if (cleanupWatcher) {
      cleanupWatcher()
      cleanupWatcher = null
    }
  })

  return {
    themeMode,
    themeConfig,
    isDark,
    themeIcon,
    themeText,
    toggleTheme,
    setPrimaryColor,
    initTheme,
    applyTheme
  }
}
