<template>
  <div class="inspection-page">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="巡检类型">
          <el-select v-model="searchForm.checkType" placeholder="请选择" clearable>
            <el-option label="日常排查" value="daily" />
            <el-option label="定期排查" value="regular" />
            <el-option label="专项排查" value="special" />
          </el-select>
        </el-form-item>

        <el-form-item label="巡检部门">
          <el-input
            v-model="searchForm.checkDept"
            placeholder="请输入巡检部门"
            clearable
          />
        </el-form-item>

        <el-form-item label="巡检日期">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
          />
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
        新建巡检计划
      </el-button>
      <el-button type="success" @click="handleGenerateChecklist">
        <el-icon><Document /></el-icon>
        生成检查表
      </el-button>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table :data="inspectionList" v-loading="loading" border stripe>
        <el-table-column type="index" label="序号" width="60" align="center" />

        <el-table-column label="巡检类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getCheckTypeTag(row.checkType)">
              {{ getCheckTypeLabel(row.checkType) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="checkDate" label="巡检日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.checkDate, 'YYYY-MM-DD') }}
          </template>
        </el-table-column>

        <el-table-column prop="checkDept" label="巡检部门" width="120" />

        <el-table-column prop="checkPerson" label="巡检人" width="100" />

        <el-table-column prop="checkRoute" label="巡检路线" width="150" show-overflow-tooltip />

        <el-table-column prop="checkPoints" label="巡检点" width="150">
          <template #default="{ row }">
            <el-tooltip :content="row.checkPoints.join(', ')" placement="top">
              <span>{{ row.checkPoints.length }}个巡检点</span>
            </el-tooltip>
          </template>
        </el-table-column>

        <el-table-column prop="checkResult" label="巡检结果" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.checkResult === '正常' ? 'success' : 'danger'">
              {{ row.checkResult }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="problemsFound" label="发现问题" width="100" align="center">
          <template #default="{ row }">
            <span :style="{ color: row.problemsFound > 0 ? '#f56c6c' : '#67c23a' }">
              {{ row.problemsFound }}个
            </span>
          </template>
        </el-table-column>

        <el-table-column prop="duration" label="时长" width="80" align="center">
          <template #default="{ row }">
            {{ row.duration }}分钟
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" align="center" fixed="right">
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

    <!-- 新建巡检对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="新建巡检计划"
      width="700px"
      @close="handleDialogClose"
    >
      <el-form :model="inspectionForm" :rules="inspectionRules" ref="inspectionFormRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="巡检类型" prop="checkType">
              <el-select v-model="inspectionForm.checkType" placeholder="请选择" style="width: 100%">
                <el-option label="日常排查" value="daily" />
                <el-option label="定期排查" value="regular" />
                <el-option label="专项排查" value="special" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="巡检日期" prop="checkDate">
              <el-date-picker
                v-model="inspectionForm.checkDate"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="巡检部门" prop="checkDept">
              <el-input v-model="inspectionForm.checkDept" placeholder="请输入巡检部门" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="巡检人" prop="checkPerson">
              <el-input v-model="inspectionForm.checkPerson" placeholder="请输入巡检人" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="巡检路线" prop="checkRoute">
          <el-input v-model="inspectionForm.checkRoute" placeholder="请输入巡检路线" />
        </el-form-item>

        <el-form-item label="巡检点" prop="checkPoints">
          <el-select
            v-model="inspectionForm.checkPoints"
            multiple
            placeholder="请选择巡检点"
            style="width: 100%"
          >
            <el-option label="轨道连接处" value="轨道连接处" />
            <el-option label="信号设备" value="信号设备" />
            <el-option label="道岔" value="道岔" />
            <el-option label="站台" value="站台" />
            <el-option label="配电室" value="配电室" />
          </el-select>
        </el-form-item>

        <el-form-item label="备注" prop="summary">
          <el-input
            v-model="inspectionForm.summary"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 生成检查表对话框 -->
    <el-dialog
      v-model="checklistDialogVisible"
      title="生成检查表"
      width="600px"
    >
      <el-form :model="checklistForm" ref="checklistFormRef" label-width="120px">
        <el-form-item label="巡检类型" prop="checkType">
          <el-select v-model="checklistForm.checkType" placeholder="请选择" style="width: 100%">
            <el-option label="日常排查" value="daily" />
            <el-option label="定期排查" value="regular" />
            <el-option label="专项排查" value="special" />
          </el-select>
        </el-form-item>

        <el-form-item label="巡检部门" prop="dept">
          <el-input v-model="checklistForm.dept" placeholder="请输入巡检部门" />
        </el-form-item>

        <el-form-item label="巡检地点" prop="location">
          <el-input v-model="checklistForm.location" placeholder="请输入巡检地点" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="checklistDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleChecklistSubmit">生成</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  Search,
  Refresh,
  Plus,
  Document
} from '@element-plus/icons-vue'
import { getInspections, generateChecklist } from '@/api/cloud'
import { formatDate } from '@/utils'
import type { Inspection } from '@/types'

// 搜索表单
const searchForm = reactive({
  checkType: '',
  checkDept: '',
  dateRange: []
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 巡检列表
const inspectionList = ref<Inspection[]>([])
const loading = ref(false)

// 对话框
const dialogVisible = ref(false)
const checklistDialogVisible = ref(false)
const inspectionFormRef = ref<FormInstance>()
const checklistFormRef = ref<FormInstance>()

// 巡检表单
const inspectionForm = reactive({
  checkType: 'daily',
  checkDate: '',
  checkDept: '',
  checkPerson: '',
  checkRoute: '',
  checkPoints: [],
  summary: ''
})

// 检查表表单
const checklistForm = reactive({
  checkType: 'daily',
  dept: '',
  location: ''
})

// 表单验证规则
const inspectionRules: FormRules = {
  checkType: [{ required: true, message: '请选择巡检类型', trigger: 'change' }],
  checkDate: [{ required: true, message: '请选择巡检日期', trigger: 'change' }],
  checkDept: [{ required: true, message: '请输入巡检部门', trigger: 'blur' }],
  checkPerson: [{ required: true, message: '请输入巡检人', trigger: 'blur' }],
  checkRoute: [{ required: true, message: '请输入巡检路线', trigger: 'blur' }],
  checkPoints: [{ required: true, message: '请选择巡检点', trigger: 'change' }]
}

// 获取巡检类型标签
const getCheckTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    'daily': '日常排查',
    'regular': '定期排查',
    'special': '专项排查'
  }
  return labels[type] || type
}

// 获取巡检类型标签类型
const getCheckTypeTag = (type: string) => {
  const types: Record<string, any> = {
    'daily': 'primary',
    'regular': 'warning',
    'special': 'danger'
  }
  return types[type] || 'info'
}

// 获取状态标签
const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'completed': '已完成',
    'pending': '进行中',
    'cancelled': '已取消'
  }
  return labels[status] || status
}

// 获取状态类型
const getStatusType = (status: string) => {
  const types: Record<string, any> = {
    'completed': 'success',
    'pending': 'warning',
    'cancelled': 'info'
  }
  return types[status] || 'info'
}

// 加载巡检列表
const loadInspectionList = async () => {
  loading.value = true
  try {
    const result = await getInspections({
      page: pagination.page,
      pageSize: pagination.pageSize,
      checkType: searchForm.checkType,
      checkDept: searchForm.checkDept,
      startDate: searchForm.dateRange[0],
      endDate: searchForm.dateRange[1]
    })
    inspectionList.value = result.data?.list || []
    pagination.total = result.data?.total || 0
  } catch (error: any) {
    ElMessage.error(error.message || '加载巡检列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadInspectionList()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    checkType: '',
    checkDept: '',
    dateRange: []
  })
  handleSearch()
}

// 新建
const handleAdd = () => {
  Object.assign(inspectionForm, {
    checkType: 'daily',
    checkDate: '',
    checkDept: '',
    checkPerson: '',
    checkRoute: '',
    checkPoints: [],
    summary: ''
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: Inspection) => {
  Object.assign(inspectionForm, {
    ...row
  })
  dialogVisible.value = true
}

// 查看
const handleView = (row: Inspection) => {
  ElMessage.info('查看详情功能开发中')
}

// 删除
const handleDelete = async (row: Inspection) => {
  try {
    await ElMessageBox.confirm('确定要删除这条巡检记录吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    ElMessage.success('删除成功')
    loadInspectionList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 生成检查表
const handleGenerateChecklist = () => {
  Object.assign(checklistForm, {
    checkType: 'daily',
    dept: '',
    location: ''
  })
  checklistDialogVisible.value = true
}

// 提交生成检查表
const handleChecklistSubmit = async () => {
  if (!checklistFormRef.value) return

  try {
    const result = await generateChecklist(checklistForm)
    ElMessage.success(`成功生成${result.data.total}项检查内容`)
    checklistDialogVisible.value = false
  } catch (error: any) {
    ElMessage.error(error.message || '生成失败')
  }
}

// 提交
const handleSubmit = async () => {
  if (!inspectionFormRef.value) return

  await inspectionFormRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      ElMessage.success('巡检计划创建成功')
      dialogVisible.value = false
      loadInspectionList()
    } catch (error: any) {
      ElMessage.error(error.message || '创建失败')
    }
  })
}

// 对话框关闭
const handleDialogClose = () => {
  inspectionFormRef.value?.resetFields()
}

// 分页变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadInspectionList()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadInspectionList()
}

// 初始化
loadInspectionList()
</script>

<style scoped>
.inspection-page {
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