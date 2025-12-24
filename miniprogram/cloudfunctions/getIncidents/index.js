// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 模拟事故数据 - 快速上线版本
const mockIncidents = {
  statistics: {
    total: 5,
    thisMonth: 1,
    thisWeek: 0,
    today: 0,
    byType: {
      traffic: 2,
      equipment: 2,
      operation: 1,
      environment: 0
    }
  },
  recentIncidents: [
    {
      id: 'INC001',
      title: '2号轨道信号异常',
      type: 'equipment',
      typeName: '设备故障',
      level: 'low',
      levelName: '一般事故',
      status: 'resolved',
      statusName: '已处理',
      date: '2024-12-22',
      time: '10:25',
      description: '2号轨道信号系统出现短暂异常，检查发现电缆连接松动，已修复',
      location: '梁邹站场',
      reporter: '张三',
      handler: '李四',
      resolutionTime: '140分钟'
    },
    {
      id: 'INC002',
      title: '机车制动距离过长',
      type: 'traffic',
      typeName: '行车事故',
      level: 'medium',
      levelName: '险性事故',
      status: 'processing',
      statusName: '处理中',
      date: '2024-12-20',
      time: '15:10',
      description: '司机反映制动距离异常，初步判定为制动系统气压不足',
      location: '专用线K15+300',
      reporter: '王五',
      handler: '维修组',
      resolutionTime: ''
    }
  ]
}

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  try {
    // 获取请求参数
    const { date, status, type, page = 1, size = 20 } = event

    // 模拟根据不同条件返回数据
    let incidents = mockIncidents.recentIncidents

    // 按状态筛选
    if (status) {
      incidents = incidents.filter(item => item.status === status)
    }

    // 按类型筛选
    if (type) {
      incidents = incidents.filter(item => item.type === type)
    }

    // 分页处理
    const start = (page - 1) * size
    const end = start + size
    const paginatedIncidents = incidents.slice(start, end)

    return {
      success: true,
      data: {
        statistics: mockIncidents.statistics,
        incidents: paginatedIncidents,
        currentPage: page,
        totalPages: Math.ceil(incidents.length / size),
        totalCount: incidents.length
      }
    }

  } catch (err) {
    console.error('获取事故记录失败:', err)
    return {
      success: false,
      error: err.message
    }
  }
}