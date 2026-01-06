// 风险相关类型
export interface Risk {
  _id: string
  riskName: string
  riskType: string
  operationLink: string
  location: string
  mValue: number
  e1Value: number
  e2Value: number
  sValue: number
  rValue: number
  riskLevel: number
  riskGrade: string
  riskColor: string
  controlMeasures: string
  controlPerson: string
  manageMeasures: string
  manageDept: string
  managePerson: string
  checkFrequency: string
  identificationDate: string
  identificationMethod: string
  nextReviewDate: string
  nextCheckDate: string
  status: string
  createdAt: string
  updatedAt: string
}

// 隐患相关类型
export interface Danger {
  _id: string
  dangerLocation: string
  dangerPart: string
  dangerLevel: string
  dangerCategory: string
  dangerDescription: string
  dangerStatus: string
  causeAnalysis: string
  hazardAnalysis: string
  treatmentPlan: string
  treatmentMeasures: string
  responsibleDept: string
  responsiblePerson: string
  supervisionPerson: string
  plannedCompleteDate: string
  actualCompleteDate: string
  completionCriteria: string
  verificationMethod: string
  verificationResult: string
  verificationPerson: string
  verificationDate: string
  isMajorDanger: boolean
  isSupervised: boolean
  supervisionLevel: string
  supervisionStatus: string
  discoveryDate: string
  discoverer: string
  findMethod: string
  inDangerLibrary: boolean
  status: string
  createdAt: string
  updatedAt: string
}

// 风险预警类型
export interface RiskWarning {
  _id: string
  riskId: string
  warningLevel: string
  warningType: string
  warningContent: string
  targetUnit: string
  deadline: string
  status: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

// 巡检记录类型
export interface Inspection {
  _id: string
  checkType: string
  checkDate: string
  checkDept: string
  checkPerson: string
  checkRoute: string
  checkPoints: string[]
  checkResult: string
  findings: any[]
  attachments: string[]
  duration: number
  distance: number
  status: string
  createdAt: string
  updatedAt: string
}

// 统计数据类型
export interface Stats {
  riskCount: number
  dangerCount: number
  inspectionCount: number
  warningCount: number
}