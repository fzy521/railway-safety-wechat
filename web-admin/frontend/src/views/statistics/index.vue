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
import { formatDate, getProgressColor } from '@/utils'
import * as echarts from 'echarts'

// 筛选表单
const filterForm = reactive({
  period: 'month',
  startDate: '',
  endDate: ''
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

// 图表实例
let riskTrendChart: echarts.ECharts | null = null
let dangerTrendChart: echarts.ECharts | null = null
let riskLevelChart: echarts.ECharts | null = null
let dangerCategoryChart: echarts.ECharts | null = null
let deptDangerChart: echarts.ECharts | null = null

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

// 加载数据
const loadData = async () => {
  try {
    const result = await getSafetyMetrics({
      startDate: filterForm.startDate,
      endDate: filterForm.endDate
    })
    // 更新数据
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 周期变化
const handlePeriodChange = () => {
  loadData()
}

// 导出报表
const handleExportReport = () => {
  ElMessage.success('报表导出功能开发中')
}

// 导出详细数据
const handleExportDetail = () => {
  ElMessage.success('详细数据导出功能开发中')
}

// 窗口大小改变时重绘图表
const handleResize = () => {
  riskTrendChart?.resize()
  dangerTrendChart?.resize()
  riskLevelChart?.resize()
  dangerCategoryChart?.resize()
  deptDangerChart?.resize()
}

onMounted(() => {
  loadData()
  initRiskTrendChart()
  initDangerTrendChart()
  initRiskLevelChart()
  initDangerCategoryChart()
  initDeptDangerChart()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  riskTrendChart?.dispose()
  dangerTrendChart?.dispose()
  riskLevelChart?.dispose()
  dangerCategoryChart?.dispose()
  deptDangerChart?.dispose()
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