import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore(
  'app',
  () => {
    const isCollapse = ref(false)
    const theme = ref<'light' | 'dark'>('light')

    /**
     * 切换侧边栏折叠状态
     */
    const toggleSidebar = () => {
      isCollapse.value = !isCollapse.value
    }

    /**
     * 切换主题
     */
    const toggleTheme = () => {
      theme.value = theme.value === 'light' ? 'dark' : 'light'
    }

    return {
      isCollapse,
      theme,
      toggleSidebar,
      toggleTheme
    }
  },
  {
    persist: true
  }
)
