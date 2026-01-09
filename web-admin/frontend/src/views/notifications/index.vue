<template>
  <div class="notifications-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>消息通知</span>
          <div>
            <el-badge :value="unreadCount" :hidden="unreadCount === 0">
              <el-button @click="handleMarkAllRead" v-if="unreadCount > 0">全部已读</el-button>
            </el-badge>
          </div>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="全部" name="all">
          <NotificationList :notifications="notifications" :loading="loading" @refresh="loadNotifications" />
        </el-tab-pane>
        <el-tab-pane label="未读" name="unread">
          <NotificationList :notifications="unreadNotifications" :loading="loading" @refresh="loadNotifications" />
        </el-tab-pane>
        <el-tab-pane label="已读" name="read">
          <NotificationList :notifications="readNotifications" :loading="loading" @refresh="loadNotifications" />
        </el-tab-pane>
      </el-tabs>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
        class="pagination"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { callCloudFunction } from '@/api/cloud'
import NotificationList from './NotificationList.vue'

interface Notification {
  _id: string
  title: string
  content: string
  type: string
  priority: string
  isRead: boolean
  createdAt: Date
  readAt?: Date
}

const loading = ref(false)
const activeTab = ref('all')
const notifications = ref<Notification[]>([])
const unreadCount = ref(0)
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

const unreadNotifications = computed(() => notifications.value.filter(n => !n.isRead))
const readNotifications = computed(() => notifications.value.filter(n => n.isRead))

const loadNotifications = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.page,
      pageSize: pagination.pageSize
    }
    
    if (activeTab.value === 'unread') {
      params.isRead = false
    } else if (activeTab.value === 'read') {
      params.isRead = true
    }

    const result = await callCloudFunction('notification-management', { action: 'list', ...params })

    if (result.success) {
      notifications.value = result.data.list
      pagination.total = result.data.total
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载通知失败')
  } finally {
    loading.value = false
  }
}

const loadUnreadCount = async () => {
  try {
    const result = await callCloudFunction('notification-management', { action: 'unreadCount' })
    if (result.success) {
      unreadCount.value = result.data.count
    }
  } catch (error: any) {
    console.error('加载未读数量失败:', error)
  }
}

const handleMarkAllRead = async () => {
  try {
    const result = await callCloudFunction('notification-management', { action: 'markAllRead' })
    if (result.success) {
      ElMessage.success('已全部标记为已读')
      loadNotifications()
      loadUnreadCount()
    }
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  }
}

const handlePageChange = (page: number) => {
  pagination.page = page
  loadNotifications()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadNotifications()
}

onMounted(() => {
  loadNotifications()
  loadUnreadCount()
})
</script>

<style scoped lang="scss">
.notifications-page {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>