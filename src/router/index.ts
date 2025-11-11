import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'
import customerServiceRouter from './modules/customerService'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layout/index.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '数据看板', icon: 'DataLine' }
      },
      {
        path: '/category',
        name: 'Category',
        component: () => import('@/views/Category.vue'),
        meta: { title: '分类管理', icon: 'Menu' }
      },
      {
        path: '/goods',
        name: 'Goods',
        component: () => import('@/views/Goods.vue'),
        meta: { title: '商品管理', icon: 'Goods' }
      },
      {
        path: '/order',
        name: 'Order',
        component: () => import('@/views/Order.vue'),
        meta: { title: '订单管理', icon: 'List' }
      },
      {
        path: '/user',
        name: 'User',
        component: () => import('@/views/User.vue'),
        meta: { title: '用户管理', icon: 'User' }
      },
      {
        path: '/banner',
        name: 'Banner',
        component: () => import('@/views/Banner.vue'),
        meta: { title: '轮播图管理', icon: 'Picture' }
      },
      {
        path: '/notice',
        name: 'Notice',
        component: () => import('@/views/Notice.vue'),
        meta: { title: '通知管理', icon: 'Bell' }
      },
      {
        path: '/payment-link',
        name: 'PaymentLink',
        component: () => import('@/views/PaymentLink.vue'),
        meta: { title: '收款码管理', icon: 'Money' }
      },
      {
        path: '/admin-manage',
        name: 'AdminManage',
        component: () => import('@/views/AdminManage.vue'),
        meta: { title: '管理员管理', icon: 'UserFilled' }
      },
      {
        path: '/settings',
        name: 'Settings',
        component: () => import('@/views/Settings.vue'),
        meta: { title: '系统设置', icon: 'Setting' }
      }
    ]
  },
  customerServiceRouter
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const requiresAuth = to.meta.requiresAuth !== false

  if (requiresAuth && !userStore.token) {
    next('/login')
  } else if (to.path === '/login' && userStore.token) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
