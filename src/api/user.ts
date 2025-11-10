import request from './request'
import type { PageResult } from './goods'

export interface User {
  id: number
  phone?: string
  nickname: string
  avatar?: string
  points?: number
  level?: number
  createTime: string
  updateTime?: string
}

export interface UserListParams {
  keyword?: string
  page?: number
  pageSize?: number
}

/**
 * 获取用户列表
 */
export const getUserList = (params: UserListParams) => {
  return request<PageResult<User>>({
    url: '/admin/user/list',
    method: 'get',
    params
  })
}
