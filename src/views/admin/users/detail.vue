<template>
  <div class="user-detail-page" v-loading="loading">
    <el-page-header @back="$router.back()" title="返回" :content="userInfo?.nickname" />
    
    <div class="detail-content" v-if="userInfo">
      <el-card class="info-card">
        <div class="user-profile">
          <el-avatar :size="100" :src="userInfo.avatar">{{ userInfo.nickname?.charAt(0) }}</el-avatar>
          <div class="user-info">
            <h2>{{ userInfo.nickname }}</h2>
            <p class="username">@{{ userInfo.username }}</p>
            <div class="tags">
              <el-tag v-for="role in userInfo.roleNames" :key="role">{{ role }}</el-tag>
              <el-tag :type="userInfo.status === 'active' ? 'success' : 'danger'">
                {{ userInfo.status === 'active' ? '正常' : '禁用' }}
              </el-tag>
            </div>
          </div>
        </div>
      </el-card>
      
      <el-card class="detail-card">
        <template #header>基本信息</template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户ID">{{ userInfo.id }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ userInfo.username }}</el-descriptions-item>
          <el-descriptions-item label="昵称">{{ userInfo.nickname }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ userInfo.email }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ userInfo.phone || '未绑定' }}</el-descriptions-item>
          <el-descriptions-item label="性别">
            {{ userInfo.gender === 'male' ? '男' : userInfo.gender === 'female' ? '女' : '保密' }}
          </el-descriptions-item>
          <el-descriptions-item label="积分">{{ userInfo.points }}</el-descriptions-item>
          <el-descriptions-item label="等级">Lv.{{ userInfo.level }}</el-descriptions-item>
          <el-descriptions-item label="注册时间">{{ userInfo.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="最后登录">{{ userInfo.lastLoginAt || '-' }}</el-descriptions-item>
        </el-descriptions>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { mockUsers } from '@/mock'
import type { UserListItem } from '@/types/user'

const route = useRoute()
const loading = ref(false)
const userInfo = ref<UserListItem | null>(null)

onMounted(() => {
  const id = route.params.id as string
  userInfo.value = mockUsers.find(u => u.id === id) || null
})
</script>

<style scoped lang="scss">
.user-detail-page {
  .detail-content {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .user-profile {
    display: flex;
    align-items: center;
    gap: 24px;
    
    .user-info {
      h2 {
        font-size: 24px;
        margin-bottom: 8px;
      }
      
      .username {
        color: var(--color-text-secondary);
        margin-bottom: 12px;
      }
      
      .tags {
        display: flex;
        gap: 8px;
      }
    }
  }
}
</style>
