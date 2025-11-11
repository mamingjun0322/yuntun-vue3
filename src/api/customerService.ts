import request from './request'

/**
 * 获取消息列表
 */
export const getMessageList = (params: any) => {
  return request({
    url: '/admin/customerService/messageList',
    method: 'get',
    params
  })
}

/**
 * 回复消息
 */
export const replyMessage = (data: any) => {
  return request({
    url: '/admin/customerService/reply',
    method: 'post',
    data
  })
}

/**
 * 获取用户列表
 */
export const getUserList = () => {
  return request({
    url: '/admin/customerService/userList',
    method: 'get'
  })
}

/**
 * 获取统计数据
 */
export const getStatistics = () => {
  return request({
    url: '/admin/customerService/statistics',
    method: 'get'
  })
}
