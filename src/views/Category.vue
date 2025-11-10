<template>
  <div class="category-page">
    <el-card shadow="hover">
      <!-- 操作栏 -->
      <div class="toolbar">
        <el-button type="primary" :icon="Plus" @click="handleAdd">添加分类</el-button>
      </div>

      <!-- 分类列表 -->
      <el-table v-loading="loading" :data="categoryList" stripe style="width: 100%">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="name" label="分类名称" min-width="150" />
        <el-table-column prop="sort" label="排序" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link :icon="Edit" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" link :icon="Delete" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      @close="handleDialogClose"
    >
      <el-form
        ref="categoryFormRef"
        :model="categoryForm"
        :rules="categoryRules"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="categoryForm.sort" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="categoryForm.status">
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import {
  getAdminCategoryList,
  addCategory,
  updateCategory,
  deleteCategory,
  updateCategoryStatus,
  type Category
} from '@/api/category'
import { formatDateTime } from '@/utils/format'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('添加分类')
const categoryFormRef = ref<FormInstance>()

const categoryForm = reactive<Category>({
  name: '',
  sort: 0,
  status: 1
})

const categoryRules: FormRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  sort: [{ required: true, message: '请输入排序', trigger: 'blur' }]
}

const categoryList = ref<Category[]>([])
const currentCategory = ref<Category | null>(null)

const loadCategoryList = async () => {
  loading.value = true
  try {
    const res = await getAdminCategoryList()
    categoryList.value = res.data
  } catch (error) {
    ElMessage.error('加载分类列表失败')
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  dialogTitle.value = '添加分类'
  currentCategory.value = null
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: Category) => {
  dialogTitle.value = '编辑分类'
  currentCategory.value = row
  Object.assign(categoryForm, row)
  dialogVisible.value = true
}

const handleDelete = (row: Category) => {
  ElMessageBox.confirm('确定要删除该分类吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteCategory(row.id!)
      ElMessage.success('删除成功')
      loadCategoryList()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

const handleStatusChange = async (row: Category) => {
  try {
    await updateCategoryStatus(row.id!, row.status!)
    ElMessage.success(row.status === 1 ? '已启用' : '已禁用')
  } catch (error) {
    row.status = row.status === 1 ? 0 : 1
    ElMessage.error('操作失败')
  }
}

const handleSubmit = async () => {
  if (!categoryFormRef.value) return

  await categoryFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (currentCategory.value?.id) {
          await updateCategory(currentCategory.value.id, categoryForm)
          ElMessage.success('更新成功')
        } else {
          await addCategory(categoryForm)
          ElMessage.success('添加成功')
        }
        dialogVisible.value = false
        loadCategoryList()
      } catch (error: any) {
        ElMessage.error(error.message || '操作失败')
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
  Object.assign(categoryForm, {
    name: '',
    sort: 0,
    status: 1
  })
  categoryFormRef.value?.resetFields()
}

onMounted(() => {
  loadCategoryList()
})
</script>

<style scoped lang="scss">
.category-page {
  .toolbar {
    margin-bottom: 16px;
  }
}
</style>
