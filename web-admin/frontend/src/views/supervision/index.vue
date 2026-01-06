<template>
  <div class="supervision-page">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon major">
              <el-icon :size="40"><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.majorCount }}</div>
              <div class="stat-label">重大隐患</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon supervising">
              <el-icon :size="40"><Files /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.supervisingCount }}</div>
              <div class="stat-label">督办中</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon completed">
              <el-icon :size="40"><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.completedCount }}</div>
              <div class="stat-label">已完成</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon overdue">
              <el-icon :size="40"><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.overdueCount }}</div>
              <div class="stat-label">超期未完成</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="督办级别">
          <el-select v-model="searchForm.supervisionLevel" placeholder="请选择" clearable>
            <el-option label="公司级" value="公司级" />
            <el-option label="部门级" value="部门级" />
          </el-select>
        </el-form-item>

        <el-form-item label="督办状态">
          <el-select v-model="searchForm.supervisionStatus" placeholder="请选择" clearable>
            <el-option label="督办中" value="督办中" />
            <el-option label="已完成" value="已完成" />
            <el-option label="已销号" value="已销号" />
          </el-select>
        </el-form-item>

        <el-form-item label="责任单位">
          <el-input
            v-model="searchForm.responsibleDept"
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
      <el-button type="primary" @click="handleIdentify">
        <el-icon><Plus /></el-icon>
        识别重大隐患
      </el-button>
      <el-button type="warning" @click="handleCheckOverdue">
        <el-icon><Warning /></el-icon>
        检查超期隐患
      </el-button>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table :data="supervisionList" v-loading="loading" border stripe>
        <el-table-column type="index" label="序号" width="60" align="center" />

        <el-table-column label="隐患描述" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <el-tag v-if="row.isMajorDanger" type="danger" size="small">重大</el-tag>
            {{ row.dangerDescription }}
          </template>
        </el-table-column>

        <el-table-column prop="dangerLocation" label="隐患地点" width="150" show-overflow-tooltip />

        <el-table-column prop="responsibleDept" label="责任单位" width="120" />

        <el-table-column prop="responsiblePerson" label="责任人" width="100" />

        <el-table-column label="督办级别" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.isSupervised" type="danger" effect="dark">
              {{ row.supervisionLevel }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <el-table-column prop="plannedCompleteDate" label="计划完成日期" width="130">
          <template #default="{ row }">
            <span :class="{ 'overdue': isOverdue(row.plannedCompleteDate) }">
              {{ formatDate(row.plannedCompleteDate, 'YYYY-MM-DD') }}
            </span>
          </template>
        </el-table-column>

        <el-table-column prop="progress" label="治理进度" width="120">
          <template #default="{ row }">
            <el-progress :percentage="row.progress || 0" :color="getProgressColor(row.progress)" />
          </template>
        </el-table-column>

        <el-table-column label="督办状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getSupervisionStatusType(row.supervisionStatus)">
              {{ row.supervisionStatus }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">
              查看
            </el-button>
            <el-button
              v-if="row.supervisionStatus === '督办中'"
              type="primary"
              link
              size="small"
              @click="handleUpdateProgress(row)"
            >
              更新进展
            </el-button>
            <el-button
              v-if="row.supervisionStatus === '督办中'"
              type="success"
              link
              size="small"
              @click="handleSubmitVerification(row)"
            >
              提交验证
            </el-button>
            <el-button
              v-if="row.supervisionStatus === '待验证'"
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

    <!-- 识别重大隐患对话框 -->
    <el-dialog
      v-model="identifyDialogVisible"
      title="识别重大隐患"
      width="600px"
    >
      <el-form :model="identifyForm" ref="identifyFormRef" label-width="120px">
        <el-form-item label="选择隐患" prop="dangerId">
          <el-select v-model="identifyForm.dangerId" placeholder="请选择隐患" style="width: 100%">
            <el-option label="轨道连接螺栓松动" value="danger001" />
            <el-option label="信号设备老化" value="danger002" />
          </el-select>
        </el-form-item>

        <el-form-item label="督办级别" prop="supervisionLevel">
          <el-select v-model="identifyForm.supervisionLevel" placeholder="请选择" style="width: 100%">
            <el-option label="公司级" value="公司级" />
            <el-option label="部门级" value="部门级" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="identifyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleIdentifySubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 更新进展对话框 -->
    <el-dialog
      v-model="progressDialogVisible"
      title="更新治理进展"
      width="600px"
    >
      <el-form :model="progressForm" ref="progressFormRef" label-width="120px">
        <el-form-item label="治理进度" prop="progress">
          <el-slider v-model="progressForm.progress" :marks="progressMarks" />
        </el-form-item>

        <el-form-item label="当前措施" prop="measures">
          <el-input
            v-model="progressForm.measures"
            type="textarea"
            :rows="4"
            placeholder="请输入当前采取的措施"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="progressDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleProgressSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 验证对话框 -->
    <el-dialog
      v-model="verifyDialogVisible"
      title="隐患治理验收"
      width="600px"
    >
      <el-form :model="verifyForm" ref="verifyFormRef" label-width="120px">
        <el-form-item label="验证结果" prop="verificationResult">
          <el-radio-group v-model="verifyForm.verificationResult">
            <el-radio label="合格">合格</el-radio>
            <el-radio label="不合格">不合格</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="验证人" prop="verificationPerson">
          <el-input v-model="verifyForm.verificationPerson" placeholder="请输入验证人" />
        </el-form-item>

        <el-form-item label="验证日期" prop="verificationDate">
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
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import {
  Search,
  Refresh,
  Plus,
  Warning,
  Files,
  CircleCheck,
  Clock
} from '@element-plus/icons-vue'
import { dangerSupervision } from '@/api/cloud'
import { formatDate, isOverdue } from '@/utils'
import type { Danger } from '@/types'

// 统计数据
const stats = ref({
  majorCount: 3,
  supervisingCount: 5,
  completedCount: 12,
  overdueCount: 1
})

// 搜索表单
const searchForm = reactive({
  supervisionLevel: '',
  supervisionStatus: '',
  responsibleDept: ''
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 督办列表
const supervisionList = ref<Danger[]>([])
const loading = ref(false)

// 对话框
const identifyDialogVisible = ref(false)
const progressDialogVisible = ref(false)
const verifyDialogVisible = ref(false)
const identifyFormRef = ref<FormInstance>()
const progressFormRef = ref<FormInstance>()
const verifyFormRef = ref<FormInstance>()
const currentDangerId = ref('')

// 识别表单
const identifyForm = reactive({
  dangerId: '',
  supervisionLevel: '公司级'
})

// 进度表单
const progressForm = reactive({
  progress: 0,
  measures: ''
})

// 验证表单
const verifyForm = reactive({
  verificationResult: '合格',
  verificationPerson: '',
  verificationDate: ''
})

// 进度标记
const progressMarks = {
  0: '0%',
  25: '25%',
  50: '50%',
  75: '75%',
  100: '100%'
}

// 获取督办状态类型
const getSupervisionStatusType = (status: string) => {
  const types: Record<string, any> = {
    '督办中': 'warning',
    '待验证': 'info',
    '已完成': 'success',
    '已销号': 'info'
  }
  return types[status] || 'info'
}

// 获取进度颜色
const getProgressColor = (progress: number) => {
  if (progress >= 100) return '#67c23a'
  if (progress >= 75) return '#409eff'
  if (progress >= 50) return '#e6a23c'
  return '#f56c6c'
}

// 加载督办列表
const loadSupervisionList = async () => {
  loading.value = true
  try {
    // 模拟数据
    supervisionList.value = [
      {
        _id: 'danger001',
        dangerLocation: '轨道1号线',
        dangerPart: '连接螺栓',
        dangerLevel: '重大隐患',
        dangerCategory: '行车安全',
        dangerDescription: '轨道连接螺栓松动',
        dangerStatus: '部分螺栓松动',
        responsibleDept: '工务段',
        responsiblePerson: '张三',
        supervisionPerson: '李四',
        plannedCompleteDate: '2025-04-05',
        isMajorDanger: true,
        isSupervised: true,
        supervisionLevel: '公司级',
        supervisionStatus: '督办中',
        progress: 60,
        discoveryDate: '2025-01-05',
        status: '整改中',
        createdAt: '2025-01-05T00:00:00.000Z',
        updatedAt: '2025-01-05T00:00:00.000Z'
      },
      {
        _id: 'danger002',
        dangerLocation: '信号室',
        dangerPart: '信号设备',
        dangerLevel: '重大隐患',
        dangerCategory: '行车安全',
        dangerDescription: '信号设备老化',
        dangerStatus: '设备运行不稳定',
        responsibleDept: '电务段',
        responsiblePerson: '王五',
        supervisionPerson: '赵六',
        plannedCompleteDate: '2025-03-15',
        isMajorDanger: true,
        isSupervised: true,
        supervisionLevel: '公司级',
        supervisionStatus: '督办中',
        progress: 30,
        discoveryDate: '2025-01-10',
        status: '整改中',
        createdAt: '2025-01-10T00:00:00.000Z',
        updatedAt: '2025-01-10T00:00:00.000Z'
      }
    ]
    pagination.total = supervisionList.value.length
  } catch (error: any) {
    ElMessage.error(error.message || '加载督办列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadSupervisionList()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    supervisionLevel: '',
    supervisionStatus: '',
    responsibleDept: ''
  })
  handleSearch()
}

// 识别重大隐患
const handleIdentify = () => {
  Object.assign(identifyForm, {
    dangerId: '',
    supervisionLevel: '公司级'
  })
  identifyDialogVisible.value = true
}

// 提交识别
const handleIdentifySubmit = async () => {
  if (!identifyFormRef.value) return

  try {
    await dangerSupervision({
      action: 'identify',
      dangerId: identifyForm.dangerId
    })
    ElMessage.success('重大隐患挂牌督办已启动')
    identifyDialogVisible.value = false
    loadSupervisionList()
  } catch (error: any) {
    ElMessage.error(error.message || '识别失败')
  }
}

// 检查超期隐患
const handleCheckOverdue = async () => {
  try {
    const result = await dangerSupervision({ action: 'check_overdue' })
    ElMessage.success(result.message || `发现${result.data.length}条超期隐患`)
    loadSupervisionList()
  } catch (error: any) {
    ElMessage.error(error.message || '检查失败')
  }
}

// 查看
const handleView = (row: Danger) => {
  ElMessage.info('查看详情功能开发中')
}

// 更新进展
const handleUpdateProgress = (row: Danger) => {
  currentDangerId.value = row._id
  Object.assign(progressForm, {
    progress: row.progress || 0,
    measures: ''
  })
  progressDialogVisible.value = true
}

// 提交进展
const handleProgressSubmit = async () => {
  if (!progressFormRef.value) return

  try {
    await dangerSupervision({
      action: 'update_progress',
      dangerId: currentDangerId.value,
      progress: progressForm.progress,
      measures: progressForm.measures
    })
    ElMessage.success('治理进展已更新')
    progressDialogVisible.value = false
    loadSupervisionList()
  } catch (error: any) {
    ElMessage.error(error.message || '更新失败')
  }
}

// 提交验证申请
const handleSubmitVerification = async (row: Danger) => {
  try {
    await ElMessageBox.confirm('确定要提交验证申请吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await dangerSupervision({
      action: 'submit_verification',
      dangerId: row._id
    })
    ElMessage.success('验证申请已提交')
    loadSupervisionList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '提交失败')
    }
  }
}

// 验证
const handleVerify = (row: Danger) => {
  currentDangerId.value = row._id
  Object.assign(verifyForm, {
    verificationResult: '合格',
    verificationPerson: '',
    verificationDate: ''
  })
  verifyDialogVisible.value = true
}

// 提交验证
const handleVerifySubmit = async () => {
  if (!verifyFormRef.value) return

  try {
    await dangerSupervision({
      action: 'verify',
      dangerId: currentDangerId.value,
      verificationResult: verifyForm.verificationResult,
      verificationPerson: verifyForm.verificationPerson
    })
    ElMessage.success(`验证结果：${verifyForm.verificationResult}`)
    verifyDialogVisible.value = false
    loadSupervisionList()
  } catch (error: any) {
    ElMessage.error(error.message || '验证失败')
  }
}

// 分页变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadSupervisionList()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadSupervisionList()
}

// 初始化
loadSupervisionList()
</script>

<style scoped>
.supervision-page {
  padding: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  margin-bottom: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  margin-right: 16px;
}

.stat-icon.major {
  color: #f56c6c;
}

.stat-icon.supervising {
  color: #e6a23c;
}

.stat-icon.completed {
  color: #67c23a;
}

.stat-icon.overdue {
  color: #f56c6c;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
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