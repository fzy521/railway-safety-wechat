# API文档

## 概述

本文档描述了铁路安全监控系统的所有API接口，包括认证、安全管理、培训管理等模块的RESTful API。

## 基础信息

- **Base URL**: `http://localhost:3000/api`
- **认证方式**: JWT Bearer Token
- **数据格式**: JSON
- **编码**: UTF-8

## 认证相关

### 登录
**POST** `/auth/login`

用户登录认证。

#### 请求参数
```json
{
  "username": "admin",
  "password": "admin123"
}
```

#### 响应示例
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "超级管理员"
  }
}
```

#### 错误响应
```json
{
  "success": false,
  "message": "用户名或密码错误"
}
```

### 获取当前用户信息
**GET** `/auth/profile`

需要认证头：
```
Authorization: Bearer <token>
```

#### 响应示例
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "full_name": "系统管理员",
    "email": "admin@example.com",
    "department": "信息部",
    "position": "系统管理员",
    "role": "超级管理员"
  }
}
```

## 安全管理API

### 安全统计
**GET** `/safety/stats`

获取安全相关统计数据。

#### 响应示例
```json
{
  "success": true,
  "data": {
    "totalChecks": 156,
    "completedChecks": 142,
    "pendingChecks": 14,
    "passRate": 91,
    "totalIncidents": 23,
    "incidentsThisMonth": 3,
    "totalHiddenDangers": 45,
    "resolvedDangers": 38
  }
}
```

### 获取事故列表
**GET** `/safety/incidents`

获取事故记录列表，支持分页和筛选。

#### 查询参数
- `page` (可选): 页码，默认1
- `limit` (可选): 每页条数，默认20
- `status` (可选): 状态筛选
- `type` (可选): 事故类型筛选
- `startDate` (可选): 开始日期
- `endDate` (可选): 结束日期

#### 响应示例
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "incident_no": "INC2024001",
        "incident_type": "设备故障",
        "incident_level": "minor",
        "incident_title": "K15+200轨道电路故障",
        "incident_time": "2024-01-15T09:30:00Z",
        "location": "K15+200",
        "status": "closed",
        "reporter": "张三"
      }
    ],
    "total": 23,
    "page": 1,
    "limit": 20
  }
}
```

### 创建事故报告
**POST** `/safety/incidents`

创建新的事故报告。

#### 请求参数
```json
{
  "incident_type": "设备故障",
  "incident_level": "minor",
  "incident_title": "轨道电路故障",
  "incident_time": "2024-01-15T09:30:00Z",
  "location": "K15+200",
  "description": "详细描述...",
  "cause_analysis": "原因分析..."
}
```

### 获取风险列表
**GET** `/safety/risks`

获取风险评估列表。

#### 响应示例
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "轨道磨损",
        "level": "高",
        "probability": 4,
        "impact": 5,
        "status": "监控中",
        "measures": "加强巡检，定期测量"
      }
    ]
  }
}
```

### 获取安全检查列表
**GET** `/safety/checks`

获取安全检查记录。

#### 查询参数
- `status` (可选): 检查状态
- `type` (可选): 检查类型
- `date` (可选): 检查日期

#### 响应示例
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "check_no": "CHK2024001",
        "check_type": "daily",
        "check_title": "日常安全检查",
        "location": "全线",
        "check_date": "2024-01-15",
        "checker": "李四",
        "status": "completed",
        "result": "pass",
        "score": 95
      }
    ]
  }
}
```

### 创建检查记录
**POST** `/safety/checks`

创建新的安全检查记录。

#### 请求参数
```json
{
  "check_type": "daily",
  "check_title": "日常安全检查",
  "check_content": "检查内容...",
  "location": "K10-K20",
  "check_date": "2024-01-15",
  "result": "pass",
  "score": 95,
  "remarks": "备注信息"
}
```

## 培训管理API

### 获取培训课程列表
**GET** `/training/courses`

获取可用的培训课程。

#### 响应示例
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "course_code": "SAF001",
        "course_name": "铁路安全基础培训",
        "course_type": "safety",
        "duration_hours": 8,
        "instructor": "王老师",
        "status": "active"
      }
    ]
  }
}
```

### 获取培训记录
**GET** `/training/records`

获取用户的培训记录。

#### 查询参数
- `user_id` (可选): 用户ID
- `status` (可选): 记录状态

#### 响应示例
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "record_no": "TRN2024001",
        "course_name": "铁路安全基础培训",
        "training_date": "2024-01-10",
        "completion_date": "2024-01-10",
        "score": 90,
        "result": "pass",
        "certificate_no": "CERT2024001",
        "certificate_expiry": "2025-01-10",
        "status": "completed"
      }
    ]
  }
}
```

### 获取证书列表
**GET** `/training/certificates`

获取用户证书列表。

#### 响应示例
```json
{
  "success": true,
  "data": {
    "certificates": [
      {
        "id": 1,
        "certificate_no": "CERT2024001",
        "course_name": "铁路安全基础培训",
        "issue_date": "2024-01-10",
        "expiry_date": "2025-01-10",
        "status": "valid"
      }
    ]
  }
}
```

## 设备管理API

### 获取设备列表
**GET** `/equipment/list`

获取设备清单。

#### 响应示例
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "equipment_code": "EQ001",
        "equipment_name": "轨道检测仪",
        "equipment_type": "检测设备",
        "location": "K15+200",
        "status": "normal",
        "next_maintenance_date": "2024-03-15"
      }
    ]
  }
}
```

### 获取维护记录
**GET** `/equipment/maintenance`

获取设备维护记录。

#### 响应示例
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "record_no": "MNT2024001",
        "equipment_code": "EQ001",
        "equipment_name": "轨道检测仪",
        "maintenance_type": "routine",
        "maintenance_date": "2024-01-15",
        "maintainer": "张工",
        "cost": 500.00
      }
    ]
  }
}
```

## 系统管理API

### 获取系统设置
**GET** `/system/settings`

获取系统配置信息。

#### 响应示例
```json
{
  "success": true,
  "data": {
    "settings": {
      "site_name": "梁邹铁路安全监控系统",
      "items_per_page": 20,
      "session_timeout": 3600,
      "password_expiry_days": 90,
      "enable_audit_log": true
    }
  }
}
```

### 更新系统设置
**PUT** `/system/settings`

更新系统配置。

#### 请求参数
```json
{
  "site_name": "梁邹铁路安全监控系统",
  "items_per_page": 25,
  "session_timeout": 3600
}
```

## 用户管理API

### 获取用户列表
**GET** `/users`

获取系统用户列表（需要管理员权限）。

#### 响应示例
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "username": "admin",
        "full_name": "系统管理员",
        "email": "admin@example.com",
        "department": "信息部",
        "position": "系统管理员",
        "role": "超级管理员",
        "status": 1
      }
    ]
  }
}
```

### 创建用户
**POST** `/users`

创建新用户（需要管理员权限）。

#### 请求参数
```json
{
  "username": "newuser",
  "password": "password123",
  "full_name": "新用户",
  "email": "newuser@example.com",
  "department": "安全部",
  "position": "安全员",
  "role_id": 2
}
```

## 数据统计API

### 获取仪表板数据
**GET** `/dashboard/summary`

获取仪表板汇总数据。

#### 响应示例
```json
{
  "success": true,
  "data": {
    "safety_stats": {
      "total_checks": 156,
      "pass_rate": 91,
      "pending_checks": 14
    },
    "incident_stats": {
      "total": 23,
      "this_month": 3,
      "by_type": {
        "设备故障": 12,
        "信号异常": 8,
        "其他": 3
      }
    },
    "risk_stats": {
      "high": 5,
      "medium": 12,
      "low": 18
    },
    "training_stats": {
      "total_certificates": 89,
      "expiring_soon": 5
    }
  }
}
```

### 获取趋势数据
**GET** `/dashboard/trends`

获取各项指标趋势数据。

#### 查询参数
- `metric` (可选): 指标类型
- `period` (可选): 时间周期（day, week, month, year）

#### 响应示例
```json
{
  "success": true,
  "data": {
    "period": "month",
    "metrics": {
      "incidents": [
        {"date": "2024-01", "value": 3},
        {"date": "2024-02", "value": 2},
        {"date": "2024-03", "value": 5}
      ],
      "hidden_dangers": [
        {"date": "2024-01", "value": 8},
        {"date": "2024-02", "value": 6},
        {"date": "2024-03", "value": 10}
      ]
    }
  }
}
```

## 错误处理

### 标准错误格式
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "请求参数验证失败",
    "details": {
      "field": "username",
      "message": "用户名不能为空"
    }
  }
}
```

### 错误码说明
- `VALIDATION_ERROR`: 参数验证失败
- `AUTHENTICATION_ERROR`: 认证失败
- `AUTHORIZATION_ERROR`: 权限不足
- `NOT_FOUND`: 资源不存在
- `INTERNAL_ERROR`: 服务器内部错误

## 分页规范

所有列表接口都支持分页：

### 请求参数
- `page`: 页码（从1开始）
- `limit`: 每页条数（最大100）

### 响应格式
```json
{
  "success": true,
  "data": {
    "items": [...],
    "total": 100,
    "page": 1,
    "limit": 20,
    "pages": 5
  }
}
```

## 版本信息

- **API版本**: v1
- **更新时间**: 2024-01-15
- **文档版本**: 1.0.0

## 注意事项

1. 所有时间格式使用ISO 8601标准
2. 金额字段使用Decimal类型，保留2位小数
3. 状态字段使用预定义的枚举值
4. 敏感数据（如密码）不会返回给前端
5. 删除操作通常是软删除，标记状态而非物理删除