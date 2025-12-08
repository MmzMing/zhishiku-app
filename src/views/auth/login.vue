<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-left">
        <div class="brand-info">
          <div class="logo-wrap">
            <img src="@/assets/logo.svg" alt="Logo" class="logo" />
          </div>
          <h1 class="brand-title">知识库学习平台</h1>
          <p class="brand-desc">一站式视频、博客、学习资源管理平台</p>
          <div class="features">
            <div class="feature-item">
              <el-icon :size="20"><VideoPlay /></el-icon>
              <span>海量视频教程</span>
            </div>
            <div class="feature-item">
              <el-icon :size="20"><Document /></el-icon>
              <span>精品技术博客</span>
            </div>
            <div class="feature-item">
              <el-icon :size="20"><Trophy /></el-icon>
              <span>积分激励体系</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="login-right">
        <div class="login-form-container">
          <!-- 主题切换按钮 -->
          <div class="theme-toggle-wrap">
            <ThemeToggle />
          </div>
          
          <div class="form-header">
            <h2 class="form-title">欢迎回来</h2>
            <p class="form-subtitle">请登录您的账户继续学习</p>
          </div>
          
          <!-- 登录方式切换 -->
          <div class="login-tabs">
            <div 
              class="tab-item" 
              :class="{ active: loginType === 'account' }"
              @click="loginType = 'account'"
            >
              <el-icon><User /></el-icon>
              <span>账号登录</span>
            </div>
            <div 
              class="tab-item" 
              :class="{ active: loginType === 'phone' }"
              @click="loginType = 'phone'"
            >
              <el-icon><Iphone /></el-icon>
              <span>手机号登录</span>
            </div>
          </div>
          
          <el-form 
            ref="loginFormRef"
            :model="loginForm" 
            :rules="loginRules"
            label-position="top"
            class="login-form"
          >
            <!-- 账号密码登录 -->
            <template v-if="loginType === 'account'">
              <el-form-item prop="username">
                <el-input 
                  v-model="loginForm.username"
                  placeholder="请输入用户名/邮箱"
                  :prefix-icon="User"
                  size="large"
                  clearable
                />
              </el-form-item>
              
              <el-form-item prop="password">
                <el-input 
                  v-model="loginForm.password"
                  type="password"
                  placeholder="请输入密码"
                  :prefix-icon="Lock"
                  size="large"
                  show-password
                  @keyup.enter="handleLogin"
                />
              </el-form-item>
              
              <el-form-item prop="captcha">
                <div class="captcha-wrap">
                  <el-input 
                    v-model="loginForm.captcha"
                    placeholder="请输入验证码"
                    :prefix-icon="Key"
                    size="large"
                    maxlength="4"
                    @keyup.enter="handleLogin"
                  />
                  <div class="captcha-img" @click="refreshCaptcha">
                    <img v-if="captchaImage" :src="captchaImage" alt="验证码" />
                    <el-icon v-else :size="24" class="loading"><Loading /></el-icon>
                  </div>
                </div>
              </el-form-item>
            </template>
            
            <!-- 手机号登录 -->
            <template v-else>
              <el-form-item prop="phone">
                <el-input 
                  v-model="loginForm.phone"
                  placeholder="请输入手机号"
                  :prefix-icon="Iphone"
                  size="large"
                  maxlength="11"
                />
              </el-form-item>
              
              <el-form-item prop="smsCode">
                <div class="sms-wrap">
                  <el-input 
                    v-model="loginForm.smsCode"
                    placeholder="请输入短信验证码"
                    :prefix-icon="Message"
                    size="large"
                    maxlength="6"
                    @keyup.enter="handleLogin"
                  />
                  <el-button 
                    size="large"
                    :disabled="smsCountdown > 0"
                    @click="sendSmsCode"
                  >
                    {{ smsCountdown > 0 ? `${smsCountdown}秒后重试` : '获取验证码' }}
                  </el-button>
                </div>
              </el-form-item>
            </template>
            
            <div class="form-options">
              <el-checkbox v-model="loginForm.rememberMe">7天内自动登录</el-checkbox>
              <el-link type="primary" :underline="false" @click="showForgotPassword">忘记密码?</el-link>
            </div>
            
            <el-form-item>
              <el-button 
                type="primary" 
                size="large" 
                class="login-btn"
                :loading="loading"
                @click="handleLogin"
              >
                {{ loading ? '登录中...' : '登 录' }}
              </el-button>
            </el-form-item>
            
            <div class="form-footer">
              <span>还没有账户?</span>
              <el-link type="primary" :underline="false" @click="$router.push('/register')">
                立即注册
              </el-link>
            </div>
          </el-form>
          
          <el-divider>其他登录方式</el-divider>
          
          <div class="social-login">
            <el-tooltip content="微信登录" placement="top">
              <div class="social-btn wechat" @click="handleSocialLogin('wechat')">
                <el-icon :size="24"><ChatDotRound /></el-icon>
              </div>
            </el-tooltip>
            <el-tooltip content="QQ登录" placement="top">
              <div class="social-btn qq" @click="handleSocialLogin('qq')">
                <el-icon :size="24"><ChatLineRound /></el-icon>
              </div>
            </el-tooltip>
            <el-tooltip content="GitHub登录" placement="top">
              <div class="social-btn github" @click="handleSocialLogin('github')">
                <el-icon :size="24"><Connection /></el-icon>
              </div>
            </el-tooltip>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 忘记密码弹窗 -->
    <el-dialog v-model="forgotPasswordVisible" title="找回密码" width="400px" center>
      <el-form :model="forgotForm" :rules="forgotRules" ref="forgotFormRef">
        <el-form-item prop="email">
          <el-input v-model="forgotForm.email" placeholder="请输入注册邮箱" :prefix-icon="Message" size="large" />
        </el-form-item>
        <el-form-item prop="code">
          <div class="sms-wrap">
            <el-input v-model="forgotForm.code" placeholder="请输入验证码" :prefix-icon="Key" size="large" maxlength="6" />
            <el-button size="large" :disabled="emailCountdown > 0" @click="sendEmailCode">
              {{ emailCountdown > 0 ? `${emailCountdown}s` : '发送验证码' }}
            </el-button>
          </div>
        </el-form-item>
        <el-form-item prop="newPassword">
          <el-input v-model="forgotForm.newPassword" type="password" placeholder="请输入新密码" :prefix-icon="Lock" size="large" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="forgotPasswordVisible = false">取消</el-button>
        <el-button type="primary" @click="handleResetPassword" :loading="resetLoading">重置密码</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  User, Lock, ChatDotRound, Connection, ChatLineRound,
  Key, Iphone, Message, VideoPlay, Document, Trophy, Loading
} from '@element-plus/icons-vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useUserStore } from '@/stores/modules/user'
import { mockService } from '@/mock'
import ThemeToggle from '@/components/base/ThemeToggle.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 登录方式
const loginType = ref<'account' | 'phone'>('account')

// 表单引用
const loginFormRef = ref<FormInstance>()
const forgotFormRef = ref<FormInstance>()

// 加载状态
const loading = ref(false)
const resetLoading = ref(false)

// 验证码相关
const captchaImage = ref('')
const captchaId = ref('')
const smsCountdown = ref(0)
const emailCountdown = ref(0)

// 忘记密码弹窗
const forgotPasswordVisible = ref(false)

// 登录表单
const loginForm = reactive({
  username: '',
  password: '',
  captcha: '',
  phone: '',
  smsCode: '',
  rememberMe: false
})

// 忘记密码表单
const forgotForm = reactive({
  email: '',
  code: '',
  newPassword: ''
})

// 手机号验证
const phoneValidator = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (!value) {
    callback(new Error('请输入手机号'))
  } else if (!/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error('请输入正确的手机号'))
  } else {
    callback()
  }
}

// 表单验证规则
const loginRules = computed<FormRules>(() => {
  if (loginType.value === 'account') {
    return {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 50, message: '用户名长度在 3 到 50 个字符', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
      ],
      captcha: [
        { required: true, message: '请输入验证码', trigger: 'blur' },
        { len: 4, message: '验证码长度为 4 位', trigger: 'blur' }
      ]
    }
  } else {
    return {
      phone: [
        { required: true, validator: phoneValidator, trigger: 'blur' }
      ],
      smsCode: [
        { required: true, message: '请输入短信验证码', trigger: 'blur' },
        { len: 6, message: '验证码长度为 6 位', trigger: 'blur' }
      ]
    }
  }
})

// 忘记密码验证规则
const forgotRules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码长度为 6 位', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

// 刷新验证码
async function refreshCaptcha() {
  try {
    const result = await mockService.getCaptcha()
    captchaId.value = result.captchaId
    captchaImage.value = result.captchaImage
  } catch (error) {
    console.error('获取验证码失败', error)
  }
}

// 发送短信验证码
async function sendSmsCode() {
  if (!loginForm.phone || !/^1[3-9]\d{9}$/.test(loginForm.phone)) {
    ElMessage.warning('请先输入正确的手机号')
    return
  }
  
  try {
    await mockService.sendVerifyCode(loginForm.phone)
    ElMessage.success('验证码已发送')
    
    // 开始倒计时
    smsCountdown.value = 60
    const timer = setInterval(() => {
      smsCountdown.value--
      if (smsCountdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    ElMessage.error('发送验证码失败')
  }
}

// 发送邮箱验证码
async function sendEmailCode() {
  if (!forgotForm.email || !/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(forgotForm.email)) {
    ElMessage.warning('请先输入正确的邮箱')
    return
  }
  
  try {
    await mockService.sendVerifyCode(forgotForm.email)
    ElMessage.success('验证码已发送到邮箱')
    
    emailCountdown.value = 60
    const timer = setInterval(() => {
      emailCountdown.value--
      if (emailCountdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    ElMessage.error('发送验证码失败')
  }
}

// 显示忘记密码弹窗
function showForgotPassword() {
  forgotPasswordVisible.value = true
}

// 重置密码
async function handleResetPassword() {
  if (!forgotFormRef.value) return
  
  await forgotFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    resetLoading.value = true
    try {
      const isValid = await mockService.verifyCode(forgotForm.code)
      if (!isValid) {
        ElMessage.error('验证码错误')
        return
      }
      
      ElMessage.success('密码重置成功，请使用新密码登录')
      forgotPasswordVisible.value = false
    } catch (error) {
      ElMessage.error('重置密码失败')
    } finally {
      resetLoading.value = false
    }
  })
}

// 社交登录
function handleSocialLogin(type: 'wechat' | 'qq' | 'github') {
  ElMessage.info(`${type === 'wechat' ? '微信' : type === 'qq' ? 'QQ' : 'GitHub'} 登录功能开发中...`)
}

// 处理登录
async function handleLogin() {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    // 验证图形验证码
    if (loginType.value === 'account' && loginForm.captcha) {
      const isValid = await mockService.verifyCaptcha(loginForm.captcha)
      if (!isValid) {
        ElMessage.error('验证码错误')
        refreshCaptcha()
        return
      }
    }
    
    loading.value = true
    
    try {
      let success = false
      
      if (loginType.value === 'account') {
        success = await userStore.login({
          username: loginForm.username,
          password: loginForm.password,
          rememberMe: loginForm.rememberMe
        })
      } else {
        // 手机号登录 - 验证短信验证码
        const isValid = await mockService.verifyCode(loginForm.smsCode)
        if (!isValid) {
          ElMessage.error('短信验证码错误')
          return
        }
        
        // 模拟手机号登录
        success = await userStore.login({
          username: loginForm.phone,
          password: 'phone_login',
          rememberMe: loginForm.rememberMe
        })
      }
      
      if (success) {
        ElMessage.success('登录成功，欢迎回来！')
        
        // 跳转到重定向页面或前台首页
        const redirect = route.query.redirect as string
        router.push(redirect || '/portal')
      } else {
        ElMessage.error('登录失败，请检查用户名和密码')
        refreshCaptcha()
      }
    } catch (error) {
      ElMessage.error('登录失败，请稍后重试')
      refreshCaptcha()
    } finally {
      loading.value = false
    }
  })
}

// 初始化
onMounted(() => {
  refreshCaptcha()
})
</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-primary) 0%, #764ba2 100%);
  
  .login-container {
    display: flex;
    width: 960px;
    min-height: 580px;
    background-color: var(--color-bg-primary);
    border-radius: 20px;
    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    
    .login-left {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--color-primary) 0%, #764ba2 100%);
      padding: 48px;
      
      .brand-info {
        text-align: center;
        color: #fff;
        
        .logo-wrap {
          margin-bottom: 24px;
          
          .logo {
            width: 80px;
            height: 80px;
            filter: brightness(0) invert(1);
          }
        }
        
        .brand-title {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 12px;
        }
        
        .brand-desc {
          font-size: 15px;
          opacity: 0.9;
          margin-bottom: 32px;
        }
        
        .features {
          display: flex;
          flex-direction: column;
          gap: 16px;
          
          .feature-item {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            font-size: 14px;
            opacity: 0.9;
            
            .el-icon {
              background: rgba(255, 255, 255, 0.2);
              padding: 8px;
              border-radius: 8px;
            }
          }
        }
      }
    }
    
    .login-right {
      flex: 1.2;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px;
      position: relative;
      
      .theme-toggle-wrap {
        position: absolute;
        top: 20px;
        right: 20px;
      }
      
      .login-form-container {
        width: 100%;
        max-width: 380px;
        
        .form-header {
          text-align: center;
          margin-bottom: 28px;
          
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
        
        .login-tabs {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          
          .tab-item {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            padding: 12px 16px;
            border-radius: 10px;
            background: var(--color-bg-secondary);
            cursor: pointer;
            transition: all 0.3s;
            color: var(--color-text-secondary);
            font-size: 14px;
            
            &:hover {
              background: var(--color-bg-tertiary);
            }
            
            &.active {
              background: var(--color-primary);
              color: #fff;
            }
          }
        }
        
        .login-form {
          .captcha-wrap {
            display: flex;
            gap: 12px;
            
            .el-input {
              flex: 1;
            }
            
            .captcha-img {
              width: 120px;
              height: 40px;
              border-radius: 6px;
              overflow: hidden;
              cursor: pointer;
              background: var(--color-bg-secondary);
              display: flex;
              align-items: center;
              justify-content: center;
              
              img {
                width: 100%;
                height: 100%;
                object-fit: cover;
              }
              
              .loading {
                animation: spin 1s linear infinite;
              }
            }
          }
          
          .sms-wrap {
            display: flex;
            gap: 12px;
            
            .el-input {
              flex: 1;
            }
            
            .el-button {
              width: 120px;
            }
          }
          
          .form-options {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
          }
          
          .login-btn {
            width: 100%;
            height: 44px;
            font-size: 16px;
          }
          
          .form-footer {
            text-align: center;
            margin-top: 16px;
            color: var(--color-text-secondary);
            
            .el-link {
              margin-left: 4px;
            }
          }
        }
        
        :deep(.el-divider__text) {
          background: var(--color-bg-primary);
          color: var(--color-text-tertiary);
        }
        
        .social-login {
          display: flex;
          justify-content: center;
          gap: 20px;
          
          .social-btn {
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.3s;
            
            &:hover {
              transform: translateY(-3px);
              box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            }
            
            &.wechat {
              background-color: #07c160;
              color: #fff;
            }
            
            &.qq {
              background-color: #12b7f5;
              color: #fff;
            }
            
            &.github {
              background-color: #24292e;
              color: #fff;
            }
          }
        }
      }
    }
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

// 移动端适配
@media (max-width: 768px) {
  .login-page {
    padding: 20px;
    
    .login-container {
      flex-direction: column;
      width: 100%;
      min-height: auto;
      
      .login-left {
        padding: 32px 24px;
        
        .brand-info {
          .logo-wrap .logo {
            width: 60px;
            height: 60px;
          }
          
          .brand-title {
            font-size: 24px;
          }
          
          .brand-desc {
            font-size: 13px;
            margin-bottom: 20px;
          }
          
          .features {
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: center;
            
            .feature-item {
              font-size: 12px;
            }
          }
        }
      }
      
      .login-right {
        padding: 32px 24px;
        
        .login-form-container {
          max-width: 100%;
        }
      }
    }
  }
}
</style>
