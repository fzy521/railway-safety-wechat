# 铁路安全管理系统 - Web管理后台

## 项目概述

铁路安全管理系统Web管理后台,基于Vue 3 + TypeScript + Element Plus开发,为管理层、安全监察部门等提供数据集中管理和分析功能。

## 技术架构

```
Web后台 (Vue 3 + TypeScript)
    ↓
调用云函数 (HTTP API)
    ↓
微信云开发 (云数据库 + 云存储)
```

## 技术栈

### 前端
- **框架**: Vue 3.4+
- **语言**: TypeScript 5.0+
- **UI组件库**: Element Plus 2.4+
- **状态管理**: Pinia 2.1+
- **路由**: Vue Router 4.2+
- **HTTP客户端**: Axios 1.6+
- **图表库**: ECharts 5.4+
- **构建工具**: Vite 5.0+

### 后端
- **云开发**: 微信云开发
- **数据库**: MongoDB (云数据库)
- **API**: 微信云开发HTTP API

## 项目结构

```
web-admin/
├── frontend/                    # 前端项目
│   ├── public/                 # 静态资源
│   ├── src/
│   │   ├── api/               # API接口
│   │   ├── assets/            # 资源文件
│   │   ├── components/        # 公共组件
│   │   ├── layouts/           # 布局组件
│   │   ├── router/            # 路由配置
│   │   ├── stores/            # 状态管理
│   │   ├── types/             # TypeScript类型定义
│   │   ├── utils/             # 工具函数
│   │   ├── views/             # 页面组件
│   │   ├── styles/            # 全局样式
│   │   ├── App.vue            # 根组件
│   │   └── main.ts            # 入口文件
│   ├── index.html             # HTML模板
│   ├── package.json           # 项目配置
│   ├── tsconfig.json          # TypeScript配置
│   ├── vite.config.ts         # Vite配置
│   └── README.md              # 项目说明
│
└── README.md                   # 项目总览
```

## 功能模块

### 已完成功能

- ✅ 用户登录/登出
- ✅ 主布局框架(侧边栏、顶部导航)
- ✅ 数据看板(统计卡片、图表展示)
- ✅ 风险管理(MES评估、增删改查)
- ✅ 隐患管理(登记、整改、验证)

### 待开发功能

- 🚧 风险预警(预警下发、跟踪、验收)
- 🚧 隐患督办(重大隐患挂牌督办)
- 🚧 巡检管理(巡检计划、记录、报表)
- 🚧 统计分析(报表生成、数据导出)
- 🚧 用户管理(用户、角色、权限)
- 🚧 系统设置(参数配置、日志管理)

## 快速开始

### 前置要求

- Node.js >= 16.0.0
- npm 或 pnpm
- 微信云开发环境ID: cloud1-9gz3lqctb5e4f85d

### 安装依赖

```bash
cd web-admin/frontend
npm install
```

### 配置环境变量

在 `web-admin/frontend/` 目录下创建 `.env.development` 文件:

```env
VITE_APP_TITLE=铁路安全管理系统
VITE_CLOUD_ENV_ID=cloud1-9gz3lqctb5e4f85d
VITE_APP_ID=你的APPID
VITE_APP_SECRET=你的SECRET
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

## 核心功能说明

### 1. MES风险评估

采用MES法进行风险评估:

- **M (控制措施状态)**: 5-无控制 / 3-应急措施 / 1-预防措施
- **E1 (人员暴露频次)**: 10-连续 / 6-每天 / 3-每周 / 2-每月 / 1-每年
- **E2 (危险状态频次)**: 10-常态 / 6-每天 / 3-每周 / 2-每月 / 1-每年
- **S (事故后果)**: 10-多人死亡 / 8-1人死亡 / 4-永久失能 / 2-需医院治疗 / 1-轻微伤害

**风险值计算**: R = M × max(E1, E2) × S

**风险等级判定**:
- R > 180: 重大风险(红色)
- 90 ≤ R ≤ 150: 较大风险(橙色)
- 40 ≤ R ≤ 80: 一般风险(黄色)
- R ≤ 38: 低风险(蓝色)

### 2. 风险管理

- 风险点登记
- MES评估计算
- 风险等级自动判定
- 管控措施管理
- 检查频次自动生成
- 风险列表查询、导出

### 3. 隐患管理

- 隐患登记入库
- 隐患分级(重大/一般)
- 隐患分类(10类)
- 整改措施制定
- 整改进度跟踪
- 验证销号管理
- 重大隐患自动督办

### 4. 数据看板

- 快速统计(风险、隐患、巡检、预警)
- 风险等级分布图
- 隐患治理趋势图
- 风险类别统计
- 隐患类别分布
- 最近预警列表
- 待办事项

## 开发指南

### 添加新页面

1. 在 `src/views/` 下创建页面组件
2. 在 `src/router/index.ts` 中添加路由配置
3. 在 `src/layouts/MainLayout.vue` 中添加菜单项

### 调用云函数

```typescript
import { callCloudFunction } from '@/api/cloud'

// 调用云函数
const result = await callCloudFunction('functionName', { param: 'value' })
```

### 使用状态管理

```typescript
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
userStore.setToken('token')
userStore.setUserInfo(userInfo)
```

### 工具函数

```typescript
import { formatDate, getRiskLevelColor, exportToCSV } from '@/utils'

// 格式化日期
const dateStr = formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')

// 获取风险等级颜色
const color = getRiskLevelColor(1) // 返回 '#f56c6c'

// 导出数据
exportToCSV(data, 'filename.csv')
```

## 部署

### 部署到微信云开发静态托管

```bash
# 1. 构建项目
npm run build

# 2. 安装云开发CLI
npm install -g @cloudbase/cli

# 3. 登录云开发
cloudbase login

# 4. 部署到静态托管
cloudbase hosting deploy dist -e cloud1-9gz3lqctb5e4f85d
```

### 部署到其他服务器

构建后将 `dist` 目录部署到任何静态文件服务器:
- Nginx
- Apache
- CDN
- 对象存储

## 注意事项

1. **微信云开发配置**
   - 需要配置微信云开发的APPID和SECRET
   - 需要开通微信云开发HTTP API
   - 确保云函数已部署到云开发环境

2. **Access Token管理**
   - Access Token有效期为2小时
   - 系统会自动缓存和刷新Token
   - Token过期后自动重新获取

3. **数据安全**
   - 敏感数据建议在云函数中处理
   - 前端不要直接暴露APP_SECRET
   - 使用HTTPS传输数据

4. **性能优化**
   - 合理使用分页查询
   - 使用数据库索引
   - 缓存热点数据

## 相关文档

- [Web后台开发指导文档](../miniprogram/web-admin-development-guide.md)
- [Web后台架构方案](../miniprogram/web-admin-architecture.md)
- [Web后台数据接口文档](../miniprogram/web-api-documentation.md)
- [双控机制功能完善方案](../miniprogram/功能完善设计方案-双控机制.md)

## 开发计划

### 第一阶段: 基础框架 ✅
- [x] 项目初始化
- [x] 开发环境配置
- [x] 基础架构搭建
- [x] 登录页面
- [x] 主布局组件

### 第二阶段: 核心功能 ✅
- [x] 数据看板
- [x] 风险管理
- [x] 隐患管理

### 第三阶段: 高级功能 🚧
- [ ] 风险预警
- [ ] 隐患督办
- [ ] 巡检管理
- [ ] 统计分析

### 第四阶段: 系统管理 🚧
- [ ] 用户管理
- [ ] 权限管理
- [ ] 系统设置

### 第五阶段: 测试部署 🚧
- [ ] 功能测试
- [ ] 性能测试
- [ ] 生产部署

## License

Copyright © 2025 铁路安全管理系统

## 联系方式

如有问题或建议,请联系开发团队。