const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { action, incidentId, ...params } = event
  const { OPENID } = cloud.getWXContext()

  const db = cloud.database()
  const _ = db.command

  try {
    // 1. 获取事故列表
    if (action === 'list') {
      return await getIncidentList(params, db)
    }

    // 2. 获取事故详情
    if (action === 'detail') {
      return await getIncidentDetail(incidentId, db)
    }

    // 3. 创建事故记录
    if (action === 'create') {
      return await createIncident(params, db)
    }

    // 4. 更新事故记录
    if (action === 'update') {
      return await updateIncident(incidentId, params, db)
    }

    // 5. 删除事故记录
    if (action === 'delete') {
      return await deleteIncident(incidentId, db)
    }

    // 6. 获取事故统计
    if (action === 'statistics') {
      return await getIncidentStatistics(db)
    }

    return {
      success: false,
      error: '未知的操作类型'
    }

  } catch (error) {
    console.error('事故管理操作失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// 获取事故列表
async function getIncidentList(params, db) {
  const { page = 1, pageSize = 20, status, type, startDate, endDate } = params

  let query = db.collection('incidents')

  // 筛选条件
  if (status) {
    query = query.where({ status })
  }
  if (type) {
    query = query.where({ type })
  }
  if (startDate && endDate) {
    query = query.where({
      incidentDate: _.gte(new Date(startDate)).lte(new Date(endDate))
    })
  }

  // 获取总数
  const countResult = await query.count()
  const total = countResult.total

  // 分页查询
  const result = await query
    .orderBy('incidentDate', 'desc')
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get()

  return {
    success: true,
    data: {
      list: result.data,
      total,
      page,
      pageSize
    }
  }
}

// 获取事故详情
async function getIncidentDetail(incidentId, db) {
  const result = await db.collection('incidents').doc(incidentId).get()

  if (!result.data) {
    return {
      success: false,
      error: '事故记录不存在'
    }
  }

  return {
    success: true,
    data: result.data
  }
}

// 创建事故记录
async function createIncident(params, db) {
  const {
    title,
    type,
    level,
    description,
    location,
    reporter,
    incidentDate,
    incidentTime,
    causes,
    measures,
    status = '待处理'
  } = params

  const result = await db.collection('incidents').add({
    data: {
      title,
      type,
      level,
      description,
      location,
      reporter,
      incidentDate: new Date(incidentDate),
      incidentTime,
      causes,
      measures,
      status,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })

  return {
    success: true,
    message: '事故记录创建成功',
    data: { id: result._id }
  }
}

// 更新事故记录
async function updateIncident(incidentId, params, db) {
  await db.collection('incidents').doc(incidentId).update({
    data: {
      ...params,
      updatedAt: new Date()
    }
  })

  return {
    success: true,
    message: '事故记录更新成功'
  }
}

// 删除事故记录
async function deleteIncident(incidentId, db) {
  await db.collection('incidents').doc(incidentId).remove()

  return {
    success: true,
    message: '事故记录删除成功'
  }
}

// 获取事故统计
async function getIncidentStatistics(db) {
  const incidents = await db.collection('incidents').get()
  const data = incidents.data

  const now = new Date()
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const thisWeek = new Date(now.setDate(now.getDate() - now.getDay()))
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const statistics = {
    total: data.length,
    thisMonth: data.filter(i => i.incidentDate >= thisMonth).length,
    thisWeek: data.filter(i => i.incidentDate >= thisWeek).length,
    today: data.filter(i => i.incidentDate >= today).length,
    byType: {},
    byLevel: {},
    byStatus: {}
  }

  // 按类型统计
  data.forEach(incident => {
    statistics.byType[incident.type] = (statistics.byType[incident.type] || 0) + 1
    statistics.byLevel[incident.level] = (statistics.byLevel[incident.level] || 0) + 1
    statistics.byStatus[incident.status] = (statistics.byStatus[incident.status] || 0) + 1
  })

  return {
    success: true,
    data: statistics
  }
}