<template>
  <div class="customer-service-container">
    <!-- 顶部统计 -->
    <el-row :gutter="20" class="statistics">
      <el-col :span="8">
        <el-card shadow="hover">
          <div class="stat-item">
            <el-icon :size="40" color="#409EFF"><ChatDotSquare /></el-icon>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.totalMessages || 0 }}</div>
              <div class="stat-label">总消息数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div class="stat-item">
            <el-icon :size="40" color="#F56C6C"><Bell /></el-icon>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.unreadMessages || 0 }}</div>
              <div class="stat-label">未读消息</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div class="stat-item">
            <el-icon :size="40" color="#67C23A"><User /></el-icon>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.totalUsers || 0 }}</div>
              <div class="stat-label">咨询用户</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 主内容区 -->
    <el-card class="main-content">
      <!-- Tab 切换 -->
      <el-tabs v-model="activeTab" class="content-tabs">
        <!-- 客服对话 -->
        <el-tab-pane label="客服对话" name="message">
      <el-row :gutter="20" style="height: 100%">
        <!-- 左侧用户列表 -->
        <el-col :span="6">
          <div class="user-list-container">
            <div class="user-list-header">
              <h3>用户列表</h3>
              <el-button text @click="loadUserList">
                <el-icon><Refresh /></el-icon>
              </el-button>
            </div>
            <el-scrollbar height="600px">
              <div
                v-for="user in userList"
                :key="user.userId"
                :class="['user-item', { active: selectedUserId === user.userId }]"
                @click="selectUser(user.userId)"
              >
                <el-avatar :src="user.avatar" :size="50">
                  {{ user.nickname?.charAt(0) }}
                </el-avatar>
                <div class="user-info">
                  <div class="user-name">
                    {{ user.nickname }}
                    <el-badge
                      v-if="user.unreadCount > 0"
                      :value="user.unreadCount"
                      class="unread-badge"
                    />
                  </div>
                  <div class="last-message">{{ user.lastMessage }}</div>
                </div>
              </div>
              <el-empty v-if="!userList.length" description="暂无咨询用户" />
            </el-scrollbar>
          </div>
        </el-col>

        <!-- 右侧消息区域 -->
        <el-col :span="18">
          <div v-if="selectedUserId" class="message-container">
            <!-- 消息列表 -->
            <el-scrollbar ref="messageScrollbar" height="500px" class="message-list">
              <div
                v-for="msg in messageList"
                :key="msg.id"
                :class="['message-item', msg.type === 1 ? 'user-msg' : 'service-msg']"
              >
                <div class="message-avatar">
                  <el-avatar :size="40">
                    {{ msg.type === 1 ? msg.userName?.charAt(0) : '客' }}
                  </el-avatar>
                </div>
                <div class="message-content">
                  <div class="message-info">
                    <span class="message-name">
                      {{ msg.type === 1 ? msg.userName : '客服' }}
                    </span>
                    <span class="message-time">{{ msg.createTime }}</span>
                  </div>
                  <div class="message-bubble">
                    {{ msg.content }}
                  </div>
                </div>
              </div>
            </el-scrollbar>

            <!-- 回复输入框 -->
            <div class="reply-box">
              <el-input
                v-model="replyContent"
                type="textarea"
                :rows="3"
                placeholder="请输入回复内容..."
                maxlength="500"
                show-word-limit
                @keydown.ctrl.enter="sendReply"
              />
              <div class="reply-actions">
                <el-button type="primary" :loading="sending" @click="sendReply">
                  发送 (Ctrl+Enter)
                </el-button>
              </div>
            </div>
          </div>
          <el-empty v-else description="请选择一个用户" />
        </el-col>
      </el-row>
        </el-tab-pane>

        <!-- FAQ 管理 -->
        <el-tab-pane label="FAQ 管理" name="faq">
          <div class="faq-management">
            <!-- 顶部操作栏 -->
            <div class="faq-toolbar">
              <el-input
                v-model="faqKeyword"
                placeholder="搜索问题或答案"
                clearable
                style="width: 300px"
                @clear="loadFaqList"
                @keyup.enter="loadFaqList"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <el-button type="primary" @click="openFaqDialog()">
                <el-icon><Plus /></el-icon>
                添加FAQ
              </el-button>
            </div>

            <!-- FAQ 表格 -->
            <el-table :data="faqList" border stripe>
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="question" label="问题" min-width="200" />
              <el-table-column prop="answer" label="答案" min-width="250" show-overflow-tooltip />
              <el-table-column prop="category" label="分类" width="120" />
              <el-table-column prop="sort" label="排序" width="80" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.status === 1 ? 'success' : 'info'">
                    {{ row.status === 1 ? '启用' : '禁用' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200" fixed="right">
                <template #default="{ row }">
                  <el-button link type="primary" @click="openFaqDialog(row)">
                    编辑
                  </el-button>
                  <el-button link type="danger" @click="handleDeleteFaq(row.id)">
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <el-pagination
              v-model:current-page="faqPage"
              v-model:page-size="faqPageSize"
              :total="faqTotal"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="loadFaqList"
              @current-change="loadFaqList"
              style="margin-top: 20px; justify-content: center"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- FAQ 编辑对话框 -->
    <el-dialog
      v-model="faqDialogVisible"
      :title="faqForm.id ? '编辑FAQ' : '添加FAQ'"
      width="600px"
    >
      <el-form :model="faqForm" :rules="faqRules" ref="faqFormRef" label-width="80px">
        <el-form-item label="问题" prop="question">
          <el-input v-model="faqForm.question" placeholder="请输入问题" />
        </el-form-item>
        <el-form-item label="答案" prop="answer">
          <el-input
            v-model="faqForm.answer"
            type="textarea"
            :rows="4"
            placeholder="请输入答案"
          />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-input v-model="faqForm.category" placeholder="例如：配送、支付等" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="faqForm.sort" :min="0" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="faqForm.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="faqDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveFaq" :loading="faqSaving">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch, onBeforeUnmount } from 'vue'
import { ElMessage, ElScrollbar, ElMessageBox } from 'element-plus'
import { ChatDotSquare, Bell, User, Refresh, Search, Plus } from '@element-plus/icons-vue'
import { getMessageList, replyMessage, getUserList, getStatistics } from '@/api/customerService'
import { getFaqList, createFaq, updateFaq, deleteFaq } from '@/api/faq'

// 统计数据
const statistics = ref({
  totalMessages: 0,
  unreadMessages: 0,
  totalUsers: 0
})

// 用户列表
const userList = ref<any[]>([])

// 选中的用户ID
const selectedUserId = ref<number | null>(null)

// 消息列表
const messageList = ref<any[]>([])

// 回复内容
const replyContent = ref('')

// 发送中
const sending = ref(false)

// 消息滚动条
const messageScrollbar = ref<InstanceType<typeof ElScrollbar>>()

// Tab 当前激活
const activeTab = ref('message')

// ====== FAQ 管理相关 ======
const faqKeyword = ref('')
const faqList = ref<any[]>([])
const faqPage = ref(1)
const faqPageSize = ref(10)
const faqTotal = ref(0)
const faqDialogVisible = ref(false)
const faqSaving = ref(false)
const faqFormRef = ref()
const faqForm = ref({
  id: null,
  question: '',
  answer: '',
  category: '',
  sort: 0,
  status: 1
})

const faqRules = {
  question: [{ required: true, message: '请输入问题', trigger: 'blur' }],
  answer: [{ required: true, message: '请输入答案', trigger: 'blur' }]
}

/**
 * 加载统计数据
 */
const loadStatistics = async () => {
  try {
    const { data } = await getStatistics()
    statistics.value = data
  } catch (error) {
    console.error('加载统计数据失败', error)
  }
}

/**
 * 加载用户列表
 */
const loadUserList = async () => {
  try {
    const { data } = await getUserList()
    userList.value = data || []
  } catch (error) {
    console.error('加载用户列表失败', error)
    ElMessage.error('加载用户列表失败')
  }
}

/**
 * 选择用户
 */
const selectUser = (userId: number) => {
  selectedUserId.value = userId
  loadMessageList()
}

/**
 * 加载消息列表
 */
const loadMessageList = async () => {
  if (!selectedUserId.value) return

  try {
    const { data } = await getMessageList({
      userId: selectedUserId.value,
      page: 1,
      pageSize: 100
    })
    messageList.value = data.records || []
    
    // 滚动到底部
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('加载消息列表失败', error)
    ElMessage.error('加载消息列表失败')
  }
}

/**
 * 发送回复
 */
const sendReply = async () => {
  if (!replyContent.value.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }

  if (!selectedUserId.value) {
    ElMessage.warning('请先选择用户')
    return
  }

  try {
    sending.value = true
    
    await replyMessage({
      userId: selectedUserId.value,
      content: replyContent.value.trim()
    })

    ElMessage.success('回复成功')
    replyContent.value = ''
    
    // 刷新消息列表
    await loadMessageList()
    
    // 刷新统计数据
    loadStatistics()
    
  } catch (error) {
    console.error('发送回复失败', error)
    ElMessage.error('发送回复失败')
  } finally {
    sending.value = false
  }
}

/**
 * 滚动到底部
 */
const scrollToBottom = () => {
  if (messageScrollbar.value) {
    const scrollEl = messageScrollbar.value.wrapRef
    if (scrollEl) {
      scrollEl.scrollTop = scrollEl.scrollHeight
    }
  }
}

/**
 * 自动刷新
 */
let refreshTimer: any = null

const startAutoRefresh = () => {
  refreshTimer = setInterval(() => {
    loadStatistics()
    loadUserList()
    if (selectedUserId.value) {
      loadMessageList()
    }
  }, 30000) // 30秒刷新一次
}

const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

onMounted(() => {
  loadStatistics()
  loadUserList()
  startAutoRefresh()
})

// 监听 Tab 切换
watch(activeTab, (newVal) => {
  if (newVal === 'faq') {
    loadFaqList()
  }
})

/**
 * 加载FAQ列表
 */
const loadFaqList = async () => {
  try {
    const { data } = await getFaqList({
      page: faqPage.value,
      pageSize: faqPageSize.value,
      keyword: faqKeyword.value
    })
    faqList.value = data.records || []
    faqTotal.value = data.total || 0
  } catch (error) {
    console.error('加载FAQ列表失败', error)
    ElMessage.error('加载FAQ列表失败')
  }
}

/**
 * 打开FAQ对话框
 */
const openFaqDialog = (row?: any) => {
  if (row) {
    // 编辑
    faqForm.value = {
      id: row.id,
      question: row.question,
      answer: row.answer,
      category: row.category || '',
      sort: row.sort || 0,
      status: row.status
    }
  } else {
    // 新增
    faqForm.value = {
      id: null,
      question: '',
      answer: '',
      category: '',
      sort: 0,
      status: 1
    }
  }
  faqDialogVisible.value = true
}

/**
 * 保存FAQ
 */
const handleSaveFaq = async () => {
  try {
    await faqFormRef.value.validate()
    faqSaving.value = true

    if (faqForm.value.id) {
      // 更新
      await updateFaq(faqForm.value.id, faqForm.value)
      ElMessage.success('更新成功')
    } else {
      // 创建
      await createFaq(faqForm.value)
      ElMessage.success('创建成功')
    }

    faqDialogVisible.value = false
    loadFaqList()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('保存FAQ失败', error)
      ElMessage.error('保存失败')
    }
  } finally {
    faqSaving.value = false
  }
}

/**
 * 删除FAQ
 */
const handleDeleteFaq = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这条FAQ吗？', '提示', {
      type: 'warning'
    })

    await deleteFaq(id)
    ElMessage.success('删除成功')
    loadFaqList()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除FAQ失败', error)
      ElMessage.error('删除失败')
    }
  }
}

// 组件卸载时清除定时器
onBeforeUnmount(() => {
  stopAutoRefresh()
})
</script>

<style scoped lang="scss">
.customer-service-container {
  padding: 20px;
}

.statistics {
  margin-bottom: 20px;

  .stat-item {
    display: flex;
    align-items: center;
    gap: 20px;

    .stat-content {
      flex: 1;

      .stat-value {
        font-size: 32px;
        font-weight: bold;
        color: #303133;
        margin-bottom: 5px;
      }

      .stat-label {
        font-size: 14px;
        color: #909399;
      }
    }
  }
}

.main-content {
  .user-list-container {
    height: 100%;

    .user-list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #eee;
      margin-bottom: 10px;

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
      }
    }

    .user-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 15px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background: #f5f7fa;
      }

      &.active {
        background: #ecf5ff;
        border-left: 3px solid #409eff;
      }

      .user-info {
        flex: 1;
        min-width: 0;

        .user-name {
          font-size: 14px;
          font-weight: 500;
          color: #303133;
          margin-bottom: 5px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .last-message {
          font-size: 12px;
          color: #909399;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }

  .message-container {
    display: flex;
    flex-direction: column;
    height: 100%;

    .message-list {
      flex: 1;
      padding: 20px;
      background: #f5f7fa;
      border-radius: 8px;
      margin-bottom: 20px;

      .message-item {
        display: flex;
        margin-bottom: 20px;
        animation: fadeIn 0.3s ease;

        &.service-msg {
          flex-direction: row-reverse;
        }

        .message-avatar {
          flex-shrink: 0;
        }

        .message-content {
          margin: 0 15px;
          max-width: 60%;

          .message-info {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 8px;

            .message-name {
              font-size: 12px;
              color: #909399;
            }

            .message-time {
              font-size: 12px;
              color: #c0c4cc;
            }
          }

          .message-bubble {
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 14px;
            line-height: 1.6;
            word-break: break-word;
          }
        }

        &.user-msg .message-bubble {
          background: #ffffff;
          color: #303133;
          border-top-left-radius: 4px;
        }

        &.service-msg {
          .message-content {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
          }

          .message-bubble {
            background: #409eff;
            color: #ffffff;
            border-top-right-radius: 4px;
          }
        }
      }
    }

    .reply-box {
      .reply-actions {
        margin-top: 10px;
        text-align: right;
      }
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// FAQ 管理样式
.content-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 20px;
  }
}

.faq-management {
  .faq-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
}
</style>
