<template>
  <div class="danger-page">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="隐患地点">
          <el-input
            v-model="searchForm.dangerLocation"
            placeholder="请输入隐患地点"
            clearable
          />
        </el-form-item>

        <el-form-item label="隐患等级">
          <el-select v-model="searchForm.dangerLevel" placeholder="请选择" clearable>
            <el-option label="重大隐患" value="重大隐患" />
            <el-option label="一般隐患" value="一般隐患" />
          </el-select>
        </el-form-item>

        <el-form-item label="隐患类别">
          <el-select v-model="searchForm.dangerCategory" placeholder="请选择" clearable>
            <el-option label="行车安全" value="行车安全" />
            <el-option label="人身安全" value="人身安全" />
            <el-option label="外部环境" value="外部环境" />
            <el-option label="工程建设" value="工程建设" />
            <el-option label="特种设备" value="特种设备" />
            <el-option label="消防安全" value="消防安全" />
            <el-option label="规章制度" value="规章制度" />
            <el-option label="综合保障" value="综合保障" />
          </el-select>
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option label="待整改" value="待整改" />
            <el-option label="整改中" value="整改中" />
            <el-option label="待验证" value="待验证" />
            <el-option label="已销号" value="已销号" />
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
        新增隐患
      </el-button>
      <el-button type="success" @click="handleExport">
        <el-icon><Download /></el-icon>
        导出数据
      </el-button>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table :data="dangerList" v-loading="loading" border stripe>
        <el-table-column type="index" label="序号" width="60" align="center" />

        <el-table-column prop="dangerLocation" label="隐患地点" min-width="150" show-overflow-tooltip />

        <el-table-column prop="dangerPart" label="隐患部位" width="120" />

        <el-table-column label="隐患等级" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.dangerLevel === '重大隐患' ? 'danger' : 'warning'" effect="dark">
              {{ row.dangerLevel }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="dangerCategory" label="隐患类别" width="120" />

        <el-table-column prop="dangerDescription" label="隐患描述" min-width="200" show-overflow-tooltip />

        <el-table-column prop="responsibleDept" label="责任部门" width="120" />

        <el-table-column prop="responsiblePerson" label="责任人" width="100" />

        <el-table-column prop="plannedCompleteDate" label="计划完成日期" width="130">
          <template #default="{ row }">
            <span :class="{ 'overdue': isOverdue(row.plannedCompleteDate) }">
              {{ formatDate(row.plannedCompleteDate, 'YYYY-MM-DD') }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="督办" width="80" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.isSupervised" type="danger" effect="dark">
              {{ row.supervisionLevel }}
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

        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">
              查看
            </el-button>
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button
              v-if="row.status !== '已销号'"
              type="success"
              link
              size="small"
              @click="handleVerify(row)"
            >
              验证
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
      width="900px"
      @close="handleDialogClose"
    >
      <el-form :model="dangerForm" :rules="dangerRules" ref="dangerFormRef" label-width="120px">
        <el-divider content-position="left">基本信息</el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="隐患地点" prop="dangerLocation">
              <el-input v-model="dangerForm.dangerLocation" placeholder="请输入隐患地点" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="隐患部位" prop="dangerPart">
              <el-input v-model="dangerForm.dangerPart" placeholder="请输入隐患部位" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="隐患等级" prop="dangerLevel">
              <el-select v-model="dangerForm.dangerLevel" placeholder="请选择" style="width: 100%">
                <el-option label="重大隐患" value="重大隐患" />
                <el-option label="一般隐患" value="一般隐患" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="隐患类别" prop="dangerCategory">
              <el-select v-model="dangerForm.dangerCategory" placeholder="请选择" style="width: 100%">
                <el-option label="行车安全" value="行车安全" />
                <el-option label="人身安全" value="人身安全" />
                <el-option label="外部环境" value="外部环境" />
                <el-option label="工程建设" value="工程建设" />
                <el-option label="特种设备" value="特种设备" />
                <el-option label="消防安全" value="消防安全" />
                <el-option label="规章制度" value="规章制度" />
                <el-option label="综合保障" value="综合保障" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="隐患描述" prop="dangerDescription">
          <el-input
            v-model="dangerForm.dangerDescription"
            type="textarea"
            :rows="3"
            placeholder="请输入隐患描述"
          />
        </el-form-item>

        <el-form-item label="隐患现状" prop="dangerStatus">
          <el-input
            v-model="dangerForm.dangerStatus"
            type="textarea"
            :rows="2"
            placeholder="请输入隐患现状"
          />
        </el-form-item>

        <el-divider content-position="left">原因分析</el-divider>

        <el-form-item label="产生原因" prop="causeAnalysis">
          <el-input
            v-model="dangerForm.causeAnalysis"
            type="textarea"
            :rows="3"
            placeholder="请输入产生原因"
          />
        </el-form-item>

        <el-form-item label="危害分析" prop="hazardAnalysis">
          <el-input
            v-model="dangerForm.hazardAnalysis"
            type="textarea"
            :rows="3"
            placeholder="请输入危害程度和整改难易程度分析"
          />
        </el-form-item>

        <el-divider content-position="left">治理措施</el-divider>

        <el-form-item label="治理方案" prop="treatmentPlan">
          <el-input
            v-model="dangerForm.treatmentPlan"
            type="textarea"
            :rows="3"
            placeholder="重大隐患需填写专项治理方案"
          />
        </el-form-item>

        <el-form-item label="整改措施" prop="treatmentMeasures">
          <el-input
            v-model="dangerForm.treatmentMeasures"
            type="textarea"
            :rows="3"
            placeholder="请输入具体整改措施"
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="责任部门" prop="responsibleDept">
              <el-input v-model="dangerForm.responsibleDept" placeholder="请输入责任部门" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="责任人" prop="responsiblePerson">
              <el-input v-model="dangerForm.responsiblePerson" placeholder="请输入责任人" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="督办人" prop="supervisionPerson">
              <el-input v-model="dangerForm.supervisionPerson" placeholder="请输入督办人" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="计划完成日期" prop="plannedCompleteDate">
              <el-date-picker
                v-model="dangerForm.plannedCompleteDate"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="完成标准" prop="completionCriteria">
          <el-input v-model="dangerForm.completionCriteria" placeholder="请输入完成标准" />
        </el-form-item>

        <el-form-item label="验证方法" prop="verificationMethod">
          <el-input v-model="dangerForm.verificationMethod" placeholder="请输入验证方法" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="发现日期" prop="discoveryDate">
              <el-date-picker
                v-model="dangerForm.discoveryDate"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="发现人" prop="discoverer">
              <el-input v-model="dangerForm.discoverer" placeholder="请输入发现人" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="发现方式" prop="findMethod">
          <el-select v-model="dangerForm.findMethod" placeholder="请选择" style="width: 100%">
            <el-option label="日常排查" value="日常排查" />
            <el-option label="定期排查" value="定期排查" />
            <el-option label="专项排查" value="专项排查" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 验证对话框 -->
    <el-dialog v-model="verifyDialogVisible" title="隐患验收" width="600px">
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
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  Search,
  Refresh,
  Plus,
  Download
} from '@element-plus/icons-vue'
import { getDangers, createDanger, updateDanger, verifyDanger } from '@/api/cloud'
import { formatDate, isOverdue, exportToCSV } from '@/utils'
import type { Danger } from '@/types'

// 搜索表单
const searchForm = reactive({
  dangerLocation: '',
  dangerLevel: '',
  dangerCategory: '',
  status: ''
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 隐患列表
const dangerList = ref<Danger[]>([])
const loading = ref(false)

// 对话框
const dialogVisible = ref(false)
const verifyDialogVisible = ref(false)
const dialogTitle = ref('新增隐患')
const dangerFormRef = ref<FormInstance>()
const verifyFormRef = ref<FormInstance>()
const currentDangerId = ref('')

// 隐患表单
const dangerForm = reactive({
  _id: '',
  dangerLocation: '',
  dangerPart: '',
  dangerLevel: '一般隐患',
  dangerCategory: '',
  dangerDescription: '',
  dangerStatus: '',
  causeAnalysis: '',
  hazardAnalysis: '',
  treatmentPlan: '',
  treatmentMeasures: '',
  responsibleDept: '',
  responsiblePerson: '',
  supervisionPerson: '',
  plannedCompleteDate: '',
  completionCriteria: '',
  verificationMethod: '',
  discoveryDate: '',
  discoverer: '',
  findMethod: ''
})

// 验证表单
const verifyForm = reactive({
  verificationResult: '合格',
  verificationPerson: '',
  verificationDate: ''
})

// 表单验证规则
const dangerRules: FormRules = {
  dangerLocation: [{ required: true, message: '请输入隐患地点', trigger: 'blur' }],
  dangerLevel: [{ required: true, message: '请选择隐患等级', trigger: 'change' }],
  dangerCategory: [{ required: true, message: '请选择隐患类别', trigger: 'change' }],
  dangerDescription: [{ required: true, message: '请输入隐患描述', trigger: 'blur' }],
  responsibleDept: [{ required: true, message: '请输入责任部门', trigger: 'blur' }],
  responsiblePerson: [{ required: true, message: '请输入责任人', trigger: 'blur' }],
  plannedCompleteDate: [{ required: true, message: '请选择计划完成日期', trigger: 'change' }]
}

// 获取状态类型
const getStatusType = (status: string) => {
  const types: Record<string, any> = {
    '待整改': 'warning',
    '整改中': 'primary',
    '待验证': 'info',
    '已销号': 'success'
  }
  return types[status] || 'info'
}

// 加载隐患列表
const loadDangerList = async () => {
  loading.value = true
  try {
    const result = await getDangers({
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm
    })
    dangerList.value = result.list
    pagination.total = result.total
  } catch (error: any) {
    ElMessage.error(error.message || '加载隐患列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadDangerList()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    dangerLocation: '',
    dangerLevel: '',
    dangerCategory: '',
    status: ''
  })
  handleSearch()
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增隐患'
  Object.assign(dangerForm, {
    _id: '',
    dangerLocation: '',
    dangerPart: '',
    dangerLevel: '一般隐患',
    dangerCategory: '',
    dangerDescription: '',
    dangerStatus: '',
    causeAnalysis: '',
    hazardAnalysis: '',
    treatmentPlan: '',
    treatmentMeasures: '',
    responsibleDept: '',
    responsiblePerson: '',
    supervisionPerson: '',
    plannedCompleteDate: '',
    completionCriteria: '',
    verificationMethod: '',
    discoveryDate: '',
    discoverer: '',
    findMethod: ''
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: Danger) => {
  dialogTitle.value = '编辑隐患'
  Object.assign(dangerForm, row)
  dialogVisible.value = true
}

// 查看
const handleView = (row: Danger) => {
  ElMessage.info('查看功能开发中')
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

  await verifyFormRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      await verifyDanger(currentDangerId.value, verifyForm)
      ElMessage.success('验证成功')
      verifyDialogVisible.value = false
      loadDangerList()
    } catch (error: any) {
      ElMessage.error(error.message || '验证失败')
    }
  })
}

// 删除
const handleDelete = async (row: Danger) => {
  try {
    await ElMessageBox.confirm(`确定要删除隐患"${row.dangerDescription}"吗?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    ElMessage.success('删除成功')
    loadDangerList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 提交
const handleSubmit = async () => {
  if (!dangerFormRef.value) return

  await dangerFormRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      if (dangerForm._id) {
        await updateDanger(dangerForm._id, dangerForm)
        ElMessage.success('更新成功')
      } else {
        await createDanger(dangerForm)
        ElMessage.success('创建成功')
      }

      dialogVisible.value = false
      loadDangerList()
    } catch (error: any) {
      ElMessage.error(error.message || '操作失败')
    }
  })
}

// 对话框关闭
const handleDialogClose = () => {
  dangerFormRef.value?.resetFields()
}

// 导出
const handleExport = () => {
  exportToCSV(dangerList.value, `隐患列表_${formatDate(new Date(), 'YYYYMMDD')}.csv`)
}

// 分页变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadDangerList()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadDangerList()
}

// 初始化
loadDangerList()
</script>

<style scoped>
.danger-page {
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