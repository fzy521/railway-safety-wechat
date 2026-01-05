// 云函数：更新用户信息
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { userInfo, action } = event
  const openid = wxContext.OPENID

  try {
    if (action === 'update') {
      // 更新用户信息
      const result = await db.collection('users').where({
        _openid: openid
      }).update({
        data: {
          ...userInfo,
          updatedAt: new Date()
        }
      })

      return {
        success: true,
        message: '用户信息更新成功'
      }
    } else if (action === 'get') {
      // 获取用户信息
      const result = await db.collection('users').where({
        _openid: openid
      }).get()

      if (result.data.length > 0) {
        return {
          success: true,
          userInfo: result.data[0]
        }
      } else {
        // 如果用户不存在，创建新用户
        const createResult = await db.collection('users').add({
          data: {
            ...userInfo,
            _openid: openid,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })
        return {
          success: true,
          userInfo: {
            _id: createResult._id,
            ...userInfo,
            _openid: openid,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        }
      }
    } else if (action === 'getStatistics') {
      // 获取用户统计数据
      const userResult = await db.collection('users').where({
        _openid: openid
      }).get()

      if (userResult.data.length > 0) {
        const user = userResult.data[0]
        return {
          success: true,
          statistics: {
            inspections: user.inspections || 0,
            incidents: user.incidents || 0,
            certificates: user.certificates || 0,
            experience: user.experience || 0
          }
        }
      } else {
        return {
          success: true,
          statistics: {
            inspections: 0,
            incidents: 0,
            certificates: 0,
            experience: 0
          }
        }
      }
    }

    return {
      success: false,
      error: '未知的操作类型'
    }

  } catch (error) {
    console.error('用户信息操作失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}