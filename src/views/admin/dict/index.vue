<template>
  <div class="dict-management-page">
    <!-- 顶部操作栏 -->
    <el-card class="toolbar-card">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-input v-model="searchKeyword" placeholder="搜索字典..." clearable style="width: 200px" :prefix-icon="Search" />
          <el-select v-model="filterCategory" placeholder="全部分类" clearable style="width: 150px">
            <el-option label="系统字典" value="system" />
            <el-option label="业务字典" value="business" />
            <el-option label="自定义字典" value="custom" />
          </el-select>
        </div>
        <div class="toolbar-right">
          <el-button :icon="Refresh" @click="handleRefreshCache">刷新缓存</el-button>
          <el-dropdown @command="handleExport">
            <el-button :icon="Download">导出 <el-icon><ArrowDown /></el-icon></el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="json">JSON格式</el-dropdown-item>
                <el-dropdown-item command="excel">Excel格式</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-upload
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            @change="handleImport"
            accept=".json,.xlsx,.xls"
          >
            <el-button :icon="Upload">导入</el-button>
          </el-upload>
        </div>
      </div>
    </el-card>
    
    <div class="dict-layout">
      <!-- 左侧：字典类型 -->
      <el-card class="type-card">
        <template #header>
          <div class="card-header">
            <span>字典类型</span>
            <el-button type="primary" size="small" :icon="Plus" @click="handleAddType">新增</el-button>
          </div>
        </template>
        
        <!-- 分类标签 -->
        <div class="category-tabs">
          <div 
            class="category-tab" 
            :class="{ active: activeCategory === 'system' }"
            @click="activeCategory = 'system'"
          >
            <el-icon><Lock /></el-icon>系统字典
          </div>
          <div 
            class="category-tab" 
            :class="{ active: activeCategory === 'business' }"
            @click="activeCategory = 'business'"
          >
            <el-icon><Briefcase /></el-icon>业务字典
          </div>
          <div 
            class="category-tab" 
            :class="{ active: activeCategory === 'custom' }"
            @click="activeCategory = 'custom'"
          >
            <el-icon><User /></el-icon>自定义
          </div>
        </div>
        
        <div class="type-list">
          <div 
            v-for="type in filteredDictTypes" 
            :key="type.code"
            class="type-item"
            :class="{ active: currentType?.code === type.code }"
            @click="selectType(type)"
          >
            <div class="type-main">
              <span class="type-name">{{ type.name }}</span>
              <el-tag v-if="type.category === 'system'" size="small" type="info">系统</el-tag>
            </div>
            <div class="type-meta">
              <span class="type-code">{{ type.code }}</span>
              <span class="type-count">{{ type.itemCount }} 项</span>
            </div>
            <div class="type-actions" v-if="type.category !== 'system'">
              <el-button size="small" type="primary" link :icon="Edit" @click.stop="handleEditType(type)" />
              <el-button size="small" type="danger" link :icon="Delete" @click.stop="handleDeleteType(type)" />
            </div>
          </div>
        </div>
        
        <!-- 缓存状态 -->
        <div class="cache-status">
          <div class="cache-info">
            <el-icon><Clock /></el-icon>
            <span>缓存版本: v{{ cacheVersion }}</span>
          </div>
          <div class="cache-time">更新: {{ lastCacheTime }}</div>
        </div>
      </el-card>
      
      <!-- 右侧：字典项 -->
      <el-card class="item-card">
        <template #header>
          <div class="card-header">
            <div class="header-left">
              <span>字典项列表</span>
              <el-tag v-if="currentType" type="primary">{{ currentType.name }}</el-tag>
            </div>
            <div class="header-right">
              <el-button-group v-if="selectedItems.length > 0">
                <el-button size="small" @click="handleBatchEnable">批量启用</el-button>
                <el-button size="small" @click="handleBatchDisable">批量禁用</el-button>
                <el-button size="small" type="danger" @click="handleBatchDelete">批量删除</el-button>
              </el-button-group>
              <el-button type="primary" size="small" :icon="Plus" @click="handleAddItem" :disabled="!currentType || currentType.category === 'system'">
                新增字典项
              </el-button>
            </div>
          </div>
        </template>
        
        <el-table 
          :data="dictItems" 
          v-loading="loading" 
          stripe 
          row-key="id"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="50" :selectable="row => currentType?.category !== 'system'" />
          <el-table-column prop="sort" label="排序" width="80">
            <template #default="{ row, $index }">
              <div class="sort-cell">
                <span>{{ row.sort }}</span>
                <div class="sort-btns" v-if="currentType?.category !== 'system'">
                  <el-icon @click="moveUp($index)" :class="{ disabled: $index === 0 }"><Top /></el-icon>
                  <el-icon @click="moveDown($index)" :class="{ disabled: $index === dictItems.length - 1 }"><Bottom /></el-icon>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="label" label="标签" min-width="120">
            <template #default="{ row }">
              <div class="label-cell">
                <span>{{ row.label }}</span>
                <el-tag v-if="row.labelEn" size="small" type="info">EN: {{ row.labelEn }}</el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="value" label="值" min-width="100" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-switch 
                v-model="row.enabled" 
                :disabled="currentType?.category === 'system'"
                @change="handleStatusChange(row)"
              />
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <template v-if="currentType?.category !== 'system'">
                <el-button size="small" type="primary" link @click="handleEditItem(row)">编辑</el-button>
                <el-button size="small" type="danger" link @click="handleDeleteItem(row)">删除</el-button>
              </template>
              <span v-else class="text-tertiary">不可修改</span>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
    
    <!-- 字典类型弹窗 -->
    <el-dialog v-model="typeDialogVisible" :title="isEditType ? '编辑字典类型' : '新增字典类型'" width="500px">
      <el-form :model="typeForm" :rules="typeFormRules" ref="typeFormRef" label-width="100px">
        <el-form-item label="字典名称" prop="name">
          <el-input v-model="typeForm.name" placeholder="请输入字典名称" />
        </el-form-item>
        <el-form-item label="字典编码" prop="code">
          <el-input v-model="typeForm.code" placeholder="请输入字典编码（英文）" :disabled="isEditType" />
        </el-form-item>
        <el-form-item label="字典分类" prop="category">
          <el-select v-model="typeForm.category" style="width: 100%">
            <el-option label="业务字典" value="business" />
            <el-option label="自定义字典" value="custom" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="typeForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="typeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitType">确定</el-button>
      </template>
    </el-dialog>
    
    <!-- 字典项弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑字典项' : '新增字典项'" width="550px">
      <el-form :model="itemForm" :rules="itemFormRules" ref="itemFormRef" label-width="100px">
        <el-form-item label="标签(中文)" prop="label">
          <el-input v-model="itemForm.label" placeholder="请输入中文标签" />
        </el-form-item>
        <el-form-item label="标签(英文)">
          <el-input v-model="itemForm.labelEn" placeholder="请输入英文标签（可选）" />
        </el-form-item>
        <el-form-item label="值" prop="value">
          <el-input v-model="itemForm.value" placeholder="请输入值" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="itemForm.enabled" active-text="启用" inactive-text="禁用" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="itemForm.sort" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="样式配置">
          <div class="style-config">
            <el-color-picker v-model="itemForm.color" size="small" />
            <el-select v-model="itemForm.tagType" placeholder="标签样式" style="width: 120px" clearable>
              <el-option label="默认" value="" />
              <el-option label="成功" value="success" />
              <el-option label="警告" value="warning" />
              <el-option label="危险" value="danger" />
              <el-option label="信息" value="info" />
            </el-select>
          </div>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="itemForm.remark" type="textarea" :rows="2" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { 
  Plus, Edit, Delete, Search, Refresh, Download, Upload, ArrowDown,
  Lock, Briefcase, User, Clock, Top, Bottom
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules, type UploadFile } from 'element-plus'

interface DictType {
  id: string
  code: string
  name: string
  category: 'system' | 'business' | 'custom'
  remark: string
  itemCount: number
}

interface DictItem {
  id: string
  label: string
  labelEn: string
  value: string
  enabled: boolean
  sort: number
  color: string
  tagType: string
  remark: string
}

const loading = ref(false)
const currentType = ref<DictType | null>(null)
const dialogVisible = ref(false)
const typeDialogVisible = ref(false)
const isEdit = ref(false)
const isEditType = ref(false)

// 搜索和筛选
const searchKeyword = ref('')
const filterCategory = ref('')
const activeCategory = ref<'system' | 'business' | 'custom'>('business')

// 缓存版本
const cacheVersion = ref(12)
const lastCacheTime = ref('2024-01-15 10:30')

// 选中项
const selectedItems = ref<DictItem[]>([])

// 字典类型数据
const dictTypes = ref<DictType[]>([
  // 系统字典
  { id: '1', code: 'gender', name: '性别', category: 'system', remark: '用户性别', itemCount: 3 },
  { id: '2', code: 'yes_no', name: '是否', category: 'system', remark: '通用是否选项', itemCount: 2 },
  { id: '3', code: 'status', name: '状态', category: 'system', remark: '通用状态', itemCount: 3 },
  // 业务字典
  { id: '4', code: 'video_category', name: '视频分类', category: 'business', remark: '视频内容分类', itemCount: 5 },
  { id: '5', code: 'blog_category', name: '博客分类', category: 'business', remark: '博客文章分类', itemCount: 4 },
  { id: '6', code: 'user_level', name: '用户等级', category: 'business', remark: '用户会员等级', itemCount: 5 },
  { id: '7', code: 'point_type', name: '积分类型', category: 'business', remark: '积分变动类型', itemCount: 6 },
  // 自定义字典
  { id: '8', code: 'custom_tag', name: '自定义标签', category: 'custom', remark: '用户自定义标签', itemCount: 8 },
  { id: '9', code: 'feedback_type', name: '反馈类型', category: 'custom', remark: '用户反馈分类', itemCount: 4 },
])

// 字典项数据
const dictItems = ref<DictItem[]>([])

// 筛选后的字典类型
const filteredDictTypes = computed(() => {
  return dictTypes.value.filter(type => {
    if (type.category !== activeCategory.value) return false
    if (searchKeyword.value) {
      return type.name.includes(searchKeyword.value) || type.code.includes(searchKeyword.value)
    }
    return true
  })
})

// Mock数据
const mockItems: Record<string, DictItem[]> = {
  gender: [
    { id: '1', label: '男', labelEn: 'Male', value: 'male', enabled: true, sort: 1, color: '#409eff', tagType: '', remark: '' },
    { id: '2', label: '女', labelEn: 'Female', value: 'female', enabled: true, sort: 2, color: '#f56c6c', tagType: '', remark: '' },
    { id: '3', label: '保密', labelEn: 'Unknown', value: 'unknown', enabled: true, sort: 3, color: '#909399', tagType: 'info', remark: '' },
  ],
  yes_no: [
    { id: '1', label: '是', labelEn: 'Yes', value: '1', enabled: true, sort: 1, color: '#67c23a', tagType: 'success', remark: '' },
    { id: '2', label: '否', labelEn: 'No', value: '0', enabled: true, sort: 2, color: '#f56c6c', tagType: 'danger', remark: '' },
  ],
  status: [
    { id: '1', label: '正常', labelEn: 'Active', value: 'active', enabled: true, sort: 1, color: '#67c23a', tagType: 'success', remark: '' },
    { id: '2', label: '禁用', labelEn: 'Disabled', value: 'disabled', enabled: true, sort: 2, color: '#f56c6c', tagType: 'danger', remark: '' },
    { id: '3', label: '锁定', labelEn: 'Locked', value: 'locked', enabled: true, sort: 3, color: '#e6a23c', tagType: 'warning', remark: '' },
  ],
  video_category: [
    { id: '1', label: '前端开发', labelEn: 'Frontend', value: 'frontend', enabled: true, sort: 1, color: '', tagType: '', remark: 'Vue/React/Angular等' },
    { id: '2', label: '后端开发', labelEn: 'Backend', value: 'backend', enabled: true, sort: 2, color: '', tagType: '', remark: 'Node/Java/Python等' },
    { id: '3', label: '数据库', labelEn: 'Database', value: 'database', enabled: true, sort: 3, color: '', tagType: '', remark: 'MySQL/MongoDB/Redis等' },
    { id: '4', label: '运维部署', labelEn: 'DevOps', value: 'devops', enabled: true, sort: 4, color: '', tagType: '', remark: 'Docker/K8s/CI-CD' },
    { id: '5', label: '人工智能', labelEn: 'AI', value: 'ai', enabled: false, sort: 5, color: '', tagType: '', remark: '机器学习/深度学习' },
  ],
  user_level: [
    { id: '1', label: 'Lv.1 新手', labelEn: 'Newbie', value: '1', enabled: true, sort: 1, color: '#909399', tagType: 'info', remark: '0-100积分' },
    { id: '2', label: 'Lv.2 入门', labelEn: 'Beginner', value: '2', enabled: true, sort: 2, color: '#67c23a', tagType: 'success', remark: '100-500积分' },
    { id: '3', label: 'Lv.3 进阶', labelEn: 'Intermediate', value: '3', enabled: true, sort: 3, color: '#409eff', tagType: '', remark: '500-2000积分' },
    { id: '4', label: 'Lv.4 高手', labelEn: 'Advanced', value: '4', enabled: true, sort: 4, color: '#e6a23c', tagType: 'warning', remark: '2000-5000积分' },
    { id: '5', label: 'Lv.5 大师', labelEn: 'Master', value: '5', enabled: true, sort: 5, color: '#f56c6c', tagType: 'danger', remark: '5000+积分' },
  ]
}

// 表单
const typeFormRef = ref<FormInstance>()
const typeForm = reactive<Omit<DictType, 'id' | 'itemCount'>>({
  code: '',
  name: '',
  category: 'business',
  remark: ''
})

const typeFormRules: FormRules = {
  name: [{ required: true, message: '请输入字典名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入字典编码', trigger: 'blur' }],
  category: [{ required: true, message: '请选择字典分类', trigger: 'change' }]
}

const itemFormRef = ref<FormInstance>()
const itemForm = reactive<Omit<DictItem, 'id'>>({
  label: '',
  labelEn: '',
  value: '',
  enabled: true,
  sort: 0,
  color: '',
  tagType: '',
  remark: ''
})

const itemFormRules: FormRules = {
  label: [{ required: true, message: '请输入标签', trigger: 'blur' }],
  value: [{ required: true, message: '请输入值', trigger: 'blur' }]
}

// 选择字典类型
function selectType(type: DictType) {
  currentType.value = type
  dictItems.value = mockItems[type.code] || []
  selectedItems.value = []
}

// 字典类型操作
function handleAddType() {
  isEditType.value = false
  Object.assign(typeForm, { code: '', name: '', category: 'business', remark: '' })
  typeDialogVisible.value = true
}

function handleEditType(type: DictType) {
  isEditType.value = true
  Object.assign(typeForm, { code: type.code, name: type.name, category: type.category, remark: type.remark })
  typeDialogVisible.value = true
}

function handleDeleteType(type: DictType) {
  ElMessageBox.confirm(`确定要删除字典 "${type.name}" 吗？该操作将同时删除所有字典项！`, '警告', { type: 'error' })
    .then(() => {
      dictTypes.value = dictTypes.value.filter(t => t.id !== type.id)
      if (currentType.value?.id === type.id) {
        currentType.value = null
        dictItems.value = []
      }
      ElMessage.success('删除成功')
    }).catch(() => {})
}

function handleSubmitType() {
  if (!typeFormRef.value) return
  typeFormRef.value.validate((valid) => {
    if (valid) {
      if (isEditType.value) {
        const type = dictTypes.value.find(t => t.code === typeForm.code)
        if (type) {
          type.name = typeForm.name
          type.remark = typeForm.remark
        }
      } else {
        dictTypes.value.push({
          id: Date.now().toString(),
          code: typeForm.code,
          name: typeForm.name,
          category: typeForm.category,
          remark: typeForm.remark,
          itemCount: 0
        })
      }
      ElMessage.success(isEditType.value ? '编辑成功' : '新增成功')
      typeDialogVisible.value = false
    }
  })
}

// 字典项操作
function handleAddItem() {
  isEdit.value = false
  Object.assign(itemForm, { 
    label: '', labelEn: '', value: '', enabled: true, 
    sort: dictItems.value.length + 1, color: '', tagType: '', remark: '' 
  })
  dialogVisible.value = true
}

function handleEditItem(row: DictItem) {
  isEdit.value = true
  Object.assign(itemForm, row)
  dialogVisible.value = true
}

function handleDeleteItem(row: DictItem) {
  ElMessageBox.confirm(`确定要删除字典项 "${row.label}" 吗？`, '提示', { type: 'warning' })
    .then(() => {
      dictItems.value = dictItems.value.filter(item => item.id !== row.id)
      ElMessage.success('删除成功')
    }).catch(() => {})
}

function handleSubmit() {
  if (!itemFormRef.value) return
  itemFormRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        const index = dictItems.value.findIndex(item => item.value === itemForm.value)
        if (index > -1) {
          const existingId = dictItems.value[index]!.id
          dictItems.value[index] = { ...itemForm, id: existingId }
        }
      } else {
        dictItems.value.push({ ...itemForm, id: Date.now().toString() })
      }
      ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
      dialogVisible.value = false
    }
  })
}

// 状态变更
function handleStatusChange(row: DictItem) {
  ElMessage.success(`字典项 "${row.label}" 已${row.enabled ? '启用' : '禁用'}`)
}

// 排序
function moveUp(index: number) {
  if (index === 0) return
  const arr = dictItems.value
  ;[arr[index], arr[index - 1]] = [arr[index - 1]!, arr[index]!]
  updateSort()
}

function moveDown(index: number) {
  if (index === dictItems.value.length - 1) return
  const arr = dictItems.value
  ;[arr[index], arr[index + 1]] = [arr[index + 1]!, arr[index]!]
  updateSort()
}

function updateSort() {
  dictItems.value.forEach((item, index) => {
    item.sort = index + 1
  })
  ElMessage.success('排序已更新')
}

// 批量操作
function handleSelectionChange(rows: DictItem[]) {
  selectedItems.value = rows
}

function handleBatchEnable() {
  selectedItems.value.forEach(item => item.enabled = true)
  ElMessage.success(`已启用 ${selectedItems.value.length} 个字典项`)
}

function handleBatchDisable() {
  selectedItems.value.forEach(item => item.enabled = false)
  ElMessage.success(`已禁用 ${selectedItems.value.length} 个字典项`)
}

function handleBatchDelete() {
  ElMessageBox.confirm(`确定要删除选中的 ${selectedItems.value.length} 个字典项吗？`, '提示', { type: 'warning' })
    .then(() => {
      const ids = selectedItems.value.map(item => item.id)
      dictItems.value = dictItems.value.filter(item => !ids.includes(item.id))
      selectedItems.value = []
      ElMessage.success('批量删除成功')
    }).catch(() => {})
}

// 缓存操作
function handleRefreshCache() {
  cacheVersion.value++
  lastCacheTime.value = new Date().toLocaleString()
  ElMessage.success('缓存已刷新')
}

// 导出
function handleExport(format: string) {
  if (format === 'json') {
    const data = {
      types: dictTypes.value,
      items: mockItems,
      version: cacheVersion.value,
      exportTime: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dict_export_${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    ElMessage.success('JSON导出成功')
  } else {
    ElMessage.success('Excel导出成功（模拟）')
  }
}

// 导入
function handleImport(file: UploadFile) {
  if (!file.raw) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      if (file.name.endsWith('.json')) {
        const data = JSON.parse(e.target?.result as string)
        ElMessage.success(`成功导入 ${data.types?.length || 0} 个字典类型`)
      } else {
        ElMessage.success('Excel导入成功（模拟）')
      }
    } catch (error) {
      ElMessage.error('导入失败，请检查文件格式')
    }
  }
  reader.readAsText(file.raw)
}

// 默认选中第一个
const firstType = filteredDictTypes.value[0]
if (firstType) {
  selectType(firstType)
}
</script>

<style scoped lang="scss">
.dict-management-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  .toolbar-card {
    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .toolbar-left, .toolbar-right {
        display: flex;
        align-items: center;
        gap: 12px;
      }
    }
  }
  
  .dict-layout {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 16px;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }
  
  .category-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
    
    .category-tab {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 10px 12px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      color: var(--color-text-secondary);
      background: var(--color-bg-secondary);
      transition: all 0.3s;
      
      &:hover {
        color: var(--color-primary);
      }
      
      &.active {
        background: var(--color-primary);
        color: #fff;
      }
    }
  }
  
  .type-list {
    max-height: 400px;
    overflow-y: auto;
    
    .type-item {
      position: relative;
      padding: 12px 16px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
      margin-bottom: 8px;
      border: 1px solid transparent;
      
      &:hover {
        background: var(--color-bg-secondary);
        
        .type-actions {
          opacity: 1;
        }
      }
      
      &.active {
        background: var(--color-primary-light);
        border-color: var(--color-primary);
        
        .type-name {
          color: var(--color-primary);
        }
      }
      
      .type-main {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;
        
        .type-name {
          font-weight: 500;
          color: var(--color-text-primary);
        }
      }
      
      .type-meta {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: var(--color-text-tertiary);
      }
      
      .type-actions {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        opacity: 0;
        transition: opacity 0.3s;
        background: var(--color-bg-primary);
        padding: 4px;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
    }
  }
  
  .cache-status {
    margin-top: 16px;
    padding: 12px;
    background: var(--color-bg-secondary);
    border-radius: 8px;
    font-size: 12px;
    color: var(--color-text-tertiary);
    
    .cache-info {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 4px;
      color: var(--color-text-secondary);
    }
  }
  
  .text-tertiary {
    color: var(--color-text-tertiary);
    font-size: 13px;
  }
  
  .label-cell {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .sort-cell {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .sort-btns {
      display: flex;
      flex-direction: column;
      gap: 2px;
      
      .el-icon {
        cursor: pointer;
        font-size: 14px;
        color: var(--color-text-tertiary);
        transition: color 0.3s;
        
        &:hover:not(.disabled) {
          color: var(--color-primary);
        }
        
        &.disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
      }
    }
  }
  
  .style-config {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

@media (max-width: 1024px) {
  .dict-management-page .dict-layout {
    grid-template-columns: 1fr;
  }
}
</style>
