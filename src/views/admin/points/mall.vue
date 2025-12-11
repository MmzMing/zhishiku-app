<template>
  <div class="points-mall-page">
    <!-- 顶部Tab -->
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="商品管理" name="products" />
      <el-tab-pane label="兑换管理" name="exchange" />
      <el-tab-pane label="库存管理" name="stock" />
      <el-tab-pane label="订单处理" name="orders" />
    </el-tabs>
    
    <!-- 商品管理 -->
    <div v-if="activeTab === 'products'">
      <div class="action-bar">
        <el-input v-model="productSearch" placeholder="搜索商品" style="width: 200px" clearable>
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-select v-model="productType" placeholder="商品类型" style="width: 120px" clearable>
          <el-option label="全部" value="" />
          <el-option label="虚拟商品" value="virtual" />
          <el-option label="实物商品" value="physical" />
        </el-select>
        <el-button type="primary" :icon="Plus" @click="showProductDialog()">添加商品</el-button>
      </div>
      
      <div class="products-grid">
        <el-card class="product-card" v-for="product in products" :key="product.id" shadow="hover">
          <div class="product-image">
            <el-image :src="product.image" fit="cover" style="height: 160px; width: 100%" />
            <el-tag class="product-type" :type="product.type === 'virtual' ? 'success' : ''">
              {{ product.type === 'virtual' ? '虚拟' : '实物' }}
            </el-tag>
          </div>
          <div class="product-info">
            <h4>{{ product.name }}</h4>
            <p class="product-desc">{{ product.description }}</p>
            <div class="product-meta">
              <span class="price"><el-icon><Coin /></el-icon>{{ product.points }}</span>
              <span class="stock" :class="{ 'low-stock': product.stock < 10 }">
                库存: {{ product.stock === -1 ? '无限' : product.stock }}
              </span>
            </div>
            <div class="product-stats">
              <span>已兑换: {{ product.exchangeCount }}</span>
              <span>浏览: {{ product.viewCount }}</span>
            </div>
            <div class="product-actions">
              <el-button size="small" @click="showProductDialog(product)">编辑</el-button>
              <el-button size="small" :type="product.status === 'online' ? 'warning' : 'success'">
                {{ product.status === 'online' ? '下架' : '上架' }}
              </el-button>
              <el-button size="small" type="danger">删除</el-button>
            </div>
          </div>
        </el-card>
      </div>
    </div>
    
    <!-- 兑换管理 -->
    <div v-if="activeTab === 'exchange'">
      <div class="stats-cards">
        <el-card class="stat-card">
          <div class="stat-value">{{ exchangeStats.todayCount }}</div>
          <div class="stat-label">今日兑换</div>
        </el-card>
        <el-card class="stat-card">
          <div class="stat-value">{{ exchangeStats.todayPoints.toLocaleString() }}</div>
          <div class="stat-label">消耗积分</div>
        </el-card>
        <el-card class="stat-card">
          <div class="stat-value">{{ exchangeStats.pendingCount }}</div>
          <div class="stat-label">待处理</div>
        </el-card>
        <el-card class="stat-card">
          <div class="stat-value">{{ exchangeStats.weekCount }}</div>
          <div class="stat-label">本周兑换</div>
        </el-card>
      </div>
      
      <el-card style="margin-top: 16px">
        <div class="filter-bar">
          <el-input v-model="exchangeSearch" placeholder="搜索用户/订单号" style="width: 200px" clearable />
          <el-select v-model="exchangeStatus" placeholder="状态" style="width: 120px" clearable>
            <el-option label="全部" value="" />
            <el-option label="待审核" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
            <el-option label="已发放" value="delivered" />
          </el-select>
          <el-date-picker v-model="exchangeDateRange" type="daterange" style="width: 240px" />
        </div>
        
        <el-table :data="exchangeRecords" stripe style="margin-top: 16px">
          <el-table-column prop="id" label="订单号" width="160" />
          <el-table-column label="用户" width="140">
            <template #default="{ row }">
              <div class="user-cell">
                <el-avatar :size="28" :src="row.avatar" />
                <span>{{ row.username }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="productName" label="商品" min-width="150" />
          <el-table-column label="积分" width="100">
            <template #default="{ row }">
              <span class="points-cost">-{{ row.points }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="80" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusText(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="兑换时间" width="160" />
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
                <div class="action-buttons">
                  <template v-if="row.status === 'pending'">
                    <el-button size="small" type="success" link @click="approveExchange(row)" class="action-btn">通过</el-button>
                    <el-button size="small" type="danger" link @click="rejectExchange(row)" class="action-btn">拒绝</el-button>
                  </template>
                  <template v-else-if="row.status === 'approved'">
                    <el-button size="small" type="primary" link @click="deliverExchange(row)" class="action-btn">发放</el-button>
                  </template>
                  <el-button size="small" link @click="viewExchangeDetail(row)" class="action-btn">详情</el-button>
                </div>
              </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
    
    <!-- 库存管理 -->
    <div v-if="activeTab === 'stock'">
      <el-row :gutter="16">
        <el-col :span="16">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>库存列表</span>
                <el-button type="primary" size="small" @click="showStockDialog">批量调整</el-button>
              </div>
            </template>
            
            <el-table :data="stockList" stripe>
              <el-table-column prop="productName" label="商品" min-width="200" />
              <el-table-column label="类型" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.type === 'virtual' ? 'success' : ''" size="small">
                    {{ row.type === 'virtual' ? '虚拟' : '实物' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="stock" label="当前库存" width="120">
                <template #default="{ row }">
                  <span :class="{ 'low-stock': row.stock < 10 && row.stock !== -1 }">
                    {{ row.stock === -1 ? '无限' : row.stock }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="reserved" label="预留" width="80" />
              <el-table-column prop="available" label="可用" width="80">
                <template #default="{ row }">
                  {{ row.stock === -1 ? '无限' : row.stock - row.reserved }}
                </template>
              </el-table-column>
              <el-table-column prop="alertThreshold" label="预警阈值" width="100" />
              <el-table-column label="状态" width="100">
                <template #default="{ row }">
                  <el-tag v-if="row.stock !== -1 && row.stock <= row.alertThreshold" type="danger" size="small">库存不足</el-tag>
                  <el-tag v-else type="success" size="small">正常</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120">
                <template #default="{ row }">
                  <div class="action-buttons">
                    <el-button size="small" type="primary" link @click="adjustStock(row)" class="action-btn">调整</el-button>
                    <el-button size="small" link @click="viewStockHistory(row)" class="action-btn">记录</el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card>
            <template #header><span>库存预警</span></template>
            <div class="alert-list">
              <div class="alert-item" v-for="item in stockAlerts" :key="item.id">
                <el-image :src="item.image" style="width: 48px; height: 48px; border-radius: 4px" fit="cover" />
                <div class="alert-info">
                  <span class="alert-name">{{ item.name }}</span>
                  <span class="alert-stock">剩余: {{ item.stock }} 件</span>
                </div>
                <el-button size="small" type="primary">补货</el-button>
              </div>
            </div>
          </el-card>
          
          <el-card style="margin-top: 16px">
            <template #header><span>库存变动记录</span></template>
            <el-timeline>
              <el-timeline-item v-for="log in stockLogs" :key="log.id" :timestamp="log.time" placement="top">
                <p>{{ log.productName }}</p>
                <p class="log-detail">
                  {{ log.action }} 
                  <span :class="log.change > 0 ? 'positive' : 'negative'">
                    {{ log.change > 0 ? '+' : '' }}{{ log.change }}
                  </span>
                </p>
              </el-timeline-item>
            </el-timeline>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 订单处理 -->
    <div v-if="activeTab === 'orders'">
      <div class="order-stats">
        <el-statistic title="待处理" :value="orderStats.pending" />
        <el-statistic title="处理中" :value="orderStats.processing" />
        <el-statistic title="待发货" :value="orderStats.toShip" />
        <el-statistic title="已完成" :value="orderStats.completed" />
      </div>
      
      <el-card style="margin-top: 16px">
        <div class="filter-bar">
          <el-input v-model="orderSearch" placeholder="搜索订单号/用户" style="width: 200px" clearable />
          <el-select v-model="orderStatus" placeholder="订单状态" style="width: 120px" clearable>
            <el-option label="全部" value="" />
            <el-option label="待处理" value="pending" />
            <el-option label="处理中" value="processing" />
            <el-option label="待发货" value="toShip" />
            <el-option label="已发货" value="shipped" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
          <el-select v-model="orderType" placeholder="商品类型" style="width: 120px" clearable>
            <el-option label="全部" value="" />
            <el-option label="虚拟商品" value="virtual" />
            <el-option label="实物商品" value="physical" />
          </el-select>
        </div>
        
        <el-table :data="orders" stripe style="margin-top: 16px">
          <el-table-column type="selection" width="50" />
          <el-table-column prop="id" label="订单号" width="160" />
          <el-table-column label="用户" width="140">
            <template #default="{ row }">
              <div class="user-cell">
                <el-avatar :size="28" :src="row.avatar" />
                <span>{{ row.username }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="productName" label="商品" min-width="150" />
          <el-table-column label="类型" width="80">
            <template #default="{ row }">
              <el-tag :type="row.productType === 'virtual' ? 'success' : ''" size="small">
                {{ row.productType === 'virtual' ? '虚拟' : '实物' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="70" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getOrderStatusType(row.status)" size="small">{{ getOrderStatusText(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="下单时间" width="160" />
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
                <div class="action-buttons">
                  <template v-if="row.status === 'pending'">
                    <el-button size="small" type="primary" link @click="processOrder(row)" class="action-btn">处理</el-button>
                  </template>
                  <template v-else-if="row.status === 'toShip'">
                    <el-button size="small" type="primary" link @click="shipOrder(row)" class="action-btn">发货</el-button>
                  </template>
                  <el-button size="small" link @click="viewOrderDetail(row)" class="action-btn">详情</el-button>
                  <el-button v-if="row.status === 'pending'" size="small" type="danger" link class="action-btn">取消</el-button>
                </div>
              </template>
          </el-table-column>
        </el-table>
        
        <div class="batch-actions" v-if="selectedOrders.length > 0">
          <el-button type="primary" size="small">批量处理</el-button>
          <el-button type="success" size="small">批量发货</el-button>
        </div>
      </el-card>
    </div>
    
    <!-- 商品编辑弹窗 -->
    <el-dialog v-model="productDialogVisible" :title="productDialogTitle" width="600px">
      <el-form :model="productForm" label-width="100px">
        <el-form-item label="商品名称">
          <el-input v-model="productForm.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="商品类型">
          <el-radio-group v-model="productForm.type">
            <el-radio value="virtual">虚拟商品</el-radio>
            <el-radio value="physical">实物商品</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="商品图片">
          <el-upload action="#" :auto-upload="false" list-type="picture-card" :limit="1">
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="兑换积分">
          <el-input-number v-model="productForm.points" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="库存数量">
          <el-input-number v-model="productForm.stock" :min="-1" style="width: 200px" />
          <span style="margin-left: 8px; color: var(--color-text-tertiary)">-1 表示无限</span>
        </el-form-item>
        <el-form-item label="限兑数量">
          <el-input-number v-model="productForm.limitPerUser" :min="0" style="width: 200px" />
          <span style="margin-left: 8px; color: var(--color-text-tertiary)">0 表示不限制</span>
        </el-form-item>
        <el-form-item label="商品描述">
          <el-input v-model="productForm.description" type="textarea" :rows="3" placeholder="请输入商品描述" />
        </el-form-item>
        <el-form-item label="兑换须知" v-if="productForm.type === 'physical'">
          <el-input v-model="productForm.notice" type="textarea" :rows="2" placeholder="填写邮寄信息等须知" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="productDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveProduct">保存</el-button>
      </template>
    </el-dialog>
    
    <!-- 库存调整弹窗 -->
    <el-dialog v-model="stockDialogVisible" title="库存调整" width="400px">
      <el-form label-width="100px">
        <el-form-item label="商品">
          <span>{{ currentStock?.productName }}</span>
        </el-form-item>
        <el-form-item label="当前库存">
          <span>{{ currentStock?.stock === -1 ? '无限' : currentStock?.stock }}</span>
        </el-form-item>
        <el-form-item label="调整类型">
          <el-radio-group v-model="stockAdjust.type">
            <el-radio value="add">入库</el-radio>
            <el-radio value="reduce">出库</el-radio>
            <el-radio value="set">设置</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="调整数量">
          <el-input-number v-model="stockAdjust.amount" :min="stockAdjust.type === 'set' ? -1 : 1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="调整原因">
          <el-input v-model="stockAdjust.reason" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="stockDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmStockAdjust">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Plus, Search, Coin } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const activeTab = ref('products')

// 商品管理
const productSearch = ref('')
const productType = ref('')
const products = ref([
  { id: 1, name: 'VIP月卡', description: '尊享VIP会员权益一个月', image: 'https://picsum.photos/200/200?random=1', type: 'virtual', points: 500, stock: -1, status: 'online', exchangeCount: 256, viewCount: 1520 },
  { id: 2, name: '课程优惠券', description: '满100减20优惠券', image: 'https://picsum.photos/200/200?random=2', type: 'virtual', points: 100, stock: 200, status: 'online', exchangeCount: 89, viewCount: 680 },
  { id: 3, name: '定制T恤', description: '限量版定制T恤', image: 'https://picsum.photos/200/200?random=3', type: 'physical', points: 2000, stock: 50, status: 'online', exchangeCount: 15, viewCount: 320 },
  { id: 4, name: '技术书籍', description: '精选技术类书籍', image: 'https://picsum.photos/200/200?random=4', type: 'physical', points: 1500, stock: 8, status: 'online', exchangeCount: 42, viewCount: 450 },
])

// 兑换管理
const exchangeSearch = ref('')
const exchangeStatus = ref('')
const exchangeDateRange = ref<[Date, Date] | null>(null)
const exchangeStats = reactive({ todayCount: 28, todayPoints: 15600, pendingCount: 5, weekCount: 186 })
const exchangeRecords = ref([
  { id: 'E202401150001', username: '张三', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', productName: 'VIP月卡', points: 500, quantity: 1, status: 'delivered', createTime: '2024-01-15 10:30:00' },
  { id: 'E202401150002', username: '李四', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2', productName: '定制T恤', points: 2000, quantity: 1, status: 'pending', createTime: '2024-01-15 11:00:00' },
  { id: 'E202401150003', username: '王五', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3', productName: '课程优惠券', points: 100, quantity: 2, status: 'approved', createTime: '2024-01-15 11:30:00' },
])

// 库存管理
const stockList = ref([
  { id: 1, productName: 'VIP月卡', type: 'virtual', stock: -1, reserved: 0, alertThreshold: 0 },
  { id: 2, productName: '课程优惠券', type: 'virtual', stock: 200, reserved: 5, alertThreshold: 20 },
  { id: 3, productName: '定制T恤', type: 'physical', stock: 50, reserved: 3, alertThreshold: 10 },
  { id: 4, productName: '技术书籍', type: 'physical', stock: 8, reserved: 1, alertThreshold: 10 },
])
const stockAlerts = ref([
  { id: 4, name: '技术书籍', image: 'https://picsum.photos/200/200?random=4', stock: 8 },
])
const stockLogs = ref([
  { id: 1, productName: '定制T恤', action: '用户兑换', change: -1, time: '2024-01-15 14:30' },
  { id: 2, productName: '技术书籍', action: '管理员入库', change: 10, time: '2024-01-15 10:00' },
  { id: 3, productName: '课程优惠券', action: '用户兑换', change: -2, time: '2024-01-14 16:20' },
])

// 订单处理
const orderSearch = ref('')
const orderStatus = ref('')
const orderType = ref('')
const selectedOrders = ref<string[]>([])
const orderStats = reactive({ pending: 5, processing: 3, toShip: 8, completed: 256 })
const orders = ref([
  { id: 'O202401150001', username: '张三', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', productName: 'VIP月卡', productType: 'virtual', quantity: 1, status: 'completed', createTime: '2024-01-15 10:30:00' },
  { id: 'O202401150002', username: '李四', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2', productName: '定制T恤', productType: 'physical', quantity: 1, status: 'toShip', createTime: '2024-01-15 11:00:00' },
  { id: 'O202401150003', username: '王五', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3', productName: '技术书籍', productType: 'physical', quantity: 1, status: 'pending', createTime: '2024-01-15 11:30:00' },
])

// 弹窗
const productDialogVisible = ref(false)
const productDialogTitle = ref('添加商品')
const productForm = reactive({
  id: '',
  name: '',
  type: 'virtual',
  points: 100,
  stock: -1,
  limitPerUser: 0,
  description: '',
  notice: ''
})

const stockDialogVisible = ref(false)
const currentStock = ref<typeof stockList.value[0] | null>(null)
const stockAdjust = reactive({ type: 'add', amount: 1, reason: '' })

function handleTabChange() {}

function showProductDialog(product?: typeof products.value[0]) {
  if (product) {
    productDialogTitle.value = '编辑商品'
    Object.assign(productForm, product)
  } else {
    productDialogTitle.value = '添加商品'
    Object.assign(productForm, { id: '', name: '', type: 'virtual', points: 100, stock: -1, limitPerUser: 0, description: '', notice: '' })
  }
  productDialogVisible.value = true
}

function saveProduct() {
  ElMessage.success('商品保存成功')
  productDialogVisible.value = false
}

function getStatusType(status: string) {
  const map: Record<string, string> = { pending: 'warning', approved: 'primary', rejected: 'danger', delivered: 'success' }
  return map[status] || 'info'
}

function getStatusText(status: string) {
  const map: Record<string, string> = { pending: '待审核', approved: '已通过', rejected: '已拒绝', delivered: '已发放' }
  return map[status] || status
}

function approveExchange(row: any) {
  ElMessage.success('已通过审核')
}

function rejectExchange(row: any) {
  ElMessageBox.prompt('请输入拒绝原因', '拒绝兑换', { type: 'warning' })
    .then(() => ElMessage.warning('已拒绝'))
    .catch(() => {})
}

function deliverExchange(row: any) {
  ElMessage.success('已发放')
}

function viewExchangeDetail(row: any) {
  ElMessage.info('查看详情')
}

function showStockDialog() {
  stockDialogVisible.value = true
}

function adjustStock(row: typeof stockList.value[0]) {
  currentStock.value = row
  Object.assign(stockAdjust, { type: 'add', amount: 1, reason: '' })
  stockDialogVisible.value = true
}

function viewStockHistory(row: any) {
  ElMessage.info('查看库存记录')
}

function confirmStockAdjust() {
  ElMessage.success('库存调整成功')
  stockDialogVisible.value = false
}

function getOrderStatusType(status: string) {
  const map: Record<string, string> = { pending: 'warning', processing: 'primary', toShip: '', shipped: 'success', completed: 'success', cancelled: 'info' }
  return map[status] || 'info'
}

function getOrderStatusText(status: string) {
  const map: Record<string, string> = { pending: '待处理', processing: '处理中', toShip: '待发货', shipped: '已发货', completed: '已完成', cancelled: '已取消' }
  return map[status] || status
}

function processOrder(row: any) {
  ElMessage.success('订单处理中')
}

function shipOrder(row: any) {
  ElMessageBox.prompt('请输入物流单号', '发货', { inputPlaceholder: '物流单号' })
    .then(() => ElMessage.success('已发货'))
    .catch(() => {})
}

function viewOrderDetail(row: any) {
  ElMessage.info('查看订单详情')
}
</script>

<style scoped lang="scss">
.points-mall-page {
  .action-bar, .filter-bar {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }
  
  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
    
    .product-card {
      .product-image {
        position: relative;
        margin: -20px -20px 12px -20px;
        
        .product-type {
          position: absolute;
          top: 8px;
          right: 8px;
        }
      }
      
      .product-info {
        h4 { margin: 0 0 8px 0; font-size: 16px; }
        .product-desc { font-size: 13px; color: var(--color-text-tertiary); margin-bottom: 12px; height: 36px; overflow: hidden; }
        .product-meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          .price { color: #f56c6c; font-weight: 600; display: flex; align-items: center; gap: 4px; }
          .stock { font-size: 12px; color: var(--color-text-tertiary); &.low-stock { color: #e6a23c; } }
        }
        .product-stats {
          font-size: 12px;
          color: var(--color-text-tertiary);
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
        }
        .product-actions { display: flex; gap: 8px; }
      }
    }
  }
  
  .stats-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    
    .stat-card {
      text-align: center;
      padding: 16px;
      .stat-value { font-size: 28px; font-weight: 600; color: var(--color-text-primary); }
      .stat-label { font-size: 13px; color: var(--color-text-tertiary); margin-top: 4px; }
    }
  }
  
  .user-cell {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .points-cost {
    color: #f56c6c;
    font-weight: 600;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .low-stock { color: #e6a23c; font-weight: 600; }
  
  .alert-list {
    .alert-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 0;
      border-bottom: 1px solid var(--color-border);
      &:last-child { border-bottom: none; }
      
      .alert-info {
        flex: 1;
        .alert-name { display: block; font-weight: 500; }
        .alert-stock { font-size: 12px; color: #f56c6c; }
      }
    }
  }
  
  .log-detail {
    font-size: 12px;
    color: var(--color-text-tertiary);
    .positive { color: #67c23a; }
    .negative { color: #f56c6c; }
  }
  
  .order-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }
  
  .batch-actions {
    margin-top: 16px;
    display: flex;
    gap: 8px;
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
    min-width: 60px;
    text-align: left;
    display: block;
    line-height: 1.5;
    height: auto;
  }
}
</style>
