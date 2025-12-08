<template>
  <div class="blog-edit-page">
    <!-- 顶部操作栏 -->
    <div class="top-bar">
      <div class="left">
        <el-button @click="$router.back()">
          <el-icon><ArrowLeft /></el-icon>返回
        </el-button>
        <span class="page-title">{{ isEdit ? '编辑博客' : '写博客' }}</span>
      </div>
      <div class="right">
        <el-button @click="showTemplateDialog = true" :icon="FolderOpened">模板</el-button>
        <el-button @click="showVersionDialog = true" :icon="Clock">版本历史</el-button>
        <el-button @click="handleSaveDraft" :loading="saving">保存草稿</el-button>
        <el-button type="success" @click="showScheduleDialog = true">定时发布</el-button>
        <el-button type="primary" @click="handlePublish" :loading="saving">发布</el-button>
      </div>
    </div>
    
    <!-- 编辑区域 -->
    <div class="edit-container">
      <div class="main-content">
        <!-- 标题输入 -->
        <input 
          v-model="formData.title" 
          class="title-input" 
          placeholder="请输入博客标题..."
          maxlength="100"
        />
        
        <!-- Markdown编辑器 -->
        <div class="editor-wrapper">
          <div class="editor-toolbar">
            <div class="toolbar-group">
              <el-tooltip content="粗体 (Ctrl+B)" placement="bottom">
                <button class="toolbar-btn" @click="insertFormat('bold')"><strong>B</strong></button>
              </el-tooltip>
              <el-tooltip content="斜体 (Ctrl+I)" placement="bottom">
                <button class="toolbar-btn" @click="insertFormat('italic')"><em>I</em></button>
              </el-tooltip>
              <el-tooltip content="删除线" placement="bottom">
                <button class="toolbar-btn" @click="insertFormat('strike')"><s>S</s></button>
              </el-tooltip>
            </div>
            <div class="toolbar-group">
              <el-tooltip content="一级标题" placement="bottom">
                <button class="toolbar-btn" @click="insertFormat('h1')">H1</button>
              </el-tooltip>
              <el-tooltip content="二级标题" placement="bottom">
                <button class="toolbar-btn" @click="insertFormat('h2')">H2</button>
              </el-tooltip>
              <el-tooltip content="三级标题" placement="bottom">
                <button class="toolbar-btn" @click="insertFormat('h3')">H3</button>
              </el-tooltip>
            </div>
            <div class="toolbar-group">
              <el-tooltip content="无序列表" placement="bottom">
                <button class="toolbar-btn" @click="insertFormat('ul')">
                  <el-icon><List /></el-icon>
                </button>
              </el-tooltip>
              <el-tooltip content="有序列表" placement="bottom">
                <button class="toolbar-btn" @click="insertFormat('ol')">
                  <el-icon><Operation /></el-icon>
                </button>
              </el-tooltip>
              <el-tooltip content="引用" placement="bottom">
                <button class="toolbar-btn" @click="insertFormat('quote')">
                  <el-icon><ChatDotSquare /></el-icon>
                </button>
              </el-tooltip>
            </div>
            <div class="toolbar-group">
              <el-tooltip content="代码块" placement="bottom">
                <button class="toolbar-btn" @click="insertFormat('code')">
                  <el-icon><Edit /></el-icon>
                </button>
              </el-tooltip>
              <el-tooltip content="链接" placement="bottom">
                <button class="toolbar-btn" @click="insertFormat('link')">
                  <el-icon><Link /></el-icon>
                </button>
              </el-tooltip>
              <el-tooltip content="图片" placement="bottom">
                <button class="toolbar-btn" @click="insertFormat('image')">
                  <el-icon><Picture /></el-icon>
                </button>
              </el-tooltip>
            </div>
            <div class="toolbar-right">
              <el-switch 
                v-model="showPreview" 
                active-text="预览" 
                inactive-text=""
                style="--el-switch-on-color: var(--color-primary)"
              />
            </div>
          </div>
          
          <div class="editor-body" :class="{ 'split-view': showPreview }">
            <div class="editor-input">
              <textarea 
                ref="editorRef"
                v-model="formData.content"
                class="markdown-editor"
                placeholder="开始编写你的博客内容...(支持Markdown语法)"
                @keydown="handleEditorKeydown"
              ></textarea>
            </div>
            <div v-if="showPreview" class="editor-preview">
              <div class="preview-content markdown-body" v-html="renderedContent"></div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧设置面板 -->
      <div class="side-panel">
        <el-card class="setting-card">
          <template #header>
            <span>博客设置</span>
          </template>
          
          <el-form :model="formData" label-position="top">
            <el-form-item label="博客分类">
              <el-select v-model="formData.categoryId" placeholder="选择分类" style="width: 100%">
                <el-option v-for="cat in categories" :key="cat.value" :label="cat.label" :value="cat.value" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="标签">
              <el-select 
                v-model="formData.tags" 
                multiple 
                filterable 
                allow-create 
                default-first-option
                placeholder="输入或选择标签"
                style="width: 100%"
              >
                <el-option v-for="tag in tagOptions" :key="tag" :label="tag" :value="tag" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="摘要">
              <el-input 
                v-model="formData.summary" 
                type="textarea" 
                :rows="3" 
                placeholder="输入博客摘要（可选，留空将自动提取）"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>
            
            <el-form-item label="封面图片">
              <div class="cover-uploader">
                <el-upload
                  class="cover-upload"
                  :show-file-list="false"
                  :before-upload="handleCoverUpload"
                  accept="image/*"
                >
                  <div v-if="formData.cover" class="cover-preview">
                    <img :src="formData.cover" />
                    <div class="cover-mask">
                      <el-icon><Plus /></el-icon>
                      <span>更换封面</span>
                    </div>
                  </div>
                  <div v-else class="cover-placeholder">
                    <el-icon><Plus /></el-icon>
                    <span>上传封面</span>
                  </div>
                </el-upload>
              </div>
            </el-form-item>
            
            <el-form-item label="可见性">
              <el-radio-group v-model="formData.visibility">
                <el-radio value="public">公开</el-radio>
                <el-radio value="private">私密</el-radio>
              </el-radio-group>
            </el-form-item>
            
            <el-form-item label="允许评论">
              <el-switch v-model="formData.allowComment" />
            </el-form-item>
          </el-form>
        </el-card>
        
        <!-- 统计信息 -->
        <el-card class="stat-card">
          <div class="stat-item">
            <span class="label">字数统计</span>
            <span class="value">{{ wordCount }}</span>
          </div>
          <div class="stat-item">
            <span class="label">预计阅读</span>
            <span class="value">{{ readTime }} 分钟</span>
          </div>
          <div class="stat-item" v-if="formData.lastSavedAt">
            <span class="label">上次保存</span>
            <span class="value">{{ formData.lastSavedAt }}</span>
          </div>
          <div class="stat-item" v-if="autoSaveTime">
            <span class="label">自动保存</span>
            <span class="value success">{{ autoSaveTime }}</span>
          </div>
        </el-card>
      </div>
    </div>
    
    <!-- 版本历史弹窗 -->
    <el-dialog v-model="showVersionDialog" title="版本历史" width="700px">
      <el-timeline>
        <el-timeline-item
          v-for="version in versionHistory"
          :key="version.id"
          :timestamp="version.time"
          :type="version.type === 'publish' ? 'success' : 'primary'"
          placement="top"
        >
          <el-card shadow="hover">
            <div class="version-item">
              <div class="version-info">
                <el-tag :type="version.type === 'publish' ? 'success' : 'info'" size="small">
                  {{ version.type === 'publish' ? '发布' : version.type === 'autosave' ? '自动保存' : '手动保存' }}
                </el-tag>
                <span class="version-words">字数: {{ version.wordCount }}</span>
              </div>
              <div class="version-actions">
                <el-button size="small" link @click="previewVersion(version)">预览</el-button>
                <el-button size="small" link type="primary" @click="restoreVersion(version)">恢复</el-button>
              </div>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
    
    <!-- 模板系统弹窗 -->
    <el-dialog v-model="showTemplateDialog" title="文章模板" width="800px">
      <el-tabs v-model="templateTab">
        <el-tab-pane label="选择模板" name="select">
          <div class="template-grid">
            <div v-for="template in templates" :key="template.id" class="template-card" @click="applyTemplate(template)">
              <div class="template-preview"><pre>{{ template.preview }}</pre></div>
              <div class="template-info">
                <span class="template-name">{{ template.name }}</span>
                <span class="template-desc">{{ template.description }}</span>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="保存为模板" name="save">
          <el-form label-width="100px">
            <el-form-item label="模板名称"><el-input v-model="newTemplate.name" placeholder="输入模板名称" /></el-form-item>
            <el-form-item label="模板描述"><el-input v-model="newTemplate.description" type="textarea" :rows="2" /></el-form-item>
            <el-form-item><el-button type="primary" @click="saveAsTemplate">保存模板</el-button></el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
    
    <!-- 定时发布弹窗 -->
    <el-dialog v-model="showScheduleDialog" title="定时发布" width="400px">
      <el-form label-width="100px">
        <el-form-item label="发布时间">
          <el-date-picker v-model="scheduleTime" type="datetime" placeholder="选择发布时间" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showScheduleDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmSchedule">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  ArrowLeft, Plus, List, Operation, ChatDotSquare, 
  Edit, Link, Picture, Clock, FolderOpened
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const saving = ref(false)
const showPreview = ref(false)
const editorRef = ref<HTMLTextAreaElement>()

const formData = reactive({
  title: '',
  content: '',
  categoryId: '',
  tags: [] as string[],
  summary: '',
  cover: '',
  visibility: 'public',
  allowComment: true,
  lastSavedAt: ''
})

// 版本历史
const showVersionDialog = ref(false)
const versionHistory = ref([
  { id: '1', type: 'autosave', time: '2024-01-15 14:30:00', wordCount: 1520, content: '' },
  { id: '2', type: 'manual', time: '2024-01-15 14:15:00', wordCount: 1380, content: '' },
  { id: '3', type: 'publish', time: '2024-01-15 10:00:00', wordCount: 1200, content: '' },
  { id: '4', type: 'autosave', time: '2024-01-14 18:45:00', wordCount: 980, content: '' },
])

// 模板系统
const showTemplateDialog = ref(false)
const templateTab = ref('select')
const templates = ref([
  { id: '1', name: '技术教程', description: '适用于技术教程文章', preview: '# 标题\n\n## 前言\n\n## 正文\n\n## 总结' },
  { id: '2', name: '项目实战', description: '适用于项目实战分享', preview: '# 项目名称\n\n## 项目背景\n\n## 技术选型\n\n## 实现过程\n\n## 总结' },
  { id: '3', name: '问题解决', description: '适用于问题解决记录', preview: '# 问题描述\n\n## 问题分析\n\n## 解决方案\n\n## 总结' },
  { id: '4', name: '学习笔记', description: '适用于学习笔记', preview: '# 学习主题\n\n## 核心概念\n\n## 重要知识点\n\n## 代码示例\n\n## 参考资料' },
])
const newTemplate = reactive({
  name: '',
  category: '',
  description: ''
})

// 定时发布
const showScheduleDialog = ref(false)
const scheduleEnabled = ref(false)
const scheduleTime = ref<Date | null>(null)

// 自动保存
const autoSaveTime = ref('')
let autoSaveTimer: ReturnType<typeof setInterval> | null = null

const categories = [
  { value: 'cat-1', label: '前端开发' },
  { value: 'cat-2', label: '后端开发' },
  { value: 'cat-3', label: 'DevOps' },
  { value: 'cat-4', label: '数据库' },
  { value: 'cat-5', label: '人工智能' }
]

const tagOptions = ['Vue', 'React', 'TypeScript', 'Node.js', 'Python', 'Docker', 'Kubernetes', 'MySQL', 'Redis', 'MongoDB']

// 字数统计
const wordCount = computed(() => {
  return formData.content.replace(/\s/g, '').length
})

// 阅读时间估算
const readTime = computed(() => {
  return Math.max(1, Math.ceil(wordCount.value / 400))
})

// 简易Markdown渲染
const renderedContent = computed(() => {
  let html = formData.content
  // 转义HTML
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  // 标题
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')
  // 粗体、斜体
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>')
  // 代码块
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
  html = html.replace(/`(.+?)`/g, '<code>$1</code>')
  // 链接和图片
  html = html.replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" />')
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
  // 引用
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
  // 列表
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>')
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
  // 换行
  html = html.replace(/\n\n/g, '</p><p>')
  html = html.replace(/\n/g, '<br>')
  return `<p>${html}</p>`
})

// 插入格式
function insertFormat(type: string) {
  const editor = editorRef.value
  if (!editor) return
  
  const start = editor.selectionStart
  const end = editor.selectionEnd
  const selected = formData.content.substring(start, end)
  
  let before = '', after = '', placeholder = ''
  
  switch (type) {
    case 'bold':
      before = '**'; after = '**'; placeholder = '粗体文字'
      break
    case 'italic':
      before = '*'; after = '*'; placeholder = '斜体文字'
      break
    case 'strike':
      before = '~~'; after = '~~'; placeholder = '删除文字'
      break
    case 'h1':
      before = '# '; after = ''; placeholder = '一级标题'
      break
    case 'h2':
      before = '## '; after = ''; placeholder = '二级标题'
      break
    case 'h3':
      before = '### '; after = ''; placeholder = '三级标题'
      break
    case 'ul':
      before = '- '; after = ''; placeholder = '列表项'
      break
    case 'ol':
      before = '1. '; after = ''; placeholder = '列表项'
      break
    case 'quote':
      before = '> '; after = ''; placeholder = '引用内容'
      break
    case 'code':
      before = '```\n'; after = '\n```'; placeholder = '代码内容'
      break
    case 'link':
      before = '['; after = '](url)'; placeholder = '链接文字'
      break
    case 'image':
      before = '!['; after = '](图片地址)'; placeholder = '图片描述'
      break
  }
  
  const insert = before + (selected || placeholder) + after
  formData.content = formData.content.substring(0, start) + insert + formData.content.substring(end)
  
  // 聚焦并选中
  setTimeout(() => {
    editor.focus()
    const newStart = start + before.length
    const newEnd = newStart + (selected || placeholder).length
    editor.setSelectionRange(newStart, newEnd)
  }, 0)
}

// 键盘快捷键
function handleEditorKeydown(e: KeyboardEvent) {
  if (e.ctrlKey || e.metaKey) {
    switch (e.key) {
      case 'b':
        e.preventDefault()
        insertFormat('bold')
        break
      case 'i':
        e.preventDefault()
        insertFormat('italic')
        break
      case 's':
        e.preventDefault()
        handleSaveDraft()
        break
    }
  }
}

// 封面上传
function handleCoverUpload(file: File) {
  // 模拟上传，实际应调用API
  const reader = new FileReader()
  reader.onload = (e) => {
    formData.cover = e.target?.result as string
  }
  reader.readAsDataURL(file)
  return false
}

// 保存草稿
async function handleSaveDraft() {
  if (!formData.title.trim()) {
    ElMessage.warning('请输入博客标题')
    return
  }
  
  saving.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    formData.lastSavedAt = new Date().toLocaleString()
    // 添加版本历史
    versionHistory.value.unshift({
      id: Date.now().toString(),
      type: 'manual',
      time: new Date().toLocaleString(),
      wordCount: wordCount.value,
      content: formData.content
    })
    ElMessage.success('草稿已保存')
  } finally {
    saving.value = false
  }
}

// 自动保存
function startAutoSave() {
  autoSaveTimer = setInterval(async () => {
    if (formData.content.trim()) {
      autoSaveTime.value = new Date().toLocaleTimeString()
      // 添加到版本历史
      versionHistory.value.unshift({
        id: Date.now().toString(),
        type: 'autosave',
        time: new Date().toLocaleString(),
        wordCount: wordCount.value,
        content: formData.content
      })
      // 只保留最近20个版本
      if (versionHistory.value.length > 20) {
        versionHistory.value = versionHistory.value.slice(0, 20)
      }
    }
  }, 60000) // 每分钟自动保存
}

// 版本操作
function previewVersion(version: any) {
  ElMessage.info(`预览版本: ${version.time}`)
}

function restoreVersion(version: any) {
  formData.content = version.content || `// 恢复的内容 (${version.time})`
  ElMessage.success('已恢复到选中版本')
  showVersionDialog.value = false
}

// 模板操作
function applyTemplate(template: any) {
  formData.content = template.preview
  ElMessage.success(`已应用模板: ${template.name}`)
  showTemplateDialog.value = false
}

function saveAsTemplate() {
  if (!newTemplate.name) {
    ElMessage.warning('请输入模板名称')
    return
  }
  templates.value.push({
    id: Date.now().toString(),
    name: newTemplate.name,
    description: newTemplate.description,
    preview: formData.content.substring(0, 200)
  })
  ElMessage.success('模板保存成功')
  showTemplateDialog.value = false
}

// 定时发布
function confirmSchedule() {
  if (!scheduleTime.value) {
    ElMessage.warning('请选择发布时间')
    return
  }
  scheduleEnabled.value = true
  ElMessage.success(`已设置定时发布: ${scheduleTime.value.toLocaleString()}`)
  showScheduleDialog.value = false
}

// 发布
async function handlePublish() {
  if (!formData.title.trim()) {
    ElMessage.warning('请输入博客标题')
    return
  }
  if (!formData.content.trim()) {
    ElMessage.warning('请输入博客内容')
    return
  }
  if (!formData.categoryId) {
    ElMessage.warning('请选择博客分类')
    return
  }
  
  saving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 800))
    ElMessage.success(isEdit.value ? '博客已更新' : '博客已发布')
    router.push('/admin/blogs')
  } finally {
    saving.value = false
  }
}

// 自动保存 watch
watch(() => formData.content, () => {
  if (autoSaveTimer) clearTimeout(autoSaveTimer)
  if (formData.title.trim() && formData.content.trim()) {
    autoSaveTimer = window.setTimeout(() => {
      handleSaveDraft()
    }, 30000) // 30秒自动保存
  }
})

// 加载博客数据（编辑模式）
onMounted(async () => {
  if (isEdit.value) {
    // 模拟加载数据
    formData.title = '示例博客标题'
    formData.content = '# 示例内容\n\n这是一篇示例博客的内容。\n\n## 二级标题\n\n正文内容...'
    formData.categoryId = 'cat-1'
    formData.tags = ['Vue', 'TypeScript']
    formData.summary = '这是博客摘要'
  }
})
</script>

<style scoped lang="scss">
.blog-edit-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-page);
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background-color: var(--color-bg-elevated);
  border-bottom: 1px solid var(--color-border);
  
  .left {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .page-title {
      font-size: 16px;
      font-weight: 500;
      color: var(--color-text-primary);
    }
  }
  
  .right {
    display: flex;
    gap: 12px;
  }
}

.edit-container {
  flex: 1;
  display: flex;
  gap: 20px;
  padding: 20px;
  overflow: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.title-input {
  width: 100%;
  font-size: 28px;
  font-weight: 600;
  border: none;
  outline: none;
  padding: 16px 20px;
  background-color: var(--color-bg-elevated);
  border-radius: 8px;
  margin-bottom: 16px;
  color: var(--color-text-primary);
  
  &::placeholder {
    color: var(--color-text-quaternary);
  }
}

.editor-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-elevated);
  border-radius: 8px;
  overflow: hidden;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--color-border);
  flex-wrap: wrap;
  
  .toolbar-group {
    display: flex;
    gap: 4px;
    padding-right: 8px;
    border-right: 1px solid var(--color-border);
    
    &:last-of-type {
      border-right: none;
    }
  }
  
  .toolbar-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: none;
    border-radius: 4px;
    cursor: pointer;
    color: var(--color-text-secondary);
    transition: all 0.2s;
    
    &:hover {
      background-color: var(--color-bg-hover);
      color: var(--color-text-primary);
    }
  }
  
  .toolbar-right {
    margin-left: auto;
  }
}

.editor-body {
  flex: 1;
  display: flex;
  overflow: hidden;
  
  &.split-view {
    .editor-input {
      width: 50%;
      border-right: 1px solid var(--color-border);
    }
    
    .editor-preview {
      width: 50%;
    }
  }
}

.editor-input {
  flex: 1;
  
  .markdown-editor {
    width: 100%;
    height: 100%;
    padding: 16px 20px;
    border: none;
    outline: none;
    resize: none;
    font-family: 'Fira Code', 'Source Code Pro', monospace;
    font-size: 14px;
    line-height: 1.8;
    background-color: transparent;
    color: var(--color-text-primary);
    
    &::placeholder {
      color: var(--color-text-quaternary);
    }
  }
}

.editor-preview {
  overflow: auto;
  padding: 16px 20px;
  
  .preview-content {
    font-size: 15px;
    line-height: 1.8;
    color: var(--color-text-primary);
    
    :deep(h1), :deep(h2), :deep(h3) {
      margin: 16px 0 8px;
      font-weight: 600;
    }
    
    :deep(h1) { font-size: 24px; }
    :deep(h2) { font-size: 20px; }
    :deep(h3) { font-size: 17px; }
    
    :deep(code) {
      padding: 2px 6px;
      background-color: var(--color-bg-muted);
      border-radius: 4px;
      font-size: 13px;
    }
    
    :deep(pre) {
      padding: 16px;
      background-color: var(--color-bg-muted);
      border-radius: 8px;
      overflow-x: auto;
      
      code {
        padding: 0;
        background: none;
      }
    }
    
    :deep(blockquote) {
      padding-left: 16px;
      border-left: 4px solid var(--color-primary);
      color: var(--color-text-secondary);
      margin: 12px 0;
    }
    
    :deep(img) {
      max-width: 100%;
      border-radius: 8px;
    }
    
    :deep(a) {
      color: var(--color-primary);
    }
  }
}

.side-panel {
  width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}

.setting-card {
  :deep(.el-card__header) {
    padding: 12px 16px;
    font-weight: 500;
  }
  
  :deep(.el-card__body) {
    padding: 16px;
  }
  
  :deep(.el-form-item) {
    margin-bottom: 16px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  :deep(.el-form-item__label) {
    font-size: 13px;
    color: var(--color-text-secondary);
  }
}

.cover-uploader {
  .cover-upload {
    width: 100%;
    
    :deep(.el-upload) {
      width: 100%;
    }
  }
  
  .cover-preview {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    border-radius: 8px;
    overflow: hidden;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .cover-mask {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background-color: rgba(0, 0, 0, 0.5);
      color: white;
      opacity: 0;
      transition: opacity 0.2s;
    }
    
    &:hover .cover-mask {
      opacity: 1;
    }
  }
  
  .cover-placeholder {
    width: 100%;
    aspect-ratio: 16 / 9;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 2px dashed var(--color-border);
    border-radius: 8px;
    color: var(--color-text-tertiary);
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      border-color: var(--color-primary);
      color: var(--color-primary);
    }
  }
}

.stat-card {
  :deep(.el-card__body) {
    padding: 16px;
  }
  
  .stat-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    
    &:not(:last-child) {
      border-bottom: 1px solid var(--color-border);
    }
    
    .label {
      color: var(--color-text-secondary);
      font-size: 13px;
    }
    
    .value {
      color: var(--color-text-primary);
      font-weight: 500;
    }
  }
}

/* 响应式 */
@media (max-width: 1024px) {
  .edit-container {
    flex-direction: column;
  }
  
  .side-panel {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    
    .setting-card, .stat-card {
      flex: 1;
      min-width: 280px;
    }
  }
}
</style>
