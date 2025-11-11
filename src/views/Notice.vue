<template>
  <div class="notice-container">
    <el-card>
      <!-- 顶部操作栏 -->
      <div class="toolbar">
        <el-input
          v-model="keyword"
          placeholder="搜索通知内容"
          clearable
          style="width: 300px"
          @clear="loadNoticeList"
          @keyup.enter="loadNoticeList"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="openDialog()">
          <el-icon><Plus /></el-icon>
          添加通知
        </el-button>
      </div>

      <!-- 通知表格 -->
      <el-table :data="noticeList" border stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="content" label="通知内容" min-width="400" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDialog(row)">
              编辑
            </el-button>
            <el-button link type="danger" @click="handleDelete(row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadNoticeList"
        @current-change="loadNoticeList"
        style="margin-top: 20px; justify-content: center"
      />
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="form.id ? '编辑通知' : '添加通知'"
      width="600px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="通知内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="4"
            placeholder="请输入通知内容"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import { getNoticeList, createNotice, updateNotice, deleteNotice } from '@/api/notice'

// 列表数据
const noticeList = ref<any[]>([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const keyword = ref('')
const loading = ref(false)

// 对话框
const dialogVisible = ref(false)
const saving = ref(false)
const formRef = ref()
const form = ref({
  id: null,
  content: '',
  status: 1
})

const rules = {
  content: [{ required: true, message: '请输入通知内容', trigger: 'blur' }]
}

/**
 * 加载通知列表
 */
const loadNoticeList = async () => {
  try {
    loading.value = true
    const { data } = await getNoticeList({
      page: page.value,
      pageSize: pageSize.value,
      keyword: keyword.value
    })
    noticeList.value = data.records || []
    total.value = data.total || 0
  } catch (error) {
    console.error('加载通知列表失败', error)
    ElMessage.error('加载通知列表失败')
  } finally {
    loading.value = false
  }
}

/**
 * 打开对话框
 */
const openDialog = (row?: any) => {
  if (row) {
    // 编辑
    form.value = {
      id: row.id,
      content: row.content,
      status: row.status
    }
  } else {
    // 新增
    form.value = {
      id: null,
      content: '',
      status: 1
    }
  }
  dialogVisible.value = true
}

/**
 * 保存通知
 */
const handleSave = async () => {
  try {
    await formRef.value.validate()
    saving.value = true

    if (form.value.id) {
      // 更新
      await updateNotice(form.value.id, form.value)
      ElMessage.success('更新成功')
    } else {
      // 创建
      await createNotice(form.value)
      ElMessage.success('创建成功')
    }

    dialogVisible.value = false
    loadNoticeList()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('保存通知失败', error)
      ElMessage.error('保存失败')
    }
  } finally {
    saving.value = false
  }
}

/**
 * 删除通知
 */
const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这条通知吗？', '提示', {
      type: 'warning'
    })

    await deleteNotice(id)
    ElMessage.success('删除成功')
    loadNoticeList()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除通知失败', error)
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  loadNoticeList()
})
</script>

<style scoped lang="scss">
.notice-container {
  padding: 20px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
</style>
