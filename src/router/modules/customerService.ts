import type { RouteRecordRaw } from 'vue-router'
import Layout from '@/layout/index.vue'

/**
 * 客服管理路由
 */
const customerServiceRouter: RouteRecordRaw = {
  path: '/customer',
  component: Layout,
  redirect: '/customer/index',
  meta: {
    title: '客服管理',
    icon: 'ChatDotSquare',
    alwaysShow: false
  },
  children: [
    {
      path: 'index',
      name: 'CustomerService',
      component: () => import('@/views/customer.vue'),
      meta: {
        title: '客服管理',
        icon: 'ChatDotSquare'
      }
    }
  ]
}

export default customerServiceRouter
