<template>
  <div class="typewriter-container">
    <span class="typewriter-text" ref="typewriterRef"></span>
    <span class="typewriter-cursor"></span>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Props {
  textArray: string[]
  typingSpeed?: number
  deletingSpeed?: number
  delayBetweenTexts?: number
}

const props = withDefaults(defineProps<Props>(), {
  textArray: () => ['学海无涯苦作舟'],
  typingSpeed: 100,
  deletingSpeed: 50,
  delayBetweenTexts: 4000 // 文字停留时间
})

const typewriterRef = ref<HTMLElement>()
let currentIndex = 0
let isTyping = true
let animationId: number | null = null

const typeText = () => {
  if (!typewriterRef.value) return
  
  const currentText = props.textArray[currentIndex]
  const currentDisplay = typewriterRef.value.textContent || ''
  
  if (isTyping) {
    // 打字阶段
    if (currentDisplay.length < currentText.length) {
      typewriterRef.value.textContent = currentText.substring(0, currentDisplay.length + 1)
      animationId = window.setTimeout(typeText, props.typingSpeed)
    } else {
      // 打字完成，等待一段时间后开始删除
      setTimeout(() => {
        isTyping = false
        animationId = window.setTimeout(typeText, props.delayBetweenTexts)
      }, props.delayBetweenTexts)
    }
  } else {
    // 删除阶段
    if (currentDisplay.length > 0) {
      typewriterRef.value.textContent = currentDisplay.substring(0, currentDisplay.length - 1)
      animationId = window.setTimeout(typeText, props.deletingSpeed)
    } else {
      // 删除完成，切换到下一个文本并重置状态
      currentIndex = (currentIndex + 1) % props.textArray.length
      isTyping = true
      animationId = window.setTimeout(typeText, 500)
    }
  }
}

const resetAnimation = () => {
  if (animationId !== null) {
    clearTimeout(animationId)
    animationId = null
  }
  currentIndex = 0
  isTyping = true
  if (typewriterRef.value) {
    typewriterRef.value.textContent = ''
  }
}

// 监听页面可见性变化，确保动画在页面重新可见时继续
const handleVisibilityChange = () => {
  if (!document.hidden) {
    // 页面变为可见，重启动画
    resetAnimation()
    setTimeout(typeText, 100)
  } else {
    // 页面变为不可见，停止动画
    if (animationId !== null) {
      clearTimeout(animationId)
      animationId = null
    }
  }
}

onMounted(() => {
  // 开始动画
  setTimeout(typeText, 100)
  // 监听页面可见性变化
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  // 清理定时器
  if (animationId !== null) {
    clearTimeout(animationId)
  }
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<style scoped>
.typewriter-container {
  display: inline-block;
  position: relative;
}

.typewriter-container .typewriter-text {
  font-size: 2em; /* 增大字体为原来的两倍 */
  font-weight: inherit;
  color: inherit;
}

.typewriter-container .typewriter-cursor {
  display: inline-block;
  width: 3px;
  height: 1em;
  background-color: var(--color-text-primary);
  margin-left: 2px;
  vertical-align: text-bottom;
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  from, to { opacity: 1; }
  50% { opacity: 0; }
}
</style>