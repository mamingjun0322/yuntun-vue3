<template>
  <div class="admin-manage-page">
    <el-card shadow="hover">
      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="用户名/姓名/手机号"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
          <el-button v-if="userStore.isSuperAdmin" type="success" :icon="Plus" @click="handleAdd">添加管理员</el-button>
        </el-form-item>
      </el-form>

      <!-- 管理员列表 -->
      <el-table v-loading="loading" :data="adminList" stripe style="width: 100%">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="name" label="姓名" width="100">
          <template #default="{ row }">
            {{ row.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" width="130">
          <template #default="{ row }">
            {{ row.phone || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="role" label="角色" width="120">
          <template #default="{ row }">
            <el-tag :type="row.role === 1 ? 'danger' : 'primary'">
              {{ getRoleText(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              :disabled="!userStore.isSuperAdmin"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <template v-if="userStore.isSuperAdmin">
              <el-button type="primary" link :icon="Edit" @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button type="warning" link :icon="Key" @click="handleResetPassword(row)">
                重置密码
              </el-button>
              <el-button type="danger" link :icon="Delete" @click="handleDelete(row)">
                删除
              </el-button>
            </template>
            <span v-else class="no-permission">-</span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="searchForm.page"
          v-model:page-size="searchForm.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadAdminList"
          @current-change="loadAdminList"
        />
      </div>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      @close="handleDialogClose"
    >
      <el-form
        ref="adminFormRef"
        :model="adminForm"
        :rules="adminRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="adminForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" :prop="currentAdmin ? '' : 'password'">
          <el-input
            v-model="adminForm.password"
            type="password"
            :placeholder="currentAdmin ? '留空则不修改' : '请输入密码'"
            show-password
          />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="adminForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="adminForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-radio-group v-model="adminForm.role">
            <el-radio :value="1">普通管理员</el-radio>
            <el-radio :value="2">超级管理员</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="adminForm.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 重置密码对话框 -->
    <el-dialog v-model="passwordVisible" title="重置密码" width="400px">
      <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="100px">
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handlePasswordSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Edit, Delete, Key } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import {
  getAdminList as apiGetAdminList,
  addAdmin,
  updateAdmin,
  deleteAdmin,
  updateAdminStatus,
  resetAdminPassword,
  type AdminUser
} from '@/api/admin'
import { formatDateTime } from '@/utils/format'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const passwordVisible = ref(false)
const dialogTitle = ref('添加管理员')
const adminFormRef = ref<FormInstance>()
const passwordFormRef = ref<FormInstance>()

const searchForm = reactive({
  keyword: '',
  page: 1,
  pageSize: 10
})

const adminForm = reactive<AdminUser>({
  username: '',
  password: '',
  name: '',
  phone: '',
  role: 1,
  status: 1
})

const passwordForm = reactive({
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const adminRules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

const passwordRules: FormRules = {
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const adminList = ref<AdminUser[]>([])
const total = ref(0)
const currentAdmin = ref<AdminUser | null>(null)

const getRoleText = (role: number) => {
  return role === 1 ? '超级管理员' : '普通管理员'
}

const loadAdminList = async () => {
  loading.value = true
  try {
    const res = await apiGetAdminList(searchForm)
    adminList.value = res.data.records
    total.value = res.data.total
  } catch (error) {
    ElMessage.error('加载管理员列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  searchForm.page = 1
  loadAdminList()
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.page = 1
  loadAdminList()
}

const handleAdd = () => {
  dialogTitle.value = '添加管理员'
  currentAdmin.value = null
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: AdminUser) => {
  dialogTitle.value = '编辑管理员'
  currentAdmin.value = row
  Object.assign(adminForm, { ...row, password: '' })
  dialogVisible.value = true
}

const handleDelete = (row: AdminUser) => {
  ElMessageBox.confirm('确定要删除该管理员吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteAdmin(row.id!)
      ElMessage.success('删除成功')
      loadAdminList()
    } catch (error: any) {
      ElMessage.error(error.message || '删除失败')
    }
  })
}

const handleStatusChange = async (row: AdminUser) => {
  try {
    await updateAdminStatus(row.id!, row.status!)
    ElMessage.success(row.status === 1 ? '已启用' : '已禁用')
  } catch (error) {
    row.status = row.status === 1 ? 0 : 1
    ElMessage.error('操作失败')
  }
}

const handleResetPassword = (row: AdminUser) => {
  currentAdmin.value = row
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  passwordVisible.value = true
}

const handleSubmit = async () => {
  if (!adminFormRef.value) return

  await adminFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (currentAdmin.value?.id) {
          await updateAdmin(currentAdmin.value.id, adminForm)
          ElMessage.success('更新成功')
        } else {
          await addAdmin(adminForm)
          ElMessage.success('添加成功')
        }
        dialogVisible.value = false
        loadAdminList()
      } catch (error: any) {
        ElMessage.error(error.message || '操作失败')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

const handlePasswordSubmit = async () => {
  if (!passwordFormRef.value) return

  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        await resetAdminPassword(currentAdmin.value!.id!, passwordForm.newPassword)
        ElMessage.success('密码重置成功')
        passwordVisible.value = false
      } catch (error: any) {
        ElMessage.error(error.message || '重置失败')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

const handleDialogClose = () => {
  resetForm()
}

const resetForm = () => {
  Object.assign(adminForm, {
    username: '',
    password: '',
    name: '',
    phone: '',
    role: 1,
    status: 1
  })
  adminFormRef.value?.resetFields()
}

onMounted(() => {
  loadAdminList()
})
</script>

<style scoped lang="scss">
.admin-manage-page {
  .search-form {
    margin-bottom: 16px;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .no-permission {
    color: #909399;
    font-size: 14px;
  }
}
</style>
