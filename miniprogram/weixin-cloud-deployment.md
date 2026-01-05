# 微信云开发完整部署方案

## 一、项目结构

```
railway-safety-cloud/
├── web/                          # 前端项目（Vue 3）
│   ├── src/
│   │   ├── api/                 # API调用
│   │   ├── components/          # 组件
│   │   ├── views/               # 页面
│   │   ├── router/              # 路由
│   │   ├── store/               # 状态管理
│   │   └── main.js
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── cloudfunctions/               # 云函数
│   ├── api/                     # 主API云函数
│   │   ├── index.js
│   │   └── package.json
│   ├── getRisks/                # 获取风险列表
│   ├── getDangers/              # 获取隐患列表
│   ├── getStatistics/           # 获取统计数据
│   └── login/                   # 用户登录
│
└── cloudbasemanager.json        # 云开发配置
```

## 二、前端部署步骤

### 2.1 创建前端项目

```bash
# 创建 Vue 3 项目
npm create vite@latest web -- --template vue-ts
cd web

# 安装依赖
npm install vue-router@4 pinia axios element-plus echarts

# 开发
npm run dev
```

### 2.2 配置 API 调用

创建 `web/src/api/cloud.js`：
```javascript
// 微信云开发配置
const CLOUD_ENV_ID = 'cloud1-9gz3lqctb5e4f85d'
const API_BASE = 'https://你的云函数URL'

// 云函数调用
export const callCloudFunction = async (name, data = {}) => {
  try {
    const response = await fetch(`${API_BASE}/tcb/invokecloudfunction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAccessToken()}`
      },
      body: JSON.stringify({
        env: CLOUD_ENV_ID,
        name: name,
        data: data
      })
    })

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

// 获取访问令牌
let accessToken = null
let tokenExpireTime = 0

const getAccessToken = async () => {
  if (accessToken && Date.now() < tokenExpireTime) {
    return accessToken
  }

  const response = await fetch(
    `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=你的APPID&secret=你的SECRET`
  )
  const data = await response.json()
  accessToken = data.access_token
  tokenExpireTime = Date.now() + (data.expires_in - 300) * 1000
  return accessToken
}

// API 接口封装
export const api = {
  // 风险管理
  getRisks: (params) => callCloudFunction('api', { action: 'getRisks', ...params }),
  getRiskDetail: (id) => callCloudFunction('api', { action: 'getRiskDetail', id }),
  createRisk: (data) => callCloudFunction('api', { action: 'createRisk', data }),
  updateRisk: (id, data) => callCloudFunction('api', { action: 'updateRisk', id, data }),
  deleteRisk: (id) => callCloudFunction('api', { action: 'deleteRisk', id }),

  // 隐患管理
  getDangers: (params) => callCloudFunction('api', { action: 'getDangers', ...params }),
  getDangerDetail: (id) => callCloudFunction('api', { action: 'getDangerDetail', id }),
  createDanger: (data) => callCloudFunction('api', { action: 'createDanger', data }),
  updateDanger: (id, data) => callCloudFunction('api', { action: 'updateDanger', id, data }),
  verifyDanger: (id, data) => callCloudFunction('api', { action: 'verifyDanger', id, data }),

  // 统计分析
  getStatistics: () => callCloudFunction('api', { action: 'getStatistics' }),
  getOverview: () => callCloudFunction('api', { action: 'getOverview' }),
  getTrend: (params) => callCloudFunction('api', { action: 'getTrend', ...params }),

  // 用户管理
  login: (code) => callCloudFunction('login', { code }),
  getUserInfo: () => callCloudFunction('api', { action: 'getUserInfo' }),
  updateUserInfo: (data) => callCloudFunction('api', { action: 'updateUserInfo', data })
}
```

### 2.3 构建前端

```bash
# 生产环境构建
npm run build

# 构建产物在 web/dist 目录
```

### 2.4 部署到云开发静态托管

**方法一：使用微信开发者工具**
1. 打开微信开发者工具
2. 选择"云开发" → "静态网站托管"
3. 点击"上传文件"
4. 选择 `web/dist` 目录下的所有文件
5. 上传完成后，获得访问地址

**方法二：使用命令行**
```bash
# 安装云开发 CLI
npm install -g @cloudbase/cli

# 登录
cloudbase login

# 初始化
cloudbase init

# 部署静态网站
cloudbase hosting deploy dist -e cloud1-9gz3lqctb5e4f85d
```

## 三、云函数开发

### 3.1 主API云函数

创建 `cloudfunctions/api/index.js`：
```javascript
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { action, ...params } = event
  const wxContext = cloud.getWXContext()

  try {
    switch (action) {
      // ========== 风险管理 ==========
      case 'getRisks':
        return await getRisks(params)
      case 'getRiskDetail':
        return await getRiskDetail(params)
      case 'createRisk':
        return await createRisk(params)
      case 'updateRisk':
        return await updateRisk(params)
      case 'deleteRisk':
        return await deleteRisk(params)

      // ========== 隐患管理 ==========
      case 'getDangers':
        return await getDangers(params)
      case 'getDangerDetail':
        return await getDangerDetail(params)
      case 'createDanger':
        return await createDanger(params)
      case 'updateDanger':
        return await updateDanger(params)
      case 'verifyDanger':
        return await verifyDanger(params)

      // ========== 统计分析 ==========
      case 'getStatistics':
        return await getStatistics()
      case 'getOverview':
        return await getOverview()
      case 'getTrend':
        return await getTrend(params)

      // ========== 用户管理 ==========
      case 'getUserInfo':
        return await getUserInfo(wxContext)
      case 'updateUserInfo':
        return await updateUserInfo(wxContext, params)

      default:
        return { code: 400, message: '未知的操作类型' }
    }
  } catch (error) {
    console.error('云函数执行失败:', error)
    return { code: 500, message: error.message }
  }
}

// ========== 风险管理函数 ==========
async function getRisks(params) {
  const { page = 1, pageSize = 20, riskLevel, riskColor, status } = params

  let query = db.collection('risk_library')

  // 筛选条件
  if (riskLevel) query = query.where({ riskLevel })
  if (riskColor) query = query.where({ riskColor })
  if (status) query = query.where({ status })

  const result = await query
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .orderBy('createdAt', 'desc')
    .get()

  const total = await query.count()

  return {
    code: 200,
    data: result.data,
    total: total.total,
    page,
    pageSize
  }
}

async function getRiskDetail(params) {
  const { id } = params
  const result = await db.collection('risk_library').doc(id).get()

  return {
    code: 200,
    data: result.data
  }
}

async function createRisk(params) {
  const { data } = params
  const result = await db.collection('risk_library').add({
    data: {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })

  return {
    code: 200,
    message: '创建成功',
    data: { id: result._id }
  }
}

async function updateRisk(params) {
  const { id, data } = params
  await db.collection('risk_library').doc(id).update({
    data: {
      ...data,
      updatedAt: new Date()
    }
  })

  return {
    code: 200,
    message: '更新成功'
  }
}

async function deleteRisk(params) {
  const { id } = params
  await db.collection('risk_library').doc(id).remove()

  return {
    code: 200,
    message: '删除成功'
  }
}

// ========== 隐患管理函数 ==========
async function getDangers(params) {
  const { page = 1, pageSize = 20, dangerLevel, status, isSupervised } = params

  let query = db.collection('hidden_danger_library')

  if (dangerLevel) query = query.where({ dangerLevel })
  if (status) query = query.where({ status })
  if (isSupervised !== undefined) query = query.where({ isSupervised })

  const result = await query
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .orderBy('createdAt', 'desc')
    .get()

  const total = await query.count()

  return {
    code: 200,
    data: result.data,
    total: total.total,
    page,
    pageSize
  }
}

async function getDangerDetail(params) {
  const { id } = params
  const result = await db.collection('hidden_danger_library').doc(id).get()

  return {
    code: 200,
    data: result.data
  }
}

async function createDanger(params) {
  const { data } = params
  const result = await db.collection('hidden_danger_library').add({
    data: {
      ...data,
      status: '待整改',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })

  return {
    code: 200,
    message: '创建成功',
    data: { id: result._id }
  }
}

async function updateDanger(params) {
  const { id, data } = params
  await db.collection('hidden_danger_library').doc(id).update({
    data: {
      ...data,
      updatedAt: new Date()
    }
  })

  return {
    code: 200,
    message: '更新成功'
  }
}

async function verifyDanger(params) {
  const { id, data } = params
  await db.collection('hidden_danger_library').doc(id).update({
    data: {
      ...data,
      status: '已整改',
      actualCompleteDate: new Date(),
      updatedAt: new Date()
    }
  })

  return {
    code: 200,
    message: '验收成功'
  }
}

// ========== 统计分析函数 ==========
async function getStatistics() {
  const [riskCount, dangerCount, checkCount] = await Promise.all([
    db.collection('risk_library').count(),
    db.collection('hidden_danger_library').count(),
    db.collection('check_records').count()
  ])

  return {
    code: 200,
    data: {
      riskCount: riskCount.total,
      dangerCount: dangerCount.total,
      checkCount: checkCount.total
    }
  }
}

async function getOverview() {
  const [
    majorRisks,
    majorDangers,
    pendingDangers,
    recentInspections
  ] = await Promise.all([
    db.collection('risk_library').where({ riskLevel: 1 }).count(),
    db.collection('hidden_danger_library').where({ isMajorDanger: true }).count(),
    db.collection('hidden_danger_library').where({ status: '整改中' }).count(),
    db.collection('check_records')
      .orderBy('checkDate', 'desc')
      .limit(10)
      .get()
  ])

  return {
    code: 200,
    data: {
      majorRisks: majorRisks.total,
      majorDangers: majorDangers.total,
      pendingDangers: pendingDangers.total,
      recentInspections: recentInspections.data
    }
  }
}

async function getTrend(params) {
  const { days = 30 } = params
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const result = await db.collection('check_records')
    .where({
      checkDate: _.gte(startDate)
    })
    .orderBy('checkDate', 'asc')
    .get()

  // 按日期统计
  const trend = {}
  result.data.forEach(item => {
    const date = item.checkDate.toISOString().split('T')[0]
    trend[date] = (trend[date] || 0) + 1
  })

  return {
    code: 200,
    data: trend
  }
}

// ========== 用户管理函数 ==========
async function getUserInfo(wxContext) {
  const result = await db.collection('users').where({
    _openid: wxContext.OPENID
  }).get()

  if (result.data.length > 0) {
    return {
      code: 200,
      data: result.data[0]
    }
  }

  return {
    code: 404,
    message: '用户不存在'
  }
}

async function updateUserInfo(wxContext, params) {
  const { data } = params
  await db.collection('users').where({
    _openid: wxContext.OPENID
  }).update({
    data: {
      ...data,
      updatedAt: new Date()
    }
  })

  return {
    code: 200,
    message: '更新成功'
  }
}
```

创建 `cloudfunctions/api/package.json`：
```json
{
  "name": "api",
  "version": "1.0.0",
  "description": "主API云函数",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}
```

### 3.2 登录云函数

创建 `cloudfunctions/login/index.js`：
```javascript
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { code } = event
  const wxContext = cloud.getWXContext()

  try {
    // 获取用户信息
    let userResult = await db.collection('users').where({
      _openid: wxContext.OPENID
    }).get()

    // 如果用户不存在，创建新用户
    if (userResult.data.length === 0) {
      const createResult = await db.collection('users').add({
        data: {
          _openid: wxContext.OPENID,
          name: '管理员',
          phone: '',
          email: '',
          avatarUrl: '',
          role: 'admin',
          status: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      userResult = await db.collection('users').doc(createResult._id).get()
    }

    // 生成JWT Token
    const token = generateToken(userResult.data[0])

    return {
      code: 200,
      message: '登录成功',
      data: {
        token,
        user: userResult.data[0]
      }
    }
  } catch (error) {
    console.error('登录失败:', error)
    return {
      code: 500,
      message: error.message
    }
  }
}

// 简单的Token生成（实际项目应使用jsonwebtoken）
function generateToken(user) {
  const payload = {
    openid: user._openid,
    userId: user._id,
    role: user.role
  }
  return Buffer.from(JSON.stringify(payload)).toString('base64')
}
```

### 3.3 部署云函数

**方法一：使用微信开发者工具**
1. 打开微信开发者工具
2. 右键点击 `cloudfunctions` 文件夹
3. 选择"上传并部署：云端安装依赖"
4. 等待部署完成

**方法二：使用命令行**
```bash
# 部署所有云函数
cloudbase functions:deploy -e cloud1-9gz3lqctb5e4f85d

# 部署单个云函数
cloudbase functions:deploy api -e cloud1-9gz3lqctb5e4f85d
```

## 四、HTTP API 配置

### 4.1 开通 HTTP API

1. 登录微信云开发控制台
2. 进入"设置" → "环境设置"
3. 找到"HTTP API" → 点击"开通"
4. 获取 Access Token

### 4.2 配置安全域名

1. 在云开发控制台 → "设置" → "安全设置"
2. 添加你的域名到"Web 安全域名"
3. 如果使用云开发托管，添加云托管域名

### 4.3 获取云函数 HTTP 访问地址

每个云函数部署后会获得一个 HTTP 访问地址，格式：
```
https://你的环境ID.service.tcloudbase.com/云函数名称
```

## 五、域名配置

### 5.1 绑定自定义域名

1. 在云开发控制台 → "静态网站托管" → "设置"
2. 点击"绑定自定义域名"
3. 输入你的域名（如：admin.railway-safety.com）
4. 按照提示配置 DNS 解析

### 5.2 DNS 配置

在你的域名服务商处添加 CNAME 记录：
```
类型: CNAME
主机记录: admin
记录值: 你的云托管域名
```

### 5.3 SSL 证书

微信云开发会自动为你的域名配置 SSL 证书，无需手动配置。

## 六、环境变量配置

创建 `web/.env.production`：
```bash
# 应用配置
VITE_APP_TITLE=铁路安全管理系统
VITE_API_BASE=https://你的环境ID.service.tcloudbase.com

# 微信云开发配置
VITE_CLOUD_ENV_ID=cloud1-9gz3lqctb5e4f85d
VITE_APP_ID=你的APPID
VITE_APP_SECRET=你的SECRET
```

## 七、完整部署流程

### 步骤1：准备环境
```bash
# 克隆项目
git clone <项目地址>
cd railway-safety-cloud

# 安装依赖
cd web
npm install
```

### 步骤2：构建前端
```bash
npm run build
```

### 步骤3：部署静态网站
```bash
# 使用云开发 CLI
cloudbase login
cloudbase hosting deploy dist -e cloud1-9gz3lqctb5e4f85d
```

### 步骤4：部署云函数
```bash
# 部署所有云函数
cloudbase functions:deploy -e cloud1-9gz3lqctb5e4f85d
```

### 步骤5：配置域名
1. 在云开发控制台绑定自定义域名
2. 配置 DNS 解析
3. 等待域名生效（通常 10-30 分钟）

### 步骤6：测试访问
```bash
# 访问你的域名
https://admin.railway-safety.com
```

## 八、成本说明

### 免费额度（每月）
- **静态网站托管**: 5GB 存储 + 5GB 流量
- **云函数**: 42万次调用 + 40万 GBs 资源使用量
- **云数据库**: 2GB 容量 + 5万次读 + 3万次写
- **云存储**: 5GB 容量 + 5GB 下载流量

### 超出免费额度后
- **静态网站托管**: ¥0.0043/GB/天 + ¥0.21/GB
- **云函数**: ¥0.0000167/GBs
- **云数据库**: ¥0.07/GB/天 + ¥0.015/万次读 + ¥0.05/万次写
- **云存储**: ¥0.0043/GB/天 + ¥0.21/GB

### 预估月度成本（小型系统）
- 完全在免费额度内：**¥0**
- 超出部分：约 **¥50-100/月**

## 九、监控和维护

### 9.1 查看监控
1. 登录微信云开发控制台
2. 查看"监控" → "云函数监控"
3. 查看"监控" → "数据库监控"

### 9.2 日志查看
```bash
# 查看云函数日志
cloudbase functions:log api -e cloud1-9gz3lqctb5e4f85d
```

### 9.3 数据备份
微信云开发自动备份，无需手动操作。

## 十、常见问题

### Q1: 云函数调用失败？
- 检查 HTTP API 是否开通
- 检查 Access Token 是否有效
- 检查云函数是否部署成功

### Q2: 前端无法访问云函数？
- 检查安全域名配置
- 检查 CORS 配置
- 检查网络连接

### Q3: 数据库访问受限？
- 检查数据库权限规则
- 检查安全规则配置

## 十一、优势总结

✅ **零成本**：免费额度完全够用
✅ **零运维**：无需管理服务器
✅ **快速部署**：10分钟完成
✅ **自动扩容**：无需手动扩容
✅ **数据安全**：微信云开发保障
✅ **与小程序共享**：数据无缝集成

这个方案最适合个人开发者和小团队，快速上线且成本低廉！