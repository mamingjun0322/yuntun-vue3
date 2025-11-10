<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :lg="6">
        <div class="stat-card stat-card-primary">
          <div class="stat-icon">
            <el-icon :size="40"><ShoppingCart /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-label">今日订单</div>
            <div class="stat-value">{{ statistics.todayOrderCount || 0 }}</div>
            <div class="stat-trend">
              <el-icon><Top /></el-icon>
              <span>较昨日</span>
            </div>
          </div>
        </div>
      </el-col>
      
      <el-col :xs="24" :sm="12" :lg="6">
        <div class="stat-card stat-card-success">
          <div class="stat-icon">
            <el-icon :size="40"><Money /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-label">今日营业额</div>
            <div class="stat-value">{{ formatMoney(statistics.todayRevenue || '0') }}</div>
            <div class="stat-trend">
              <el-icon><Top /></el-icon>
              <span>较昨日</span>
            </div>
          </div>
        </div>
      </el-col>
      
      <el-col :xs="24" :sm="12" :lg="6">
        <div class="stat-card stat-card-warning">
          <div class="stat-icon">
            <el-icon :size="40"><Clock /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-label">待处理订单</div>
            <div class="stat-value">{{ statistics.pendingOrderCount || 0 }}</div>
            <div class="stat-trend">
              <el-icon><Bottom /></el-icon>
              <span>需及时处理</span>
            </div>
          </div>
        </div>
      </el-col>
      
      <el-col :xs="24" :sm="12" :lg="6">
        <div class="stat-card stat-card-info">
          <div class="stat-icon">
            <el-icon :size="40"><TrendCharts /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-label">总营业额</div>
            <div class="stat-value">{{ formatMoney(statistics.totalRevenue || '0') }}</div>
            <div class="stat-trend">
              <el-icon><Top /></el-icon>
              <span>累计收入</span>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :xs="24" :lg="16">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">订单趋势</span>
              <el-radio-group v-model="trendType" size="small">
                <el-radio-button value="week">近7天</el-radio-button>
                <el-radio-button value="month">近30天</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <v-chart :option="orderTrendOption" :style="{ height: '350px' }" />
        </el-card>
      </el-col>
      
      <el-col :xs="24" :lg="8">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <span class="card-title">订单类型分布</span>
          </template>
          <v-chart :option="orderTypeOption" :style="{ height: '350px' }" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近订单 -->
    <el-card class="recent-orders" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">最近订单</span>
          <el-button type="primary" link @click="$router.push('/order')">
            查看全部 <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
      </template>
      
      <el-table :data="statistics.recentOrders" stripe>
        <el-table-column prop="orderNo" label="订单号" min-width="150" />
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
        <el-table-column prop="totalAmount" label="订单金额" width="120">
          <template #default="{ row }">
            {{ formatMoney(row.totalAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="下单时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewOrder(row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getOrderStatistics, type OrderStatistics } from '@/api/order'
import { formatMoney, formatDateTime, getOrderStatusText, getOrderTypeText } from '@/utils/format'

const router = useRouter()

const trendType = ref('week')
const loading = ref(false)
const statistics = reactive<OrderStatistics>({
  todayOrderCount: 0,
  todayRevenue: '0',
  pendingOrderCount: 0,
  totalOrderCount: 0,
  totalRevenue: '0',
  recentOrders: [],
  orderTrend: [],
  categoryDistribution: []
})

// 订单趋势图表配置
const orderTrendOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: statistics.orderTrend.map(item => item.date) || [],
    axisTick: {
      alignWithLabel: true
    }
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '订单数量',
      type: 'bar',
      barWidth: '60%',
      data: statistics.orderTrend.map(item => item.count) || [],
      itemStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: '#667eea' },
            { offset: 1, color: '#764ba2' }
          ]
        }
      }
    }
  ]
}))

// 订单类型分布图表配置
const orderTypeOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: 'left'
  },
  series: [
    {
      name: '订单类型',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: true,
        formatter: '{b}: {d}%'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      data: statistics.categoryDistribution.map((item, index) => ({
        value: item.value,
        name: item.name,
        itemStyle: { color: index === 0 ? '#67C23A' : '#409EFF' }
      })) || []
    }
  ]
}))

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

const viewOrder = (order: any) => {
  ElMessage.info(`查看订单：${order.orderNo}`)
  router.push('/order')
}

const loadStatistics = async () => {
  loading.value = true
  try {
    const res = await getOrderStatistics()
    Object.assign(statistics, res.data)
  } catch (error) {
    ElMessage.error('加载统计数据失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadStatistics()
})
</script>

<style scoped lang="scss">
.dashboard {
  .stats-row {
    margin-bottom: 20px;
  }

  .stat-card {
    background: #fff;
    border-radius: 12px;
    padding: 24px;
    display: flex;
    align-items: center;
    gap: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    transition: all 0.3s;
    margin-bottom: 20px;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
    }

    .stat-icon {
      width: 70px;
      height: 70px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }

    &.stat-card-primary .stat-icon {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    &.stat-card-success .stat-icon {
      background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
    }

    &.stat-card-warning .stat-icon {
      background: linear-gradient(135deg, #e6a23c 0%, #f56c6c 100%);
    }

    &.stat-card-info .stat-icon {
      background: linear-gradient(135deg, #409eff 0%, #79bbff 100%);
    }

    .stat-content {
      flex: 1;

      .stat-label {
        font-size: 14px;
        color: #909399;
        margin-bottom: 8px;
      }

      .stat-value {
        font-size: 28px;
        font-weight: 700;
        color: #303133;
        margin-bottom: 4px;
      }

      .stat-trend {
        font-size: 12px;
        color: #67c23a;
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }

  .charts-row {
    margin-bottom: 20px;
  }

  .chart-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .card-title {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
    }
  }

  .recent-orders {
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .card-title {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
    }
  }
}
</style>
