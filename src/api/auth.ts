import request from './request'

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResult {
  token: string
  adminInfo: {
    id: number
    username: string
    nickname: string
    avatar?: string
    role: number // 1-超级管理员 2-普通管理员
  }
}

export interface AdminInfo {
  id: number
  username: string
  nickname: string
  avatar?: string
  role: number // 1-超级管理员 2-普通管理员
}

/**
 * 管理员登录
 */
export const login = (data: LoginParams) => {
  return request<LoginResult>({
    url: '/admin/auth/login',
    method: 'post',
    data
  })
}

/**
 * 获取管理员信息
 */
export const getAdminInfo = () => {
  return request<AdminInfo>({
    url: '/admin/auth/info',
    method: 'get'
  })
}

/**
 * 退出登录
 */
export const logout = () => {
  return request({
    url: '/admin/auth/logout',
    method: 'post'
  })
}
