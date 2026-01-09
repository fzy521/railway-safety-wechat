<template>
  <div class="statistics-page">
    <!-- 时间选择 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="统计周期">
          <el-select v-model="filterForm.period" placeholder="请选择" @change="handlePeriodChange">
            <el-option label="本月" value="month" />
            <el-option label="本季度" value="quarter" />
            <el-option label="本年" value="year" />
            <el-option label="自定义" value="custom" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="filterForm.period === 'custom'" label="开始日期">
          <el-date-picker
            v-model="filterForm.startDate"
            type="date"
            placeholder="选择日期"
            style="width: 140px"
          />
        </el-form-item>

        <el-form-item v-if="filterForm.period === 'custom'" label="结束日期">
          <el-date-picker
            v-model="filterForm.endDate"
            type="date"
            placeholder="选择日期"
            style="width: 140px"
          />
        </el-form-item>

        <el-form-item label="月度报表">
          <el-date-picker
            v-model="filterForm.month"
            type="month"
            placeholder="选择月份"
            format="YYYY年MM月"
            value-format="YYYY-MM"
            style="width: 160px"
            @change="handleMonthChange"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="loadData">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button type="success" @click="handleExportReport">
            <el-icon><Download /></el-icon>
            导出报表
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计概览 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon risk">
              <el-icon :size="40"><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overview.riskCount }}</div>
              <div class="stat-label">风险总数</div>
              <div class="stat-trend" :class="overview.riskTrend > 0 ? 'up' : 'down'">
                <el-icon><Top v-if="overview.riskTrend > 0" /><Bottom v-else /></el-icon>
                {{ Math.abs(overview.riskTrend) }}%
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon danger">
              <el-icon :size="40"><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overview.dangerCount }}</div>
              <div class="stat-label">隐患总数</div>
              <div class="stat-trend" :class="overview.dangerTrend > 0 ? 'up' : 'down'">
                <el-icon><Top v-if="overview.dangerTrend > 0" /><Bottom v-else /></el-icon>
                {{ Math.abs(overview.dangerTrend) }}%
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon closed">
              <el-icon :size="40"><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overview.closedRate }}%</div>
              <div class="stat-label">隐患闭环率</div>
              <div class="stat-trend" :class="overview.closedTrend > 0 ? 'up' : 'down'">
                <el-icon><Top v-if="overview.closedTrend > 0" /><Bottom v-else /></el-icon>
                {{ Math.abs(overview.closedTrend) }}%
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon inspection">
              <el-icon :size="40"><Checked /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overview.inspectionCount }}</div>
              <div class="stat-label">巡检次数</div>
              <div class="stat-trend" :class="overview.inspectionTrend > 0 ? 'up' : 'down'">
                <el-icon><Top v-if="overview.inspectionTrend > 0" /><Bottom v-else /></el-icon>
                {{ Math.abs(overview.inspectionTrend) }}%
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-row">
      <!-- 风险趋势图 -->
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>风险趋势分析</span>
            </div>
          </template>
          <div ref="riskTrendChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 隐患趋势图 -->
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>隐患趋势分析</span>
            </div>
          </template>
          <div ref="dangerTrendChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="charts-row">
      <!-- 风险等级分布 -->
      <el-col :xs="24" :lg="8">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>风险等级分布</span>
            </div>
          </template>
          <div ref="riskLevelChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 隐患类别分布 -->
      <el-col :xs="24" :lg="8">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>隐患类别分布</span>
            </div>
          </template>
          <div ref="dangerCategoryChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 部门隐患统计 -->
      <el-col :xs="24" :lg="8">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>部门隐患统计</span>
            </div>
          </template>
          <div ref="deptDangerChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="charts-row">
      <!-- 安全评分趋势 -->
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>安全评分趋势</span>
            </div>
          </template>
          <div ref="safetyScoreTrendChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 风险管控效果 -->
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>风险管控效果</span>
            </div>
          </template>
          <div ref="riskManagementEffectChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="charts-row">
      <!-- 巡检完成情况 -->
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>巡检完成情况</span>
            </div>
          </template>
          <div ref="inspectionCompletionChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 安全指标对比 -->
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>安全指标对比</span>
            </div>
          </template>
          <div ref="safetyMetricsCompareChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 月度隐患排查报表 -->
    <el-card class="table-card" v-if="monthlyHazardReport">
      <template #header>
        <div class="card-header">
          <span>{{ monthlyHazardReport.month }}月度隐患排查报表</span>
        </div>
      </template>
      
      <el-row :gutter="20" class="monthly-report-row">
        <el-col :xs="24" :sm="12" :md="6">
          <div class="monthly-stat-item">
            <div class="stat-label">总检查次数</div>
            <div class="stat-value">{{ monthlyHazardReport.totalInspections }}</div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <div class="monthly-stat-item">
            <div class="stat-label">已完成检查</div>
            <div class="stat-value">{{ monthlyHazardReport.completedInspections }}</div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <div class="monthly-stat-item">
            <div class="stat-label">检查覆盖率</div>
            <div class="stat-value">{{ monthlyHazardReport.inspectionCoverage }}%</div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <div class="monthly-stat-item">
            <div class="stat-label">隐患总数</div>
            <div class="stat-value">{{ monthlyHazardReport.hazardCount }}</div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <div class="monthly-stat-item">
            <div class="stat-label">重大隐患</div>
            <div class="stat-value">{{ monthlyHazardReport.majorHazardCount }}</div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <div class="monthly-stat-item">
            <div class="stat-label">一般隐患</div>
            <div class="stat-value">{{ monthlyHazardReport.generalHazardCount }}</div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <div class="monthly-stat-item">
            <div class="stat-label">已整改隐患</div>
            <div class="stat-value">{{ monthlyHazardReport.closedHazardCount }}</div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <div class="monthly-stat-item">
            <div class="stat-label">整改率</div>
            <div class="stat-value">{{ monthlyHazardReport.closureRate }}%</div>
          </div>
        </el-col>
      </el-row>
      
      <div class="monthly-report-charts">
        <el-row :gutter="20">
          <el-col :xs="24" :md="12">
            <el-card class="chart-card">
              <template #header>
                <div class="card-header">
                  <span>部门隐患分布</span>
                </div>
              </template>
              <div ref="departmentHazardChartRef" class="chart-container"></div>
            </el-card>
          </el-col>
          <el-col :xs="24" :md="12">
            <el-card class="chart-card">
              <template #header>
                <div class="card-header">
                  <span>隐患类别分布</span>
                </div>
              </template>
              <div ref="categoryHazardChartRef" class="chart-container"></div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 详细数据表格 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>详细统计数据</span>
          <el-button type="primary" link @click="handleExportDetail">
            <el-icon><Download /></el-icon>
            导出详细数据
          </el-button>
        </div>
      </template>

      <el-table :data="detailData" border stripe>
        <el-table-column type="index" label="序号" width="60" align="center" />

        <el-table-column prop="category" label="类别" width="120" />

        <el-table-column prop="totalCount" label="总数" width="100" align="center" />

        <el-table-column prop="majorCount" label="重大" width="80" align="center">
          <template #default="{ row }">
            <span style="color: #f56c6c">{{ row.majorCount }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="generalCount" label="一般" width="80" align="center" />

        <el-table-column prop="closedCount" label="已整改" width="100" align="center">
          <template #default="{ row }">
            <span style="color: #67c23a">{{ row.closedCount }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="pendingCount" label="待整改" width="100" align="center">
          <template #default="{ row }">
            <span style="color: #e6a23c">{{ row.pendingCount }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="closureRate" label="整改率" width="100" align="center">
          <template #default="{ row }">
            <el-progress :percentage="row.closureRate" :color="getProgressColor(row.closureRate)" />
          </template>
        </el-table-column>

        <el-table-column prop="avgDays" label="平均整改天数" width="130" align="center" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Search,
  Download,
  Warning,
  Document,
  CircleCheck,
  Checked,
  Top,
  Bottom
} from '@element-plus/icons-vue'
import { getSafetyMetrics, getMonthlyReport } from '@/api/cloud'
import { formatDate, getProgressColor, exportToCSV } from '@/utils'
import * as echarts from 'echarts'

// 筛选表单
const filterForm = reactive({
  period: 'month',
  startDate: '',
  endDate: '',
  month: new Date().toISOString().slice(0, 7) // 默认当前月份 YYYY-MM格式
})

// 统计概览
const overview = ref({
  riskCount: 45,
  riskTrend: 5.2,
  dangerCount: 23,
  dangerTrend: -3.1,
  closedRate: 78.3,
  closedTrend: 2.5,
  inspectionCount: 156,
  inspectionTrend: 8.7
})

// 月度隐患排查报表数据
const monthlyHazardReport = ref<MonthlyHazardReportData | null>(null)

// 详细数据
const detailData = ref([
  {
    category: '行车安全',
    totalCount: 8,
    majorCount: 2,
    generalCount: 6,
    closedCount: 6,
    pendingCount: 2,
    closureRate: 75,
    avgDays: 15
  },
  {
    category: '人身安全',
    totalCount: 5,
    majorCount: 1,
    generalCount: 4,
    closedCount: 4,
    pendingCount: 1,
    closureRate: 80,
    avgDays: 12
  },
  {
    category: '外部环境',
    totalCount: 4,
    majorCount: 0,
    generalCount: 4,
    closedCount: 3,
    pendingCount: 1,
    closureRate: 75,
    avgDays: 20
  },
  {
    category: '特种设备',
    totalCount: 3,
    majorCount: 0,
    generalCount: 3,
    closedCount: 3,
    pendingCount: 0,
    closureRate: 100,
    avgDays: 10
  },
  {
    category: '消防安全',
    totalCount: 3,
    majorCount: 0,
    generalCount: 3,
    closedCount: 2,
    pendingCount: 1,
    closureRate: 67,
    avgDays: 18
  }
])

// 图表引用
const riskTrendChartRef = ref<HTMLElement>()
const dangerTrendChartRef = ref<HTMLElement>()
const riskLevelChartRef = ref<HTMLElement>()
const dangerCategoryChartRef = ref<HTMLElement>()
const deptDangerChartRef = ref<HTMLElement>()
const safetyScoreTrendChartRef = ref<HTMLElement>()
const riskManagementEffectChartRef = ref<HTMLElement>()
const inspectionCompletionChartRef = ref<HTMLElement>()
const safetyMetricsCompareChartRef = ref<HTMLElement>()
// 月度报表图表引用
const departmentHazardChartRef = ref<HTMLElement>()
const categoryHazardChartRef = ref<HTMLElement>()

// 图表实例
let riskTrendChart: echarts.ECharts | null = null
let dangerTrendChart: echarts.ECharts | null = null
let riskLevelChart: echarts.ECharts | null = null
let dangerCategoryChart: echarts.ECharts | null = null
let deptDangerChart: echarts.ECharts | null = null
let safetyScoreTrendChart: echarts.ECharts | null = null
let riskManagementEffectChart: echarts.ECharts | null = null
let inspectionCompletionChart: echarts.ECharts | null = null
let safetyMetricsCompareChart: echarts.ECharts | null = null
let departmentHazardChart: echarts.ECharts | null = null
let categoryHazardChart: echarts.ECharts | null = null

// 初始化风险趋势图
const initRiskTrendChart = () => {
  if (!riskTrendChartRef.value) return

  riskTrendChart = echarts.init(riskTrendChartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['新增风险', '关闭风险']
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '新增风险',
        type: 'line',
        data: [5, 8, 6, 10, 12, 9],
        smooth: true,
        itemStyle: { color: '#f56c6c' }
      },
      {
        name: '关闭风险',
        type: 'line',
        data: [3, 6, 4, 8, 10, 7],
        smooth: true,
        itemStyle: { color: '#67c23a' }
      }
    ]
  }

  riskTrendChart.setOption(option)
}

// 初始化隐患趋势图
const initDangerTrendChart = () => {
  if (!dangerTrendChartRef.value) return

  dangerTrendChart = echarts.init(dangerTrendChartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['新增隐患', '已整改', '超期未完成']
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '新增隐患',
        type: 'line',
        data: [5, 8, 6, 10, 12, 9],
        smooth: true,
        itemStyle: { color: '#f56c6c' }
      },
      {
        name: '已整改',
        type: 'line',
        data: [4, 7, 5, 9, 11, 8],
        smooth: true,
        itemStyle: { color: '#67c23a' }
      },
      {
        name: '超期未完成',
        type: 'line',
        data: [1, 1, 1, 1, 1, 1],
        smooth: true,
        itemStyle: { color: '#e6a23c' }
      }
    ]
  }

  dangerTrendChart.setOption(option)
}

// 初始化风险等级分布图
const initRiskLevelChart = () => {
  if (!riskLevelChartRef.value) return

  riskLevelChart = echarts.init(riskLevelChartRef.value)

  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '风险等级',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 5, name: '重大风险', itemStyle: { color: '#f56c6c' } },
          { value: 10, name: '较大风险', itemStyle: { color: '#e6a23c' } },
          { value: 20, name: '一般风险', itemStyle: { color: '#409eff' } },
          { value: 10, name: '低风险', itemStyle: { color: '#67c23a' } }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }

  riskLevelChart.setOption(option)
}

// 初始化隐患类别分布图
const initDangerCategoryChart = () => {
  if (!dangerCategoryChartRef.value) return

  dangerCategoryChart = echarts.init(dangerCategoryChartRef.value)

  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '隐患类别',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 8, name: '行车安全' },
          { value: 5, name: '人身安全' },
          { value: 4, name: '外部环境' },
          { value: 3, name: '特种设备' },
          { value: 3, name: '消防安全' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }

  dangerCategoryChart.setOption(option)
}

// 初始化部门隐患统计图
const initDeptDangerChart = () => {
  if (!deptDangerChartRef.value) return

  deptDangerChart = echarts.init(deptDangerChartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['工务段', '电务段', '运输部', '机务段', '安监部']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '隐患数量',
        type: 'bar',
        data: [8, 6, 5, 3, 1],
        itemStyle: { color: '#409eff' }
      }
    ]
  }

  deptDangerChart.setOption(option)
}

// 初始化安全评分趋势图
const initSafetyScoreTrendChart = () => {
  if (!safetyScoreTrendChartRef.value) return

  safetyScoreTrendChart = echarts.init(safetyScoreTrendChartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['安全评分', '目标评分']
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100
    },
    series: [
      {
        name: '安全评分',
        type: 'line',
        smooth: true,
        data: [78, 82, 85, 88, 83, 90],
        itemStyle: { color: '#409eff' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0)' }
          ])
        }
      },
      {
        name: '目标评分',
        type: 'line',
        smooth: true,
        data: [90, 90, 90, 90, 90, 90],
        itemStyle: { color: '#f56c6c' },
        lineStyle: { type: 'dashed' }
      }
    ]
  }

  safetyScoreTrendChart.setOption(option)
}

// 初始化风险管控效果图表
const initRiskManagementEffectChart = () => {
  if (!riskManagementEffectChartRef.value) return

  riskManagementEffectChart = echarts.init(riskManagementEffectChartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['风险等级降低', '风险数量减少', '风险管控投入']
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '风险等级降低',
        type: 'bar',
        data: [2, 3, 1, 4, 2, 3],
        itemStyle: { color: '#67c23a' }
      },
      {
        name: '风险数量减少',
        type: 'bar',
        data: [5, 4, 6, 7, 5, 8],
        itemStyle: { color: '#409eff' }
      },
      {
        name: '风险管控投入',
        type: 'line',
        data: [120, 150, 130, 180, 160, 200],
        itemStyle: { color: '#e6a23c' },
        smooth: true
      }
    ]
  }

  riskManagementEffectChart.setOption(option)
}

// 初始化巡检完成情况图表
const initInspectionCompletionChart = () => {
  if (!inspectionCompletionChartRef.value) return

  inspectionCompletionChart = echarts.init(inspectionCompletionChartRef.value)

  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '巡检完成率',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '16',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 85, name: '已完成', itemStyle: { color: '#67c23a' } },
          { value: 10, name: '进行中', itemStyle: { color: '#409eff' } },
          { value: 5, name: '未开始', itemStyle: { color: '#f56c6c' } }
        ]
      }
    ]
  }

  inspectionCompletionChart.setOption(option)
}

// 初始化安全指标对比图表
const initSafetyMetricsCompareChart = () => {
  if (!safetyMetricsCompareChartRef.value) return

  safetyMetricsCompareChart = echarts.init(safetyMetricsCompareChartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['隐患数量', '整改率', '风险等级', '安全评分']
    },
    radar: {
      indicator: [
        { name: '工务段', max: 100 },
        { name: '电务段', max: 100 },
        { name: '运输部', max: 100 },
        { name: '机务段', max: 100 },
        { name: '安监部', max: 100 }
      ]
    },
    series: [
      {
        name: '安全指标',
        type: 'radar',
        data: [
          {
            value: [85, 78, 90, 82, 95],
            name: '整改率'
          },
          {
            value: [70, 75, 80, 68, 85],
            name: '安全评分'
          },
          {
            value: [60, 65, 70, 58, 75],
            name: '风险等级'
          }
        ]
      }
    ]
  }

  safetyMetricsCompareChart.setOption(option)
}

// 初始化部门隐患分布图（月度报表）
const initDepartmentHazardChart = () => {
  if (!departmentHazardChartRef.value) return

  departmentHazardChart = echarts.init(departmentHazardChartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: [],
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '隐患数量',
        type: 'bar',
        data: [],
        itemStyle: { color: '#409eff' }
      }
    ]
  }

  departmentHazardChart.setOption(option)
}

// 初始化隐患类别分布图（月度报表）
const initCategoryHazardChart = () => {
  if (!categoryHazardChartRef.value) return

  categoryHazardChart = echarts.init(categoryHazardChartRef.value)

  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '隐患类别',
        type: 'pie',
        radius: '60%',
        data: [],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }

  categoryHazardChart.setOption(option)
}

// 更新风险趋势图
const updateRiskTrendChart = (data: RiskTrendData) => {
  if (!riskTrendChart) return

  const option = {
    xAxis: {
      data: data.newRisks.categories
    },
    series: [
      {
        name: '新增风险',
        data: data.newRisks.values
      },
      {
        name: '关闭风险',
        data: data.closedRisks.values
      }
    ]
  }

  riskTrendChart.setOption(option)
}

// 更新隐患趋势图
const updateDangerTrendChart = (data: DangerTrendData) => {
  if (!dangerTrendChart) return

  const option = {
    xAxis: {
      data: data.newDangers.categories
    },
    series: [
      {
        name: '新增隐患',
        data: data.newDangers.values
      },
      {
        name: '已整改',
        data: data.closedDangers.values
      },
      {
        name: '超期未完成',
        data: data.overdueDangers.values
      }
    ]
  }

  dangerTrendChart.setOption(option)
}

// 更新风险等级分布图
const updateRiskLevelChart = (data: RiskLevelData[]) => {
  if (!riskLevelChart) return

  const option = {
    series: [
      {
        data: data
      }
    ]
  }

  riskLevelChart.setOption(option)
}

// 更新隐患类别分布图
const updateDangerCategoryChart = (data: DangerCategoryData[]) => {
  if (!dangerCategoryChart) return

  const option = {
    series: [
      {
        data: data
      }
    ]
  }

  dangerCategoryChart.setOption(option)
}

// 更新部门隐患统计图
const updateDeptDangerChart = (data: DeptDangerData[]) => {
  if (!deptDangerChart) return

  const option = {
    xAxis: {
      data: data.map(item => item.name)
    },
    series: [
      {
        data: data.map(item => item.value)
      }
    ]
  }

  deptDangerChart.setOption(option)
}

// 更新安全评分趋势图
const updateSafetyScoreTrendChart = (data: SafetyScoreTrendData) => {
  if (!safetyScoreTrendChart) return

  const option = {
    xAxis: {
      data: data.actualScores.categories
    },
    series: [
      {
        name: '安全评分',
        data: data.actualScores.values
      },
      {
        name: '目标评分',
        data: data.targetScores.values
      }
    ]
  }

  safetyScoreTrendChart.setOption(option)
}

// 更新风险管控效果图表
const updateRiskManagementEffectChart = (data: RiskManagementEffectData) => {
  if (!riskManagementEffectChart) return

  const option = {
    xAxis: {
      data: data.reducedLevels.categories
    },
    series: [
      {
        name: '风险等级降低',
        data: data.reducedLevels.values
      },
      {
        name: '风险数量减少',
        data: data.reducedCounts.values
      },
      {
        name: '风险管控投入',
        data: data.managementInputs.values
      }
    ]
  }

  riskManagementEffectChart.setOption(option)
}

// 更新巡检完成情况图表
const updateInspectionCompletionChart = (data: InspectionCompletionData[]) => {
  if (!inspectionCompletionChart) return

  const option = {
    series: [
      {
        data: data
      }
    ]
  }

  inspectionCompletionChart.setOption(option)
}

// 更新安全指标对比图表
const updateSafetyMetricsCompareChart = (data: SafetyMetricsCompareData) => {
  if (!safetyMetricsCompareChart) return

  const option = {
    radar: {
      indicator: data.indicator
    },
    series: [
      {
        data: data.data
      }
    ]
  }

  safetyMetricsCompareChart.setOption(option)
}

// 更新部门隐患分布图（月度报表）
const updateDepartmentHazardChart = (data: { department: string; count: number }[]) => {
  if (!departmentHazardChart) return

  const option = {
    xAxis: {
      data: data.map(item => item.department)
    },
    series: [
      {
        data: data.map(item => item.count)
      }
    ]
  }

  departmentHazardChart.setOption(option)
}

// 更新隐患类别分布图（月度报表）
const updateCategoryHazardChart = (data: { category: string; count: number }[]) => {
  if (!categoryHazardChart) return

  const option = {
    series: [
      {
        data: data.map(item => ({ name: item.category, value: item.count }))
      }
    ]
  }

  categoryHazardChart.setOption(option)
}

// 数据类型定义
interface ChartData {
  categories: string[]
  values: number[]
}

interface RiskTrendData {
  newRisks: ChartData
  closedRisks: ChartData
}

interface DangerTrendData {
  newDangers: ChartData
  closedDangers: ChartData
  overdueDangers: ChartData
}

interface RiskLevelData {
  name: string
  value: number
  itemStyle: { color: string }
}

interface DangerCategoryData {
  name: string
  value: number
}

interface DeptDangerData {
  name: string
  value: number
}

interface SafetyScoreTrendData {
  actualScores: ChartData
  targetScores: ChartData
}

interface RiskManagementEffectData {
  reducedLevels: ChartData
  reducedCounts: ChartData
  managementInputs: ChartData
}

interface InspectionCompletionData {
  name: string
  value: number
  itemStyle: { color: string }
}

interface SafetyMetricsCompareData {
  indicator: { name: string; max: number }[]
  data: { value: number[]; name: string }[]
}

// 月度隐患排查报表数据结构
interface MonthlyHazardReportData {
  month: string
  totalInspections: number
  completedInspections: number
  inspectionCoverage: number
  hazardCount: number
  majorHazardCount: number
  generalHazardCount: number
  closedHazardCount: number
  closureRate: number
  avgClosureDays: number
  hazardByDepartment: { department: string; count: number }[]
  hazardByCategory: { category: string; count: number }[]
  dailyHazardTrend: { date: string; count: number }[]
}

interface SafetyMetricsResult {
  overview: {
    riskCount: number
    riskTrend: number
    dangerCount: number
    dangerTrend: number
    closedRate: number
    closedTrend: number
    inspectionCount: number
    inspectionTrend: number
  }
  detailData: any[]
  riskTrend: RiskTrendData
  dangerTrend: DangerTrendData
  riskLevel: RiskLevelData[]
  dangerCategory: DangerCategoryData[]
  deptDanger: DeptDangerData[]
  safetyScoreTrend: SafetyScoreTrendData
  riskManagementEffect: RiskManagementEffectData
  inspectionCompletion: InspectionCompletionData[]
  safetyMetricsCompare: SafetyMetricsCompareData
}

// 模拟数据生成函数
const generateMockData = (): SafetyMetricsResult => {
  // 生成时间序列数据
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  
  // 生成随机数函数
  const random = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min
  const randomFloat = (min: number, max: number, decimals: number = 1): number => {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals))
  }
  
  // 生成趋势数据
  const generateTrendData = (min: number, max: number, count: number): number[] => {
    return Array.from({ length: count }, () => random(min, max))
  }
  
  return {
    overview: {
      riskCount: random(30, 60),
      riskTrend: randomFloat(-10, 15),
      dangerCount: random(20, 40),
      dangerTrend: randomFloat(-10, 15),
      closedRate: randomFloat(70, 95),
      closedTrend: randomFloat(-5, 8),
      inspectionCount: random(100, 200),
      inspectionTrend: randomFloat(-5, 15)
    },
    detailData: [
      {
        category: '行车安全',
        totalCount: random(5, 15),
        majorCount: random(0, 5),
        generalCount: random(5, 10),
        closedCount: random(3, 15),
        pendingCount: random(0, 5),
        closureRate: random(60, 100),
        avgDays: random(5, 30)
      },
      {
        category: '人身安全',
        totalCount: random(5, 15),
        majorCount: random(0, 5),
        generalCount: random(5, 10),
        closedCount: random(3, 15),
        pendingCount: random(0, 5),
        closureRate: random(60, 100),
        avgDays: random(5, 30)
      },
      {
        category: '外部环境',
        totalCount: random(5, 15),
        majorCount: random(0, 5),
        generalCount: random(5, 10),
        closedCount: random(3, 15),
        pendingCount: random(0, 5),
        closureRate: random(60, 100),
        avgDays: random(5, 30)
      },
      {
        category: '特种设备',
        totalCount: random(5, 15),
        majorCount: random(0, 5),
        generalCount: random(5, 10),
        closedCount: random(3, 15),
        pendingCount: random(0, 5),
        closureRate: random(60, 100),
        avgDays: random(5, 30)
      },
      {
        category: '消防安全',
        totalCount: random(5, 15),
        majorCount: random(0, 5),
        generalCount: random(5, 10),
        closedCount: random(3, 15),
        pendingCount: random(0, 5),
        closureRate: random(60, 100),
        avgDays: random(5, 30)
      }
    ],
    riskTrend: {
      newRisks: {
        categories: months.slice(0, 6),
        values: generateTrendData(3, 15, 6)
      },
      closedRisks: {
        categories: months.slice(0, 6),
        values: generateTrendData(2, 12, 6)
      }
    },
    dangerTrend: {
      newDangers: {
        categories: months.slice(0, 6),
        values: generateTrendData(2, 12, 6)
      },
      closedDangers: {
        categories: months.slice(0, 6),
        values: generateTrendData(1, 10, 6)
      },
      overdueDangers: {
        categories: months.slice(0, 6),
        values: generateTrendData(0, 3, 6)
      }
    },
    riskLevel: [
      { value: random(2, 8), name: '重大风险', itemStyle: { color: '#f56c6c' } },
      { value: random(5, 15), name: '较大风险', itemStyle: { color: '#e6a23c' } },
      { value: random(10, 25), name: '一般风险', itemStyle: { color: '#409eff' } },
      { value: random(5, 20), name: '低风险', itemStyle: { color: '#67c23a' } }
    ],
    dangerCategory: [
      { name: '行车安全', value: random(5, 15) },
      { name: '人身安全', value: random(3, 10) },
      { name: '外部环境', value: random(2, 8) },
      { name: '特种设备', value: random(2, 10) },
      { name: '消防安全', value: random(1, 8) }
    ],
    deptDanger: [
      { name: '工务段', value: random(5, 15) },
      { name: '电务段', value: random(3, 10) },
      { name: '运输部', value: random(2, 8) },
      { name: '机务段', value: random(2, 10) },
      { name: '安监部', value: random(1, 5) }
    ],
    safetyScoreTrend: {
      actualScores: {
        categories: months.slice(0, 6),
        values: generateTrendData(70, 95, 6)
      },
      targetScores: {
        categories: months.slice(0, 6),
        values: Array.from({ length: 6 }, () => 90)
      }
    },
    riskManagementEffect: {
      reducedLevels: {
        categories: months.slice(0, 6),
        values: generateTrendData(1, 5, 6)
      },
      reducedCounts: {
        categories: months.slice(0, 6),
        values: generateTrendData(2, 10, 6)
      },
      managementInputs: {
        categories: months.slice(0, 6),
        values: generateTrendData(50, 200, 6)
      }
    },
    inspectionCompletion: [
      { value: random(70, 95), name: '已完成', itemStyle: { color: '#67c23a' } },
      { value: random(5, 20), name: '进行中', itemStyle: { color: '#409eff' } },
      { value: random(0, 10), name: '未开始', itemStyle: { color: '#f56c6c' } }
    ],
    safetyMetricsCompare: {
      indicator: [
        { name: '工务段', max: 100 },
        { name: '电务段', max: 100 },
        { name: '运输部', max: 100 },
        { name: '机务段', max: 100 },
        { name: '安监部', max: 100 }
      ],
      data: [
        {
          value: [random(70, 95), random(70, 95), random(70, 95), random(70, 95), random(70, 95)],
          name: '整改率'
        },
        {
          value: [random(65, 90), random(65, 90), random(65, 90), random(65, 90), random(65, 90)],
          name: '安全评分'
        },
        {
          value: [random(50, 80), random(50, 80), random(50, 80), random(50, 80), random(50, 80)],
          name: '风险等级'
        }
      ]
    }
  }
}

// 生成月度隐患排查报表模拟数据
const generateMockMonthlyData = (year: number, month: number): MonthlyHazardReportData => {
  // 生成该月的日期数组
  const daysInMonth = new Date(year, month, 0).getDate()
  const dailyTrend = Array.from({ length: daysInMonth }, (_, i) => ({
    date: `${year}-${String(month).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`,
    count: Math.floor(Math.random() * 6) // 0-5个隐患
  }))
  
  const departments = ['工务段', '电务段', '运输部', '机务段', '安监部']
  const categories = ['行车安全', '人身安全', '外部环境', '特种设备', '消防安全']
  
  const totalInspections = Math.floor(Math.random() * 101) + 100 // 100-200次检查
  const completedInspections = Math.floor(totalInspections * (Math.random() * 0.3 + 0.7)) // 70%-100%完成率
  const hazardCount = Math.floor(Math.random() * 31) + 20 // 20-50个隐患
  const majorHazardCount = Math.floor(hazardCount * (Math.random() * 0.3 + 0.1)) // 10%-40%重大隐患
  const generalHazardCount = hazardCount - majorHazardCount // 总隐患数减去重大隐患数
  const closedHazardCount = Math.floor(hazardCount * (Math.random() * 0.3 + 0.6)) // 60%-90%整改率
  
  return {
    month: `${year}-${String(month).padStart(2, '0')}`,
    totalInspections,
    completedInspections,
    inspectionCoverage: Math.floor(Math.random() * 26) + 70, // 70%-95%覆盖率
    hazardCount,
    majorHazardCount,
    generalHazardCount,
    closedHazardCount,
    closureRate: Math.round((closedHazardCount / hazardCount) * 100),
    avgClosureDays: Math.floor(Math.random() * 21) + 5, // 5-25天平均整改天数
    hazardByDepartment: departments.map(dept => ({
      department: dept,
      count: Math.floor(Math.random() * 14) + 2 // 2-15个隐患
    })),
    hazardByCategory: categories.map(category => ({
      category,
      count: Math.floor(Math.random() * 11) + 2 // 2-12个隐患
    })),
    dailyHazardTrend
  }
}

// 更新月度隐患排查报表
const updateMonthlyHazardReport = (data: MonthlyHazardReportData) => {
  monthlyHazardReport.value = data
  
  // 更新相关图表
  if (dangerTrendChart) {
    // 将每日趋势数据转换为适合图表的格式
    const dailyTrendData = {
      newDangers: {
        categories: data.dailyHazardTrend.map(item => item.date),
        values: data.dailyHazardTrend.map(item => item.count)
      },
      closedDangers: {
        categories: data.dailyHazardTrend.map(item => item.date),
        values: data.dailyHazardTrend.map(item => Math.floor(item.count * 0.8)) // 模拟关闭数量
      },
      overdueDangers: {
        categories: data.dailyHazardTrend.map(item => item.date),
        values: data.dailyHazardTrend.map(item => Math.floor(item.count * 0.2)) // 模拟超期数量
      }
    }
    
    updateDangerTrendChart(dailyTrendData)
  }
  
  // 更新月度报表的部门和类别图表
  updateDepartmentHazardChart(data.hazardByDepartment)
  updateCategoryHazardChart(data.hazardByCategory)
}

// 加载数据
const loadData = async () => {
  try {
    // 显示加载状态
    const loading = ElMessage.loading({
      message: '加载中...',
      duration: 0,
      background: 'rgba(0, 0, 0, 0.7)'
    })
    
    try {
      // 调用API获取数据
      const result = await getSafetyMetrics({
        startDate: filterForm.startDate,
        endDate: filterForm.endDate
      })
      
      // 由于API可能尚未实现，使用模拟数据
      const data: SafetyMetricsResult = result.result || generateMockData()
      
      // 更新统计概览数据
      overview.value = data.overview
      
      // 更新详细数据
      detailData.value = data.detailData
      
      // 更新各个图表
      updateRiskTrendChart(data.riskTrend)
      updateDangerTrendChart(data.dangerTrend)
      updateRiskLevelChart(data.riskLevel)
      updateDangerCategoryChart(data.dangerCategory)
      updateDeptDangerChart(data.deptDanger)
      updateSafetyScoreTrendChart(data.safetyScoreTrend)
      updateRiskManagementEffectChart(data.riskManagementEffect)
      updateInspectionCompletionChart(data.inspectionCompletion)
      updateSafetyMetricsCompareChart(data.safetyMetricsCompare)
      
      ElMessage.success('数据加载成功')
    } catch (error) {
      console.error('加载统计数据失败:', error)
      ElMessage.error('加载统计数据失败')
      
      // 使用模拟数据作为备份
      const mockData = generateMockData()
      overview.value = mockData.overview
      detailData.value = mockData.detailData
      updateRiskTrendChart(mockData.riskTrend)
      updateDangerTrendChart(mockData.dangerTrend)
      updateRiskLevelChart(mockData.riskLevel)
      updateDangerCategoryChart(mockData.dangerCategory)
      updateDeptDangerChart(mockData.deptDanger)
      updateSafetyScoreTrendChart(mockData.safetyScoreTrend)
      updateRiskManagementEffectChart(mockData.riskManagementEffect)
      updateInspectionCompletionChart(mockData.inspectionCompletion)
      updateSafetyMetricsCompareChart(mockData.safetyMetricsCompare)
    } finally {
      // 关闭加载状态
      loading.close()
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
    ElMessage.error('加载统计数据失败')
  }
}

// 周期变化
const handlePeriodChange = () => {
  loadData()
}

// 月份变化
const handleMonthChange = async () => {
  try {
    const loading = ElMessage.loading({
      message: '加载月度报表中...',
      duration: 0,
      background: 'rgba(0, 0, 0, 0.7)'
    })
    
    // 解析月份为年和月
    const [year, month] = filterForm.month.split('-').map(Number)
    
    // 调用月度报表API
    const result = await getMonthlyReport({ year, month })
    
    // 处理月度报表数据
    const monthlyData = result.result || generateMockMonthlyData(year, month)
    
    // 更新相关图表和数据
    updateMonthlyHazardReport(monthlyData)
    
    ElMessage.success('月度报表加载成功')
    
    loading.close()
  } catch (error) {
    console.error('加载月度报表失败:', error)
    ElMessage.error('加载月度报表失败')
  }
}

// 导出报表
const handleExportReport = () => {
  if (!monthlyHazardReport.value) {
    ElMessage.warning('没有可导出的月度报表数据')
    return
  }

  const report = monthlyHazardReport.value
  const exportData = []

  // 添加报表基本信息
  exportData.push({ 项目: '月份', 数值: report.month })
  exportData.push({ 项目: '总检查次数', 数值: report.totalInspections })
  exportData.push({ 项目: '已完成检查', 数值: report.completedInspections })
  exportData.push({ 项目: '检查覆盖率', 数值: `${report.inspectionCoverage}%` })
  exportData.push({ 项目: '隐患总数', 数值: report.hazardCount })
  exportData.push({ 项目: '重大隐患', 数值: report.majorHazardCount })
  exportData.push({ 项目: '一般隐患', 数值: report.generalHazardCount })
  exportData.push({ 项目: '已整改隐患', 数值: report.closedHazardCount })
  exportData.push({ 项目: '整改率', 数值: `${report.closureRate}%` })
  exportData.push({ 项目: '', 数值: '' })

  // 添加部门隐患分布
  exportData.push({ 项目: '部门隐患分布', 数值: '' })
  report.hazardByDepartment.forEach(dept => {
    exportData.push({ 项目: dept.department, 数值: dept.count })
  })
  exportData.push({ 项目: '', 数值: '' })

  // 添加隐患类别分布
  exportData.push({ 项目: '隐患类别分布', 数值: '' })
  report.hazardByCategory.forEach(category => {
    exportData.push({ 项目: category.category, 数值: category.count })
  })
  exportData.push({ 项目: '', 数值: '' })

  // 导出为CSV
  exportToCSV(exportData, `${report.month}月度隐患排查报表.csv`)
  ElMessage.success('报表导出成功')
}

// 导出详细数据
const handleExportDetail = () => {
  if (!detailData.value || detailData.value.length === 0) {
    ElMessage.warning('没有可导出的详细数据')
    return
  }

  // 转换数据格式，确保中文表头
  const exportData = detailData.value.map(item => {
    return {
      类别: item.category,
      总数: item.totalCount,
      重大: item.majorCount,
      一般: item.generalCount,
      已整改: item.closedCount,
      待整改: item.pendingCount,
      整改率: `${item.closureRate}%`,
      平均整改天数: item.avgDays
    }
  })

  // 导出为CSV
  const currentDate = new Date().toISOString().slice(0, 10)
  exportToCSV(exportData, `安全统计详细数据_${currentDate}.csv`)
  ElMessage.success('详细数据导出成功')
}

// 窗口大小改变时重绘图表
const handleResize = () => {
  riskTrendChart?.resize()
  dangerTrendChart?.resize()
  riskLevelChart?.resize()
  dangerCategoryChart?.resize()
  deptDangerChart?.resize()
  safetyScoreTrendChart?.resize()
  riskManagementEffectChart?.resize()
  inspectionCompletionChart?.resize()
  safetyMetricsCompareChart?.resize()
  departmentHazardChart?.resize()
  categoryHazardChart?.resize()
}

onMounted(() => {
  loadData()
  initRiskTrendChart()
  initDangerTrendChart()
  initRiskLevelChart()
  initDangerCategoryChart()
  initDeptDangerChart()
  initSafetyScoreTrendChart()
  initRiskManagementEffectChart()
  initInspectionCompletionChart()
  initSafetyMetricsCompareChart()
  initDepartmentHazardChart()
  initCategoryHazardChart()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  riskTrendChart?.dispose()
  dangerTrendChart?.dispose()
  riskLevelChart?.dispose()
  dangerCategoryChart?.dispose()
  deptDangerChart?.dispose()
  safetyScoreTrendChart?.dispose()
  riskManagementEffectChart?.dispose()
  inspectionCompletionChart?.dispose()
  safetyMetricsCompareChart?.dispose()
  departmentHazardChart?.dispose()
  categoryHazardChart?.dispose()
  safetyMetricsCompareChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.statistics-page {
  padding: 20px;
}

.filter-card {
  margin-bottom: 20px;
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

.stat-icon.risk {
  color: #f56c6c;
}

.stat-icon.danger {
  color: #e6a23c;
}

.stat-icon.closed {
  color: #67c23a;
}

.stat-icon.inspection {
  color: #409eff;
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

.stat-trend {
  font-size: 12px;
  margin-top: 4px;
}

.stat-trend.up {
  color: #f56c6c;
}

.stat-trend.down {
  color: #67c23a;
}

.charts-row {
  margin-bottom: 20px;
}

.chart-card,
.table-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  width: 100%;
  height: 300px;
}
</style>