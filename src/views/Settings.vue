<template>
  <div class="settings-page">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card shadow="hover" class="info-card">
          <template #header>
            <div class="card-header">
              <el-icon><Setting /></el-icon>
              <span>系统设置</span>
            </div>
          </template>

          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本设置" name="basic">
              <el-form
                ref="basicFormRef"
                :model="basicForm"
                label-width="120px"
                style="max-width: 600px"
              >
                <el-form-item label="店铺名称">
                  <el-input v-model="basicForm.shopName" placeholder="请输入店铺名称" />
                </el-form-item>
                <el-form-item label="联系电话">
                  <el-input v-model="basicForm.phone" placeholder="请输入联系电话" />
                </el-form-item>
                <el-form-item label="店铺地址">
                  <el-input v-model="basicForm.address" placeholder="请输入店铺地址" />
                </el-form-item>
                <el-form-item label="营业时间">
                  <el-input v-model="basicForm.businessHours" placeholder="如：09:00-22:00" />
                </el-form-item>
                <el-form-item label="店铺简介">
                  <el-input
                    v-model="basicForm.intro"
                    type="textarea"
                    :rows="4"
                    placeholder="请输入店铺简介"
                  />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleSaveBasic" :loading="loading">保存设置</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <el-tab-pane label="配送设置" name="delivery">
              <el-form
                ref="deliveryFormRef"
                :model="deliveryForm"
                label-width="120px"
                style="max-width: 600px"
              >
                <el-form-item label="起送金额">
                  <el-input v-model="deliveryForm.minAmount" placeholder="请输入起送金额">
                    <template #prepend>¥</template>
                  </el-input>
                </el-form-item>
                <el-form-item label="配送费">
                  <el-input v-model="deliveryForm.deliveryFee" placeholder="请输入配送费">
                    <template #prepend>¥</template>
                  </el-input>
                </el-form-item>
                <el-form-item label="打包费">
                  <el-input v-model="deliveryForm.packingFee" placeholder="请输入打包费">
                    <template #prepend>¥</template>
                  </el-input>
                </el-form-item>
                <el-form-item label="配送范围">
                  <el-input v-model="deliveryForm.range" placeholder="请输入配送范围">
                    <template #append>公里</template>
                  </el-input>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleSaveDelivery" :loading="loading">保存设置</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <el-tab-pane label="系统信息" name="system">
              <el-descriptions :column="1" border>
                <el-descriptions-item label="系统名称">云吞点餐系统</el-descriptions-item>
                <el-descriptions-item label="系统版本">v1.0.0</el-descriptions-item>
                <el-descriptions-item label="后端框架">Spring Boot 3.4.0</el-descriptions-item>
                <el-descriptions-item label="前端框架">Vue 3 + TypeScript</el-descriptions-item>
                <el-descriptions-item label="UI框架">Element Plus</el-descriptions-item>
                <el-descriptions-item label="图表库">ECharts</el-descriptions-item>
              </el-descriptions>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getShopConfig, updateShopConfig } from '@/api/config'

const activeTab = ref('basic')
const loading = ref(false)

const basicForm = reactive({
  shopName: '',
  phone: '',
  address: '',
  businessHours: '',
  intro: ''
})

const deliveryForm = reactive({
  minAmount: '',
  deliveryFee: '',
  packingFee: '',
  range: ''
})

// 加载店铺配置
const loadShopConfig = async () => {
  try {
    loading.value = true
    const res = await getShopConfig()
    if (res.data) {
      // 基本设置
      basicForm.shopName = res.data.shopName || ''
      basicForm.phone = res.data.phone || ''
      basicForm.address = res.data.address || ''
      basicForm.businessHours = res.data.businessHours || ''
      basicForm.intro = res.data.intro || ''
      
      // 配送设置
      deliveryForm.minAmount = String(res.data.minDeliveryAmount || '')
      deliveryForm.deliveryFee = String(res.data.deliveryFee || '')
      deliveryForm.packingFee = String(res.data.packingFee || '')
      deliveryForm.range = String(res.data.deliveryRange || '')
    }
  } catch (error) {
    ElMessage.error('加载配置失败')
  } finally {
    loading.value = false
  }
}

// 保存基本设置
const handleSaveBasic = async () => {
  try {
    loading.value = true
    await updateShopConfig({
      ...basicForm,
      minDeliveryAmount: Number(deliveryForm.minAmount),
      deliveryFee: Number(deliveryForm.deliveryFee),
      packingFee: Number(deliveryForm.packingFee),
      deliveryRange: Number(deliveryForm.range)
    })
    ElMessage.success('基本设置保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    loading.value = false
  }
}

// 保存配送设置
const handleSaveDelivery = async () => {
  try {
    loading.value = true
    await updateShopConfig({
      ...basicForm,
      minDeliveryAmount: Number(deliveryForm.minAmount),
      deliveryFee: Number(deliveryForm.deliveryFee),
      packingFee: Number(deliveryForm.packingFee),
      deliveryRange: Number(deliveryForm.range)
    })
    ElMessage.success('配送设置保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    loading.value = false
  }
}

// 页面加载时获取配置
onMounted(() => {
  loadShopConfig()
})
</script>

<style scoped lang="scss">
.settings-page {
  .info-card {
    .card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 600;
    }
  }
}
</style>
