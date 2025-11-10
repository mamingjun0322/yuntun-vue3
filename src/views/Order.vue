<template>
  <div class="order-page">
    <el-card shadow="hover">
      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="订单类型">
          <el-select
            v-model="searchForm.type"
            placeholder="请选择类型"
            clearable
            style="width: 120px"
          >
            <el-option label="堂食" :value="1" />
            <el-option label="外卖" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="待支付" :value="1" />
            <el-option label="制作中" :value="2" />
            <el-option label="配送中" :value="3" />
            <el-option label="已完成" :value="4" />
            <el-option label="已取消" :value="5" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="订单号/手机号"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 订单列表 -->
      <el-table
        v-loading="loading"
        :data="orderList"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="orderNo" label="订单号" min-width="160" fixed="left" />
        <el-table-column label="订单类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 1 ? 'success' : 'primary'">
              {{ getOrderTypeText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="订单状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getOrderStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="tableNo" label="桌号" width="80">
          <template #default="{ row }">
            {{ row.tableNo || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="商品信息" min-width="200">
          <template #default="{ row }">
            <div v-for="(item, index) in row.goodsList" :key="index" class="goods-item">
              <span>{{ item.name }}</span>
              <span class="quantity">x{{ item.quantity }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="订单金额" width="120">
          <template #default="{ row }">
            <span class="price">{{ formatMoney(row.totalAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="receiverName" label="收货人" width="100">
          <template #default="{ row }">
            {{ row.receiverName || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="receiverPhone" label="联系电话" width="120">
          <template #default="{ row }">
            {{ row.receiverPhone || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="下单时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 1"
              type="success"
              link
              @click="handleUpdateStatus(row, 2)"
            >
              确认订单
            </el-button>
            <el-button
              v-if="row.status === 2"
              type="primary"
              link
              @click="handleUpdateStatus(row, row.type === 1 ? 4 : 3)"
            >
              {{ row.type === 1 ? '完成订单' : '开始配送' }}
            </el-button>
            <el-button
              v-if="row.status === 3"
              type="success"
              link
              @click="handleUpdateStatus(row, 4)"
            >
              完成配送
            </el-button>
            <el-button type="primary" link :icon="View" @click="handleView(row)">
              查看
            </el-button>
            <el-button
              v-if="row.status < 4"
              type="danger"
              link
              @click="handleUpdateStatus(row, 5)"
            >
              取消
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="searchForm.page"
          v-model:page-size="searchForm.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadOrderList"
          @current-change="loadOrderList"
        />
      </div>
    </el-card>

    <!-- 订单详情对话框 -->
    <el-dialog v-model="detailVisible" title="订单详情" width="700px">
      <el-descriptions :column="2" border v-if="currentOrder">
        <el-descriptions-item label="订单号">{{ currentOrder.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="订单类型">
          <el-tag :type="currentOrder.type === 1 ? 'success' : 'primary'">
            {{ getOrderTypeText(currentOrder.type) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="订单状态">
          <el-tag :type="getStatusType(currentOrder.status)">
            {{ getOrderStatusText(currentOrder.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="下单时间">
          {{ formatDateTime(currentOrder.createTime) }}
        </el-descriptions-item>
        <el-descriptions-item v-if="currentOrder.tableNo" label="桌号">
          {{ currentOrder.tableNo }}
        </el-descriptions-item>
        <el-descriptions-item v-if="currentOrder.receiverName" label="收货人">
          {{ currentOrder.receiverName }}
        </el-descriptions-item>
        <el-descriptions-item v-if="currentOrder.receiverPhone" label="联系电话" :span="2">
          {{ currentOrder.receiverPhone }}
        </el-descriptions-item>
        <el-descriptions-item v-if="currentOrder.address" label="收货地址" :span="2">
          {{ currentOrder.address }}
        </el-descriptions-item>
        <el-descriptions-item label="商品总额">
          {{ formatMoney(currentOrder.goodsAmount) }}
        </el-descriptions-item>
        <el-descriptions-item v-if="currentOrder.deliveryFee" label="配送费">
          {{ formatMoney(currentOrder.deliveryFee) }}
        </el-descriptions-item>
        <el-descriptions-item label="订单总额" :span="2">
          <span class="price">{{ formatMoney(currentOrder.totalAmount) }}</span>
        </el-descriptions-item>
        <el-descriptions-item v-if="currentOrder.remark" label="备注" :span="2">
          {{ currentOrder.remark }}
        </el-descriptions-item>
      </el-descriptions>

      <el-divider>商品明细</el-divider>
      <el-table :data="currentOrder?.goodsList" border>
        <el-table-column prop="name" label="商品名称" />
        <el-table-column prop="price" label="单价" width="100">
          <template #default="{ row }">
            {{ formatMoney(row.price) }}
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" width="80" />
        <el-table-column label="小计" width="120">
          <template #default="{ row }">
            {{ formatMoney((parseFloat(row.price) * row.quantity).toFixed(2)) }}
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, View } from '@element-plus/icons-vue'
import {
  getOrderList as apiGetOrderList,
  updateOrderStatus,
  type Order
} from '@/api/order'
import { formatMoney, formatDateTime, getOrderStatusText, getOrderTypeText } from '@/utils/format'

const loading = ref(false)
const detailVisible = ref(false)

const searchForm = reactive({
  type: undefined as number | undefined,
  status: undefined as number | undefined,
  keyword: '',
  page: 1,
  pageSize: 10
})

const orderList = ref<Order[]>([])
const total = ref(0)
const currentOrder = ref<Order | null>(null)

const getStatusType = (status: number) => {
  const typeMap: Record<number, string> = {
    1: 'warning',
    2: 'primary',
    3: 'info',
    4: 'success',
    5: 'danger'
  }
  return typeMap[status] || 'info'
}

const loadOrderList = async () => {
  loading.value = true
  try {
    const res = await apiGetOrderList(searchForm)
    orderList.value = res.data.records
    total.value = res.data.total
  } catch (error) {
    ElMessage.error('加载订单列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  searchForm.page = 1
  loadOrderList()
}

const handleReset = () => {
  searchForm.type = undefined
  searchForm.status = undefined
  searchForm.keyword = ''
  searchForm.page = 1
  loadOrderList()
}

const handleView = (row: Order) => {
  currentOrder.value = row
  detailVisible.value = true
}

const handleUpdateStatus = (row: Order, status: number) => {
  const statusText = getOrderStatusText(status)
  const confirmText = status === 5 ? '确定要取消该订单吗？' : `确定要将订单状态更新为"${statusText}"吗？`
  
  ElMessageBox.confirm(confirmText, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await updateOrderStatus(row.id, status)
      ElMessage.success('操作成功')
      loadOrderList()
    } catch (error) {
      ElMessage.error('操作失败')
    }
  })
}

onMounted(() => {
  loadOrderList()
})
</script>

<style scoped lang="scss">
.order-page {
  .search-form {
    margin-bottom: 16px;
  }

  .goods-item {
    display: flex;
    justify-content: space-between;
    padding: 4px 0;
    font-size: 13px;

    .quantity {
      color: #909399;
    }

    & + .goods-item {
      border-top: 1px dashed #eee;
    }
  }

  .price {
    color: #f56c6c;
    font-weight: 600;
    font-size: 16px;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
