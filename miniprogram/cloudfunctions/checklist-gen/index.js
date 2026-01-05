const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { action, checkType, dept, location, checkRecordId, checkItems } = event;
  const { OPENID, APPID } = cloud.getWXContext()

  const db = cloud.database()
  const _ = db.command

  try {
    // 1. 生成检查表
    if (action === 'generate') {
      return await generateChecklist(checkType, dept, location, db);
    }

    // 2. 保存检查记录
    if (action === 'save') {
      return await saveCheckRecord(checkRecordId, checkItems, db);
    }

    // 3. 获取检查记录列表
    if (action === 'list') {
      return await getCheckRecordList(event.status, db);
    }

    // 4. 获取检查记录详情
    if (action === 'detail') {
      return await getCheckRecordDetail(checkRecordId, db);
    }

    return {
      success: false,
      error: '未知的操作类型'
    }

  } catch (error) {
    console.error('检查表操作失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// 生成检查表
async function generateChecklist(checkType, dept, location, db) {
  let query = db.collection('risk_library').where({
    status: 'active'
  })

  if (dept) {
    query = query.where({
      manage_dept: dept
    })
  }

  if (location) {
    query = query.where({
      location: db.RegExp({
        regexp: location,
        options: 'i'
      })
    })
  }

  const result = await query.get()

  if (result.data.length === 0) {
    return {
      success: false,
      error: '未找到相关风险项'
    }
  }

  const checkItems = result.data.map(risk => ({
    riskId: risk._id,
    checkItem: risk.riskName,
    checkStandard: risk.controlMeasures || risk.manageMeasures,
    checkMethod: '现场检查/资料核查',
    riskLevel: risk.riskLevel,
    riskGrade: risk.riskGrade,
    riskColor: risk.riskColor,
    frequency: risk.checkFrequency,
    result: '',
    abnormalDesc: '',
    handler: '',
    handleStatus: ''
  }))

  return {
    success: true,
    data: {
      checkType: checkType || '定期排查',
      checkItems: checkItems,
      total: checkItems.length
    }
  }
}

// 保存检查记录
async function saveCheckRecord(checkRecordId, checkItems, db) {
  const { OPENID } = cloud.getWXContext()

  let problemsFound = 0
  let problemsRectified = 0

  checkItems.forEach(item => {
    if (item.result === '异常') {
      problemsFound++
      if (item.handleStatus === '已处理') {
        problemsRectified++
      }
    }
  })

  const recordData = {
    checkType: checkItems[0]?.checkType || '定期排查',
    checkDate: new Date(),
    checkDept: checkItems[0]?.checkDept || '',
    checkPerson: checkItems[0]?.checkPerson || '',
    checkScope: checkItems[0]?.checkScope || '',
    checkItems: checkItems,
    problemsFound: problemsFound,
    problemsRectified: problemsRectified,
    summary: `共检查${checkItems.length}项，发现${problemsFound}个问题，已整改${problemsRectified}个`,
    createdAt: new Date(),
    createdBy: OPENID
  }

  let result
  if (checkRecordId) {
    result = await db.collection('check_records').doc(checkRecordId).update({
      data: {
        ...recordData,
        updatedAt: new Date()
      }
    })
  } else {
    result = await db.collection('check_records').add({
      data: recordData
    })
  }

  // 检查是否有异常项需要生成隐患
  if (problemsFound > 0) {
    const abnormalItems = checkItems.filter(item => item.result === '异常' && item.handleStatus !== '已处理')
    for (const item of abnormalItems) {
      await createDangerFromCheckItem(item, db)
    }
  }

  return {
    success: true,
    message: '检查记录已保存',
    data: {
      recordId: checkRecordId || result._id,
      problemsFound,
      problemsRectified
    }
  }
}

// 从检查项创建隐患
async function createDangerFromCheckItem(checkItem, db) {
  // 检查是否已存在相关隐患
  const existingDanger = await db.collection('hidden_danger_library')
    .where({
      relatedRiskId: checkItem.riskId,
      status: _.in(['待整改', '整改中', '待验证'])
    })
    .get()

  if (existingDanger.data.length > 0) {
    return // 已存在未完成的隐患，不重复创建
  }

  // 创建新隐患
  await db.collection('hidden_danger_library').add({
    data: {
      dangerLocation: checkItem.location || '待确认',
      dangerPart: checkItem.checkItem,
      dangerLevel: checkItem.riskLevel === 1 ? '重大隐患' : '一般隐患',
      dangerCategory: '行车安全',
      dangerDescription: checkItem.abnormalDesc || '检查发现异常',
      dangerStatus: '检查发现异常',
      causeAnalysis: '日常检查发现',
      hazardAnalysis: '需要进一步评估',
      treatmentPlan: '制定整改方案',
      treatmentMeasures: '',
      responsibleDept: checkItem.checkDept || '',
      responsiblePerson: '',
      plannedCompleteDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      completionCriteria: '',
      verificationMethod: '',
      isMajorDanger: checkItem.riskLevel === 1,
      isSupervised: checkItem.riskLevel === 1,
      supervisionLevel: checkItem.riskLevel === 1 ? '公司级' : '',
      supervisionStatus: checkItem.riskLevel === 1 ? '待督办' : '',
      discoveryDate: new Date(),
      discoverer: checkItem.checkPerson || '',
      findMethod: '日常排查',
      inDangerLibrary: true,
      status: '待整改',
      relatedRiskId: checkItem.riskId,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })
}

// 获取检查记录列表
async function getCheckRecordList(status, db) {
  let query = db.collection('check_records')

  if (status && status !== 'all') {
    query = query.where({
      status: status
    })
  }

  const result = await query.orderBy('checkDate', 'desc').limit(20).get()

  const list = result.data.map(item => ({
    ...item,
    checkDate: formatDate(new Date(item.checkDate)),
    createdAt: formatDate(new Date(item.createdAt))
  }))

  return {
    success: true,
    data: list
  }
}

// 获取检查记录详情
async function getCheckRecordDetail(checkRecordId, db) {
  const result = await db.collection('check_records').doc(checkRecordId).get()

  if (!result.data) {
    return {
      success: false,
      error: '检查记录不存在'
    }
  }

  const record = result.data
  record.checkDate = formatDate(new Date(record.checkDate))
  record.createdAt = formatDate(new Date(record.createdAt))

  return {
    success: true,
    data: record
  }
}

// 工具函数：格式化日期
function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}