<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card risk-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="40"><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ quickStats.riskCount }}</div>
              <div class="stat-label">风险总数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card danger-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="40"><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ quickStats.dangerCount }}</div>
              <div class="stat-label">隐患总数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card inspection-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="40"><Checked /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ quickStats.inspectionCount }}</div>
              <div class="stat-label">巡检次数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card warning-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="40"><Bell /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ quickStats.warningCount }}</div>
              <div class="stat-label">预警数量</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-row">
      <!-- 风险等级分布 -->
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>风险等级分布</span>
            </div>
          </template>
          <div ref="riskPieChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 隐患治理趋势 -->
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>隐患治理趋势</span>
            </div>
          </template>
          <div ref="dangerLineChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="charts-row">
      <!-- 风险类别统计 -->
      <el-col :xs="24" :lg="8">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>风险类别统计</span>
            </div>
          </template>
          <div ref="riskBarChartRef" class="chart-container"></div>
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
          <div ref="dangerPieChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 部门风险分布 -->
      <el-col :xs="24" :lg="8">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>部门风险分布</span>
            </div>
          </template>
          <div ref="deptRiskChartRef" class="chart-container"></div>
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
          <div ref="inspectionChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 安全指标概览 -->
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>安全指标概览</span>
            </div>
          </template>
          <div ref="safetyMetricsChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近预警和待办 -->
    <el-row :gutter="20" class="lists-row">
      <el-col :xs="24" :lg="12">
        <el-card class="list-card">
          <template #header>
            <div class="card-header">
              <span>最近预警</span>
              <el-button type="primary" link @click="router.push('/warning')">
                查看全部
              </el-button>
            </div>
          </template>
          <el-table :data="recentWarnings" style="width: 100%">
            <el-table-column prop="warningLevel" label="级别" width="80">
              <template #default="{ row }">
                <el-tag :type="getWarningType(row.warningLevel)">
                  {{ row.warningLevel }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="warningTitle" label="预警内容" show-overflow-tooltip />
            <el-table-column prop="targetUnit" label="责任单位" width="120" />
            <el-table-column prop="deadline" label="截止日期" width="120">
              <template #default="{ row }">
                {{ formatDate(row.deadline, 'MM-DD') }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="12">
        <el-card class="list-card">
          <template #header>
            <div class="card-header">
              <span>待办事项</span>
            </div>
          </template>
          <el-table :data="todoList" style="width: 100%">
            <el-table-column prop="type" label="类型" width="100">
              <template #default="{ row }">
                <el-tag :type="row.type === '风险' ? 'warning' : 'danger'">
                  {{ row.type }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="content" label="内容" show-overflow-tooltip />
            <el-table-column prop="deadline" label="截止日期" width="120">
              <template #default="{ row }">
                {{ formatDate(row.deadline, 'MM-DD') }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default>
                <el-button type="primary" link size="small">处理</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { Warning, Document, Checked, Bell } from '@element-plus/icons-vue'
import { getQuickStats } from '@/api/cloud'
import { formatDate } from '@/utils'

const router = useRouter()

// 统计数据
const quickStats = ref({
  riskCount: 45,
  dangerCount: 23,
  inspectionCount: 156,
  warningCount: 8
})

// 最近预警
const recentWarnings = ref([
  {
    warningLevel: '红',
    warningTitle: '轨道连接螺栓松动风险预警',
    targetUnit: '工务段',
    deadline: '2025-01-15'
  },
  {
    warningLevel: '橙',
    warningTitle: '信号设备老化风险预警',
    targetUnit: '电务段',
    deadline: '2025-01-20'
  },
  {
    warningLevel: '黄',
    warningTitle: '作业人员疲劳风险预警',
    targetUnit: '运输部',
    deadline: '2025-01-25'
  },
  {
    warningLevel: '蓝',
    warningTitle: '设备维护记录不全预警',
    targetUnit: '机务段',
    deadline: '2025-01-30'
  }
])

// 待办事项
const todoList = ref([
  {
    type: '隐患',
    content: '重大隐患整改验收',
    deadline: '2025-01-10'
  },
  {
    type: '风险',
    content: '新增风险点评估',
    deadline: '2025-01-12'
  },
  {
    type: '隐患',
    content: '隐患治理方案审批',
    deadline: '2025-01-15'
  },
  {
    type: '风险',
    content: '风险管控措施更新',
    deadline: '2025-01-18'
  }
])

// 图表引用
const riskPieChartRef = ref<HTMLElement>()
const dangerLineChartRef = ref<HTMLElement>()
const riskBarChartRef = ref<HTMLElement>()
const dangerPieChartRef = ref<HTMLElement>()
const deptRiskChartRef = ref<HTMLElement>()
const inspectionChartRef = ref<HTMLElement>()
const safetyMetricsChartRef = ref<HTMLElement>()

// 图表实例
let riskPieChart: echarts.ECharts | null = null
let dangerLineChart: echarts.ECharts | null = null
let riskBarChart: echarts.ECharts | null = null
let dangerPieChart: echarts.ECharts | null = null
let deptRiskChart: echarts.ECharts | null = null
let inspectionChart: echarts.ECharts | null = null
let safetyMetricsChart: echarts.ECharts | null = null

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

// 初始化风险饼图
const initRiskPieChart = () => {
  if (!riskPieChartRef.value) return

  riskPieChart = echarts.init(riskPieChartRef.value)

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

  riskPieChart.setOption(option)
}

// 初始化隐患趋势图
const initDangerLineChart = () => {
  if (!dangerLineChartRef.value) return

  dangerLineChart = echarts.init(dangerLineChartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['新增隐患', '已整改']
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
      }
    ]
  }

  dangerLineChart.setOption(option)
}

// 初始化风险柱状图
const initRiskBarChart = () => {
  if (!riskBarChartRef.value) return

  riskBarChart = echarts.init(riskBarChartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['行为类', '设备类', '环境类', '管理类']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '风险数量',
        type: 'bar',
        data: [15, 20, 8, 2],
        itemStyle: { color: '#409eff' }
      }
    ]
  }

  riskBarChart.setOption(option)
}

// 初始化隐患饼图
const initDangerPieChart = () => {
  if (!dangerPieChartRef.value) return

  dangerPieChart = echarts.init(dangerPieChartRef.value)

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

  dangerPieChart.setOption(option)
}

// 初始化部门风险分布图
const initDeptRiskChart = () => {
  if (!deptRiskChartRef.value) return

  deptRiskChart = echarts.init(deptRiskChartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['重大风险', '较大风险', '一般风险', '低风险']
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
        name: '重大风险',
        type: 'bar',
        data: [3, 2, 1, 1, 0],
        itemStyle: { color: '#f56c6c' }
      },
      {
        name: '较大风险',
        type: 'bar',
        data: [4, 3, 2, 2, 1],
        itemStyle: { color: '#e6a23c' }
      },
      {
        name: '一般风险',
        type: 'bar',
        data: [8, 7, 5, 4, 2],
        itemStyle: { color: '#409eff' }
      },
      {
        name: '低风险',
        type: 'bar',
        data: [5, 4, 3, 2, 1],
        itemStyle: { color: '#67c23a' }
      }
    ]
  }

  deptRiskChart.setOption(option)
}

// 初始化巡检完成情况图
const initInspectionChart = () => {
  if (!inspectionChartRef.value) return

  inspectionChart = echarts.init(inspectionChartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['计划巡检', '实际完成', '完成率']
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: [
      {
        type: 'value',
        name: '巡检次数',
        position: 'left'
      },
      {
        type: 'value',
        name: '完成率(%)',
        position: 'right',
        min: 0,
        max: 100
      }
    ],
    series: [
      {
        name: '计划巡检',
        type: 'bar',
        data: [30, 32, 35, 33, 38, 36],
        itemStyle: { color: '#909399' }
      },
      {
        name: '实际完成',
        type: 'bar',
        data: [28, 30, 34, 31, 36, 35],
        itemStyle: { color: '#409eff' }
      },
      {
        name: '完成率',
        type: 'line',
        yAxisIndex: 1,
        data: [93, 94, 97, 94, 95, 97],
        smooth: true,
        itemStyle: { color: '#67c23a' }
      }
    ]
  }

  inspectionChart.setOption(option)
}

// 初始化安全指标概览图
const initSafetyMetricsChart = () => {
  if (!safetyMetricsChartRef.value) return

  safetyMetricsChart = echarts.init(safetyMetricsChartRef.value)

  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      bottom: 0,
      data: ['风险管控', '隐患治理', '安全培训', '设备管理']
    },
    radar: {
      indicator: [
        { name: '风险识别率', max: 100 },
        { name: '隐患整改率', max: 100 },
        { name: '培训完成率', max: 100 },
        { name: '设备完好率', max: 100 },
        { name: '检查覆盖率', max: 100 },
        { name: '应急准备', max: 100 }
      ]
    },
    series: [
      {
        name: '安全指标',
        type: 'radar',
        data: [
          {
            value: [95, 78, 92, 88, 90, 85],
            name: '风险管控'
          },
          {
            value: [82, 90, 85, 83, 87, 80],
            name: '隐患治理'
          },
          {
            value: [88, 85, 95, 87, 90, 89],
            name: '安全培训'
          },
          {
            value: [90, 87, 82, 93, 88, 91],
            name: '设备管理'
          }
        ]
      }
    ]
  }

  safetyMetricsChart.setOption(option)
}

// 加载数据
const loadData = async () => {
  try {
    const stats = await getQuickStats()
    quickStats.value = {
      ...quickStats.value,
      ...stats
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 窗口大小改变时重绘图表
const handleResize = () => {
  riskPieChart?.resize()
  dangerLineChart?.resize()
  riskBarChart?.resize()
  dangerPieChart?.resize()
  deptRiskChart?.resize()
  inspectionChart?.resize()
  safetyMetricsChart?.resize()
}

onMounted(() => {
  loadData()
  initRiskPieChart()
  initDangerLineChart()
  initRiskBarChart()
  initDangerPieChart()
  initDeptRiskChart()
  initInspectionChart()
  initSafetyMetricsChart()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  riskPieChart?.dispose()
  dangerLineChart?.dispose()
  riskBarChart?.dispose()
  dangerPieChart?.dispose()
  deptRiskChart?.dispose()
  inspectionChart?.dispose()
  safetyMetricsChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.dashboard {
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

.risk-card .stat-icon {
  color: #f56c6c;
}

.danger-card .stat-icon {
  color: #e6a23c;
}

.inspection-card .stat-icon {
  color: #409eff;
}

.warning-card .stat-icon {
  color: #67c23a;
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

.charts-row {
  margin-bottom: 20px;
}

.chart-card,
.list-card {
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

.lists-row {
  margin-bottom: 20px;
}
</style>