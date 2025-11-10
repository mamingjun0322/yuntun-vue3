import request from './request'

/**
 * 收款码配置类型
 */
export interface PaymentLink {
  id?: number
  amount: string
  paymentUrl: string
  paymentType: string
  qrCodeUrl?: string
  description?: string
  status: number
  sort: number
  createTime?: string
  updateTime?: string
}

/**
 * 获取收款码列表（分页）
 */
export const getPaymentLinkList = (params: { page: number; pageSize: number }) => {
  return request({
    url: '/admin/paymentLink/list',
    method: 'get',
    params
  })
}

/**
 * 获取所有收款码（不分页）
 */
export const getAllPaymentLinks = () => {
  return request({
    url: '/admin/paymentLink/all',
    method: 'get'
  })
}

/**
 * 获取收款码详情
 */
export const getPaymentLinkDetail = (id: number) => {
  return request({
    url: `/admin/paymentLink/${id}`,
    method: 'get'
  })
}

/**
 * 添加收款码
 */
export const addPaymentLink = (data: PaymentLink) => {
  return request({
    url: '/admin/paymentLink',
    method: 'post',
    data
  })
}

/**
 * 更新收款码
 */
export const updatePaymentLink = (id: number, data: PaymentLink) => {
  return request({
    url: `/admin/paymentLink/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除收款码
 */
export const deletePaymentLink = (id: number) => {
  return request({
    url: `/admin/paymentLink/${id}`,
    method: 'delete'
  })
}

/**
 * 切换收款码状态
 */
export const togglePaymentLinkStatus = (id: number) => {
  return request({
    url: `/admin/paymentLink/${id}/toggleStatus`,
    method: 'put'
  })
}
