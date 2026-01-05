const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { id } = event

  const db = cloud.database()

  try {
    const result = await db.collection('hidden_danger_library').doc(id).get()

    if (!result.data) {
      return {
        success: false,
        error: '隐患记录不存在'
      }
    }

    return {
      success: true,
      data: result.data
    }
  } catch (error) {
    console.error('获取隐患详情失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}