const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 路由映射
const ROUTES = {
  // 风险管理
  'getRisks': () => db.collection('risk_library').get(),
  'getRiskDetail': (id) => db.collection('risk_library').doc(id).get(),
  'createRisk': (data) => db.collection('risk_library').add({ data }),
  'updateRisk': ({ id, data }) => db.collection('risk_library').doc(id).update({ data }),
  'deleteRisk': (id) => db.collection('risk_library').doc(id).remove(),

  // 隐患管理
  'getDangers': () => db.collection('hidden_danger_library').get(),
  'getDangerDetail': (id) => db.collection('hidden_danger_library').doc(id).get(),
  'createDanger': (data) => db.collection('hidden_danger_library').add({ data }),
  'updateDanger': ({ id, data }) => db.collection('hidden_danger_library').doc(id).update({ data }),
  'verifyDanger': ({ id, data }) => db.collection('hidden_danger_library').doc(id).update({ data }),

  // 统计数据
  'getQuickStats': async () => {
    const [riskCount, dangerCount] = await Promise.all([
      db.collection('risk_library').count(),
      db.collection('hidden_danger_library').count()
    ])
    return {
      riskCount: riskCount.total,
      dangerCount: dangerCount.total
    }
  },

  // 调用其他云函数
  'riskAssessment': (params) => cloud.callFunction({ name: 'risk-assessment', data: params }),
  'dangerSupervision': (params) => cloud.callFunction({ name: 'danger-supervision', data: params }),
  'getSafetyMetrics': (params) => cloud.callFunction({ name: 'getSafetyMetrics', data: params }),
  'getMonthlyReport': (params) => cloud.callFunction({ name: 'monthly-report', data: params })
}

exports.main = async (event, context) => {
  const { action, params = {} } = event
  const wxContext = cloud.getWXContext()

  try {
    // 检查路由是否存在
    if (!ROUTES[action]) {
      return {
        success: false,
        error: `未知的操作: ${action}`
      }
    }

    // 执行路由
    const result = await ROUTES[action](params)

    return {
      success: true,
      data: result.data || result
    }
  } catch (error) {
    console.error('Web API代理错误:', error)
    return {
      success: false,
      error: error.message
    }
  }
}