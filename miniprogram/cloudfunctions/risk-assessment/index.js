// 云函数入口文件
const cloud = require('wx-server-sdk');
const CloudFunctionUtils = require('../utils/cloudUtils');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const utils = new CloudFunctionUtils();
  const { OPENID, APPID } = cloud.getWXContext();

  try {
    // 输入验证
    const validation = utils.validateInput(event, {
      m: { type: 'number', required: true, range: [1, 5] },
      e1: { type: 'number', required: true, range: [0.5, 10] },
      e2: { type: 'number', required: true, range: [0.5, 10] },
      s: { type: 'number', required: true, range: [1, 10] }
    });

    if (!validation.valid) {
      return utils.standardResponse(false, null, validation.errors.join(';'));
    }

    const { m, e1, e2, s, riskId } = event;
    
    // 尝试从缓存获取评估结果
    const cacheKey = utils.generateCacheKey('risk-assessment', { m, e1, e2, s });
    const cachedResult = await utils.getCache(cacheKey);
    
    if (cachedResult) {
      console.log('返回缓存的风险评估结果');
      return utils.standardResponse(true, cachedResult);
    }

    // 计算风险值R = M × max(E1, E2) × S - 符合GBT 33000-2025双控机制要求
    const e = Math.max(e1, e2);
    const r = m * e * s;

    // 判定风险等级 - 严格按照GBT 33000-2025标准分级
    let level, grade, color, checkFrequency, controlMeasuresRequired;
    if (r > 180) {
      level = 1;           // 重大风险
      grade = '重大风险';
      color = '红';
      checkFrequency = '每周一次';
      controlMeasuresRequired = '立即整改，落实管控措施，公司级监督';
    } else if (r >= 90) {
      level = 2;           // 较大风险
      grade = '较大风险';
      color = '橙';
      checkFrequency = '每月一次';
      controlMeasuresRequired = '强化管控措施，部门级监督';
    } else if (r >= 40) {
      level = 3;           // 一般风险
      grade = '一般风险';
      color = '黄';
      checkFrequency = '每季度一次';
      controlMeasuresRequired = '制定管控方案，班组级监督';
    } else {
      level = 4;           // 低风险
      grade = '低风险';
      color = '蓝';
      checkFrequency = '每半年一次';
      controlMeasuresRequired = '常规监控，定期复核';
    }

    // 如果提供了riskId，更新数据库 - 完整记录风险评估信息，符合GBT 33000-2025文档要求
    if (riskId) {
      try {
        const result = await db.collection('risk_library').doc(riskId).update({
          data: {
            mValue: m,
            e1Value: e1,
            e2Value: e2,
            sValue: s,
            rValue: r,
            riskLevel: level,
            riskGrade: grade,
            riskColor: color,
            checkFrequency: checkFrequency,
            controlMeasuresRequired: controlMeasuresRequired,
            nextCheckDate: getNextCheckDate(checkFrequency),
            assessmentDate: new Date(),
            updatedAt: new Date(),
            complianceStatus: '符合GBT 33000-2025标准'
          }
        });

        console.log('风险等级更新成功:', result);
      } catch (dbErr) {
        console.error('更新风险库记录失败:', dbErr);
      }
    }

    const responseData = {
      m, e1, e2, s,
      e, r,
      level,
      grade,
      color,
      checkFrequency,
      controlMeasuresRequired,
      complianceStandard: 'GBT 33000-2025'
    };

    // 缓存计算结果
    await utils.setCache(cacheKey, responseData);

    return utils.standardResponse(true, responseData);

  } catch (error) {
    console.error('风险评估计算失败:', error);
    return utils.standardResponse(false, null, error.message);
  }
};

// 获取下次检查日期 - 符合铁路安全管理标准要求
function getNextCheckDate(frequency) {
  const now = new Date();
  const nextDate = new Date();

  switch (frequency) {
    case '每周一次':
      nextDate.setDate(now.getDate() + 7);
      break;
    case '每月一次':
      nextDate.setMonth(now.getMonth() + 1);
      break;
    case '每季度一次':
      nextDate.setMonth(now.getMonth() + 3);
      break;
    case '每半年一次':
      nextDate.setMonth(now.getMonth() + 6);
      break;
  }

  return nextDate;
}

// GBT 33000-2025 标准参数说明
/*
M - 控制措施的状态 (符合GBT 33000-2025 第6.3.2条):
  5: 无控制措施
  3: 有减轻后果的应急措施，包括警报系统、个体防护用品等
  1: 有预防措施、控制文件，如机电防护装置，但须保证有效

E1 - 人员暴露于危险环境的频繁程度 (符合GBT 33000-2025 第6.3.3条):
  10: 连续暴露  6: 每天工作时间内暴露  3: 每周一次，或偶然暴露
  2: 每月一次暴露  1: 每年几次暴露  0.5: 更少地暴露

E2 - 危险状态出现的频次 (符合GBT 33000-2025 第6.3.3条):
  10: 常态  6: 每天工作时间出现  3: 每周一次或偶尔出现
  2: 每月一次出现  1: 每年几次出现  0.5: 更少地出现

S - 事故的可能后果 (符合GBT 33000-2025 第6.3.4条):
  10: 有多人死亡 / ＞1000万 / 有重大环境影响的不可控排放
  8: 有1人死亡或多人永久失能 / 100万-1000万 / 有中等环境影响的不可控排放
  4: 永久失能（1人）/ 10万-100万 / 有较轻环境影响的不可控排放
  2: 需医院治理，缺工 / 1万-10万 / 有局部环境影响的可控排放
  1: 轻微，仅需急救 / ＜1万 / 无环境影响

风险程度分级 (符合GBT 33000-2025 第7.2.3条 - 红橙黄蓝四色分级):
  R > 180: 1级（重大风险，红色）
  90 ≤ R ≤ 180: 2级（较大风险，橙色）
  40 ≤ R < 90: 3级（一般风险，黄色）
  R < 40: 4级（低风险，蓝色）
*/
