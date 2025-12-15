<template>
  <div class="portal-home">
    <!-- 全屏背景首屏区域 -->
    <section class="fullscreen-hero" ref="fullscreenHeroRef">
      <div class="hero-background"></div>
      <div class="hero-overlay"></div>
      <div class="hero-content-wrapper">
        <h1 class="hero-main-title">知 识 库 学 习 平 台</h1>
          <p class="hero-main-desc">探 索 知 识 的 海 洋</p>
        <div class="hero-main-search">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索你想学习的内容..."
            size="large"
            clearable
            @keyup.enter="handleSearch"
            :class="{ 'expanded': isSearchFocused || isSearchHovered }"
            @focus="isSearchFocused = true"
            @blur="isSearchFocused = false"
            @mouseenter="isSearchHovered = true"
            @mouseleave="isSearchHovered = false"
          >
            <template #prefix>
              <el-icon class="search-icon"><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <div class="hero-main-tags">
          <span>热门搜索：</span>
          <el-tag 
            v-for="tag in hotTags" 
            :key="tag" 
            class="hot-tag"
            @click="searchKeyword = tag; handleSearch()"
          >
            {{ tag }}
          </el-tag>
        </div>
        <div class="hero-main-stats">
          <div class="stat-item">
            <span class="stat-value">{{ stats.videos }}+</span>
            <span class="stat-label">视频教程</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.blogs }}+</span>
            <span class="stat-label">技术博客</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.users }}+</span>
            <span class="stat-label">注册用户</span>
          </div>
        </div>
      </div>
      
      <!-- 向下箭头按钮 -->
      <div class="scroll-down-arrow" @click="scrollToContent">
        <el-icon :size="32" class="arrow-icon"><ArrowDown /></el-icon>
        <span class="arrow-text">向下滚动</span>
      </div>
    </section>

    <!-- 主内容区域 -->
    <div class="main-content" ref="mainContentRef">
    
    <!-- 技术分类轮播 -->
    <section 
      class="tech-carousel-section"
    >
      <div class="section-container">
        <h2 class="carousel-title">海量视频教程、技术博客，助你快速提升技能</h2>
        
        <!-- 三图轮播区域 -->
        <div class="carousel-wrapper">
          <div class="carousel-track" ref="carouselTrackRef">
            <div 
              v-for="(category, index) in carouselCategories"
              :key="category.id"
              class="carousel-item"
              :class="getCarouselItemClass(index)"
              :style="getCarouselItemStyle(index)"
              @click="slideToCategory(index)"
              @mouseenter="stopAutoPlay"
              @mouseleave="startAutoPlay"
            >
              <div class="carousel-item-content">
                <el-icon :size="getIconSize(index)"><component :is="category.icon" /></el-icon>
                <span class="carousel-item-name">{{ category.name }}</span>
                <span 
                  v-if="index === visibleCenterIndex" 
                  class="carousel-item-desc"
                >
                  {{ category.desc }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 底部分类选择器 -->
        <div class="category-selector">
          <div 
            class="selector-track" 
            ref="selectorTrackRef"
            :style="{ transform: `translateX(${selectorOffset}px)` }"
          >
            <div 
              v-for="(cat, index) in categories" 
              :key="cat.id" 
              class="selector-item"
              :class="{ active: index === currentIndex }"
              @click="slideTo(index)"
            >
              <div class="selector-icon" :style="{ background: index === currentIndex ? cat.color : '' }">
                <el-icon :size="20"><component :is="cat.icon" /></el-icon>
              </div>
              <span class="selector-name">{{ cat.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- 推荐视频 -->
    <section class="video-section">
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title">
            <el-icon><VideoPlay /></el-icon>
            推荐视频
          </h2>
          <el-link type="primary" :underline="false" @click="$router.push('/portal/videos')">
            查看更多 <el-icon><ArrowRight /></el-icon>
          </el-link>
        </div>
        
        <div class="video-grid" v-loading="videosLoading">
          <div 
            v-for="video in recommendVideos" 
            :key="video.id" 
            class="video-card"
            @click="$router.push(`/portal/videos/${video.id}`)"
          >
            <div class="video-cover">
              <img v-lazy="video.cover" :alt="video.title" />
              <span class="video-duration">{{ formatDuration(video.duration) }}</span>
              <div class="video-play-mask">
                <el-icon :size="48"><VideoPlay /></el-icon>
              </div>
            </div>
            <div class="video-info">
              <h3 class="video-title">{{ video.title }}</h3>
              <div class="video-meta">
                <span><el-icon><View /></el-icon> {{ formatCount(video.playCount) }}</span>
                <span><el-icon><Star /></el-icon> {{ formatCount(video.likeCount) }}</span>
              </div>
              <div class="video-author">
                <el-avatar :size="24" :src="video.author.avatar" v-lazy />
                <span>{{ video.author.nickname }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- 热门博客 -->
    <section class="blog-section">
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title">
            <el-icon><Document /></el-icon>
            热门博客
          </h2>
          <el-link type="primary" :underline="false" @click="$router.push('/portal/blogs')">
            查看更多 <el-icon><ArrowRight /></el-icon>
          </el-link>
        </div>
        
        <div class="blog-grid" v-loading="blogsLoading">
          <div 
            v-for="blog in hotBlogs" 
            :key="blog.id" 
            class="blog-card"
            @click="$router.push(`/portal/blogs/${blog.id}`)"
          >
            <div class="blog-cover" v-if="blog.cover">
              <img v-lazy="blog.cover" :alt="blog.title" />
            </div>
            <div class="blog-content">
              <div class="blog-tags">
                <el-tag 
                  v-for="tag in blog.tags.slice(0, 2)" 
                  :key="tag" 
                  size="small"
                  effect="plain"
                >
                  {{ tag }}
                </el-tag>
              </div>
              <h3 class="blog-title">{{ blog.title }}</h3>
              <p class="blog-summary">{{ blog.summary }}</p>
              <div class="blog-footer">
                <div class="blog-author">
                <el-avatar :size="24" :src="blog.author.avatar" v-lazy />
                <span>{{ blog.author.nickname }}</span>
              </div>
                <div class="blog-stats">
                  <span><el-icon><View /></el-icon> {{ formatCount(blog.readCount) }}</span>
                  <span><el-icon><ChatDotRound /></el-icon> {{ blog.commentCount }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- 功能特点 -->
    <section class="feature-section">
      <div class="section-container">
        <h2 class="section-title center">为什么选择我们?</h2>
        <div class="feature-grid">
          <div class="feature-card" v-for="feature in features" :key="feature.title">
            <div class="feature-icon" :style="{ background: feature.color }">
              <el-icon :size="32"><component :is="feature.icon" /></el-icon>
            </div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.desc }}</p>
          </div>
        </div>
      </div>
    </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted as onMount, onUnmounted as onUnMount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Search, VideoPlay, Document, ArrowRight, View, Star, 
  ChatDotRound, Monitor, Notebook, Files, Setting,
  Trophy, Clock, Headset, DataLine, Connection, Cpu, 
  Platform, Box, Promotion, Guide, ArrowDown
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { blogApi, videoApi } from '@/services/api'
import type { Video } from '@/types/video'
import type { Blog } from '@/types/blog'

const router = useRouter()

// Refs
const fullscreenHeroRef = ref<HTMLElement | null>(null)
const mainContentRef = ref<HTMLElement | null>(null)
const carouselTrackRef = ref<HTMLElement | null>(null)

// 状态
const searchKeyword = ref('')
const isSearchFocused = ref(false)
const isSearchHovered = ref(false)
const recommendVideos = ref<Video[]>([])
const hotBlogs = ref<Blog[]>([])
const videosLoading = ref(false)
const blogsLoading = ref(false)

// 统计数据
const stats = ref({
  videos: 500,
  blogs: 1200,
  users: 10000
})

// 热门搜索标签
const hotTags = ['Vue 3', 'React', 'TypeScript', 'Node.js', 'Python']

// 技术分类数据
const categories = [
  { id: '1', name: '前端开发', icon: Monitor, color: 'linear-gradient(135deg, #687eea 0%, #764ba2 100%)', desc: 'Vue/React/Angular 等前端框架教程' },
  { id: '2', name: '后端开发', icon: Setting, color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', desc: 'Java/Go/Python 等后端技术学习' },
  { id: '3', name: '数据库', icon: Files, color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', desc: 'MySQL/Redis/MongoDB 数据库实战' },
  { id: '4', name: '运维部署', icon: Notebook, color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', desc: 'Docker/K8s/CI/CD 自动化运维' },
  { id: '5', name: '人工智能', icon: Cpu, color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', desc: '机器学习/深度学习/NLP 技术' },
  { id: '6', name: '大数据', icon: DataLine, color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', desc: 'Hadoop/Spark/Flink 数据处理' },
  { id: '7', name: '网络安全', icon: Connection, color: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)', desc: '渗透测试/安全攻防/CTF' },
  { id: '8', name: '移动开发', icon: Platform, color: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)', desc: 'iOS/Android/Flutter 移动应用' },
  { id: '9', name: '微服务', icon: Box, color: 'linear-gradient(135deg, #c3cfe2 0%, #c3cfe2 100%)', desc: 'SpringCloud/Dubbo 微服务架构' },
  { id: '10', name: '测试开发', icon: Guide, color: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', desc: '自动化测试/性能测试/单元测试' },
]

// 轮播相关状态
const currentIndex = ref(0)
const selectorTrackRef = ref<HTMLElement | null>(null)
const selectorOffset = ref(0)
let autoPlayTimer: number | null = null

// 3D轮播相关状态
const visibleCenterIndex = ref(0)
const totalCategories = categories.length
const bufferCount = 2 // 缓冲区数量，左右各2个，总共显示5张图片

// 鼠标拖拽相关状态
const isDragging = ref(false)
const startX = ref(0)
const currentX = ref(0)
const dragThreshold = ref(50) // 拖拽阈值

// 计算可见的轮播项（包括缓冲区）
const carouselCategories = computed(() => {
  const result = []
  // 添加当前项及其前后几项（形成环形列表）
  for (let i = -bufferCount; i <= bufferCount; i++) {
    const index = (currentIndex.value + i + totalCategories) % totalCategories
    result.push({
      ...categories[index],
      originalIndex: index,
      positionIndex: i
    })
  }
  return result
})

// 获取轮播项的CSS类
function getCarouselItemClass(index: number) {
  const positionIndex = index - bufferCount // 转换为相对位置索引 (-2, -1, 0, 1, 2)
  
  return {
    'carousel-item-prev': positionIndex < 0,
    'carousel-item-next': positionIndex > 0,
    'carousel-item-active': positionIndex === 0,
    [`carousel-item-pos-${positionIndex}`]: true
  }
}

// 获取轮播项的样式
function getCarouselItemStyle(index: number) {
  const item = carouselCategories.value[index]
  if (!item) return {}
  const positionIndex = item.positionIndex
  
  // 计算3D变换参数，参考u-tools的轮播效果
  const rotateY = positionIndex * -20 // 每个项绕Y轴旋转一定角度
  const translateX = positionIndex * 200 // X轴偏移，适应更大的图片
  const translateZ = Math.abs(positionIndex) * -120 - 60 // Z轴偏移，离中心越远越靠后
  const scale = 1 - Math.abs(positionIndex) * 0.15 // 缩放，离中心越远越小
  const opacity = 1 - Math.abs(positionIndex) * 0.3 // 透明度，离中心越远越透明
  const zIndex = 10 - Math.abs(positionIndex) // 层级，离中心越远越低
  
  return {
    background: item.color,
    transform: `translate3d(${translateX}px, 0, ${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
    opacity: opacity,
    zIndex: zIndex
  }
}

// 获取图标大小
function getIconSize(index: number) {
  const item = carouselCategories.value[index]
  if (!item) return 64
  const positionIndex = item.positionIndex
  return positionIndex === 0 ? 80 : 64
}

// 切换到指定分类
function slideTo(index: number) {
  // 记录之前的索引
  const previousIndex = currentIndex.value
  
  // 更新当前索引和可见中心索引
  currentIndex.value = index
  visibleCenterIndex.value = index
  
  // 重置自动轮播定时器
  resetAutoPlay()
  
  // 判断是否需要更新选择器偏移量
  // 对于至少5个常驻的处理：当索引小于2或者大于等于总数量-3时，使用特殊的偏移计算
  const totalCategories = categories.length
  const needsSpecialOffset = index < 2 || index >= totalCategories - 3
  
  // 只有在不需要特殊处理的情况下才调用calculateSelectorOffset
  // 特殊情况的偏移计算将在calculateSelectorOffset函数内部处理
  calculateSelectorOffset()
}

// 切换到轮播项中的分类
function slideToCategory(index: number) {
  const item = carouselCategories.value[index]
  if (item) {
    slideTo(item.originalIndex)
  }
}

// 点击分类跳转
function handleCategoryClick(cat: typeof categories[0]) {
  router.push({ path: '/portal/videos', query: { category: cat.id } })
}

// 计算选择器偏移量，实现至少5个常驻显示的逻辑
function calculateSelectorOffset() {
  const track = selectorTrackRef.value
  if (!track) return
  
  const items = track.querySelectorAll('.selector-item')
  if (items.length === 0) return
  
  const containerWidth = track.parentElement?.clientWidth || 0
  // 响应式项目宽度：在小屏幕上减小宽度
  const isMobile = window.innerWidth <= 768
  const itemWidth = isMobile ? 100 : 140 // 移动端100px，桌面端140px
  const totalCategories = categories.length
  const centerOffset = (containerWidth - itemWidth) / 2
  
  // 计算基础偏移量
  let offset = centerOffset - currentIndex.value * itemWidth
  
  // 实现至少5个常驻的逻辑
  // 当索引小于2时，保持左侧固定位置，不继续向左滑动
  if (currentIndex.value < 2) {
    offset = centerOffset - 2 * itemWidth // 保持第2个项目在中心位置
  }
  // 当索引大于等于总数量-3时，保持右侧固定位置，不继续向右滑动
  else if (currentIndex.value >= totalCategories - 3) {
    offset = centerOffset - (totalCategories - 3) * itemWidth // 保持倒数第3个项目在中心位置
  }
  
  // 设置偏移量
  selectorOffset.value = offset
}

// 自动轮播到下一个
function autoPlayNext() {
  const nextIndex = currentIndex.value === categories.length - 1 ? 0 : currentIndex.value + 1
  currentIndex.value = nextIndex
  visibleCenterIndex.value = nextIndex
}

// 启动自动轮播
function startAutoPlay() {
  // 清除已存在的定时器
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer)
  }
  // 每5秒切换一次
  autoPlayTimer = window.setInterval(() => {
    autoPlayNext()
  }, 5000)
}

// 停止自动轮播
function stopAutoPlay() {
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer)
    autoPlayTimer = null
  }
}

// 重置自动轮播（用户手动操作后重新开始计时）
function resetAutoPlay() {
  stopAutoPlay()
  startAutoPlay()
}

// 鼠标按下事件处理
function handleMouseDown(event: MouseEvent) {
  isDragging.value = true
  startX.value = event.clientX
  currentX.value = event.clientX
  stopAutoPlay()
}

// 鼠标移动事件处理
function handleMouseMove(event: MouseEvent) {
  if (!isDragging.value) return
  currentX.value = event.clientX
}

// 鼠标释放事件处理
function handleMouseUp() {
  if (!isDragging.value) return
  isDragging.value = false
  
  // 计算拖拽距离
  const dragDistance = currentX.value - startX.value
  
  // 如果拖拽距离超过阈值，则切换图片
  if (Math.abs(dragDistance) > dragThreshold.value) {
    if (dragDistance > 0) {
      // 向右拖拽，显示前一张
      const prevIndex = currentIndex.value === 0 ? categories.length - 1 : currentIndex.value - 1
      slideTo(prevIndex)
    } else {
      // 向左拖拽，显示后一张
      const nextIndex = currentIndex.value === categories.length - 1 ? 0 : currentIndex.value + 1
      slideTo(nextIndex)
    }
  } else {
    // 拖拽距离不足，恢复自动播放
    startAutoPlay()
  }
}

// 监听当前索引变化，重新计算偏移
watch(currentIndex, () => {
  calculateSelectorOffset()
})

// 向下滚动到主内容区域
function scrollToContent() {
  mainContentRef.value?.scrollIntoView({ 
    behavior: 'smooth',
    block: 'start'
  })
}

// 功能特点
const features = [
  { title: '海量资源', desc: '覆盖前端、后端、运维等多个领域的优质内容', icon: Files, color: '#667eea' },
  { title: '积分激励', desc: '学习获得积分，兑换更多精品课程', icon: Trophy, color: '#f5576c' },
  { title: '随时学习', desc: '支持多端访问，碎片时间高效学习', icon: Clock, color: '#43e97b' },
  { title: '互动社区', desc: '与技术大牛交流，解决学习疑惑', icon: Headset, color: '#4facfe' },
]

// 格式化时长
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 格式化数量
function formatCount(count: number): string {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + 'w'
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k'
  }
  return count.toString()
}

// 搜索
function handleSearch() {
  if (searchKeyword.value.trim()) {
    router.push({ path: '/portal/search', query: { q: searchKeyword.value } })
  }
}

// 加载数据
async function loadData() {
  videosLoading.value = true
  blogsLoading.value = true
  
  try {
    const [videos, blogs] = await Promise.all([
      videoApi.getRecommendVideos(8),
      blogApi.getHotBlogs(6)
    ])
    
    recommendVideos.value = videos
    hotBlogs.value = blogs
  } catch (error) {
    console.error('加载数据失败', error)
    ElMessage.error('加载数据失败，请稍后重试')
  } finally {
    videosLoading.value = false
    blogsLoading.value = false
  }
}

onMount(() => {
  loadData()
  // 延迟计算偏移，确保DOM已渲染
  setTimeout(() => {
    calculateSelectorOffset()
  }, 100)
  
  // 窗口大小变化时重新计算
  window.addEventListener('resize', calculateSelectorOffset)
  
  // 添加鼠标事件监听器以支持拖拽
  if (carouselTrackRef.value) {
    carouselTrackRef.value.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }
  
  // 启动自动轮播
  startAutoPlay()
})

onUnMount(() => {
  window.removeEventListener('resize', calculateSelectorOffset)
  // 清除自动轮播定时器
  stopAutoPlay()
  
  // 移除鼠标事件监听器
  if (carouselTrackRef.value) {
    carouselTrackRef.value.removeEventListener('mousedown', handleMouseDown)
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', handleMouseUp)
  }
})
</script>

<style scoped lang="scss">
.portal-home {
  /* 全局span样式，确保所有span元素无法被选中 */
  span {
    user-select: none;
  }
  
  /* 确保标签元素无法被选中 */
  :deep(.el-tag) {
    user-select: none;
  }
  
  :deep(.el-tag__content) {
    user-select: none;
  }
  
  .section-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px;
  }
  
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    
    .section-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 22px;
      font-weight: 600;
      color: var(--color-text-primary);
      
      &.center {
        justify-content: center;
        margin-bottom: 40px;
      }
    }
  }
}

// 全屏背景首屏区域
.fullscreen-hero {
  position: relative;
  width: 100%;
  height: 100vh;
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  
  // 背景图片
  .hero-background {
    position: absolute;
    inset: 0;
    background: url('/picture/preview.jpg') center/cover no-repeat;
    z-index: 0;
  }
  
  // 遮罩层
  .hero-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 1;
  }
  
  // 主内容
  .hero-content-wrapper {
    position: relative;
    z-index: 2;
    text-align: center;
    color: #fff;
    max-width: 900px;
    padding: 0 24px;
  }
  
  .hero-main-title {
    font-size: 56px;
    font-weight: 700;
    margin-bottom: 24px;
    text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    animation: fadeInUp 0.8s ease-out;
    width: 500px;
    margin: 0 auto 24px;
    user-select: none; /* 防止文本被选中 */
  }
  
  .hero-main-desc {
    font-size: 20px;
    opacity: 0.95;
    margin-bottom: 48px;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    animation: fadeInUp 1s ease-out 0.2s both;
    user-select: none; /* 防止文本被选中 */
  }
  
  .hero-main-search {
    max-width: 700px;
    margin: 0 auto 32px;
    animation: fadeInUp 1.2s ease-out 0.4s both;
    width: fit-content;
    
    :deep(.el-input__wrapper) {
      background: rgba(255, 255, 255, 0.2); /* 透明20% */
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 30px;
      transition: all 0.3s ease;
      
      &.is-focus {
        //background: rgba(255, 255, 255, 1); /* 选中时还原 */
        background: var(--color-bg-primary);
        border-color: transparent; /* 去除选中时的边框 */
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2); /* 去除内阴影边框效果 */
      }
    }
    
    :deep(.el-input) {
      width: 360px;
      transition: all 0.3s ease;
      margin: 0 auto;
    }
    
    :deep(.el-input.expanded) {
      width: 600px;
    }
    
    :deep(.el-input__prefix) {
      display: flex;
      align-items: center;
    }
    
    :deep(.search-icon) {
      color: var(--color-text-tertiary);
      font-size: 16px;
      margin-left: 12px;
    }
    
    :deep(.el-input__inner) {
      &::placeholder {
        color: var(--color-text-placeholder);
      }
      
      color: var(--color-text-primary);
    }
  }
  
  .hero-main-tags {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    font-size: 14px;
    margin-bottom: 56px;
    animation: fadeInUp 1.4s ease-out 0.6s both;
    user-select: none;
    
    .hot-tag {
      cursor: pointer;
      background: rgba(255, 255, 255, 0.25);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: #fff;
      backdrop-filter: blur(10px);
      user-select: none;
      
      &:hover {
        background: rgba(255, 255, 255, 0.35);
        transform: translateY(-2px);
      }
    }
  }
  
  .hero-main-stats {
    display: flex;
    justify-content: center;
    gap: 80px;
    animation: fadeInUp 1.6s ease-out 0.8s both;
    
    .stat-item {
      text-align: center;
      
      .stat-value {
        display: block;
        font-size: 48px;
        font-weight: 700;
        text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        user-select: none; /* 防止文本被选中 */
      }
      
      .stat-label {
        font-size: 16px;
        opacity: 0.9;
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        user-select: none; /* 防止文本被选中 */
      }
    }
  }
  
  // 向下箭头按钮
  .scroll-down-arrow {
    position: absolute;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    color: #fff;
    opacity: 0.8;
    transition: all 0.3s;
    animation: bounce 2s ease-in-out infinite;
    
    &:hover {
      opacity: 1;
      transform: translateX(-50%) translateY(-5px);
    }
    
    .arrow-icon {
      font-size: 32px;
    }
    
    .arrow-text {
      font-size: 14px;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }
  }
}

// 动画定义
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(-10px);
  }
}

// 主内容区域
.main-content {
  background: var(--color-bg-primary);
}

// 技术分类轮播区域
.tech-carousel-section {
  padding: 60px 24px;
  background: var(--color-bg-primary);
  overflow: hidden;
  
  .carousel-title {
    text-align: center;
    font-size: 28px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 48px;
  }
  
  // 轮播包裹器
  .carousel-wrapper {
    position: relative;
    height: 450px;
    margin-bottom: 40px;
    overflow: hidden;
    perspective: 1500px; // 增加透视距离，增强3D效果
  }
  
  // 轮播轨道
  .carousel-track {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    transform-style: preserve-3d; // 保持3D变换样式
    cursor: grab;
  }
  
  .carousel-track:active {
    cursor: grabbing;
  }
  
  // 轮播项
  .carousel-item {
    width: 320px;
    height: 360px;
    position: absolute;
    border-radius: 16px;
    cursor: pointer;
    overflow: hidden;
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
    // 3D轮播动效
    transition: 
      transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94),
      opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94),
      z-index 0s 0.3s;
    will-change: transform, opacity;
    display: flex;
    justify-content: center;
    align-items: center;
    user-select: none; // 防止拖拽时选中文本
    
    .carousel-item-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      color: #fff;
      text-align: center;
      padding: 24px;
    }
    
    .carousel-item-name {
      font-size: 24px;
      font-weight: 600;
      margin-top: 16px;
    }
    
    .carousel-item-desc {
      font-size: 16px;
      opacity: 0.9;
      margin-top: 16px;
      max-width: 280px;
      line-height: 1.5;
    }
  }
  
  // 底部分类选择器
  .category-selector {
    position: relative;
    max-width: 800px;
    margin: 0 auto;
    overflow: hidden;
    padding: 16px 0;
    
    &::before,
    &::after {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      width: 80px;
      z-index: 10;
      pointer-events: none;
    }
    
    &::before {
      left: 0;
      background: linear-gradient(to right, var(--color-bg-primary), transparent);
    }
    
    &::after {
      right: 0;
      background: linear-gradient(to left, var(--color-bg-primary), transparent);
    }
  }
  
  .selector-track {
    display: flex;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    padding: 8px 0;
  }
  
  .selector-item {
    flex-shrink: 0;
    width: 140px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 16px;
    border-radius: 30px;
    cursor: pointer;
    transition: all 0.3s;
    background: transparent;
    
    &:hover {
      background: var(--color-bg-secondary);
    }
    
    &.active {
      background: var(--color-bg-secondary);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      
      .selector-icon {
        color: #fff;
      }
      
      .selector-name {
        color: var(--color-text-primary);
        font-weight: 600;
      }
    }
    
    .selector-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-tertiary);
      transition: all 0.3s;
    }
    
    .selector-name {
      font-size: 14px;
      color: var(--color-text-secondary);
      white-space: nowrap;
      transition: all 0.3s;
    }
  }
}

// 视频区域
.video-section {
  padding: 48px 24px;
  
  .video-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }
  
  .video-card {
    background: var(--color-bg-primary);
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
      
      .video-cover .video-play-mask {
        opacity: 1;
      }
    }
    
    .video-cover {
      position: relative;
      aspect-ratio: 16 / 9;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .video-duration {
        position: absolute;
        bottom: 8px;
        right: 8px;
        padding: 2px 8px;
        background: rgba(0, 0, 0, 0.7);
        color: #fff;
        font-size: 12px;
        border-radius: 4px;
      }
      
      .video-play-mask {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        opacity: 0;
        transition: opacity 0.3s;
      }
    }
    
    .video-info {
      padding: 16px;
      
      .video-title {
        font-size: 15px;
        font-weight: 500;
        color: var(--color-text-primary);
        margin-bottom: 10px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        line-height: 1.4;
        height: 42px;
      }
      
      .video-meta {
        display: flex;
        gap: 16px;
        font-size: 13px;
        color: var(--color-text-tertiary);
        margin-bottom: 12px;
        
        span {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }
      
      .video-author {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: var(--color-text-secondary);
      }
    }
  }
}

// 博客区域
.blog-section {
  padding: 48px 24px;
  background: var(--color-bg-primary);
  
  .blog-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
  
  .blog-card {
    background: var(--color-bg-secondary);
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
    }
    
    .blog-cover {
      aspect-ratio: 16 / 9;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    
    .blog-content {
      padding: 20px;
      
      .blog-tags {
        display: flex;
        gap: 8px;
        margin-bottom: 12px;
      }
      
      .blog-title {
        font-size: 17px;
        font-weight: 600;
        color: var(--color-text-primary);
        margin-bottom: 10px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        line-height: 1.4;
      }
      
      .blog-summary {
        font-size: 14px;
        color: var(--color-text-secondary);
        margin-bottom: 16px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        line-height: 1.6;
      }
      
      .blog-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        
        .blog-author {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--color-text-secondary);
        }
        
        .blog-stats {
          display: flex;
          gap: 12px;
          font-size: 12px;
          color: var(--color-text-tertiary);
          
          span {
            display: flex;
            align-items: center;
            gap: 4px;
          }
        }
      }
    }
  }
}

// 功能特点
.feature-section {
  padding: 64px 24px;
  
  .feature-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }
  
  .feature-card {
    text-align: center;
    padding: 32px 24px;
    background: var(--color-bg-primary);
    border-radius: 16px;
    transition: all 0.3s;
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
    }
    
    .feature-icon {
      width: 72px;
      height: 72px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      color: #fff;
    }
    
    h3 {
      font-size: 18px;
      font-weight: 600;
      color: var(--color-text-primary);
      margin-bottom: 10px;
    }
    
    p {
      font-size: 14px;
      color: var(--color-text-secondary);
      line-height: 1.6;
    }
  }
}

// 响应式
@media (max-width: 1024px) {
  .video-section .video-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .blog-section .blog-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .feature-section .feature-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: 48px 16px;
    
    .hero-title {
      font-size: 28px;
    }
    
    .hero-desc {
      font-size: 15px;
    }
    
    .hero-stats {
      gap: 32px;
      
      .stat-value {
        font-size: 24px;
      }
    }
  }
  
  .tech-carousel-section {
    .carousel-title {
      font-size: 20px;
      margin-bottom: 32px;
    }
    
    .carousel-wrapper {
      height: 300px;
    }
    
    .carousel-item.carousel-item-center {
      width: 280px;
      height: 260px;
    }
    
    .carousel-item.carousel-item-left {
      width: 140px;
      height: 200px;
      left: calc(50% - 260px);
    }
    
    .carousel-item.carousel-item-right {
      width: 140px;
      height: 200px;
      right: calc(50% - 260px);
    }
    
    // 移动端分类选择器样式
    .category-selector {
      max-width: 100%;
      padding: 8px 0;
      
      &::before,
      &::after {
        width: 40px; // 减小渐变遮罩的宽度
      }
    }
    
    .selector-item {
      width: 100px; // 减小移动端选项宽度
      padding: 8px 12px;
      
      .selector-icon {
        width: 28px;
        height: 28px;
      }
      
      .selector-name {
        font-size: 12px;
      }
    }
  }
  
  .video-section .video-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .blog-section .blog-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .video-section .video-grid,
  .feature-section .feature-grid {
    grid-template-columns: 1fr;
  }
}
</style>
