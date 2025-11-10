<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-left">
        <div class="brand">
          <img src="@/assets/logo.svg" alt="Logo" class="brand-logo" />
          <h1 class="brand-title">云吞点餐系统</h1>
          <p class="brand-subtitle">后台管理系统</p>
        </div>
        <div class="illustration">
          <el-icon :size="200" color="#1890ff"><DataLine /></el-icon>
        </div>
      </div>
      
      <div class="login-right">
        <div class="login-form-wrapper">
          <h2 class="form-title">欢迎登录</h2>
          <p class="form-subtitle">Welcome back</p>
          
          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            class="login-form"
            size="large"
          >
            <el-form-item prop="username">
              <el-input
                v-model="loginForm.username"
                placeholder="请输入用户名"
                prefix-icon="User"
                clearable
                @keyup.enter="handleLogin"
              />
            </el-form-item>
            
            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                prefix-icon="Lock"
                show-password
                clearable
                @keyup.enter="handleLogin"
              />
            </el-form-item>
            
            <el-form-item>
              <el-button
                type="primary"
                :loading="loading"
                class="login-btn"
                @click="handleLogin"
              >
                {{ loading ? '登录中...' : '登录' }}
              </el-button>
            </el-form-item>
          </el-form>
          
          <div class="login-tip">
            <el-alert
              title="默认账号：admin / admin123"
              type="info"
              :closable="false"
              show-icon
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { login as apiLogin } from '@/api/auth'

const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref<FormInstance>()
const loading = ref(false)

const loginForm = reactive({
  username: 'admin',
  password: 'admin123'
})

const loginRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res = await apiLogin(loginForm)
        userStore.login(res.data.token, res.data.adminInfo)
        ElMessage.success('登录成功')
        router.push('/dashboard')
      } catch (error: any) {
        ElMessage.error(error.message || '登录失败')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped lang="scss">
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-box {
  display: flex;
  width: 100%;
  max-width: 1000px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.login-left {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60px 40px;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .brand {
    .brand-logo {
      width: 64px;
      height: 64px;
      margin-bottom: 20px;
      filter: brightness(0) invert(1);
    }

    .brand-title {
      font-size: 32px;
      font-weight: 700;
      margin: 0 0 10px 0;
    }

    .brand-subtitle {
      font-size: 16px;
      opacity: 0.9;
      margin: 0;
    }
  }

  .illustration {
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0.2;
  }
}

.login-right {
  flex: 1;
  padding: 60px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-form-wrapper {
  width: 100%;
  max-width: 400px;

  .form-title {
    font-size: 28px;
    font-weight: 600;
    margin: 0 0 8px 0;
    color: #333;
  }

  .form-subtitle {
    font-size: 14px;
    color: #999;
    margin: 0 0 40px 0;
  }

  .login-form {
    .login-btn {
      width: 100%;
      height: 44px;
      font-size: 16px;
      font-weight: 500;
      margin-top: 12px;
    }
  }

  .login-tip {
    margin-top: 24px;
  }
}

@media (max-width: 768px) {
  .login-box {
    flex-direction: column;
  }

  .login-left {
    padding: 40px 20px;

    .illustration {
      display: none;
    }
  }

  .login-right {
    padding: 40px 20px;
  }
}
</style>
