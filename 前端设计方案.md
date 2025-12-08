# Vue 3 全栈平台前端详细设计方案

## 一、整体架构设计方案

### 1.1 技术栈选型

**核心框架:**
- **Vue 3** (组合式API + TypeScript)
- **Vite 4.x** (下一代构建工具)
- **Pinia** (状态管理，替代Vuex)
- **Vue Router 4** (路由管理)
- **Element Plus** (UI组件库，内置暗黑主题支持)
- **UnoCSS** 或 **TailwindCSS 3** (原子化CSS框架)

**辅助技术栈:**
- **TypeScript 5.x** (类型安全)
- **Axios** (HTTP客户端，配合拦截器)
- **VueUse** (组合式函数工具库)
- **VeeValidate 4** (表单验证)
- **ECharts 5** (数据可视化)
- **Socket.IO Client** (实时通信)
- **Day.js** (日期处理)
- **Lodash-es** (工具函数)

### 1.2 项目架构模式

**分层架构:**
```
src/
├── api/                    # API接口管理
│   ├── modules/           # 按模块划分的API
│   └── index.ts           # API统一导出
├── assets/                # 静态资源
├── components/            # 公共组件
│   ├── base/             # 基础UI组件
│   ├── business/         # 业务组件
│   └── layout/           # 布局组件
├── composables/           # 组合式函数
│   ├── useAuth.ts        # 认证相关逻辑
│   ├── useTheme.ts       # 主题管理
│   └── useTable.ts       # 表格通用逻辑
├── directives/            # 自定义指令
├── layouts/               # 布局组件
├── router/                # 路由配置
│   ├── guard.ts          # 路由守卫
│   ├── routes/           # 路由定义
│   └── index.ts
├── stores/                # Pinia状态管理
│   ├── modules/          # 模块化store
│   └── index.ts
├── styles/                # 全局样式
│   ├── theme/            # 主题变量
│   ├── utils/            # 工具类
│   └── global.scss       # 全局样式
├── types/                 # TypeScript类型定义
├── utils/                 # 工具函数
├── views/                 # 页面组件
│   ├── auth/             # 认证相关
│   ├── admin/            # 后台管理
│   ├── front/            # 前台展示
│   └── common/           # 通用页面
└── App.vue
```

## 二、路由与权限设计方案

### 2.1 动态路由配置

```typescript
// 路由元信息结构
interface RouteMeta {
  title: string;              // 页面标题
  requiresAuth: boolean;      // 需要登录
  roles?: string[];           // 允许访问的角色
  permissions?: string[];     // 需要的权限
  keepAlive?: boolean;        // 是否缓存
  icon?: string;              // 菜单图标
  hidden?: boolean;           // 是否隐藏菜单
  breadcrumb?: boolean;       // 是否显示面包屑
}

// 路由守卫流程
1. 检查token有效性
2. 获取用户权限信息
3. 过滤动态路由
4. 添加路由到router
5. 权限拦截检查
```

### 2.2 权限控制方案

**RBAC权限模型:**
- 用户 → 角色 → 权限
- 按钮级权限控制
- 数据权限控制
- 动态菜单生成

## 三、主题系统设计方案

### 3.1、色彩系统架构设计

#### 3.1.1 设计原则与架构

**设计原则:**
- **一致性**: 所有组件遵循相同的色彩规则
- **可访问性**: WCAG 2.1 AA标准，对比度4.5:1以上
- **层次性**: 明度层级清晰，信息层级分明
- **情感化**: 色彩传达品牌情感和交互反馈

**架构层级:**
```
色彩系统架构
├── 基础色板 (Base Colors)
│   ├── 中性色 (Neutral)
│   ├── 品牌色 (Brand)
│   └── 功能色 (Functional)
├── 语义色板 (Semantic Colors)
│   ├── 主色 (Primary)
│   ├── 成功 (Success)
│   ├── 警告 (Warning)
│   ├── 错误 (Error)
│   └── 信息 (Info)
└── 主题色板 (Theme Palettes)
    ├── 亮色主题
    └── 暗黑主题
```

#### 3.1.2 色彩空间选择

**HSL色彩模型优势:**
- 直观: 色相(H)、饱和度(S)、明度(L)易于理解
- 易于计算: 便于生成派生颜色
- 一致性: 保持色相不变，调整饱和度和明度

### 3.2、基础色板设计 (亮色主题)

#### 3.2.1 中性色系统

**灰度色阶 (9级明度系统):**
```scss
// 中性色 - 灰度系统
:root {
  // 基础中性色
  --color-neutral-50: #fafafa;   // 最浅灰，用于背景
  --color-neutral-100: #f5f5f5;  // 浅灰背景
  --color-neutral-200: #eeeeee;  // 分割线/边框
  --color-neutral-300: #e0e0e0;  // 次级边框
  --color-neutral-400: #bdbdbd;  // 占位文字
  --color-neutral-500: #9e9e9e;  // 辅助文字
  --color-neutral-600: #757575;  // 常规文字
  --color-neutral-700: #616161;  // 强调文字
  --color-neutral-800: #424242;  // 标题文字
  --color-neutral-900: #212121;  // 主要文字
  
  // 纯黑与纯白（慎用）
  --color-black: #000000;
  --color-white: #ffffff;
}

// 使用示例
.background-primary {
  background-color: var(--color-neutral-50);
}

.background-secondary {
  background-color: var(--color-neutral-100);
}

.border-light {
  border-color: var(--color-neutral-200);
}

.text-primary {
  color: var(--color-neutral-900);
}

.text-secondary {
  color: var(--color-neutral-600);
}

.text-placeholder {
  color: var(--color-neutral-400);
}
```

#### 3.2.2 品牌色设计

**品牌色系:**
```scss
// 品牌色 - 基于HSL动态生成
:root {
  // 主品牌色 (蓝色系示例)
  --color-brand-hue: 220;        // 色相
  --color-brand-saturation: 75%; // 饱和度
  --color-brand-lightness: 55%;  // 明度
  
  // 品牌色阶 (10级)
  --color-brand-50: hsl(var(--color-brand-hue), var(--color-brand-saturation), 95%);
  --color-brand-100: hsl(var(--color-brand-hue), var(--color-brand-saturation), 90%);
  --color-brand-200: hsl(var(--color-brand-hue), var(--color-brand-saturation), 80%);
  --color-brand-300: hsl(var(--color-brand-hue), var(--color-brand-saturation), 70%);
  --color-brand-400: hsl(var(--color-brand-hue), var(--color-brand-saturation), 60%);
  --color-brand-500: hsl(var(--color-brand-hue), var(--color-brand-saturation), 50%);
  --color-brand-600: hsl(var(--color-brand-hue), var(--color-brand-saturation), 40%);
  --color-brand-700: hsl(var(--color-brand-hue), var(--color-brand-saturation), 30%);
  --color-brand-800: hsl(var(--color-brand-hue), var(--color-brand-saturation), 20%);
  --color-brand-900: hsl(var(--color-brand-hue), var(--color-brand-saturation), 10%);
  
  // 辅助品牌色 (橙色系示例)
  --color-accent-hue: 35;
  --color-accent-saturation: 85%;
  --color-accent-lightness: 55%;
}
```

#### 3.2.3 功能色设计

**语义化颜色系统:**
```scss
// 功能色 - 基于HSL的动态色板
:root {
  // 成功色 (绿色)
  --color-success-hue: 145;
  --color-success-saturation: 70%;
  --color-success-lightness: 45%;
  
  // 警告色 (橙色)
  --color-warning-hue: 35;
  --color-warning-saturation: 85%;
  --color-warning-lightness: 50%;
  
  // 错误色 (红色)
  --color-error-hue: 0;
  --color-error-saturation: 75%;
  --color-error-lightness: 50%;
  
  // 信息色 (蓝色)
  --color-info-hue: 200;
  --color-info-saturation: 70%;
  --color-info-lightness: 55%;
  
  // 链接色
  --color-link-hue: 210;
  --color-link-saturation: 75%;
  --color-link-lightness: 50%;
}

// 动态生成功能色阶
@function generate-functional-colors($hue, $saturation, $lightness) {
  @return (
    50: hsl($hue, $saturation, 95%),
    100: hsl($hue, $saturation, 90%),
    200: hsl($hue, $saturation, 80%),
    300: hsl($hue, $saturation, 70%),
    400: hsl($hue, $saturation, 60%),
    500: hsl($hue, $saturation, $lightness),
    600: hsl($hue, $saturation, 40%),
    700: hsl($hue, $saturation, 30%),
    800: hsl($hue, $saturation, 20%),
    900: hsl($hue, $saturation, 10%)
  );
}
```

### 3、暗黑主题色板优化设计

#### 3.3.1 暗黑主题设计原则

**核心原则:**
1. **避免纯黑**: 使用深灰(#121212)作为基础背景
2. **层次分明**: 表面层级明度递增(0-8级)
3. **降低饱和**: 暗色背景下降低颜色饱和度
4. **提高对比**: 确保文字可读性

#### 3.3.2 暗黑主题色板实现

```scss
// 暗黑主题色板
[data-theme="dark"] {
  // ========== 中性色调整 ==========
  // 反转中性色阶，使用Material Design深色主题规范
  --color-neutral-50: #1a1a1a;   // 最深灰，用于最深背景
  --color-neutral-100: #242424;  // 暗色背景
  --color-neutral-200: #2d2d2d;  // 卡片背景
  --color-neutral-300: #3a3a3a;  // 表面层级1
  --color-neutral-400: #484848;  // 表面层级2
  --color-neutral-500: #5a5a5a;  // 分割线/边框
  --color-neutral-600: #757575;  // 禁用状态文字
  --color-neutral-700: #9e9e9e;  // 次要文字
  --color-neutral-800: #bdbdbd;  // 主要文字
  --color-neutral-900: #e0e0e0;  // 强调文字
  
  // ========== 品牌色调整 ==========
  // 降低饱和度，提高明度以适应暗色背景
  --color-brand-saturation: 50%;  // 降低饱和度
  --color-brand-lightness: 65%;   // 提高明度
  
  // 重新计算品牌色阶
  --color-brand-50: hsl(var(--color-brand-hue), var(--color-brand-saturation), 15%);
  --color-brand-100: hsl(var(--color-brand-hue), var(--color-brand-saturation), 20%);
  --color-brand-200: hsl(var(--color-brand-hue), var(--color-brand-saturation), 25%);
  --color-brand-300: hsl(var(--color-brand-hue), var(--color-brand-saturation), 35%);
  --color-brand-400: hsl(var(--color-brand-hue), var(--color-brand-saturation), 45%);
  --color-brand-500: hsl(var(--color-brand-hue), var(--color-brand-saturation), 55%);
  --color-brand-600: hsl(var(--color-brand-hue), var(--color-brand-saturation), 65%);
  --color-brand-700: hsl(var(--color-brand-hue), var(--color-brand-saturation), 75%);
  --color-brand-800: hsl(var(--color-brand-hue), var(--color-brand-saturation), 85%);
  --color-brand-900: hsl(var(--color-brand-hue), var(--color-brand-saturation), 95%);
  
  // ========== 功能色调整 ==========
  // 统一降低饱和度，提高明度
  --color-success-saturation: 60%;
  --color-success-lightness: 55%;
  
  --color-warning-saturation: 75%;
  --color-warning-lightness: 55%;
  
  --color-error-saturation: 65%;
  --color-error-lightness: 55%;
  
  --color-info-saturation: 60%;
  --color-info-lightness: 60%;
  
  --color-link-saturation: 65%;
  --color-link-lightness: 65%;
  
  // ========== 特殊调整 ==========
  // 阴影系统替换为发光效果
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.5);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.3);
  --shadow-xl: 0 12px 48px rgba(0, 0, 0, 0.25);
  
  // 发光效果（用于焦点状态）
  --glow-primary: 0 0 0 3px rgba(var(--color-brand-500-rgb), 0.2);
  --glow-success: 0 0 0 3px rgba(var(--color-success-500-rgb), 0.2);
  
  // 图片/视频暗色遮罩
  --image-brightness: 0.9;
  --image-contrast: 1.1;
  
  // 滚动条样式
  --scrollbar-track: var(--color-neutral-300);
  --scrollbar-thumb: var(--color-neutral-500);
  --scrollbar-thumb-hover: var(--color-neutral-600);
}
```

#### 3.3 表面层级系统 (Surface Elevation)

```scss
// 表面层级系统 - 基于Material Design
:root {
  // 亮色主题表面层级
  --surface-0: var(--color-white);          // 基础表面
  --surface-1: var(--color-neutral-50);     // 一级表面
  --surface-2: var(--color-neutral-100);    // 二级表面
  --surface-3: var(--color-neutral-150);    // 三级表面
  --surface-4: var(--color-neutral-200);    // 四级表面
  
  // 表面阴影
  --elevation-1: var(--shadow-sm);
  --elevation-2: var(--shadow-md);
  --elevation-3: var(--shadow-lg);
  --elevation-4: var(--shadow-xl);
}

[data-theme="dark"] {
  // 暗色主题表面层级 (明度递增)
  --surface-0: var(--color-neutral-50);     // 0dp: 背景
  --surface-1: var(--color-neutral-100);    // 1dp: 卡片/对话框
  --surface-2: var(--color-neutral-150);    // 2dp: 模态框
  --surface-3: var(--color-neutral-200);    // 3dp: 侧边栏
  --surface-4: var(--color-neutral-250);    // 4dp: 导航栏
  
  // 暗色主题使用发光替代阴影
  --elevation-1: 0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2);
  --elevation-2: 0 3px 6px rgba(0, 0, 0, 0.25), 0 2px 4px rgba(0, 0, 0, 0.2);
  --elevation-3: 0 10px 20px rgba(0, 0, 0, 0.2), 0 6px 6px rgba(0, 0, 0, 0.15);
  --elevation-4: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.2);
}
```

### 3.4、主题管理系统实现

#### 3.4.1 TypeScript 主题管理器

```typescript
// src/composables/useTheme.ts
import { ref, computed, watch, onMounted } from 'vue'

// 主题模式定义
export type ThemeMode = 'light' | 'dark' | 'auto'

// 主题配置接口
export interface ThemeConfig {
  mode: ThemeMode
  primaryColor: string  // 主色十六进制值
  borderRadius: number  // 圆角基数
  fontSize: {
    base: string       // 基础字体大小
    scale: number[]    // 字体缩放比例
  }
  spacing: {
    unit: number       // 间距单位
    scale: number[]    // 间距比例
  }
  customColors?: Record<string, string> // 自定义颜色
}

// 默认亮色主题配置
const defaultLightTheme: ThemeConfig = {
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

// 默认暗黑主题配置
const defaultDarkTheme: ThemeConfig = {
  ...defaultLightTheme,
  mode: 'dark',
  primaryColor: '#58A6FF'
}

export function useTheme() {
  // 当前主题模式
  const themeMode = ref<ThemeMode>('light')
  
  // 主题配置
  const themeConfig = ref<ThemeConfig>(defaultLightTheme)
  
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
  }
  
  // 切换主题模式
  const toggleTheme = (mode: ThemeMode) => {
    themeMode.value = mode
    localStorage.setItem('theme-mode', mode)
    applyTheme()
  }
  
  // 应用主题到DOM
  const applyTheme = () => {
    const html = document.documentElement
    
    // 设置主题属性
    if (themeMode.value === 'auto') {
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      html.setAttribute('data-theme', isSystemDark ? 'dark' : 'light')
    } else {
      html.setAttribute('data-theme', themeMode.value)
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
    const root = document.documentElement
    const config = isDark.value ? defaultDarkTheme : defaultLightTheme
    
    // 更新主题配置
    themeConfig.value = config
    
    // 设置CSS变量
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
        html.setAttribute('data-theme', e.matches ? 'dark' : 'light')
        updateCSSVariables()
      }
    }
    mediaQuery.addEventListener('change', handler)
    
    // 返回清理函数
    return () => mediaQuery.removeEventListener('change', handler)
  }
  
  // 自定义主题颜色
  const setPrimaryColor = (color: string) => {
    themeConfig.value.primaryColor = color
    updateCSSVariables()
    
    // 保存到用户配置
    saveUserConfig()
  }
  
  // 保存用户配置到后端
  const saveUserConfig = async () => {
    try {
      // TODO: 调用API保存用户主题配置
    } catch (error) {
      console.error('保存主题配置失败:', error)
    }
  }
  
  // 加载用户配置
  const loadUserConfig = async () => {
    try {
      // TODO: 从API加载用户主题配置
    } catch (error) {
      console.error('加载主题配置失败:', error)
    }
  }
  
  // 组件挂载时初始化
  onMounted(() => {
    initTheme()
    const cleanup = watchSystemTheme()
    
    // 组件卸载时清理
    return cleanup
  })
  
  return {
    themeMode,
    themeConfig,
    isDark,
    toggleTheme,
    setPrimaryColor,
    initTheme
  }
}
```

#### 3.4.2 主题切换组件

```vue
<!-- src/components/ThemeToggle.vue -->
<template>
  <div class="theme-toggle">
    <el-dropdown 
      trigger="click" 
      @command="handleThemeChange"
      placement="bottom-end"
    >
      <div class="theme-toggle-trigger">
        <el-icon :size="20" class="theme-icon">
          <Sunny v-if="themeMode === 'light'" />
          <Moon v-else />
        </el-icon>
        <span class="theme-text">主题</span>
      </div>
      
      <template #dropdown>
        <el-dropdown-menu class="theme-menu">
          <el-dropdown-item 
            :command="'light'" 
            :class="{ active: themeMode === 'light' }"
          >
            <div class="theme-option">
              <el-icon><Sunny /></el-icon>
              <span>亮色主题</span>
              <el-icon v-if="themeMode === 'light'" class="check-icon">
                <Check />
              </el-icon>
            </div>
          </el-dropdown-item>
          
          <el-dropdown-item 
            :command="'dark'" 
            :class="{ active: themeMode === 'dark' }"
          >
            <div class="theme-option">
              <el-icon><Moon /></el-icon>
              <span>暗黑主题</span>
              <el-icon v-if="themeMode === 'dark'" class="check-icon">
                <Check />
              </el-icon>
            </div>
          </el-dropdown-item>
          
          <el-dropdown-item 
            :command="'auto'" 
            :class="{ active: themeMode === 'auto' }"
          >
            <div class="theme-option">
              <el-icon><Setting /></el-icon>
              <span>跟随系统</span>
              <el-icon v-if="themeMode === 'auto'" class="check-icon">
                <Check />
              </el-icon>
            </div>
          </el-dropdown-item>
          
          <el-divider v-if="showColorPicker" />
          
          <el-dropdown-item 
            v-if="showColorPicker" 
            class="color-picker-item"
          >
            <div class="color-picker-wrapper">
              <span class="color-picker-label">主色</span>
              <el-color-picker
                v-model="primaryColor"
                :predefine="predefineColors"
                size="small"
                @change="handleColorChange"
              />
            </div>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Sunny, Moon, Check, Setting } from '@element-plus/icons-vue'
import { useTheme } from '@/composables/useTheme'

// Props
interface Props {
  showColorPicker?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showColorPicker: true
})

// 主题管理
const { themeMode, toggleTheme, setPrimaryColor } = useTheme()

// 预定义颜色
const predefineColors = ref([
  '#409EFF', // Element Plus 蓝
  '#67C23A', // 绿
  '#E6A23C', // 橙
  '#F56C6C', // 红
  '#909399', // 灰
  '#9B59B6', // 紫
  '#3498DB', // 天蓝
  '#1ABC9C', // 青绿
  '#F39C12', // 橙黄
  '#E74C3C', // 红橙
])

// 主色选择
const primaryColor = ref('#409EFF')

// 主题切换
const handleThemeChange = (mode: 'light' | 'dark' | 'auto') => {
  toggleTheme(mode)
}

// 颜色改变
const handleColorChange = (color: string) => {
  setPrimaryColor(color)
}

// 计算主题图标
const themeIcon = computed(() => {
  switch (themeMode.value) {
    case 'light': return Sunny
    case 'dark': return Moon
    default: return Setting
  }
})
</script>

<style scoped lang="scss">
.theme-toggle {
  .theme-toggle-trigger {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: var(--color-neutral-100);
    }
    
    .theme-text {
      font-size: 14px;
      color: var(--color-text-primary);
    }
    
    .theme-icon {
      color: var(--color-text-secondary);
    }
  }
}

:deep(.theme-menu) {
  width: 180px;
  padding: 8px;
  
  .el-dropdown-menu__item {
    border-radius: 4px;
    margin: 2px 0;
    
    &.active {
      background-color: var(--color-primary-light-9);
      color: var(--color-primary);
      
      &:hover {
        background-color: var(--color-primary-light-8);
      }
    }
    
    .theme-option {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      
      .check-icon {
        color: var(--color-primary);
      }
    }
  }
  
  .color-picker-item {
    cursor: default;
    &:hover {
      background-color: transparent !important;
    }
    
    .color-picker-wrapper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      
      .color-picker-label {
        font-size: 14px;
        color: var(--color-text-secondary);
      }
    }
  }
}
</style>
```

### 3.5、主题工具函数

#### 3.5.1 颜色工具函数

```typescript
// src/utils/colorUtils.ts

/**
 * 十六进制颜色转HSL
 */
export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  // 移除#号
  hex = hex.replace('#', '')
  
  // 解析RGB
  let r, g, b
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16)
    g = parseInt(hex[1] + hex[1], 16)
    b = parseInt(hex[2] + hex[2], 16)
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16)
    g = parseInt(hex.substring(2, 4), 16)
    b = parseInt(hex.substring(4, 6), 16)
  } else {
    throw new Error('Invalid hex color')
  }
  
  // 转为0-1范围
  r /= 255
  g /= 255
  b /= 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2
  
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
}

/**
 * HSL转十六进制颜色
 */
export function hslToHex(h: number, s: number, l: number): string {
  s /= 100
  l /= 100
  
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs((h / 60) % 2 - 1))
  const m = l - c / 2
  
  let r = 0, g = 0, b = 0
  
  if (0 <= h && h < 60) {
    r = c; g = x; b = 0
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x
  }
  
  r = Math.round((r + m) * 255)
  g = Math.round((g + m) * 255)
  b = Math.round((b + m) * 255)
  
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

/**
 * 生成颜色色阶
 */
export function generateColorScale(
  baseColor: string,
  steps: number = 10,
  darkMode: boolean = false
): string[] {
  const { h, s, l } = hexToHsl(baseColor)
  const colors: string[] = []
  
  // 根据模式调整生成策略
  if (darkMode) {
    // 暗色模式：从深到浅
    for (let i = 0; i < steps; i++) {
      const lightness = 10 + (i * (90 / steps))
      const saturation = Math.max(20, s - (i * (s - 20) / steps))
      colors.push(hslToHex(h, saturation, lightness))
    }
  } else {
    // 亮色模式：从浅到深
    for (let i = 0; i < steps; i++) {
      const lightness = 95 - (i * (85 / steps))
      const saturation = s + (i * (100 - s) / steps)
      colors.push(hslToHex(h, saturation, lightness))
    }
  }
  
  return colors
}

/**
 * 检查颜色对比度
 */
export function checkContrastRatio(
  foreground: string,
  background: string
): number {
  // 计算相对亮度
  const getLuminance = (color: string): number => {
    const rgb = parseInt(color.replace('#', ''), 16)
    const r = ((rgb >> 16) & 0xff) / 255
    const g = ((rgb >> 8) & 0xff) / 255
    const b = (rgb & 0xff) / 255
    
    const sRGB = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2]
  }
  
  const l1 = getLuminance(foreground)
  const l2 = getLuminance(background)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * 获取可访问的文本颜色
 */
export function getAccessibleTextColor(
  backgroundColor: string
): '#000000' | '#ffffff' {
  const whiteContrast = checkContrastRatio('#ffffff', backgroundColor)
  const blackContrast = checkContrastRatio('#000000', backgroundColor)
  
  // WCAG AA标准要求4.5:1
  return whiteContrast >= 4.5 ? '#ffffff' : '#000000'
}
```

#### 3.5.2 主题辅助函数

```typescript
// src/utils/themeUtils.ts

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
export function saveThemeConfig(config: any): void {
  localStorage.setItem('theme-config', JSON.stringify(config))
}

/**
 * 加载主题配置
 */
export function loadThemeConfig(): any {
  const config = localStorage.getItem('theme-config')
  return config ? JSON.parse(config) : null
}

/**
 * 生成主题CSS变量对象
 */
export function generateThemeVariables(
  config: any,
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
  
  return variables
}
```

### 3.6、主题样式工具类

```scss
// src/styles/theme/_utilities.scss

// ========== 主题工具类 ==========

// 主题切换动画
.theme-transition {
  &-enter-active,
  &-leave-active {
    transition: 
      background-color 0.3s ease,
      border-color 0.3s ease,
      color 0.3s ease,
      opacity 0.3s ease,
      box-shadow 0.3s ease;
  }
}

// 主题特定的工具类
[data-theme="light"] {
  // 亮色主题特定的工具类
  .bg-surface {
    background-color: var(--color-neutral-50);
  }
  
  .text-primary {
    color: var(--color-neutral-900);
  }
  
  .border-light {
    border-color: var(--color-neutral-200);
  }
  
  // 图片亮度正常
  img {
    filter: brightness(1);
  }
}

[data-theme="dark"] {
  // 暗色主题特定的工具类
  .bg-surface {
    background-color: var(--color-neutral-100);
  }
  
  .text-primary {
    color: var(--color-neutral-900);
  }
  
  .border-light {
    border-color: var(--color-neutral-500);
  }
  
  // 图片降低亮度
  img,
  video {
    filter: brightness(var(--image-brightness)) contrast(var(--image-contrast));
  }
  
  // 图片遮罩
  .image-mask {
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.1) 0%,
        rgba(0, 0, 0, 0.3) 100%
      );
      pointer-events: none;
    }
  }
}

// 通用主题工具类
.theme-aware {
  // 背景色
  &-bg-primary {
    background-color: var(--color-bg-primary);
  }
  
  &-bg-secondary {
    background-color: var(--color-bg-secondary);
  }
  
  // 文字颜色
  &-text-primary {
    color: var(--color-text-primary);
  }
  
  &-text-secondary {
    color: var(--color-text-secondary);
  }
  
  &-text-disabled {
    color: var(--color-text-disabled);
  }
  
  // 边框
  &-border {
    border-color: var(--color-border);
  }
  
  &-border-light {
    border-color: var(--color-border-light);
  }
  
  // 阴影
  &-shadow-sm {
    box-shadow: var(--shadow-sm);
  }
  
  &-shadow-md {
    box-shadow: var(--shadow-md);
  }
  
  &-shadow-lg {
    box-shadow: var(--shadow-lg);
  }
  
  // 滚动条
  &-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track);
    
    &::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    
    &::-webkit-scrollbar-track {
      background: var(--scrollbar-track);
      border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: var(--scrollbar-thumb);
      border-radius: 4px;
      
      &:hover {
        background: var(--scrollbar-thumb-hover);
      }
    }
  }
}

// 响应式主题工具类
@media (prefers-color-scheme: dark) {
  .theme-auto {
    // 系统偏好暗色时的样式
    img {
      filter: brightness(0.9);
    }
  }
}

@media (prefers-color-scheme: light) {
  .theme-auto {
    // 系统偏好亮色时的样式
    img {
      filter: brightness(1);
    }
  }
}
```



## 四、模块功能详细设计

### 4.1 登录/注册模块

**功能设计:**
1. 多账号登录（用户名/邮箱/手机号）
2. 第三方登录（微信、GitHub、Google）
3. 图形验证码 + 滑动验证
4. 登录设备管理
5. 双因素认证（2FA）
6. 密码强度检查

**安全策略:**
- 登录失败锁定机制
- JWT自动续期
- 会话管理
- 登录日志记录

### 4.2 后台管理系统模块设计

#### 4.2.1 视频管理模块

**功能架构:**

```
视频管理
├── 视频上传
│   ├── 多格式支持(mp4, mov, avi, mkv)
│   ├── 分片上传 + 断点续传
│   ├── 实时转码预览
│   ├── 水印添加(文字/图片)
│   └── 智能分类(AI标签识别)
├── 视频列表
│   ├── 多维度筛选(分类、状态、时间)
│   ├── 批量操作(删除、移动、修改状态)
│   ├── 视频预览(缩略图/快速播放)
│   └── 数据统计(播放量、时长)
├── 视频编辑
│   ├── 基础信息编辑
│   ├── 封面截取/上传
│   ├── 章节标记
│   ├── 字幕管理(上传/编辑)
│   └── 权限设置(公开/私有/密码)
├── 分类管理
│   ├── 多级分类树
│   ├── 拖拽排序
│   └── 分类统计
└── 审核管理
    ├── AI预审核
    ├── 人工审核队列
    ├── 审核日志
    └── 违规处理
```

**优化方案:**

- 视频封面自动生成(从视频中提取关键帧)
- 智能标签推荐系统
- 视频质量检测(分辨率、码率)
- 版权检测功能
- CDN分发管理

#### 4.2.2 技术博客内容管理

**功能架构:**

```
博客管理
├── 编辑器系统
│   ├── 双模式: 富文本/Markdown
│   ├── 实时保存草稿
│   ├── 版本历史管理
│   ├── 代码高亮(支持多种语言)
│   ├── 图片粘贴/拖拽上传
│   └── 文章模板系统
├── 内容管理
│   ├── 文章状态流: 草稿 → 审核 → 发布
│   ├── 定时发布功能
│   ├── SEO优化工具
│   ├── 阅读量/点赞统计
│   └── 评论管理
├── 分类标签
│   ├── 多级分类
│   ├── 标签云管理
│   └── 系列文章管理
└── 统计与分析
    ├── 阅读趋势分析
    ├── 用户行为分析
    ├── 热门文章排行
    └── SEO效果监控
```

**优化方案:**

- 文章质量检测(可读性、SEO评分)
- 智能推荐相关文章
- 多语言翻译支持
- 导出功能(PDF、Word、Markdown)

#### 4.2.3 人员管理模块

**功能架构:**

```
人员管理
├── 用户管理
│   ├── 用户信息(基础资料、联系方式)
│   ├── 角色权限分配
│   ├── 部门/团队管理
│   ├── 用户状态管理(激活/禁用)
│   └── 登录日志审计
├── 角色权限
│   ├── RBAC权限模型
│   ├── 权限点粒度控制
│   ├── 角色继承与组合
│   └── 权限变更日志
├── 部门架构
│   ├── 树形组织结构
│   ├── 部门负责人设置
│   └── 部门统计分析
└── 用户行为
    ├── 操作日志追踪
    ├── 活跃度分析
    ├── 贡献度统计
    └── 异常行为检测
```

#### 4.2.4 系统字典管理

**功能架构:**

```
字典管理
├── 字典分类
│   ├── 系统字典(不可修改)
│   ├── 业务字典
│   └── 用户自定义字典
├── 字典项管理
│   ├── 键值对管理
│   ├── 多语言支持
│   ├── 状态控制(启用/禁用)
│   └── 字典项排序
├── 字典使用
│   ├── 前端组件自动绑定
│   ├── 缓存机制(减少请求)
│   └── 版本管理
└── 导入导出
    ├── Excel导入
    ├── JSON导出
    └── 批量操作
```

#### 4.2.5 积分管理系统

**功能架构:**

```
积分系统
├── 积分规则
│   ├── 获取规则(登录、发帖、评论)
│   ├── 消费规则(兑换、购买)
│   ├── 等级体系
│   └── 有效期管理
├── 积分流水
│   ├── 实时流水记录
│   ├── 积分变动统计
│   ├── 异常检测
│   └── 流水导出
├── 积分商城
│   ├── 商品管理(虚拟/实物)
│   ├── 兑换管理
│   ├── 库存管理
│   └── 订单处理
└── 排行榜
    ├── 日/周/月榜
    ├── 分类排行
    └── 成就系统
```

#### 4.2.6 系统监控模块

**功能架构:**

```
系统监控
├── 服务器监控
│   ├── 实时状态(CPU、内存、磁盘)
│   ├── 网络流量监控
│   ├── 服务健康检查
│   └── 报警阈值设置
├── 应用监控
│   ├── 前端性能监控(FP、FCP、LCP)
│   ├── 错误追踪(Sentry集成)
│   ├── API调用监控
│   └── 用户会话追踪
├── 日志管理
│   ├── 日志分级(DEBUG、INFO、ERROR)
│   ├── 日志查询与过滤
│   ├── 日志分析
│   └── 日志归档
└── 审计追踪
    ├── 敏感操作记录
    ├── 数据变更追踪
    ├── 用户行为分析
    └── 合规性报告
```

### 4.3 前台展示页面设计

#### 4.3.1 首页设计

**布局方案:**

```
头部导航区 (固定)
├── Logo + 站点名称
├── 主导航菜单
├── 搜索框(全局搜索)
├── 用户操作区(登录/用户中心)
└── 主题切换按钮

主体内容区
├── 轮播大图(推荐内容)
├── 快速入口(主要功能)
├── 视频推荐区(横向滚动)
├── 博客精选区(卡片网格)
├── 热门标签云
└── 最新动态/公告

侧边栏(桌面端)
├── 个人中心入口
├── 热门排行榜
├── 关注推荐
└── 广告位

页脚
├── 网站地图
├── 友情链接
├── 备案信息
└── 社交媒体链接
```

**优化方案:**

- 骨架屏加载效果
- 智能内容推荐算法
- 渐进式图片加载
- 服务端渲染(SSR)支持

#### 4.3.2 视频展示页面

**功能设计:**

- 瀑布流/网格布局切换
- 智能排序(最新、最热、推荐)
- 高级筛选(时长、分辨率、分类)
- 播放历史记录
- 收藏/点赞/分享功能
- 相关视频推荐

**播放器功能:**

- 多清晰度切换
- 播放速度控制
- 画中画模式
- 快捷键支持
- 字幕切换
- 截图功能

#### 4.3.3 博客展示页面

**阅读体验优化:**

- 阅读进度指示器
- 目录导航(浮动侧边栏)
- 阅读模式(专注模式)
- 字体大小/间距调整
- 夜间阅读模式
- 文章朗读功能

**社区功能:**

- 评论系统(嵌套回复)
- 文章评分
- 收藏夹功能
- 分享到社交媒体
- 打印优化

## 五、组件设计规范

### 5.1 组件设计原则

**原子设计方法论:**
```
原子(Atoms) → 分子(Molecules) → 有机体(Organisms) → 模板(Templates) → 页面(Pages)

原子: 按钮、输入框、图标
分子: 搜索框、登录表单
有机体: 导航栏、侧边栏
模板: 页面布局框架
页面: 具体业务页面
```

### 5.2 组件规范示例

```vue
<!-- 业务组件规范 -->
<script setup lang="ts">
// 1. TypeScript接口定义
interface Props {
  modelValue: string;
  type?: 'text' | 'password';
  placeholder?: string;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

// 2. Props定义
const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  size: 'medium',
  disabled: false,
});

// 3. Emits定义
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'change', value: string): void;
  (e: 'focus'): void;
  (e: 'blur'): void;
}>();

// 4. 响应式数据
const inputValue = ref(props.modelValue);

// 5. 计算属性
const inputClass = computed(() => [
  'base-input',
  `base-input--${props.size}`,
  { 'is-disabled': props.disabled },
]);

// 6. 方法
const handleInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  inputValue.value = value;
  emit('update:modelValue', value);
  emit('change', value);
};

// 7. 生命周期
onMounted(() => {
  // 初始化逻辑
});

// 8. 暴露方法（如果需要）
defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
});
</script>

<template>
  <div :class="inputClass">
    <input
      ref="inputRef"
      :type="type"
      :value="inputValue"
      :placeholder="placeholder"
      :disabled="disabled"
      @input="handleInput"
      @focus="$emit('focus')"
      @blur="$emit('blur')"
    />
  </div>
</template>

<style scoped lang="scss">
.base-input {
  // 基础样式
  &--small {
    // 小尺寸样式
  }
  
  &.is-disabled {
    // 禁用状态样式
  }
}
</style>
```

## 六、状态管理设计

### 6.1 Pinia模块化设计

```typescript
// stores/modules/user.ts
export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null as UserInfo | null,
    token: '',
    permissions: [] as string[],
    roles: [] as string[],
  }),
  
  getters: {
    isLogin: (state) => !!state.token,
    hasPermission: (state) => (permission: string) => 
      state.permissions.includes(permission),
  },
  
  actions: {
    async login(credentials: LoginCredentials) {
      // 登录逻辑
    },
    
    async logout() {
      // 登出逻辑
    },
    
    async getUserInfo() {
      // 获取用户信息
    },
  },
  
  // 持久化配置
  persist: {
    key: 'user-store',
    paths: ['token', 'userInfo'],
  },
});
```

### 6.2 数据请求封装

```typescript
// utils/request.ts
class Request {
  private instance: AxiosInstance;
  
  constructor() {
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    this.setupInterceptors();
  }
  
  private setupInterceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        // 添加token
        const token = useUserStore().token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // 响应拦截器
    this.instance.interceptors.response.use(
      (response) => {
        // 统一处理响应
        return response.data;
      },
      (error) => {
        // 统一错误处理
        return this.handleError(error);
      }
    );
  }
  
  private handleError(error: AxiosError) {
    // 错误处理逻辑
  }
}
```

## 七、性能优化方案

### 7.1 构建优化

**Vite配置优化:**
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    UnoCSS(),
    // 按需自动导入组件
    AutoImport({
      imports: ['vue', 'vue-router', '@vueuse/core'],
      dts: 'src/auto-imports.d.ts',
    }),
    Components({
      dts: 'src/components.d.ts',
      resolvers: [
        // Element Plus按需导入
        ElementPlusResolver(),
      ],
    }),
  ],
  
  build: {
    rollupOptions: {
      output: {
        // 代码分割策略
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-vendor': ['element-plus'],
          'chart-vendor': ['echarts'],
        },
        // 文件名哈希
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
});
```

### 7.2 运行时优化

**组件优化策略:**
1. 合理使用`v-memo`缓存虚拟DOM
2. 使用`<KeepAlive>`缓存页面状态
3. 避免不必要的响应式数据
4. 使用`shallowRef`和`shallowReactive`

**图片优化:**
- 使用WebP格式
- 图片懒加载指令
- 响应式图片（srcset）
- CDN加速

## 八、代码规范与工程化

### 8.1 代码规范配置

**ESLint配置:**
```javascript
// .eslintrc.js
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    '@vue/typescript/recommended',
    '@vue/eslint-config-prettier',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
  },
  rules: {
    // 自定义规则
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
  },
};
```



## 总结

本方案基于Vue 3技术栈，提供了一套完整的前端平台设计方案，包括：

1. **现代化的技术栈**: Vue 3组合式API + TypeScript + Vite
2. **完整的模块设计**: 从登录到各个管理模块的详细设计
3. **主题系统**: 完善的亮色/暗黑主题切换方案
4. **性能优化**: 从构建到运行时的全方位优化
5. **代码规范**: 完整的工程化配置和开发规范
6. **扩展性设计**: 插件系统和微前端支持

该方案具有良好的可维护性、可扩展性和用户体验，能够支撑大型管理系统的开发需求。