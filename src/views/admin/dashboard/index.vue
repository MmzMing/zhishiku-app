<template>
  <div class="admin-dashboard-page">
    <el-card>
      <template #header>
        <span>管理面板</span>
      </template>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-statistic title="今日访问" :value="1234" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="新增用户" :value="56" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="新增内容" :value="89" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="待处理" :value="12" />
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
// Admin dashboard page
</script>

<style scoped lang="scss">
.admin-dashboard-page {
  :deep(.el-card) {
    background-color: var(--color-bg-secondary);
    border: none;
    
    .el-card__header {
      background-color: var(--color-bg-secondary);
      border-bottom: none;
      color: var(--color-text-primary);
    }
    
    .el-card__body {
      background-color: var(--color-bg-secondary);
    }
  }
  
  :deep(.el-statistic) {
    text-align: center;
    padding: 20px;
    background-color: var(--color-bg-tertiary);
    border-radius: 8px;
    
    .el-statistic__head {
      color: var(--color-text-secondary);
    }
    
    .el-statistic__content {
      color: var(--color-text-primary);
    }
  }
}
</style>
