import { callCloudFunction } from './cloud'

export interface EmergencyPlan {
  _id?: string
  id: string
  name: string
  type: string
  typeName: string
  version: string
  status: string
  statusText: string
  lastReviewDate: string
  nextReviewDate: string
  approvalDept: string
  drillFrequency: string
  drillFrequencyCode: string
  effectiveness: string
  pdfFiles: PdfFile[]
  createTime?: number
  updateTime?: number
}

export interface PdfFile {
  id: string
  fileName: string
  fileSize: string
  uploadTime: string
  fileUrl: string
  cloudPath: string
}

export interface EmergencyPlanListParams {
  page?: number
  pageSize?: number
  name?: string
  type?: string
  status?: string
}

export interface EmergencyPlanListResult {
  list: EmergencyPlan[]
  total: number
}

/**
 * 获取应急预案列表
 */
export const getEmergencyPlans = async (params: EmergencyPlanListParams): Promise<EmergencyPlanListResult> => {
  const result = await callCloudFunction('emergency-plan-management', { action: 'list', ...params })
  return result.data
}

/**
 * 获取应急预案详情
 */
export const getEmergencyPlanDetail = async (id: string): Promise<EmergencyPlan> => {
  const result = await callCloudFunction('emergency-plan-management', { action: 'detail', planId: id })
  return result.data
}

/**
 * 创建应急预案
 */
export const createEmergencyPlan = async (data: EmergencyPlan): Promise<EmergencyPlan> => {
  const result = await callCloudFunction('emergency-plan-management', { action: 'create', ...data })
  return result.data
}

/**
 * 更新应急预案
 */
export const updateEmergencyPlan = async (id: string, data: Partial<EmergencyPlan>): Promise<EmergencyPlan> => {
  const result = await callCloudFunction('emergency-plan-management', { action: 'update', planId: id, ...data })
  return result.data
}

/**
 * 删除应急预案
 */
export const deleteEmergencyPlan = async (id: string): Promise<void> => {
  await callCloudFunction('emergency-plan-management', { action: 'delete', planId: id })
}

/**
 * 上传PDF文件
 */
export const uploadPdfFile = async (file: File): Promise<PdfFile> => {
  const result = await callCloudFunction('emergency-plan-management', { action: 'upload', file })
  return result.data
}

/**
 * 删除PDF文件
 */
export const deletePdfFile = async (cloudPath: string): Promise<void> => {
  await callCloudFunction('emergency-plan-management', { action: 'deleteFile', cloudPath })
}