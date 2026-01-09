const cloud = require('wx-server-sdk')
const cache = require('./utils/cache.js')
const validator = require('./utils/validator.js')
const { accessControl, PERMISSIONS } = require('./utils/accessControl.js')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { action, checkType, dept, location, checkRecordId, checkItems } = event;
  const { OPENID, APPID } = cloud.getWXContext()

  const db = cloud.database()
  const _ = db.command

  try {
    // 获取用户信息和角色
    const user = await accessControl.getUserInfo(OPENID)

    // 1. 生成检查表
    if (action === 'generate') {
      // 验证读取权限
      if (!user.hasPermission(PERMISSIONS.CHECKLIST.READ)) {
        return {
          success: false,
          error: '您没有权限生成检查表'
        }
      }
      return await generateChecklist(checkType, dept, location, db);
    }

    // 2. 保存检查记录
    if (action === 'save') {
      // 验证创建/更新权限
      if (!user.hasPermission(PERMISSIONS.CHECKLIST.CREATE) && !user.hasPermission(PERMISSIONS.CHECKLIST.UPDATE)) {
        return {
          success: false,
          error: '您没有权限保存检查记录'
        }
      }
      return await saveCheckRecord(checkRecordId, checkItems, db, OPENID);
    }

    // 3. 获取检查记录列表
    if (action === 'list') {
      // 验证读取权限
      if (!user.hasPermission(PERMISSIONS.CHECKLIST.READ)) {
        return {
          success: false,
          error: '您没有权限查看检查记录列表'
        }
      }
      return await getCheckRecordList(event.status, db);
    }

    // 4. 获取检查记录详情
    if (action === 'detail') {
      // 验证读取权限
      if (!user.hasPermission(PERMISSIONS.CHECKLIST.READ)) {
        return {
          success: false,
          error: '您没有权限查看检查记录详情'
        }
      }
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
  const cacheKey = cache.generateKey('generateChecklist', { checkType, dept, location })
  
  // 尝试从缓存获取数据
  const cachedData = await cache.get(cacheKey)
  if (cachedData) {
    return cachedData
  }
  
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

  const data = {
    success: true,
    data: {
      checkType: checkType || '定期排查',
      checkItems: checkItems,
      total: checkItems.length
    }
  }
  
  // 设置缓存，24小时过期
  await cache.set(cacheKey, data, 86400000)
  
  return data
}

// 保存检查记录
async function saveCheckRecord(checkRecordId, checkItems, db, openid) {

  // 验证和清理检查记录数据
  // 从检查项中提取必要的检查信息
  const firstItem = checkItems[0] || {};
  let recordData = {
    checkItems,
    checkType: firstItem.checkType || '定期排查',
    checkDept: firstItem.checkDept || '',
    checkPerson: firstItem.checkPerson || '',
    checkScope: firstItem.checkScope || ''
  };
  const validation = validator.validateCheckRecordData(recordData)
  if (!validation.valid) {
    return {
      success: false,
      error: validation.errors.join('; ')
    }
  }

  const sanitizedCheckItems = validation.data.checkItems
  let problemsFound = 0
  let problemsRectified = 0

  sanitizedCheckItems.forEach(item => {
    if (item.result === '异常') {
      problemsFound++
      if (item.handleStatus === '已处理') {
        problemsRectified++
      }
    }
  })

  recordData = {
    checkType: sanitizedCheckItems[0]?.checkType || '定期排查',
    checkDate: new Date(),
    checkDept: sanitizedCheckItems[0]?.checkDept || '',
    checkPerson: sanitizedCheckItems[0]?.checkPerson || '',
    checkScope: sanitizedCheckItems[0]?.checkScope || '',
    checkItems: sanitizedCheckItems,
    problemsFound: problemsFound,
    problemsRectified: problemsRectified,
    summary: `共检查${sanitizedCheckItems.length}项，发现${problemsFound}个问题，已整改${problemsRectified}个`,
    createdAt: new Date(),
    createdBy: openid
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
    const abnormalItems = sanitizedCheckItems.filter(item => item.result === '异常' && item.handleStatus !== '已处理')
    // 使用Promise.all优化异步操作
    await Promise.all(abnormalItems.map(item => createDangerFromCheckItem(item, db)))
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
  const cacheKey = cache.generateKey('getCheckRecordList', { status })
  
  // 尝试从缓存获取数据，缓存时间30分钟
  const cachedData = await cache.get(cacheKey)
  if (cachedData) {
    return cachedData
  }
  
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

  const data = {
    success: true,
    data: list
  }
  
  // 设置缓存，30分钟过期
  await cache.set(cacheKey, data, 1800000)
  
  return data
}

// 获取检查记录详情
async function getCheckRecordDetail(checkRecordId, db) {
  const cacheKey = cache.generateKey('getCheckRecordDetail', { checkRecordId })
  
  // 尝试从缓存获取数据，缓存时间1小时
  const cachedData = await cache.get(cacheKey)
  if (cachedData) {
    return cachedData
  }
  
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

  const data = {
    success: true,
    data: record
  }
  
  // 设置缓存，1小时过期
  await cache.set(cacheKey, data, 3600000)
  
  return data
}

// 工具函数：格式化日期
function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}