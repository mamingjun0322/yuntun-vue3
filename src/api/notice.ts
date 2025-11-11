import request from './request'

/**
 * 获取通知列表
 */
export const getNoticeList = (params: any) => {
  return request({
    url: '/admin/notice/list',
    method: 'get',
    params
  })
}

/**
 * 获取通知详情
 */
export const getNoticeById = (id: number) => {
  return request({
    url: `/admin/notice/${id}`,
    method: 'get'
  })
}

/**
 * 创建通知
 */
export const createNotice = (data: any) => {
  return request({
    url: '/admin/notice',
    method: 'post',
    data
  })
}

/**
 * 更新通知
 */
export const updateNotice = (id: number, data: any) => {
  return request({
    url: `/admin/notice/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除通知
 */
export const deleteNotice = (id: number) => {
  return request({
    url: `/admin/notice/${id}`,
    method: 'delete'
  })
}
