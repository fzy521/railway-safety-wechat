<template>
  <div class="notification-list">
    <el-empty v-if="notifications.length === 0" description="暂无通知" />
    <div v-else class="notification-items">
      <div
        v-for="item in notifications"
        :key="item._id"
        class="notification-item"
        :class="{ unread: !item.isRead }"
      >
        <div class="notification-icon">
          <el-icon v-if="item.type === 'warning'" color="#e6a23c"><Warning /></el-icon>
          <el-icon v-else-if="item.type === 'danger'" color="#f56c6c"><CircleClose /></el-icon>
          <el-icon v-else-if="item.type === 'success'" color="#67c23a"><CircleCheck /></el-icon>
          <el-icon v-else color="#409eff"><Bell /></el-icon>
        </div>
        <div class="notification-content">
          <div class="notification-title">{{ item.title }}</div>
          <div class="notification-text">{{ item.content }}</div>
          <div class="notification-time">{{ formatTime(item.createdAt) }}</div>
        </div>
        <div class="notification-actions">
          <el-button
            v-if="!item.isRead"
            type="primary"
            link
            size="small"
            @click="handleMarkRead(item._id)"
          >
            标记已读
          </el-button>
          <el-button type="danger" link size="small" @click="handleDelete(item._id)">
            删除
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Warning, CircleClose, CircleCheck, Bell } from '@element-plus/icons-vue'
import { callCloudFunction } from '@/api/cloud'

const props = defineProps<{
  notifications: any[]
  loading: boolean
}>()

const emit = defineEmits(['refresh'])

const formatTime = (date: Date) => {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  
  return d.toLocaleDateString('zh-CN')
}

const handleMarkRead = async (id: string) => {
  try {
    const result = await callCloudFunction('notification-management', { action: 'markRead', notificationId: id })
    if (result.success) {
      emit('refresh')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  }
}

const handleDelete = async (id: string) => {
  ElMessageBox.confirm('确定要删除这条通知吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const result = await callCloudFunction('notification-management', { action: 'delete', notificationId: id })
      if (result.success) {
        ElMessage.success('删除成功')
        emit('refresh')
      }
    } catch (error: any) {
      ElMessage.error(error.message || '删除失败')
    }
  }).catch(() => {})
}
</script>

<style scoped lang="scss">
.notification-list {
  .notification-items {
    .notification-item {
      display: flex;
      align-items: flex-start;
      padding: 16px;
      border-bottom: 1px solid #ebeef5;
      transition: background-color 0.3s;

      &:hover {
        background-color: #f5f7fa;
      }

      &.unread {
        background-color: #f0f9ff;
      }

      &:last-child {
        border-bottom: none;
      }

      .notification-icon {
        margin-right: 16px;
        font-size: 24px;
      }

      .notification-content {
        flex: 1;

        .notification-title {
          font-weight: bold;
          margin-bottom: 8px;
          color: #303133;
        }

        .notification-text {
          color: #606266;
          margin-bottom: 8px;
          line-height: 1.5;
        }

        .notification-time {
          font-size: 12px;
          color: #909399;
        }
      }

      .notification-actions {
        display: flex;
        gap: 8px;
      }
    }
  }
}
</style>