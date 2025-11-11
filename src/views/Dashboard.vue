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
import { ref, reactive, onMounted, computed, watch } from 'vue'
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
      type: 'cross',
      label: {
        backgroundColor: '#6a7985'
      }
    },
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: '#ddd',
    borderWidth: 1,
    textStyle: {
      color: '#333'
    },
    formatter: function(params: any) {
      let result = `<div style="padding: 8px;">`
      result += `<div style="font-weight: 600; margin-bottom: 8px; color: #303133;">${params[0].axisValue}</div>`
      params.forEach((item: any) => {
        const value = item.seriesName === '营业额' ? `¥${parseFloat(item.value).toFixed(2)}` : item.value
        result += `
          <div style="display: flex; align-items: center; margin-bottom: 4px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${item.color}; margin-right: 8px;"></span>
            <span style="color: #606266;">${item.seriesName}:</span>
            <span style="margin-left: 8px; font-weight: 600; color: #303133;">${value}</span>
          </div>
        `
      })
      result += `</div>`
      return result
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    top: '10%',
    containLabel: true
  },
  legend: {
    data: ['订单数量', '营业额'],
    top: '0%',
    textStyle: {
      color: '#606266'
    }
  },
  xAxis: {
    type: 'category',
    data: statistics.orderTrend.map(item => item.date) || [],
    boundaryGap: false,
    axisLine: {
      lineStyle: {
        color: '#dcdfe6'
      }
    },
    axisLabel: {
      color: '#606266',
      rotate: 30,
      formatter: function(value: string) {
        // 直接显示日期，后端已经根据天数返回了合适的格式
        return value
      }
    }
  },
  yAxis: [
    {
      type: 'value',
      name: '订单数量',
      position: 'left',
      axisLine: {
        lineStyle: {
          color: '#667eea'
        }
      },
      axisLabel: {
        color: '#606266',
        formatter: '{value}'
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0',
          type: 'dashed'
        }
      }
    },
    {
      type: 'value',
      name: '营业额(元)',
      position: 'right',
      axisLine: {
        lineStyle: {
          color: '#67c23a'
        }
      },
      axisLabel: {
        color: '#606266',
        formatter: '¥{value}'
      },
      splitLine: {
        show: false
      }
    }
  ],
  series: [
    {
      name: '订单数量',
      type: 'line',
      yAxisIndex: 0,
      data: statistics.orderTrend.map(item => item.count) || [],
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: {
        width: 3,
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 1,
          y2: 0,
          colorStops: [
            { offset: 0, color: '#667eea' },
            { offset: 1, color: '#764ba2' }
          ]
        }
      },
      itemStyle: {
        color: '#667eea',
        borderWidth: 2,
        borderColor: '#fff'
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
            { offset: 1, color: 'rgba(102, 126, 234, 0.05)' }
          ]
        }
      },
      emphasis: {
        itemStyle: {
          color: '#667eea',
          borderColor: '#667eea',
          borderWidth: 2,
          shadowBlur: 10,
          shadowColor: 'rgba(102, 126, 234, 0.5)'
        }
      }
    },
    {
      name: '营业额',
      type: 'line',
      yAxisIndex: 1,
      data: statistics.orderTrend.map(item => parseFloat(item.amount || '0')) || [],
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: {
        width: 3,
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 1,
          y2: 0,
          colorStops: [
            { offset: 0, color: '#67c23a' },
            { offset: 1, color: '#85ce61' }
          ]
        }
      },
      itemStyle: {
        color: '#67c23a',
        borderWidth: 2,
        borderColor: '#fff'
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
            { offset: 1, color: 'rgba(103, 194, 58, 0.05)' }
          ]
        }
      },
      emphasis: {
        itemStyle: {
          color: '#67c23a',
          borderColor: '#67c23a',
          borderWidth: 2,
          shadowBlur: 10,
          shadowColor: 'rgba(103, 194, 58, 0.5)'
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
    const days = trendType.value === 'week' ? 7 : 30
    const res = await getOrderStatistics(days)
    Object.assign(statistics, res.data)
  } catch (error) {
    ElMessage.error('加载统计数据失败')
  } finally {
    loading.value = false
  }
}

// 监听趋势类型变化
watch(trendType, () => {
  loadStatistics()
})

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
