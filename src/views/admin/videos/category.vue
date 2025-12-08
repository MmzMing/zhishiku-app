<template>
  <div class="video-category-page">
    <el-row :gutter="20">
      <!-- 左侧：分类树 -->
      <el-col :span="10">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>视频分类</span>
              <el-button type="primary" size="small" :icon="Plus" @click="handleAdd(null)">新增根分类</el-button>
            </div>
          </template>
          
          <el-tree
            ref="treeRef"
            :data="categoryTree"
            node-key="id"
            :props="{ label: 'name', children: 'children' }"
            default-expand-all
            draggable
            :allow-drop="allowDrop"
            @node-drop="handleDrop"
            @node-click="handleNodeClick"
            highlight-current
          >
            <template #default="{ node, data }">
              <div class="tree-node">
                <span class="node-label">
                  <el-icon><Folder /></el-icon>
                  {{ data.name }}
                  <el-tag size="small" type="info">{{ data.videoCount || 0 }}</el-tag>
                </span>
                <span class="node-actions">
                  <el-button type="primary" link size="small" @click.stop="handleAdd(data)">
                    <el-icon><Plus /></el-icon>
                  </el-button>
                  <el-button type="primary" link size="small" @click.stop="handleEdit(data)">
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <el-button type="danger" link size="small" @click.stop="handleDelete(data)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </span>
              </div>
            </template>
          </el-tree>
        </el-card>
      </el-col>
      
      <!-- 右侧：分类详情/编辑 -->
      <el-col :span="14">
        <el-card>
          <template #header>
            <span>{{ currentCategory ? '编辑分类' : '分类详情' }}</span>
          </template>
          
          <el-form 
            v-if="currentCategory" 
            :model="formData" 
            :rules="formRules" 
            ref="formRef" 
            label-width="100px"
          >
            <el-form-item label="分类名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入分类名称" />
            </el-form-item>
            
            <el-form-item label="分类编码" prop="code">
              <el-input v-model="formData.code" placeholder="请输入分类编码（英文）" />
            </el-form-item>
            
            <el-form-item label="父级分类">
              <el-cascader
                v-model="formData.parentId"
                :options="categoryTree"
                :props="{ checkStrictly: true, emitPath: false, value: 'id', label: 'name' }"
                placeholder="选择父级分类（不选则为根分类）"
                clearable
                style="width: 100%"
              />
            </el-form-item>
            
            <el-form-item label="分类图标">
              <el-input v-model="formData.icon" placeholder="图标类名或URL">
                <template #prepend>
                  <el-icon v-if="formData.icon"><component :is="formData.icon" /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            
            <el-form-item label="排序">
              <el-input-number v-model="formData.sort" :min="0" :max="999" />
            </el-form-item>
            
            <el-form-item label="分类描述">
              <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="分类描述" />
            </el-form-item>
            
            <el-form-item label="状态">
              <el-switch v-model="formData.enabled" active-text="启用" inactive-text="禁用" />
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="handleSubmit">保存</el-button>
              <el-button @click="handleCancel">取消</el-button>
            </el-form-item>
          </el-form>
          
          <el-empty v-else description="请选择或新建分类" />
        </el-card>
        
        <!-- 分类统计 -->
        <el-card style="margin-top: 16px" v-if="selectedCategory">
          <template #header>分类统计</template>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-statistic title="视频数量" :value="selectedCategory.videoCount || 0" />
            </el-col>
            <el-col :span="8">
              <el-statistic title="总播放量" :value="selectedCategory.playCount || 0" />
            </el-col>
            <el-col :span="8">
              <el-statistic title="子分类数" :value="selectedCategory.children?.length || 0" />
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { Plus, Edit, Delete, Folder } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import type { DropType } from 'element-plus/es/components/tree/src/tree.type'

interface Category {
  id: string
  name: string
  code: string
  parentId: string | null
  icon: string
  sort: number
  description: string
  enabled: boolean
  videoCount?: number
  playCount?: number
  children?: Category[]
}

const treeRef = ref()
const formRef = ref<FormInstance>()
const currentCategory = ref<Category | null>(null)
const selectedCategory = ref<Category | null>(null)
const isEdit = ref(false)

// 分类树数据
const categoryTree = ref<Category[]>([
  {
    id: 'cat-1',
    name: '前端开发',
    code: 'frontend',
    parentId: null,
    icon: 'Monitor',
    sort: 1,
    description: '前端开发相关教程',
    enabled: true,
    videoCount: 128,
    playCount: 45600,
    children: [
      { id: 'cat-1-1', name: 'Vue.js', code: 'vue', parentId: 'cat-1', icon: '', sort: 1, description: '', enabled: true, videoCount: 45 },
      { id: 'cat-1-2', name: 'React', code: 'react', parentId: 'cat-1', icon: '', sort: 2, description: '', enabled: true, videoCount: 38 },
      { id: 'cat-1-3', name: 'Angular', code: 'angular', parentId: 'cat-1', icon: '', sort: 3, description: '', enabled: true, videoCount: 25 },
      { id: 'cat-1-4', name: 'TypeScript', code: 'typescript', parentId: 'cat-1', icon: '', sort: 4, description: '', enabled: true, videoCount: 20 }
    ]
  },
  {
    id: 'cat-2',
    name: '后端开发',
    code: 'backend',
    parentId: null,
    icon: 'Cpu',
    sort: 2,
    description: '后端开发相关教程',
    enabled: true,
    videoCount: 96,
    playCount: 32100,
    children: [
      { id: 'cat-2-1', name: 'Node.js', code: 'nodejs', parentId: 'cat-2', icon: '', sort: 1, description: '', enabled: true, videoCount: 35 },
      { id: 'cat-2-2', name: 'Java', code: 'java', parentId: 'cat-2', icon: '', sort: 2, description: '', enabled: true, videoCount: 42 },
      { id: 'cat-2-3', name: 'Python', code: 'python', parentId: 'cat-2', icon: '', sort: 3, description: '', enabled: true, videoCount: 19 }
    ]
  },
  {
    id: 'cat-3',
    name: '数据库',
    code: 'database',
    parentId: null,
    icon: 'Coin',
    sort: 3,
    description: '数据库相关教程',
    enabled: true,
    videoCount: 54,
    playCount: 18900
  },
  {
    id: 'cat-4',
    name: '运维部署',
    code: 'devops',
    parentId: null,
    icon: 'Setting',
    sort: 4,
    description: 'DevOps相关教程',
    enabled: true,
    videoCount: 32,
    playCount: 12500
  }
])

const formData = reactive<Omit<Category, 'children' | 'videoCount' | 'playCount'>>({
  id: '',
  name: '',
  code: '',
  parentId: null,
  icon: '',
  sort: 0,
  description: '',
  enabled: true
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入分类编码', trigger: 'blur' }]
}

function handleNodeClick(data: Category) {
  selectedCategory.value = data
}

function handleAdd(parent: Category | null) {
  isEdit.value = false
  currentCategory.value = { id: '', name: '', code: '', parentId: parent?.id || null, icon: '', sort: 0, description: '', enabled: true }
  Object.assign(formData, {
    id: '',
    name: '',
    code: '',
    parentId: parent?.id || null,
    icon: '',
    sort: 0,
    description: '',
    enabled: true
  })
}

function handleEdit(data: Category) {
  isEdit.value = true
  currentCategory.value = data
  selectedCategory.value = data
  Object.assign(formData, {
    id: data.id,
    name: data.name,
    code: data.code,
    parentId: data.parentId,
    icon: data.icon,
    sort: data.sort,
    description: data.description,
    enabled: data.enabled
  })
}

async function handleDelete(data: Category) {
  try {
    await ElMessageBox.confirm(
      `确定要删除分类 "${data.name}" 吗？${data.children?.length ? '该操作将同时删除所有子分类！' : ''}`,
      '提示',
      { type: 'warning' }
    )
    ElMessage.success('删除成功')
    // 这里应该调用API删除分类
  } catch {}
}

async function handleSubmit() {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
      currentCategory.value = null
    }
  })
}

function handleCancel() {
  currentCategory.value = null
  formRef.value?.resetFields()
}

// 拖拽控制
function allowDrop(draggingNode: any, dropNode: any, type: DropType) {
  // 限制只能拖到最多2级
  if (type === 'inner' && dropNode.level >= 2) {
    return false
  }
  return true
}

function handleDrop() {
  ElMessage.success('分类排序已更新')
}
</script>

<style scoped lang="scss">
.video-category-page {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .tree-node {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-right: 8px;
    
    .node-label {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .node-actions {
      display: none;
    }
    
    &:hover .node-actions {
      display: flex;
    }
  }
  
  :deep(.el-tree-node__content) {
    height: 40px;
  }
  
  :deep(.el-statistic__head) {
    font-size: 13px;
    color: var(--color-text-tertiary);
  }
  
  :deep(.el-statistic__content) {
    font-size: 24px;
    color: var(--color-text-primary);
  }
}
</style>
