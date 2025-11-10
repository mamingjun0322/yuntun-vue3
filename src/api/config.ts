import request from './request'

/**
 * 店铺配置接口
 */
export interface ShopConfig {
  shopName: string
  phone: string
  address: string
  businessHours: string
  intro: string
  minDeliveryAmount: number
  deliveryFee: number
  packingFee: number
  deliveryRange: number
}

/**
 * 获取店铺配置
 */
export const getShopConfig = () => {
  return request<ShopConfig>({
    url: '/admin/config/shop',
    method: 'get'
  })
}

/**
 * 更新店铺配置
 */
export const updateShopConfig = (data: ShopConfig) => {
  return request({
    url: '/admin/config/shop/update',
    method: 'post',
    data
  })
}
