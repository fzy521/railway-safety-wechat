// 系统常量定义

// 风险等级 - 符合GBT 33000-2025标准
const RISK_LEVELS = {
  MAJOR: 4,      // 重大风险（红色）
  LARGE: 3,      // 较大风险（橙色）
  GENERAL: 2,    // 一般风险（黄色）
  MINOR: 1       // 低风险（蓝色）
}

// 风险等级中文映射
const RISK_LEVEL_NAMES = {
  [RISK_LEVELS.MAJOR]: '重大风险',
  [RISK_LEVELS.LARGE]: '较大风险',
  [RISK_LEVELS.GENERAL]: '一般风险',
  [RISK_LEVELS.MINOR]: '低风险'
}

// 风险等级颜色 - 四色标准
const RISK_LEVEL_COLORS = {
  [RISK_LEVELS.MAJOR]: '#d32f2f',   // 红色
  [RISK_LEVELS.LARGE]: '#f57c00',   // 橙色
  [RISK_LEVELS.GENERAL]: '#fbc02d', // 黄色
  [RISK_LEVELS.MINOR]: '#388e3c'    // 蓝色
}

// 风险等级颜色代码
const RISK_LEVEL_CODES = {
  [RISK_LEVELS.MAJOR]: 'red',
  [RISK_LEVELS.LARGE]: 'orange',
  [RISK_LEVELS.GENERAL]: 'yellow',
  [RISK_LEVELS.MINOR]: 'blue'
}

// 安全状态
const SAFETY_STATUS = {
  SAFE: 'safe',
  WARNING: 'warning',
  DANGER: 'danger'
}

// 安全状态中文映射
const SAFETY_STATUS_NAMES = {
  [SAFETY_STATUS.SAFE]: '安全',
  [SAFETY_STATUS.WARNING]: '注意',
  [SAFETY_STATUS.DANGER]: '危险'
}

// 事故类型
const INCIDENT_TYPES = {
  TRAFFIC: 'traffic',
  EQUIPMENT: 'equipment',
  OPERATION: 'operation',
  ENVIRONMENT: 'environment'
}

// 事故类型中文映射
const INCIDENT_TYPE_NAMES = {
  [INCIDENT_TYPES.TRAFFIC]: '行车事故',
  [INCIDENT_TYPES.EQUIPMENT]: '设备故障',
  [INCIDENT_TYPES.OPERATION]: '操作事故',
  [INCIDENT_TYPES.ENVIRONMENT]: '环境因素'
}

// 巡检状态
const INSPECTION_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  OVERDUE: 'overdue'
}

// 巡检状态中文映射
const INSPECTION_STATUS_NAMES = {
  [INSPECTION_STATUS.PENDING]: '待巡检',
  [INSPECTION_STATUS.IN_PROGRESS]: '巡检中',
  [INSPECTION_STATUS.COMPLETED]: '已完成',
  [INSPECTION_STATUS.OVERDUE]: '已超期'
}

// 用户角色
const USER_ROLES = {
  VISITOR: 'visitor',
  OPERATOR: 'operator',
  INSPECTOR: 'inspector',
  MANAGER: 'manager',
  ADMIN: 'admin'
}

// 用户角色中文映射
const USER_ROLE_NAMES = {
  [USER_ROLES.VISITOR]: '访客',
  [USER_ROLES.OPERATOR]: '操作员',
  [USER_ROLES.INSPECTOR]: '巡检员',
  [USER_ROLES.MANAGER]: '管理员',
  [USER_ROLES.ADMIN]: '超级管理员'
}

// 权限定义
const PERMISSIONS = {
  READ: 'read',
  WRITE: 'write',
  DELETE: 'delete',
  MANAGE_USERS: 'manage_users',
  VIEW_REPORTS: 'view_reports',
  EXPORT_DATA: 'export_data'
}

// 默认配置
const DEFAULT_CONFIG = {
  refreshInterval: 30000, // 30秒
  offlineTimeout: 600000, // 10分钟
  alertTimeout: 5000, // 5秒
  maxUploadSize: 5 * 1024 * 1024, // 5MB
}

// 导出所有常量
module.exports = {
  RISK_LEVELS,
  RISK_LEVEL_NAMES,
  RISK_LEVEL_COLORS,
  RISK_LEVEL_CODES,
  SAFETY_STATUS,
  SAFETY_STATUS_NAMES,
  INCIDENT_TYPES,
  INCIDENT_TYPE_NAMES,
  INSPECTION_STATUS,
  INSPECTION_STATUS_NAMES,
  USER_ROLES,
  USER_ROLE_NAMES,
  PERMISSIONS,
  DEFAULT_CONFIG
}