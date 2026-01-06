// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { action, sessionId, userInfo } = event

  console.log('webLogin云函数调用:', { action, sessionId })

  try {
    if (action === 'create_session') {
      // 创建登录会话
      await db.collection('login_sessions').add({
        data: {
          _id: sessionId,
          status: 'pending',
          createdAt: new Date()
        }
      })

      return {
        success: true
      }
    }

    if (action === 'check') {
      // Web端检查登录状态
      const session = await db.collection('login_sessions').doc(sessionId).get()

      if (!session.data) {
        return {
          success: true,
          status: 'pending'
        }
      }

      return {
        success: true,
        status: session.data.status,
        userInfo: session.data.userInfo || null
      }
    }

    if (action === 'confirm') {
      // 小程序端确认登录
      const now = new Date()

      // 更新登录会话状态
      await db.collection('login_sessions').doc(sessionId).update({
        data: {
          status: 'success',
          userInfo: userInfo,
          confirmedAt: now
        }
      })

      return {
        success: true
      }
    }

    return {
      success: false,
      error: '未知操作'
    }
  } catch (error) {
    console.error('webLogin云函数错误:', error)
    return {
      success: false,
      error: error.message || '操作失败'
    }
  }
}