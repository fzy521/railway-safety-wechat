const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { action, planId, ...params } = event
  const { OPENID } = cloud.getWXContext()

  const db = cloud.database()
  const _ = db.command

  try {
    // 1. 获取预案列表
    if (action === 'list') {
      return await getPlanList(params, db)
    }

    // 2. 获取预案详情
    if (action === 'detail') {
      return await getPlanDetail(planId, db)
    }

    // 3. 创建预案
    if (action === 'create') {
      return await createPlan(params, db)
    }

    // 4. 更新预案
    if (action === 'update') {
      return await updatePlan(planId, params, db)
    }

    // 5. 删除预案
    if (action === 'delete') {
      return await deletePlan(planId, db)
    }

    // 6. 上传PDF文件
    if (action === 'upload') {
      return await uploadPdfFile(params, db)
    }

    // 7. 删除PDF文件
    if (action === 'deleteFile') {
      return await deletePdfFile(params, db)
    }

    return {
      success: false,
      error: '未知的操作类型'
    }

  } catch (error) {
    console.error('应急预案管理操作失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// 获取预案列表
async function getPlanList(params, db) {
  const { page = 1, pageSize = 20, name, type, status } = params

  let query = db.collection('emergency_plans')

  // 筛选条件
  if (name) {
    query = query.where({
      name: db.RegExp({
        regexp: name,
        options: 'i'
      })
    })
  }
  if (type) {
    query = query.where({ type })
  }
  if (status) {
    query = query.where({ status })
  }

  // 获取总数
  const countResult = await query.count()
  const total = countResult.total

  // 分页查询
  const result = await query
    .orderBy('createTime', 'desc')
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

// 获取预案详情
async function getPlanDetail(planId, db) {
  const result = await db.collection('emergency_plans').doc(planId).get()

  if (!result.data) {
    return {
      success: false,
      error: '预案不存在'
    }
  }

  return {
    success: true,
    data: result.data
  }
}

// 创建预案
async function createPlan(params, db) {
  const {
    id,
    name,
    type,
    typeName,
    version,
    status,
    statusText,
    lastReviewDate,
    nextReviewDate,
    approvalDept,
    drillFrequency,
    drillFrequencyCode,
    effectiveness,
    pdfFiles
  } = params

  const result = await db.collection('emergency_plans').add({
    data: {
      id,
      name,
      type,
      typeName,
      version,
      status,
      statusText,
      lastReviewDate: new Date(lastReviewDate),
      nextReviewDate: new Date(nextReviewDate),
      approvalDept,
      drillFrequency,
      drillFrequencyCode,
      effectiveness,
      pdfFiles: pdfFiles || [],
      createTime: Date.now(),
      updateTime: Date.now()
    }
  })

  return {
    success: true,
    message: '预案创建成功',
    data: { _id: result._id }
  }
}

// 更新预案
async function updatePlan(planId, params, db) {
  await db.collection('emergency_plans').doc(planId).update({
    data: {
      ...params,
      updateTime: Date.now()
    }
  })

  return {
    success: true,
    message: '预案更新成功'
  }
}

// 删除预案
async function deletePlan(planId, db) {
  await db.collection('emergency_plans').doc(planId).remove()

  return {
    success: true,
    message: '预案删除成功'
  }
}

// 上传PDF文件
async function uploadPdfFile(params, db) {
  const { file } = params

  // 上传到云存储
  const uploadResult = await cloud.uploadFile({
    cloudPath: `emergency-plans/${Date.now()}_${file.name}`,
    fileContent: file
  })

  // 获取文件URL
  const fileResult = await cloud.getTempFileURL({
    fileList: [uploadResult.fileID]
  })

  const pdfFile = {
    id: uploadResult.fileID,
    fileName: file.name,
    fileSize: `${(file.size / 1024).toFixed(2)}KB`,
    uploadTime: new Date().toISOString(),
    fileUrl: fileResult.fileList[0].tempFileURL,
    cloudPath: uploadResult.fileID
  }

  return {
    success: true,
    data: pdfFile
  }
}

// 删除PDF文件
async function deletePdfFile(params, db) {
  const { cloudPath } = params

  // 从云存储删除
  await cloud.deleteFile({
    fileList: [cloudPath]
  })

  return {
    success: true,
    message: '文件删除成功'
  }
}