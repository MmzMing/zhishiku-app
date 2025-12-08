<template>
  <div class="role-management-page">
    <el-row :gutter="16">
      <!-- 左侧：角色列表 -->
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>角色列表</span>
              <el-button type="primary" size="small" :icon="Plus" @click="handleAddRole">新增角色</el-button>
            </div>
          </template>
          
          <div class="role-list">
            <div 
              v-for="role in roleList" 
              :key="role.id"
              class="role-item"
              :class="{ active: currentRole?.id === role.id }"
              @click="selectRole(role)"
            >
              <div class="role-info">
                <div class="role-name">
                  <el-icon><Key /></el-icon>
                  <span>{{ role.name }}</span>
                  <el-tag v-if="role.isSystem" size="small" type="info">系统</el-tag>
                </div>
                <div class="role-desc">{{ role.description }}</div>
                <div class="role-meta">
                  <span>{{ role.userCount }} 人</span>
                  <span>{{ role.permissionCount }} 权限</span>
                </div>
              </div>
              <div class="role-actions" v-if="!role.isSystem">
                <el-button size="small" type="primary" link :icon="Edit" @click.stop="handleEditRole(role)" />
                <el-button size="small" type="danger" link :icon="Delete" @click.stop="handleDeleteRole(role)" />
              </div>
            </div>
          </div>
        </el-card>
        
        <!-- 权限变更日志 -->
        <el-card style="margin-top: 16px">
          <template #header>
            <div class="card-header">
              <span>权限变更日志</span>
              <el-button text size="small" :icon="Refresh">刷新</el-button>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="log in permissionLogs"
              :key="log.id"
              :timestamp="log.time"
              :type="log.action === 'grant' ? 'success' : 'danger'"
              placement="top"
            >
              <div class="log-item">
                <span class="operator">{{ log.operator }}</span>
                <span class="action">{{ log.action === 'grant' ? '授予' : '撤销' }}</span>
                <span class="target">{{ log.roleName }}</span>
                <span class="permission">{{ log.permission }}</span>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
      
      <!-- 右侧：权限配置 -->
      <el-col :span="16">
        <el-card v-if="currentRole">
          <template #header>
            <div class="card-header">
              <div class="header-left">
                <span>权限配置</span>
                <el-tag type="primary">{{ currentRole.name }}</el-tag>
              </div>
              <div class="header-right">
                <el-button type="primary" @click="savePermissions" :disabled="currentRole.isSystem">
                  保存权限
                </el-button>
              </div>
            </div>
          </template>
          
          <!-- 权限树 -->
          <div class="permission-tree">
            <div class="permission-group" v-for="group in permissionGroups" :key="group.code">
              <div class="group-header">
                <el-checkbox 
                  v-model="group.checked" 
                  :indeterminate="group.indeterminate"
                  @change="handleGroupChange(group)"
                  :disabled="currentRole.isSystem"
                >
                  <span class="group-title">{{ group.name }}</span>
                </el-checkbox>
              </div>
              <div class="group-permissions">
                <el-checkbox-group v-model="group.selectedPermissions" @change="handlePermissionChange(group)">
                  <el-checkbox 
                    v-for="perm in group.permissions" 
                    :key="perm.code" 
                    :value="perm.code"
                    :disabled="currentRole.isSystem"
                  >
                    <span class="perm-name">{{ perm.name }}</span>
                    <span class="perm-code">{{ perm.code }}</span>
                  </el-checkbox>
                </el-checkbox-group>
              </div>
            </div>
          </div>
        </el-card>
        
        <!-- 角色继承 -->
        <el-card style="margin-top: 16px" v-if="currentRole">
          <template #header>
            <div class="card-header">
              <span>角色继承与组合</span>
            </div>
          </template>
          
          <el-form label-width="100px">
            <el-form-item label="继承角色">
              <el-select v-model="currentRole.inheritFrom" multiple placeholder="选择要继承的角色" :disabled="currentRole.isSystem" style="width: 100%">
                <el-option 
                  v-for="role in roleList.filter(r => r.id !== currentRole?.id)" 
                  :key="role.id" 
                  :label="role.name" 
                  :value="role.id" 
                />
              </el-select>
              <div class="form-tip">继承的角色权限会自动合并到当前角色</div>
            </el-form-item>
            <el-form-item label="互斥角色">
              <el-select v-model="currentRole.mutuallyExclusive" multiple placeholder="选择互斥的角色" :disabled="currentRole.isSystem" style="width: 100%">
                <el-option 
                  v-for="role in roleList.filter(r => r.id !== currentRole?.id)" 
                  :key="role.id" 
                  :label="role.name" 
                  :value="role.id" 
                />
              </el-select>
              <div class="form-tip">用户不能同时拥有互斥的角色</div>
            </el-form-item>
          </el-form>
        </el-card>
        
        <el-empty v-if="!currentRole" description="请选择一个角色" />
      </el-col>
    </el-row>
    
    <!-- 角色编辑弹窗 -->
    <el-dialog v-model="roleDialogVisible" :title="isEditRole ? '编辑角色' : '新增角色'" width="500px">
      <el-form :model="roleForm" :rules="roleFormRules" ref="roleFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <el-input v-model="roleForm.code" placeholder="请输入角色编码（英文）" :disabled="isEditRole" />
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="roleForm.description" type="textarea" :rows="3" placeholder="请输入角色描述" />
        </el-form-item>
        <el-form-item label="数据权限">
          <el-select v-model="roleForm.dataScope" style="width: 100%">
            <el-option label="全部数据" value="all" />
            <el-option label="本部门数据" value="dept" />
            <el-option label="本部门及下级" value="deptAndChild" />
            <el-option label="仅本人数据" value="self" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="roleForm.enabled" active-text="启用" inactive-text="禁用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitRole">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Plus, Edit, Delete, Key, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'

interface Role {
  id: string
  name: string
  code: string
  description: string
  isSystem: boolean
  userCount: number
  permissionCount: number
  inheritFrom: string[]
  mutuallyExclusive: string[]
}

interface Permission {
  code: string
  name: string
}

interface PermissionGroup {
  code: string
  name: string
  permissions: Permission[]
  selectedPermissions: string[]
  checked: boolean
  indeterminate: boolean
}

const currentRole = ref<Role | null>(null)
const roleDialogVisible = ref(false)
const isEditRole = ref(false)
const roleFormRef = ref<FormInstance>()

// 角色列表
const roleList = ref<Role[]>([
  { id: '1', name: '超级管理员', code: 'super_admin', description: '系统最高权限', isSystem: true, userCount: 1, permissionCount: 50, inheritFrom: [], mutuallyExclusive: [] },
  { id: '2', name: '管理员', code: 'admin', description: '系统管理权限', isSystem: true, userCount: 5, permissionCount: 35, inheritFrom: [], mutuallyExclusive: [] },
  { id: '3', name: '编辑', code: 'editor', description: '内容编辑权限', isSystem: false, userCount: 12, permissionCount: 20, inheritFrom: ['4'], mutuallyExclusive: [] },
  { id: '4', name: '普通用户', code: 'user', description: '普通用户权限', isSystem: false, userCount: 1280, permissionCount: 8, inheritFrom: [], mutuallyExclusive: [] },
  { id: '5', name: 'VIP用户', code: 'vip', description: 'VIP会员权限', isSystem: false, userCount: 256, permissionCount: 15, inheritFrom: ['4'], mutuallyExclusive: [] },
])

// 权限分组
const permissionGroups = ref<PermissionGroup[]>([
  {
    code: 'user',
    name: '用户管理',
    permissions: [
      { code: 'user:list', name: '查看用户列表' },
      { code: 'user:create', name: '创建用户' },
      { code: 'user:edit', name: '编辑用户' },
      { code: 'user:delete', name: '删除用户' },
      { code: 'user:role', name: '分配角色' },
    ],
    selectedPermissions: ['user:list'],
    checked: false,
    indeterminate: true
  },
  {
    code: 'video',
    name: '视频管理',
    permissions: [
      { code: 'video:list', name: '查看视频列表' },
      { code: 'video:create', name: '上传视频' },
      { code: 'video:edit', name: '编辑视频' },
      { code: 'video:delete', name: '删除视频' },
      { code: 'video:audit', name: '审核视频' },
    ],
    selectedPermissions: ['video:list', 'video:create'],
    checked: false,
    indeterminate: true
  },
  {
    code: 'blog',
    name: '博客管理',
    permissions: [
      { code: 'blog:list', name: '查看博客列表' },
      { code: 'blog:create', name: '发布博客' },
      { code: 'blog:edit', name: '编辑博客' },
      { code: 'blog:delete', name: '删除博客' },
    ],
    selectedPermissions: ['blog:list', 'blog:create', 'blog:edit', 'blog:delete'],
    checked: true,
    indeterminate: false
  },
  {
    code: 'system',
    name: '系统管理',
    permissions: [
      { code: 'system:dict', name: '字典管理' },
      { code: 'system:config', name: '系统配置' },
      { code: 'system:log', name: '日志管理' },
      { code: 'system:monitor', name: '系统监控' },
    ],
    selectedPermissions: [],
    checked: false,
    indeterminate: false
  },
])

// 权限变更日志
const permissionLogs = ref([
  { id: '1', operator: 'admin', action: 'grant', roleName: '编辑', permission: '视频:审核', time: '10:30' },
  { id: '2', operator: 'admin', action: 'revoke', roleName: '用户', permission: '博客:删除', time: '09:15' },
  { id: '3', operator: 'system', action: 'grant', roleName: 'VIP', permission: '视频:下载', time: '昨天' },
])

// 角色表单
const roleForm = reactive({
  id: '',
  name: '',
  code: '',
  description: '',
  dataScope: 'self',
  enabled: true
})

const roleFormRules: FormRules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入角色编码', trigger: 'blur' }]
}

function selectRole(role: Role) {
  currentRole.value = role
}

function handleAddRole() {
  isEditRole.value = false
  Object.assign(roleForm, { id: '', name: '', code: '', description: '', dataScope: 'self', enabled: true })
  roleDialogVisible.value = true
}

function handleEditRole(role: Role) {
  isEditRole.value = true
  Object.assign(roleForm, { id: role.id, name: role.name, code: role.code, description: role.description, dataScope: 'self', enabled: true })
  roleDialogVisible.value = true
}

function handleDeleteRole(role: Role) {
  ElMessageBox.confirm(`确定要删除角色 "${role.name}" 吗？`, '警告', { type: 'error' })
    .then(() => {
      roleList.value = roleList.value.filter(r => r.id !== role.id)
      if (currentRole.value?.id === role.id) {
        currentRole.value = null
      }
      ElMessage.success('删除成功')
    }).catch(() => {})
}

function handleSubmitRole() {
  if (!roleFormRef.value) return
  roleFormRef.value.validate((valid) => {
    if (valid) {
      if (isEditRole.value) {
        const role = roleList.value.find(r => r.id === roleForm.id)
        if (role) {
          role.name = roleForm.name
          role.description = roleForm.description
        }
      } else {
        roleList.value.push({
          id: Date.now().toString(),
          name: roleForm.name,
          code: roleForm.code,
          description: roleForm.description,
          isSystem: false,
          userCount: 0,
          permissionCount: 0,
          inheritFrom: [],
          mutuallyExclusive: []
        })
      }
      ElMessage.success(isEditRole.value ? '编辑成功' : '新增成功')
      roleDialogVisible.value = false
    }
  })
}

function handleGroupChange(group: PermissionGroup) {
  if (group.checked) {
    group.selectedPermissions = group.permissions.map(p => p.code)
  } else {
    group.selectedPermissions = []
  }
  group.indeterminate = false
}

function handlePermissionChange(group: PermissionGroup) {
  const total = group.permissions.length
  const selected = group.selectedPermissions.length
  group.checked = selected === total
  group.indeterminate = selected > 0 && selected < total
}

function savePermissions() {
  ElMessage.success('权限保存成功')
}
</script>

<style scoped lang="scss">
.role-management-page {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }
  
  .role-list {
    .role-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
      margin-bottom: 8px;
      border: 1px solid transparent;
      
      &:hover {
        background: var(--color-bg-secondary);
        
        .role-actions {
          opacity: 1;
        }
      }
      
      &.active {
        background: var(--color-primary-light);
        border-color: var(--color-primary);
      }
      
      .role-info {
        flex: 1;
        
        .role-name {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
          color: var(--color-text-primary);
          margin-bottom: 4px;
        }
        
        .role-desc {
          font-size: 12px;
          color: var(--color-text-tertiary);
          margin-bottom: 4px;
        }
        
        .role-meta {
          display: flex;
          gap: 12px;
          font-size: 12px;
          color: var(--color-text-quaternary);
        }
      }
      
      .role-actions {
        opacity: 0;
        transition: opacity 0.3s;
      }
    }
  }
  
  .log-item {
    font-size: 13px;
    
    .operator {
      color: var(--color-primary);
      font-weight: 500;
    }
    
    .action {
      margin: 0 4px;
    }
    
    .target {
      color: var(--color-text-primary);
      font-weight: 500;
    }
    
    .permission {
      color: var(--color-text-secondary);
      margin-left: 4px;
    }
  }
  
  .permission-tree {
    .permission-group {
      margin-bottom: 20px;
      padding: 16px;
      background: var(--color-bg-secondary);
      border-radius: 8px;
      
      .group-header {
        margin-bottom: 12px;
        
        .group-title {
          font-weight: 500;
          font-size: 15px;
        }
      }
      
      .group-permissions {
        padding-left: 24px;
        
        .el-checkbox {
          display: flex;
          margin-bottom: 8px;
          
          .perm-name {
            margin-right: 8px;
          }
          
          .perm-code {
            font-size: 12px;
            color: var(--color-text-tertiary);
          }
        }
      }
    }
  }
  
  .form-tip {
    font-size: 12px;
    color: var(--color-text-tertiary);
    margin-top: 4px;
  }
}
</style>
