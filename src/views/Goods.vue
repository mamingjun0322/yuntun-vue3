<template>
  <div class="goods-page">
    <el-card shadow="hover">
      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="分类">
          <el-select
            v-model="searchForm.categoryId"
            placeholder="请选择分类"
            clearable
            style="width: 180px"
          >
            <el-option
              v-for="item in categories"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="请输入商品名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
          <el-button type="success" :icon="Plus" @click="handleAdd">添加商品</el-button>
        </el-form-item>
      </el-form>

      <!-- 商品列表 -->
      <el-table
        v-loading="loading"
        :data="goodsList"
        stripe
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="image" label="商品图片" width="100">
          <template #default="{ row }">
            <el-image
              :src="row.image"
              :preview-src-list="[row.image]"
              fit="cover"
              style="width: 60px; height: 60px; border-radius: 4px"
            />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="商品名称" min-width="150" />
        <el-table-column prop="categoryId" label="分类" width="100">
          <template #default="{ row }">
            {{ getCategoryName(row.categoryId) }}
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="100">
          <template #default="{ row }">
            <span class="price">{{ formatMoney(row.price) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="80" />
        <el-table-column prop="sales" label="销量" width="80" />
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

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="searchForm.page"
          v-model:page-size="searchForm.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadGoodsList"
          @current-change="loadGoodsList"
        />
      </div>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="goodsFormRef"
        :model="goodsForm"
        :rules="goodsRules"
        label-width="100px"
      >
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="goodsForm.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="商品分类" prop="categoryId">
          <el-select v-model="goodsForm.categoryId" placeholder="请选择分类" style="width: 100%">
            <el-option
              v-for="item in categories"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="商品图片" prop="image">
          <el-upload
            class="image-uploader"
            :action="uploadUrl"
            :headers="uploadHeaders"
            :show-file-list="false"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :before-upload="beforeUpload"
            accept="image/*"
          >
            <img v-if="goodsForm.image" :src="goodsForm.image" class="uploaded-image" />
            <el-icon v-else class="uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">支持 JPG、PNG 格式，大小不超过 2MB</div>
        </el-form-item>
        <el-form-item label="商品价格" prop="price">
          <el-input v-model="goodsForm.price" placeholder="请输入价格">
            <template #prepend>¥</template>
          </el-input>
        </el-form-item>
        <el-form-item label="原价" prop="originalPrice">
          <el-input v-model="goodsForm.originalPrice" placeholder="请输入原价">
            <template #prepend>¥</template>
          </el-input>
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number v-model="goodsForm.stock" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="商品描述" prop="description">
          <el-input
            v-model="goodsForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入商品描述"
          />
        </el-form-item>
        <el-form-item label="标签" prop="tag">
          <el-input v-model="goodsForm.tag" placeholder="如：热销、新品" />
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
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Edit, Delete } from '@element-plus/icons-vue'
import type { FormInstance, FormRules, UploadProps } from 'element-plus'
import {
  getGoodsList as apiGetGoodsList,
  addGoods,
  updateGoods,
  deleteGoods,
  updateGoodsStatus,
  type Goods
} from '@/api/goods'
import { getCategoryList, type Category } from '@/api/category'
import { formatMoney } from '@/utils/format'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('添加商品')
const goodsFormRef = ref<FormInstance>()

// 图片上传配置
const uploadUrl = computed(() => {
  return import.meta.env.VITE_API_BASE_URL + '/admin/upload/image'
})

const uploadHeaders = computed(() => {
  return {
    'admin-token': userStore.token || ''
  }
})

const searchForm = reactive({
  categoryId: undefined as number | undefined,
  keyword: '',
  page: 1,
  pageSize: 10
})

const goodsForm = reactive<Goods>({
  name: '',
  categoryId: 0,
  image: '',
  price: '',
  originalPrice: '',
  stock: 0,
  description: '',
  tag: ''
})

const goodsRules: FormRules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  image: [{ required: true, message: '请输入图片URL', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }]
}

const goodsList = ref<Goods[]>([])
const categories = ref<Category[]>([])
const total = ref(0)
const currentGoods = ref<Goods | null>(null)

const getCategoryName = (categoryId: number) => {
  const category = categories.value.find((c) => c.id === categoryId)
  return category?.name || '-'
}

const loadGoodsList = async () => {
  loading.value = true
  try {
    const res = await apiGetGoodsList(searchForm)
    goodsList.value = res.data.records
    total.value = res.data.total
  } catch (error) {
    ElMessage.error('加载商品列表失败')
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    const res = await getCategoryList()
    categories.value = res.data
  } catch (error) {
    ElMessage.error('加载分类列表失败')
  }
}

const handleSearch = () => {
  searchForm.page = 1
  loadGoodsList()
}

const handleReset = () => {
  searchForm.categoryId = undefined
  searchForm.keyword = ''
  searchForm.page = 1
  loadGoodsList()
}

const handleAdd = () => {
  dialogTitle.value = '添加商品'
  currentGoods.value = null
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: Goods) => {
  dialogTitle.value = '编辑商品'
  currentGoods.value = row
  Object.assign(goodsForm, row)
  dialogVisible.value = true
}

const handleDelete = (row: Goods) => {
  ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteGoods(row.id!)
      ElMessage.success('删除成功')
      loadGoodsList()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

const handleStatusChange = async (row: Goods) => {
  try {
    await updateGoodsStatus(row.id!, row.status!)
    ElMessage.success(row.status === 1 ? '已上架' : '已下架')
  } catch (error) {
    row.status = row.status === 1 ? 0 : 1
    ElMessage.error('操作失败')
  }
}

const handleSubmit = async () => {
  if (!goodsFormRef.value) return

  await goodsFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (currentGoods.value?.id) {
          await updateGoods(currentGoods.value.id, goodsForm)
          ElMessage.success('更新成功')
        } else {
          await addGoods(goodsForm)
          ElMessage.success('添加成功')
        }
        dialogVisible.value = false
        loadGoodsList()
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
  Object.assign(goodsForm, {
    name: '',
    categoryId: 0,
    image: '',
    price: '',
    originalPrice: '',
    stock: 0,
    description: '',
    tag: ''
  })
  goodsFormRef.value?.resetFields()
}

// 图片上传前验证
const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB！')
    return false
  }
  return true
}

// 图片上传成功
const handleUploadSuccess: UploadProps['onSuccess'] = (response) => {
  if (response.code === 200) {
    goodsForm.image = response.data
    // 触发表单验证，清除错误提示
    goodsFormRef.value?.clearValidate('image')
    ElMessage.success('上传成功')
  } else {
    ElMessage.error(response.message || '上传失败')
  }
}

// 图片上传失败
const handleUploadError: UploadProps['onError'] = () => {
  ElMessage.error('上传失败，请重试')
}

onMounted(() => {
  loadCategories()
  loadGoodsList()
})
</script>

<style scoped lang="scss">
.goods-page {
  .search-form {
    margin-bottom: 16px;
  }

  .price {
    color: #f56c6c;
    font-weight: 600;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .image-uploader {
    :deep(.el-upload) {
      border: 1px dashed #d9d9d9;
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: all 0.3s;
      width: 148px;
      height: 148px;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        border-color: #409eff;
      }
    }

    .uploaded-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .uploader-icon {
      font-size: 28px;
      color: #8c939d;
    }
  }

  .upload-tip {
    margin-top: 8px;
    font-size: 12px;
    color: #909399;
  }
}
</style>
