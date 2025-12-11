<template>
  <div class="user-settings">
    <!-- 账号安全区域 -->
    <div class="settings-section">
      <h3 class="section-title">账号安全</h3>
      <div class="settings-group">
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">登录密码</span>
            <span class="setting-value">已设置</span>
          </div>
          <el-button 
            type="primary" 
            size="small"
            class="account-button"
            :loading="loading" 
            @click="showPasswordDialog = true"
            :disabled="loading"
          >
            修改
          </el-button>
        </div>
        
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">绑定邮箱</span>
            <span class="setting-value">{{ userInfo?.email || '未绑定' }}</span>
          </div>
          <el-button 
            type="primary" 
            size="small"
            class="account-button"
            :loading="emailLoading" 
            @click="showEmailDialog = true"
            :disabled="emailLoading"
          >
            {{ userInfo?.email ? '修改' : '绑定' }}
          </el-button>
        </div>
        
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">绑定手机</span>
            <span class="setting-value">{{ userInfo?.phone || '未绑定' }}</span>
          </div>
          <el-button 
            type="primary" 
            size="small"
            class="account-button"
            :loading="phoneLoading" 
            @click="showPhoneDialog = true"
            :disabled="phoneLoading"
          >
            {{ userInfo?.phone ? '修改' : '绑定' }}
          </el-button>
        </div>
      </div>
    </div>
    
    <!-- 偏好设置区域 -->
    <div class="settings-section">
      <h3 class="section-title">偏好设置</h3>
      <div class="settings-group">
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
      </div>
    </div>
    
    <!-- 危险操作区域 -->
    <div class="settings-section">
      <h3 class="section-title danger">危险操作</h3>
      <div class="settings-group danger-group">
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">退出登录</span>
            <span class="setting-desc">退出当前账号</span>
          </div>
          <el-button type="danger" size="small" @click="handleLogout">退出</el-button>
        </div>
      </div>
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
        <el-button size="small" @click="showPasswordDialog = false">取消</el-button>
        <el-button size="small" type="primary" :loading="loading" @click="handleChangePassword">确认修改</el-button>
      </template>
    </el-dialog>
    
    <!-- 修改邮箱弹窗 -->
    <el-dialog v-model="showEmailDialog" :title="userInfo?.email ? '修改邮箱' : '绑定邮箱'" width="400px">
      <el-form :model="emailForm" label-width="80px">
        <el-form-item label="邮箱地址">
          <el-input v-model="emailForm.email" placeholder="请输入邮箱地址" clearable />
        </el-form-item>
        <el-form-item label="验证码">
          <div class="code-input-wrapper">
            <el-input v-model="emailForm.code" placeholder="请输入验证码" clearable />
            <el-button 
              type="primary" 
              size="small"
              :disabled="emailCountdown > 0 || !emailForm.email"
              @click="sendEmailCode"
              :loading="sendingEmail"
            >
              {{ emailCountdown > 0 ? `${emailCountdown}秒后重试` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>
        <el-form-item label="登录密码" v-if="userInfo?.email">
          <el-input v-model="emailForm.password" type="password" placeholder="请输入登录密码确认身份" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button size="small" @click="closeEmailDialog">取消</el-button>
        <el-button size="small" type="primary" :loading="emailLoading" @click="handleUpdateEmail">确认{{ userInfo?.email ? '修改' : '绑定' }}</el-button>
      </template>
    </el-dialog>
    
    <!-- 绑定手机弹窗 -->
    <el-dialog v-model="showPhoneDialog" :title="userInfo?.phone ? '修改手机' : '绑定手机'" width="400px">
      <el-form :model="phoneForm" label-width="80px">
        <el-form-item label="手机号码">
          <el-input v-model="phoneForm.phone" placeholder="请输入手机号码" clearable maxlength="11" show-word-limit />
        </el-form-item>
        <el-form-item label="验证码">
          <div class="code-input-wrapper">
            <el-input v-model="phoneForm.code" placeholder="请输入短信验证码" clearable maxlength="6" show-word-limit />
            <el-button 
              type="primary" 
              size="small"
              :disabled="phoneCountdown > 0 || !phoneForm.phone"
              @click="sendSmsCode"
              :loading="sendingSms"
            >
              {{ phoneCountdown > 0 ? `${phoneCountdown}秒后重试` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>
        <el-form-item label="登录密码" v-if="userInfo?.phone">
          <el-input v-model="phoneForm.password" type="password" placeholder="请输入登录密码确认身份" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button size="small" @click="closePhoneDialog">取消</el-button>
        <el-button size="small" type="primary" :loading="phoneLoading" @click="handleUpdatePhone">确认{{ userInfo?.phone ? '修改' : '绑定' }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { useElementSize } from '@vueuse/core'

import { ref, reactive, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/modules/user'

// 防抖函数
function debounce<T extends (...args: any[]) => any>(func: T, wait: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return function (this: any, ...args: Parameters<T>) {
    const context = this
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      func.apply(context, args)
    }, wait)
  }
}

const router = useRouter()
const userStore = useUserStore()
const userInfo = computed(function() { return userStore.userInfo })

// 弹窗控制
const showPasswordDialog = ref(false)
const showEmailDialog = ref(false)
const showPhoneDialog = ref(false)

// 设置项
const settings = reactive({
  notification: true,
  emailSubscribe: false,
})

// 表单数据
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const emailForm = reactive({
  email: '',
  code: '',
  password: ''
})

const phoneForm = reactive({
  phone: '',
  code: '',
  password: ''
})

// 加载状态
const loading = ref(false)
const emailLoading = ref(false)
const phoneLoading = ref(false)
const sendingEmail = ref(false)
const sendingSms = ref(false)

// 按钮尺寸跟踪（用于精确动画控制）
const { width: btnWidth } = useElementSize()

// 验证码倒计时
const emailCountdown = ref(0)
const phoneCountdown = ref(0)
let emailTimer: number | null = null
let phoneTimer: number | null = null

async function handleChangePassword() {
  // 表单校验
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    ElMessage.error('两次密码不一致')
    return
  }
  
  if (!passwordForm.oldPassword || !passwordForm.newPassword) {
    ElMessage.error('请填写完整信息')
    return
  }
  
  if (passwordForm.newPassword.length < 6) {
    ElMessage.error('新密码长度不能少于6位')
    return
  }
  
  try {
    loading.value = true
    // 调用用户状态管理中的changePassword函数
    await userStore.changePassword(passwordForm.oldPassword, passwordForm.newPassword)
    
    ElMessage.success('密码修改成功')
    showPasswordDialog.value = false
    
    // 重置密码表单
    Object.assign(passwordForm, {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  } catch (error: any) {
    ElMessage.error(error.message || '密码修改失败')
  } finally {
    loading.value = false
  }
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

// 邮箱相关操作
async function sendEmailCode() {
  // 邮箱格式校验
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailRegex.test(emailForm.email)) {
    ElMessage.error('请输入有效的邮箱地址')
    return
  }
  
  try {
    sendingEmail.value = true
    // 这里应该调用发送邮箱验证码的API
    // await userStore.sendEmailCode(emailForm.email)
    
    ElMessage.success('验证码已发送，请查收邮件')
    startEmailCountdown()
  } catch (error: any) {
    ElMessage.error(error.message || '发送验证码失败')
  } finally {
    sendingEmail.value = false
  }
}

function startEmailCountdown() {
  emailCountdown.value = 60
  if (emailTimer) clearInterval(emailTimer)
  emailTimer = window.setInterval(() => {
    emailCountdown.value--
    if (emailCountdown.value <= 0) {
      if (emailTimer) clearInterval(emailTimer)
      emailTimer = null
    }
  }, 1000)
}

async function handleUpdateEmail() {
  // 表单校验
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailRegex.test(emailForm.email)) {
    ElMessage.error('请输入有效的邮箱地址')
    return
  }
  
  if (!emailForm.code) {
    ElMessage.error('请输入验证码')
    return
  }
  
  if (userInfo.value?.email && !emailForm.password) {
    ElMessage.error('请输入登录密码确认身份')
    return
  }
  
  try {
    emailLoading.value = true
    // 这里应该调用更新邮箱的API
    // await userStore.updateEmail(emailForm.email, emailForm.code, emailForm.password)
    
    ElMessage.success(userInfo.value?.email ? '邮箱修改成功' : '邮箱绑定成功')
    closeEmailDialog()
    // 更新用户信息
    // await userStore.getUserInfo()
  } catch (error: any) {
    ElMessage.error(error.message || (userInfo.value?.email ? '邮箱修改失败' : '邮箱绑定失败'))
  } finally {
    emailLoading.value = false
  }
}

function closeEmailDialog() {
  showEmailDialog.value = false
  Object.assign(emailForm, {
    email: '',
    code: '',
    password: ''
  })
  if (emailTimer) {
    clearInterval(emailTimer)
    emailTimer = null
    emailCountdown.value = 0
  }
}

// 手机相关操作
async function sendSmsCode() {
  // 手机号格式校验
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(phoneForm.phone)) {
    ElMessage.error('请输入有效的手机号码')
    return
  }
  
  try {
    sendingSms.value = true
    // 这里应该调用发送短信验证码的API
    // await userStore.sendSmsCode(phoneForm.phone)
    
    ElMessage.success('验证码已发送，请查收短信')
    startPhoneCountdown()
  } catch (error: any) {
    ElMessage.error(error.message || '发送验证码失败')
  } finally {
    sendingSms.value = false
  }
}

function startPhoneCountdown() {
  phoneCountdown.value = 60
  if (phoneTimer) clearInterval(phoneTimer)
  phoneTimer = window.setInterval(() => {
    phoneCountdown.value--
    if (phoneCountdown.value <= 0) {
      if (phoneTimer) clearInterval(phoneTimer)
      phoneTimer = null
    }
  }, 1000)
}

async function handleUpdatePhone() {
  // 表单校验
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(phoneForm.phone)) {
    ElMessage.error('请输入有效的手机号码')
    return
  }
  
  if (!phoneForm.code) {
    ElMessage.error('请输入验证码')
    return
  }
  
  if (userInfo.value?.phone && !phoneForm.password) {
    ElMessage.error('请输入登录密码确认身份')
    return
  }
  
  try {
    phoneLoading.value = true
    // 这里应该调用更新手机的API
    // await userStore.updatePhone(phoneForm.phone, phoneForm.code, phoneForm.password)
    
    ElMessage.success(userInfo.value?.phone ? '手机修改成功' : '手机绑定成功')
    closePhoneDialog()
    // 更新用户信息
    // await userStore.getUserInfo()
  } catch (error: any) {
    ElMessage.error(error.message || (userInfo.value?.phone ? '手机修改失败' : '手机绑定失败'))
  } finally {
    phoneLoading.value = false
  }
}

function closePhoneDialog() {
  showPhoneDialog.value = false
  Object.assign(phoneForm, {
    phone: '',
    code: '',
    password: ''
  })
  if (phoneTimer) {
    clearInterval(phoneTimer)
    phoneTimer = null
    phoneCountdown.value = 0
  }
}

// 组件卸载时清理定时器
onUnmounted(() => {
  if (emailTimer) clearInterval(emailTimer)
  if (phoneTimer) clearInterval(phoneTimer)
})
</script>

<style scoped>
.user-settings {
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
}

/* 设置区块样式 */
.settings-section {
  margin-bottom: 40px;
}

/* 区块标题样式 */
.section-title {
  margin: 0 0 20px;
  padding: 0 4px;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.4;
}

.section-title.danger {
  color: var(--color-error);
}

/* 内容组容器样式 */
.settings-group {
  background-color: var(--color-background-secondary);
  border-radius: var(--border-radius-base);
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

/* 危险操作组特殊样式 */
.settings-group.danger-group {
  background-color: rgba(255, 87, 87, 0.1);
  box-shadow: 0 1px 3px rgba(255, 87, 87, 0.15);
}

/* 设置项样式 */
.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border-base);
  transition: all 0.3s ease;
}

/* 移除最后一个设置项的底边框 */
.setting-item:last-child {
  border-bottom: none;
}

.setting-item:hover {
  background-color: var(--color-background-tertiary);
}

.setting-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0; /* 防止溢出 */
}

.setting-label {
  font-size: 16px;
  font-weight: 500;
  line-height: 1.4;
}

.setting-value, .setting-desc {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

/* 确保设置项右侧按钮垂直居中对齐 */
.setting-item > :last-child {
  flex-shrink: 0;
  margin-left: 16px;
}

/* 普通按钮边框样式 */
.el-button {
  border: 1px solid var(--color-border-base);
  border-radius: var(--border-radius-base);
  background-color: transparent;
  min-width: 80px;
  padding: 8px 16px;
  transition: all 0.3s ease;
  color: var(--color-text-primary);
}

/* 普通按钮悬停效果 */
.el-button:hover:not(.is-disabled) {
  border-color: var(--color-brand-400);
  background-color: rgba(var(--color-brand-rgb), 0.05);
  transform: translateY(-1px);
}

/* 普通按钮点击效果 */
.el-button:active:not(.is-disabled) {
  transform: translateY(0);
  border-color: var(--color-brand-300);
  background-color: rgba(var(--color-brand-rgb), 0.1);
}

/* 主要按钮特殊边框样式 */
.el-button--primary {
  border: 1px solid var(--color-brand-400);
  color: var(--color-brand-400);
  background-color: transparent;
}

/* 主要按钮悬停效果 */
.el-button--primary:hover:not(.is-disabled) {
  border-color: var(--color-brand-300);
  background-color: rgba(var(--color-brand-rgb), 0.1);
  color: var(--color-brand-300);
}

/* 文本按钮特殊边框样式 */
.el-button--text {
  border: 1px solid transparent;
  min-width: 60px;
  white-space: nowrap;
  padding: 8px 12px;
  color: var(--color-text-primary);
}

/* 文本按钮悬停效果 */
.el-button--text:hover:not(.is-disabled) {
  border-color: var(--color-brand-400);
  background-color: rgba(var(--color-brand-rgb), 0.05);
  color: var(--color-brand-400);
}

/* 危险按钮特殊边框样式 */
.el-button--danger {
  border: 1px solid var(--color-error);
  background-color: transparent;
  color: var(--color-error);
  padding: 8px 16px;
}

/* 危险按钮悬停效果 */
.el-button--danger:hover:not(.is-disabled) {
  border-color: var(--color-error);
  background-color: rgba(var(--color-error-rgb), 0.1);
  color: var(--color-error);
}

/* 按钮与开关控件对齐优化 */
.el-button, .el-switch {
  align-self: center;
}

/* 禁用状态按钮样式优化 */
.el-button.is-disabled {
  cursor: not-allowed;
  pointer-events: all;
  opacity: 0.6;
}

/* 列表项悬停效果优化 */
.setting-item {
  transition: background-color 0.3s ease;
}

/* 状态文本样式优化 */
.setting-value, .setting-desc {
  transition: color 0.3s ease;
}

/* 暗黑主题适配 */
  [data-theme="dark"] {
    /* 整体背景色增强 */
    .user-settings {
      background-color: var(--color-background-base);
    }
    
    /* 区块容器样式增强 */
    .settings-group {
      background-color: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(10px);
    }

    /* 危险操作组样式优化 */
    .settings-group.danger-group {
      background-color: rgba(255, 87, 87, 0.05);
      border: 1px solid rgba(255, 87, 87, 0.15);
      box-shadow: 0 2px 8px rgba(255, 87, 87, 0.15);
    }

    /* 区块标题样式优化 */
    .section-title {
      color: var(--color-text-primary);
      opacity: 0.95;
    }
    
    .section-title.danger {
      color: var(--color-error);
      opacity: 0.9;
    }

    /* 设置项边框样式优化 */
    .setting-item {
      border-bottom-color: rgba(255, 255, 255, 0.07);
      background-color: rgba(255, 255, 255, 0.01);
    }

    /* 悬停效果增强 */
    .setting-item:hover {
      background-color: rgba(255, 255, 255, 0.07);
      border-bottom-color: rgba(255, 255, 255, 0.12);
    }

    /* 标签和描述文本对比度优化 */
    .setting-label {
      color: var(--color-text-primary);
    }
    
    .setting-value, .setting-desc {
      color: var(--color-text-secondary);
      opacity: 0.85;
    }

    /* 暗黑主题下的按钮样式优化 */
    .el-button {
      border-color: rgba(255, 255, 255, 0.1);
      color: #ffffff;
      background-color: rgba(255, 255, 255, 0.02);
      transition: all 0.3s ease;
    }
    
    /* 暗黑主题下的按钮悬停效果 */
    .el-button:hover:not(.is-disabled) {
      border-color: var(--color-brand-400);
      background-color: rgba(255, 255, 255, 0.1);
      color: #ffffff;
    }
    
    /* 暗黑主题下的主要按钮 */
    .el-button--primary {
      border-color: var(--color-brand-400);
      color: var(--color-brand-400);
      background-color: rgba(var(--color-brand-rgb), 0.05);
    }
    
    .el-button--primary:hover:not(.is-disabled) {
      border-color: var(--color-brand-400);
      background-color: rgba(255, 255, 255, 0.05);
      color: var(--color-brand-300);
    }
    
    /* 暗黑主题下的文本按钮 */
    .el-button--text {
      border-color: transparent;
      color: #ffffff;
      background-color: transparent;
    }
    
    .el-button--text:hover:not(.is-disabled) {
      border-color: var(--color-brand-400);
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    /* 暗黑主题下的危险按钮 */
    .el-button--danger {
      border-color: rgba(var(--color-error-rgb), 0.3);
      color: var(--color-error);
      background-color: rgba(var(--color-error-rgb), 0.05);
    }
    
    .el-button--danger:hover:not(.is-disabled) {
      border-color: var(--color-error);
      background-color: rgba(255, 87, 87, 0.15);
    }
    
    /* 开关组件颜色优化 */
    .el-switch .el-switch__core {
      background-color: rgba(255, 255, 255, 0.2);
    }
    
    .el-switch.is-checked .el-switch__core {
      background-color: var(--color-brand-400);
    }
  }
  
  /* 账号安全页面按钮特殊样式 */
    .account-button {
      border: 1px solid var(--color-brand-400);
      color: var(--color-brand-400);
      background-color: transparent;
    }

    .account-button:hover:not(.is-disabled) {
      border-color: var(--color-brand-300);
      background-color: rgba(var(--color-brand-rgb), 0.1);
      color: var(--color-brand-300);
    }

    /* 响应式调整 */
  @media (max-width: 768px) {
    .user-settings {
      padding: 16px;
    }
    
    .settings-section {
      margin-bottom: 32px;
    }
    
    .section-title {
      font-size: 18px;
      margin-bottom: 16px;
    }
    
    .setting-item {
      padding: 16px 20px;
    }
  }
</style>
