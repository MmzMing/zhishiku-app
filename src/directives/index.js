// 指令统一入口文件
import focus from './focus'

// 所有指令集合
const directives = {
  focus
}

// 批量注册指令
export default {
  install(app) {
    // 遍历所有指令
    Object.keys(directives).forEach((key) => {
      // 注册自定义指令
      app.directive(key, directives[key])
    })
  }
}