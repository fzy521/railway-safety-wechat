# 铁路安全监控系统 - Web后台开发指导文档

## 一、项目概述

### 1.1 项目背景
铁路安全监控系统已有完整的微信小程序端，现在需要开发Web端管理后台，为管理层、安全监察部门等提供数据集中管理和分析功能。

### 1.2 项目目标
- 提供统一的数据管理平台
- 支持多维度数据分析和报表生成
- 提供用户权限管理和组织架构管理
- 实现风险预警和隐患督办功能
- 支持数据导出和系统配置

### 1.3 技术架构
```
Web后台 (Vue 3 + TypeScript)
    ↓
调用云函数 (HTTP API)
    ↓
微信云开发 (云数据库 + 云存储)
```

### 1.4 开发环境
- **开发工具**: VS Code
- **Node.js**: >= 16.0.0
- **包管理器**: npm 或 pnpm
- **云开发环境ID**: cloud1-9gz3lqctb5e4f85d

---

## 二、项目结构

### 2.1 目录结构
```
railway-safety/
├── miniprogram/              # 小程序项目（已有）
│   ├── pages/
│   ├── cloudfunctions/
│   └── ...
│
├── web-admin/                # Web后台项目（待创建）
│   ├── frontend/             # 前端项目
│   │   ├── src/
│   │   │   ├── api/         # API调用
│   │   │   ├── assets/      # 静态资源
│   │   │   ├── components/  # 组件
│   │   │   ├── layouts/     # 布局
│   │   │   ├── router/      # 路由
│   │   │   ├── stores/      # 状态管理
│   │   │   ├── types/       # TypeScript类型
│   │   │   ├── utils/       # 工具函数
│   │   │   ├── views/       # 页面
│   │   │   ├── App.vue
│   │   │   └── main.ts
│   │   ├── public/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   └── .env.development
│   │
│   └── backend/              # 后端API（可选，如果需要独立后端）
│       ├── src/
│       │   ├── controllers/
│       │   ├── services/
│       │   ├── routes/
│       │   ├── middleware/
│       │   └── app.ts
│       ├── package.json
│       └── tsconfig.json
│
└── docs/                     # 共享文档
    ├── web-admin-architecture.md
    ├── web-api-documentation.md
    └── 功能完善设计方案-双控机制.md
```

### 2.2 前端技术栈
- **框架**: Vue 3.4+
- **语言**: TypeScript 5.0+
- **UI组件库**: Element Plus 2.4+
- **状态管理**: Pinia 2.1+
- **路由**: Vue Router 4.2+
- **HTTP客户端**: Axios 1.6+
- **图表库**: ECharts 5.4+
- **构建工具**: Vite 5.0+
- **代码规范**: ESLint + Prettier

---

## 三、开发步骤

### 3.1 第一阶段：项目初始化（第1天）

#### 步骤1：创建前端项目
```bash
# 在 railway-safety/ 根目录下创建 web-admin/frontend/
cd railway-safety
mkdir -p web-admin/frontend
cd web-admin/frontend

# 创建Vue 3 + TypeScript项目
npm create vite@latest . -- --template vue-ts

# 安装依赖
npm install

# 安装核心依赖
npm install element-plus pinia vue-router axios echarts
npm install @element-plus/icons-vue

# 安装开发依赖
npm install -D eslint prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

#### 步骤2：配置项目
创建 `vite.config.ts`:
```typescript
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
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://api.weixin.qq.com',
        changeOrigin: true
      }
    }
  }
})
```

#### 步骤3：配置环境变量
创建 `.env.development`:
```env
VITE_APP_TITLE=铁路安全管理系统
VITE_CLOUD_ENV_ID=cloud1-9gz3lqctb5e4f85d
VITE_APP_ID=你的APPID
VITE_APP_SECRET=你的SECRET
```

### 3.2 第二阶段：基础框架搭建（第2-3天）

#### 步骤1：配置路由
创建 `src/router/index.ts`:
```typescript
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '数据看板' }
      },
      {
        path: 'risk',
        name: 'Risk',
        component: () => import('@/views/risk/index.vue'),
        meta: { title: '风险管理' }
      },
      {
        path: 'danger',
        name: 'Danger',
        component: () => import('@/views/danger/index.vue'),
        meta: { title: '隐患管理' }
      },
      {
        path: 'warning',
        name: 'Warning',
        component: () => import('@/views/warning/index.vue'),
        meta: { title: '风险预警' }
      },
      {
        path: 'supervision',
        name: 'Supervision',
        component: () => import('@/views/supervision/index.vue'),
        meta: { title: '隐患督办' }
      },
      {
        path: 'inspection',
        name: 'Inspection',
        component: () => import('@/views/inspection/index.vue'),
        meta: { title: '巡检管理' }
      },
      {
        path: 'statistics',
        name: 'Statistics',
        component: () => import('@/views/statistics/index.vue'),
        meta: { title: '统计分析' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
```

#### 步骤2：配置Pinia状态管理
创建 `src/stores/user.ts`:
```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<any>(null)

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  function setUserInfo(info: any) {
    userInfo.value = info
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
  }

  return { token, userInfo, setToken, setUserInfo, logout }
})
```

#### 步骤3：配置云函数调用
创建 `src/api/cloud.ts`:
```typescript
const CLOUD_ENV_ID = import.meta.env.VITE_CLOUD_ENV_ID
const APP_ID = import.meta.env.VITE_APP_ID
const APP_SECRET = import.meta.env.VITE_APP_SECRET

// Access Token缓存
let accessToken: string | null = null
let tokenExpireTime: number = 0

// 获取Access Token
async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpireTime) {
    return accessToken
  }

  const response = await fetch(
    `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APP_ID}&secret=${APP_SECRET}`
  )
  const data = await response.json()

  accessToken = data.access_token
  tokenExpireTime = Date.now() + (data.expires_in - 300) * 1000

  return accessToken
}

// 调用云函数
export async function callCloudFunction<T = any>(name: string, data: any = {}): Promise<T> {
  try {
    const token = await getAccessToken()

    const response = await fetch(
      `https://api.weixin.qq.com/tcb/invokecloudfunction?access_token=${token}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          env: CLOUD_ENV_ID,
          name: name,
          data: data
        })
      }
    )

    const result = await response.json()

    if (result.errcode === 0) {
      return JSON.parse(result.resp_data)
    } else {
      throw new Error(result.errmsg)
    }
  } catch (error) {
    console.error('云函数调用失败:', error)
    throw error
  }
}
```

### 3.3 第三阶段：核心功能开发（第4-10天）

#### 功能清单
1. **用户登录**（第4天）
2. **数据看板**（第5天）
3. **风险管理**（第6-7天）
4. **隐患管理**（第8天）
5. **风险预警**（第9天）
6. **隐患督办**（第10天）

### 3.4 第四阶段：高级功能开发（第11-14天）

#### 功能清单
1. **统计分析**（第11-12天）
2. **用户管理**（第13天）
3. **系统设置**（第14天）

### 3.5 第五阶段：测试和部署（第15天）

#### 测试清单
- 功能测试
- 性能测试
- 兼容性测试
- 安全测试

#### 部署步骤
1. 构建生产版本
2. 部署到微信云开发静态托管
3. 配置域名
4. 配置SSL证书

---

## 四、重要注意事项

### 4.1 微信云开发配置
1. **获取APPID和SECRET**
   - 登录微信公众平台
   - 进入"开发" → "开发管理"
   - 获取AppID和AppSecret

2. **开通HTTP API**
   - 登录微信云开发控制台
   - 进入"设置" → "环境设置"
   - 开通HTTP API

3. **配置安全域名**
   - 在云开发控制台配置Web安全域名
   - 添加你的域名到白名单

### 4.2 API接口文档
详细的API接口文档请参考：`web-api-documentation.md`

主要接口包括：
- 用户管理接口
- 风险管理接口
- 风险预警接口
- 隐患管理接口
- 隐患督办接口
- 巡检管理接口
- 统计分析接口

### 4.3 与小程序端的协作
1. **数据共享**: Web后台和小程序端共享云数据库
2. **云函数调用**: Web后台通过HTTP API调用小程序的云函数
3. **数据一致性**: 确保两端数据结构一致

---

## 五、开发规范

### 5.1 代码规范
1. 使用TypeScript编写代码
2. 使用ESLint进行代码检查
3. 使用Prettier进行代码格式化
4. 遵循Vue 3 Composition API规范

### 5.2 命名规范
1. 文件名使用kebab-case
2. 组件名使用PascalCase
3. 变量名使用camelCase
4. 常量名使用UPPER_SNAKE_CASE

### 5.3 Git规范
1. 使用语义化的提交信息
2. 每次提交只做一件事
3. 提交前需要进行代码检查
4. 提交前需要进行测试

---

## 六、参考资料

### 6.1 官方文档
- [Vue 3文档](https://cn.vuejs.org/)
- [Element Plus文档](https://element-plus.org/)
- [Pinia文档](https://pinia.vuejs.org/)
- [Vue Router文档](https://router.vuejs.org/)
- [微信云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)

### 6.2 项目文档
- [Web后台架构方案](../miniprogram/web-admin-architecture.md)
- [Web后台数据接口文档](../miniprogram/web-api-documentation.md)
- [双控机制功能完善方案](../miniprogram/功能完善设计方案-双控机制.md)

---

## 七、联系信息

### 7.1 项目信息
- **项目名称**: 铁路安全监控系统
- **项目类型**: 微信小程序 + Web管理后台
- **技术栈**: Vue 3 + TypeScript + 微信云开发
- **开发周期**: 15天

### 7.2 开发团队
- **小程序端**: 已完成
- **Web后台**: 开发中
- **云函数**: 已完成

---

## 附录：快速开始

### A.1 安装依赖
```bash
cd web-admin/frontend
npm install
```

### A.2 启动开发服务器
```bash
npm run dev
```

### A.3 构建生产版本
```bash
npm run build
```

### A.4 部署到云开发
```bash
# 安装云开发CLI
npm install -g @cloudbase/cli

# 登录
cloudbase login

# 部署
cloudbase hosting deploy dist -e cloud1-9gz3lqctb5e4f85d
```

---

**文档版本**: v1.0
**最后更新**: 2026-01-06
**维护者**: 开发团队

**祝开发顺利！** 🚀