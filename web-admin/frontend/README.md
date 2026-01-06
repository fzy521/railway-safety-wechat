# 铁路安全管理系统 - Web管理后台

基于Vue 3 + TypeScript + Element Plus开发的铁路安全管理系统Web管理后台。

## 技术栈

- **框架**: Vue 3.4+
- **语言**: TypeScript 5.0+
- **UI组件库**: Element Plus 2.4+
- **状态管理**: Pinia 2.1+
- **路由**: Vue Router 4.2+
- **HTTP客户端**: Axios 1.6+
- **图表库**: ECharts 5.4+
- **构建工具**: Vite 5.0+

## 功能模块

- ✅ 用户登录/登出
- ✅ 数据看板
- ✅ 风险管理(MES评估)
- ✅ 隐患管理
- 🚧 风险预警
- 🚧 隐患督办
- 🚧 巡检管理
- 🚧 统计分析
- 🚧 用户管理
- 🚧 系统设置

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

### 代码检查

```bash
npm run lint
```

## 项目结构

```
web-admin/frontend/
├── public/                 # 静态资源
├── src/
│   ├── api/               # API接口
│   ├── assets/            # 资源文件
│   ├── components/        # 公共组件
│   ├── layouts/           # 布局组件
│   ├── router/            # 路由配置
│   ├── stores/            # 状态管理
│   ├── types/             # TypeScript类型定义
│   ├── utils/             # 工具函数
│   ├── views/             # 页面组件
│   ├── styles/            # 全局样式
│   ├── App.vue            # 根组件
│   └── main.ts            # 入口文件
├── index.html             # HTML模板
├── package.json           # 项目配置
├── tsconfig.json          # TypeScript配置
├── vite.config.ts         # Vite配置
└── README.md              # 项目说明
```

## 环境变量

在项目根目录创建 `.env.development` 和 `.env.production` 文件:

```env
VITE_APP_TITLE=铁路安全管理系统
VITE_CLOUD_ENV_ID=cloud1-9gz3lqctb5e4f85d
VITE_APP_ID=你的APPID
VITE_APP_SECRET=你的SECRET
```

## 开发说明

### 添加新页面

1. 在 `src/views/` 下创建页面组件
2. 在 `src/router/index.ts` 中添加路由配置
3. 在 `src/layouts/MainLayout.vue` 中添加菜单项

### 调用云函数

```typescript
import { callCloudFunction } from '@/api/cloud'

const result = await callCloudFunction('functionName', { param: 'value' })
```

### 使用状态管理

```typescript
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
userStore.setToken('token')
```

## 部署

### 部署到微信云开发静态托管

```bash
# 安装云开发CLI
npm install -g @cloudbase/cli

# 登录
cloudbase login

# 部署
cloudbase hosting deploy dist -e cloud1-9gz3lqctb5e4f85d
```

## 注意事项

1. 需要配置微信云开发的APPID和SECRET
2. 需要开通微信云开发HTTP API
3. 确保云函数已部署到云开发环境

## 相关文档

- [Web后台开发指导文档](../../miniprogram/web-admin-development-guide.md)
- [Web后台架构方案](../../miniprogram/web-admin-architecture.md)
- [Web后台数据接口文档](../../miniprogram/web-api-documentation.md)
- [双控机制功能完善方案](../../miniprogram/功能完善设计方案-双控机制.md)

## License

Copyright © 2025 铁路安全管理系统