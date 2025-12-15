import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import 'nprogress/nprogress.css'

import App from './App.vue'
import router from './router'
import pinia from './stores'
import './styles/global.scss'
import { setupLazyLoadDirective } from './directives/lazyload'

// 创建应用实例
const app = createApp(App)

// 使用插件
app.use(pinia)
app.use(router)
app.use(ElementPlus, {
  locale: zhCn,
})

// 注册懒加载指令
setupLazyLoadDirective(app)

// 挂载应用
app.mount('#app')
