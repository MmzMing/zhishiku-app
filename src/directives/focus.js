// 自定义焦点指令，用于控制元素的自动聚焦行为

export default {
  mounted(el, binding) {
    // 只在绑定值为true时才自动聚焦
    if (binding.value) {
      // 使用setTimeout确保DOM更新完成后再聚焦
      setTimeout(() => {
        el.focus()
        // 可选：为用户主动聚焦的元素添加标记
        el.dataset.userInitiatedFocus = 'true'
        
        // 3秒后清除标记，认为用户可能已离开该输入框
        setTimeout(() => {
          el.removeAttribute('data-user-initiated-focus')
        }, 3000)
      }, 100)
    }
  },
  updated(el, binding) {
    // 当绑定值变化时，根据新值决定是否聚焦
    if (binding.value !== binding.oldValue) {
      if (binding.value) {
        setTimeout(() => {
          el.focus()
          el.dataset.userInitiatedFocus = 'true'
        }, 100)
      }
    }
  }
}