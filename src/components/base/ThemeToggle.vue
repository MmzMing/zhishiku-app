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
          <Moon v-else-if="themeMode === 'dark'" />
          <Setting v-else />
        </el-icon>
        <span v-if="showText" class="theme-text">{{ themeText }}</span>
      </div>
      
      <template #dropdown>
        <el-dropdown-menu class="theme-menu">
          <el-dropdown-item 
            command="light" 
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
            command="dark" 
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
            command="auto" 
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
          
          <div v-if="showColorPicker" class="color-picker-wrapper">
            <span class="color-picker-label">主色</span>
            <el-color-picker
              v-model="primaryColor"
              :predefine="predefineColors"
              size="small"
              @change="handleColorChange"
            />
          </div>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Sunny, Moon, Check, Setting } from '@element-plus/icons-vue'
import { useTheme, type ThemeMode } from '@/composables/useTheme'

// Props
interface Props {
  showColorPicker?: boolean
  showText?: boolean
}

withDefaults(defineProps<Props>(), {
  showColorPicker: true,
  showText: false
})

// 主题管理
const { themeMode, themeText, toggleTheme, setPrimaryColor } = useTheme()

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
const handleThemeChange = (mode: ThemeMode) => {
  toggleTheme(mode)
}

// 颜色改变
const handleColorChange = (color: string | null) => {
  if (color) {
    setPrimaryColor(color)
  }
}
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

/* 自定义主题菜单样式 */
.theme-menu {
  width: 180px;
  padding: 8px;
  box-sizing: border-box;
}

/* 使用/deep/选择器覆盖Element Plus默认样式 */
:deep(.el-dropdown-menu) {
  width: 180px;
  padding: 8px;
  box-sizing: border-box;
  
  .el-dropdown-menu__item {
      border-radius: 4px;
      margin: 2px 0;
      box-sizing: border-box;
      position: relative;
      /* 移除可能导致宽度变化的属性 */
      
      /* 确保鼠标移出后不保持选中状态 */
      &:not(:hover):focus {
        background-color: transparent;
        color: var(--el-text-color-regular);
        box-shadow: none;
      }
      
      &.active {
        background-color: var(--el-color-primary-light-9);
        color: var(--el-color-primary);
        
        &:hover {
          background-color: var(--el-color-primary-light-8);
      }
    }
    
    /* 覆盖暗黑主题下的hover效果 */
    &:hover {
      border-left: none !important; /* 移除左侧边框 */
      padding-left: var(--el-dropdown-menu-item-padding-horizontal, 16px) !important;
      /* 改为添加左侧内边距而不是边框，避免宽度变化 */
    }
    
    .theme-option {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      
      span {
        flex: 1;
      }
      
      .check-icon {
        color: var(--el-color-primary);
      }
    }
  }
  
  .el-divider {
    margin: 8px 0;
  }
  
  .color-picker-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    
    .color-picker-label {
      font-size: 14px;
      color: var(--color-text-secondary);
    }
  }
}

/* 暗黑主题下的特定样式 */
[data-theme="dark"] {
  :deep(.el-dropdown-menu__item:hover) {
    border-left: none !important;
    padding-left: var(--el-dropdown-menu-item-padding-horizontal, 16px) !important;
    background-color: #3d3d3d;
  }
}
</style>
