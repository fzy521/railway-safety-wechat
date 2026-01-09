<template>
  <div class="certificates-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>证书管理</span>
          <el-button type="primary" @click="handleAdd">新增证书</el-button>
        </div>
      </template>

      <el-table :data="certificates" v-loading="loading" border stripe>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="name" label="证书名称" min-width="150" />
        <el-table-column prop="type" label="证书类型" width="120" />
        <el-table-column prop="certificateNumber" label="证书编号" width="150" />
        <el-table-column prop="holder" label="持有人" width="120" />
        <el-table-column prop="expiryDate" label="到期日期" width="120">
          <template #default="{ row }">
            <span :class="{ 'expiring': isExpiring(row.expiryDate), 'expired': isExpired(row.expiryDate) }">
              {{ formatDate(row.expiryDate, 'YYYY-MM-DD') }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">查看</el-button>
            <el-button type="warning" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { callCloudFunction } from '@/api/cloud'
import { formatDate } from '@/utils'

interface Certificate {
  _id?: string
  name: string
  type: string
  certificateNumber: string
  holder: string
  expiryDate: Date
  status: string
}

const loading = ref(false)
const certificates = ref<Certificate[]>([])

const loadCertificates = async () => {
  loading.value = true
  try {
    const result = await callCloudFunction('certificate-management', { action: 'list' })
    if (result.success) {
      certificates.value = result.data.list
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载证书列表失败')
  } finally {
    loading.value = false
  }
}

const isExpiring = (date: Date) => {
  const now = new Date()
  const expiry = new Date(date)
  const days = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return days > 0 && days <= 30
}

const isExpired = (date: Date) => {
  return new Date(date) < new Date()
}

const getStatusType = (row: Certificate) => {
  if (isExpired(row.expiryDate)) return 'danger'
  if (isExpiring(row.expiryDate)) return 'warning'
  return 'success'
}

const handleAdd = () => ElMessage.info('新增证书功能开发中...')
const handleView = (row: Certificate) => ElMessage.info('查看证书详情功能开发中...')
const handleEdit = (row: Certificate) => ElMessage.info('编辑证书功能开发中...')
const handleDelete = (row: Certificate) => ElMessage.info('删除证书功能开发中...')

onMounted(() => {
  loadCertificates()
})
</script>

<style scoped lang="scss">
.certificates-page {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.expiring {
  color: #e6a23c;
  font-weight: bold;
}

.expired {
  color: #f56c6c;
  font-weight: bold;
}
</style>