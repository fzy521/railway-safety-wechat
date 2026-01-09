// 云函数入口文件
const cloud = require('wx-server-sdk');
const CloudFunctionUtils = require('../utils/cloudUtils');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const utils = new CloudFunctionUtils();
  
  // 输入验证
  const validateResult = utils.validateParams(event, {
    action: utils.paramTypes.string.required()
  });
  
  if (!validateResult.success) {
    return utils.standardResponse(false, null, validateResult.error, 400);
  }

  const { action, data } = event;

  try {
    switch (action) {
      case 'create':
        return await createRisk(data);
      case 'update':
        return await updateRisk(data);
      case 'getList':
        return await getRisksList(data);
      case 'getLevelStatistics':
        return await getRiskLevelStatistics();
      case 'getTrend':
        return await getRiskTrend();
      default:
        return utils.standardResponse(false, null, '无效的操作类型', 400);
    }
  } catch (error) {
    console.error('管理风险操作失败:', error);
    return utils.standardResponse(false, null, error.message || '处理请求失败', 500);
  }
};

// 创建风险
async function createRisk(riskData) {
  const utils = new CloudFunctionUtils();
  
  // 验证必需字段
  if (!riskData.riskName || !riskData.mValue || !riskData.e1Value || !riskData.e2Value || !riskData.sValue) {
    return utils.standardResponse(false, null, '缺少必需字段', 400);
  }

  // 计算风险值
  const riskValue = riskData.mValue * Math.max(riskData.e1Value, riskData.e2Value) * riskData.sValue;

  // 确定风险等级
  let level = '低风险';
  if (riskValue > 180) {
    level = '重大风险';
  } else if (riskValue > 90) {
    level = '较大风险';
  } else if (riskValue > 40) {
    level = '一般风险';
  }

  const newRisk = {
    riskName: riskData.riskName,
    riskDescription: riskData.riskDescription || '',
    mValue: riskData.mValue,
    e1Value: riskData.e1Value,
    e2Value: riskData.e2Value,
    sValue: riskData.sValue,
    riskValue: riskValue,
    level: level,
    riskLevel: riskValue > 180 ? 1 : riskValue > 90 ? 2 : riskValue > 40 ? 3 : 4,
    status: riskData.status || 'active',
    location: riskData.location || '',
    category: riskData.category || '',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const result = await db.collection('risk_library').add({
    data: newRisk
  });

  // 清除风险相关缓存
  await utils.clearCacheByPrefix('manage-risk-getRisksList');
  await utils.clearCacheByPrefix('manage-risk-getRiskLevelStatistics');
  await utils.clearCacheByPrefix('manage-risk-getRiskTrend');

  return utils.standardResponse(true, { id: result._id, ...newRisk }, null, 201);
}

// 更新风险
async function updateRisk(riskData) {
  const utils = new CloudFunctionUtils();
  
  if (!riskData._id) {
    return utils.standardResponse(false, null, '缺少风险ID', 400);
  }

  // 计算风险值
  const riskValue = riskData.mValue * Math.max(riskData.e1Value, riskData.e2Value) * riskData.sValue;

  // 确定风险等级
  let level = '低风险';
  if (riskValue > 180) {
    level = '重大风险';
  } else if (riskValue > 90) {
    level = '较大风险';
  } else if (riskValue > 40) {
    level = '一般风险';
  }

  const updateData = {
    riskName: riskData.riskName,
    riskDescription: riskData.riskDescription || '',
    mValue: riskData.mValue,
    e1Value: riskData.e1Value,
    e2Value: riskData.e2Value,
    sValue: riskData.sValue,
    riskValue: riskValue,
    level: level,
    riskLevel: riskValue > 180 ? 1 : riskValue > 90 ? 2 : riskValue > 40 ? 3 : 4,
    status: riskData.status || 'active',
    location: riskData.location || '',
    category: riskData.category || '',
    updatedAt: new Date()
  };

  await db.collection('risk_library').doc(riskData._id).update({
    data: updateData
  });

  // 清除风险相关缓存
  await utils.clearCacheByPrefix('manage-risk-getRisksList');
  await utils.clearCacheByPrefix('manage-risk-getRiskLevelStatistics');
  await utils.clearCacheByPrefix('manage-risk-getRiskTrend');

  return utils.standardResponse(true, { id: riskData._id, ...updateData }, null, 200);
}

// 获取风险列表
async function getRisksList(params) {
  const utils = new CloudFunctionUtils();
  const { page = 1, limit = 20, search, level, color, status, likelihood, severity } = params || {};

  // 尝试从缓存获取数据（缓存有效期为5分钟）
  const cacheKey = utils.generateCacheKey('manage-risk-getRisksList', { page, limit, search, level, color, status, likelihood, severity });
  const cachedData = await utils.getCache(cacheKey);
  if (cachedData) {
    console.log('从缓存返回风险列表数据');
    return utils.standardResponse(true, cachedData, null, 200);
  }

  let query = db.collection('risk_library');

  // 应用筛选条件
  if (search) {
    query = query.where({
      riskName: db.RegExp({
        regexp: search,
        options: 'i'
      })
    });
  }
  
  if (level) {
    query = query.where({ level: level });
  }
  
  if (color) {
    query = query.where({ riskColor: color });
  }
  
  if (status) {
    query = query.where({ status: status });
  }
  
  if (likelihood) {
    query = query.where({ mValue: likelihood });
  }
  
  if (severity) {
    query = query.where({ sValue: severity });
  }

  // 获取总数
  const countResult = await query.count();
  
  // 执行分页查询
  const listResult = await query
    .skip((page - 1) * limit)
    .limit(limit)
    .orderBy('createdAt', 'desc')
    .get();

  const result = {
    list: listResult.data,
    total: countResult.total
  };

  // 将数据存入缓存
  await utils.setCache(cacheKey, result, 5);

  return utils.standardResponse(true, result, null, 200);
}

// 获取风险等级统计
async function getRiskLevelStatistics() {
  const utils = new CloudFunctionUtils();

  // 尝试从缓存获取数据（缓存有效期为30分钟）
  const cacheKey = utils.generateCacheKey('manage-risk-getRiskLevelStatistics', {});
  const cachedData = await utils.getCache(cacheKey);
  if (cachedData) {
    console.log('从缓存返回风险等级统计数据');
    return utils.standardResponse(true, cachedData, null, 200);
  }

  const risksQuery = await db.collection('risk_library').get();
  const risks = risksQuery.data;

  const statistics = {
    critical: risks.filter(r => r.level === '重大风险').length,
    high: risks.filter(r => r.level === '较大风险').length,
    medium: risks.filter(r => r.level === '一般风险').length,
    low: risks.filter(r => r.level === '低风险').length
  };

  // 将数据存入缓存
  await utils.setCache(cacheKey, statistics, 30);

  return utils.standardResponse(true, statistics, null, 200);
}

// 获取风险趋势数据
async function getRiskTrend() {
  const utils = new CloudFunctionUtils();

  // 尝试从缓存获取数据（缓存有效期为1小时）
  const cacheKey = utils.generateCacheKey('manage-risk-getRiskTrend', {});
  const cachedData = await utils.getCache(cacheKey);
  if (cachedData) {
    console.log('从缓存返回风险趋势数据');
    return utils.standardResponse(true, cachedData, null, 200);
  }

  const risksQuery = await db.collection('risk_library').get();
  const risks = risksQuery.data;

  // 按月份分组统计风险
  const monthlyData = [];
  const now = new Date();

  // 获取最近6个月的数据
  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
    
    const monthRisks = risks.filter(r => {
      const riskDate = new Date(r.createdAt);
      const riskMonthStr = `${riskDate.getFullYear()}-${String(riskDate.getMonth() + 1).padStart(2, '0')}`;
      return riskMonthStr === monthStr;
    });

    monthlyData.push({
      month: monthStr,
      count: monthRisks.length,
      critical: monthRisks.filter(r => r.level === '重大风险').length,
      high: monthRisks.filter(r => r.level === '较大风险').length,
      medium: monthRisks.filter(r => r.level === '一般风险').length,
      low: monthRisks.filter(r => r.level === '低风险').length
    });
  }

  // 将数据存入缓存
  await utils.setCache(cacheKey, monthlyData, 60);

  return utils.standardResponse(true, monthlyData, null, 200);
}