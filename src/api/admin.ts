import request from './request'
import type { PageResult } from './goods'

export interface AdminUser {
  id?: number
  username: string
  password?: string
  name?: string
  phone?: string
  avatar?: string
  role: number // 1-超级管理员 2-普通管理员
  status?: number // 0-禁用 1-启用
  createTime?: string
  updateTime?: string
}

export interface AdminListParams {
  keyword?: string
  page?: number
  pageSize?: number
}

/**
 * 获取管理员列表
 */
export const getAdminList = (params: AdminListParams) => {
  return request<PageResult<AdminUser>>({
    url: '/admin/manage/list',
    method: 'get',
    params
  })
}

/**
 * 添加管理员
 */
export const addAdmin = (data: AdminUser) => {
  return request({
    url: '/admin/manage/add',
    method: 'post',
    data
  })
}

/**
 * 更新管理员
 */
export const updateAdmin = (id: number, data: AdminUser) => {
  return request({
    url: `/admin/manage/update/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除管理员
 */
export const deleteAdmin = (id: number) => {
  return request({
    url: `/admin/manage/delete/${id}`,
    method: 'delete'
  })
}

/**
 * 更新管理员状态
 */
export const updateAdminStatus = (id: number, status: number) => {
  return request({
    url: `/admin/manage/status/${id}`,
    method: 'put',
    data: { status }
  })
}

/**
 * 重置管理员密码
 */
export const resetAdminPassword = (id: number, newPassword: string) => {
  return request({
    url: `/admin/manage/resetPassword/${id}`,
    method: 'put',
    data: { newPassword }
  })
}
