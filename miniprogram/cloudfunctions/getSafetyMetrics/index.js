// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 模拟安全数据 - 快速上线版本
const mockData = {
  metrics: {
    todayIncidents: 0,
    riskLevel: '低',
    safetyRate: 98,
    completionRate: 96,
    lowRisks: 15,
    mediumRisks: 2,
    highRisks: 0
  },
  zones: [
    {
      id: 1,
      name: '梁邹站场',
      status: 'safe',
      statusText: '安全',
      incidents: 0,
      risks: 2,
      lastCheck: '10:30'
    },
    {
      id: 2,
      name: '专用线区间',
      status: 'safe',
      statusText: '安全',
      incidents: 0,
      risks: 3,
      lastCheck: '09:45'
    },
    {
      id: 3,
      name: '货场线',
      status: 'warning',
      statusText: '注意',
      incidents: 0,
      risks: 5,
      lastCheck: '08:20'
    }
  ],

  trends: [
    { date: '周一', incidents: 2 },
    { date: '周二', incidents: 1 },
    { date: '周三', incidents: 0 },
    { date: '周四', incidents: 0 },
    { date: '周五', incidents: 0 },
    { date: '周六', incidents: 1 },
    { date: '今日', incidents: 0 }
  ],

  alerts: [
    {
      id: 1,
      type: '设备异常',
      content: '2号轨道检测器信号异常',
      time: '10:30',
      level: 'warning'
    }
  ]
}

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  try {
    const date = event.date || new Date().toISOString().split('T')[0]

    // 实际项目可通过数据库查询复杂的安全数据统计
    // 本版本为快速上线，使用模拟数据

    return {
      success: true,
      data: mockData.metrics,
      zones: mockData.zones,
      trendData: mockData.trends,
      alerts: mockData.alerts,
      updateTime: new Date().toLocaleString('zh-CN')
    }

  } catch (err) {
    console.error('获取安全指标失败:', err)
    return {
      success: false,
      error: err.message
    }
  }
}