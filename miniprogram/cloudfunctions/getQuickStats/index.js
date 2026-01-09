const cloud = require('wx-server-sdk');
const CloudFunctionUtils = require('../utils/cloudUtils');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const utils = new CloudFunctionUtils();

  try {
    console.log('快速统计查询请求');
    
    // 尝试从缓存获取数据（缓存有效期为3分钟）
    const cacheKey = utils.generateCacheKey('getQuickStats', event);
    const cachedData = await utils.getCache(cacheKey);
    if (cachedData) {
      console.log('从缓存返回快速统计数据');
      return utils.standardResponse(true, cachedData, null, 200);
    }

    // 从数据库查询实际数据
    const currentDate = new Date();
    const todayStr = currentDate.toISOString().split('T')[0];

    // 查询事故数据
    const incidentsQuery = await db.collection('incidents')
      .where({
        incidentDate: db.RegExp({
          regexp: todayStr,
          options: 'i'
        })
      })
      .count();

    // 查询风险数据
    const risksQuery = await db.collection('risk_library').get();
    const risks = risksQuery.data;

    // 查询隐患数据
    const hazardsQuery = await db.collection('dangers').get();
    const hazards = hazardsQuery.data;

    // 查询巡检数据
    const inspectionsQuery = await db.collection('inspections')
      .where({
        inspectionDate: db.RegExp({
          regexp: todayStr,
          options: 'i'
        })
      })
      .get();
    const inspections = inspectionsQuery.data;

    // 计算统计数据
    const totalRisks = risks.length;
    const criticalRisks = risks.filter(r => r.riskLevel === 1).length;
    const highRisks = risks.filter(r => r.riskLevel === 2).length;
    const mediumRisks = risks.filter(r => r.riskLevel === 3).length;
    const lowRisks = risks.filter(r => r.riskLevel === 4).length;

    const totalHazards = hazards.length;
    const pendingHazards = hazards.filter(h => h.status === 'pending' || h.status === '未处理').length;
    const completedHazards = hazards.filter(h => h.status === 'completed' || h.status === '已完成').length;

    const totalInspections = inspections.length;
    const completedInspections = inspections.filter(i => i.status === 'completed' || i.status === '已完成').length;
    const inspectionCompletionRate = totalInspections > 0 ? Math.round((completedInspections / totalInspections) * 100) : 100;

    // 构建返回数据
    const stats = {
      今日事故: incidentsQuery.total,
      风险等级: criticalRisks > 0 ? '危险' : highRisks > 0 ? '警告' : '正常',
      安全指数: calculateSafetyScore(incidentsQuery.total, criticalRisks, totalHazards),
      处理进度: `${completedHazards}/${totalHazards}`,
      巡检完成率: `${inspectionCompletionRate}%`,
      // 添加详细的统计数据
      总风险数: totalRisks,
      重大风险: criticalRisks,
      较高风险: highRisks,
      一般风险: mediumRisks,
      低风险: lowRisks,
      总隐患数: totalHazards,
      待处理隐患: pendingHazards,
      已完成隐患: completedHazards,
      今日巡检: totalInspections,
      更新时间: currentDate.toISOString()
    };

    // 将数据存入缓存
    await utils.setCache(cacheKey, stats, 3);

    console.log('快速统计数据处理完成');
    return utils.standardResponse(true, stats, null, 200);

  } catch (error) {
    console.error('快速统计查询失败:', error);
    return utils.standardResponse(false, null, '获取快速统计失败', 500);
  }
};

// 安全指数计算函数
function calculateSafetyScore(incidents, criticalRisks, hazards) {
  let score = 100;
  score -= incidents * 20; // 每起事故扣20分
  score -= criticalRisks * 15; // 每个重大风险扣15分
  score -= hazards * 2; // 每个隐患扣2分
  return Math.max(0, Math.min(100, score));
}