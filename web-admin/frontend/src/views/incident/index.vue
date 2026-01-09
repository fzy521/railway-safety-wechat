<template>
  <div class="incident-page">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon total">
              <el-icon :size="40"><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.total }}</div>
              <div class="stat-label">事故总数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon month">
              <el-icon :size="40"><Calendar /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.thisMonth }}</div>
              <div class="stat-label">本月事故</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon processing">
              <el-icon :size="40"><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.byStatus['处理中'] || 0 }}</div>
              <div class="stat-label">处理中</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon resolved">
              <el-icon :size="40"><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.byStatus['已处理'] || 0 }}</div>
              <div class="stat-label">已处理</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="事故类型">
          <el-select v-model="searchForm.type" placeholder="请选择" clearable>
            <el-option label="行车事故" value="traffic" />
            <el-option label="设备故障" value="equipment" />
            <el-option label="操作事故" value="operation" />
            <el-option label="环境因素" value="environment" />
          </el-select>
        </el-form-item>

        <el-form-item label="事故等级">
          <el-select v-model="searchForm.level" placeholder="请选择" clearable>
            <el-option label="特别重大" value="critical" />
            <el-option label="重大" value="major" />
            <el-option label="较大" value="medium" />
            <el-option label="一般" value="low" />
          </el-select>
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option label="待处理" value="待处理" />
            <el-option label="处理中" value="处理中" />
            <el-option label="已处理" value="已处理" />
            <el-option label="已结案" value="已结案" />
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
        新增事故
      </el-button>
      <el-button type="success" @click="handleExport">
        <el-icon><Download /></el-icon>
        导出数据
      </el-button>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table :data="incidentList" v-loading="loading" border stripe>
        <el-table-column type="index" label="序号" width="60" align="center" />

        <el-table-column prop="title" label="事故标题" min-width="200" show-overflow-tooltip />

        <el-table-column label="事故类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="事故等级" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getLevelTagType(row.level)" effect="dark">
              {{ getLevelLabel(row.level) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="location" label="发生地点" width="150" show-overflow-tooltip />

        <el-table-column prop="reporter" label="报告人" width="100" />

        <el-table-column prop="incidentDate" label="发生日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.incidentDate, 'YYYY-MM-DD') }}
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">
              查看
            </el-button>
            <el-button type="warning" link size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
        class="pagination"
      />
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form :model="incidentForm" :rules="formRules" ref="formRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="事故标题" prop="title">
              <el-input v-model="incidentForm.title" placeholder="请输入事故标题" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="事故类型" prop="type">
              <el-select v-model="incidentForm.type" placeholder="请选择" style="width: 100%">
                <el-option label="行车事故" value="traffic" />
                <el-option label="设备故障" value="equipment" />
                <el-option label="操作事故" value="operation" />
                <el-option label="环境因素" value="environment" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="事故等级" prop="level">
              <el-select v-model="incidentForm.level" placeholder="请选择" style="width: 100%">
                <el-option label="一般" value="low" />
                <el-option label="较大" value="medium" />
                <el-option label="重大" value="major" />
                <el-option label="特别重大" value="critical" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="发生地点" prop="location">
              <el-input v-model="incidentForm.location" placeholder="请输入发生地点" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="发生日期" prop="incidentDate">
              <el-date-picker
                v-model="incidentForm.incidentDate"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="发生时间" prop="incidentTime">
              <el-time-picker
                v-model="incidentForm.incidentTime"
                placeholder="选择时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="报告人" prop="reporter">
          <el-input v-model="incidentForm.reporter" placeholder="请输入报告人" />
        </el-form-item>

        <el-form-item label="事故描述" prop="description">
          <el-input
            v-model="incidentForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入事故描述"
          />
        </el-form-item>

        <el-form-item label="事故原因" prop="causes">
          <el-input
            v-model="incidentForm.causes"
            type="textarea"
            :rows="3"
            placeholder="请输入事故原因"
          />
        </el-form-item>

        <el-form-item label="处理措施" prop="measures">
          <el-input
            v-model="incidentForm.measures"
            type="textarea"
            :rows="3"
            placeholder="请输入处理措施"
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-select v-model="incidentForm.status" placeholder="请选择" style="width: 100%">
            <el-option label="待处理" value="待处理" />
            <el-option label="处理中" value="处理中" />
            <el-option label="已处理" value="已处理" />
            <el-option label="已结案" value="已结案" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Warning,
  Calendar,
  Clock,
  CircleCheck,
  Search,
  Refresh,
  Plus,
  Download
} from '@element-plus/icons-vue'
import { callCloudFunction } from '@/api/cloud'
import { formatDate } from '@/utils'

interface Incident {
  _id?: string
  title: string
  type: string
  level: string
  description: string
  location: string
  reporter: string
  incidentDate: Date
  incidentTime: string
  causes: string
  measures: string
  status: string
}

const loading = ref(false)
const incidentList = ref<Incident[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref()

const statistics = reactive({
  total: 0,
  thisMonth: 0,
  thisWeek: 0,
  today: 0,
  byType: {},
  byLevel: {},
  byStatus: {}
})

const searchForm = reactive({
  type: '',
  level: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

const incidentForm = reactive<Incident>({
  _id: '',
  title: '',
  type: '',
  level: '',
  description: '',
  location: '',
  reporter: '',
  incidentDate: new Date(),
  incidentTime: '',
  causes: '',
  measures: '',
  status: '待处理'
})

const formRules = {
  title: [{ required: true, message: '请输入事故标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择事故类型', trigger: 'change' }],
  level: [{ required: true, message: '请选择事故等级', trigger: 'change' }],
  location: [{ required: true, message: '请输入发生地点', trigger: 'blur' }],
  reporter: [{ required: true, message: '请输入报告人', trigger: 'blur' }],
  description: [{ required: true, message: '请输入事故描述', trigger: 'blur' }]
}

// 加载事故列表
const loadIncidentList = async () => {
  loading.value = true
  try {
    const result = await callCloudFunction('incident-management', {
      action: 'list',
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm
    })

    if (result.success) {
      incidentList.value = result.data.list
      pagination.total = result.data.total
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载事故列表失败')
  } finally {
    loading.value = false
  }
}

// 加载统计数据
const loadStatistics = async () => {
  try {
    const result = await callCloudFunction('incident-management', { action: 'statistics' })

    if (result.success) {
      Object.assign(statistics, result.data)
    }
  } catch (error: any) {
    console.error('加载统计数据失败:', error)
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadIncidentList()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    type: '',
    level: '',
    status: ''
  })
  handleSearch()
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增事故'
  Object.assign(incidentForm, {
    _id: '',
    title: '',
    type: '',
    level: '',
    description: '',
    location: '',
    reporter: '',
    incidentDate: new Date(),
    incidentTime: '',
    causes: '',
    measures: '',
    status: '待处理'
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: Incident) => {
  dialogTitle.value = '编辑事故'
  Object.assign(incidentForm, row)
  dialogVisible.value = true
}

// 查看
const handleView = (row: Incident) => {
  ElMessageBox.alert(
    `
    <div style="line-height: 2;">
      <strong>事故标题:</strong> ${row.title}<br>
      <strong>事故类型:</strong> ${getTypeLabel(row.type)}<br>
      <strong>事故等级:</strong> ${getLevelLabel(row.level)}<br>
      <strong>发生地点:</strong> ${row.location}<br>
      <strong>报告人:</strong> ${row.reporter}<br>
      <strong>发生日期:</strong> ${formatDate(row.incidentDate, 'YYYY-MM-DD')}<br>
      <strong>发生时间:</strong> ${row.incidentTime}<br>
      <strong>事故描述:</strong> ${row.description}<br>
      <strong>事故原因:</strong> ${row.causes || '无'}<br>
      <strong>处理措施:</strong> ${row.measures || '无'}<br>
      <strong>状态:</strong> ${row.status}
    </div>
    `,
    '事故详情',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '关闭'
    }
  )
}

// 删除
const handleDelete = (row: Incident) => {
  ElMessageBox.confirm('确定要删除这条事故记录吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const result = await callCloudFunction('incident-management', {
        action: 'delete',
        incidentId: row._id
      })

      if (result.success) {
        ElMessage.success('删除成功')
        loadIncidentList()
        loadStatistics()
      }
    } catch (error: any) {
      ElMessage.error(error.message || '删除失败')
    }
  }).catch(() => {})
}

// 提交表单
const handleSubmit = async () => {
  await formRef.value.validate()

  try {
    const data = {
      ...incidentForm,
      incidentDate: incidentForm.incidentDate.toISOString().split('T')[0],
      incidentTime: incidentForm.incidentTime || ''
    }

    const action = incidentForm._id ? 'update' : 'create'
    const params = incidentForm._id
      ? { action, incidentId: incidentForm._id, ...data }
      : { action, ...data }

    const result = await callCloudFunction('incident-management', params)

    if (result.success) {
      ElMessage.success(incidentForm._id ? '更新成功' : '创建成功')
      dialogVisible.value = false
      loadIncidentList()
      loadStatistics()
    }
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  }
}

// 导出
const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

// 分页
const handlePageChange = (page: number) => {
  pagination.page = page
  loadIncidentList()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadIncidentList()
}

// 辅助函数
const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    traffic: '行车事故',
    equipment: '设备故障',
    operation: '操作事故',
    environment: '环境因素'
  }
  return labels[type] || type
}

const getLevelLabel = (level: string) => {
  const labels: Record<string, string> = {
    low: '一般',
    medium: '较大',
    major: '重大',
    critical: '特别重大'
  }
  return labels[level] || level
}

const getTypeTagType = (type: string) => {
  const types: Record<string, any> = {
    traffic: 'danger',
    equipment: 'warning',
    operation: 'info',
    environment: 'success'
  }
  return types[type] || ''
}

const getLevelTagType = (level: string) => {
  const levels: Record<string, any> = {
    low: 'info',
    medium: 'warning',
    major: 'danger',
    critical: 'danger'
  }
  return levels[level] || ''
}

const getStatusTagType = (status: string) => {
  const types: Record<string, any> = {
    '待处理': 'warning',
    '处理中': 'primary',
    '已处理': 'success',
    '已结案': 'info'
  }
  return types[status] || ''
}

onMounted(() => {
  loadIncidentList()
  loadStatistics()
})
</script>

<style scoped lang="scss">
.incident-page {
  padding: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  .stat-content {
    display: flex;
    align-items: center;
    gap: 20px;

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;

      &.total {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      &.month {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
      }

      &.processing {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        color: white;
      }

      &.resolved {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        color: white;
      }
    }

    .stat-info {
      flex: 1;

      .stat-value {
        font-size: 28px;
        font-weight: bold;
        color: #303133;
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: 14px;
        color: #909399;
      }
    }
  }
}

.search-card,
.operation-card,
.table-card {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>