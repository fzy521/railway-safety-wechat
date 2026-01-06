# Web后台开发指导文档

## 一、项目概述

### 1.1 项目信息
- **项目名称**: 铁路安全监控系统 - Web管理后台
- **项目类型**: Vue 3 + TypeScript + Node.js
- **部署方式**: 微信云开发静态托管
- **数据访问**: 微信云开发HTTP API
- **开发模式**: 与小程序端并行开发，共享云数据库

### 1.2 项目位置
- **根目录**: `C:\Users\fzylu\code\railway_safety\`
- **Web后台目录**: `C:\Users\fzylu\code\railway_safety\web-admin\`
- **小程序目录**: `C:\Users\fzylu\code\railway_safety\miniprogram\`

### 1.3 开发环境要求
- Node.js >= 16.x
- npm >= 8.x
- VS Code（推荐）
- 微信开发者工具（用于云函数管理）

### 1.4 技术栈
- **前端**: Vue 3 + TypeScript + Vite
- **UI组件**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **HTTP客户端**: Axios
- **图表库**: ECharts
- **后端API**: 微信云开发HTTP API（调用小程序云函数）

---

## 二、项目架构

### 2.1 目录结构

```
web-admin/
├── frontend/                 # 前端项目
│   ├── src/
│   │   ├── api/             # API调用
│   │   │   ├── index.ts     # API配置
│   │   │   ├── auth.ts      # 用户认证
│   │   │   ├── risk.ts      # 风险管理
│   │   │   ├── danger.ts    # 隐患管理
│   │   │   ├── warning.ts   # 预警管理
│   │   │   ├── inspection.ts # 巡检管理
│   │   │   └── statistics.ts # 统计分析
│   │   ├── assets/          # 静态资源
│   │   ├── components/      # 公共组件
│   │   ├── layouts/         # 布局组件
│   │   ├── router/          # 路由配置
│   │   ├── stores/          # Pinia状态管理
│   │   ├── utils/           # 工具函数
│   │   ├── views/           # 页面组件
│   │   │   ├── auth/        # 认证相关
│   │   │   ├── dashboard/   # 仪表盘
│   │   │   ├── risk/        # 风险管理
│   │   │   ├── danger/      # 隐患管理
│   │   │   ├── warning/     # 预警管理
│   │   │   ├── inspection/  # 巡检管理
│   │   │   ├── statistics/  # 统计分析
│   │   │   └── system/      # 系统管理
│   │   ├── App.vue          # 根组件
│   │   └── main.ts          # 入口文件
│   ├── public/              # 公共资源
│   ├── index.html           # HTML模板
│   ├── package.json         # 依赖配置
│   ├── tsconfig.json        # TypeScript配置
│   ├── vite.config.ts       # Vite配置
│   └── .env.development     # 开发环境变量
│
├── backend/                 # 后端API服务（可选）
│   ├── src/
│   │   ├── controllers/     # 控制器
│   │   ├── services/        # 业务逻辑
│   │   ├── middleware/      # 中间件
│   │   ├── routes/          # 路由
│   │   └── utils/           # 工具函数
│   ├── package.json
│   └── tsconfig.json
│
└── docs/                    # 文档
    ├── web-api-documentation.md  # API接口文档
    └── development-guide.md      # 开发指南
```

### 2.2 系统架构图

```
┌─────────────────────────────────────┐
│         Web管理后台（Vue 3）         │
├─────────────────────────────────────┤
│  前端页面  │  状态管理  │  路由      │
└────────────┴────────────┴───────────┘
                │
                ▼
┌─────────────────────────────────────┐
│       API服务层（Axios）            │
├─────────────────────────────────────┤
│  用户认证  │  风险管理  │  统计分析  │
└────────────┴────────────┴───────────┘
                │
                ▼
┌─────────────────────────────────────┐
│    微信云开发HTTP API              │
├─────────────────────────────────────┤
│  Access Token认证  │  云函数调用   │
└─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│       微信云函数（小程序端）         │
├─────────────────────────────────────┤
│  login  │  risk-assessment  │  ... │
└─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│       微信云数据库                  │
├─────────────────────────────────────┤
│  risk_library  │  hidden_danger... │
└─────────────────────────────────────┘
```

---

## 三、开发步骤

### 阶段1：项目初始化（第1-2天）

#### 1.1 创建项目结构
```bash
# 在 railway-safety 根目录下
cd C:\Users\fzylu\code\railway_safety
mkdir web-admin
cd web-admin

# 创建前端项目
npm create vite@latest frontend -- --template vue-ts
cd frontend
npm install

# 安装依赖
npm install vue-router@4 pinia axios element-plus echarts
npm install -D @types/node
```

#### 1.2 配置开发环境
```typescript
// frontend/vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://api.weixin.qq.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

#### 1.3 配置环境变量
```bash
# frontend/.env.development
VITE_APP_TITLE=铁路安全管理系统
VITE_CLOUD_ENV_ID=cloud1-9gz3lqctb5e4f85d
VITE_APP_ID=你的APPID
VITE_APP_SECRET=你的SECRET
VITE_API_BASE=https://api.weixin.qq.com
```

### 阶段2：基础框架搭建（第3-5天）

#### 2.1 配置路由
```typescript
// frontend/src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Index.vue')
      },
      {
        path: 'risk',
        name: 'Risk',
        component: () => import('@/views/risk/Index.vue')
      },
      {
        path: 'danger',
        name: 'Danger',
        component: () => import('@/views/danger/Index.vue')
      },
      {
        path: 'warning',
        name: 'Warning',
        component: () => import('@/views/warning/Index.vue')
      },
      {
        path: 'inspection',
        name: 'Inspection',
        component: () => import('@/views/inspection/Index.vue')
      },
      {
        path: 'statistics',
        name: 'Statistics',
        component: () => import('@/views/statistics/Index.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
```

#### 2.2 配置Pinia状态管理
```typescript
// frontend/src/stores/user.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<any>(null)

  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  const setUserInfo = (info: any) => {
    userInfo.value = info
  }

  const logout = () => {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
  }

  return {
    token,
    userInfo,
    setToken,
    setUserInfo,
    logout
  }
})
```

#### 2.3 配置Axios
```typescript
// frontend/src/api/index.ts
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  timeout: 30000
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    ElMessage.error(error.message || '请求失败')
    return Promise.reject(error)
  }
)

export default api
```

### 阶段3：核心功能开发（第6-15天）

#### 3.1 用户登录功能
```typescript
// frontend/src/api/auth.ts
import api from './index'

export interface LoginParams {
  code: string
}

export interface LoginResponse {
  success: boolean
  data: {
    token: string
    user: any
  }
}

export const login = (params: LoginParams) => {
  return api.post<LoginResponse>('/tcb/invokecloudfunction', {
    env: import.meta.env.VITE_CLOUD_ENV_ID,
    name: 'login',
    data: params
  })
}
```

```vue
<!-- frontend/src/views/auth/Login.vue -->
<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2>铁路安全管理系统</h2>
      <el-button type="primary" @click="handleLogin" :loading="loading">
        微信登录
      </el-button>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/api/auth'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  try {
    // 这里需要集成微信登录SDK
    const code = '模拟的微信code'
    const res = await login({ code })
    
    if (res.success) {
      userStore.setToken(res.data.token)
      userStore.setUserInfo(res.data.user)
      router.push('/dashboard')
    }
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}
</script>
```

#### 3.2 风险管理模块
```typescript
// frontend/src/api/risk.ts
import api from './index'

export interface RiskListParams {
  page: number
  pageSize: number
  riskLevel?: number
  riskColor?: string
  status?: string
}

export interface RiskItem {
  _id: string
  riskName: string
  riskType: string
  location: string
  mValue: number
  e1Value: number
  e2Value: number
  sValue: number
  rValue: number
  riskLevel: number
  riskGrade: string
  riskColor: string
  checkFrequency: string
  status: string
}

export const getRiskList = (params: RiskListParams) => {
  return api.post('/tcb/invokecloudfunction', {
    env: import.meta.env.VITE_CLOUD_ENV_ID,
    name: 'getRisks',
    data: params
  })
}

export const getRiskDetail = (id: string) => {
  return api.post('/tcb/invokecloudfunction', {
    env: import.meta.env.VITE_CLOUD_ENV_ID,
    name: 'getRiskDetail',
    data: { id }
  })
}

export const calculateRiskLevel = (params: {
  m: number
  e1: number
  e2: number
  s: number
  riskId?: string
}) => {
  return api.post('/tcb/invokecloudfunction', {
    env: import.meta.env.VITE_CLOUD_ENV_ID,
    name: 'risk-assessment',
    data: params
  })
}
```

```vue
<!-- frontend/src/views/risk/Index.vue -->
<template>
  <div class="risk-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>风险管理</span>
          <el-button type="primary" @click="handleAdd">新增风险</el-button>
        </div>
      </template>

      <!-- 筛选条件 -->
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="风险等级">
          <el-select v-model="queryParams.riskLevel" placeholder="请选择" clearable>
            <el-option label="重大风险" :value="1" />
            <el-option label="较大风险" :value="2" />
            <el-option label="一般风险" :value="3" />
            <el-option label="低风险" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table :data="riskList" v-loading="loading">
        <el-table-column prop="riskName" label="风险名称" />
        <el-table-column prop="location" label="风险地点" />
        <el-table-column prop="rValue" label="风险值" />
        <el-table-column prop="riskGrade" label="风险等级">
          <template #default="{ row }">
            <el-tag :type="getRiskTagType(row.riskColor)">
              {{ row.riskGrade }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="checkFrequency" label="检查频次" />
        <el-table-column prop="status" label="状态" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="queryParams.page"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        @current-change="handleQuery"
        @size-change="handleQuery"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getRiskList } from '@/api/risk'
import type { RiskItem } from '@/api/risk'

const loading = ref(false)
const riskList = ref<RiskItem[]>([])
const total = ref(0)
const queryParams = ref({
  page: 1,
  pageSize: 20,
  riskLevel: undefined,
  riskColor: undefined,
  status: undefined
})

const handleQuery = async () => {
  loading.value = true
  try {
    const res = await getRiskList(queryParams.value)
    if (res.success) {
      riskList.value = res.data.list
      total.value = res.data.total
    }
  } catch (error) {
    console.error('查询失败:', error)
  } finally {
    loading.value = false
  }
}

const getRiskTagType = (color: string) => {
  const typeMap: Record<string, any> = {
    '红': 'danger',
    '橙': 'warning',
    '黄': '',
    '蓝': 'success'
  }
  return typeMap[color] || ''
}

const handleAdd = () => {
  // 打开新增对话框
}

const handleView = (row: RiskItem) => {
  // 查看详情
}

const handleEdit = (row: RiskItem) => {
  // 编辑
}

const handleDelete = (row: RiskItem) => {
  // 删除
}

onMounted(() => {
  handleQuery()
})
</script>
```

#### 3.3 隐患管理模块
```typescript
// frontend/src/api/danger.ts
import api from './index'

export interface DangerListParams {
  page: number
  pageSize: number
  dangerLevel?: string
  status?: string
  isSupervised?: boolean
}

export const getDangerList = (params: DangerListParams) => {
  return api.post('/tcb/invokecloudfunction', {
    env: import.meta.env.VITE_CLOUD_ENV_ID,
    name: 'getDangers',
    data: params
  })
}

export const getDangerDetail = (id: string) => {
  return api.post('/tcb/invokecloudfunction', {
    env: import.meta.env.VITE_CLOUD_ENV_ID,
    name: 'getDangerDetail',
    data: { id }
  })
}

export const createDanger = (data: any) => {
  return api.post('/tcb/invokecloudfunction', {
    env: import.meta.env.VITE_CLOUD_ENV_ID,
    name: 'createDanger',
    data
  })
}

export const updateDanger = (id: string, data: any) => {
  return api.post('/tcb/invokecloudfunction', {
    env: import.meta.env.VITE_CLOUD_ENV_ID,
    name: 'updateDanger',
    data: { id, data }
  })
}

export const verifyDanger = (id: string, data: any) => {
  return api.post('/tcb/invokecloudfunction', {
    env: import.meta.env.VITE_CLOUD_ENV_ID,
    name: 'verifyDanger',
    data: { id, data }
  })
}
```

#### 3.4 风险预警模块
```typescript
// frontend/src/api/warning.ts
import api from './index'

export const getWarningList = (status?: string) => {
  return api.post('/tcb/invokecloudfunction', {
    env: import.meta.env.VITE_CLOUD_ENV_ID,
    name: 'risk-warning',
    data: { action: 'list', status }
  })
}

export const createWarning = (data: any) => {
  return api.post('/tcb/invokecloudfunction', {
    env: import.meta.env.VITE_CLOUD_ENV_ID,
    name: 'risk-warning',
    data: { action: 'create', ...data }
  })
}

export const updateRectifyMeasures = (warningId: string, rectifyMeasures: string) => {
  return api.post('/tcb/invokecloudfunction', {
    env: import.meta.env.VITE_CLOUD_ENV_ID,
    name: 'risk-warning',
    data: { action: 'update_rectify', warningId, rectifyMeasures }
  })
}

export const submitVerify = (warningId: string) => {
  return api.post('/tcb/invokecloudfunction', {
    env: import.meta.env.VITE_CLOUD_ENV_ID,
    name: 'risk-warning',
    data: { action: 'submit_verify', warningId }
  })
}

export const verifyWarning = (warningId: string, verificationResult: string, verificationPerson: string) => {
  return api.post('/tcb/invokecloudfunction', {
    env: import.meta.env.VITE_CLOUD_ENV_ID,
    name: 'risk-warning',
    data: { action: 'verify', warningId, verificationResult, verificationPerson }
  })
}

export const autoTriggerWarning = () => {
  return api.post('/tcb/invokecloudfunction', {
    env: import.meta.env.VITE_CLOUD_ENV_ID,
    name: 'risk-warning',
    data: { action: 'auto_trigger' }
  })
}
```

#### 3.5 统计分析模块
```typescript
// frontend/src/api/statistics.ts
import api from './index'

export const getQuickStats = () => {
  return api.post('/tcb/invokecloudfunction', {
    env: import.meta.env.VITE_CLOUD_ENV_ID,
    name: 'getQuickStats',
    data: {}
  })
}

export const getSafetyMetrics = (params: { startDate: string; endDate: string }) => {
  return api.post('/tcb/invokecloudfunction', {
    env: import.meta.env.VITE_CLOUD_ENV_ID,
    name: 'getSafetyMetrics',
    data: params
  })
}

export const getMonthlyReport = (year: number, month: number) => {
  return api.post('/tcb/invokecloudfunction', {
    env: import.meta.env.VITE_CLOUD_ENV_ID,
    name: 'monthly-report',
    data: { year, month }
  })
}
```

### 阶段4：仪表盘和可视化（第16-18天）

#### 4.1 创建仪表盘
```vue
<!-- frontend/src/views/dashboard/Index.vue -->
<template>
  <div class="dashboard-container">
    <!-- 统计卡片 -->
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card>
          <div class="stat-card">
            <div class="stat-icon risk">📊</div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.riskCount }}</div>
              <div class="stat-label">风险总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="stat-card">
            <div class="stat-icon danger">⚠️</div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.dangerCount }}</div>
              <div class="stat-label">隐患总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="stat-card">
            <div class="stat-icon inspection">🔍</div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.inspectionCount }}</div>
              <div class="stat-label">巡检次数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="stat-card">
            <div class="stat-icon warning">🔔</div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.warningCount }}</div>
              <div class="stat-label">预警数量</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header>风险等级分布</template>
          <div ref="riskChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>隐患整改率</template>
          <div ref="dangerChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card>
          <template #header>趋势分析</template>
          <div ref="trendChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { getQuickStats, getSafetyMetrics } from '@/api/statistics'

const stats = ref({
  riskCount: 0,
  dangerCount: 0,
  inspectionCount: 0,
  warningCount: 0
})

const riskChartRef = ref<HTMLElement>()
const dangerChartRef = ref<HTMLElement>()
const trendChartRef = ref<HTMLElement>()

const loadStats = async () => {
  const res = await getQuickStats()
  if (res.success) {
    stats.value = res.data
  }
}

const initCharts = async () => {
  const res = await getSafetyMetrics({
    startDate: '2025-01-01',
    endDate: '2025-01-31'
  })

  if (res.success) {
    const data = res.data

    // 风险等级分布饼图
    const riskChart = echarts.init(riskChartRef.value!)
    riskChart.setOption({
      title: { text: '风险等级分布', left: 'center' },
      tooltip: { trigger: 'item' },
      series: [
        {
          type: 'pie',
          radius: '50%',
          data: [
            { value: data.riskStats.major, name: '重大风险' },
            { value: data.riskStats.larger, name: '较大风险' },
            { value: data.riskStats.general, name: '一般风险' },
            { value: data.riskStats.low, name: '低风险' }
          ]
        }
      ]
    })

    // 隐患整改率饼图
    const dangerChart = echarts.init(dangerChartRef.value!)
    dangerChart.setOption({
      title: { text: '隐患整改率', left: 'center' },
      tooltip: { trigger: 'item' },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          data: [
            { value: data.dangerStats.closed, name: '已整改' },
            { value: data.dangerStats.pending, name: '待整改' }
          ]
        }
      ]
    })

    // 趋势分析折线图
    const trendChart = echarts.init(trendChartRef.value!)
    trendChart.setOption({
      title: { text: '趋势分析', left: 'center' },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: ['1月', '2月', '3月', '4月', '5月', '6月']
      },
      yAxis: { type: 'value' },
      series: [
        {
          name: '风险',
          type: 'line',
          data: data.trend.risks
        },
        {
          name: '隐患',
          type: 'line',
          data: data.trend.dangers
        },
        {
          name: '巡检',
          type: 'line',
          data: data.trend.inspections
        }
      ]
    })
  }
}

onMounted(async () => {
  await loadStats()
  await initCharts()
})
</script>
```

### 阶段5：测试和优化（第19-20天）

#### 5.1 功能测试
- 测试所有核心功能
- 测试API调用
- 测试数据展示
- 测试用户交互

#### 5.2 性能优化
- 优化API调用
- 优化图表渲染
- 优化页面加载速度

#### 5.3 兼容性测试
- 测试不同浏览器
- 测试不同屏幕尺寸
- 测试响应式布局

### 阶段6：部署上线（第21天）

#### 6.1 构建生产版本
```bash
cd frontend
npm run build
```

#### 6.2 部署到微信云开发静态托管
```bash
# 安装云开发CLI
npm install -g @cloudbase/cli

# 登录
cloudbase login

# 部署
cloudbase hosting deploy dist -e cloud1-9gz3lqctb5e4f85d
```

#### 6.3 配置域名
1. 在微信云开发控制台配置自定义域名
2. 配置DNS解析
3. 配置SSL证书

---

## 四、重要注意事项

### 4.1 与小程序端的协作
1. **数据共享**: Web后台和小程序端共享云数据库
2. **云函数调用**: Web后台通过HTTP API调用小程序的云函数
3. **数据一致性**: 确保两端数据结构一致

### 4.2 认证和授权
1. 使用微信云开发Access Token进行认证
2. 实现JWT Token管理
3. 实现路由守卫和权限控制

### 4.3 错误处理
1. 统一错误处理机制
2. 友好的错误提示
3. 错误日志记录

### 4.4 性能优化
1. 合理使用分页
2. 使用懒加载
3. 优化图表渲染

### 4.5 安全性
1. 防止XSS攻击
2. 防止CSRF攻击
3. 敏感数据加密

---

## 五、API接口文档

详细的API接口文档请参考：`web-api-documentation.md`

主要接口包括：
- 用户管理接口（登录、用户信息更新）
- 风险管理接口（列表、详情、创建、更新、删除、MES评估）
- 风险预警接口（创建、更新、验证、列表、详情、自动触发）
- 隐患管理接口（列表、详情、创建、更新、验证）
- 隐患督办接口（启动督办、更新进展、验证、超期检查）
- 巡检管理接口（列表、详情、生成检查表）
- 统计分析接口（快速统计、安全指标、月度报表）

---

## 六、开发规范

### 6.1 代码风格
- 使用TypeScript进行类型定义
- 使用ESLint进行代码检查
- 使用Prettier进行代码格式化

### 6.2 命名规范
- 组件使用PascalCase
- 文件名使用kebab-case
- 变量使用camelCase
- 常量使用UPPER_SNAKE_CASE

### 6.3 注释规范
- 函数和组件需要添加注释
- 复杂逻辑需要添加注释
- API接口需要添加注释

### 6.4 Git提交规范
- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式
- refactor: 重构
- test: 测试
- chore: 构建/工具

---

## 七、常见问题

### 7.1 如何获取Access Token？
参考微信云开发文档，使用APPID和SECRET获取Access Token。

### 7.2 如何调用云函数？
使用微信云开发HTTP API，格式为：
```javascript
POST https://api.weixin.qq.com/tcb/invokecloudfunction?access_token=ACCESS_TOKEN
{
  "env": "cloud1-9gz3lqctb5e4f85d",
  "name": "云函数名称",
  "data": { 参数 }
}
```

### 7.3 如何处理跨域问题？
使用Vite的proxy配置进行代理转发。

### 7.4 如何实现微信登录？
需要集成微信开放平台SDK，参考微信官方文档。

### 7.5 如何部署到云开发？
使用云开发CLI工具，参考微信云开发文档。

---

## 八、联系方式

如有问题，请联系：
- **开发团队**: fanzhiyi@outlook.com
- **项目地址**: https://github.com/fzy521/railway-safety-wechat.git

---

**文档版本**: v1.0
**创建日期**: 2026-01-06
**最后更新**: 2026-01-06

---

## 附录：快速检查清单

### 项目初始化
- [ ] 创建项目结构
- [ ] 配置开发环境
- [ ] 安装依赖
- [ ] 配置环境变量

### 基础框架
- [ ] 配置路由
- [ ] 配置Pinia
- [ ] 配置Axios
- [ ] 创建布局组件

### 核心功能
- [ ] 用户登录
- [ ] 风险管理
- [ ] 隐患管理
- [ ] 风险预警
- [ ] 巡检管理
- [ ] 统计分析

### 仪表盘
- [ ] 统计卡片
- [ ] 风险等级分布图
- [ ] 隐患整改率图
- [ ] 趋势分析图

### 测试和优化
- [ ] 功能测试
- [ ] 性能优化
- [ ] 兼容性测试

### 部署上线
- [ ] 构建生产版本
- [ ] 部署到云开发
- [ ] 配置域名
- [ ] 配置SSL

---

**祝开发顺利！** 🚀