import request from './request'
import type { PageResult } from './goods'

export interface Order {
  id: number
  orderNo: string
  userId: number
  type: number // 1-堂食 2-外卖
  status: number
  tableNo?: string
  peopleCount?: number
  receiverName?: string
  receiverPhone?: string
  address?: string
  goodsList: OrderGoods[]
  goodsAmount: string
  deliveryFee?: string
  packingFee?: string
  couponDiscount?: string
  totalAmount: string
  remark?: string
  createTime: string
  updateTime?: string
}

export interface OrderGoods {
  id: number
  name: string
  image: string
  price: string
  quantity: number
  specs?: any[]
}

export interface OrderListParams {
  type?: number
  status?: number
  keyword?: string
  page?: number
  pageSize?: number
}

export interface OrderStatistics {
  todayOrderCount: number
  todayRevenue: string
  pendingOrderCount: number
  totalOrderCount: number
  totalRevenue: string
  recentOrders: Order[]
  orderTrend: {
    date: string
    count: number
    amount: string
  }[]
  categoryDistribution: {
    name: string
    value: number
  }[]
}

/**
 * 获取订单列表
 */
export const getOrderList = (params: OrderListParams) => {
  return request<PageResult<Order>>({
    url: '/admin/order/list',
    method: 'get',
    params
  })
}

/**
 * 更新订单状态
 */
export const updateOrderStatus = (id: number, status: number) => {
  return request({
    url: `/admin/order/status/${id}`,
    method: 'put',
    data: { status }
  })
}

/**
 * 获取订单统计
 */
export const getOrderStatistics = (days?: number) => {
  return request<OrderStatistics>({
    url: '/admin/order/statistics',
    method: 'get',
    params: days ? { days } : {}
  })
}
