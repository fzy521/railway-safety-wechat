// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  // 获取调用者信息
  const db = cloud.database()
  const userCollection = db.collection('users')

  // 获取传入的用户信息（头像和昵称）
  const userInfo = event.userInfo || {}

  try {
    // 根据openid查询用户
    const userResult = await userCollection.where({
      openid: wxContext.OPENID
    }).get()

    let user = null

    if (userResult.data.length > 0) {
      // 用户已存在，更新登录时间和用户信息
      user = userResult.data[0]
      
      // 构建更新数据
      const updateData = {
        lastLoginTime: new Date(),
        totalLoginTimes: db.command.inc(1)
      }

      // 如果传入了新的用户信息，更新头像和昵称
      if (userInfo.nickName || userInfo.avatarUrl) {
        updateData['profile.name'] = userInfo.nickName || user.profile.name
        updateData['profile.avatar'] = userInfo.avatarUrl || user.profile.avatar
      }

      await userCollection.doc(user._id).update({
        data: updateData
      })

      // 将用户类型的openid数组更新到最新
      if (!user.openIds || !user.openIds.includes(wxContext.OPENID)) {
        await userCollection.doc(user._id).update({
          data: {
            openIds: db.command.addToSet(wxContext.OPENID)
          }
        })
      }
    } else {
      // 新用户，创建记录
      const newUserData = {
        openid: wxContext.OPENID,
        openIds: [wxContext.OPENID],
        unionId: wxContext.UNIONID || '',
        createdAt: new Date(),
        lastLoginTime: new Date(),
        totalLoginTimes: 1,
        role: 'visitor', // 默认角色
        permissions: ['read'], // 默认权限
        status: 'active',
        profile: {
          name: userInfo.nickName || '用户' + wxContext.OPENID.substr(-6),
          avatar: userInfo.avatarUrl || '',
          phone: '',
          department: '',
          position: ''
        }
      }

      const addResult = await userCollection.add({
        data: newUserData
      })

      user = {
        ...newUserData,
        _id: addResult._id
      }
    }

    return {
      success: true,
      data: {
        openid: wxContext.OPENID,
        appid: wxContext.APPID,
        unionId: wxContext.UNIONID || '',
        userInfo: {
          _id: user._id,
          name: user.profile.name,
          avatar: user.profile.avatar,
          role: user.role,
          permissions: user.permissions,
          department: user.profile.department
        }
      }
    }

  } catch (err) {
    console.error('用户登录处理失败:', err)
    return {
      success: false,
      error: err.message
    }
  }
}