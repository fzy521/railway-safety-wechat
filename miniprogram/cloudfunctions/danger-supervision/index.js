const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { dangerId, action, verificationResult, verificationPerson } = event;
  const { OPENID } = cloud.getWXContext()

  const db = cloud.database()

  try {
    // 1. 识别重大隐患并启动督办
    if (action === 'identify') {
      return await startSupervision(dangerId, db);
    }

    // 2. 更新治理进展
    if (action === 'update_progress') {
      const { progress, measures } = event;
      return await updateProgress(dangerId, progress, measures, db);
    }

    // 3. 提交验证申请
    if (action === 'submit_verification') {
      return await submitVerification(dangerId, db);
    }

    // 4. 验证治理效果
    if (action === 'verify') {
      return await verifyDanger(dangerId, verificationResult, verificationPerson, db);
    }

    // 5. 超期检查
    if (action === 'check_overdue') {
      return await checkOverdueDangers(db);
    }

    return {
      success: false,
      error: '未知的操作类型'
    }

  } catch (error) {
    console.error('隐患督办流程失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// 启动重大隐患挂牌督办
async function startSupervision(dangerId, db) {
  const danger = await db.collection('hidden_danger_library').doc(dangerId).get();

  if (!danger.data) {
    throw new Error('隐患不存在')
  }

  // 检查是否为重大隐患
  if (danger.data.dangerLevel !== '重大隐患' && !danger.data.isMajorDanger) {
    return {
      success: false,
      error: '该隐患不属于重大隐患，无需挂牌督办'
    }
  }

  // 更新隐患状态为挂牌督办
  const result = await db.collection('hidden_danger_library').doc(dangerId).update({
    data: {
      isSupervised: true,
      supervisionLevel: '公司级',
      supervisionStatus: '立案督办',
      status: '整改中',
      plannedCompleteDate: getPlannedCompleteDate(3), // 3个月内完成
      supervisionStartDate: new Date(),
      updatedAt: new Date()
    }
  })

  // 创建督办记录
  const supervisionRecord = {
    dangerId: dangerId,
    dangerName: danger.data.dangerDescription,
    supervisionLevel: '公司级',
    status: '立案督办',
    startDate: new Date(),
    plannedCompleteDate: getPlannedCompleteDate(3),
    responsibleDept: danger.data.responsibleDept,
    responsiblePerson: danger.data.responsiblePerson,
    supervisionPerson: '安全总监', // 根据实际配置
    createTime: new Date()
  }

  await db.collection('supervision_records').add({
    data: supervisionRecord
  })

  // 发送督办通知
  await sendSupervisionNotice(supervisionRecord)

  return {
    success: true,
    message: '重大隐患挂牌督办已启动',
    data: {
      dangerId,
      supervisionLevel: '公司级',
      plannedCompleteDate: supervisionRecord.plannedCompleteDate
    }
  }
}

// 更新治理进展
async function updateProgress(dangerId, progress, measures, db) {
  const result = await db.collection('hidden_danger_library').doc(dangerId).update({
    data: {
      actualProgress: progress,
      treatmentMeasures: measures,
      progressUpdateDate: new Date(),
      updatedAt: new Date()
    }
  })

  // 记录进展历史
  await db.collection('progress_history').add({
    data: {
      dangerId: dangerId,
      progress: progress,
      measures: measures,
      updateDate: new Date()
    }
  })

  return {
    success: true,
    message: '治理进展已更新'
  }
}

// 提交验证申请
async function submitVerification(dangerId, db) {
  const danger = await db.collection('hidden_danger_library').doc(dangerId).get()

  if (danger.data.actualProgress !== '100%') {
    return {
      success: false,
      error: '整改未完成，不能提交验证'
    }
  }

  await db.collection('hidden_danger_library').doc(dangerId).update({
    data: {
      status: '待验证',
      verificationApplyDate: new Date(),
      updatedAt: new Date()
    }
  })

  // 通知验证人员
  await sendVerificationNotice(danger.data)

  return {
    success: true,
    message: '验证申请已提交，等待现场验收'
  }
}

// 验证治理效果
async function verifyDanger(dangerId, verificationResult, verificationPerson, db) {
  if (!['合格', '不合格'].includes(verificationResult)) {
    return {
      success: false,
      error: '验证结果必须为"合格"或"不合格"'
    }
  }

  const updateData = {
    verificationResult: verificationResult,
    verificationPerson: verificationPerson,
    verificationDate: new Date(),
    updatedAt: new Date()
  }

  if (verificationResult === '合格') {
    updateData.status = '已销号'
    updateData.supervisionStatus = '验收通过'
    updateData.actualCompleteDate = new Date()
  } else {
    updateData.status = '整改中'
    updateData.supervisionStatus = '验收不通过继续整改'
    // 可以延长整改期限
    updateData.plannedCompleteDate = getPlannedCompleteDate(1) // 延长1个月
  }

  await db.collection('hidden_danger_library').doc(dangerId).update({
    data: updateData
  })

  return {
    success: true,
    message: `验证结果：${verificationResult}`
  }
}

// 检查超期隐患
async function checkOverdueDangers(db) {
  const now = new Date()

  const dangers = await db.collection('hidden_danger_library')
    .where({
      isSupervised: true,
      status: _.neq('已销号'),
      plannedCompleteDate: _.lt(now)
    })
    .get()

  const overdueDangers = dangers.data.map(danger => ({
    dangerId: danger._id,
    dangerDescription: danger.dangerDescription,
    responsibleDept: danger.responsibleDept,
    plannedCompleteDate: danger.plannedCompleteDate,
    overdueDays: Math.floor((now - danger.plannedCompleteDate) / (1000 * 60 * 60 * 24))
  }))

  // 发送超期提醒
  for (const danger of overdueDangers) {
    await sendOverdueAlert(danger)
  }

  return {
    success: true,
    data: overdueDangers,
    message: `发现${overdueDangers.length}条超期隐患`
  }
}

// 工具函数：获取计划完成日期
function getPlannedCompleteDate(months) {
  const date = new Date()
  date.setMonth(date.getMonth() + months)
  return date
}

// 发送督办通知（模拟）
async function sendSupervisionNotice(record) {
  console.log('发送督办通知:', record)
  // TODO: 接入微信消息推送
}

// 发送验证通知（模拟）
async function sendVerificationNotice(danger) {
  console.log('发送验证通知:', danger)
  // TODO: 接入微信消息推送
}

// 发送超期提醒（模拟）
async function sendOverdueAlert(danger) {
  console.log('发送超期提醒:', danger)
  // TODO: 接入微信消息推送
}

// 重大隐患判定标准
const MAJOR_DANGER_CRITERIA = [
  '危害程度极大',
  '可能导致生产安全重特大事故发生',
  '整改难度较大',
  '外部因素影响难以排除'
]
