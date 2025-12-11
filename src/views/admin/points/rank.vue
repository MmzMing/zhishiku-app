<template>
  <div class="points-rank-page">
    <!-- 顶部Tab -->
    <el-tabs v-model="activeTab">
      <el-tab-pane label="积分排行" name="points" />
      <el-tab-pane label="分类排行" name="category" />
      <el-tab-pane label="成就系统" name="achievements" />
    </el-tabs>
    
    <!-- 积分排行 -->
    <div v-if="activeTab === 'points'">
      <el-row :gutter="16">
        <!-- 日榜 -->
        <el-col :span="8">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>日榜 <el-tag size="small">今日</el-tag></span>
                <el-button type="text" size="small">查看全部</el-button>
              </div>
            </template>
            <div class="rank-list">
              <div class="rank-item" v-for="(user, index) in dailyRank" :key="user.id" :class="'rank-' + (index + 1)">
                <div class="rank-number">{{ index + 1 }}</div>
                <el-avatar :size="40" :src="user.avatar" />
                <div class="rank-info">
                  <span class="rank-name">{{ user.username }}</span>
                  <span class="rank-level">Lv.{{ user.level }}</span>
                </div>
                <div class="rank-points">
                  <span class="points-value">+{{ user.points }}</span>
                  <span class="points-label">积分</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <!-- 周榜 -->
        <el-col :span="8">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>周榜 <el-tag size="small" type="success">本周</el-tag></span>
                <el-button type="text" size="small">查看全部</el-button>
              </div>
            </template>
            <div class="rank-list">
              <div class="rank-item" v-for="(user, index) in weeklyRank" :key="user.id" :class="'rank-' + (index + 1)">
                <div class="rank-number">{{ index + 1 }}</div>
                <el-avatar :size="40" :src="user.avatar" />
                <div class="rank-info">
                  <span class="rank-name">{{ user.username }}</span>
                  <span class="rank-level">Lv.{{ user.level }}</span>
                </div>
                <div class="rank-points">
                  <span class="points-value">+{{ user.points }}</span>
                  <span class="points-label">积分</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <!-- 月榜 -->
        <el-col :span="8">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>月榜 <el-tag size="small" type="warning">本月</el-tag></span>
                <el-button type="text" size="small">查看全部</el-button>
              </div>
            </template>
            <div class="rank-list">
              <div class="rank-item" v-for="(user, index) in monthlyRank" :key="user.id" :class="'rank-' + (index + 1)">
                <div class="rank-number">{{ index + 1 }}</div>
                <el-avatar :size="40" :src="user.avatar" />
                <div class="rank-info">
                  <span class="rank-name">{{ user.username }}</span>
                  <span class="rank-level">Lv.{{ user.level }}</span>
                </div>
                <div class="rank-points">
                  <span class="points-value">+{{ user.points }}</span>
                  <span class="points-label">积分</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 总榜 -->
      <el-card style="margin-top: 16px">
        <template #header>
          <div class="card-header">
            <span>积分总榜</span>
            <div>
              <el-date-picker v-model="rankDateRange" type="daterange" style="width: 240px; margin-right: 12px" />
              <el-button :icon="Download" @click="exportRank">导出</el-button>
            </div>
          </div>
        </template>
        
        <!-- 前三名展示 -->
        <div class="top-three">
          <div class="top-item second">
            <div class="crown">🥈</div>
            <el-avatar :size="64" :src="totalRank[1]?.avatar" />
            <span class="top-name">{{ totalRank[1]?.username }}</span>
            <span class="top-points">{{ totalRank[1]?.totalPoints.toLocaleString() }}</span>
          </div>
          <div class="top-item first">
            <div class="crown">👑</div>
            <el-avatar :size="80" :src="totalRank[0]?.avatar" />
            <span class="top-name">{{ totalRank[0]?.username }}</span>
            <span class="top-points">{{ totalRank[0]?.totalPoints.toLocaleString() }}</span>
          </div>
          <div class="top-item third">
            <div class="crown">🥉</div>
            <el-avatar :size="64" :src="totalRank[2]?.avatar" />
            <span class="top-name">{{ totalRank[2]?.username }}</span>
            <span class="top-points">{{ totalRank[2]?.totalPoints.toLocaleString() }}</span>
          </div>
        </div>
        
        <!-- 完整排行表格 -->
        <el-table :data="totalRank" stripe style="margin-top: 24px">
          <el-table-column label="排名" width="80">
            <template #default="{ $index }">
              <span class="table-rank" :class="'rank-' + ($index + 1)">{{ $index + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column label="用户" min-width="200">
            <template #default="{ row }">
              <div class="user-cell">
                <el-avatar :size="36" :src="row.avatar" />
                <div>
                  <span class="username">{{ row.username }}</span>
                  <span class="user-level">Lv.{{ row.level }} · {{ row.levelName }}</span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="totalPoints" label="累计积分" width="140">
            <template #default="{ row }">
              <span class="total-points">{{ row.totalPoints.toLocaleString() }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="monthPoints" label="本月获取" width="120" />
          <el-table-column prop="achievementCount" label="成就数" width="100" />
          <el-table-column label="变化趋势" width="100">
            <template #default="{ row }">
              <span v-if="row.trend > 0" class="trend up">↑{{ row.trend }}</span>
              <span v-else-if="row.trend < 0" class="trend down">↓{{ Math.abs(row.trend) }}</span>
              <span v-else class="trend">-</span>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
    
    <!-- 分类排行 -->
    <div v-if="activeTab === 'category'">
      <el-row :gutter="16">
        <el-col :span="8" v-for="category in categoryRanks" :key="category.type">
          <el-card>
            <template #header>
              <div class="card-header">
                <span><el-icon :style="{ color: category.color }"><component :is="category.icon" /></el-icon> {{ category.name }}</span>
                <el-button type="text" size="small">查看全部</el-button>
              </div>
            </template>
            <div class="category-rank-list">
              <div class="category-rank-item" v-for="(user, index) in category.users" :key="user.id">
                <span class="rank-badge" :class="'rank-' + (index + 1)">{{ index + 1 }}</span>
                <el-avatar :size="32" :src="user.avatar" />
                <span class="user-name">{{ user.username }}</span>
                <span class="user-count">{{ user.count }} {{ category.unit }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <el-card style="margin-top: 16px">
        <template #header>
          <div class="card-header">
            <span>自定义排行</span>
            <el-button type="primary" size="small" :icon="Plus" @click="showRankDialog">创建排行</el-button>
          </div>
        </template>
        <div class="custom-ranks">
          <el-tag v-for="rank in customRanks" :key="rank.id" size="large" closable @close="deleteCustomRank(rank)">
            {{ rank.name }}
          </el-tag>
          <el-tag v-if="customRanks.length === 0" type="info">暂无自定义排行</el-tag>
        </div>
      </el-card>
    </div>
    
    <!-- 成就系统 -->
    <div v-if="activeTab === 'achievements'">
      <el-row :gutter="16">
        <!-- 成就管理 -->
        <el-col :span="16">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>成就管理</span>
                <el-button type="primary" :icon="Plus" @click="showAchievementDialog()">添加成就</el-button>
              </div>
            </template>
            
            <div class="achievement-filter">
              <el-input v-model="achievementSearch" placeholder="搜索成就" style="width: 200px" clearable />
              <el-select v-model="achievementCategory" placeholder="分类" style="width: 120px" clearable>
                <el-option label="全部" value="" />
                <el-option label="新手成就" value="beginner" />
                <el-option label="内容创作" value="content" />
                <el-option label="社交互动" value="social" />
                <el-option label="学习成长" value="learning" />
                <el-option label="特殊成就" value="special" />
              </el-select>
            </div>
            
            <div class="achievements-grid">
              <div class="achievement-card" v-for="achievement in achievements" :key="achievement.id">
                <div class="achievement-icon" :style="{ background: achievement.color }">
                  <span class="icon-text">{{ achievement.icon }}</span>
                </div>
                <div class="achievement-info">
                  <h4>{{ achievement.name }}</h4>
                  <p>{{ achievement.description }}</p>
                  <div class="achievement-meta">
                    <el-tag size="small">+{{ achievement.points }} 积分</el-tag>
                    <span class="unlock-count">{{ achievement.unlockCount }} 人解锁</span>
                  </div>
                </div>
                <div class="achievement-actions action-buttons">
                  <el-button size="small" type="primary" link @click="showAchievementDialog(achievement)" class="action-btn">编辑</el-button>
                  <el-button size="small" type="danger" link class="action-btn">删除</el-button>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <!-- 成就统计 -->
        <el-col :span="8">
          <el-card>
            <template #header><span>成就统计</span></template>
            <div class="achievement-stats">
              <div class="stat-item">
                <span class="stat-value">{{ achievementStats.total }}</span>
                <span class="stat-label">成就总数</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ achievementStats.unlocked }}</span>
                <span class="stat-label">已解锁</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ achievementStats.totalPoints.toLocaleString() }}</span>
                <span class="stat-label">总奖励积分</span>
              </div>
            </div>
          </el-card>
          
          <el-card style="margin-top: 16px">
            <template #header><span>最新解锁</span></template>
            <div class="recent-unlocks">
              <div class="unlock-item" v-for="item in recentUnlocks" :key="item.id">
                <el-avatar :size="32" :src="item.avatar" />
                <div class="unlock-info">
                  <span class="unlock-user">{{ item.username }}</span>
                  <span class="unlock-achievement">解锁「{{ item.achievement }}」</span>
                </div>
                <span class="unlock-time">{{ item.time }}</span>
              </div>
            </div>
          </el-card>
          
          <el-card style="margin-top: 16px">
            <template #header><span>成就达人</span></template>
            <div class="achievement-masters">
              <div class="master-item" v-for="(user, index) in achievementMasters" :key="user.id">
                <span class="master-rank">{{ index + 1 }}</span>
                <el-avatar :size="32" :src="user.avatar" />
                <span class="master-name">{{ user.username }}</span>
                <span class="master-count">{{ user.count }} 个成就</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 成就编辑弹窗 -->
    <el-dialog v-model="achievementDialogVisible" :title="achievementDialogTitle" width="500px">
      <el-form :model="achievementForm" label-width="100px">
        <el-form-item label="成就名称">
          <el-input v-model="achievementForm.name" placeholder="请输入成就名称" />
        </el-form-item>
        <el-form-item label="成就图标">
          <div class="icon-picker">
            <div 
              class="icon-option" 
              v-for="icon in iconOptions" 
              :key="icon" 
              :class="{ active: achievementForm.icon === icon }"
              @click="achievementForm.icon = icon"
            >{{ icon }}</div>
          </div>
        </el-form-item>
        <el-form-item label="图标颜色">
          <el-color-picker v-model="achievementForm.color" />
        </el-form-item>
        <el-form-item label="成就分类">
          <el-select v-model="achievementForm.category" style="width: 100%">
            <el-option label="新手成就" value="beginner" />
            <el-option label="内容创作" value="content" />
            <el-option label="社交互动" value="social" />
            <el-option label="学习成长" value="learning" />
            <el-option label="特殊成就" value="special" />
          </el-select>
        </el-form-item>
        <el-form-item label="奖励积分">
          <el-input-number v-model="achievementForm.points" :min="0" :step="10" style="width: 100%" />
        </el-form-item>
        <el-form-item label="解锁条件">
          <el-input v-model="achievementForm.condition" type="textarea" :rows="2" placeholder="描述解锁条件" />
        </el-form-item>
        <el-form-item label="成就描述">
          <el-input v-model="achievementForm.description" type="textarea" :rows="2" placeholder="成就说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="achievementDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveAchievement">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Plus, Download, Edit, VideoCamera, ChatDotRound, Trophy } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('points')

// 日榜
const dailyRank = ref([
  { id: 1, username: '张三', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', level: 5, points: 180 },
  { id: 2, username: '李四', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2', level: 4, points: 150 },
  { id: 3, username: '王五', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3', level: 3, points: 120 },
  { id: 4, username: '赵六', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4', level: 4, points: 100 },
  { id: 5, username: '孙七', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5', level: 2, points: 80 },
])

// 周榜
const weeklyRank = ref([
  { id: 1, username: '李四', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2', level: 4, points: 850 },
  { id: 2, username: '张三', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', level: 5, points: 780 },
  { id: 3, username: '钱八', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=6', level: 4, points: 650 },
  { id: 4, username: '王五', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3', level: 3, points: 520 },
  { id: 5, username: '周九', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=7', level: 3, points: 480 },
])

// 月榜
const monthlyRank = ref([
  { id: 1, username: '李四', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2', level: 4, points: 3200 },
  { id: 2, username: '钱八', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=6', level: 4, points: 2800 },
  { id: 3, username: '张三', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', level: 5, points: 2500 },
  { id: 4, username: '吴十', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=8', level: 5, points: 2200 },
  { id: 5, username: '周九', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=7', level: 3, points: 1900 },
])

// 总榜
const rankDateRange = ref<[Date, Date] | null>(null)
const totalRank = ref([
  { id: 1, username: '李四', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2', level: 5, levelName: '钻石', totalPoints: 28500, monthPoints: 3200, achievementCount: 32, trend: 0 },
  { id: 2, username: '钱八', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=6', level: 5, levelName: '钻石', totalPoints: 25800, monthPoints: 2800, achievementCount: 28, trend: 1 },
  { id: 3, username: '张三', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', level: 4, levelName: '铂金', totalPoints: 22000, monthPoints: 2500, achievementCount: 25, trend: -1 },
  { id: 4, username: '吴十', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=8', level: 4, levelName: '铂金', totalPoints: 18500, monthPoints: 2200, achievementCount: 22, trend: 2 },
  { id: 5, username: '周九', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=7', level: 3, levelName: '黄金', totalPoints: 15200, monthPoints: 1900, achievementCount: 18, trend: 0 },
])

// 分类排行
const categoryRanks = ref([
  {
    type: 'content',
    name: '内容创作榜',
    icon: Edit,
    color: '#409eff',
    unit: '篇',
    users: [
      { id: 1, username: '张三', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', count: 128 },
      { id: 2, username: '李四', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2', count: 96 },
      { id: 3, username: '王五', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3', count: 85 },
    ]
  },
  {
    type: 'video',
    name: '视频观看榜',
    icon: VideoCamera,
    color: '#67c23a',
    unit: '小时',
    users: [
      { id: 1, username: '赵六', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4', count: 256 },
      { id: 2, username: '孙七', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5', count: 198 },
      { id: 3, username: '钱八', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=6', count: 165 },
    ]
  },
  {
    type: 'interaction',
    name: '互动活跃榜',
    icon: ChatDotRound,
    color: '#e6a23c',
    unit: '次',
    users: [
      { id: 1, username: '周九', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=7', count: 520 },
      { id: 2, username: '吴十', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=8', count: 485 },
      { id: 3, username: '张三', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', count: 420 },
    ]
  },
])

const customRanks = ref<{ id: string; name: string }[]>([])

// 成就系统
const achievementSearch = ref('')
const achievementCategory = ref('')
const achievements = ref([
  { id: 1, name: '初出茅庐', icon: '🌟', color: '#67c23a', description: '完成首次登录', points: 10, unlockCount: 8520 },
  { id: 2, name: '创作达人', icon: '✍️', color: '#409eff', description: '发布10篇博客文章', points: 100, unlockCount: 856 },
  { id: 3, name: '学习先锋', icon: '📚', color: '#e6a23c', description: '观看100小时视频', points: 200, unlockCount: 256 },
  { id: 4, name: '社交明星', icon: '💬', color: '#f56c6c', description: '获得1000个评论点赞', points: 150, unlockCount: 128 },
  { id: 5, name: '积分大亨', icon: '💰', color: '#909399', description: '累计获得10000积分', points: 300, unlockCount: 56 },
  { id: 6, name: '忠实用户', icon: '🏆', color: '#ffd700', description: '连续登录30天', points: 500, unlockCount: 89 },
])

const achievementStats = reactive({
  total: 24,
  unlocked: 1856,
  totalPoints: 15800
})

const recentUnlocks = ref([
  { id: 1, username: '张三', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', achievement: '创作达人', time: '刚刚' },
  { id: 2, username: '李四', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2', achievement: '学习先锋', time: '5分钟前' },
  { id: 3, username: '王五', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3', achievement: '初出茅庐', time: '10分钟前' },
])

const achievementMasters = ref([
  { id: 1, username: '李四', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2', count: 18 },
  { id: 2, username: '钱八', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=6', count: 16 },
  { id: 3, username: '张三', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', count: 15 },
])

// 成就弹窗
const achievementDialogVisible = ref(false)
const achievementDialogTitle = ref('添加成就')
const achievementForm = reactive({
  id: '',
  name: '',
  icon: '🌟',
  color: '#409eff',
  category: 'beginner',
  points: 100,
  condition: '',
  description: ''
})

const iconOptions = ['🌟', '✍️', '📚', '💬', '💰', '🏆', '🎯', '🔥', '💎', '👑', '🎓', '🚀']

function exportRank() {
  ElMessage.success('排行榜导出成功')
}

function showRankDialog() {
  ElMessage.info('创建自定义排行')
}

function deleteCustomRank(rank: { id: string; name: string }) {
  customRanks.value = customRanks.value.filter(r => r.id !== rank.id)
}

function showAchievementDialog(achievement?: typeof achievements.value[0]) {
  if (achievement) {
    achievementDialogTitle.value = '编辑成就'
    Object.assign(achievementForm, achievement)
  } else {
    achievementDialogTitle.value = '添加成就'
    Object.assign(achievementForm, { id: '', name: '', icon: '🌟', color: '#409eff', category: 'beginner', points: 100, condition: '', description: '' })
  }
  achievementDialogVisible.value = true
}

function saveAchievement() {
  ElMessage.success('成就保存成功')
  achievementDialogVisible.value = false
}
</script>

<style scoped lang="scss">
.points-rank-page {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .rank-list {
    .rank-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 8px;
      background: var(--color-bg-secondary);
      
      &:last-child { margin-bottom: 0; }
      
      &.rank-1 { background: linear-gradient(135deg, #ffd700 0%, #ffed4a 100%); }
      &.rank-2 { background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%); }
      &.rank-3 { background: linear-gradient(135deg, #cd7f32 0%, #daa520 100%); }
      
      &.rank-1, &.rank-2, &.rank-3 {
        .rank-number, .rank-name, .points-value { color: #333; }
        .rank-level, .points-label { color: #666; }
      }
      
      .rank-number {
        width: 24px;
        text-align: center;
        font-weight: 700;
        font-size: 16px;
        color: var(--color-text-primary);
      }
      
      .rank-info {
        flex: 1;
        .rank-name { display: block; font-weight: 500; }
        .rank-level { font-size: 12px; color: var(--color-text-tertiary); }
      }
      
      .rank-points {
        text-align: right;
        .points-value { display: block; font-weight: 600; color: #67c23a; }
        .points-label { font-size: 12px; color: var(--color-text-tertiary); }
      }
    }
  }
  
  .top-three {
    display: flex;
    justify-content: center;
    align-items: flex-end;
    gap: 40px;
    padding: 24px 0;
    
    .top-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .crown { font-size: 32px; margin-bottom: 8px; }
      .top-name { margin-top: 8px; font-weight: 500; }
      .top-points { font-size: 18px; font-weight: 600; color: #f56c6c; }
      
      &.first { transform: translateY(-20px); }
    }
  }
  
  .user-cell {
    display: flex;
    align-items: center;
    gap: 10px;
    .username { display: block; font-weight: 500; }
    .user-level { font-size: 12px; color: var(--color-text-tertiary); }
  }
  
  .table-rank {
    display: inline-block;
    width: 24px;
    height: 24px;
    line-height: 24px;
    text-align: center;
    border-radius: 50%;
    font-weight: 600;
    
    &.rank-1 { background: #ffd700; color: #333; }
    &.rank-2 { background: #c0c0c0; color: #333; }
    &.rank-3 { background: #cd7f32; color: #fff; }
  }
  
  .total-points { font-weight: 600; color: var(--color-text-primary); }
  
  .trend {
    font-weight: 500;
    &.up { color: #67c23a; }
    &.down { color: #f56c6c; }
  }
  
  .category-rank-list {
    .category-rank-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 0;
      border-bottom: 1px solid var(--color-border);
      
      &:last-child { border-bottom: none; }
      
      .rank-badge {
        width: 20px;
        height: 20px;
        line-height: 20px;
        text-align: center;
        border-radius: 50%;
        font-size: 12px;
        font-weight: 600;
        background: var(--color-bg-tertiary);
        
        &.rank-1 { background: #ffd700; color: #333; }
        &.rank-2 { background: #c0c0c0; color: #333; }
        &.rank-3 { background: #cd7f32; color: #fff; }
      }
      
      .user-name { flex: 1; font-weight: 500; }
      .user-count { color: var(--color-text-tertiary); font-size: 13px; }
    }
  }
  
  .custom-ranks {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  
  .achievement-filter {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }
  
  .achievements-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
    
    .achievement-card {
      display: flex;
      gap: 12px;
      padding: 16px;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      
      .achievement-icon {
        width: 56px;
        height: 56px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        .icon-text { font-size: 28px; }
      }
      
      .achievement-info {
        flex: 1;
        h4 { margin: 0 0 4px 0; font-size: 15px; }
        p { margin: 0 0 8px 0; font-size: 13px; color: var(--color-text-tertiary); }
        .achievement-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          .unlock-count { font-size: 12px; color: var(--color-text-tertiary); }
        }
      }
      
      .achievement-actions {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
    }
  }
  
  .achievement-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    text-align: center;
    
    .stat-item {
      .stat-value { display: block; font-size: 24px; font-weight: 600; color: var(--color-text-primary); }
      .stat-label { font-size: 13px; color: var(--color-text-tertiary); }
    }
  }
  
  .recent-unlocks {
    .unlock-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 0;
      border-bottom: 1px solid var(--color-border);
      &:last-child { border-bottom: none; }
      
      .unlock-info {
        flex: 1;
        .unlock-user { display: block; font-weight: 500; font-size: 13px; }
        .unlock-achievement { font-size: 12px; color: var(--color-text-tertiary); }
      }
      .unlock-time { font-size: 12px; color: var(--color-text-tertiary); }
    }
  }
  
  .achievement-masters {
    .master-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 0;
      border-bottom: 1px solid var(--color-border);
      &:last-child { border-bottom: none; }
      
      .master-rank { font-weight: 600; color: #f56c6c; }
      .master-name { flex: 1; font-weight: 500; }
      .master-count { font-size: 12px; color: var(--color-text-tertiary); }
    }
  }
  
  .icon-picker {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    
    .icon-option {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      border: 2px solid var(--color-border);
      border-radius: 8px;
      cursor: pointer;
      
      &.active { border-color: #409eff; background: #ecf5ff; }
      &:hover { border-color: #409eff; }
    }
  }
  
  // 操作按钮统一样式
  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 60px;
  }
  
  .action-btn {
    min-width: 60px;
    padding: 4px 0;
    margin: 0;
  }
}
</style>
