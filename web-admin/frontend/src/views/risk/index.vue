<template>
  <div class="risk-page">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="风险名称">
          <el-input
            v-model="searchForm.riskName"
            placeholder="请输入风险名称"
            clearable
          />
        </el-form-item>

        <el-form-item label="风险等级">
          <el-select v-model="searchForm.riskLevel" placeholder="请选择" clearable>
            <el-option label="重大风险" :value="1" />
            <el-option label="较大风险" :value="2" />
            <el-option label="一般风险" :value="3" />
            <el-option label="低风险" :value="4" />
          </el-select>
        </el-form-item>

        <el-form-item label="风险颜色">
          <el-select v-model="searchForm.riskColor" placeholder="请选择" clearable>
            <el-option label="红" value="红" />
            <el-option label="橙" value="橙" />
            <el-option label="黄" value="黄" />
            <el-option label="蓝" value="蓝" />
          </el-select>
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option label="活跃" value="active" />
            <el-option label="已关闭" value="closed" />
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
        新增风险
      </el-button>
      <el-button type="success" @click="handleExport">
        <el-icon><Download /></el-icon>
        导出数据
      </el-button>
    </el-card>

    <!-- 风险矩阵 -->
    <el-card class="matrix-card">
      <RiskMatrix :risks="allRisksForMatrix" @riskSelected="handleRiskCellClick" />
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table :data="riskList" v-loading="loading" border stripe>
        <el-table-column type="index" label="序号" width="60" align="center" />

        <el-table-column prop="riskName" label="风险名称" min-width="150" show-overflow-tooltip />

        <el-table-column prop="riskType" label="风险类型" width="100" />

        <el-table-column prop="location" label="风险地点" width="150" show-overflow-tooltip />

        <el-table-column label="风险等级" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getRiskTagType(row.riskLevel)" effect="dark">
              {{ row.riskGrade }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="风险颜色" width="80" align="center">
          <template #default="{ row }">
            <el-tag :color="getRiskLevelColor(row.riskLevel)" effect="dark">
              {{ row.riskColor }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="manageDept" label="管控部门" width="120" />

        <el-table-column prop="managePerson" label="管控责任人" width="120" />

        <el-table-column prop="checkFrequency" label="检查频次" width="120" />

        <el-table-column prop="nextCheckDate" label="下次检查日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.nextCheckDate, 'YYYY-MM-DD') }}
          </template>
        </el-table-column>

        <el-table-column prop="complianceStatus" label="符合状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.complianceStatus === '符合' ? 'success' : row.complianceStatus === '待验证' ? 'warning' : 'danger'">
              {{ row.complianceStatus || '符合' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="controlMeasures" label="控制措施" width="150" show-overflow-tooltip />

        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '活跃' : '已关闭' }}
            </el-tag>
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
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      @close="handleDialogClose"
    >
      <el-form :model="riskForm" :rules="riskRules" ref="riskFormRef" label-width="120px">
        <el-divider content-position="left">基本信息</el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="风险名称" prop="riskName">
              <el-input v-model="riskForm.riskName" placeholder="请输入风险名称" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="风险类型" prop="riskType">
              <el-select v-model="riskForm.riskType" placeholder="请选择" style="width: 100%">
                <el-option label="行为类" value="行为类" />
                <el-option label="设备类" value="设备类" />
                <el-option label="环境类" value="环境类" />
                <el-option label="管理类" value="管理类" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="作业环节" prop="operationLink">
              <el-input v-model="riskForm.operationLink" placeholder="请输入作业环节" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="风险地点" prop="location">
              <el-input v-model="riskForm.location" placeholder="请输入风险地点" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">MES评估</el-divider>

        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="严重程度 (S值)" prop="sValue">
              <el-select v-model="riskForm.sValue" placeholder="请选择严重程度" style="width: 100%">
                <el-option label="1分: 轻微伤害" value="1" />
                <el-option label="2分: 需医院治疗" value="2" />
                <el-option label="4分: 永久失能" value="4" />
                <el-option label="8分: 1人死亡" value="8" />
                <el-option label="10分: 多人死亡" value="10" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="6">
            <el-form-item label="暴露频率 (E1值)" prop="e1Value">
              <el-select v-model="riskForm.e1Value" placeholder="请选择暴露频率" style="width: 100%">
                <el-option label="1分: 几乎不可能" value="1" />
                <el-option label="2分: 很少" value="2" />
                <el-option label="3分: 有时" value="3" />
                <el-option label="6分: 经常" value="6" />
                <el-option label="10分: 频繁" value="10" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="6">
            <el-form-item label="暴露强度 (E2值)" prop="e2Value">
              <el-select v-model="riskForm.e2Value" placeholder="请选择暴露强度" style="width: 100%">
                <el-option label="1分: 几乎不可能" value="1" />
                <el-option label="2分: 很少" value="2" />
                <el-option label="3分: 有时" value="3" />
                <el-option label="6分: 经常" value="6" />
                <el-option label="10分: 频繁" value="10" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="6">
            <el-form-item label="防护措施等级 (M值)" prop="mValue">
              <el-select v-model="riskForm.mValue" placeholder="请选择防护措施等级" style="width: 100%">
                <el-option label="1分: 无防护" value="1" />
                <el-option label="3分: 部分防护" value="3" />
                <el-option label="5分: 完善防护" value="5" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="计算风险值">
          <el-input :value="riskValue" disabled />
        </el-form-item>

        <el-form-item label="风险等级">
          <el-tag :type="getRiskTagType(riskLevel)" effect="dark">
            {{ riskGrade }}
          </el-tag>
        </el-form-item>

        <el-divider content-position="left">管控措施</el-divider>

        <el-form-item label="岗位控制措施" prop="controlMeasures">
          <el-input
            v-model="riskForm.controlMeasures"
            type="textarea"
            :rows="3"
            placeholder="请输入岗位控制措施"
          />
        </el-form-item>

        <el-form-item label="控制人" prop="controlPerson">
          <el-input v-model="riskForm.controlPerson" placeholder="请输入控制人" />
        </el-form-item>

        <el-form-item label="管控措施" prop="manageMeasures">
          <el-input
            v-model="riskForm.manageMeasures"
            type="textarea"
            :rows="3"
            placeholder="请输入管控措施"
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="管控责任部门" prop="manageDept">
              <el-input v-model="riskForm.manageDept" placeholder="请输入管控责任部门" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="管控责任人" prop="managePerson">
              <el-input v-model="riskForm.managePerson" placeholder="请输入管控责任人" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="辨识方法" prop="identificationMethod">
          <el-select v-model="riskForm.identificationMethod" placeholder="请选择" style="width: 100%">
            <el-option label="作业安全分析法" value="作业安全分析法" />
            <el-option label="安全检查表法" value="安全检查表法" />
            <el-option label="工作危害分析法" value="工作危害分析法" />
            <el-option label="风险矩阵法" value="风险矩阵法" />
          </el-select>
        </el-form-item>

        <el-divider content-position="left">GBT 33000-2025 合规性信息</el-divider>

        <el-form-item label="合规状态" prop="complianceStatus">
          <el-select v-model="riskForm.complianceStatus" placeholder="请选择" style="width: 100%">
            <el-option label="符合" value="符合" />
            <el-option label="待验证" value="待验证" />
            <el-option label="不符合" value="不符合" />
          </el-select>
        </el-form-item>

        <el-form-item label="控制措施要求" prop="controlMeasuresRequirements">
          <el-input
            v-model="riskForm.controlMeasuresRequirements"
            type="textarea"
            :rows="3"
            placeholder="请输入控制措施要求，符合GBT 33000-2025标准"
          />
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
import { ref, computed, reactive } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  Search,
  Refresh,
  Plus,
  Download
} from '@element-plus/icons-vue'
import { getRisks, createRisk, updateRisk, deleteRisk, getRisksAdvanced } from '@/api/cloud'
import { formatDate, getRiskLevelColor, exportToCSV } from '@/utils'
import RiskMatrix from '@/components/RiskMatrix.vue'
import type { Risk } from '@/types'

// 搜索表单
const searchForm = reactive({
  riskName: '',
  riskLevel: undefined,
  riskColor: '',
  status: ''
})

// 处理风险矩阵单元格点击
const handleRiskCellClick = (likelihood: number, severity: number) => {
  // 添加风险矩阵筛选条件
  matrixFilters.likelihood = likelihood
  matrixFilters.severity = severity
  pagination.page = 1
  loadRiskList()
}

// 风险矩阵筛选条件
const matrixFilters = reactive({
  likelihood: undefined,
  severity: undefined
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 风险列表数据（用于表格展示）
const riskList = ref<Risk[]>([])

// 所有风险数据（用于风险矩阵展示）
const allRisksForMatrix = ref<Risk[]>([])
const loading = ref(false)

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('新增风险')
const riskFormRef = ref<FormInstance>()

// 风险表单
const riskForm = reactive({
  _id: '',
  riskName: '',
  riskType: '',
  operationLink: '',
  location: '',
  mValue: 1,
  e1Value: 1,
  e2Value: 1,
  sValue: 1,
  controlMeasures: '',
  controlPerson: '',
  manageMeasures: '',
  manageDept: '',
  managePerson: '',
  identificationMethod: '',
  complianceStatus: '符合',
  controlMeasuresRequirements: ''
})

// 计算风险值
const riskValue = computed(() => {
  const e = Math.max(riskForm.e1Value, riskForm.e2Value)
  return riskForm.mValue * e * riskForm.sValue
})

// 计算风险等级
const riskLevel = computed(() => {
  const r = riskValue.value
  if (r > 180) return 1
  if (r >= 90) return 2
  if (r >= 40) return 3
  return 4
})

// 计算风险等级名称
const riskGrade = computed(() => {
  const grades = ['重大风险', '较大风险', '一般风险', '低风险']
  return grades[riskLevel.value - 1]
})

// 表单验证规则
const riskRules: FormRules = {
  riskName: [{ required: true, message: '请输入风险名称', trigger: 'blur' }],
  riskType: [{ required: true, message: '请选择风险类型', trigger: 'change' }],
  location: [{ required: true, message: '请输入风险地点', trigger: 'blur' }],
  sValue: [{ required: true, message: '请选择严重程度', trigger: 'change' }],
  e1Value: [{ required: true, message: '请选择暴露频率', trigger: 'change' }],
  e2Value: [{ required: true, message: '请选择暴露强度', trigger: 'change' }],
  mValue: [{ required: true, message: '请选择防护措施等级', trigger: 'change' }],
  manageDept: [{ required: true, message: '请输入管控责任部门', trigger: 'blur' }],
  managePerson: [{ required: true, message: '请输入管控责任人', trigger: 'blur' }]
}

// 获取风险标签类型
const getRiskTagType = (level: number) => {
  const types = ['danger', 'warning', 'primary', 'success']
  return types[level - 1] || 'info'
}

// 获取风险等级颜色
const getRiskLevelColor = (level: number) => {
  const colors = ['#FF4D4F', '#FA8C16', '#FAAD14', '#52C41A']
  return colors[level - 1] || '#1890FF'
}

// 加载风险列表
const loadRiskList = async () => {
  loading.value = true
  try {
    // 首先加载所有风险用于风险矩阵显示
    const allRisksResult = await getRisks({ pageSize: 999 }) // 获取所有风险用于矩阵显示
    allRisksForMatrix.value = allRisksResult.list
    
    // 然后根据筛选条件加载分页数据
    const result = await getRisksAdvanced({
      page: pagination.page,
      pageSize: pagination.pageSize,
      search: searchForm.riskName,
      level: searchForm.riskLevel,
      color: searchForm.riskColor,
      status: searchForm.status,
      likelihood: matrixFilters.likelihood,
      severity: matrixFilters.severity
    })
    riskList.value = result.list || []
    pagination.total = result.total || 0
  } catch (error: any) {
    ElMessage.error(error.message || '加载风险列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadRiskList()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    riskName: '',
    riskLevel: undefined,
    riskColor: '',
    status: ''
  })
  // 重置矩阵筛选
  matrixFilters.likelihood = undefined
  matrixFilters.severity = undefined
  handleSearch()
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增风险'
  Object.assign(riskForm, {
    _id: '',
    riskName: '',
    riskType: '',
    operationLink: '',
    location: '',
    mValue: 1,
    e1Value: 1,
    e2Value: 1,
    sValue: 1,
    controlMeasures: '',
    controlPerson: '',
    manageMeasures: '',
    manageDept: '',
    managePerson: '',
    identificationMethod: '',
    complianceStatus: '符合',
    controlMeasuresRequirements: ''
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: Risk) => {
  dialogTitle.value = '编辑风险'
  Object.assign(riskForm, {
    _id: row._id,
    riskName: row.riskName,
    riskType: row.riskType,
    operationLink: row.operationLink,
    location: row.location,
    mValue: row.mValue,
    e1Value: row.e1Value,
    e2Value: row.e2Value,
    sValue: row.sValue,
    controlMeasures: row.controlMeasures,
    controlPerson: row.controlPerson,
    manageMeasures: row.manageMeasures,
    manageDept: row.manageDept,
    managePerson: row.managePerson,
    identificationMethod: row.identificationMethod,
    complianceStatus: row.complianceStatus || '符合',
    controlMeasuresRequirements: row.controlMeasuresRequirements || ''
  })
  dialogVisible.value = true
}

// 查看
const handleView = (row: Risk) => {
  // 构建查看对话框内容
  ElMessageBox.alert(
    `
      <div class="view-risk-detail">
        <h4>${row.riskName}</h4>
        <p><strong>风险类型:</strong> ${row.riskType}</p>
        <p><strong>风险等级:</strong> <span style="color: ${getRiskLevelColor(row.riskLevel)}">${row.riskGrade}</span></p>
        <p><strong>风险地点:</strong> ${row.location}</p>
        <p><strong>管控部门:</strong> ${row.manageDept}</p>
        <p><strong>管控责任人:</strong> ${row.managePerson}</p>
        <p><strong>风险值:</strong> ${row.rValue}</p>
        <p><strong>控制措施:</strong> ${row.controlMeasures || '无'}</p>
        <p><strong>合规状态:</strong> ${row.complianceStatus || '符合'}</p>
      </div>
    `,
    '风险详情',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '关闭'
    }
  )
}

// 删除
const handleDelete = async (row: Risk) => {
  try {
    await ElMessageBox.confirm(`确定要删除风险"${row.riskName}"吗?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteRisk(row._id)
    ElMessage.success('删除成功')
    loadRiskList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 提交
const handleSubmit = async () => {
  if (!riskFormRef.value) return

  await riskFormRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      const data = {
        ...riskForm,
        rValue: riskValue.value,
        riskLevel: riskLevel.value,
        riskGrade: riskGrade.value,
        riskColor: ['红', '橙', '黄', '蓝'][riskLevel.value - 1]
      }

      if (riskForm._id) {
        await updateRisk(riskForm._id, data)
        ElMessage.success('更新成功')
      } else {
        await createRisk(data)
        ElMessage.success('创建成功')
      }

      dialogVisible.value = false
      loadRiskList()
    } catch (error: any) {
      ElMessage.error(error.message || '操作失败')
    }
  })
}

// 对话框关闭
const handleDialogClose = () => {
  riskFormRef.value?.resetFields()
}

// 导出
const handleExport = () => {
  exportToCSV(riskList.value, `风险列表_${formatDate(new Date(), 'YYYYMMDD')}.csv`)
}

// 分页变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadRiskList()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadRiskList()
}

// 初始化
loadRiskList()
</script>

<style scoped>
.risk-page {
  padding: 20px;
}

.search-card,
.operation-card,
.matrix-card,
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