// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 先使用模拟数据快速上线
const mockStats = {
  incidents: 0,  // 今日事故数
  riskLevel: '低',
  completionRate: 98,  // 巡检完成率
  alerts: 2,  // 未处理预警数
  onlineDevices: 24,  // 在线设备数
  totalDevices: 26,  // 设备总数
}

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  try {
    // 获取今日日期
    const today = event.date || new Date().toISOString().split('T')[0]

    // 实际项目中会查询数据库
    // 本次为快速上线，使用模拟数据

    return {
      success: true,
      data: mockStats
    }

  } catch (err) {
    console.error('获取快速统计数据失败:', err)
    return {
      success: false,
      error: err.message
    }
  }
}