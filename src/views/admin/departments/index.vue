<template>
  <div class="department-page">
    <el-row :gutter="16">
      <!-- 左侧：部门树 -->
      <el-col :span="10">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>组织架构</span>
              <el-button type="primary" size="small" :icon="Plus" @click="handleAddDept(null)">新增部门</el-button>
            </div>
          </template>
          
          <el-input v-model="searchKeyword" placeholder="搜索部门..." clearable :prefix-icon="Search" style="margin-bottom: 16px" />
          
          <el-tree
            ref="treeRef"
            :data="deptTree"
            node-key="id"
            :props="{ label: 'name', children: 'children' }"
            default-expand-all
            highlight-current
            :expand-on-click-node="false"
            @node-click="handleNodeClick"
          >
            <template #default="{ node, data }">
              <div class="tree-node">
                <div class="node-content">
                  <el-icon><OfficeBuilding /></el-icon>
                  <span class="node-name">{{ data.name }}</span>
                  <el-tag size="small" type="info">{{ data.memberCount }}人</el-tag>
                </div>
                <div class="node-actions">
                  <el-button size="small" type="primary" link :icon="Plus" @click.stop="handleAddDept(data)" />
                  <el-button size="small" type="primary" link :icon="Edit" @click.stop="handleEditDept(data)" />
                  <el-button size="small" type="danger" link :icon="Delete" @click.stop="handleDeleteDept(data)" v-if="!data.children?.length" />
                </div>
              </div>
            </template>
          </el-tree>
        </el-card>
      </el-col>
      
      <!-- 右侧：部门详情 -->
      <el-col :span="14">
        <!-- 部门信息 -->
        <el-card v-if="currentDept">
          <template #header>
            <div class="card-header">
              <span>部门信息</span>
              <el-button type="primary" size="small" @click="handleEditDept(currentDept)">编辑</el-button>
            </div>
          </template>
          
          <el-descriptions :column="2" border>
            <el-descriptions-item label="部门名称">{{ currentDept.name }}</el-descriptions-item>
            <el-descriptions-item label="部门编码">{{ currentDept.code }}</el-descriptions-item>
            <el-descriptions-item label="上级部门">{{ currentDept.parentName || '无' }}</el-descriptions-item>
            <el-descriptions-item label="部门负责人">
              <div class="leader-info" v-if="currentDept.leader">
                <el-avatar :size="24" :src="currentDept.leader.avatar">{{ currentDept.leader.name?.charAt(0) }}</el-avatar>
                <span>{{ currentDept.leader.name }}</span>
              </div>
              <span v-else class="text-tertiary">未设置</span>
            </el-descriptions-item>
            <el-descriptions-item label="成员数量">{{ currentDept.memberCount }} 人</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ currentDept.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="部门描述" :span="2">{{ currentDept.description || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
        
        <!-- 部门成员 -->
        <el-card style="margin-top: 16px" v-if="currentDept">
          <template #header>
            <div class="card-header">
              <span>部门成员</span>
              <el-button type="primary" size="small" :icon="Plus">添加成员</el-button>
            </div>
          </template>
          
          <el-table :data="deptMembers" stripe>
            <el-table-column label="成员" min-width="180">
              <template #default="{ row }">
                <div class="member-info">
                  <el-avatar :size="32" :src="row.avatar">{{ row.name?.charAt(0) }}</el-avatar>
                  <div class="info">
                    <span class="name">{{ row.name }}</span>
                    <span class="title">{{ row.title }}</span>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="email" label="邮箱" min-width="180" />
            <el-table-column label="角色" width="100">
              <template #default="{ row }">
                <el-tag :type="row.isLeader ? 'warning' : 'info'" size="small">
                  {{ row.isLeader ? '负责人' : '成员' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="joinDate" label="加入时间" width="120" />
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <div class="action-buttons">
                  <el-button size="small" type="primary" link class="action-btn">调岗</el-button>
                  <el-button size="small" type="danger" link class="action-btn">移除</el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
        
        <!-- 部门统计 -->
        <el-card style="margin-top: 16px" v-if="currentDept">
          <template #header>部门统计分析</template>
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-value">{{ currentDept.memberCount }}</div>
                <div class="stat-label">在职人数</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-value">{{ currentDept.children?.length || 0 }}</div>
                <div class="stat-label">子部门数</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-value">{{ Math.round(Math.random() * 50 + 50) }}%</div>
                <div class="stat-label">考勤达标率</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-value">{{ Math.round(Math.random() * 30 + 70) }}%</div>
                <div class="stat-label">任务完成率</div>
              </div>
            </el-col>
          </el-row>
        </el-card>
        
        <el-empty v-if="!currentDept" description="请选择一个部门" />
      </el-col>
    </el-row>
    
    <!-- 部门编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑部门' : '新增部门'" width="500px">
      <el-form :model="deptForm" :rules="deptFormRules" ref="deptFormRef" label-width="100px">
        <el-form-item label="上级部门">
          <el-tree-select
            v-model="deptForm.parentId"
            :data="deptTree"
            :props="{ label: 'name', value: 'id' }"
            placeholder="选择上级部门（不选则为顶级）"
            clearable
            check-strictly
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="部门名称" prop="name">
          <el-input v-model="deptForm.name" placeholder="请输入部门名称" />
        </el-form-item>
        <el-form-item label="部门编码" prop="code">
          <el-input v-model="deptForm.code" placeholder="请输入部门编码" />
        </el-form-item>
        <el-form-item label="部门负责人">
          <el-select v-model="deptForm.leaderId" placeholder="选择负责人" clearable style="width: 100%">
            <el-option v-for="user in userList" :key="user.id" :label="user.name" :value="user.id">
              <div class="user-option">
                <el-avatar :size="24" :src="user.avatar">{{ user.name?.charAt(0) }}</el-avatar>
                <span>{{ user.name }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="deptForm.sort" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="部门描述">
          <el-input v-model="deptForm.description" type="textarea" :rows="3" placeholder="请输入部门描述" />
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
import { ref, reactive } from 'vue'
import { Plus, Edit, Delete, Search, OfficeBuilding } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'

interface Leader {
  id: string
  name: string
  avatar: string
}

interface Department {
  id: string
  name: string
  code: string
  parentId: string | null
  parentName?: string
  description: string
  memberCount: number
  createdAt: string
  leader?: Leader
  children?: Department[]
}

interface Member {
  id: string
  name: string
  avatar: string
  title: string
  email: string
  isLeader: boolean
  joinDate: string
}

const treeRef = ref()
const searchKeyword = ref('')
const currentDept = ref<Department | null>(null)
const dialogVisible = ref(false)
const isEdit = ref(false)
const deptFormRef = ref<FormInstance>()

// 部门树
const deptTree = ref<Department[]>([
  {
    id: '1',
    name: '知识库平台',
    code: 'root',
    parentId: null,
    description: '公司根组织',
    memberCount: 128,
    createdAt: '2023-01-01',
    leader: { id: '1', name: '张总', avatar: '' },
    children: [
      {
        id: '2',
        name: '技术部',
        code: 'tech',
        parentId: '1',
        parentName: '知识库平台',
        description: '负责技术研发',
        memberCount: 45,
        createdAt: '2023-01-15',
        leader: { id: '2', name: '李工', avatar: '' },
        children: [
          { id: '21', name: '前端组', code: 'frontend', parentId: '2', parentName: '技术部', description: '', memberCount: 15, createdAt: '2023-02-01', leader: { id: '3', name: '王前端', avatar: '' } },
          { id: '22', name: '后端组', code: 'backend', parentId: '2', parentName: '技术部', description: '', memberCount: 18, createdAt: '2023-02-01', leader: { id: '4', name: '赵后端', avatar: '' } },
          { id: '23', name: '测试组', code: 'qa', parentId: '2', parentName: '技术部', description: '', memberCount: 8, createdAt: '2023-02-01' },
          { id: '24', name: '运维组', code: 'ops', parentId: '2', parentName: '技术部', description: '', memberCount: 4, createdAt: '2023-03-01' },
        ]
      },
      {
        id: '3',
        name: '产品部',
        code: 'product',
        parentId: '1',
        parentName: '知识库平台',
        description: '负责产品设计',
        memberCount: 20,
        createdAt: '2023-01-15',
        leader: { id: '5', name: '周产品', avatar: '' }
      },
      {
        id: '4',
        name: '运营部',
        code: 'operation',
        parentId: '1',
        parentName: '知识库平台',
        description: '负责平台运营',
        memberCount: 35,
        createdAt: '2023-01-15'
      },
      {
        id: '5',
        name: '内容部',
        code: 'content',
        parentId: '1',
        parentName: '知识库平台',
        description: '负责内容创作与审核',
        memberCount: 28,
        createdAt: '2023-02-01'
      }
    ]
  }
])

// 部门成员
const deptMembers = ref<Member[]>([
  { id: '1', name: '李工', avatar: '', title: '技术总监', email: 'li@example.com', isLeader: true, joinDate: '2023-01' },
  { id: '2', name: '张开发', avatar: '', title: '高级工程师', email: 'zhang@example.com', isLeader: false, joinDate: '2023-03' },
  { id: '3', name: '王前端', avatar: '', title: '前端工程师', email: 'wang@example.com', isLeader: false, joinDate: '2023-05' },
  { id: '4', name: '赵后端', avatar: '', title: '后端工程师', email: 'zhao@example.com', isLeader: false, joinDate: '2023-06' },
])

// 用户列表（用于选择负责人）
const userList = ref([
  { id: '1', name: '张总', avatar: '' },
  { id: '2', name: '李工', avatar: '' },
  { id: '3', name: '王前端', avatar: '' },
  { id: '4', name: '赵后端', avatar: '' },
  { id: '5', name: '周产品', avatar: '' },
])

// 表单
const deptForm = reactive({
  id: '',
  parentId: null as string | null,
  name: '',
  code: '',
  leaderId: '',
  sort: 0,
  description: ''
})

const deptFormRules: FormRules = {
  name: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入部门编码', trigger: 'blur' }]
}

function handleNodeClick(data: Department) {
  currentDept.value = data
}

function handleAddDept(parent: Department | null) {
  isEdit.value = false
  Object.assign(deptForm, {
    id: '',
    parentId: parent?.id || null,
    name: '',
    code: '',
    leaderId: '',
    sort: 0,
    description: ''
  })
  dialogVisible.value = true
}

function handleEditDept(dept: Department) {
  isEdit.value = true
  Object.assign(deptForm, {
    id: dept.id,
    parentId: dept.parentId,
    name: dept.name,
    code: dept.code,
    leaderId: dept.leader?.id || '',
    sort: 0,
    description: dept.description
  })
  dialogVisible.value = true
}

function handleDeleteDept(dept: Department) {
  ElMessageBox.confirm(`确定要删除部门 "${dept.name}" 吗？`, '警告', { type: 'error' })
    .then(() => {
      ElMessage.success('删除成功')
    }).catch(() => {})
}

function handleSubmit() {
  if (!deptFormRef.value) return
  deptFormRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
      dialogVisible.value = false
    }
  })
}
</script>

<style scoped lang="scss">
.department-page {
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
    
    .node-content {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .node-name {
        font-weight: 500;
      }
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
  
  .leader-info {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .text-tertiary {
    color: var(--color-text-tertiary);
  }
  
  .member-info {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .info {
      display: flex;
      flex-direction: column;
      
      .name {
        font-weight: 500;
        color: var(--color-text-primary);
      }
      
      .title {
        font-size: 12px;
        color: var(--color-text-tertiary);
      }
    }
  }
  
  .stat-item {
    text-align: center;
    padding: 16px;
    background: var(--color-bg-secondary);
    border-radius: 8px;
    
    .stat-value {
      font-size: 28px;
      font-weight: 600;
      color: var(--color-primary);
    }
    
    .stat-label {
      font-size: 13px;
      color: var(--color-text-tertiary);
      margin-top: 4px;
    }
  }
  
  .user-option {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 2px;
    width: 100%;
    padding: 0;
    margin: 0;
    align-items: flex-start;
  }
  
  .action-btn {
    padding: 2px 0;
    margin: 0;
    min-width: 60px;
    text-align: left;
    display: block;
    line-height: 1.5;
    height: auto;
  }
}
</style>
