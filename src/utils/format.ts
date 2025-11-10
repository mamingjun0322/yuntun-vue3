import dayjs from 'dayjs'

/**
 * 格式化日期时间
 */
export const formatDateTime = (date: string | Date, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return ''
  return dayjs(date).format(format)
}

/**
 * 格式化日期
 */
export const formatDate = (date: string | Date) => {
  return formatDateTime(date, 'YYYY-MM-DD')
}

/**
 * 格式化时间
 */
export const formatTime = (date: string | Date) => {
  return formatDateTime(date, 'HH:mm:ss')
}

/**
 * 格式化金额
 */
export const formatMoney = (amount: string | number) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return `¥${num.toFixed(2)}`
}

/**
 * 格式化数字（千分位）
 */
export const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 订单状态文本
 */
export const getOrderStatusText = (status: number) => {
  const statusMap: Record<number, string> = {
    1: '待支付',
    2: '制作中',
    3: '配送中',
    4: '已完成',
    5: '已取消'
  }
  return statusMap[status] || '未知'
}

/**
 * 订单类型文本
 */
export const getOrderTypeText = (type: number) => {
  const typeMap: Record<number, string> = {
    1: '堂食',
    2: '外卖'
  }
  return typeMap[type] || '未知'
}
