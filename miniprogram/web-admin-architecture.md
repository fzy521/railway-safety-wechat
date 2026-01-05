# 铁路安全监控系统 - Web端管理后台架构方案

## 一、项目概述

### 1.1 项目背景
铁路安全监控系统目前已实现微信小程序端，为巡检人员提供风险管控、隐患排查、巡检记录等功能。为满足管理层、安全监察部门等对数据的集中管理和分析需求，需要构建Web端管理后台。

### 1.2 建设目标
- 提供统一的数据管理平台，实现风险、隐患、巡检等数据的集中管理
- 支持多维度数据分析和报表生成
- 提供用户权限管理和组织架构管理
- 实现风险预警和隐患督办功能
- 支持数据导出和系统配置

## 二、技术架构

### 2.1 技术选型

#### 前端技术栈
- **框架**: Vue 3 + TypeScript
- **UI组件库**: Element Plus / Ant Design Vue
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **HTTP客户端**: Axios
- **图表库**: ECharts
- **构建工具**: Vite
- **代码规范**: ESLint + Prettier

#### 后端技术栈
- **框架**: Node.js + Express + TypeScript
- **数据访问**: 微信云开发HTTP API（wx.cloud.httpApi）
- **云函数**: 微信云函数（用于小程序端）
- **认证**: JWT + 微信登录
- **API文档**: Swagger / OpenAPI
- **日志**: Winston
- **测试**: Jest + Supertest

#### 部署方案
- **容器化**: Docker + Docker Compose
- **反向代理**: Nginx
- **进程管理**: PM2
- **CI/CD**: GitHub Actions / GitLab CI
- **监控**: Prometheus + Grafana

#### 微信云开发HTTP API说明
由于小程序使用微信云开发，云数据库不支持外部直接连接，Web端需要通过微信云开发的HTTP API来访问数据：

**访问方式**：
```javascript
// 使用微信云开发HTTP API
const cloud = require('wx-server-sdk')
cloud.init({
  env: 'cloud1-9gz3lqctb5e4f85d'
})

// 访问云数据库
const db = cloud.database()
db.collection('risk_library').get()
```

**优势**：
- 与小程序共享同一套数据，保持数据一致性
- 无需额外维护数据库服务器
- 自动处理数据安全和权限控制
- 支持实时数据同步

**注意事项**：
- 需要在微信云开发控制台配置HTTP API访问权限
- 使用微信云开发的访问凭证（Access Token）
- 需要实现合理的权限控制和数据验证

### 2.2 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        用户层                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  管理员PC端  │  │  安全监察端  │  │  领导决策端  │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      前端应用层 (Vue 3)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ 风险管理 │  │ 隐患管理 │  │ 巡检管理 │  │ 统计分析 │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ 用户管理 │  │ 权限管理 │  │ 系统设置 │  │ 应急管理 │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   API网关层 (Nginx)                          │
│              负载均衡、路由分发、静态资源服务                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   业务服务层 (Node.js)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ 风险服务 │  │ 隐患服务 │  │ 巡检服务 │  │ 用户服务 │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ 统计服务 │  │ 报表服务 │  │ 通知服务 │  │ 文件服务 │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              数据访问层 (微信云开发HTTP API)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │数据库API  │  │存储API   │  │云函数API │  │权限API   │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 微信云开发平台                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              云数据库 (MongoDB)                       │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │   │
│  │  │风险库集合 │  │隐患库集合 │  │巡检集合  │          │   │
│  │  └──────────┘  └──────────┘  └──────────┘          │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │   │
│  │  │用户集合  │  │通知集合  │  │日志集合  │          │   │
│  │  └──────────┘  └──────────┘  └──────────┘          │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              云函数 (小程序端使用)                     │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │   │
│  │  │login云函数│  │updateUserInfo│  │其他云函数│      │   │
│  │  └──────────┘  └──────────┘  └──────────┘          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────┘
```

## 三、功能模块设计

### 3.1 核心功能模块

#### 1. 风险管理模块
- **风险库管理**
  - 风险点增删改查
  - 风险等级管理（红/橙/黄/蓝）
  - 风险评估（M/E1/E2/S值计算）
  - 风险分布地图
  - 风险预警配置

- **风险识别**
  - 批量导入风险点
  - 风险识别模板管理
  - 风险识别流程配置

- **风险控制**
  - 控制措施管理
  - 责任人分配
  - 检查周期设置
  - 风险复查提醒

#### 2. 隐患管理模块
- **隐患库管理**
  - 隐患登记
  - 隐患分级（一般/重大）
  - 隐患分类管理
  - 隐患状态跟踪

- **隐患整改**
  - 整改计划制定
  - 整改进度跟踪
  - 整改验收管理
  - 整改效果评估

- **隐患督办**
  - 督办任务创建
  - 督办级别设置（部门级/公司级）
  - 督办进度监控
  - 督办结果反馈

#### 3. 巡检管理模块
- **巡检计划**
  - 巡检计划制定
  - 巡检路线规划
  - 巡检人员分配
  - 巡检周期设置

- **巡检记录**
  - 巡检记录查询
  - 巡检结果统计
  - 异常记录管理
  - 巡检轨迹查看

- **巡检报表**
  - 日/周/月报生成
  - 巡检覆盖率统计
  - 问题发现率分析
  - 巡检效率分析

#### 4. 统计分析模块
- **数据看板**
  - 实时风险统计
  - 隐患整改率
  - 巡检完成率
  - 趋势分析图表

- **报表中心**
  - 风险分析报表
  - 隐患统计报表
  - 巡检汇总报表
  - 自定义报表

- **数据导出**
  - Excel导出
  - PDF导出
  - 数据备份
  - 历史数据归档

#### 5. 用户权限模块
- **用户管理**
  - 用户增删改查
  - 用户信息维护
  - 用户状态管理
  - 批量导入用户

- **角色管理**
  - 角色定义
  - 权限分配
  - 角色继承
  - 角色模板

- **组织管理**
  - 部门管理
  - 岗位管理
  - 组织架构图
  - 人员调动

#### 6. 系统管理模块
- **系统配置**
  - 基础参数设置
  - 业务规则配置
  - 字典管理
  - 流程配置

- **日志管理**
  - 操作日志
  - 登录日志
  - 异常日志
  - 日志查询导出

- **通知管理**
  - 消息模板
  - 通知规则
  - 发送记录
  - 通知统计

### 3.2 高级功能模块

#### 1. 应急管理模块
- **预案管理**
  - 应急预案库
  - 预案版本控制
  - 预案审批流程
  - 预案演练记录

- **应急资源**
  - 物资管理
  - 设备管理
  - 人员管理
  - 联系方式

- **应急演练**
  - 演练计划
  - 演练记录
  - 演练评估
  - 演练总结

#### 2. 培训管理模块
- **培训计划**
  - 培训课程管理
  - 培训计划制定
  - 培训人员分配
  - 培训效果评估

- **证书管理**
  - 证书信息维护
  - 证书有效期管理
  - 证书到期提醒
  - 证书统计分析

#### 3. 移动端集成
- **数据同步**
  - 实时数据同步
  - 离线数据上传
  - 冲突处理机制
  - 数据版本控制

- **消息推送**
  - 风险预警推送
  - 隐患整改提醒
  - 巡检任务通知
  - 系统公告推送

## 四、数据库设计

### 4.1 数据库集合设计

#### 用户相关集合
```javascript
// users - 用户表
{
  _id: ObjectId,
  _openid: String,          // 微信openid
  username: String,         // 用户名
  password: String,         // 密码（加密）
  name: String,            // 姓名
  phone: String,           // 手机号
  email: String,           // 邮箱
  avatarUrl: String,       // 头像
  deptId: ObjectId,        // 部门ID
  position: String,        // 职位
  roles: [ObjectId],       // 角色列表
  status: Number,          // 状态（0-禁用，1-启用）
  settings: Object,        // 个人设置
  inspections: Number,     // 巡检次数
  incidents: Number,       // 上报事故数
  certificates: Number,    // 证书数量
  experience: Number,      // 工作经验（年）
  createdAt: Date,
  updatedAt: Date
}

// roles - 角色表
{
  _id: ObjectId,
  name: String,            // 角色名称
  code: String,            // 角色编码
  description: String,     // 角色描述
  permissions: [String],   // 权限列表
  status: Number,          // 状态
  createdAt: Date,
  updatedAt: Date
}

// departments - 部门表
{
  _id: ObjectId,
  name: String,            // 部门名称
  code: String,            // 部门编码
  parentId: ObjectId,      // 上级部门ID
  level: Number,           // 层级
  sort: Number,            // 排序
  leader: ObjectId,        // 部门负责人
  description: String,     // 描述
  createdAt: Date,
  updatedAt: Date
}
```

#### 风险管理集合
```javascript
// risk_library - 风险库
{
  _id: ObjectId,
  riskName: String,        // 风险名称
  riskType: String,        // 风险类型
  operationLink: String,   // 作业环节
  location: String,        // 位置
  mValue: Number,          // M值
  e1Value: Number,         // E1值
  e2Value: Number,         // E2值
  sValue: Number,          // S值
  rValue: Number,          // R值
  riskLevel: Number,       // 风险等级（1-重大，2-较大，3-一般，4-低）
  riskGrade: String,       // 风险等级名称
  riskColor: String,       // 风险颜色（红/橙/黄/蓝）
  controlMeasures: String, // 控制措施
  controlPerson: String,   // 控制责任人
  manageMeasures: String,  // 管理措施
  manageDept: String,      // 管理部门
  managePerson: String,    // 管理责任人
  checkFrequency: String,  // 检查频率
  identificationDate: Date,// 识别日期
  identificationMethod: String, // 识别方法
  nextReviewDate: Date,    // 下次复查日期
  status: String,          // 状态（active/inactive）
  createdBy: ObjectId,     // 创建人
  createdAt: Date,
  updatedAt: Date
}

// risk_warnings - 风险预警
{
  _id: ObjectId,
  riskId: ObjectId,        // 风险ID
  warningLevel: String,    // 预警级别
  warningType: String,     // 预警类型
  warningContent: String,  // 预警内容
  targetUnit: String,      // 目标单位
  deadline: Date,          // 截止日期
  status: String,          // 状态
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

#### 隐患管理集合
```javascript
// hidden_danger_library - 隐患库
{
  _id: ObjectId,
  dangerLocation: String,  // 隐患位置
  dangerPart: String,      // 隐患部位
  dangerLevel: String,     // 隐患等级
  dangerCategory: String,  // 隐患类别
  dangerDescription: String, // 隐患描述
  dangerStatus: String,    // 隐患状态描述
  causeAnalysis: String,   // 原因分析
  hazardAnalysis: String,  // 危害分析
  treatmentPlan: String,   // 整改方案
  treatmentMeasures: String, // 整改措施
  responsibleDept: String, // 责任部门
  responsiblePerson: String, // 责任人
  supervisionPerson: String, // 督办人
  plannedCompleteDate: Date, // 计划完成日期
  actualCompleteDate: Date,  // 实际完成日期
  completionCriteria: String, // 完成标准
  verificationMethod: String, // 验证方法
  verificationResult: String, // 验证结果
  verificationPerson: String, // 验证人
  verificationDate: Date,    // 验证日期
  isMajorDanger: Boolean,    // 是否重大隐患
  isSupervised: Boolean,     // 是否督办
  supervisionLevel: String,  // 督办级别
  supervisionStatus: String, // 督办状态
  discoveryDate: Date,       // 发现日期
  discoverer: String,        // 发现人
  findMethod: String,        // 发现方式
  inDangerLibrary: Boolean,  // 是否入库
  status: String,            // 状态
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}

// supervision_records - 督办记录
{
  _id: ObjectId,
  dangerId: ObjectId,        // 隐患ID
  supervisionLevel: String,  // 督办级别
  supervisionUnit: String,   // 督办单位
  supervisionPerson: String, // 督办人
  supervisionDate: Date,     // 督办日期
  supervisionContent: String, // 督办内容
  deadline: Date,            // 截止日期
  status: String,            // 状态
  feedback: String,          // 反馈内容
  feedbackDate: Date,        // 反馈日期
  createdAt: Date,
  updatedAt: Date
}
```

#### 巡检管理集合
```javascript
// check_records - 巡检记录
{
  _id: ObjectId,
  checkType: String,         // 巡检类型
  checkDate: Date,           // 巡检日期
  checkDept: String,         // 巡检部门
  checkPerson: ObjectId,     // 巡检人
  checkRoute: String,        // 巡检路线
  checkPoints: [String],     // 巡检点
  checkResult: String,       // 巡检结果
  findings: [Object],        // 发现问题
  attachments: [String],     // 附件
  duration: Number,          // 巡检时长（分钟）
  distance: Number,          // 巡检距离（米）
  status: String,            // 状态
  createdAt: Date,
  updatedAt: Date
}
```

#### 通知和日志集合
```javascript
// notifications - 通知
{
  _id: ObjectId,
  type: String,              // 类型（risk/danger/system）
  title: String,             // 标题
  content: String,           // 内容
  targetUsers: [ObjectId],   // 目标用户
  readUsers: [ObjectId],     // 已读用户
  priority: String,          // 优先级
  status: String,            // 状态
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}

// operation_logs - 操作日志
{
  _id: ObjectId,
  userId: ObjectId,          // 用户ID
  username: String,          // 用户名
  module: String,            // 模块
  action: String,            // 操作
  description: String,       // 描述
  ip: String,                // IP地址
  userAgent: String,         // 用户代理
  status: String,            // 状态
  createdAt: Date
}
```

## 五、接口设计

### 5.1 RESTful API 规范

#### 基础URL
```
开发环境: http://localhost:3000/api/v1
生产环境: https://admin.railway-safety.com/api/v1
```

#### 通用响应格式
```javascript
// 成功响应
{
  "code": 200,
  "message": "success",
  "data": {},
  "timestamp": 1699999999999
}

// 失败响应
{
  "code": 400,
  "message": "error message",
  "errors": [],
  "timestamp": 1699999999999
}
```

#### 状态码规范
- 200: 成功
- 201: 创建成功
- 400: 请求参数错误
- 401: 未授权
- 403: 禁止访问
- 404: 资源不存在
- 500: 服务器错误

### 5.2 核心接口列表

#### 用户管理接口
```
POST   /api/v1/auth/login              # 用户登录
POST   /api/v1/auth/logout             # 用户登出
GET    /api/v1/users                   # 获取用户列表
POST   /api/v1/users                   # 创建用户
GET    /api/v1/users/:id               # 获取用户详情
PUT    /api/v1/users/:id               # 更新用户
DELETE /api/v1/users/:id               # 删除用户
PUT    /api/v1/users/:id/status        # 更新用户状态
```

#### 风险管理接口
```
GET    /api/v1/risks                   # 获取风险列表
POST   /api/v1/risks                   # 创建风险
GET    /api/v1/risks/:id               # 获取风险详情
PUT    /api/v1/risks/:id               # 更新风险
DELETE /api/v1/risks/:id               # 删除风险
GET    /api/v1/risks/statistics        # 风险统计
GET    /api/v1/risks/export            # 导出风险数据
```

#### 隐患管理接口
```
GET    /api/v1/dangers                 # 获取隐患列表
POST   /api/v1/dangers                 # 创建隐患
GET    /api/v1/dangers/:id             # 获取隐患详情
PUT    /api/v1/dangers/:id             # 更新隐患
DELETE /api/v1/dangers/:id             # 删除隐患
PUT    /api/v1/dangers/:id/verify      # 隐患验收
GET    /api/v1/dangers/statistics      # 隐患统计
```

#### 巡检管理接口
```
GET    /api/v1/inspections             # 获取巡检记录
POST   /api/v1/inspections             # 创建巡检计划
GET    /api/v1/inspections/:id         # 获取巡检详情
PUT    /api/v1/inspections/:id         # 更新巡检
GET    /api/v1/inspections/statistics  # 巡检统计
GET    /api/v1/inspections/export      # 导出巡检数据
```

#### 统计分析接口
```
GET    /api/v1/statistics/overview     # 总体统计
GET    /api/v1/statistics/risk         # 风险统计
GET    /api/v1/statistics/danger       # 隐患统计
GET    /api/v1/statistics/inspection   # 巡检统计
GET    /api/v1/statistics/trend        # 趋势分析
```

## 六、安全设计

### 6.1 认证授权
- **认证方式**: JWT Token
- **Token有效期**: 2小时
- **刷新Token**: 7天
- **密码加密**: bcrypt
- **登录失败限制**: 5次/小时

### 6.2 权限控制
- **RBAC模型**: 用户-角色-权限
- **权限粒度**: 模块级-功能级-数据级
- **权限验证**: 中间件拦截
- **审计日志**: 记录所有操作

### 6.3 数据安全
- **数据加密**: 敏感字段加密存储
- **传输加密**: HTTPS
- **SQL注入防护**: 参数化查询
- **XSS防护**: 输入输出过滤
- **CSRF防护**: Token验证

### 6.4 操作审计
- **操作日志**: 记录所有增删改操作
- **登录日志**: 记录登录信息
- **异常日志**: 记录系统异常
- **日志保留**: 90天

## 七、部署方案

### 7.1 开发环境
```
┌─────────────────────────────────────┐
│         开发者本地环境               │
│  ┌──────────┐  ┌──────────┐        │
│  │  VS Code │  │  Git     │        │
│  └──────────┘  └──────────┘        │
│         ↓                            │
│  ┌──────────┐                        │
│  │  Node.js │                        │
│  └──────────┘                        │
│         ↓                            │
│  ┌──────────────────────────────┐   │
│  │   微信云开发HTTP API         │   │
│  │   (云数据库、云存储)         │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

### 7.2 生产环境
```
┌─────────────────────────────────────┐
│              用户访问                │
└─────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────┐
│         CDN + 负载均衡               │
│         (阿里云/腾讯云)              │
└─────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────┐
│         Nginx 反向代理               │
│    (静态资源 + API转发)              │
└─────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────┐
│      应用服务器集群 (PM2)            │
│  ┌──────────┐  ┌──────────┐        │
│  │  Node 1  │  │  Node 2  │        │
│  └──────────┘  └──────────┘        │
│  ┌──────────┐  ┌──────────┐        │
│  │  Node 3  │  │  Node N  │        │
│  └──────────┘  └──────────┘        │
└─────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────┐
│      微信云开发平台                  │
│  ┌──────────────────────────────┐   │
│  │   云数据库 (MongoDB)         │   │
│  │   云存储                     │   │
│  │   云函数                     │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

### 7.3 Docker部署方案
```yaml
# docker-compose.yml
version: '3.8'

services:
  # 前端应用
  web:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - api

  # 后端API
  api:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - CLOUD_ENV_ID=cloud1-9gz3lqctb5e4f85d
      - CLOUD_ACCESS_KEY=your-access-key
      - CLOUD_SECRET_KEY=your-secret-key
      - JWT_SECRET=your-secret-key

  # Redis缓存
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

volumes:
  redis-data:
```

**说明**：
- 数据库使用微信云开发的云数据库，无需部署MongoDB
- 后端通过微信云开发HTTP API访问云数据库
- Redis用于缓存热点数据，提高访问速度

## 八、开发计划

### 8.1 阶段划分

#### 第一阶段：基础框架搭建（2周）
- 项目初始化
- 技术选型确认
- 开发环境配置
- 基础架构搭建
- 数据库设计

#### 第二阶段：核心功能开发（6周）
- 用户权限模块
- 风险管理模块
- 隐患管理模块
- 巡检管理模块

#### 第三阶段：高级功能开发（4周）
- 统计分析模块
- 报表导出功能
- 应急管理模块
- 培训管理模块

#### 第四阶段：测试优化（2周）
- 功能测试
- 性能测试
- 安全测试
- 用户体验优化

#### 第五阶段：部署上线（1周）
- 生产环境部署
- 数据迁移
- 监控配置
- 文档完善

### 8.2 里程碑
- **M1**: 基础框架完成（第2周）
- **M2**: 核心功能完成（第8周）
- **M3**: 高级功能完成（第12周）
- **M4**: 测试通过（第14周）
- **M5**: 正式上线（第15周）

## 九、运维监控

### 9.1 监控指标
- **系统指标**: CPU、内存、磁盘、网络
- **应用指标**: QPS、响应时间、错误率
- **业务指标**: 用户数、操作量、数据量

### 9.2 日志管理
- **应用日志**: Winston + 日志轮转
- **访问日志**: Nginx访问日志
- **错误日志**: Sentry错误追踪
- **日志分析**: ELK Stack

### 9.3 备份策略
- **云数据库备份**: 使用微信云开发自动备份（每日自动备份，保留7天）
- **云存储备份**: 重要文件定期备份到云存储
- **应用数据备份**: 每日导出关键业务数据
- **异地备份**: 每周将关键数据同步到其他云存储

## 十、项目总结

### 10.1 技术亮点
- 采用前后端分离架构，提高开发效率
- 使用TypeScript提高代码质量
- 实现RBAC权限模型，保障系统安全
- 支持数据可视化，提供决策支持
- 微服务架构设计，便于扩展

### 10.2 后续优化
- 引入消息队列，提高系统性能
- 实现缓存机制，提升响应速度
- 优化数据库查询，提高查询效率
- 增加自动化测试，保障代码质量
- 完善文档，降低维护成本

### 10.3 风险评估
- **技术风险**: 新技术学习成本
- **进度风险**: 需求变更影响
- **质量风险**: 测试覆盖不足
- **安全风险**: 数据泄露风险

### 10.4 应对措施
- 加强技术培训，提高团队能力
- 敏捷开发，快速响应变化
- 完善测试流程，提高测试覆盖率
- 加强安全审计，定期安全检查