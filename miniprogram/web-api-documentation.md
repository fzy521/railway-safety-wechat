# 铁路安全监控系统 - Web后台数据接口文档

## 一、接口概述

### 1.1 基本信息
- **接口协议**: HTTPS
- **数据格式**: JSON
- **字符编码**: UTF-8
- **调用方式**: 微信云开发HTTP API
- **环境ID**: cloud1-9gz3lqctb5e4f85d

### 1.2 通用响应格式

#### 成功响应
```json
{
  "success": true,
  "data": {},
  "message": "操作成功"
}
```

#### 失败响应
```json
{
  "success": false,
  "error": "错误信息",
  "code": 400
}
```

### 1.3 认证方式
- **方式**: 微信云开发Access Token
- **获取方式**: 调用微信云开发HTTP API获取
- **有效期**: 2小时
- **刷新机制**: 过期后重新获取

---

## 二、用户管理接口

### 2.1 用户登录

**接口说明**: 用户登录，获取用户信息和Token

**云函数**: `login`

**请求参数**:
```json
{
  "code": "微信登录code"
}
```

**响应数据**:
```json
{
  "success": true,
  "data": {
    "token": "JWT Token",
    "user": {
      "_id": "用户ID",
      "_openid": "微信openid",
      "name": "用户姓名",
      "avatarUrl": "头像URL",
      "phone": "手机号",
      "email": "邮箱",
      "deptId": "部门ID",
      "position": "职位",
      "roles": ["角色ID列表"],
      "status": 1,
      "inspections": 10,
      "incidents": 2,
      "certificates": 3,
      "experience": 5
    }
  }
}
```

### 2.2 更新用户信息

**接口说明**: 更新用户基本信息

**云函数**: `updateUserInfo`

**请求参数**:
```json
{
  "action": "update",
  "data": {
    "name": "用户姓名",
    "phone": "手机号",
    "email": "邮箱",
    "avatarUrl": "头像URL",
    "position": "职位"
  }
}
```

**响应数据**:
```json
{
  "success": true,
  "message": "用户信息更新成功"
}
```

### 2.3 获取用户统计信息

**接口说明**: 获取用户的统计数据

**云函数**: `updateUserInfo`

**请求参数**:
```json
{
  "action": "getStats"
}
```

**响应数据**:
```json
{
  "success": true,
  "data": {
    "inspections": 10,
    "incidents": 2,
    "certificates": 3,
    "experience": 5
  }
}
```

---

## 三、风险管理接口

### 3.1 MES风险评估

**接口说明**: 根据MES参数计算风险等级

**云函数**: `risk-assessment`

**请求参数**:
```json
{
  "m": 1,
  "e1": 6,
  "e2": 3,
  "s": 8,
  "riskId": "风险ID（可选，用于更新现有风险）"
}
```

**响应数据**:
```json
{
  "success": true,
  "data": {
    "m": 1,
    "e1": 6,
    "e2": 3,
    "s": 8,
    "e": 6,
    "r": 48,
    "level": 3,
    "grade": "一般风险",
    "color": "黄",
    "checkFrequency": "每季度一次"
  }
}
```

### 3.2 获取风险列表

**接口说明**: 获取风险列表，支持分页和筛选

**云函数**: `getRisks`

**请求参数**:
```json
{
  "page": 1,
  "pageSize": 20,
  "riskLevel": 1,
  "riskColor": "红",
  "status": "active"
}
```

**响应数据**:
```json
{
  "success": true,
  "data": {
    "list": [
      {
        "_id": "风险ID",
        "riskName": "风险名称",
        "riskType": "风险类型",
        "operationLink": "作业环节",
        "location": "风险地点",
        "mValue": 5,
        "e1Value": 6,
        "e2Value": 6,
        "sValue": 10,
        "rValue": 300,
        "riskLevel": 1,
        "riskGrade": "重大风险",
        "riskColor": "红",
        "controlMeasures": "岗位控制措施",
        "controlPerson": "控制人",
        "manageMeasures": "管控措施",
        "manageDept": "管控责任部门",
        "managePerson": "管控责任人",
        "checkFrequency": "每周一次",
        "nextCheckDate": "2025-01-15",
        "status": "active",
        "createdAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

### 3.3 获取风险详情

**接口说明**: 获取单个风险的详细信息

**云函数**: `getRiskDetail`

**请求参数**:
```json
{
  "id": "风险ID"
}
```

**响应数据**:
```json
{
  "success": true,
  "data": {
    "_id": "风险ID",
    "riskName": "风险名称",
    "riskType": "风险类型",
    "operationLink": "作业环节",
    "location": "风险地点",
    "mValue": 5,
    "e1Value": 6,
    "e2Value": 6,
    "sValue": 10,
    "rValue": 300,
    "riskLevel": 1,
    "riskGrade": "重大风险",
    "riskColor": "红",
    "controlMeasures": "岗位控制措施",
    "controlPerson": "控制人",
    "manageMeasures": "管控措施",
    "manageDept": "管控责任部门",
    "managePerson": "管控责任人",
    "checkFrequency": "每周一次",
    "identificationDate": "2025-01-01",
    "identificationMethod": "作业安全分析法",
    "nextReviewDate": "2025-07-01",
    "nextCheckDate": "2025-01-15",
    "status": "active",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### 3.4 创建风险

**接口说明**: 创建新的风险记录

**云函数**: `createRisk`

**请求参数**:
```json
{
  "riskName": "风险名称",
  "riskType": "风险类型",
  "operationLink": "作业环节",
  "location": "风险地点",
  "mValue": 5,
  "e1Value": 6,
  "e2Value": 6,
  "sValue": 10,
  "controlMeasures": "岗位控制措施",
  "controlPerson": "控制人",
  "manageMeasures": "管控措施",
  "manageDept": "管控责任部门",
  "managePerson": "管控责任人",
  "identificationMethod": "作业安全分析法"
}
```

**响应数据**:
```json
{
  "success": true,
  "message": "风险创建成功",
  "data": {
    "id": "新风险ID"
  }
}
```

### 3.5 更新风险

**接口说明**: 更新风险信息

**云函数**: `updateRisk`

**请求参数**:
```json
{
  "id": "风险ID",
  "data": {
    "riskName": "风险名称",
    "controlMeasures": "岗位控制措施",
    "manageMeasures": "管控措施"
  }
}
```

**响应数据**:
```json
{
  "success": true,
  "message": "风险更新成功"
}
```

### 3.6 删除风险

**接口说明**: 删除风险记录

**云函数**: `deleteRisk`

**请求参数**:
```json
{
  "id": "风险ID"
}
```

**响应数据**:
```json
{
  "success": true,
  "message": "风险删除成功"
}
```

---

## 四、风险预警接口

### 4.1 创建风险预警

**接口说明**: 创建新的风险预警

**云函数**: `risk-warning`

**请求参数**:
```json
{
  "action": "create",
  "riskId": "风险ID",
  "warningLevel": "红",
  "warningContent": "预警内容",
  "requirements": "整改要求"
}
```

**响应数据**:
```json
{
  "success": true,
  "message": "风险预警已创建",
  "data": {
    "warningId": "预警ID",
    "warning": {
      "warningLevel": "红",
      "warningTitle": "风险名称风险预警",
      "warningContent": "预警内容",
      "targetUnit": "责任单位",
      "deadline": "2025-01-15",
      "status": "已下发"
    }
  }
}
```

### 4.2 更新整改措施

**接口说明**: 更新预警的整改措施

**云函数**: `risk-warning`

**请求参数**:
```json
{
  "action": "update_rectify",
  "warningId": "预警ID",
  "rectifyMeasures": "整改措施"
}
```

**响应数据**:
```json
{
  "success": true,
  "message": "整改措施已更新"
}
```

### 4.3 提交验收申请

**接口说明**: 提交预警验收申请

**云函数**: `risk-warning`

**请求参数**:
```json
{
  "action": "submit_verify",
  "warningId": "预警ID"
}
```

**响应数据**:
```json
{
  "success": true,
  "message": "验收申请已提交"
}
```

### 4.4 验证预警整改

**接口说明**: 验证预警整改效果

**云函数**: `risk-warning`

**请求参数**:
```json
{
  "action": "verify",
  "warningId": "预警ID",
  "verificationResult": "通过",
  "verificationPerson": "验证人"
}
```

**响应数据**:
```json
{
  "success": true,
  "message": "验证结果：通过"
}
```

### 4.5 获取预警列表

**接口说明**: 获取预警列表

**云函数**: `risk-warning`

**请求参数**:
```json
{
  "action": "list",
  "status": "已下发"
}
```

**响应数据**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "预警ID",
      "warningLevel": "红",
      "warningTitle": "风险名称风险预警",
      "warningContent": "预警内容",
      "targetUnit": "责任单位",
      "riskName": "风险名称",
      "riskLocation": "风险地点",
      "requirements": "整改要求",
      "deadline": "2025-01-15",
      "rectifyMeasures": "整改措施",
      "verificationResult": "",
      "status": "已下发",
      "createdAt": "2025-01-01",
      "isOverdue": false,
      "remainingDays": 10
    }
  ]
}
```

### 4.6 获取预警详情

**接口说明**: 获取预警详细信息

**云函数**: `risk-warning`

**请求参数**:
```json
{
  "action": "detail",
  "warningId": "预警ID"
}
```

**响应数据**:
```json
{
  "success": true,
  "data": {
    "_id": "预警ID",
    "warningLevel": "红",
    "warningTitle": "风险名称风险预警",
    "warningContent": "预警内容",
    "targetUnit": "责任单位",
    "riskName": "风险名称",
    "riskLocation": "风险地点",
    "warningReason": "风险等级上升或管控措施失效",
    "trendAnalysis": "近期同类风险频发，需加强管控",
    "requirements": "整改要求",
    "deadline": "2025-01-15",
    "rectifyMeasures": "整改措施",
    "verificationResult": "",
    "verificationPerson": "",
    "status": "已下发",
    "createdAt": "2025-01-01"
  }
}
```

### 4.7 自动触发预警

**接口说明**: 根据风险趋势自动触发预警

**云函数**: `risk-warning`

**请求参数**:
```json
{
  "action": "auto_trigger"
}
```

**响应数据**:
```json
{
  "success": true,
  "message": "自动触发2条风险预警",
  "data": {
    "triggeredCount": 2
  }
}
```

---

## 五、隐患管理接口

### 5.1 获取隐患列表

**接口说明**: 获取隐患列表，支持分页和筛选

**云函数**: `getDangers`

**请求参数**:
```json
{
  "page": 1,
  "pageSize": 20,
  "dangerLevel": "重大隐患",
  "status": "整改中",
  "isSupervised": true
}
```

**响应数据**:
```json
{
  "success": true,
  "data": {
    "list": [
      {
        "_id": "隐患ID",
        "dangerLocation": "隐患地点",
        "dangerPart": "隐患部位",
        "dangerLevel": "重大隐患",
        "dangerCategory": "行车安全",
        "dangerDescription": "隐患描述",
        "dangerStatus": "隐患现状",
        "responsibleDept": "责任部门",
        "responsiblePerson": "责任人",
        "plannedCompleteDate": "2025-04-05",
        "isMajorDanger": true,
        "isSupervised": true,
        "supervisionLevel": "公司级",
        "supervisionStatus": "督办中",
        "status": "整改中",
        "discoveryDate": "2025-01-05",
        "createdAt": "2025-01-05T00:00:00.000Z"
      }
    ],
    "total": 50,
    "page": 1,
    "pageSize": 20
  }
}
```

### 5.2 获取隐患详情

**接口说明**: 获取隐患详细信息

**云函数**: `getDangerDetail`

**请求参数**:
```json
{
  "id": "隐患ID"
}
```

**响应数据**:
```json
{
  "success": true,
  "data": {
    "_id": "隐患ID",
    "dangerLocation": "隐患地点",
    "dangerPart": "隐患部位",
    "dangerLevel": "重大隐患",
    "dangerCategory": "行车安全",
    "dangerDescription": "隐患描述",
    "dangerStatus": "隐患现状",
    "causeAnalysis": "原因分析",
    "hazardAnalysis": "危害分析",
    "treatmentPlan": "专项治理方案",
    "treatmentMeasures": "整改措施",
    "responsibleDept": "责任部门",
    "responsiblePerson": "责任人",
    "supervisionPerson": "督办人",
    "plannedCompleteDate": "2025-04-05",
    "completionCriteria": "完成标准",
    "verificationMethod": "验证方法",
    "verificationResult": "",
    "verificationPerson": "",
    "verificationDate": null,
    "isMajorDanger": true,
    "isSupervised": true,
    "supervisionLevel": "公司级",
    "supervisionStatus": "督办中",
    "discoveryDate": "2025-01-05",
    "discoverer": "发现人",
    "findMethod": "专项排查",
    "inDangerLibrary": true,
    "status": "整改中",
    "createdAt": "2025-01-05T00:00:00.000Z",
    "updatedAt": "2025-01-05T00:00:00.000Z"
  }
}
```

### 5.3 创建隐患

**接口说明**: 创建新的隐患记录

**云函数**: `createDanger`

**请求参数**:
```json
{
  "dangerLocation": "隐患地点",
  "dangerPart": "隐患部位",
  "dangerLevel": "重大隐患",
  "dangerCategory": "行车安全",
  "dangerDescription": "隐患描述",
  "dangerStatus": "隐患现状",
  "causeAnalysis": "原因分析",
  "hazardAnalysis": "危害分析",
  "treatmentPlan": "专项治理方案",
  "treatmentMeasures": "整改措施",
  "responsibleDept": "责任部门",
  "responsiblePerson": "责任人",
  "plannedCompleteDate": "2025-04-05"
}
```

**响应数据**:
```json
{
  "success": true,
  "message": "隐患创建成功",
  "data": {
    "id": "新隐患ID"
  }
}
```

### 5.4 更新隐患

**接口说明**: 更新隐患信息

**云函数**: `updateDanger`

**请求参数**:
```json
{
  "id": "隐患ID",
  "data": {
    "treatmentMeasures": "整改措施",
    "responsiblePerson": "责任人"
  }
}
```

**响应数据**:
```json
{
  "success": true,
  "message": "隐患更新成功"
}
```

### 5.5 验证隐患

**接口说明**: 验证隐患整改效果

**云函数**: `verifyDanger`

**请求参数**:
```json
{
  "id": "隐患ID",
  "data": {
    "verificationResult": "合格",
    "verificationPerson": "验证人"
  }
}
```

**响应数据**:
```json
{
  "success": true,
  "message": "验收成功"
}
```

---

## 六、隐患督办接口

### 6.1 启动督办

**接口说明**: 识别重大隐患并启动挂牌督办

**云函数**: `danger-supervision`

**请求参数**:
```json
{
  "action": "identify",
  "dangerId": "隐患ID"
}
```

**响应数据**:
```json
{
  "success": true,
  "message": "重大隐患挂牌督办已启动",
  "data": {
    "dangerId": "隐患ID",
    "supervisionLevel": "公司级",
    "plannedCompleteDate": "2025-04-05"
  }
}
```

### 6.2 更新治理进展

**接口说明**: 更新隐患治理进展

**云函数**: `danger-supervision`

**请求参数**:
```json
{
  "action": "update_progress",
  "dangerId": "隐患ID",
  "progress": "50%",
  "measures": "当前采取的措施"
}
```

**响应数据**:
```json
{
  "success": true,
  "message": "治理进展已更新"
}
```

### 6.3 提交验证申请

**接口说明**: 提交隐患验证申请

**云函数**: `danger-supervision`

**请求参数**:
```json
{
  "action": "submit_verification",
  "dangerId": "隐患ID"
}
```

**响应数据**:
```json
{
  "success": true,
  "message": "验证申请已提交，等待现场验收"
}
```

### 6.4 验证治理效果

**接口说明**: 验证隐患治理效果

**云函数**: `danger-supervision`

**请求参数**:
```json
{
  "action": "verify",
  "dangerId": "隐患ID",
  "verificationResult": "合格",
  "verificationPerson": "验证人"
}
```

**响应数据**:
```json
{
  "success": true,
  "message": "验证结果：合格"
}
```

### 6.5 检查超期隐患

**接口说明**: 检查超期未完成的隐患

**云函数**: `danger-supervision`

**请求参数**:
```json
{
  "action": "check_overdue"
}
```

**响应数据**:
```json
{
  "success": true,
  "message": "发现3条超期隐患",
  "data": [
    {
      "dangerId": "隐患ID",
      "dangerDescription": "隐患描述",
      "responsibleDept": "责任部门",
      "plannedCompleteDate": "2025-01-01",
      "overdueDays": 5
    }
  ]
}
```

---

## 七、巡检管理接口

### 7.1 获取巡检记录列表

**接口说明**: 获取巡检记录列表

**云函数**: `getInspections`

**请求参数**:
```json
{
  "page": 1,
  "pageSize": 20,
  "checkType": "daily",
  "startDate": "2025-01-01",
  "endDate": "2025-01-31"
}
```

**响应数据**:
```json
{
  "success": true,
  "data": {
    "list": [
      {
        "_id": "巡检ID",
        "checkType": "daily",
        "checkDate": "2025-01-05",
        "checkDept": "巡检部门",
        "checkPerson": "巡检人",
        "checkRoute": "巡检路线",
        "checkPoints": ["巡检点1", "巡检点2"],
        "checkResult": "正常",
        "findings": [],
        "duration": 30,
        "distance": 500,
        "status": "completed",
        "createdAt": "2025-01-05T00:00:00.000Z"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

### 7.2 获取巡检详情

**接口说明**: 获取巡检记录详细信息

**云函数**: `getInspectionDetail`

**请求参数**:
```json
{
  "id": "巡检ID"
}
```

**响应数据**:
```json
{
  "success": true,
  "data": {
    "_id": "巡检ID",
    "checkType": "daily",
    "checkDate": "2025-01-05",
    "checkDept": "巡检部门",
    "checkPerson": "巡检人",
    "checkRoute": "巡检路线",
    "checkPoints": ["巡检点1", "巡检点2"],
    "checkItems": [
      {
        "riskId": "风险ID",
        "checkItem": "检查项",
        "checkStandard": "检查标准",
        "checkMethod": "检查方法",
        "result": "正常",
        "abnormalDesc": "",
        "handler": ""
      }
    ],
    "checkResult": "正常",
    "problemsFound": 0,
    "problemsRectified": 0,
    "summary": "巡检总结",
    "attachments": ["附件URL"],
    "duration": 30,
    "distance": 500,
    "status": "completed",
    "createdAt": "2025-01-05T00:00:00.000Z"
  }
}
```

### 7.3 生成检查表

**接口说明**: 根据风险自动生成检查表

**云函数**: `checklist-gen`

**请求参数**:
```json
{
  "checkType": "daily",
  "dept": "巡检部门",
  "location": "巡检地点"
}
```

**响应数据**:
```json
{
  "success": true,
  "data": {
    "checkItems": [
      {
        "riskId": "风险ID",
        "riskName": "风险名称",
        "checkItem": "检查项",
        "checkStandard": "检查标准",
        "checkMethod": "检查方法",
        "riskLevel": 1,
        "frequency": "每周一次",
        "result": "",
        "abnormalDesc": ""
      }
    ],
    "total": 10
  }
}
```

---

## 八、统计分析接口

### 8.1 获取快速统计

**接口说明**: 获取快速统计数据

**云函数**: `getQuickStats`

**请求参数**: 无

**响应数据**:
```json
{
  "success": true,
  "data": {
    "riskCount": 45,
    "dangerCount": 23,
    "inspectionCount": 156,
    "warningCount": 8
  }
}
```

### 8.2 获取安全指标

**接口说明**: 获取安全指标统计数据

**云函数**: `getSafetyMetrics`

**请求参数**:
```json
{
  "startDate": "2025-01-01",
  "endDate": "2025-01-31"
}
```

**响应数据**:
```json
{
  "success": true,
  "data": {
    "riskStats": {
      "total": 45,
      "major": 5,
      "larger": 10,
      "general": 20,
      "low": 10
    },
    "dangerStats": {
      "total": 23,
      "major": 3,
      "general": 20,
      "closed": 18,
      "pending": 5,
      "closureRate": 78.26
    },
    "inspectionStats": {
      "total": 156,
      "coverage": 95.5,
      "problemRate": 12.8
    },
    "trend": {
      "risks": [10, 12, 8, 15, 20, 18],
      "dangers": [5, 8, 6, 10, 12, 9],
      "inspections": [20, 25, 22, 30, 28, 31]
    }
  }
}
```

### 8.3 获取月度报表

**接口说明**: 生成月度隐患排查治理报表

**云函数**: `monthly-report`

**请求参数**:
```json
{
  "year": 2025,
  "month": 1
}
```

**响应数据**:
```json
{
  "success": true,
  "data": {
    "month": "2025年1月",
    "total": 23,
    "majorCount": 3,
    "closedCount": 18,
    "closureRate": 78.26,
    "overdueCount": 2,
    "byCategory": {
      "行车安全": 8,
      "人身安全": 5,
      "外部环境": 4,
      "特种设备": 3,
      "消防安全": 3
    },
    "byDept": {
      "工务段": 8,
      "供电段": 6,
      "运输部": 5,
      "安全监察部": 4
    }
  }
}
```

---

## 九、数据库初始化接口

### 9.1 初始化数据库

**接口说明**: 初始化双控机制数据库，创建集合和索引

**云函数**: `initDatabase`

**请求参数**: 无

**响应数据**:
```json
{
  "success": true,
  "message": "双控机制数据库初始化成功"
}
```

### 9.2 插入测试数据

**接口说明**: 插入测试数据（仅用于开发环境）

**云函数**: `initDatabase`

**请求参数**:
```json
{
  "collection": "risk_library"
}
```

**响应数据**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "风险ID",
      "riskName": "轨道连接螺栓松动",
      ...
    }
  ]
}
```

---

## 十、错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

---

## 十一、调用示例

### 11.1 使用微信云开发HTTP API调用

```javascript
// 获取Access Token
const response = await fetch(
  `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=SECRET`
);
const { access_token } = await response.json();

// 调用云函数
const result = await fetch(
  `https://api.weixin.qq.com/tcb/invokecloudfunction?access_token=${access_token}`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      env: 'cloud1-9gz3lqctb5e4f85d',
      name: 'risk-assessment',
      data: {
        m: 5,
        e1: 6,
        e2: 6,
        s: 10
      }
    })
  }
);

const { resp_data } = await result.json();
const data = JSON.parse(resp_data);
```

### 11.2 使用云开发SDK（Node.js）

```javascript
const cloud = require('wx-server-sdk');

cloud.init({
  env: 'cloud1-9gz3lqctb5e4f85d'
});

// 调用云函数
const result = await cloud.callFunction({
  name: 'risk-assessment',
  data: {
    m: 5,
    e1: 6,
    e2: 6,
    s: 10
  }
});
```

---

## 十二、注意事项

### 12.1 安全性
- 所有接口需要使用Access Token进行认证
- 敏感数据需要加密传输
- 定期轮换Access Token

### 12.2 性能优化
- 合理使用分页查询，避免一次性查询大量数据
- 使用数据库索引提升查询性能
- 缓存热点数据

### 12.3 错误处理
- 所有接口都需要进行错误处理
- 提供清晰的错误信息
- 记录错误日志

### 12.4 数据验证
- 对输入参数进行验证
- 对输出数据进行格式化
- 防止SQL注入和XSS攻击

---

**文档版本**: v1.0
**最后更新**: 2026-01-06
**维护者**: 开发团队