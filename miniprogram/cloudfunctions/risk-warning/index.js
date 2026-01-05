const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { action, warningId, riskId, warningLevel, warningContent, requirements, deadline, rectifyMeasures, verificationResult, verificationPerson } = event;
  const { OPENID, APPID } = cloud.getWXContext()

  const db = cloud.database()
  const _ = db.command

  try {
    // 1. 创建风险预警
    if (action === 'create') {
      return await createWarning(riskId, warningLevel, warningContent, requirements, db);
    }

    // 2. 更新整改措施
    if (action === 'update_rectify') {
      return await updateRectifyMeasures(warningId, rectifyMeasures, db);
    }

    // 3. 提交验收申请
    if (action === 'submit_verify') {
      return await submitVerify(warningId, db);
    }

    // 4. 验证预警整改
    if (action === 'verify') {
      return await verifyWarning(warningId, verificationResult, verificationPerson, db);
    }

    // 5. 获取预警列表
    if (action === 'list') {
      return await getWarningList(event.status, db);
    }

    // 6. 获取预警详情
    if (action === 'detail') {
      return await getWarningDetail(warningId, db);
    }

    // 7. 自动触发预警（根据风险趋势）
    if (action === 'auto_trigger') {
      return await autoTriggerWarning(db);
    }

    return {
      success: false,
      error: '未知的操作类型'
    }

  } catch (error) {
    console.error('风险预警操作失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// 创建风险预警
async function createWarning(riskId, warningLevel, warningContent, requirements, db) {
  // 获取风险信息
  const risk = await db.collection('risk_library').doc(riskId).get();
  if (!risk.data) {
    throw new Error('风险不存在')
  }

  // 根据预警等级设置完成时限
  const deadlineMap = {
    '红': 7,    // 7天
    '橙': 15,   // 15天
    '黄': 30,   // 30天
    '蓝': 60    // 60天
  }

  const deadlineDate = new Date()
  deadlineDate.setDate(deadlineDate.getDate() + (deadlineMap[warningLevel] || 30))

  // 创建预警记录
  const warning = {
    warningLevel: warningLevel,
    warningTitle: `${risk.data.riskName}风险预警`,
    warningContent: warningContent,
    targetUnit: risk.data.manageDept,
    relatedRiskId: riskId,
    riskName: risk.data.riskName,
    riskLocation: risk.data.location,
    warningReason: '风险等级上升或管控措施失效',
    trendAnalysis: '近期同类风险频发，需加强管控',
    requirements: requirements,
    deadline: deadlineDate,
    rectifyMeasures: '',
    verificationResult: '',
    verificationPerson: '',
    status: '已下发',
    isExtended: false,
    extendedReason: '',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const result = await db.collection('risk_warnings').add({
    data: warning
  })

  // 发送预警通知
  await sendWarningNotice(warning)

  return {
    success: true,
    message: '风险预警已创建',
    data: {
      warningId: result._id,
      warning
    }
  }
}

// 更新整改措施
async function updateRectifyMeasures(warningId, rectifyMeasures, db) {
  await db.collection('risk_warnings').doc(warningId).update({
    data: {
      rectifyMeasures: rectifyMeasures,
      status: '整改中',
      rectifyStartDate: new Date(),
      updatedAt: new Date()
    }
  })

  return {
    success: true,
    message: '整改措施已更新'
  }
}

// 提交验收申请
async function submitVerify(warningId, db) {
  const warning = await db.collection('risk_warnings').doc(warningId).get()
  
  if (!warning.data.rectifyMeasures) {
    return {
      success: false,
      error: '请先填写整改措施'
    }
  }

  await db.collection('risk_warnings').doc(warningId).update({
    data: {
      status: '待验收',
      verifyApplyDate: new Date(),
      updatedAt: new Date()
    }
  })

  // 通知验收人员
  await sendVerifyNotice(warning.data)

  return {
    success: true,
    message: '验收申请已提交'
  }
}

// 验证预警整改
async function verifyWarning(warningId, verificationResult, verificationPerson, db) {
  if (!['通过', '不通过'].includes(verificationResult)) {
    return {
      success: false,
      error: '验证结果必须为"通过"或"不通过"'
    }
  }

  const updateData = {
    verificationResult: verificationResult,
    verificationPerson: verificationPerson,
    verificationDate: new Date(),
    updatedAt: new Date()
  }

  if (verificationResult === '通过') {
    updateData.status = '已验收'
  } else {
    updateData.status = '整改中'
    updateData.isExtended = true
    updateData.extendedReason = '验收不通过，继续整改'
    // 延长整改期限
    const warning = await db.collection('risk_warnings').doc(warningId).get()
    const newDeadline = new Date(warning.data.deadline)
    newDeadline.setDate(newDeadline.getDate() + 15)
    updateData.deadline = newDeadline
  }

  await db.collection('risk_warnings').doc(warningId).update({
    data: updateData
  })

  return {
    success: true,
    message: `验证结果：${verificationResult}`
  }
}

// 获取预警列表
async function getWarningList(status, db) {
  let query = db.collection('risk_warnings')

  if (status && status !== 'all') {
    query = query.where({
      status: status
    })
  }

  const result = await query.orderBy('createdAt', 'desc').get()

  const list = result.data.map(item => ({
    ...item,
    deadline: formatDate(new Date(item.deadline)),
    createdAt: formatDate(new Date(item.createdAt)),
    isOverdue: new Date(item.deadline) < new Date() && item.status !== '已验收'
  }))

  return {
    success: true,
    data: list
  }
}

// 获取预警详情
async function getWarningDetail(warningId, db) {
  const result = await db.collection('risk_warnings').doc(warningId).get()

  if (!result.data) {
    return {
      success: false,
      error: '预警不存在'
    }
  }

  const warning = result.data
  warning.deadline = formatDate(new Date(warning.deadline))
  warning.createdAt = formatDate(new Date(warning.createdAt))

  return {
    success: true,
    data: warning
  }
}

// 自动触发预警（根据风险趋势）
async function autoTriggerWarning(db) {
  // 查找风险等级较高的风险
  const risks = await db.collection('risk_library')
    .where({
      riskLevel: _.in([1, 2]), // 重大风险和较大风险
      status: 'active'
    })
    .get()

  let triggeredCount = 0

  for (const risk of risks.data) {
    // 检查该风险是否已有未完成的预警
    const existingWarning = await db.collection('risk_warnings')
      .where({
        relatedRiskId: risk._id,
        status: _.in(['已下发', '整改中', '待验收'])
      })
      .get()

    if (existingWarning.data.length > 0) {
      continue // 已有未完成的预警，跳过
    }

    // 根据风险等级触发预警
    const warningLevel = risk.riskLevel === 1 ? '红' : '橙'
    const warningContent = `${risk.riskName}风险等级为${risk.riskGrade}，建议加强管控措施`
    const requirements = `请${risk.manageDept}在${warningLevel === '红' ? '7' : '15'}天内完成整改`

    await createWarning(risk._id, warningLevel, warningContent, requirements, db)
    triggeredCount++
  }

  return {
    success: true,
    message: `自动触发${triggeredCount}条风险预警`,
    data: {
      triggeredCount
    }
  }
}

// 工具函数：格式化日期
function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 发送预警通知（模拟）
async function sendWarningNotice(warning) {
  console.log('发送风险预警通知:', warning)
  // TODO: 接入微信消息推送
}

// 发送验收通知（模拟）
async function sendVerifyNotice(warning) {
  console.log('发送验收通知:', warning)
  // TODO: 接入微信消息推送
}