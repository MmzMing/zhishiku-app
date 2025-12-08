<template>
  <div class="user-profile">
    <h3 class="section-title">基本信息</h3>
    <el-form :model="form" label-width="100px" class="profile-form">
      <el-form-item label="头像">
        <el-avatar :size="80" :src="form.avatar">{{ form.nickname?.charAt(0) }}</el-avatar>
        <el-button class="upload-btn">更换头像</el-button>
      </el-form-item>
      <el-form-item label="用户名">
        <el-input v-model="form.username" disabled />
      </el-form-item>
      <el-form-item label="昵称">
        <el-input v-model="form.nickname" placeholder="请输入昵称" />
      </el-form-item>
      <el-form-item label="个性签名">
        <el-input v-model="form.signature" type="textarea" :rows="3" placeholder="介绍一下自己吧" />
      </el-form-item>
      <el-form-item label="性别">
        <el-radio-group v-model="form.gender">
          <el-radio value="male">男</el-radio>
          <el-radio value="female">女</el-radio>
          <el-radio value="unknown">保密</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="生日">
        <el-date-picker v-model="form.birthday" type="date" placeholder="选择生日" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSave">保存修改</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/modules/user'

const userStore = useUserStore()

const form = reactive({
  username: '',
  nickname: '',
  avatar: '',
  signature: '',
  gender: 'unknown' as 'male' | 'female' | 'unknown',
  birthday: '',
})

function handleSave() {
  ElMessage.success('保存成功')
}

onMounted(() => {
  if (userStore.userInfo) {
    Object.assign(form, userStore.userInfo)
  }
})
</script>

<style scoped lang="scss">
.user-profile {
  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--color-border);
  }
  
  .profile-form {
    max-width: 500px;
    
    .upload-btn {
      margin-left: 16px;
    }
  }
}
</style>
