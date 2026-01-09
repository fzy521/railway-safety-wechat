const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { action, notificationId, ...params } = event
  const { OPENID } = cloud.getWXContext()

  const db = cloud.database()
  const _ = db.command

  try {
    // 1. 获取通知列表
    if (action === 'list') {
      return await getNotificationList(params, db)
    }

    // 2. 获取通知详情
    if (action === 'detail') {
      return await getNotificationDetail(notificationId, db)
    }

    // 3. 创建通知
    if (action === 'create') {
      return await createNotification(params, db)
    }

    // 4. 标记为已读
    if (action === 'markRead') {
      return await markAsRead(notificationId, db)
    }

    // 5. 批量标记已读
    if (action === 'markAllRead') {
      return await markAllAsRead(db)
    }

    // 6. 删除通知
    if (action === 'delete') {
      return await deleteNotification(notificationId, db)
    }

    // 7. 获取未读数量
    if (action === 'unreadCount') {
      return await getUnreadCount(db)
    }

    return {
      success: false,
      error: '未知的操作类型'
    }

  } catch (error) {
    console.error('通知管理操作失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// 获取通知列表
async function getNotificationList(params, db) {
  const { page = 1, pageSize = 20, type, isRead } = params

  let query = db.collection('notifications')

  // 筛选条件
  if (type) {
    query = query.where({ type })
  }
  if (isRead !== undefined) {
    query = query.where({ isRead })
  }

  // 获取总数
  const countResult = await query.count()
  const total = countResult.total

  // 分页查询
  const result = await query
    .orderBy('createdAt', 'desc')
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

// 获取通知详情
async function getNotificationDetail(notificationId, db) {
  const result = await db.collection('notifications').doc(notificationId).get()

  if (!result.data) {
    return {
      success: false,
      error: '通知不存在'
    }
  }

  return {
    success: true,
    data: result.data
  }
}

// 创建通知
async function createNotification(params, db) {
  const {
    title,
    content,
    type,
    priority,
    targetUsers,
    relatedId,
    relatedType
  } = params

  const result = await db.collection('notifications').add({
    data: {
      title,
      content,
      type,
      priority: priority || 'normal',
      targetUsers: targetUsers || [],
      relatedId,
      relatedType,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })

  return {
    success: true,
    message: '通知创建成功',
    data: { id: result._id }
  }
}

// 标记为已读
async function markAsRead(notificationId, db) {
  await db.collection('notifications').doc(notificationId).update({
    data: {
      isRead: true,
      readAt: new Date(),
      updatedAt: new Date()
    }
  })

  return {
    success: true,
    message: '已标记为已读'
  }
}

// 批量标记已读
async function markAllAsRead(db) {
  await db.collection('notifications')
    .where({ isRead: false })
    .update({
      data: {
        isRead: true,
        readAt: new Date(),
        updatedAt: new Date()
      }
    })

  return {
    success: true,
    message: '全部标记为已读'
  }
}

// 删除通知
async function deleteNotification(notificationId, db) {
  await db.collection('notifications').doc(notificationId).remove()

  return {
    success: true,
    message: '通知删除成功'
  }
}

// 获取未读数量
async function getUnreadCount(db) {
  const result = await db.collection('notifications')
    .where({ isRead: false })
    .count()

  return {
    success: true,
    data: { count: result.total }
  }
}