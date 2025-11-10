import request from './request'

export interface Category {
  id?: number
  name: string
  sort: number
  status?: number
  createTime?: string
  updateTime?: string
}

/**
 * 获取分类列表（小程序端）
 */
export const getCategoryList = () => {
  return request<Category[]>({
    url: '/api/category/list',
    method: 'get'
  })
}

/**
 * 获取分类列表（后台）
 */
export const getAdminCategoryList = () => {
  return request<Category[]>({
    url: '/admin/category/list',
    method: 'get'
  })
}

/**
 * 添加分类
 */
export const addCategory = (data: Category) => {
  return request({
    url: '/admin/category/add',
    method: 'post',
    data
  })
}

/**
 * 更新分类
 */
export const updateCategory = (id: number, data: Category) => {
  return request({
    url: `/admin/category/update/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除分类
 */
export const deleteCategory = (id: number) => {
  return request({
    url: `/admin/category/delete/${id}`,
    method: 'delete'
  })
}

/**
 * 更新分类状态
 */
export const updateCategoryStatus = (id: number, status: number) => {
  return request({
    url: `/admin/category/status/${id}`,
    method: 'put',
    data: { status }
  })
}
