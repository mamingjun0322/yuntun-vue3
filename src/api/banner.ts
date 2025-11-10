import request from './request'
import type { PageResult } from './goods'

export interface Banner {
  id?: number
  image: string
  url?: string
  sort: number
  status: number // 0-禁用 1-启用
  createTime?: string
  updateTime?: string
}

export interface BannerListParams {
  page?: number
  pageSize?: number
}

/**
 * 获取轮播图列表
 */
export const getBannerList = (params: BannerListParams) => {
  return request<PageResult<Banner>>({
    url: '/admin/banner/list',
    method: 'get',
    params
  })
}

/**
 * 添加轮播图
 */
export const addBanner = (data: Banner) => {
  return request({
    url: '/admin/banner/add',
    method: 'post',
    data
  })
}

/**
 * 更新轮播图
 */
export const updateBanner = (id: number, data: Banner) => {
  return request({
    url: `/admin/banner/update/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除轮播图
 */
export const deleteBanner = (id: number) => {
  return request({
    url: `/admin/banner/delete/${id}`,
    method: 'delete'
  })
}

/**
 * 更新轮播图状态
 */
export const updateBannerStatus = (id: number, status: number) => {
  return request({
    url: `/admin/banner/status/${id}`,
    method: 'put',
    data: { status }
  })
}
