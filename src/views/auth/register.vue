<template>
  <div class="register-page">
    <div class="register-container">
      <!-- 返回按钮 -->
      <div class="back-btn" @click="$router.push('/login')">
        <el-icon><ArrowLeft /></el-icon>
        <span>返回登录</span>
      </div>
      
      <div class="register-header">
        <div class="logo-wrap">
          <img src="@/assets/logo.svg" alt="Logo" class="logo" />
        </div>
        <h2 class="form-title">创建新账户</h2>
        <p class="form-subtitle">加入知识库学习平台，开启学习之旅</p>
      </div>
      
      <!-- 步骤条 -->
      <div class="register-steps">
        <div class="step" :class="{ active: currentStep >= 1, done: currentStep > 1 }">
          <div class="step-num">{{ currentStep > 1 ? '✓' : '1' }}</div>
          <span>基本信息</span>
        </div>
        <div class="step-line" :class="{ active: currentStep > 1 }"></div>
        <div class="step" :class="{ active: currentStep >= 2, done: currentStep > 2 }">
          <div class="step-num">{{ currentStep > 2 ? '✓' : '2' }}</div>
          <span>邮箱验证</span>
        </div>
        <div class="step-line" :class="{ active: currentStep > 2 }"></div>
        <div class="step" :class="{ active: currentStep >= 3 }">
          <div class="step-num">3</div>
          <span>完成注册</span>
        </div>
      </div>
      
      <el-form 
        ref="registerFormRef"
        :model="registerForm" 
        :rules="registerRules"
        label-position="top"
        class="register-form"
      >
        <!-- 步骤1: 基本信息 -->
        <template v-if="currentStep === 1">
          <el-form-item prop="username">
            <el-input 
              v-model="registerForm.username"
              placeholder="请输入用户名 (3-20个字符)"
              :prefix-icon="User"
              size="large"
              clearable
            />
          </el-form-item>
          
          <el-form-item prop="email">
            <el-input 
              v-model="registerForm.email"
              placeholder="请输入邮箱地址"
              :prefix-icon="Message"
              size="large"
              clearable
            />
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input 
              v-model="registerForm.password"
              type="password"
              placeholder="请设置密码 (6-20个字符)"
              :prefix-icon="Lock"
              size="large"
              show-password
              @input="checkPasswordStrength"
            />
          </el-form-item>
          
          <!-- 密码强度指示器 -->
          <div class="password-strength" v-if="registerForm.password">
            <div class="strength-bars">
              <div class="bar" :class="{ active: passwordStrength >= 1, weak: passwordStrength === 1 }"></div>
              <div class="bar" :class="{ active: passwordStrength >= 2, medium: passwordStrength === 2 }"></div>
              <div class="bar" :class="{ active: passwordStrength >= 3, strong: passwordStrength >= 3 }"></div>
            </div>
            <span class="strength-text" :class="strengthClass">{{ strengthText }}</span>
          </div>
          
          <el-form-item prop="confirmPassword">
            <el-input 
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              :prefix-icon="Lock"
              size="large"
              show-password
            />
          </el-form-item>
        </template>
        
        <!-- 步骤2: 邮箱验证 -->
        <template v-if="currentStep === 2">
          <div class="verify-info">
            <el-icon :size="48" color="var(--color-primary)"><Message /></el-icon>
            <p class="verify-title">验证码已发送</p>
            <p class="verify-desc">我们已向 <strong>{{ registerForm.email }}</strong> 发送了一封包含验证码的邮件</p>
          </div>
          
          <el-form-item prop="verifyCode">
            <div class="verify-code-wrap">
              <el-input 
                v-model="registerForm.verifyCode"
                placeholder="请输入 6 位验证码"
                :prefix-icon="Key"
                size="large"
                maxlength="6"
              />
              <el-button 
                size="large"
                :disabled="emailCountdown > 0"
                @click="resendEmailCode"
              >
                {{ emailCountdown > 0 ? `${emailCountdown}s 后重发` : '重新发送' }}
              </el-button>
            </div>
          </el-form-item>
          
          <p class="verify-tip">
            <el-icon><InfoFilled /></el-icon>
            测试验证码: <strong>123456</strong>
          </p>
        </template>
        
        <!-- 步骤3: 完成注册 -->
        <template v-if="currentStep === 3">
          <div class="success-info">
            <el-icon :size="64" color="#67c23a"><CircleCheck /></el-icon>
            <p class="success-title">注册成功！</p>
            <p class="success-desc">欢迎加入知识库学习平台</p>
            <div class="user-info-card">
              <div class="avatar">
                <img :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${registerForm.username}`" alt="头像" />
              </div>
              <div class="info">
                <p class="name">{{ registerForm.username }}</p>
                <p class="email">{{ registerForm.email }}</p>
              </div>
            </div>
          </div>
        </template>
        
        <!-- 用户协议 (步骤1显示) -->
        <el-form-item prop="agreement" v-if="currentStep === 1">
          <el-checkbox v-model="registerForm.agreement">
            我已阅读并同意
            <el-link type="primary" :underline="false" @click.stop="showAgreement('user')">用户协议</el-link>
            和
            <el-link type="primary" :underline="false" @click.stop="showAgreement('privacy')">隐私政策</el-link>
          </el-checkbox>
        </el-form-item>
        
        <!-- 操作按钮 -->
        <div class="form-actions">
          <el-button 
            v-if="currentStep > 1 && currentStep < 3"
            size="large"
            @click="prevStep"
          >
            上一步
          </el-button>
          
          <el-button 
            v-if="currentStep < 3"
            type="primary" 
            size="large" 
            class="next-btn"
            :loading="loading"
            @click="nextStep"
          >
            {{ currentStep === 2 ? '完成注册' : '下一步' }}
          </el-button>
          
          <el-button 
            v-if="currentStep === 3"
            type="primary" 
            size="large" 
            class="next-btn"
            @click="goToLogin"
          >
            立即登录
          </el-button>
        </div>
        
        <div class="form-footer" v-if="currentStep === 1">
          <span>已有账户?</span>
          <el-link type="primary" :underline="false" @click="$router.push('/login')">
            立即登录
          </el-link>
        </div>
      </el-form>
    </div>
    
    <!-- 协议弹窗 -->
    <el-dialog v-model="agreementVisible" :title="agreementType === 'user' ? '用户协议' : '隐私政策'" width="600px">
      <div class="agreement-content">
        <h3>{{ agreementType === 'user' ? '知识库学习平台用户协议' : '知识库学习平台隐私政策' }}</h3>
        <p>更新日期：2024年12月1日</p>
        <p>欢迎使用知识库学习平台服务！在使用我们的服务之前，请您认真阅读本协议。</p>
        <h4>1. 服务内容</h4>
        <p>本平台提供视频教程、技术博客、在线学习等服务。</p>
        <h4>2. 用户责任</h4>
        <p>用户应确保注册信息的真实性，并对账户安全负责。</p>
        <h4>3. 知识产权</h4>
        <p>平台上的所有内容受知识产权法保护，未经授权不得转载。</p>
      </div>
      <template #footer>
        <el-button type="primary" @click="agreementVisible = false">我已阅读</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock, Message, Key, ArrowLeft, InfoFilled, CircleCheck } from '@element-plus/icons-vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { mockService } from '@/mock'

const router = useRouter()

// 当前步骤
const currentStep = ref(1)

// 表单引用
const registerFormRef = ref<FormInstance>()

// 加载状态
const loading = ref(false)

// 邮箱验证码倒计时
const emailCountdown = ref(0)

// 密码强度
const passwordStrength = ref(0)

// 协议弹窗
const agreementVisible = ref(false)
const agreementType = ref<'user' | 'privacy'>('user')

// 注册表单
const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  verifyCode: '',
  agreement: false
})

// 密码强度文本
const strengthText = computed(() => {
  switch (passwordStrength.value) {
    case 1: return '弱'
    case 2: return '中'
    case 3: return '强'
    default: return ''
  }
})

const strengthClass = computed(() => {
  switch (passwordStrength.value) {
    case 1: return 'weak'
    case 2: return 'medium'
    case 3: return 'strong'
    default: return ''
  }
})

// 检查密码强度
function checkPasswordStrength() {
  const password = registerForm.password
  let strength = 0
  
  if (password.length >= 6) strength++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++
  if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) strength++
  
  passwordStrength.value = strength
}

// 验证确认密码
const validateConfirmPassword = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// 验证协议
const validateAgreement = (_rule: unknown, value: boolean, callback: (error?: Error) => void) => {
  if (!value) {
    callback(new Error('请阅读并同意用户协议和隐私政策'))
  } else {
    callback()
  }
}

// 表单验证规则
const registerRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  verifyCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码长度为 6 位', trigger: 'blur' }
  ],
  agreement: [
    { validator: validateAgreement, trigger: 'change' }
  ]
}

// 下一步
async function nextStep() {
  if (!registerFormRef.value) return
  
  loading.value = true
  
  try {
    if (currentStep.value === 1) {
      // 验证第一步表单
      await registerFormRef.value.validateField(['username', 'email', 'password', 'confirmPassword', 'agreement'])
      
      // 发送邮箱验证码
      await mockService.sendVerifyCode(registerForm.email)
      ElMessage.success('验证码已发送到您的邮箱')
      
      // 开始倒计时
      startEmailCountdown()
      currentStep.value = 2
    } else if (currentStep.value === 2) {
      // 验证验证码
      await registerFormRef.value.validateField(['verifyCode'])
      
      const isValid = await mockService.verifyCode(registerForm.verifyCode)
      if (!isValid) {
        ElMessage.error('验证码错误')
        return
      }
      
      // 注册用户
      await mockService.register({
        username: registerForm.username,
        password: registerForm.password,
        email: registerForm.email
      })
      
      currentStep.value = 3
    }
  } catch (error) {
    console.error('操作失败', error)
  } finally {
    loading.value = false
  }
}

// 上一步
function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

// 开始邮箱倒计时
function startEmailCountdown() {
  emailCountdown.value = 60
  const timer = setInterval(() => {
    emailCountdown.value--
    if (emailCountdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

// 重新发送验证码
async function resendEmailCode() {
  try {
    await mockService.sendVerifyCode(registerForm.email)
    ElMessage.success('验证码已重新发送')
    startEmailCountdown()
  } catch (error) {
    ElMessage.error('发送失败')
  }
}

// 显示协议
function showAgreement(type: 'user' | 'privacy') {
  agreementType.value = type
  agreementVisible.value = true
}

// 跳转登录
function goToLogin() {
  router.push('/login')
}
</script>

<style scoped lang="scss">
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-primary) 0%, #764ba2 100%);
  padding: 40px 20px;
  
  .register-container {
    width: 100%;
    max-width: 480px;
    padding: 40px;
    background-color: var(--color-bg-primary);
    border-radius: 20px;
    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
    position: relative;
    
    .back-btn {
      position: absolute;
      top: 20px;
      left: 20px;
      display: flex;
      align-items: center;
      gap: 4px;
      color: var(--color-text-secondary);
      cursor: pointer;
      transition: color 0.3s;
      font-size: 14px;
      
      &:hover {
        color: var(--color-primary);
      }
    }
    
    .register-header {
      text-align: center;
      margin-bottom: 28px;
      
      .logo-wrap {
        margin-bottom: 16px;
        
        .logo {
          width: 60px;
          height: 60px;
        }
      }
      
      .form-title {
        font-size: 26px;
        font-weight: 600;
        color: var(--color-text-primary);
        margin-bottom: 8px;
      }
      
      .form-subtitle {
        font-size: 14px;
        color: var(--color-text-secondary);
      }
    }
    
    .register-steps {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 32px;
      
      .step {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        
        .step-num {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-bg-secondary);
          color: var(--color-text-tertiary);
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s;
        }
        
        span {
          font-size: 12px;
          color: var(--color-text-tertiary);
          transition: color 0.3s;
        }
        
        &.active {
          .step-num {
            background: var(--color-primary);
            color: #fff;
          }
          
          span {
            color: var(--color-text-primary);
          }
        }
        
        &.done {
          .step-num {
            background: #67c23a;
            color: #fff;
          }
        }
      }
      
      .step-line {
        width: 50px;
        height: 2px;
        background: var(--color-bg-secondary);
        margin: 0 8px;
        margin-bottom: 20px;
        transition: background 0.3s;
        
        &.active {
          background: var(--color-primary);
        }
      }
    }
    
    .register-form {
      .password-strength {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 16px;
        margin-top: -8px;
        
        .strength-bars {
          display: flex;
          gap: 4px;
          
          .bar {
            width: 40px;
            height: 4px;
            border-radius: 2px;
            background: var(--color-bg-tertiary);
            transition: background 0.3s;
            
            &.active.weak { background: #f56c6c; }
            &.active.medium { background: #e6a23c; }
            &.active.strong { background: #67c23a; }
          }
        }
        
        .strength-text {
          font-size: 12px;
          
          &.weak { color: #f56c6c; }
          &.medium { color: #e6a23c; }
          &.strong { color: #67c23a; }
        }
      }
      
      .verify-info {
        text-align: center;
        padding: 20px 0;
        
        .verify-title {
          font-size: 20px;
          font-weight: 600;
          color: var(--color-text-primary);
          margin: 16px 0 8px;
        }
        
        .verify-desc {
          font-size: 14px;
          color: var(--color-text-secondary);
          margin-bottom: 24px;
          
          strong {
            color: var(--color-primary);
          }
        }
      }
      
      .verify-code-wrap {
        display: flex;
        gap: 12px;
        
        .el-input {
          flex: 1;
        }
        
        .el-button {
          width: 120px;
        }
      }
      
      .verify-tip {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        color: var(--color-text-secondary);
        margin-top: 12px;
        padding: 10px;
        background: var(--color-bg-secondary);
        border-radius: 6px;
        
        strong {
          color: var(--color-primary);
        }
      }
      
      .success-info {
        text-align: center;
        padding: 20px 0;
        
        .success-title {
          font-size: 24px;
          font-weight: 600;
          color: var(--color-text-primary);
          margin: 20px 0 8px;
        }
        
        .success-desc {
          font-size: 14px;
          color: var(--color-text-secondary);
          margin-bottom: 24px;
        }
        
        .user-info-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: var(--color-bg-secondary);
          border-radius: 12px;
          
          .avatar {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            overflow: hidden;
            
            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          }
          
          .info {
            text-align: left;
            
            .name {
              font-size: 18px;
              font-weight: 600;
              color: var(--color-text-primary);
            }
            
            .email {
              font-size: 13px;
              color: var(--color-text-secondary);
              margin-top: 4px;
            }
          }
        }
      }
      
      .form-actions {
        display: flex;
        gap: 12px;
        margin-top: 24px;
        
        .el-button {
          flex: 1;
          height: 44px;
        }
        
        .next-btn {
          flex: 2;
        }
      }
      
      .form-footer {
        text-align: center;
        margin-top: 20px;
        color: var(--color-text-secondary);
        
        .el-link {
          margin-left: 4px;
        }
      }
    }
  }
}

.agreement-content {
  max-height: 400px;
  overflow-y: auto;
  line-height: 1.8;
  
  h3 {
    margin-bottom: 16px;
  }
  
  h4 {
    margin: 16px 0 8px;
  }
  
  p {
    color: var(--color-text-secondary);
    margin-bottom: 8px;
  }
}

// 移动端适配
@media (max-width: 480px) {
  .register-page {
    padding: 20px 16px;
    
    .register-container {
      padding: 32px 20px;
      
      .register-steps {
        .step-line {
          width: 30px;
        }
      }
    }
  }
}
</style>
