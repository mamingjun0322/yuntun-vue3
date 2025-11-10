<template>
  <div class="payment-link-page">
    <el-card shadow="hover">
      <!-- 工具栏 -->
      <div class="toolbar">
        <el-button type="primary" :icon="Plus" @click="handleAdd">添加收款码</el-button>
      </div>

      <!-- 收款码列表 -->
      <el-table
        v-loading="loading"
        :data="paymentLinkList"
        stripe
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="paymentUrl" label="收款码" width="120">
          <template #default="{ row }">
            <el-image
              :src="row.paymentUrl"
              :preview-src-list="[row.paymentUrl]"
              fit="cover"
              style="width: 80px; height: 80px; border-radius: 4px; cursor: pointer"
            >
              <template #error>
                <div class="image-error">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="100">
          <template #default="{ row }">
            <span class="amount">¥{{ row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="paymentType" label="支付类型" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.paymentType === 'wechat'" type="success">微信</el-tag>
            <el-tag v-else-if="row.paymentType === 'alipay'" type="primary">支付宝</el-tag>
            <el-tag v-else type="info">{{ row.paymentType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="150" show-overflow-tooltip />
        <el-table-column prop="sort" label="排序" width="80" sortable />
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

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="searchForm.page"
          v-model:page-size="searchForm.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadPaymentLinkList"
          @current-change="loadPaymentLinkList"
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
        ref="paymentLinkFormRef"
        :model="paymentLinkForm"
        :rules="paymentLinkRules"
        label-width="100px"
      >
        <el-form-item label="收款码图片" prop="paymentUrl">
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
            <img v-if="paymentLinkForm.paymentUrl" :src="paymentLinkForm.paymentUrl" class="uploaded-image" />
            <el-icon v-else class="uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">支持 JPG、PNG 格式，大小不超过 2MB</div>
        </el-form-item>
        <el-form-item label="支付金额" prop="amount">
          <el-input v-model="paymentLinkForm.amount" placeholder="请输入支付金额">
            <template #prepend>¥</template>
          </el-input>
        </el-form-item>
        <el-form-item label="支付类型" prop="paymentType">
          <el-radio-group v-model="paymentLinkForm.paymentType">
            <el-radio value="wechat">微信</el-radio>
            <el-radio value="alipay">支付宝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述说明" prop="description">
          <el-input
            v-model="paymentLinkForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述说明（选填）"
          />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="paymentLinkForm.sort" :min="0" :max="999" />
          <span class="form-tip">数字越小越靠前</span>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="paymentLinkForm.status">
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
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Picture } from '@element-plus/icons-vue'
import type { FormInstance, FormRules, UploadProps } from 'element-plus'
import {
  getPaymentLinkList as apiGetPaymentLinkList,
  addPaymentLink,
  updatePaymentLink,
  deletePaymentLink,
  togglePaymentLinkStatus,
  type PaymentLink
} from '@/api/paymentLink'
import { formatDateTime } from '@/utils/format'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('添加收款码')
const paymentLinkFormRef = ref<FormInstance>()

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
  page: 1,
  pageSize: 10
})

const paymentLinkForm = reactive<PaymentLink>({
  amount: '',
  paymentUrl: '',
  paymentType: 'wechat',
  description: '',
  status: 1,
  sort: 0
})

const paymentLinkRules: FormRules = {
  amount: [{ required: true, message: '请输入支付金额', trigger: 'blur' }],
  paymentUrl: [{ required: true, message: '请上传收款码图片', trigger: 'change' }],
  paymentType: [{ required: true, message: '请选择支付类型', trigger: 'change' }]
}

const paymentLinkList = ref<PaymentLink[]>([])
const total = ref(0)
const currentPaymentLink = ref<PaymentLink | null>(null)

const loadPaymentLinkList = async () => {
  loading.value = true
  try {
    const res = await apiGetPaymentLinkList(searchForm)
    paymentLinkList.value = res.data.records
    total.value = res.data.total
  } catch (error) {
    ElMessage.error('加载收款码列表失败')
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  dialogTitle.value = '添加收款码'
  currentPaymentLink.value = null
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: PaymentLink) => {
  dialogTitle.value = '编辑收款码'
  currentPaymentLink.value = row
  Object.assign(paymentLinkForm, row)
  dialogVisible.value = true
}

const handleDelete = (row: PaymentLink) => {
  ElMessageBox.confirm('确定要删除该收款码吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deletePaymentLink(row.id!)
      ElMessage.success('删除成功')
      loadPaymentLinkList()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

const handleStatusChange = async (row: PaymentLink) => {
  try {
    await togglePaymentLinkStatus(row.id!)
    ElMessage.success(row.status === 1 ? '已启用' : '已禁用')
  } catch (error) {
    row.status = row.status === 1 ? 0 : 1
    ElMessage.error('操作失败')
  }
}

const handleSubmit = async () => {
  if (!paymentLinkFormRef.value) return

  await paymentLinkFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (currentPaymentLink.value?.id) {
          await updatePaymentLink(currentPaymentLink.value.id, paymentLinkForm)
          ElMessage.success('更新成功')
        } else {
          await addPaymentLink(paymentLinkForm)
          ElMessage.success('添加成功')
        }
        dialogVisible.value = false
        loadPaymentLinkList()
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
  Object.assign(paymentLinkForm, {
    amount: '',
    paymentUrl: '',
    paymentType: 'wechat',
    description: '',
    status: 1,
    sort: 0
  })
  paymentLinkFormRef.value?.resetFields()
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
    paymentLinkForm.paymentUrl = response.data
    // 触发表单验证，清除错误提示
    paymentLinkFormRef.value?.clearValidate('paymentUrl')
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
  loadPaymentLinkList()
})
</script>

<style scoped lang="scss">
.payment-link-page {
  .toolbar {
    margin-bottom: 16px;
  }

  .amount {
    color: #f56c6c;
    font-weight: 600;
    font-size: 14px;
  }

  .image-error {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background-color: #f5f7fa;
    color: #c0c4cc;
    font-size: 24px;
  }

  .image-uploader {
    :deep(.el-upload) {
      border: 1px dashed #d9d9d9;
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: all 0.3s;
      width: 200px;
      height: 200px;
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

  .form-tip {
    margin-left: 10px;
    color: #909399;
    font-size: 12px;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
