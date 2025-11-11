import request from './request'

/**
 * 获取FAQ列表
 */
export const getFaqList = (params: any) => {
  return request({
    url: '/admin/faq/list',
    method: 'get',
    params
  })
}

/**
 * 获取FAQ详情
 */
export const getFaqById = (id: number) => {
  return request({
    url: `/admin/faq/${id}`,
    method: 'get'
  })
}

/**
 * 创建FAQ
 */
export const createFaq = (data: any) => {
  return request({
    url: '/admin/faq',
    method: 'post',
    data
  })
}

/**
 * 更新FAQ
 */
export const updateFaq = (id: number, data: any) => {
  return request({
    url: `/admin/faq/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除FAQ
 */
export const deleteFaq = (id: number) => {
  return request({
    url: `/admin/faq/${id}`,
    method: 'delete'
  })
}
