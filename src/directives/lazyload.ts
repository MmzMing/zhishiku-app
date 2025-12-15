import type { App, DirectiveBinding } from 'vue'

// 懒加载指令
const lazyLoadDirective = {
  mounted(el: HTMLImageElement, binding: DirectiveBinding) {
    // 设置占位图
    el.src = '/picture/placeholder.svg'
    el.style.opacity = '0'
    el.style.transition = 'opacity 0.3s ease-in'
    
    // 创建Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 图片进入视口，加载真实图片
            el.src = binding.value
            el.onload = () => {
              // 图片加载完成后显示
              el.style.opacity = '1'
            }
            // 图片加载失败时的处理
            el.onerror = () => {
              el.src = '/picture/placeholder.svg'
              el.style.opacity = '1'
            }
            // 加载完成后停止观察
            observer.unobserve(el)
          }
        })
      },
      {
        rootMargin: '50px 0px', // 提前50px开始加载
        threshold: 0.01 // 当元素1%可见时触发回调
      }
    )
    
    // 开始观察元素
    observer.observe(el)
    
    // 将observer实例存储在元素上，以便在unmounted时清理
    ;(el as any).__lazyObserver = observer
  },
  
  updated(el: HTMLImageElement, binding: DirectiveBinding) {
    // 当绑定值变化时，重新加载图片
    if (binding.value !== binding.oldValue) {
      // 获取之前的observer
      const observer = (el as any).__lazyObserver
      if (observer) {
        // 清理之前的观察
        observer.unobserve(el)
        
        // 重置样式
        el.style.opacity = '0'
        
        // 重新设置observer
        observer.observe(el)
        // 更新要加载的图片地址
        ;(el as any).__lazyImageSrc = binding.value
      }
    }
  },
  
  unmounted(el: HTMLImageElement) {
    // 清理observer
    const observer = (el as any).__lazyObserver
    if (observer) {
      observer.unobserve(el)
    }
  }
}

// 注册指令
export function setupLazyLoadDirective(app: App) {
  app.directive('lazy', lazyLoadDirective)
}

export default lazyLoadDirective
