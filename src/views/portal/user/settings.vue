<template>
  <div class="user-settings">
    <h3 class="section-title">账号安全</h3>
    
    <div class="setting-item">
      <div class="setting-info">
        <span class="setting-label">登录密码</span>
        <span class="setting-value">已设置</span>
      </div>
      <el-button text type="primary" @click="showPasswordDialog = true">修改</el-button>
    </div>
    
    <div class="setting-item">
      <div class="setting-info">
        <span class="setting-label">绑定邮箱</span>
        <span class="setting-value">{{ userInfo?.email || '未绑定' }}</span>
      </div>
      <el-button text type="primary">修改</el-button>
    </div>
    
    <div class="setting-item">
      <div class="setting-info">
        <span class="setting-label">绑定手机</span>
        <span class="setting-value">{{ userInfo?.phone || '未绑定' }}</span>
      </div>
      <el-button text type="primary">绑定</el-button>
    </div>
    
    <h3 class="section-title">偏好设置</h3>
    
    <div class="setting-item">
      <div class="setting-info">
        <span class="setting-label">消息通知</span>
        <span class="setting-desc">接收系统通知和消息提醒</span>
      </div>
      <el-switch v-model="settings.notification" />
    </div>
    
    <div class="setting-item">
      <div class="setting-info">
        <span class="setting-label">邮件订阅</span>
        <span class="setting-desc">接收最新资讯和课程推荐</span>
      </div>
      <el-switch v-model="settings.emailSubscribe" />
    </div>
    
    <h3 class="section-title danger">危险操作</h3>
    
    <div class="setting-item danger">
      <div class="setting-info">
        <span class="setting-label">退出登录</span>
        <span class="setting-desc">退出当前账号</span>
      </div>
      <el-button type="danger" @click="handleLogout">退出</el-button>
    </div>
    
    <!-- 修改密码弹窗 -->
    <el-dialog v-model="showPasswordDialog" title="修改密码" width="400px">
      <el-form :model="passwordForm" label-width="80px">
        <el-form-item label="原密码">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="passwordForm.newPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPasswordDialog = false">取消</el-button>
        <el-button type="primary" @click="handleChangePassword">确认修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/modules/user'

const router = useRouter()
const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

const showPasswordDialog = ref(false)

const settings = reactive({
  notification: true,
  emailSubscribe: false,
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

function handleChangePassword() {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    ElMessage.error('两次密码不一致')
    return
  }
  ElMessage.success('密码修改成功')
  showPasswordDialog.value = false
}

async function handleLogout() {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', { type: 'warning' })
    await userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  } catch {
    // 取消
  }
}
</script>

<style scoped lang="scss">
.user-settings {
  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--color-border);
    
    &:not(:first-child) {
      margin-top: 32px;
    }
    
    &.danger {
      color: #f56c6c;
    }
  }
  
  .setting-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 0;
    border-bottom: 1px solid var(--color-border);
    
    &:last-of-type {
      border-bottom: none;
    }
    
    &.danger {
      border-bottom: none;
    }
    
    .setting-info {
      .setting-label {
        display: block;
        font-size: 15px;
        font-weight: 500;
        color: var(--color-text-primary);
      }
      
      .setting-value {
        font-size: 13px;
        color: var(--color-text-tertiary);
      }
      
      .setting-desc {
        font-size: 13px;
        color: var(--color-text-tertiary);
      }
    }
  }
}
</style>
