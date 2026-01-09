const cloud = require('wx-server-sdk')
const cache = require('../utils/cache.js')
const validator = require('../utils/validator.js')
const crypto = require('../utils/crypto.js')
const { accessControl } = require('../utils/accessControl.js')
const { PERMISSIONS } = require('../utils/accessControl.js')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { action, certificateId, ...params } = event
  const { OPENID } = cloud.getWXContext()

  const db = cloud.database()
  const _ = db.command

  try {
    // 获取用户信息和角色
    const user = await accessControl.getUserInfo(OPENID)

    // 1. 获取证书列表
    if (action === 'list') {
      // 验证读取权限
      if (!user.hasPermission(PERMISSIONS.CERTIFICATE.READ)) {
        return {
          success: false,
          error: '您没有权限查看证书列表'
        }
      }
      return await getCertificateList(params, db)
    }

    // 2. 获取证书详情
    if (action === 'detail') {
      // 验证读取权限
      if (!user.hasPermission(PERMISSIONS.CERTIFICATE.READ)) {
        return {
          success: false,
          error: '您没有权限查看证书详情'
        }
      }
      return await getCertificateDetail(certificateId, db)
    }

    // 3. 创建证书
    if (action === 'create') {
      // 验证创建权限
      if (!user.hasPermission(PERMISSIONS.CERTIFICATE.CREATE)) {
        return {
          success: false,
          error: '您没有权限创建证书'
        }
      }
      return await createCertificate(params, db)
    }

    // 4. 更新证书
    if (action === 'update') {
      // 验证更新权限
      if (!user.hasPermission(PERMISSIONS.CERTIFICATE.UPDATE)) {
        return {
          success: false,
          error: '您没有权限更新证书'
        }
      }
      return await updateCertificate(certificateId, params, db)
    }

    // 5. 删除证书
    if (action === 'delete') {
      // 验证删除权限
      if (!user.hasPermission(PERMISSIONS.CERTIFICATE.DELETE)) {
        return {
          success: false,
          error: '您没有权限删除证书'
        }
      }
      return await deleteCertificate(certificateId, db)
    }

    // 6. 获取即将到期的证书
    if (action === 'expiring') {
      // 验证读取权限
      if (!user.hasPermission(PERMISSIONS.CERTIFICATE.READ)) {
        return {
          success: false,
          error: '您没有权限查看即将到期的证书'
        }
      }
      return await getExpiringCertificates(params, db)
    }

    return {
      success: false,
      error: '未知的操作类型'
    }

  } catch (error) {
    console.error('证书管理操作失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// 获取证书列表
async function getCertificateList(params, db) {
  const { page = 1, pageSize = 20, type, status } = params
  const cacheKey = cache.generateKey('getCertificateList', { page, pageSize, type, status })
  
  // 尝试从缓存获取数据
  const cachedData = await cache.get(cacheKey)
  if (cachedData) {
    return cachedData
  }

  let query = db.collection('certificates')

  // 筛选条件
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
    .orderBy('expiryDate', 'asc')
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get()
  
  // 解密敏感字段
  const sensitiveFields = ['certificateNumber', 'holder', 'issuingAuthority']
  const decryptedList = crypto.decryptArraySensitiveFields(result.data, sensitiveFields)

  const data = {
    success: true,
    data: {
      list: decryptedList,
      total,
      page,
      pageSize
    }
  }
  
  // 设置缓存，5分钟过期
  await cache.set(cacheKey, data, 300000)
  
  return data
}

// 获取证书详情
async function getCertificateDetail(certificateId, db) {
  const result = await db.collection('certificates').doc(certificateId).get()

  if (!result.data) {
    return {
      success: false,
      error: '证书不存在'
    }
  }
  
  // 解密敏感字段
  const sensitiveFields = ['certificateNumber', 'holder', 'issuingAuthority']
  const decryptedData = crypto.decryptSensitiveFields(result.data, sensitiveFields)

  return {
    success: true,
    data: decryptedData
  }
}

// 创建证书
async function createCertificate(params, db) {
  // 验证和清理证书数据
  const validation = validator.validateCertificateData(params)
  if (!validation.valid) {
    return {
      success: false,
      error: validation.errors.join('; ')
    }
  }

  const sanitizedData = validation.data
  
  // 加密敏感字段
  const sensitiveFields = ['certificateNumber', 'holder', 'issuingAuthority']
  const encryptedData = crypto.encryptSensitiveFields(sanitizedData, sensitiveFields)
  
  const result = await db.collection('certificates').add({
    data: {
      ...encryptedData,
      issueDate: new Date(encryptedData.issueDate),
      expiryDate: new Date(encryptedData.expiryDate),
      attachments: encryptedData.attachments || [],
      status: '有效',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })
  
  // 清除所有证书相关的缓存
  await cache.clear()

  return {
    success: true,
    message: '证书创建成功',
    data: { id: result._id }
  }
}

// 更新证书
async function updateCertificate(certificateId, params, db) {
  // 验证和清理证书数据
  const validation = validator.validateCertificateData(params)
  if (!validation.valid) {
    return {
      success: false,
      error: validation.errors.join('; ')
    }
  }

  const sanitizedData = validation.data
  await db.collection('certificates').doc(certificateId).update({
    data: {
      ...sanitizedData,
      updatedAt: new Date()
    }
  })
  
  // 清除所有证书相关的缓存
  await cache.clear()

  return {
    success: true,
    message: '证书更新成功'
  }
}

// 删除证书
async function deleteCertificate(certificateId, db) {
  await db.collection('certificates').doc(certificateId).remove()
  
  // 清除所有证书相关的缓存
  await cache.clear()

  return {
    success: true,
    message: '证书删除成功'
  }
}

// 获取即将到期的证书
async function getExpiringCertificates(params, db) {
  const { days = 30 } = params
  const cacheKey = cache.generateKey('getExpiringCertificates', { days })
  
  // 尝试从缓存获取数据
  const cachedData = await cache.get(cacheKey)
  if (cachedData) {
    return cachedData
  }
  
  const now = new Date()
  const expiryDate = new Date()
  expiryDate.setDate(now.getDate() + days)

  const result = await db.collection('certificates')
    .where({
      status: '有效',
      expiryDate: _.gte(now).lte(expiryDate)
    })
    .orderBy('expiryDate', 'asc')
    .get()

  const data = {
    success: true,
    data: {
      list: result.data,
      total: result.data.length
    }
  }
  
  // 设置缓存，1小时过期
  await cache.set(cacheKey, data, 3600000)
  
  return data
}