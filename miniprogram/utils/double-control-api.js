// 双控机制API封装
// 提供调用双控机制相关云函数的便捷方法

const cloud = wx.cloud

/**
 * MES风险评估
 * @param {Object} params - 评估参数
 * @param {number} params.m - 控制措施状态
 * @param {number} params.e1 - 人员暴露频次
 * @param {number} params.e2 - 危险状态频次
 * @param {number} params.s - 事故后果
 * @param {string} params.riskId - 风险ID（可选，更新数据库）
 * @returns {Promise<Object>} 评估结果
 */
export async function assessRiskLevel(params) {
  try {
    const result = await cloud.callFunction({
      name: 'risk-assessment',
      data: params
    })

    if (result.result.success) {
      return {
        success: true,
        data: result.result.data
      }
    } else {
      throw new Error(result.result.error)
    }
  } catch (error) {
    console.error('MES评估调用失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * 重大隐患督办流程
 * @param {Object} params - 操作参数
 * @param {string} params.dangerId - 隐患ID
 * @param {string} params.action - 操作类型
 *   - 'identify': 识别并启动督办
 *   - 'update_progress': 更新进展
 *   - 'submit_verification': 提交验证
 *   - 'verify': 验证效果
 *   - 'check_overdue': 检查超期
 * @param {string} params.progress - 进展描述（update_progress时需要）
 * @param {string} params.measures - 整改措施（update_progress时需要）
 * @param {string} params.verificationResult - 验证结果（verify时需要：合格/不合格）
 * @param {string} params.verificationPerson - 验证人（verify时需要）
 * @returns {Promise<Object>} 操作结果
 */
export async function handleDangerSupervision(params) {
  try {
    const result = await cloud.callFunction({
      name: 'danger-supervision',
      data: params
    })

    if (result.result.success) {
      return {
        success: true,
        data: result.result.data,
        message: result.result.message
      }
    } else {
      throw new Error(result.result.error)
    }
  } catch (error) {
    console.error('隐患督办调用失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * 启动重大隐患督办
 * @param {string} dangerId - 隐患ID
 */
export async function startSupervision(dangerId) {
  return handleDangerSupervision({
    dangerId,
    action: 'identify'
  })
}

/**
 * 更新治理进展
 * @param {string} dangerId - 隐患ID
 * @param {string} progress - 进展描述
 * @param {string} measures - 整改措施
 */
export async function updateProgress(dangerId, progress, measures) {
  return handleDangerSupervision({
    dangerId,
    action: 'update_progress',
    progress,
    measures
  })
}

/**
 * 提交验证申请
 * @param {string} dangerId - 隐患ID
 */
export async function submitVerification(dangerId) {
  return handleDangerSupervision({
    dangerId,
    action: 'submit_verification'
  })
}

/**
 * 验证治理效果
 * @param {string} dangerId - 隐患ID
 * @param {string} result - 验证结果（合格/不合格）
 * @param {string} person - 验证人
 */
export async function verifyDanger(dangerId, result, person) {
  return handleDangerSupervision({
    dangerId,
    action: 'verify',
    verificationResult: result,
    verificationPerson: person
  })
}

/**
 * 检查超期隐患
 */
export async function checkOverdueDangers() {
  return handleDangerSupervision({
    action: 'check_overdue'
  })
}

/**
 * 获取风险统计数据
 * @param {Object} filter - 筛选条件
 */
export async function getRiskStats(filter = {}) {
  try {
    const db = cloud.database()
    const _ = db.command

    let query = db.collection('risk_library')

    // 应用筛选条件
    if (filter.riskColor) {
      query = query.where({ risk_color: filter.riskColor })
    }
    if (filter.manageDept) {
      query = query.where({ manage_dept: filter.manageDept })
    }
    if (filter.status) {
      query = query.where({ status: filter.status })
    }

    const result = await query.count()

    return {
      success: true,
      data: {
        total: result.total
      }
    }
  } catch (error) {
    console.error('获取风险统计失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * 获取隐患统计数据
 * @param {Object} filter - 筛选条件
 */
export async function getDangerStats(filter = {}) {
  try {
    const db = cloud.database()
    const _ = db.command

    let query = db.collection('hidden_danger_library')

    // 应用筛选条件
    if (filter.status) {
      query = query.where({ status: filter.status })
    }
    if (filter.dangerLevel) {
      query = query.where({ danger_level: filter.dangerLevel })
    }
    if (filter.responsibleDept) {
      query = query.where({ responsible_dept: filter.responsibleDept })
    }

    const result = await query.count()

    // 计算闭环率
    const closed = await db.collection('hidden_danger_library')
      .where({ status: '已销号' })
      .count()

    return {
      success: true,
      data: {
        total: result.total,
        closed: closed.total,
        closureRate: ((closed.total / result.total) * 100).toFixed(2)
      }
    }
  } catch (error) {
    console.error('获取隐患统计失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * 获取督办隐患列表
 * @param {Object} filter - 筛选条件
 */
export async function getSupervisedDangers(filter = {}) {
  try {
    const db = cloud.database()
    const _ = db.command

    let query = db.collection('hidden_danger_library')
      .where({
        is_supervised: true
      })

    // 应用筛选条件
    if (filter.status) {
      query = query.where({ status: filter.status })
    }

    const result = await query
      .orderBy('planned_complete_date', 'asc')
      .get()

    return {
      success: true,
      data: result.data
    }
  } catch (error) {
    console.error('获取督办隐患失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * 生成风险公告牌数据
 * @param {string} location - 地点
 * @param {string} position - 岗位
 */
export async function generateRiskNotice(location, position) {
  try {
    const db = cloud.database()

    // 获取该地点和岗位的风险
    const result = await db.collection('risk_library')
      .where({
        location: location,
        status: 'active'
      })
      .get()

    const risks = result.data.map(risk => ({
      riskName: risk.risk_name,
      riskLevel: risk.risk_grade,
      controlMeasures: risk.control_measures,
      emergencyMeasures: risk.emergency_measures || '立即报告，停止作业'
    }))

    return {
      success: true,
      data: {
        location,
        position,
        risks,
        total: risks.length
      }
    }
  } catch (error) {
    console.error('生成风险公告失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

export default {
  assessRiskLevel,
  handleDangerSupervision,
  startSupervision,
  updateProgress,
  submitVerification,
  verifyDanger,
  checkOverdueDangers,
  getRiskStats,
  getDangerStats,
  getSupervisedDangers,
  generateRiskNotice
}
