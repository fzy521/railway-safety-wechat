# 梁邹铁路专用线运营安全监控系统

Railway Safety Monitoring System for Dedicated Railway Lines

## 🚂 系统简介

这是一个基于Web的铁路安全监控系统，提供安全检查、事故管理、风险评估、培训管理等核心功能。系统支持多种部署模式，从纯前端演示到完整的数据库驱动应用。

## 🚀 快速开始

### 系统要求
- Node.js 14.0 或更高版本
- 现代浏览器（Chrome, Firefox, Edge, Safari）

### 安装和启动

```bash
# 克隆或下载项目
cd railway_safety

# 安装依赖
npm install

# 启动系统（推荐）
node start.js --demo    # 演示模式（无数据库）
node start.js           # 完整模式（含数据库）
node start.js --simple  # 简单模式
node start.js --native  # 原生模式

# 或通过环境变量
MODE=demo node start.js
```

### 访问系统
启动后访问: http://localhost:3000

## 📋 功能特性

### 核心模块
1. **安全仪表板** - 实时安全指标和统计
2. **风险评估** - 5x5风险矩阵和趋势分析
3. **事故管理** - 事故报告和跟踪处理
4. **培训管理** - 培训计划和证书管理
5. **检查管理** - 定期安全检查和隐患管理
6. **设备管理** - 设备档案和维护记录

### 用户角色
- **超级管理员** - 系统管理权限
- **安全管理员** - 安全相关功能管理
- **培训管理员** - 培训和证书管理
- **普通用户** - 查看权限

## 🛠️ 技术架构

### 前端技术
- HTML5 + CSS3 + JavaScript (ES6+)
- Tailwind CSS - UI框架
- ECharts.js - 数据可视化
- Anime.js - 动画效果

### 后端技术（可选）
- Node.js + Express.js
- SQLite数据库
- JWT认证
- 安全中间件（Helmet, CORS等）

### 部署模式
1. **演示模式** - 纯前端，模拟数据
2. **完整模式** - 前后端 + 数据库
3. **简单模式** - 简化后端
4. **原生模式** - 零依赖运行

## 📁 项目结构

```
railway_safety/
├── start.js                 # 统一启动脚本
├── start-without-db.js      # 无数据库版本
├── server/                  # 后端代码（可选）
│   ├── app.js              # Express应用
│   ├── routes/             # API路由
│   ├── models/             # 数据模型
│   └── services/           # 业务逻辑
├── database/               # 数据库文件
├── *.html                  # 前端页面
├── main.js                 # 前端主逻辑
└── api-service.js          # 客户端API服务
```

## 🔧 开发指南

### 添加新功能
1. 前端：修改对应的HTML文件和main.js
2. 后端：在server/routes/中添加新的API路由
3. 数据：更新server/services/api-service.js

### 测试账户
- 管理员: admin / admin123
- 安全管理员: safety / safety123
- 培训管理员: train / train123
- 普通用户: user1 / user123

## 🚀 部署指南

### 本地部署
```bash
# 1. 克隆项目
git clone <repository-url
cd railway_safety

# 2. 安装依赖
npm install

# 3. 选择部署模式
npm start              # 完整模式（含数据库）
npm run demo           # 演示模式（无数据库）
```

### 云端部署（Render）
1. Fork本项目到你的GitHub
2. 注册 [Render](https://render.com)
3. 连接GitHub仓库
4. 自动部署（已包含render.yaml配置）

### Docker部署
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📄 文档

详细文档请查看：
- [系统架构](docs/architecture.md) - 技术架构和设计理念
- [数据库设计](docs/database-design.md) - 数据表结构和关系
- [API文档](docs/api.md) - 接口说明和使用示例

## 🔍 开发说明

### 目录结构
```
src/
├── server/           # 后端代码
│   ├── routes/       # API路由
│   ├── models/       # 数据模型
│   └── services/     # 业务逻辑
├── database/         # 数据库文件
├── docs/             # 项目文档
└── public/           # 静态资源
```

### 环境变量
```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=./database/railway_safety.db
JWT_SECRET=your-secret-key
```

## 🤝 贡献

欢迎提交Issue和Pull Request来改进系统。

## 📄 许可证

MIT License - 详见LICENSE文件