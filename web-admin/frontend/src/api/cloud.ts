import cloudbase from '@cloudbase/js-sdk'
import type { ICallFunctionResponse } from '@/types'

const app = cloudbase.init({
  env: import.meta.env.VITE_CLOUD_ENV_ID
})

const auth = app.auth({
  persistence: 'local'
})

const db = app.database()

// 匿名登录
export async function login() {
  try {
    await auth.signInAnonymously()
    return true
  } catch (error) {
    console.error('登录失败:', error)
    throw error
  }
}

// 调用云函数
export async function callCloudFunction(name: string, data: any = {}): Promise<ICallFunctionResponse> {
  return app.callFunction({
    name,
    data
  })
}

// 获取风险列表
export async function getRisks(params?: any) {
  const { page = 1, pageSize = 20, ...filter } = params || {}

  let query = db.collection('risk_library') as any

  // 应用筛选条件
  if (filter.riskName) {
    query = query.where({
      riskName: db.RegExp({
        regexp: filter.riskName,
        options: 'i'
      })
    })
  }
  if (filter.riskLevel) {
    query = query.where({ riskLevel: filter.riskLevel })
  }
  if (filter.riskColor) {
    query = query.where({ riskColor: filter.riskColor })
  }
  if (filter.status) {
    query = query.where({ status: filter.status })
  }

  // 执行查询
  const result = await query
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .orderBy('createdAt', 'desc')
    .get()

  // 获取总数
  const countResult = await db.collection('risk_library').count()

  return {
    list: result.data,
    total: countResult.total
  }
}

// 获取风险详情
export async function getRiskDetail(id: string) {
  return db.collection('risk_library').doc(id).get()
}

// 创建风险
export async function createRisk(data: any) {
  return db.collection('risk_library').add({
    ...data,
    createdAt: new Date(),
    updatedAt: new Date()
  })
}

// 更新风险
export async function updateRisk(id: string, data: any) {
  return db.collection('risk_library').doc(id).update({
    ...data,
    updatedAt: new Date()
  })
}

// 新增或更新风险
export async function createOrUpdateRisk(riskData: any) {
  // 确保风险评估相关的数据类型正确
  riskData.mValue = parseInt(riskData.mValue)
  riskData.e1Value = parseInt(riskData.e1Value)
  riskData.e2Value = parseInt(riskData.e2Value)
  riskData.sValue = parseInt(riskData.sValue)
  riskData.riskValue = riskData.mValue * Math.max(riskData.e1Value, riskData.e2Value) * riskData.sValue
  
  // 根据风险值计算风险等级
  if (riskData.riskValue <= 40) {
    riskData.level = '低风险'
  } else if (riskData.riskValue <= 90) {
    riskData.level = '一般风险'
  } else if (riskData.riskValue <= 180) {
    riskData.level = '较大风险'
  } else {
    riskData.level = '重大风险'
  }
  
  const result = await callCloudFunction('manage-risk', {
    action: riskData._id ? 'update' : 'create',
    data: riskData
  })
  return result
}

// 获取风险列表（带高级筛选）
export async function getRisksAdvanced(filters: {
  page?: number,
  limit?: number,
  search?: string,
  level?: string,
  color?: string,
  status?: string,
  likelihood?: number,
  severity?: number
} = {}) {
  const result = await callCloudFunction('manage-risk', {
    action: 'getList',
    data: filters
  })
  return result.result
}

// 获取风险等级统计
export async function getRiskLevelStatistics() {
  const result = await callCloudFunction('manage-risk', {
    action: 'getLevelStatistics'
  })
  return result.result
}

// 获取风险趋势数据
export async function getRiskTrend() {
  const result = await callCloudFunction('manage-risk', {
    action: 'getTrend'
  })
  return result.result
}

// 删除风险
export async function deleteRisk(id: string) {
  return db.collection('risk_library').doc(id).remove()
}

// 获取隐患列表
export async function getDangers(params?: any) {
  const { page = 1, pageSize = 20, ...filter } = params || {}

  let query = db.collection('hidden_danger_library') as any

  // 应用筛选条件
  if (filter.dangerName) {
    query = query.where({
      dangerDescription: db.RegExp({
        regexp: filter.dangerName,
        options: 'i'
      })
    })
  }
  if (filter.dangerLevel) {
    query = query.where({ dangerLevel: filter.dangerLevel })
  }
  if (filter.complianceStatus) {
    query = query.where({ complianceStatus: filter.complianceStatus })
  }
  if (filter.supervisionStatus) {
    query = query.where({ supervisionStatus: filter.supervisionStatus })
  }
  if (filter.status) {
    query = query.where({ status: filter.status })
  }

  // 执行查询
  const result = await query
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .orderBy('createdAt', 'desc')
    .get()

  // 获取总数
  const countResult = await db.collection('hidden_danger_library').count()

  return {
    list: result.data,
    total: countResult.total
  }
}

// 获取隐患详情
export async function getDangerDetail(id: string) {
  return db.collection('hidden_danger_library').doc(id).get()
}

// 创建隐患
export async function createDanger(data: any) {
  return db.collection('hidden_danger_library').add({
    ...data,
    createdAt: new Date(),
    updatedAt: new Date()
  })
}

// 更新隐患
export async function updateDanger(id: string, data: any) {
  return db.collection('hidden_danger_library').doc(id).update({
    ...data,
    updatedAt: new Date()
  })
}

// 验证隐患(数据库操作)
export async function verifyDangerDB(id: string, data: any) {
  return db.collection('hidden_danger_library').doc(id).update({
    ...data,
    updatedAt: new Date()
  })
}

// 获取快速统计
export async function getQuickStats() {
  const [riskCount, dangerCount] = await Promise.all([
    db.collection('risk_library').count(),
    db.collection('hidden_danger_library').count()
  ])
  return {
    riskCount: riskCount.total,
    dangerCount: dangerCount.total
  }
}

// 更新用户信息
export async function updateUserInfo(data: any) {
  // 需要调用云函数
  return app.callFunction({
    name: 'updateUserInfo',
    data
  })
}

// MES风险评估
export async function riskAssessment(params: {
  m: number
  e1: number
  e2: number
  s: number
  riskId?: string
}) {
  return app.callFunction({
    name: 'risk-assessment',
    data: params
  })
}

// 风险预警
export async function riskWarning(params: any) {
  return app.callFunction({
    name: 'risk-warning',
    data: params
  })
}

// 获取预警列表
export async function getWarnings(params?: any) {
  return app.callFunction({
    name: 'risk-warning',
    data: { action: 'list', ...params }
  })
}

// 获取预警详情
export async function getWarningDetail(warningId: string) {
  return app.callFunction({
    name: 'risk-warning',
    data: { action: 'detail', warningId }
  })
}

// 创建预警
export async function createWarning(params: any) {
  return app.callFunction({
    name: 'risk-warning',
    data: { action: 'create', ...params }
  })
}

// 更新整改措施
export async function updateRectifyMeasures(warningId: string, rectifyMeasures: string) {
  return app.callFunction({
    name: 'risk-warning',
    data: { action: 'update_rectify', warningId, rectifyMeasures }
  })
}

// 提交验收
export async function submitVerify(warningId: string) {
  return app.callFunction({
    name: 'risk-warning',
    data: { action: 'submit_verify', warningId }
  })
}

// 验证预警
export async function verifyWarning(warningId: string, verificationResult: string, verificationPerson: string) {
  return app.callFunction({
    name: 'risk-warning',
    data: { action: 'verify', warningId, verificationResult, verificationPerson }
  })
}

// 隐患督办
export async function dangerSupervision(params: any) {
  return app.callFunction({
    name: 'danger-supervision',
    data: params
  })
}

// 启动督办
export async function startSupervision(dangerId: string) {
  return app.callFunction({
    name: 'danger-supervision',
    data: { action: 'identify', dangerId }
  })
}

// 更新进展
export async function updateProgress(dangerId: string, progress: string, measures: string) {
  return app.callFunction({
    name: 'danger-supervision',
    data: { action: 'update_progress', dangerId, progress, measures }
  })
}

// 提交验证申请
export async function submitVerification(dangerId: string) {
  return app.callFunction({
    name: 'danger-supervision',
    data: { action: 'submit_verification', dangerId }
  })
}

// 验证隐患
export async function verifyDanger(dangerId: string, verificationResult: string, verificationPerson: string) {
  return app.callFunction({
    name: 'danger-supervision',
    data: { action: 'verify', dangerId, verificationResult, verificationPerson }
  })
}

// 检查超期
export async function checkOverdue() {
  return app.callFunction({
    name: 'danger-supervision',
    data: { action: 'check_overdue' }
  })
}

// 获取巡检记录
export async function getInspections(params?: any) {
  return app.callFunction({
    name: 'getInspections',
    data: params
  })
}

// 获取巡检详情
export async function getInspectionDetail(id: string) {
  return app.callFunction({
    name: 'getInspectionDetail',
    data: { id }
  })
}

// 创建巡检记录
export async function createInspection(data: any) {
  return db.collection('inspection_records').add({
    ...data,
    createdAt: new Date(),
    updatedAt: new Date()
  })
}

// 更新巡检记录
export async function updateInspection(id: string, data: any) {
  return db.collection('inspection_records').doc(id).update({
    ...data,
    updatedAt: new Date()
  })
}

// 删除巡检记录
export async function deleteInspection(id: string) {
  return db.collection('inspection_records').doc(id).remove()
}

// 获取巡检统计
export async function getInspectionStats() {
  const [total, completed, overdue] = await Promise.all([
    db.collection('inspection_records').count(),
    db.collection('inspection_records').where({ status: '已完成' }).count(),
    db.collection('inspection_records').where({
      plannedDate: db.command.lt(new Date().getTime()),
      status: db.command.neq('已完成')
    }).count()
  ])
  
  return {
    total: total.total,
    completed: completed.total,
    overdue: overdue.total,
    completionRate: total.total > 0 ? Math.round((completed.total / total.total) * 100) : 0
  }
}

// 生成检查表
export async function generateChecklist(params: any) {
  return app.callFunction({
    name: 'checklist-gen',
    data: params
  })
}

// 获取安全指标
export async function getSafetyMetrics(params?: any) {
  return app.callFunction({
    name: 'getSafetyMetrics',
    data: params
  })
}

// 获取月度报表
export async function getMonthlyReport(params: { year: number; month: number }) {
  return app.callFunction({
    name: 'monthly-report',
    data: params
  })
}

// 事故管理
export async function getIncidentList(params?: any) {
  return app.callFunction({
    name: 'incident-management',
    data: { action: 'list', ...params }
  })
}

export async function getIncidentDetail(id: string) {
  return app.callFunction({
    name: 'incident-management',
    data: { action: 'detail', incidentId: id }
  })
}

export async function createIncident(data: any) {
  return app.callFunction({
    name: 'incident-management',
    data: { action: 'create', ...data }
  })
}

export async function updateIncident(id: string, data: any) {
  return app.callFunction({
    name: 'incident-management',
    data: { action: 'update', incidentId: id, ...data }
  })
}

export async function deleteIncident(id: string) {
  return app.callFunction({
    name: 'incident-management',
    data: { action: 'delete', incidentId: id }
  })
}

export async function getIncidentStatistics() {
  return app.callFunction({
    name: 'incident-management',
    data: { action: 'statistics' }
  })
}

// 消息通知
export async function getNotifications(params?: any) {
  return app.callFunction({
    name: 'notification-management',
    data: { action: 'list', ...params }
  })
}

export async function getNotificationDetail(id: string) {
  return app.callFunction({
    name: 'notification-management',
    data: { action: 'detail', notificationId: id }
  })
}

export async function createNotification(data: any) {
  return app.callFunction({
    name: 'notification-management',
    data: { action: 'create', ...data }
  })
}

export async function markNotificationAsRead(id: string) {
  return app.callFunction({
    name: 'notification-management',
    data: { action: 'markRead', notificationId: id }
  })
}

export async function markAllNotificationsAsRead() {
  return app.callFunction({
    name: 'notification-management',
    data: { action: 'markAllRead' }
  })
}

export async function deleteNotification(id: string) {
  return app.callFunction({
    name: 'notification-management',
    data: { action: 'delete', notificationId: id }
  })
}

export async function getUnreadNotificationCount() {
  return app.callFunction({
    name: 'notification-management',
    data: { action: 'unreadCount' }
  })
}