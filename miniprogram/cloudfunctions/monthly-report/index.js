const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { action, year, month, reportType } = event;
  const { OPENID, APPID } = cloud.getWXContext()

  const db = cloud.database()
  const _ = db.command

  try {
    // 1. 生成月度隐患排查治理报表
    if (action === 'generate_monthly_danger_report') {
      return await generateMonthlyDangerReport(year, month, db);
    }

    // 2. 生成风险管控效果评价报告
    if (action === 'generate_risk_assessment_report') {
      return await generateRiskAssessmentReport(year, month, db);
    }

    // 3. 生成综合安全报表
    if (action === 'generate_comprehensive_report') {
      return await generateComprehensiveReport(year, month, db);
    }

    // 4. 获取报表列表
    if (action === 'list') {
      return await getReportList(reportType, db);
    }

    // 5. 获取报表详情
    if (action === 'detail') {
      return await getReportDetail(event.reportId, db);
    }

    return {
      success: false,
      error: '未知的操作类型'
    }

  } catch (error) {
    console.error('报表生成失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// 生成月度隐患排查治理报表
async function generateMonthlyDangerReport(year, month, db) {
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 1)

  // 获取当月隐患数据
  const dangers = await db.collection('hidden_danger_library')
    .where({
      discovery_date: _.gte(startDate).lt(endDate)
    })
    .get()

  const data = dangers.data

  // 统计数据
  const total = data.length
  const majorCount = data.filter(d => d.dangerLevel === '重大隐患').length
  const generalCount = data.filter(d => d.dangerLevel === '一般隐患').length
  const closedCount = data.filter(d => d.status === '已销号').length
  const overdueCount = data.filter(d => {
    const plannedDate = new Date(d.plannedCompleteDate)
    return plannedDate < new Date() && d.status !== '已销号'
  }).length

  // 按类别统计
  const byCategory = {}
  data.forEach(d => {
    const category = d.dangerCategory || '其他'
    byCategory[category] = (byCategory[category] || 0) + 1
  })

  // 按责任单位统计
  const byDept = {}
  data.forEach(d => {
    const dept = d.responsibleDept || '其他'
    byDept[dept] = (byDept[dept] || 0) + 1
  })

  const closureRate = total > 0 ? ((closedCount / total) * 100).toFixed(2) : 0

  const report = {
    reportType: '月度隐患排查治理报表',
    year,
    month,
    reportDate: new Date(),
    statistics: {
      total,
      majorCount,
      generalCount,
      closedCount,
      overdueCount,
      closureRate
    },
    byCategory,
    byDept,
    details: data.map(d => ({
      dangerLocation: d.dangerLocation,
      dangerPart: d.dangerPart,
      dangerLevel: d.dangerLevel,
      dangerCategory: d.dangerCategory,
      dangerDescription: d.dangerDescription,
      responsibleDept: d.responsibleDept,
      responsiblePerson: d.responsiblePerson,
      discoveryDate: formatDate(new Date(d.discoveryDate)),
      plannedCompleteDate: formatDate(new Date(d.plannedCompleteDate)),
      status: d.status,
      verificationResult: d.verificationResult || '待验证'
    }))
  }

  // 保存报表
  const result = await db.collection('monthly_reports').add({
    data: {
      ...report,
      createdAt: new Date(),
      createdBy: OPENID
    }
  })

  return {
    success: true,
    message: '月度隐患排查治理报表生成成功',
    data: {
      reportId: result._id,
      report
    }
  }
}

// 生成风险管控效果评价报告
async function generateRiskAssessmentReport(year, month, db) {
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 1)

  // 获取当月风险数据
  const risks = await db.collection('risk_library')
    .where({
      status: 'active'
    })
    .get()

  const data = risks.data

  // 统计各级风险数量
  const byLevel = {
    1: data.filter(r => r.riskLevel === 1).length, // 重大风险
    2: data.filter(r => r.riskLevel === 2).length, // 较大风险
    3: data.filter(r => r.riskLevel === 3).length, // 一般风险
    4: data.filter(r => r.riskLevel === 4).length  // 低风险
  }

  // 获取当月检查记录
  const checks = await db.collection('check_records')
    .where({
      checkDate: _.gte(startDate).lt(endDate)
    })
    .get()

  const checkData = checks.data
  const totalChecks = checkData.length
  const problemsFound = checkData.reduce((sum, c) => sum + (c.problemsFound || 0), 0)
  const problemsRectified = checkData.reduce((sum, c) => sum + (c.problemsRectified || 0), 0)

  // 获取当月预警数据
  const warnings = await db.collection('risk_warnings')
    .where({
      createdAt: _.gte(startDate).lt(endDate)
    })
    .get()

  const warningData = warnings.data
  const warningCount = warningData.length
  const warningResolved = warningData.filter(w => w.status === '已验收').length

  const report = {
    reportType: '风险管控效果评价报告',
    year,
    month,
    reportDate: new Date(),
    riskStatistics: {
      total: data.length,
      byLevel
    },
    checkStatistics: {
      totalChecks,
      problemsFound,
      problemsRectified,
      rectificationRate: problemsFound > 0 ? ((problemsRectified / problemsFound) * 100).toFixed(2) : 100
    },
    warningStatistics: {
      warningCount,
      warningResolved,
      resolutionRate: warningCount > 0 ? ((warningResolved / warningCount) * 100).toFixed(2) : 100
    },
    evaluation: generateEvaluation(byLevel, problemsFound, warningCount)
  }

  // 保存报表
  const result = await db.collection('monthly_reports').add({
    data: {
      ...report,
      createdAt: new Date(),
      createdBy: OPENID
    }
  })

  return {
    success: true,
    message: '风险管控效果评价报告生成成功',
    data: {
      reportId: result._id,
      report
    }
  }
}

// 生成综合安全报表
async function generateComprehensiveReport(year, month, db) {
  // 合并隐患和风险报表
  const dangerReport = await generateMonthlyDangerReport(year, month, db)
  const riskReport = await generateRiskAssessmentReport(year, month, db)

  const report = {
    reportType: '综合安全报表',
    year,
    month,
    reportDate: new Date(),
    dangerReport: dangerReport.data.report,
    riskReport: riskReport.data.report
  }

  return {
    success: true,
    message: '综合安全报表生成成功',
    data: {
      report
    }
  }
}

// 获取报表列表
async function getReportList(reportType, db) {
  let query = db.collection('monthly_reports')

  if (reportType && reportType !== 'all') {
    query = query.where({
      reportType: reportType
    })
  }

  const result = await query.orderBy('createdAt', 'desc').limit(20).get()

  const list = result.data.map(item => ({
    ...item,
    createdAt: formatDate(new Date(item.createdAt))
  }))

  return {
    success: true,
    data: list
  }
}

// 获取报表详情
async function getReportDetail(reportId, db) {
  const result = await db.collection('monthly_reports').doc(reportId).get()

  if (!result.data) {
    return {
      success: false,
      error: '报表不存在'
    }
  }

  return {
    success: true,
    data: result.data
  }
}

// 生成评价
function generateEvaluation(byLevel, problemsFound, warningCount) {
  const majorRisks = byLevel[1]
  const largeRisks = byLevel[2]

  let evaluation = '良好'
  let suggestions = []

  if (majorRisks > 0) {
    evaluation = '需改进'
    suggestions.push('存在重大风险，需立即制定专项管控措施')
  }

  if (largeRisks > 3) {
    evaluation = '需改进'
    suggestions.push('较大风险数量较多，建议加强风险辨识和管控')
  }

  if (problemsFound > 10) {
    evaluation = '需改进'
    suggestions.push('检查发现问题较多，需加强日常巡检频次')
  }

  if (warningCount > 5) {
    evaluation = '需改进'
    suggestions.push('风险预警数量较多，需完善预警响应机制')
  }

  if (suggestions.length === 0) {
    suggestions.push('风险管控效果良好，继续保持')
  }

  return {
    level: evaluation,
    suggestions
  }
}

// 工具函数：格式化日期
function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}