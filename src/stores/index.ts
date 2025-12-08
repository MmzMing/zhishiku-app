/**
 * Pinia 状态管理入口
 */

import { createPinia } from 'pinia'

// 创建 Pinia 实例
const pinia = createPinia()

export default pinia

// 导出所有 store 模块
export * from './modules/user'
export * from './modules/app'
