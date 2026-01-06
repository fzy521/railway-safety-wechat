# 铁路安全监控系统

基于微信小程序和Web管理后台的铁路安全风险分级管控和隐患排查治理双控机制系统。

## 📋 项目简介

本项目是一个完整的铁路安全管理系统,包含微信小程序端和Web管理后台,实现了安全风险分级管控和隐患排查治理的双控机制,符合《安全风险分级管控和隐患排查治理管理办法》和GBT 33000-2025标准要求。

### 核心功能

- 📊 **数据看板** - 实时安全指标展示和趋势分析
- ⚠️ **风险管理** - MES法风险评估,四色风险等级管理
- 🔍 **隐患管理** - 隐患登记、整改、验证闭环管理
- 📢 **风险预警** - 红橙黄蓝四级预警机制
- 👮 **隐患督办** - 重大隐患挂牌督办
- 🔎 **巡检管理** - 日常、定期、专项巡检
- 📈 **统计分析** - 多维度数据分析和报表
- 👥 **用户管理** - 用户权限和角色管理
- ⚙️ **系统设置** - 业务规则和系统配置

## 🏗️ 项目结构

```
railway_safety/
├── miniprogram/                    # 微信小程序端
│   ├── pages/                      # 页面
│   │   ├── dashboard/              # 数据看板
│   │   ├── risk/                   # 风险管理
│   │   ├── hazard/                 # 隐患管理
│   │   ├── inspection/             # 巡检管理
│   │   ├── emergency/              # 应急管理
│   │   ├── profile/                # 个人中心
│   │   ├── login/                  # 登录
│   │   └── scan-login/             # 扫码登录
│   ├── cloudfunctions/             # 云函数
│   │   ├── login/                  # 用户登录
│   │   ├── webLogin/               # Web扫码登录
│   │   ├── risk-assessment/        # MES风险评估
│   │   ├── danger-supervision/     # 隐患督办
│   │   ├── getSafetyMetrics/       # 获取安全指标
│   │   └── ...
│   ├── images/                     # 图片资源
│   └── app.json                    # 小程序配置
│
├── web-admin/                      # Web管理后台
│   ├── frontend/                   # 前端项目
│   │   ├── src/
│   │   │   ├── views/              # 页面组件
│   │   │   ├── components/         # 公共组件
│   │   ├── api/                   # API接口
│   │   ├── router/                # 路由配置
│   │   ├── stores/                # 状态管理
│   │   └── utils/                 # 工具函数
│   │   ├── package.json           # 依赖配置
│   │   └── vite.config.ts         # Vite配置
│   └── README.md                   # Web后台说明
│
└── docs/                           # 项目文档
    ├── web-admin-architecture.md   # Web后台架构
    ├── web-api-documentation.md    # API接口文档
    └── 功能完善设计方案-双控机制.md # 功能设计
```

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- 微信开发者工具
- 微信小程序账号
- 已开通微信云开发

### 小程序端部署

1. **克隆项目**
```bash
git clone https://github.com/fzy521/railway-safety-wechat.git
cd railway_safety/miniprogram
```

2. **配置项目**
   - 使用微信开发者工具打开 `miniprogram` 目录
   - 填写小程序 AppID: `wx44d680a5026d9661`
   - 配置云开发环境ID: `cloud1-9gz3lqctb5e4f85d`

3. **部署云函数**
   - 在微信开发者工具中右键 `cloudfunctions` 文件夹
   - 选择"上传并部署:云端安装依赖"
   - 依次部署所有云函数

4. **初始化数据库**
   - 调用 `initDatabase` 云函数
   - 初始化数据库集合和索引

### Web后台部署

1. **安装依赖**
```bash
cd web-admin/frontend
npm install
```

2. **配置环境变量**
   - 编辑 `.env.development` 文件
   - 填入微信云开发环境ID
   - 填入微信小程序 AppID 和 Secret

3. **启动开发服务器**
```bash
npm run dev
```

4. **访问应用**
   - 打开浏览器访问: http://localhost:5174/
   - 使用账号密码或扫码登录

## 📱 功能模块

### 1. 风险管理

- **MES风险评估**: 
  - M(控制措施状态) × E(暴露频次) × S(事故后果)
  - 自动计算风险值和等级
  - 四色风险等级: 红重大、橙较大、黄一般、蓝低
  
- **风险库管理**:
  - 风险点登记和评估
  - 管控措施制定
  - 检查频次自动生成
  - 风险公告和预警

### 2. 隐患管理

- **隐患登记**:
  - 现场拍照上传
  - 自动判定隐患级别
  - 原因分析和危害分析
  
- **整改流程**:
  - 整改方案制定
  - 整改进度跟踪
  - 验收和销号
  
- **督办机制**:
  - 重大隐患自动挂牌
  - 部门级/公司级督办
  - 超期预警提醒

### 3. 巡检管理

- **巡检类型**:
  - 日常巡检(每日/每班)
  - 定期巡检(每月/每季)
  - 专项巡检(按需)

- **智能检查表**:
  - 根据风险自动生成
  - 检查项和标准
  - 异常记录和处理

### 4. 统计分析

- **数据看板**:
  - 实时统计指标
  - 趋势分析图表
  - 多维度数据展示

- **报表生成**:
  - 月度隐患排查报表
  - 风险管控效果评价
  - 自定义报表导出

## 🔐 登录方式

### 账号密码登录
- 使用用户名和密码登录Web后台
- 适合管理员和内部人员

### 微信扫码登录
- Web端生成二维码
- 小程序扫码确认
- 自动登录Web后台
- 便捷安全的登录方式

## 🛠️ 技术栈

### 小程序端

- **框架**: 微信小程序原生框架
- **后端**: 微信云开发(云函数 + 云数据库)
- **UI**: 微信原生组件 + 自定义组件

### Web后台

- **框架**: Vue 3 + TypeScript
- **UI组件库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **HTTP客户端**: Axios
- **图表库**: ECharts
- **构建工具**: Vite 5

## 📊 数据库设计

### 主要集合

- `users` - 用户信息
- `risk_library` - 风险库
- `hidden_danger_library` - 隐患库
- `check_records` - 巡检记录
- `risk_warnings` - 风险预警
- `supervision_records` - 督办记录
- `login_sessions` - 登录会话

## 📖 文档

- [Web后台架构方案](miniprogram/web-admin-architecture.md)
- [Web后台API接口文档](miniprogram/web-api-documentation.md)
- [功能完善设计方案](miniprogram/功能完善设计方案-双控机制.md)
- [Web后台开发指南](miniprogram/web-admin-development-guide.md)

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来改进项目。

### 开发规范

1. 遵循现有代码风格
2. 添加必要的注释
3. 编写清晰的提交信息
4. 确保代码通过测试

## 📄 许可证

MIT License

## 👥 联系方式

- 项目地址: https://github.com/fzy521/railway-safety-wechat
- 问题反馈: 通过 GitHub Issues

## 🎯 后续计划

- [ ] 完善数据可视化
- [ ] 增加移动端适配
- [ ] 优化性能和用户体验
- [ ] 添加更多报表功能
- [ ] 实现消息推送
- [ ] 增加数据导出功能

---

**开发团队**: 铁路安全监控系统开发组  
**最后更新**: 2026年1月6日