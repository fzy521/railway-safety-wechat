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
      level: item.dangerLevel || '一般隐患',
      location: item.dangerLocation || '未知位置',
      status: item.status || '待整改',
      discoverer: item.discoverer || '未知',
      discoveryDate: formatDate(item.discoveryDate),
      plannedDate: formatDate(item.plannedCompleteDate),
      isOverdue: new Date(item.plannedCompleteDate) < new Date() && item.status !== '已销号',
      isMajor: item.isMajorDanger || false
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