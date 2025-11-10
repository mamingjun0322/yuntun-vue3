import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AdminInfo } from '@/api/auth'

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref<string>('')
    const userInfo = ref<AdminInfo | null>(null)

    /**
     * 是否是超级管理员
     */
    const isSuperAdmin = computed(() => {
      return userInfo.value?.role === 1
    })

    /**
     * 设置Token
     */
    const setToken = (newToken: string) => {
      token.value = newToken
    }

    /**
     * 设置用户信息
     */
    const setUserInfo = (info: AdminInfo) => {
      userInfo.value = info
    }

    /**
     * 登录
     */
    const login = (newToken: string, info: AdminInfo) => {
      token.value = newToken
      userInfo.value = info
    }

    /**
     * 退出登录
     */
    const logout = () => {
      token.value = ''
      userInfo.value = null
    }

    return {
      token,
      userInfo,
      isSuperAdmin,
      setToken,
      setUserInfo,
      login,
      logout
    }
  },
  {
    persist: true
  }
)
