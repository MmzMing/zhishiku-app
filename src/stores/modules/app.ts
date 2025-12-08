/**
 * 应用状态管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 侧边栏状态
export interface SidebarState {
  opened: boolean
  withoutAnimation: boolean
}

// 设备类型
export type DeviceType = 'desktop' | 'mobile'

export const useAppStore = defineStore('app', () => {
  // 状态
  const sidebar = ref<SidebarState>({
    opened: true,
    withoutAnimation: false
  })
  
  const device = ref<DeviceType>('desktop')
  const size = ref<'default' | 'small' | 'large'>('default')
  const language = ref<string>('zh-cn')

  // 计算属性
  const sidebarOpened = computed(() => sidebar.value.opened)

  // 方法
  /**
   * 切换侧边栏
   */
  function toggleSidebar(withoutAnimation: boolean = false): void {
    sidebar.value.opened = !sidebar.value.opened
    sidebar.value.withoutAnimation = withoutAnimation
    
    // 保存状态
    localStorage.setItem('sidebar-opened', String(sidebar.value.opened))
  }

  /**
   * 关闭侧边栏
   */
  function closeSidebar(withoutAnimation: boolean = false): void {
    sidebar.value.opened = false
    sidebar.value.withoutAnimation = withoutAnimation
    
    localStorage.setItem('sidebar-opened', 'false')
  }

  /**
   * 打开侧边栏
   */
  function openSidebar(withoutAnimation: boolean = false): void {
    sidebar.value.opened = true
    sidebar.value.withoutAnimation = withoutAnimation
    
    localStorage.setItem('sidebar-opened', 'true')
  }

  /**
   * 设置设备类型
   */
  function setDevice(deviceType: DeviceType): void {
    device.value = deviceType
  }

  /**
   * 设置尺寸
   */
  function setSize(sizeValue: 'default' | 'small' | 'large'): void {
    size.value = sizeValue
    localStorage.setItem('app-size', sizeValue)
  }

  /**
   * 设置语言
   */
  function setLanguage(lang: string): void {
    language.value = lang
    localStorage.setItem('app-language', lang)
  }

  /**
   * 初始化
   */
  function init(): void {
    // 恢复侧边栏状态
    const savedOpened = localStorage.getItem('sidebar-opened')
    if (savedOpened !== null) {
      sidebar.value.opened = savedOpened === 'true'
    }
    
    // 恢复尺寸
    const savedSize = localStorage.getItem('app-size') as 'default' | 'small' | 'large'
    if (savedSize) {
      size.value = savedSize
    }
    
    // 恢复语言
    const savedLanguage = localStorage.getItem('app-language')
    if (savedLanguage) {
      language.value = savedLanguage
    }
    
    // 检测设备
    detectDevice()
  }

  /**
   * 检测设备类型
   */
  function detectDevice(): void {
    const isMobile = window.innerWidth <= 768
    device.value = isMobile ? 'mobile' : 'desktop'
    
    // 移动端默认关闭侧边栏
    if (isMobile) {
      closeSidebar(true)
    }
  }

  return {
    // 状态
    sidebar,
    device,
    size,
    language,
    
    // 计算属性
    sidebarOpened,
    
    // 方法
    toggleSidebar,
    closeSidebar,
    openSidebar,
    setDevice,
    setSize,
    setLanguage,
    init,
    detectDevice
  }
})
