<template>
  <div class="blog-analytics-page">
    <!-- 统计卡片 -->
    <div class="stat-cards">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon views"><el-icon :size="28"><View /></el-icon></div>
          <div class="stat-info">
            <span class="stat-value">{{ formatNumber(stats.totalViews) }}</span>
            <span class="stat-label">总阅读量</span>
            <span class="stat-trend up">+12.5%</span>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon articles"><el-icon :size="28"><Document /></el-icon></div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.totalArticles }}</span>
            <span class="stat-label">文章总数</span>
            <span class="stat-trend up">+8 本周</span>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon likes"><el-icon :size="28"><Star /></el-icon></div>
          <div class="stat-info">
            <span class="stat-value">{{ formatNumber(stats.totalLikes) }}</span>
            <span class="stat-label">点赞总数</span>
            <span class="stat-trend up">+5.2%</span>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon comments"><el-icon :size="28"><ChatDotRound /></el-icon></div>
          <div class="stat-info">
            <span class="stat-value">{{ formatNumber(stats.totalComments) }}</span>
            <span class="stat-label">评论总数</span>
            <span class="stat-trend down">-2.1%</span>
          </div>
        </div>
      </el-card>
    </div>
    
    <el-row :gutter="16">
      <!-- 阅读趋势 -->
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>阅读趋势分析</span>
              <el-radio-group v-model="trendRange" size="small">
                <el-radio-button value="7d">7天</el-radio-button>
                <el-radio-button value="30d">30天</el-radio-button>
                <el-radio-button value="90d">90天</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          
          <div class="chart-container">
            <div class="chart-placeholder">
              <div class="chart-bars">
                <div v-for="(item, index) in trendData" :key="index" class="chart-bar-wrapper">
                  <div class="chart-bar" :style="{ height: item.views / 50 + 'px' }"></div>
                  <span class="chart-label">{{ item.date }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="trend-summary">
            <div class="summary-item">
              <span class="label">日均阅读</span>
              <span class="value">{{ Math.round(trendData.reduce((a, b) => a + b.views, 0) / trendData.length) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">峰值日期</span>
              <span class="value">{{ trendData.reduce((a, b) => a.views > b.views ? a : b).date }}</span>
            </div>
            <div class="summary-item">
              <span class="label">周环比</span>
              <span class="value trend-up">+15.3%</span>
            </div>
          </div>
        </el-card>
        
        <!-- SEO效果监控 -->
        <el-card style="margin-top: 16px">
          <template #header>
            <div class="card-header">
              <span>SEO效果监控</span>
              <el-button size="small" :icon="Refresh">刷新数据</el-button>
            </div>
          </template>
          
          <el-table :data="seoData" stripe>
            <el-table-column prop="keyword" label="关键词" min-width="150" />
            <el-table-column prop="rank" label="排名" width="80">
              <template #default="{ row }">
                <span :class="['rank', row.rank <= 10 ? 'top' : '']">{{ row.rank }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="volume" label="搜索量" width="100" />
            <el-table-column prop="clicks" label="点击量" width="100" />
            <el-table-column label="CTR" width="100">
              <template #default="{ row }">
                <span>{{ ((row.clicks / row.impressions) * 100).toFixed(1) }}%</span>
              </template>
            </el-table-column>
            <el-table-column label="趋势" width="100">
              <template #default="{ row }">
                <el-tag :type="row.trend === 'up' ? 'success' : row.trend === 'down' ? 'danger' : 'info'" size="small">
                  {{ row.trend === 'up' ? '↑ 上升' : row.trend === 'down' ? '↓ 下降' : '→ 持平' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
          
          <div class="seo-tips">
            <el-alert title="SEO优化建议" type="info" :closable="false">
              <ul>
                <li>「Vue3教程」排名稳定在前5，继续保持内容更新</li>
                <li>「TypeScript入门」点击率偏低，建议优化标题和描述</li>
                <li>增加更多长尾关键词相关内容可提升整体流量</li>
              </ul>
            </el-alert>
          </div>
        </el-card>
      </el-col>
      
      <!-- 右侧统计 -->
      <el-col :span="8">
        <!-- 热门文章排行 -->
        <el-card>
          <template #header>
            <div class="card-header">
              <span>热门文章排行</span>
              <el-select v-model="rankType" size="small" style="width: 100px">
                <el-option label="阅读量" value="views" />
                <el-option label="点赞数" value="likes" />
                <el-option label="评论数" value="comments" />
              </el-select>
            </div>
          </template>
          
          <div class="rank-list">
            <div class="rank-item" v-for="(article, index) in hotArticles" :key="article.id">
              <div class="rank-num" :class="{ top: index < 3 }">{{ index + 1 }}</div>
              <div class="rank-info">
                <span class="title">{{ article.title }}</span>
                <div class="meta">
                  <span><el-icon><View /></el-icon> {{ article.views }}</span>
                  <span><el-icon><Star /></el-icon> {{ article.likes }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
        
        <!-- 用户行为分析 -->
        <el-card style="margin-top: 16px">
          <template #header>
            <span>用户行为分析</span>
          </template>
          
          <div class="behavior-stats">
            <div class="behavior-item">
              <div class="behavior-header">
                <span class="label">平均阅读时长</span>
                <span class="value">4:32</span>
              </div>
              <el-progress :percentage="75" :stroke-width="8" :show-text="false" color="#67c23a" />
            </div>
            <div class="behavior-item">
              <div class="behavior-header">
                <span class="label">跳出率</span>
                <span class="value">32.5%</span>
              </div>
              <el-progress :percentage="32" :stroke-width="8" :show-text="false" color="#f56c6c" />
            </div>
            <div class="behavior-item">
              <div class="behavior-header">
                <span class="label">完读率</span>
                <span class="value">68.2%</span>
              </div>
              <el-progress :percentage="68" :stroke-width="8" :show-text="false" color="#409eff" />
            </div>
            <div class="behavior-item">
              <div class="behavior-header">
                <span class="label">互动率</span>
                <span class="value">12.8%</span>
              </div>
              <el-progress :percentage="13" :stroke-width="8" :show-text="false" color="#e6a23c" />
            </div>
          </div>
        </el-card>
        
        <!-- 分类分布 -->
        <el-card style="margin-top: 16px">
          <template #header>
            <span>分类阅读分布</span>
          </template>
          
          <div class="category-distribution">
            <div class="dist-item" v-for="item in categoryDistribution" :key="item.name">
              <div class="dist-header">
                <span class="name">{{ item.name }}</span>
                <span class="percent">{{ item.percent }}%</span>
              </div>
              <el-progress :percentage="item.percent" :stroke-width="10" :show-text="false" :color="item.color" />
            </div>
          </div>
        </el-card>
        
        <!-- 流量来源 -->
        <el-card style="margin-top: 16px">
          <template #header>
            <span>流量来源</span>
          </template>
          
          <div class="traffic-source">
            <div class="source-item" v-for="source in trafficSources" :key="source.name">
              <div class="source-icon" :style="{ background: source.color }">
                <el-icon><component :is="source.icon" /></el-icon>
              </div>
              <div class="source-info">
                <span class="name">{{ source.name }}</span>
                <span class="count">{{ formatNumber(source.count) }}</span>
              </div>
              <span class="percent">{{ source.percent }}%</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { View, Document, Star, ChatDotRound, Refresh, Search, Link, ChromeFilled, Share } from '@element-plus/icons-vue'

const trendRange = ref('7d')
const rankType = ref('views')

const stats = reactive({
  totalViews: 156800,
  totalArticles: 128,
  totalLikes: 8920,
  totalComments: 2350
})

const trendData = ref([
  { date: '01-09', views: 2100 },
  { date: '01-10', views: 2450 },
  { date: '01-11', views: 1980 },
  { date: '01-12', views: 2800 },
  { date: '01-13', views: 3200 },
  { date: '01-14', views: 2650 },
  { date: '01-15', views: 2900 },
])

const hotArticles = ref([
  { id: '1', title: 'Vue3 Composition API完全指南', views: 12580, likes: 856, comments: 128 },
  { id: '2', title: 'TypeScript从入门到精通', views: 9850, likes: 623, comments: 95 },
  { id: '3', title: '前端性能优化最佳实践', views: 8620, likes: 542, comments: 87 },
  { id: '4', title: 'Webpack5配置详解', views: 7450, likes: 428, comments: 62 },
  { id: '5', title: 'Node.js后端开发指南', views: 6890, likes: 385, comments: 58 },
])

const seoData = ref([
  { keyword: 'Vue3教程', rank: 3, volume: 5200, clicks: 1280, impressions: 8500, trend: 'up' },
  { keyword: 'TypeScript入门', rank: 8, volume: 3800, clicks: 420, impressions: 4200, trend: 'stable' },
  { keyword: '前端面试题', rank: 12, volume: 8500, clicks: 650, impressions: 6800, trend: 'up' },
  { keyword: 'Webpack配置', rank: 5, volume: 2400, clicks: 580, impressions: 3200, trend: 'down' },
  { keyword: 'React hooks', rank: 15, volume: 4600, clicks: 280, impressions: 3500, trend: 'stable' },
])

const categoryDistribution = ref([
  { name: '前端开发', percent: 42, color: '#409eff' },
  { name: '后端开发', percent: 28, color: '#67c23a' },
  { name: 'DevOps', percent: 18, color: '#e6a23c' },
  { name: '数据库', percent: 12, color: '#f56c6c' },
])

const trafficSources = ref([
  { name: '搜索引擎', count: 85600, percent: 55, color: '#409eff', icon: Search },
  { name: '直接访问', count: 42300, percent: 27, color: '#67c23a', icon: Link },
  { name: '社交媒体', count: 18500, percent: 12, color: '#e6a23c', icon: Share },
  { name: '外部链接', count: 10400, percent: 6, color: '#f56c6c', icon: ChromeFilled },
])

function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}
</script>

<style scoped lang="scss">
.blog-analytics-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  .stat-cards {
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
          
          &.views { background: linear-gradient(135deg, #409eff, #66b1ff); }
          &.articles { background: linear-gradient(135deg, #67c23a, #85ce61); }
          &.likes { background: linear-gradient(135deg, #e6a23c, #ebb563); }
          &.comments { background: linear-gradient(135deg, #f56c6c, #f89898); }
        }
        
        .stat-info {
          .stat-value {
            display: block;
            font-size: 28px;
            font-weight: 600;
            color: var(--color-text-primary);
          }
          
          .stat-label {
            font-size: 13px;
            color: var(--color-text-tertiary);
          }
          
          .stat-trend {
            font-size: 12px;
            margin-left: 8px;
            
            &.up { color: #67c23a; }
            &.down { color: #f56c6c; }
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
  
  .chart-container {
    height: 200px;
    
    .chart-placeholder {
      height: 100%;
      display: flex;
      align-items: flex-end;
      padding: 20px 0;
      
      .chart-bars {
        display: flex;
        justify-content: space-around;
        width: 100%;
        height: 100%;
        align-items: flex-end;
        
        .chart-bar-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          
          .chart-bar {
            width: 40px;
            background: linear-gradient(180deg, var(--color-primary), rgba(64, 158, 255, 0.3));
            border-radius: 4px 4px 0 0;
            min-height: 10px;
            transition: height 0.3s;
          }
          
          .chart-label {
            font-size: 12px;
            color: var(--color-text-tertiary);
            margin-top: 8px;
          }
        }
      }
    }
  }
  
  .trend-summary {
    display: flex;
    justify-content: space-around;
    padding-top: 16px;
    border-top: 1px solid var(--color-border);
    
    .summary-item {
      text-align: center;
      
      .label {
        display: block;
        font-size: 13px;
        color: var(--color-text-tertiary);
        margin-bottom: 4px;
      }
      
      .value {
        font-size: 18px;
        font-weight: 600;
        color: var(--color-text-primary);
        
        &.trend-up { color: #67c23a; }
        &.trend-down { color: #f56c6c; }
      }
    }
  }
  
  .rank {
    font-weight: 600;
    
    &.top {
      color: #67c23a;
    }
  }
  
  .seo-tips {
    margin-top: 16px;
    
    ul {
      margin: 8px 0 0 16px;
      padding: 0;
      font-size: 13px;
      
      li {
        margin-bottom: 4px;
      }
    }
  }
  
  .rank-list {
    .rank-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid var(--color-border);
      
      &:last-child {
        border-bottom: none;
      }
      
      .rank-num {
        width: 24px;
        height: 24px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 600;
        background: var(--color-bg-secondary);
        color: var(--color-text-tertiary);
        flex-shrink: 0;
        
        &.top {
          background: linear-gradient(135deg, #f7ba2a, #f5a623);
          color: #fff;
        }
      }
      
      .rank-info {
        flex: 1;
        
        .title {
          display: block;
          font-weight: 500;
          margin-bottom: 4px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .meta {
          display: flex;
          gap: 12px;
          font-size: 12px;
          color: var(--color-text-tertiary);
          
          span {
            display: flex;
            align-items: center;
            gap: 4px;
          }
        }
      }
    }
  }
  
  .behavior-stats {
    .behavior-item {
      margin-bottom: 20px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .behavior-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        
        .label {
          color: var(--color-text-secondary);
        }
        
        .value {
          font-weight: 600;
          color: var(--color-text-primary);
        }
      }
    }
  }
  
  .category-distribution {
    .dist-item {
      margin-bottom: 16px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .dist-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 6px;
        
        .name {
          color: var(--color-text-secondary);
        }
        
        .percent {
          font-weight: 600;
          color: var(--color-text-primary);
        }
      }
    }
  }
  
  .traffic-source {
    .source-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid var(--color-border);
      
      &:last-child {
        border-bottom: none;
      }
      
      .source-icon {
        width: 36px;
        height: 36px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
      }
      
      .source-info {
        flex: 1;
        
        .name {
          display: block;
          font-weight: 500;
        }
        
        .count {
          font-size: 12px;
          color: var(--color-text-tertiary);
        }
      }
      
      .percent {
        font-weight: 600;
        color: var(--color-text-primary);
      }
    }
  }
}

@media (max-width: 1200px) {
  .blog-analytics-page .stat-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
