<template>
  <div class="danger-page">
    <!-- 统计图表 -->
    <el-card class="statistics-card">
      <div class="statistics-title">隐患统计分析</div>
      <div class="chart-container">
        <div class="chart-item">
          <div class="chart-title">按隐患等级统计</div>
          <div id="levelChart" class="chart" ref="levelChartRef"></div>
        </div>
        <div class="chart-item">
          <div class="chart-title">按隐患状态统计</div>
          <div id="statusChart" class="chart" ref="statusChartRef"></div>
        </div>
        <div class="chart-item">
          <div class="chart-title">按隐患类别统计</div>
          <div id="categoryChart" class="chart" ref="categoryChartRef"></div>
        </div>
      </div>
    </el-card>

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
        <el-form-item label="合规状态">
          <el-select v-model="searchForm.complianceStatus" placeholder="请选择" clearable>
            <el-option label="符合标准" value="符合GBT 33000-2025标准" />
            <el-option label="待验证" value="待验证" />
            <el-option label="不符合" value="不符合标准" />
            <el-option label="超期" value="超期整改" />
          </el-select>
        </el-form-item>
        <el-form-item label="督办状态">
          <el-select v-model="searchForm.supervisionStatus" placeholder="请选择" clearable>
            <el-option label="立案督办" value="立案督办" />
            <el-option label="待督办" value="待督办" />
            <el-option label="验收通过" value="验收通过" />
            <el-option label="验收不通过" value="验收不通过继续整改" />
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
      <el-button type="warning" @click="handleStartSupervision">挂牌督办</el-button>
      <el-button type="info" @click="handleSubmitVerification">提交验证</el-button>
      <el-button type="success" @click="handleExport">
        <el-icon><Download /></el-icon>
        导出数据
      </el-button>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table :data="dangerList" v-loading="loading" border stripe ref="tableRef" row-key="_id">
        <el-table-column type="selection" width="55" />
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
        <el-table-column label="合规状态" prop="complianceStatus" min-width="120">
          <template #default="{ row }">
            <el-tag :type="
              row.complianceStatus === '符合GBT 33000-2025标准' ? 'success' :
              row.complianceStatus === '不符合标准' ? 'danger' :
              row.complianceStatus === '超期整改' ? 'warning' :
              'info'
            ">
              {{ row.complianceStatus || '待确认' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="督办状态" prop="supervisionStatus" min-width="120">
          <template #default="{ row }">
            <el-tag :type="
              row.supervisionStatus === '立案督办' ? 'warning' :
              row.supervisionStatus === '验收通过' ? 'success' :
              row.supervisionStatus === '验收不通过继续整改' ? 'danger' :
              'info'
            ">
              {{ row.supervisionStatus || '未督办' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="整改进展" prop="actualProgress" min-width="100">
          <template #default="{ row }">
            <el-progress :percentage="parseInt(row.actualProgress || '0')" />
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

    <!-- 查看对话框 -->
    <el-dialog v-model="viewDialogVisible" title="隐患详情" width="900px">
      <div v-if="currentDanger" class="view-content">
        <el-divider content-position="left">基本信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">隐患地点：</span>
              <span class="info-value">{{ currentDanger.dangerLocation }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">隐患部位：</span>
              <span class="info-value">{{ currentDanger.dangerPart }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">隐患等级：</span>
              <el-tag :type="currentDanger.dangerLevel === '重大隐患' ? 'danger' : 'warning'">{{ currentDanger.dangerLevel }}</el-tag>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">隐患类别：</span>
              <span class="info-value">{{ currentDanger.dangerCategory }}</span>
            </div>
          </el-col>
        </el-row>
        <div class="info-item">
          <span class="info-label">隐患描述：</span>
          <div class="info-value">{{ currentDanger.dangerDescription }}</div>
        </div>
        <div class="info-item">
          <span class="info-label">隐患现状：</span>
          <div class="info-value">{{ currentDanger.dangerStatus }}</div>
        </div>

        <el-divider content-position="left">原因分析</el-divider>
        <div class="info-item">
          <span class="info-label">产生原因：</span>
          <div class="info-value">{{ currentDanger.causeAnalysis }}</div>
        </div>
        <div class="info-item">
          <span class="info-label">危害分析：</span>
          <div class="info-value">{{ currentDanger.hazardAnalysis }}</div>
        </div>

        <el-divider content-position="left">治理措施</el-divider>
        <div class="info-item">
          <span class="info-label">治理方案：</span>
          <div class="info-value">{{ currentDanger.treatmentPlan }}</div>
        </div>
        <div class="info-item">
          <span class="info-label">整改措施：</span>
          <div class="info-value">{{ currentDanger.treatmentMeasures }}</div>
        </div>

        <el-divider content-position="left">责任与进度</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">责任部门：</span>
              <span class="info-value">{{ currentDanger.responsibleDept }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">责任人：</span>
              <span class="info-value">{{ currentDanger.responsiblePerson }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">督办人：</span>
              <span class="info-value">{{ currentDanger.supervisionPerson }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">计划完成日期：</span>
              <span class="info-value" :class="{ 'overdue': isOverdue(currentDanger.plannedCompleteDate) }">{{ formatDate(currentDanger.plannedCompleteDate, 'YYYY-MM-DD') }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">实际完成日期：</span>
              <span class="info-value">{{ currentDanger.actualCompleteDate ? formatDate(currentDanger.actualCompleteDate, 'YYYY-MM-DD') : '未完成' }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">整改进展：</span>
              <el-progress :percentage="parseInt(currentDanger.actualProgress || '0')" />
            </div>
          </el-col>
        </el-row>

        <el-divider content-position="left">验证信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">验证结果：</span>
              <el-tag :type="currentDanger.verificationResult === '合格' ? 'success' : 'danger'">
                {{ currentDanger.verificationResult || '未验证' }}
              </el-tag>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">验证人：</span>
              <span class="info-value">{{ currentDanger.verificationPerson || '未验证' }}</span>
            </div>
          </el-col>
        </el-row>
        <div class="info-item">
          <span class="info-label">验证日期：</span>
          <span class="info-value">{{ currentDanger.verificationDate ? formatDate(currentDanger.verificationDate, 'YYYY-MM-DD') : '未验证' }}</span>
        </div>

        <el-divider content-position="left">发现与督办</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">发现日期：</span>
              <span class="info-value">{{ formatDate(currentDanger.discoveryDate, 'YYYY-MM-DD') }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">发现人：</span>
              <span class="info-value">{{ currentDanger.discoverer }}</span>
            </div>
          </el-col>
        </el-row>
        <div class="info-item">
          <span class="info-label">发现方式：</span>
          <span class="info-value">{{ currentDanger.findMethod }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">督办状态：</span>
          <el-tag :type="
            currentDanger.supervisionStatus === '立案督办' ? 'warning' :
            currentDanger.supervisionStatus === '验收通过' ? 'success' :
            currentDanger.supervisionStatus === '验收不通过继续整改' ? 'danger' :
            'info'
          ">
            {{ currentDanger.supervisionStatus || '未督办' }}
          </el-tag>
        </div>
      </div>

      <template #footer>
        <el-button @click="viewDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox, ElTable, type FormInstance, type FormRules } from 'element-plus'
import {
  Search,
  Refresh,
  Plus,
  Download
} from '@element-plus/icons-vue'
import { getDangers, createDanger, updateDanger, verifyDanger, dangerSupervision } from '@/api/cloud'
import { formatDate, isOverdue, exportToCSV } from '@/utils'
import type { Danger } from '@/types'
import * as echarts from 'echarts'

// 搜索表单
const searchForm = reactive({
  dangerLocation: '',
  dangerLevel: '',
  dangerCategory: '',
  status: '',
  complianceStatus: '',
  supervisionStatus: ''
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

// 表格引用
const tableRef = ref<InstanceType<typeof ElTable>>()

// 图表引用
const levelChartRef = ref<HTMLElement | null>(null)
const statusChartRef = ref<HTMLElement | null>(null)
const categoryChartRef = ref<HTMLElement | null>(null)
let levelChart: echarts.ECharts | null = null
let statusChart: echarts.ECharts | null = null
let categoryChart: echarts.ECharts | null = null

// 统计数据
interface StatisticsData {
  levelData: { name: string[]; value: number[] }
  statusData: { name: string[]; value: number[] }
  categoryData: { name: string[]; value: number[] }
}

const statisticsData = reactive<StatisticsData>({
  levelData: { name: [], value: [] },
  statusData: { name: [], value: [] },
  categoryData: { name: [], value: [] }
})

// 对话框
const dialogVisible = ref(false)
const verifyDialogVisible = ref(false)
const viewDialogVisible = ref(false)
const dialogTitle = ref('新增隐患')
const dangerFormRef = ref<FormInstance>()
const verifyFormRef = ref<FormInstance>()
const currentDangerId = ref('')
const currentDanger = ref<Danger | null>(null)

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
    
    // 计算统计数据
    calculateStatistics(result.list)
  } catch (error: any) {
    ElMessage.error(error.message || '加载隐患列表失败')
  } finally {
    loading.value = false
  }
}

// 计算统计数据
const calculateStatistics = (data: Danger[]) => {
  // 按隐患等级统计
  const levelCount: Record<string, number> = {
    '重大隐患': 0,
    '一般隐患': 0
  }
  
  // 按隐患状态统计
  const statusCount: Record<string, number> = {
    '待整改': 0,
    '整改中': 0,
    '待验证': 0,
    '已销号': 0
  }
  
  // 按隐患类别统计
  const categoryCount: Record<string, number> = {
    '行车安全': 0,
    '人身安全': 0,
    '外部环境': 0,
    '工程建设': 0,
    '特种设备': 0,
    '消防安全': 0,
    '规章制度': 0,
    '综合保障': 0
  }
  
  data.forEach(item => {
    // 统计等级
    if (levelCount[item.dangerLevel]) {
      levelCount[item.dangerLevel]++
    }
    
    // 统计状态
    if (statusCount[item.status]) {
      statusCount[item.status]++
    }
    
    // 统计类别
    if (categoryCount[item.dangerCategory]) {
      categoryCount[item.dangerCategory]++
    }
  })
  
  // 转换为图表数据格式
  statisticsData.levelData.name = Object.keys(levelCount)
  statisticsData.levelData.value = Object.values(levelCount)
  
  statisticsData.statusData.name = Object.keys(statusCount)
  statisticsData.statusData.value = Object.values(statusCount)
  
  statisticsData.categoryData.name = Object.keys(categoryCount)
  statisticsData.categoryData.value = Object.values(categoryCount)
  
  // 更新图表
  updateCharts()
}

// 初始化图表
const initCharts = () => {
  // 等级图表
  if (levelChartRef.value) {
    levelChart = echarts.init(levelChartRef.value)
    levelChart.setOption({
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        left: 10,
        data: statisticsData.levelData.name
      },
      series: [
        {
          name: '隐患等级',
          type: 'pie',
          radius: '60%',
          center: ['60%', '50%'],
          data: statisticsData.levelData.name.map((name, index) => ({
            value: statisticsData.levelData.value[index],
            name: name
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    })
  }
  
  // 状态图表
  if (statusChartRef.value) {
    statusChart = echarts.init(statusChartRef.value)
    statusChart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      xAxis: {
        type: 'category',
        data: statisticsData.statusData.name
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '隐患数量',
          type: 'bar',
          data: statisticsData.statusData.value,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#83bff6' },
              { offset: 0.5, color: '#188df0' },
              { offset: 1, color: '#188df0' }
            ])
          }
        }
      ]
    })
  }
  
  // 类别图表
  if (categoryChartRef.value) {
    categoryChart = echarts.init(categoryChartRef.value)
    categoryChart.setOption({
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        left: 10,
        data: statisticsData.categoryData.name
      },
      series: [
        {
          name: '隐患类别',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['60%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: statisticsData.categoryData.name.map((name, index) => ({
            value: statisticsData.categoryData.value[index],
            name: name
          }))
        }
      ]
    })
  }
}

// 更新图表
const updateCharts = () => {
  // 更新等级图表
  if (levelChart) {
    levelChart.setOption({
      series: [
        {
          data: statisticsData.levelData.name.map((name, index) => ({
            value: statisticsData.levelData.value[index],
            name: name
          }))
        }
      ]
    })
  }
  
  // 更新状态图表
  if (statusChart) {
    statusChart.setOption({
      series: [
        {
          data: statisticsData.statusData.value
        }
      ]
    })
  }
  
  // 更新类别图表
  if (categoryChart) {
    categoryChart.setOption({
      series: [
        {
          data: statisticsData.categoryData.name.map((name, index) => ({
            value: statisticsData.categoryData.value[index],
            name: name
          }))
        }
      ]
    })
  }
}

// 监听窗口大小变化，调整图表大小
const handleResize = () => {
  levelChart?.resize()
  statusChart?.resize()
  categoryChart?.resize()
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
    status: '',
    complianceStatus: '',
    supervisionStatus: ''
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
  currentDanger.value = { ...row }
  viewDialogVisible.value = true
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
        await verifyDanger(currentDangerId.value, verifyForm.verificationResult, verifyForm.verificationPerson)
        ElMessage.success('验证成功')
        verifyDialogVisible.value = false
        loadDangerList()
      } catch (error: any) {
        ElMessage.error(error.message || '验证失败')
      }
  })
}

// 生命周期钩子
onMounted(() => {
  initCharts()
  window.addEventListener('resize', handleResize)
})

// 监听隐患列表变化
watch(dangerList, () => {
  if (dangerList.value.length > 0) {
    calculateStatistics(dangerList.value)
  }
}, { deep: true })

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

// 挂牌督办
const handleStartSupervision = async () => {
  // 这里需要获取选中的行，假设使用了 tableRef
  const selected = tableRef.value?.getSelectionRows()
  if (!selected || selected.length === 0) {
    ElMessage.warning('请选择要挂牌督办的隐患')
    return
  }

  for (const danger of selected) {
    try {
      // 假设 dangerSupervision 是已导入的 API 函数
      const result = await dangerSupervision({
        action: 'identify',
        dangerId: danger._id
      })
      if (result.success) {
        ElMessage.success(`隐患 "${danger.dangerDescription}" 挂牌督办成功`)
      } else {
        ElMessage.error(`隐患 "${danger.dangerDescription}" 挂牌督办失败: ${result.error}`)
      }
    } catch (error: any) {
      ElMessage.error(`挂牌督办失败: ${error.message}`)
    }
  }
  loadDangerList()
}

// 提交验证
const handleSubmitVerification = async () => {
  // 这里需要获取选中的行，假设使用了 tableRef
  const selected = tableRef.value?.getSelectionRows()
  if (!selected || selected.length === 0) {
    ElMessage.warning('请选择要提交验证的隐患')
    return
  }

  for (const danger of selected) {
    try {
      // 假设 dangerSupervision 是已导入的 API 函数
      const result = await dangerSupervision({
        action: 'submit_verification',
        dangerId: danger._id
      })
      if (result.success) {
        ElMessage.success(`隐患 "${danger.dangerDescription}" 验证申请已提交`)
      } else {
        ElMessage.error(`提交验证失败: ${result.error}`)
      }
    } catch (error: any) {
      ElMessage.error(`提交验证失败: ${error.message}`)
    }
  }
  loadDangerList()
}

// 导出
const handleExport = () => {
  // 定义需要导出的字段和对应的中文表头
  const exportFields = {
    dangerLocation: '隐患地点',
    dangerPart: '隐患部位',
    dangerLevel: '隐患等级',
    dangerCategory: '隐患类别',
    dangerDescription: '隐患描述',
    responsibleDept: '责任部门',
    responsiblePerson: '责任人',
    plannedCompleteDate: '计划完成日期',
    actualCompleteDate: '实际完成日期',
    status: '状态',
    complianceStatus: '合规状态',
    supervisionStatus: '督办状态',
    discoveryDate: '发现日期',
    discoverer: '发现人',
    findMethod: '发现方式'
  }

  // 转换数据格式
  const formattedData = dangerList.value.map(item => {
    const formattedItem: Record<string, any> = {};
    
    // 遍历导出字段
    for (const [key, label] of Object.entries(exportFields)) {
      const fieldKey = key as keyof Danger;
      let value = item[fieldKey] || '';
      
      // 格式化日期字段
      if (key === 'plannedCompleteDate' || key === 'actualCompleteDate' || 
          key === 'discoveryDate' || key === 'verificationDate') {
        value = typeof value === 'string' ? formatDate(value, 'YYYY-MM-DD') : '';
      }
      
      formattedItem[label] = value;
    }
    
    return formattedItem;
  });

  exportToCSV(formattedData, `隐患列表_${formatDate(new Date(), 'YYYYMMDD')}.csv`)
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

.view-content {
  max-height: 600px;
  overflow-y: auto;
}

.info-item {
  margin-bottom: 16px;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
}

.info-label {
  width: 120px;
  font-weight: 500;
  color: #606266;
  text-align: right;
  padding-right: 12px;
  box-sizing: border-box;
}

.info-value {
  flex: 1;
  min-width: 200px;
  word-break: break-all;
}

.info-value .el-progress {
  margin-top: 4px;
}

/* 统计图表样式 */
.statistics-card {
  margin-bottom: 20px;
}

.statistics-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #303133;
}

.chart-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.chart-item {
  flex: 1;
  min-width: 300px;
  background-color: #fafafa;
  padding: 15px;
  border-radius: 8px;
}

.chart-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 15px;
  color: #606266;
  text-align: center;
}

.chart {
  width: 100%;
  height: 300px;
}

@media screen and (max-width: 768px) {
  .chart-container {
    flex-direction: column;
  }
  
  .chart-item {
    min-width: 100%;
  }
}
</style>