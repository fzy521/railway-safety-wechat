<template>
  <div class="warning-page">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="预警级别">
          <el-select v-model="searchForm.warningLevel" placeholder="请选择" clearable>
            <el-option label="红" value="红" />
            <el-option label="橙" value="橙" />
            <el-option label="黄" value="黄" />
            <el-option label="蓝" value="蓝" />
          </el-select>
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option label="已下发" value="已下发" />
            <el-option label="整改中" value="整改中" />
            <el-option label="已验收" value="已验收" />
            <el-option label="已取消" value="已取消" />
          </el-select>
        </el-form-item>

        <el-form-item label="责任单位">
          <el-input
            v-model="searchForm.targetUnit"
            placeholder="请输入责任单位"
            clearable
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
        新建预警
      </el-button>
      <el-button type="warning" @click="handleAutoTrigger">
        <el-icon><Refresh /></el-icon>
        自动触发预警
      </el-button>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table :data="warningList" v-loading="loading" border stripe>
        <el-table-column type="index" label="序号" width="60" align="center" />

        <el-table-column label="预警级别" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getWarningType(row.warningLevel)" effect="dark">
              {{ row.warningLevel }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="warningTitle" label="预警标题" min-width="200" show-overflow-tooltip />

        <el-table-column prop="warningContent" label="预警内容" min-width="250" show-overflow-tooltip />

        <el-table-column prop="targetUnit" label="责任单位" width="120" />

        <el-table-column prop="deadline" label="截止日期" width="130">
          <template #default="{ row }">
            <span :class="{ 'overdue': isOverdue(row.deadline) }">
              {{ formatDate(row.deadline, 'YYYY-MM-DD') }}
            </span>
          </template>
        </el-table-column>

        <el-table-column prop="rectifyMeasures" label="整改措施" min-width="200" show-overflow-tooltip />

        <el-table-column prop="verificationResult" label="验收结果" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.verificationResult" :type="row.verificationResult === '通过' ? 'success' : 'danger'">
              {{ row.verificationResult }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">
              查看
            </el-button>
            <el-button
              v-if="row.status === '已下发' || row.status === '整改中'"
              type="primary"
              link
              size="small"
              @click="handleUpdateRectify(row)"
            >
              更新措施
            </el-button>
            <el-button
              v-if="row.status === '整改中'"
              type="success"
              link
              size="small"
              @click="handleSubmitVerify(row)"
            >
              提交验收
            </el-button>
            <el-button
              v-if="row.status === '待验证'"
              type="success"
              link
              size="small"
              @click="handleVerify(row)"
            >
              验证
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

    <!-- 新建预警对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="新建风险预警"
      width="700px"
      @close="handleDialogClose"
    >
      <el-form :model="warningForm" :rules="warningRules" ref="warningFormRef" label-width="120px">
        <el-form-item label="关联风险" prop="riskId">
          <el-select v-model="warningForm.riskId" placeholder="请选择风险" style="width: 100%">
            <el-option label="轨道连接螺栓松动" value="risk001" />
            <el-option label="信号设备老化" value="risk002" />
            <el-option label="作业人员疲劳" value="risk003" />
          </el-select>
        </el-form-item>

        <el-form-item label="预警级别" prop="warningLevel">
          <el-select v-model="warningForm.warningLevel" placeholder="请选择" style="width: 100%">
            <el-option label="红" value="红" />
            <el-option label="橙" value="橙" />
            <el-option label="黄" value="黄" />
            <el-option label="蓝" value="蓝" />
          </el-select>
        </el-form-item>

        <el-form-item label="预警内容" prop="warningContent">
          <el-input
            v-model="warningForm.warningContent"
            type="textarea"
            :rows="4"
            placeholder="请输入预警内容"
          />
        </el-form-item>

        <el-form-item label="整改要求" prop="requirements">
          <el-input
            v-model="warningForm.requirements"
            type="textarea"
            :rows="3"
            placeholder="请输入整改要求"
          />
        </el-form-item>

        <el-form-item label="责任单位" prop="targetUnit">
          <el-input v-model="warningForm.targetUnit" placeholder="请输入责任单位" />
        </el-form-item>

        <el-form-item label="完成时限" prop="deadline">
          <el-date-picker
            v-model="warningForm.deadline"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 更新整改措施对话框 -->
    <el-dialog
      v-model="rectifyDialogVisible"
      title="更新整改措施"
      width="600px"
    >
      <el-form :model="rectifyForm" ref="rectifyFormRef" label-width="120px">
        <el-form-item label="整改措施" prop="rectifyMeasures">
          <el-input
            v-model="rectifyForm.rectifyMeasures"
            type="textarea"
            :rows="5"
            placeholder="请输入整改措施"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="rectifyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleRectifySubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 验证对话框 -->
    <el-dialog
      v-model="verifyDialogVisible"
      title="预警验收"
      width="600px"
    >
      <el-form :model="verifyForm" ref="verifyFormRef" label-width="120px">
        <el-form-item label="验收结果" prop="verificationResult">
          <el-radio-group v-model="verifyForm.verificationResult">
            <el-radio label="通过">通过</el-radio>
            <el-radio label="不通过">不通过</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="验收人" prop="verificationPerson">
          <el-input v-model="verifyForm.verificationPerson" placeholder="请输入验收人" />
        </el-form-item>

        <el-form-item label="验收日期" prop="verificationDate">
          <el-date-picker
            v-model="verifyForm.verificationDate"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="verifyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleVerifySubmit">确定</el-button>
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
  Plus
} from '@element-plus/icons-vue'
import { riskWarning } from '@/api/cloud'
import { formatDate, isOverdue, getWarningLevelColor } from '@/utils'
import type { RiskWarning } from '@/types'

// 搜索表单
const searchForm = reactive({
  warningLevel: '',
  status: '',
  targetUnit: ''
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 预警列表
const warningList = ref<RiskWarning[]>([])
const loading = ref(false)

// 对话框
const dialogVisible = ref(false)
const rectifyDialogVisible = ref(false)
const verifyDialogVisible = ref(false)
const warningFormRef = ref<FormInstance>()
const rectifyFormRef = ref<FormInstance>()
const verifyFormRef = ref<FormInstance>()
const currentWarningId = ref('')

// 预警表单
const warningForm = reactive({
  riskId: '',
  warningLevel: '黄',
  warningContent: '',
  requirements: '',
  targetUnit: '',
  deadline: ''
})

// 整改表单
const rectifyForm = reactive({
  rectifyMeasures: ''
})

// 验证表单
const verifyForm = reactive({
  verificationResult: '通过',
  verificationPerson: '',
  verificationDate: ''
})

// 表单验证规则
const warningRules: FormRules = {
  riskId: [{ required: true, message: '请选择关联风险', trigger: 'change' }],
  warningLevel: [{ required: true, message: '请选择预警级别', trigger: 'change' }],
  warningContent: [{ required: true, message: '请输入预警内容', trigger: 'blur' }],
  targetUnit: [{ required: true, message: '请输入责任单位', trigger: 'blur' }],
  deadline: [{ required: true, message: '请选择完成时限', trigger: 'change' }]
}

// 获取预警类型
const getWarningType = (level: string) => {
  const types: Record<string, any> = {
    '红': 'danger',
    '橙': 'warning',
    '黄': 'primary',
    '蓝': 'info'
  }
  return types[level] || 'info'
}

// 获取状态类型
const getStatusType = (status: string) => {
  const types: Record<string, any> = {
    '已下发': 'warning',
    '整改中': 'primary',
    '待验证': 'info',
    '已验收': 'success',
    '已取消': 'info'
  }
  return types[status] || 'info'
}

// 加载预警列表
const loadWarningList = async () => {
  loading.value = true
  try {
    const result = await riskWarning({
      action: 'list',
      status: searchForm.status
    })
    warningList.value = result.data || []
    pagination.total = warningList.value.length
  } catch (error: any) {
    ElMessage.error(error.message || '加载预警列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadWarningList()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    warningLevel: '',
    status: '',
    targetUnit: ''
  })
  handleSearch()
}

// 新建预警
const handleAdd = () => {
  Object.assign(warningForm, {
    riskId: '',
    warningLevel: '黄',
    warningContent: '',
    requirements: '',
    targetUnit: '',
    deadline: ''
  })
  dialogVisible.value = true
}

// 自动触发预警
const handleAutoTrigger = async () => {
  try {
    await ElMessageBox.confirm('确定要自动触发预警吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const result = await riskWarning({ action: 'auto_trigger' })
    ElMessage.success(result.message || `自动触发${result.data.triggeredCount}条风险预警`)
    loadWarningList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '自动触发失败')
    }
  }
}

// 查看
const handleView = (row: RiskWarning) => {
  ElMessage.info('查看详情功能开发中')
}

// 更新整改措施
const handleUpdateRectify = (row: RiskWarning) => {
  currentWarningId.value = row._id
  Object.assign(rectifyForm, {
    rectifyMeasures: row.rectifyMeasures || ''
  })
  rectifyDialogVisible.value = true
}

// 提交整改措施
const handleRectifySubmit = async () => {
  if (!rectifyFormRef.value) return

  try {
    await riskWarning({
      action: 'update_rectify',
      warningId: currentWarningId.value,
      rectifyMeasures: rectifyForm.rectifyMeasures
    })
    ElMessage.success('整改措施已更新')
    rectifyDialogVisible.value = false
    loadWarningList()
  } catch (error: any) {
    ElMessage.error(error.message || '更新失败')
  }
}

// 提交验收申请
const handleSubmitVerify = async (row: RiskWarning) => {
  try {
    await ElMessageBox.confirm('确定要提交验收申请吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await riskWarning({
      action: 'submit_verify',
      warningId: row._id
    })
    ElMessage.success('验收申请已提交')
    loadWarningList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '提交失败')
    }
  }
}

// 验证
const handleVerify = (row: RiskWarning) => {
  currentWarningId.value = row._id
  Object.assign(verifyForm, {
    verificationResult: '通过',
    verificationPerson: '',
    verificationDate: ''
  })
  verifyDialogVisible.value = true
}

// 提交验证
const handleVerifySubmit = async () => {
  if (!verifyFormRef.value) return

  try {
    await riskWarning({
      action: 'verify',
      warningId: currentWarningId.value,
      verificationResult: verifyForm.verificationResult,
      verificationPerson: verifyForm.verificationPerson
    })
    ElMessage.success(`验证结果：${verifyForm.verificationResult}`)
    verifyDialogVisible.value = false
    loadWarningList()
  } catch (error: any) {
    ElMessage.error(error.message || '验证失败')
  }
}

// 提交新建预警
const handleSubmit = async () => {
  if (!warningFormRef.value) return

  await warningFormRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      await riskWarning({
        action: 'create',
        ...warningForm
      })
      ElMessage.success('风险预警已创建')
      dialogVisible.value = false
      loadWarningList()
    } catch (error: any) {
      ElMessage.error(error.message || '创建失败')
    }
  })
}

// 对话框关闭
const handleDialogClose = () => {
  warningFormRef.value?.resetFields()
}

// 分页变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadWarningList()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadWarningList()
}

// 初始化
loadWarningList()
</script>

<style scoped>
.warning-page {
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

.overdue {
  color: #f56c6c;
  font-weight: bold;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>