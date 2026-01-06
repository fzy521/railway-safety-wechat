const CLOUD_ENV_ID = import.meta.env.VITE_CLOUD_ENV_ID
const APP_ID = import.meta.env.VITE_APP_ID
const APP_SECRET = import.meta.env.VITE_APP_SECRET

// Access Token缓存
let accessToken: string | null = null
let tokenExpireTime: number = 0

// 获取Access Token
export async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpireTime) {
    return accessToken
  }

  const response = await fetch(
    `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APP_ID}&secret=${APP_SECRET}`
  )
  const data = await response.json()

  if (data.errcode) {
    throw new Error(`获取Access Token失败: ${data.errmsg}`)
  }

  accessToken = data.access_token
  tokenExpireTime = Date.now() + (data.expires_in - 300) * 1000

  return accessToken
}

// 调用云函数
export async function callCloudFunction<T = any>(
  name: string,
  data: any = {}
): Promise<T> {
  try {
    const token = await getAccessToken()

    const response = await fetch(
      `https://api.weixin.qq.com/tcb/invokecloudfunction?access_token=${token}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          env: CLOUD_ENV_ID,
          name: name,
          data: data
        })
      }
    )

    const result = await response.json()

    if (result.errcode === 0) {
      const respData = JSON.parse(result.resp_data)
      if (respData.success) {
        return respData.data || respData
      } else {
        throw new Error(respData.error || respData.message || '云函数调用失败')
      }
    } else {
      throw new Error(result.errmsg)
    }
  } catch (error) {
    console.error('云函数调用失败:', error)
    throw error
  }
}

// 用户登录
export async function login(code: string) {
  return callCloudFunction('login', { code })
}

// 更新用户信息
export async function updateUserInfo(data: any) {
  return callCloudFunction('updateUserInfo', data)
}

// MES风险评估
export async function riskAssessment(params: {
  m: number
  e1: number
  e2: number
  s: number
  riskId?: string
}) {
  return callCloudFunction('risk-assessment', params)
}

// 获取风险列表
export async function getRisks(params?: any) {
  return callCloudFunction('getRisks', params)
}

// 获取风险详情
export async function getRiskDetail(id: string) {
  return callCloudFunction('getRiskDetail', { id })
}

// 创建风险
export async function createRisk(data: any) {
  return callCloudFunction('createRisk', data)
}

// 更新风险
export async function updateRisk(id: string, data: any) {
  return callCloudFunction('updateRisk', { id, data })
}

// 删除风险
export async function deleteRisk(id: string) {
  return callCloudFunction('deleteRisk', { id })
}

// 获取隐患列表
export async function getDangers(params?: any) {
  return callCloudFunction('getDangers', params)
}

// 获取隐患详情
export async function getDangerDetail(id: string) {
  return callCloudFunction('getDangerDetail', { id })
}

// 创建隐患
export async function createDanger(data: any) {
  return callCloudFunction('createDanger', data)
}

// 更新隐患
export async function updateDanger(id: string, data: any) {
  return callCloudFunction('updateDanger', { id, data })
}

// 验证隐患
export async function verifyDanger(id: string, data: any) {
  return callCloudFunction('verifyDanger', { id, data })
}

// 风险预警
export async function riskWarning(params: any) {
  return callCloudFunction('risk-warning', params)
}

// 隐患督办
export async function dangerSupervision(params: any) {
  return callCloudFunction('danger-supervision', params)
}

// 获取巡检记录
export async function getInspections(params?: any) {
  return callCloudFunction('getInspections', params)
}

// 获取巡检详情
export async function getInspectionDetail(id: string) {
  return callCloudFunction('getInspectionDetail', { id })
}

// 生成检查表
export async function generateChecklist(params: any) {
  return callCloudFunction('checklist-gen', params)
}

// 获取快速统计
export async function getQuickStats() {
  return callCloudFunction('getQuickStats', {})
}

// 获取安全指标
export async function getSafetyMetrics(params?: any) {
  return callCloudFunction('getSafetyMetrics', params)
}

// 获取月度报表
export async function getMonthlyReport(params: { year: number; month: number }) {
  return callCloudFunction('monthly-report', params)
}