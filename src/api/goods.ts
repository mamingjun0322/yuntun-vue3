import request from './request'

export interface Goods {
  id?: number
  categoryId: number
  name: string
  images: string
  price: string
  originalPrice?: string
  description?: string
  detail?: string
  sales?: number
  stock: number
  tag?: string
  sort?: number
  status?: number
  createTime?: string
  updateTime?: string
}

export interface GoodsListParams {
  categoryId?: number
  keyword?: string
  page?: number
  pageSize?: number
}

export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

/**
 * 获取商品列表
 */
export const getGoodsList = (params: GoodsListParams) => {
  return request<PageResult<Goods>>({
    url: '/admin/goods/list',
    method: 'get',
    params
  })
}

/**
 * 添加商品
 */
export const addGoods = (data: Goods) => {
  return request({
    url: '/admin/goods/add',
    method: 'post',
    data
  })
}

/**
 * 更新商品
 */
export const updateGoods = (id: number, data: Goods) => {
  return request({
    url: `/admin/goods/update/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除商品
 */
export const deleteGoods = (id: number) => {
  return request({
    url: `/admin/goods/delete/${id}`,
    method: 'delete'
  })
}

/**
 * 更新商品状态
 */
export const updateGoodsStatus = (id: number, status: number) => {
  return request({
    url: `/admin/goods/status/${id}`,
    method: 'put',
    data: { status }
  })
}
