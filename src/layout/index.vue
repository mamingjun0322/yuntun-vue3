<template>
  <el-container class="layout-container">
    <el-aside :width="isCollapse ? '64px' : '200px'" class="sidebar">
      <div class="logo">
        <img v-if="!isCollapse" src="@/assets/logo.svg" alt="Logo" />
        <span v-if="!isCollapse" class="logo-text">云吞后台</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :unique-opened="true"
        router
        class="sidebar-menu"
      >
        <el-menu-item
          v-for="route in menuRoutes"
          :key="route.path"
          :index="route.path"
        >
          <el-icon><component :is="route.meta?.icon" /></el-icon>
          <template #title>{{ route.meta?.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-icon class="toggle-btn" @click="toggleSidebar">
            <Expand v-if="isCollapse" />
            <Fold v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentRoute?.meta?.title">
              {{ currentRoute.meta.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="32" :src="userInfo?.avatar">
                {{ userInfo?.nickname?.[0] }}
              </el-avatar>
              <span class="username">{{ userInfo?.nickname }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { logout as apiLogout } from '@/api/auth'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()

const isCollapse = computed(() => appStore.isCollapse)
const userInfo = computed(() => userStore.userInfo)
const activeMenu = computed(() => route.path)
const currentRoute = computed(() => route)

const menuRoutes = computed(() => {
  const layoutRoute = router.options.routes.find((r) => r.path === '/')
  return layoutRoute?.children || []
})

const toggleSidebar = () => {
  appStore.toggleSidebar()
}

const handleCommand = async (command: string) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        await apiLogout()
      } catch (error) {
        // 忽略退出接口错误
      }
      userStore.logout()
      router.push('/login')
      ElMessage.success('退出成功')
    }).catch(() => {
      // 取消退出
    })
  } else if (command === 'profile') {
    ElMessage.info('个人中心功能开发中')
  }
}
</script>

<style scoped lang="scss">
.layout-container {
  height: 100vh;
  background: #f0f2f5;
}

.sidebar {
  background: #001529;
  transition: width 0.3s;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);

  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 16px;
    background: rgba(255, 255, 255, 0.05);

    img {
      width: 32px;
      height: 32px;
    }

    .logo-text {
      margin-left: 12px;
      font-size: 18px;
      font-weight: 600;
      color: #fff;
      white-space: nowrap;
    }
  }

  .sidebar-menu {
    border-right: none;
    background: #001529;

    :deep(.el-menu-item) {
      color: rgba(255, 255, 255, 0.65);

      &:hover {
        background: rgba(255, 255, 255, 0.08) !important;
        color: #fff;
      }

      &.is-active {
        background: #1890ff !important;
        color: #fff;
      }
    }
  }
}

.header {
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  z-index: 10;

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .toggle-btn {
      font-size: 20px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        color: #1890ff;
      }
    }
  }

  .header-right {
    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 4px 12px;
      border-radius: 4px;
      transition: all 0.3s;

      &:hover {
        background: #f5f5f5;
      }

      .username {
        font-size: 14px;
        color: #333;
      }
    }
  }
}

.main-content {
  padding: 24px;
  overflow-y: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
