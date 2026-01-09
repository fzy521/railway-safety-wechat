<template>
  <div class="emergency-page">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="预案名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入预案名称"
            clearable
          />
        </el-form-item>

        <el-form-item label="预案类型">
          <el-select v-model="searchForm.type" placeholder="请选择" clearable>
            <el-option label="综合应急预案" value="comprehensive" />
            <el-option label="专项应急预案" value="special" />
            <el-option label="现场处置方案" value="field" />
          </el-select>
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option label="已发布" value="active" />
            <el-option label="草稿" value="draft" />
            <el-option label="已归档" value="archived" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作栏 -->
    <el-card class="operation-card">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增预案
      </el-button>
      <el-button type="success" @click="handleExport">
        <el-icon><Download /></el-icon>
        导出数据
      </el-button>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table :data="planList" v-loading="loading" border stripe>
        <el-table-column type="index" label="序号" width="60" align="center" />

        <el-table-column prop="id" label="预案编号" width="120" />

        <el-table-column prop="name" label="预案名称" min-width="200" show-overflow-tooltip />

        <el-table-column label="预案类型" width="120">
          <template #default="{ row }">
            <el-tag>{{ row.typeName }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="version" label="版本" width="80" align="center" />

        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.statusText }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="approvalDept" label="审批部门" width="120" />

        <el-table-column prop="drillFrequency" label="演练频次" width="100" />

        <el-table-column prop="lastReviewDate" label="上次评审" width="120">
          <template #default="{ row }">
            {{ formatDate(row.lastReviewDate, 'YYYY-MM-DD') }}
          </template>
        </el-table-column>

        <el-table-column prop="nextReviewDate" label="下次评审" width="120">
          <template #default="{ row }">
            {{ formatDate(row.nextReviewDate, 'YYYY-MM-DD') }}
          </template>
        </el-table-column>

        <el-table-column label="文档数量" width="100" align="center">
          <template #default="{ row }">
            <el-badge :value="row.pdfFiles?.length || 0" type="primary" />
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">
              查看
            </el-button>
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <PlanDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      :plan="currentPlan"
      @success="loadPlanList"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  Plus,
  Download
} from '@element-plus/icons-vue'
import { getEmergencyPlans, deleteEmergencyPlan } from '@/api/emergency'
import { formatDate, exportToCSV } from '@/utils'
import type { EmergencyPlan } from '@/api/emergency'
import PlanDialog from './PlanDialog.vue'

// 搜索表单
const searchForm = reactive({
  name: '',
  type: '',
  status: ''
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 预案列表
const planList = ref<EmergencyPlan[]>([])
const loading = ref(false)

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('新增预案')
const currentPlan = ref<EmergencyPlan | null>(null)

// 获取状态标签类型
const getStatusType = (status: string) => {
  const types: Record<string, any> = {
    active: 'success',
    draft: 'warning',
    archived: 'info'
  }
  return types[status] || 'info'
}

// 加载预案列表
const loadPlanList = async () => {
  loading.value = true
  try {
    const result = await getEmergencyPlans({
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm
    })
    planList.value = result.list
    pagination.total = result.total
  } catch (error: any) {
    ElMessage.error(error.message || '加载预案列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadPlanList()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    name: '',
    type: '',
    status: ''
  })
  handleSearch()
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增预案'
  currentPlan.value = null
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: EmergencyPlan) => {
  dialogTitle.value = '编辑预案'
  currentPlan.value = { ...row }
  dialogVisible.value = true
}

// 查看
const handleView = (row: EmergencyPlan) => {
  dialogTitle.value = '查看预案'
  currentPlan.value = { ...row }
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row: EmergencyPlan) => {
  try {
    await ElMessageBox.confirm(`确定要删除预案"${row.name}"吗?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteEmergencyPlan(row._id || row.id)
    ElMessage.success('删除成功')
    loadPlanList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 导出
const handleExport = () => {
  exportToCSV(planList.value, `应急预案列表_${formatDate(new Date(), 'YYYYMMDD')}.csv`)
}

// 分页变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadPlanList()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadPlanList()
}

// 初始化
loadPlanList()
</script>

<style scoped>
.emergency-page {
  padding: 20px;
}

.search-card,
.operation-card,
.table-card {
  margin-bottom: 20px;
}

.search-form {
  margin-bottom: 0;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>