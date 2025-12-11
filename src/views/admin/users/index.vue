<template>
  <div class="user-management-page">
    <!-- 搜索筛选 -->
    <el-card class="filter-card">
      <el-form :model="queryParams" inline>
        <el-form-item label="关键词">
          <el-input 
            v-model="queryParams.keyword" 
            placeholder="用户名/邮箱/手机号" 
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="正常" value="active" />
            <el-option label="禁用" value="disabled" />
            <el-option label="锁定" value="locked" />
          </el-select>
        </el-form-item>
        <el-form-item label="部门">
          <el-select v-model="queryParams.deptId" placeholder="全部" clearable style="width: 120px">
            <el-option label="技术部" value="tech" />
            <el-option label="产品部" value="product" />
            <el-option label="运营部" value="operation" />
          </el-select>
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="queryParams.roleId" placeholder="全部" clearable style="width: 120px">
            <el-option label="管理员" value="admin" />
            <el-option label="编辑" value="editor" />
            <el-option label="用户" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 用户列表 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
          <div class="header-actions">
            <el-button type="primary" :icon="Plus" @click="handleAdd">新增用户</el-button>
            <el-button type="danger" :icon="Delete" :disabled="!selectedIds.length" @click="handleBatchDelete">
              批量删除
            </el-button>
          </div>
        </div>
      </template>
      
      <el-table 
        :data="tableData" 
        v-loading="loading"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="用户信息" min-width="200">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="40" :src="row.avatar">{{ row.nickname?.charAt(0) }}</el-avatar>
              <div class="info">
                <span class="name">{{ row.nickname }}</span>
                <span class="username">@{{ row.username }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column label="部门" width="120">
          <template #default="{ row }">
            <span>{{ row.deptName || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="角色" width="120">
          <template #default="{ row }">
            <el-tag v-for="role in row.roleNames" :key="role" size="small" class="role-tag">
              {{ role }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              active-value="active"
              inactive-value="disabled"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="积分" width="80">
          <template #default="{ row }">
            <span class="points">{{ row.points }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="注册时间" width="170" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <div class="action-row">
                <el-button size="small" type="primary" link @click="handleEdit(row)">
                  <el-icon><Edit /></el-icon>编辑
                </el-button>
                <el-button size="small" type="success" link @click="showLoginLog(row)">
                  <el-icon><Clock /></el-icon>日志
                </el-button>
              </div>
              <div class="action-row">
                <el-button size="small" type="warning" link @click="handleResetPassword(row)">
                  <el-icon><Key /></el-icon>重置密码
                </el-button>
                <el-button size="small" type="danger" link @click="handleDelete(row)">
                  <el-icon><Delete /></el-icon>删除
                </el-button>
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>
    
    <!-- 新增/编辑弹窗 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="isEdit ? '编辑用户' : '新增用户'" 
      width="500px"
      destroy-on-close
    >
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" placeholder="请输入用户名" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="formData.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input v-model="formData.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="部门" prop="deptId">
          <el-select v-model="formData.deptId" placeholder="请选择部门" style="width: 100%">
            <el-option label="技术部" value="tech" />
            <el-option label="产品部" value="product" />
            <el-option label="运营部" value="operation" />
            <el-option label="内容部" value="content" />
          </el-select>
        </el-form-item>
        <el-form-item label="角色" prop="roles">
          <el-select v-model="formData.roles" multiple placeholder="请选择角色">
            <el-option label="管理员" value="admin" />
            <el-option label="编辑" value="editor" />
            <el-option label="用户" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="formData.status">
            <el-radio value="active">正常</el-radio>
            <el-radio value="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>
    
    <!-- 登录日志弹窗 -->
    <el-dialog v-model="loginLogVisible" title="登录日志" width="700px">
      <el-timeline>
        <el-timeline-item
          v-for="log in loginLogs"
          :key="log.id"
          :timestamp="log.time"
          :type="log.success ? 'success' : 'danger'"
          placement="top"
        >
          <div class="log-item">
            <div class="log-header">
              <el-tag :type="log.success ? 'success' : 'danger'" size="small">
                {{ log.success ? '登录成功' : '登录失败' }}
              </el-tag>
              <span class="log-ip">IP: {{ log.ip }}</span>
            </div>
            <div class="log-detail">
              <span>地区: {{ log.location }}</span>
              <span>设备: {{ log.device }}</span>
              <span>浏览器: {{ log.browser }}</span>
            </div>
            <div class="log-reason" v-if="!log.success">失败原因: {{ log.reason }}</div>
          </div>
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Plus, Delete, Search, Refresh, Edit, Key, Clock } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { userApi } from '@/services/api'
import type { UserListItem, UserQueryParams } from '@/types/user'

// 加载状态
const loading = ref(false)
const submitLoading = ref(false)

// 查询参数
const queryParams = reactive<UserQueryParams>({
  keyword: '',
  status: '',
  roleId: '',
  deptId: '',
  pageNum: 1,
  pageSize: 10
})

// 表格数据
const tableData = ref<UserListItem[]>([])
const total = ref(0)
const selectedIds = ref<string[]>([])

// 弹窗
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()

// 表单数据
const formData = reactive({
  id: '',
  username: '',
  nickname: '',
  email: '',
  phone: '',
  password: '',
  deptId: '',
  roles: [] as string[],
  status: 'active' as 'active' | 'disabled'
})

// 表单验证规则
const formRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3-20 个字符', trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6-20 个字符', trigger: 'blur' }
  ],
  roles: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

// 加载数据
async function loadData() {
  loading.value = true
  try {
    // 使用API服务层调用，便于后续切换到真实API
    const result = await userApi.getUserList({
      ...queryParams,
      keyword: queryParams.keyword || undefined
    })
    tableData.value = result.list
    total.value = result.total
  } catch (error) {
    console.error('加载用户列表失败', error)
    ElMessage.error('加载用户列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 搜索
function handleSearch() {
  queryParams.pageNum = 1
  loadData()
}

// 重置
function handleReset() {
  queryParams.keyword = ''
  queryParams.status = ''
  queryParams.roleId = ''
  queryParams.deptId = ''
  queryParams.pageNum = 1
  loadData()
}

// 选择变化
function handleSelectionChange(selection: UserListItem[]) {
  selectedIds.value = selection.map(item => item.id)
}

// 新增
function handleAdd() {
  isEdit.value = false
  Object.assign(formData, {
    id: '',
    username: '',
    nickname: '',
    email: '',
    phone: '',
    password: '',
    deptId: '',
    roles: ['user'],
    status: 'active'
  })
  dialogVisible.value = true
}

// 编辑
function handleEdit(row: UserListItem) {
  isEdit.value = true
  Object.assign(formData, {
    id: row.id,
    username: row.username,
    nickname: row.nickname,
    email: row.email,
    phone: row.phone,
    password: '',
    deptId: (row as any).deptId || '',
    roles: row.roles,
    status: row.status
  })
  dialogVisible.value = true
}

// 提交
async function handleSubmit() {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitLoading.value = true
    try {
      // 模拟保存
      await new Promise(resolve => setTimeout(resolve, 500))
      ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
      dialogVisible.value = false
      loadData()
    } catch (error) {
      ElMessage.error('操作失败')
    } finally {
      submitLoading.value = false
    }
  })
}

// 删除
async function handleDelete(row: UserListItem) {
  try {
    await ElMessageBox.confirm(`确定要删除用户 "${row.nickname}" 吗？`, '提示', {
      type: 'warning'
    })
    
    // 模拟删除
    ElMessage.success('删除成功')
    loadData()
  } catch {
    // 取消
  }
}

// 批量删除
async function handleBatchDelete() {
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 个用户吗？`, '提示', {
      type: 'warning'
    })
    
    ElMessage.success('批量删除成功')
    loadData()
  } catch {
    // 取消
  }
}

// 状态变化
function handleStatusChange(row: UserListItem) {
  ElMessage.success(`用户 "${row.nickname}" 已${row.status === 'active' ? '启用' : '禁用'}`)
}

// 重置密码
async function handleResetPassword(row: UserListItem) {
  try {
    await ElMessageBox.confirm(`确定要重置用户 "${row.nickname}" 的密码吗？`, '提示', {
      type: 'warning'
    })
    
    ElMessage.success('密码已重置为: 123456')
  } catch {
    // 取消
  }
}

// 登录日志
const loginLogVisible = ref(false)
const loginLogs = ref<{
  id: string
  time: string
  ip: string
  location: string
  device: string
  browser: string
  success: boolean
  reason?: string
}[]>([])

// 显示登录日志
function showLoginLog(row: UserListItem) {
  loginLogs.value = [
    { id: '1', time: '2024-01-15 14:30:00', ip: '192.168.1.100', location: '北京', device: 'Windows 11', browser: 'Chrome 120', success: true },
    { id: '2', time: '2024-01-15 10:15:00', ip: '192.168.1.100', location: '北京', device: 'Windows 11', browser: 'Chrome 120', success: true },
    { id: '3', time: '2024-01-14 18:45:00', ip: '45.32.12.89', location: '未知', device: 'Unknown', browser: 'Unknown', success: false, reason: '密码错误' },
    { id: '4', time: '2024-01-14 09:00:00', ip: '192.168.1.100', location: '北京', device: 'Windows 11', browser: 'Chrome 120', success: true },
  ]
  loginLogVisible.value = true
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-row {
  display: flex;
  gap: 8px;
}

.user-management-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  .filter-card {
    :deep(.el-card__body) {
      padding-bottom: 8px;
    }
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .header-actions {
      display: flex;
      gap: 12px;
    }
  }
  
  .user-info {
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
      
      .username {
        font-size: 12px;
        color: var(--color-text-tertiary);
      }
    }
  }
  
  .role-tag {
    margin-right: 4px;
  }
  
  .points {
    color: #e6a23c;
    font-weight: 500;
  }
  
  .pagination-wrap {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }
  
  .log-item {
    .log-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
      
      .log-ip {
        color: var(--color-text-secondary);
        font-size: 13px;
      }
    }
    
    .log-detail {
      display: flex;
      gap: 16px;
      font-size: 13px;
      color: var(--color-text-tertiary);
    }
    
    .log-reason {
      margin-top: 4px;
      font-size: 13px;
      color: #f56c6c;
    }
  }
}
</style>
