const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { status, page = 1, size = 20 } = event
  const { OPENID } = cloud.getWXContext()

  const db = cloud.database()
  const _ = db.command

  try {
    // 构建查询条件
    let query = db.collection('hidden_danger_library')

    if (status && status !== 'all') {
      query = query.where({
        status: status
      })
    }

    // 获取总数
    const countResult = await query.count()
    const total = countResult.total

    // 分页查询
    const result = await query
      .orderBy('discoveryDate', 'desc')
      .skip((page - 1) * size)
      .limit(size)
      .get()

    // 统计数据
    const allDangers = await db.collection('hidden_danger_library').get()
    const statistics = {
      total: allDangers.data.length,
      identified: allDangers.data.filter(d => d.status === '待整改').length,
      treating: allDangers.data.filter(d => d.status === '整改中').length,
      completed: allDangers.data.filter(d => d.status === '待验证').length,
      verified: allDangers.data.filter(d => d.status === '已销号').length,
      closureRate: allDangers.data.length > 0 
        ? Math.round((allDangers.data.filter(d => d.status === '已销号').length / allDangers.data.length) * 100) 
        : 0
    }

    // 格式化数据
    const inspections = result.data.map(item => ({
      id: item._id,
      title: item.dangerDescription || '未命名隐患',
      type: item.dangerType || 'equipment',
      typeName: mapDangerType(item.dangerType),
      level: item.dangerLevel || '一般隐患',
      zone: item.dangerLocation || '未知位置',
      status: mapStatus(item.status),
      statusName: mapStatusName(item.status),
      severity: item.severityLevel || 'C类',
      description: item.dangerDescription || '',
      deadline: formatDate(item.plannedCompleteDate),
      responsiblePerson: item.responsiblePerson || '未知',
      priority: mapPriority(item.dangerLevel),
      priorityName: mapPriorityName(mapPriority(item.dangerLevel)),
      rectificationResult: item.rectificationResult || '',
      complianceStatus: item.complianceStatus || '未评估',
      supervisionStatus: item.supervisionStatus || '未督办',
      actualProgress: item.actualProgress || 0
    }))

    return {
      success: true,
      data: {
        inspections,
        statistics,
        currentPage: page,
        totalPages: Math.ceil(total / size),
        total
      }
    }

  } catch (error) {
    console.error('获取巡检数据失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 映射隐患类型
function mapDangerType(type) {
  switch(type) {
    case '设备设施': return 'equipment'
    case '人员行为': return 'behavior'
    case '环境因素': return 'environment'
    default: return 'equipment'
  }
}

// 映射状态
function mapStatus(status) {
  switch(status) {
    case '待整改': return 'identified'
    case '整改中': return 'treating'
    case '待验证': return 'pending_verification'
    case '已销号': return 'completed'
    default: return 'identified'
  }
}

// 映射状态名称
function mapStatusName(status) {
  switch(status) {
    case '待整改': return '已发现'
    case '整改中': return '整改中'
    case '待验证': return '待验证'
    case '已销号': return '已销号'
    default: return '已发现'
  }
}

// 映射优先级
function mapPriority(level) {
  switch(level) {
    case '重大隐患': return 1
    case '较大隐患': return 2
    case '一般隐患': return 3
    case '轻微隐患': return 4
    default: return 3
  }
}

// 映射优先级名称
function mapPriorityName(priority) {
  switch(priority) {
    case 1: return '重要'
    case 2: return '较重要'
    case 3: return '一般'
    case 4: return '轻微'
    default: return '一般'
  }
}