<template>
  <div class="points-rules-page">
    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon" style="background: #409eff"><el-icon :size="28"><Coin /></el-icon></div>
          <div class="stat-info">
            <span class="stat-value">128,500</span>
            <span class="stat-label">总发放积分</span>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon" style="background: #67c23a"><el-icon :size="28"><TrendCharts /></el-icon></div>
          <div class="stat-info">
            <span class="stat-value">1,250</span>
            <span class="stat-label">今日发放</span>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon" style="background: #e6a23c"><el-icon :size="28"><ShoppingCart /></el-icon></div>
          <div class="stat-info">
            <span class="stat-value">45,000</span>
            <span class="stat-label">总消耗积分</span>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon" style="background: #f56c6c"><el-icon :size="28"><UserFilled /></el-icon></div>
          <div class="stat-info">
            <span class="stat-value">856</span>
            <span class="stat-label">活跃用户</span>
          </div>
        </div>
      </el-card>
    </div>
    
    <el-row :gutter="16">
      <!-- 获取规则 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>获取规则</span>
              <el-button type="primary" size="small" :icon="Plus" @click="showRuleDialog('earn')">新增规则</el-button>
            </div>
          </template>
          <el-table :data="earnRules" stripe>
            <el-table-column prop="name" label="规则名称" />
            <el-table-column label="积分" width="80">
              <template #default="{ row }">
                <span class="positive">+{{ row.points }}</span>
              </template>
            </el-table-column>
            <el-table-column label="限制" width="100">
              <template #default="{ row }">
                <span>{{ row.limit }}次/天</span>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="80">
              <template #default="{ row }">
                <el-switch v-model="row.enabled" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="{ row }">
                <div class="action-buttons">
                    <el-button size="small" type="primary" link @click="editRule(row)" class="action-btn">
                        <el-icon><EditIcon /></el-icon>编辑
                      </el-button>
                    <el-button size="small" type="danger" link @click="deleteRule(row)" class="action-btn">
                        <el-icon><DeleteIcon /></el-icon>删除
                      </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      
      <!-- 消费规则 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>消费规则</span>
              <el-button type="primary" size="small" :icon="Plus" @click="showRuleDialog('spend')">新增规则</el-button>
            </div>
          </template>
          <el-table :data="spendRules" stripe>
            <el-table-column prop="name" label="规则名称" />
            <el-table-column label="积分" width="80">
              <template #default="{ row }">
                <span class="negative">-{{ row.points }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="category" label="分类" width="80" />
            <el-table-column label="状态" width="80">
              <template #default="{ row }">
                <el-switch v-model="row.enabled" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="{ row }">
                <div class="action-buttons">
                  <el-button size="small" type="primary" link @click="editRule(row)" class="action-btn">
                    <el-icon><EditIcon /></el-icon>编辑
                  </el-button>
                  <el-button size="small" type="danger" link @click="deleteRule(row)" class="action-btn">
                    <el-icon><DeleteIcon /></el-icon>删除
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="16" style="margin-top: 16px">
      <!-- 等级体系 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>等级体系</span>
              <el-button type="primary" size="small" :icon="Plus" @click="showLevelDialog">新增等级</el-button>
            </div>
          </template>
          <div class="level-list">
            <div class="level-item" v-for="level in levels" :key="level.id">
              <div class="level-badge" :style="{ background: level.color }">
                <el-icon><Medal /></el-icon>
                <span>Lv.{{ level.level }}</span>
              </div>
              <div class="level-info">
                <span class="level-name">{{ level.name }}</span>
                <span class="level-require">需要 {{ level.minPoints }} 积分</span>
              </div>
              <div class="level-benefits">
                <el-tag size="small" v-for="benefit in level.benefits" :key="benefit">{{ benefit }}</el-tag>
              </div>
              <div class="level-actions">
                <el-button size="small" type="primary" link>编辑</el-button>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 有效期管理 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>有效期管理</span>
              <el-button type="primary" size="small" @click="saveExpirySettings">保存设置</el-button>
            </div>
          </template>
          <el-form label-width="120px">
            <el-form-item label="积分有效期">
              <el-switch v-model="expirySettings.enabled" active-text="启用" />
            </el-form-item>
            <el-form-item label="有效期时长" v-if="expirySettings.enabled">
              <el-input-number v-model="expirySettings.months" :min="1" :max="36" />
              <span style="margin-left: 8px">个月</span>
            </el-form-item>
            <el-form-item label="过期提醒" v-if="expirySettings.enabled">
              <el-checkbox-group v-model="expirySettings.remindDays">
                <el-checkbox :value="30">30天前</el-checkbox>
                <el-checkbox :value="7">7天前</el-checkbox>
                <el-checkbox :value="3">3天前</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="过期处理" v-if="expirySettings.enabled">
              <el-radio-group v-model="expirySettings.expireAction">
                <el-radio value="clear">清除过期积分</el-radio>
                <el-radio value="freeze">冻结过期积分</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
          
          <el-divider />
          
          <div class="expiry-stats">
            <div class="stat-item">
              <span class="label">即将过期积分</span>
              <span class="value warning">12,500</span>
            </div>
            <div class="stat-item">
              <span class="label">涉及用户</span>
              <span class="value">128 人</span>
            </div>
            <div class="stat-item">
              <span class="label">本月已过期</span>
              <span class="value danger">5,200</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 规则编辑弹窗 -->
    <el-dialog v-model="ruleDialogVisible" :title="ruleDialogTitle" width="500px">
      <el-form :model="ruleForm" label-width="100px">
        <el-form-item label="规则名称">
          <el-input v-model="ruleForm.name" placeholder="请输入规则名称" />
        </el-form-item>
        <el-form-item label="规则类型">
          <el-select v-model="ruleForm.type" style="width: 100%">
            <el-option label="登录奖励" value="login" />
            <el-option label="内容创作" value="content" />
            <el-option label="互动奖励" value="interaction" />
            <el-option label="购买消费" value="purchase" />
            <el-option label="兑换消费" value="exchange" />
          </el-select>
        </el-form-item>
        <el-form-item label="积分数值">
          <el-input-number v-model="ruleForm.points" :min="1" :max="1000" style="width: 100%" />
        </el-form-item>
        <el-form-item label="每日限制">
          <el-input-number v-model="ruleForm.limit" :min="1" :max="100" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="ruleForm.enabled" active-text="启用" inactive-text="禁用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="ruleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRule">保存</el-button>
      </template>
    </el-dialog>
    
    <!-- 等级编辑弹窗 -->
    <el-dialog v-model="levelDialogVisible" title="编辑等级" width="500px">
      <el-form :model="levelForm" label-width="100px">
        <el-form-item label="等级名称">
          <el-input v-model="levelForm.name" placeholder="如：青铜、白银、黄金" />
        </el-form-item>
        <el-form-item label="等级数值">
          <el-input-number v-model="levelForm.level" :min="1" :max="10" />
        </el-form-item>
        <el-form-item label="所需积分">
          <el-input-number v-model="levelForm.minPoints" :min="0" :step="100" />
        </el-form-item>
        <el-form-item label="等级颜色">
          <el-color-picker v-model="levelForm.color" />
        </el-form-item>
        <el-form-item label="等级权益">
          <el-select v-model="levelForm.benefits" multiple placeholder="选择权益" style="width: 100%">
            <el-option label="专属徽章" value="badge" />
            <el-option label="积分加倍" value="bonus" />
            <el-option label="优先客服" value="support" />
            <el-option label="兑换折扣" value="discount" />
            <el-option label="专属内容" value="exclusive" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="levelDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveLevel">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Plus, Coin, TrendCharts, ShoppingCart, UserFilled, Medal, Edit as EditIcon, Delete as DeleteIcon } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 获取规则
const earnRules = ref([
  { id: 1, name: '每日登录', points: 10, limit: 1, enabled: true },
  { id: 2, name: '观看视频', points: 5, limit: 10, enabled: true },
  { id: 3, name: '阅读博客', points: 3, limit: 20, enabled: true },
  { id: 4, name: '发表评论', points: 10, limit: 5, enabled: true },
  { id: 5, name: '分享内容', points: 15, limit: 3, enabled: true },
  { id: 6, name: '发布博客', points: 50, limit: 2, enabled: true },
])

// 消费规则
const spendRules = ref([
  { id: 1, name: '兑换课程', points: 100, category: '兑换', enabled: true },
  { id: 2, name: '兑换周边', points: 200, category: '兑换', enabled: true },
  { id: 3, name: '购买VIP', points: 500, category: '购买', enabled: true },
  { id: 4, name: '解锁内容', points: 50, category: '解锁', enabled: true },
])

// 等级体系
const levels = ref([
  { id: 1, level: 1, name: '青铜', minPoints: 0, color: '#cd7f32', benefits: ['基础权益'] },
  { id: 2, level: 2, name: '白银', minPoints: 500, color: '#c0c0c0', benefits: ['基础权益', '积分加1.2倍'] },
  { id: 3, level: 3, name: '黄金', minPoints: 2000, color: '#ffd700', benefits: ['基础权益', '积分加1.5倍', '专属徽章'] },
  { id: 4, level: 4, name: '铂金', minPoints: 5000, color: '#e5e4e2', benefits: ['全部权益', '积分加2倍', '专属客服'] },
  { id: 5, level: 5, name: '钻石', minPoints: 10000, color: '#b9f2ff', benefits: ['全部权益', '积分加3倍', '兑换9折'] },
])

// 有效期设置
const expirySettings = reactive({
  enabled: true,
  months: 12,
  remindDays: [30, 7] as number[],
  expireAction: 'clear'
})

// 规则弹窗
const ruleDialogVisible = ref(false)
const ruleDialogTitle = ref('新增规则')
const ruleForm = reactive({
  id: '',
  name: '',
  type: '',
  points: 10,
  limit: 1,
  enabled: true
})

// 等级弹窗
const levelDialogVisible = ref(false)
const levelForm = reactive({
  name: '',
  level: 1,
  minPoints: 0,
  color: '#409eff',
  benefits: [] as string[]
})

function showRuleDialog(type: 'earn' | 'spend') {
  ruleDialogTitle.value = type === 'earn' ? '新增获取规则' : '新增消费规则'
  Object.assign(ruleForm, { id: '', name: '', type: '', points: 10, limit: 1, enabled: true })
  ruleDialogVisible.value = true
}

function editRule(rule: any) {
  ruleDialogTitle.value = '编辑规则'
  Object.assign(ruleForm, rule)
  ruleDialogVisible.value = true
}

function deleteRule(rule: any) {
  ElMessageBox.confirm(`确定要删除规则 "${rule.name}" 吗？`, '警告', { type: 'warning' })
    .then(() => ElMessage.success('删除成功'))
    .catch(() => {})
}

function saveRule() {
  ElMessage.success('规则保存成功')
  ruleDialogVisible.value = false
}

function showLevelDialog() {
  Object.assign(levelForm, { name: '', level: levels.value.length + 1, minPoints: 0, color: '#409eff', benefits: [] })
  levelDialogVisible.value = true
}

function saveLevel() {
  ElMessage.success('等级保存成功')
  levelDialogVisible.value = false
}

function saveExpirySettings() {
  ElMessage.success('有效期设置已保存')
}
</script>

<style scoped lang="scss">
/* 紧凑操作栏样式 */
:deep(.action-buttons.compact) {
  .action-row {
    gap: 2px;
    margin-bottom: 2px;
    .el-button {
      padding: 0 8px;
      font-size: 12px;
      min-width: auto;
    }
  }
}
.action-buttons {
  .action-row {
    display: flex;
    gap: 8px;
    margin-bottom: 4px;
  }
}
.points-rules-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  .stats-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    
    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;
        gap: 16px;
        
        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
        }
        
        .stat-info {
          .stat-value {
            display: block;
            font-size: 24px;
            font-weight: 600;
            color: var(--color-text-primary);
          }
          
          .stat-label {
            font-size: 13px;
            color: var(--color-text-tertiary);
          }
        }
      }
    }
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .positive { color: #67c23a; font-weight: 600; }
  .negative { color: #f56c6c; font-weight: 600; }
  
  .level-list {
    .level-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 0;
      border-bottom: 1px solid var(--color-border);
      
      &:last-child { border-bottom: none; }
      
      .level-badge {
        width: 60px;
        height: 36px;
        border-radius: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        color: #fff;
        font-size: 12px;
        font-weight: 600;
      }
      
      .level-info {
        flex: 1;
        
        .level-name {
          display: block;
          font-weight: 500;
        }
        
        .level-require {
          font-size: 12px;
          color: var(--color-text-tertiary);
        }
      }
      
      .level-benefits {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
      }
    }
  }
  
  .expiry-stats {
    display: flex;
    justify-content: space-around;
    
    .stat-item {
      text-align: center;
      
      .label {
        display: block;
        font-size: 13px;
        color: var(--color-text-tertiary);
        margin-bottom: 4px;
      }
      
      .value {
        font-size: 20px;
        font-weight: 600;
        color: var(--color-text-primary);
        
        &.warning { color: #e6a23c; }
        &.danger { color: #f56c6c; }
      }
    }
  }
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
  min-width: 80px;
  text-align: left;
  display: block;
  line-height: 1.5;
  height: auto;
}

@media (max-width: 1200px) {
  .points-rules-page .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
