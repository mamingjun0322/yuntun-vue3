<template>
  <div class="user-page">
    <el-card shadow="hover">
      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="用户昵称/手机号"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 用户列表 -->
      <el-table
        v-loading="loading"
        :data="userList"
        stripe
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="avatar" label="头像" width="80">
          <template #default="{ row }">
            <el-avatar :size="50" :src="row.avatar">
              {{ row.nickname?.[0] }}
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="nickname" label="昵称" min-width="120" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="points" label="积分" width="100">
          <template #default="{ row }">
            <el-tag type="warning">{{ row.points || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="等级" width="100">
          <template #default="{ row }">
            <el-tag :type="getLevelType(row.level)">
              {{ getLevelText(row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="注册时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link :icon="View" @click="handleView(row)">
              查看详情
            </el-button>
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
          @size-change="loadUserList"
          @current-change="loadUserList"
        />
      </div>
    </el-card>

    <!-- 用户详情对话框 -->
    <el-dialog v-model="detailVisible" title="用户详情" width="600px">
      <el-descriptions :column="2" border v-if="currentUser">
        <el-descriptions-item label="用户ID">{{ currentUser.id }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ currentUser.nickname }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ currentUser.phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="积分">{{ currentUser.points || 0 }}</el-descriptions-item>
        <el-descriptions-item label="等级">{{ getLevelText(currentUser.level) }}</el-descriptions-item>
        <el-descriptions-item label="注册时间">
          {{ formatDateTime(currentUser.createTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="头像" :span="2">
          <el-avatar :size="80" :src="currentUser.avatar">
            {{ currentUser.nickname?.[0] }}
          </el-avatar>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, View } from '@element-plus/icons-vue'
import { getUserList as apiGetUserList, type User } from '@/api/user'
import { formatDateTime } from '@/utils/format'

const loading = ref(false)
const detailVisible = ref(false)

const searchForm = reactive({
  keyword: '',
  page: 1,
  pageSize: 10
})

const userList = ref<User[]>([])
const total = ref(0)
const currentUser = ref<User | null>(null)

const getLevelType = (level?: number) => {
  const typeMap: Record<number, string> = {
    1: 'info',
    2: 'success',
    3: 'warning',
    4: 'danger'
  }
  return typeMap[level || 1] || 'info'
}

const getLevelText = (level?: number) => {
  const textMap: Record<number, string> = {
    1: '普通会员',
    2: '银牌会员',
    3: '金牌会员',
    4: 'VIP会员'
  }
  return textMap[level || 1] || '普通会员'
}

const loadUserList = async () => {
  loading.value = true
  try {
    const res = await apiGetUserList(searchForm)
    userList.value = res.data.records
    total.value = res.data.total
  } catch (error) {
    ElMessage.error('加载用户列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  searchForm.page = 1
  loadUserList()
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.page = 1
  loadUserList()
}

const handleView = (row: User) => {
  currentUser.value = row
  detailVisible.value = true
}

onMounted(() => {
  loadUserList()
})
</script>

<style scoped lang="scss">
.user-page {
  .search-form {
    margin-bottom: 16px;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
