const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { m, e1, e2, s, riskId } = event;
  const { OPENID, APPID } = cloud.getWXContext()

  try {
    // 验证输入参数
    if (!m || !e1 || !e2 || !s) {
      return {
        success: false,
        error: '缺少必要的评估参数'
      };
    }

    // 计算风险值R = M × max(E1, E2) × S
    const e = Math.max(e1, e2);
    const r = m * e * s;

    // 判定风险等级
    let level, grade, color, checkFrequency;
    if (r > 180) {
      level = 1;
      grade = '重大风险';
      color = '红';
      checkFrequency = '每周一次';
    } else if (r >= 90) {
      level = 2;
      grade = '较大风险';
      color = '橙';
      checkFrequency = '每月一次';
    } else if (r >= 40) {
      level = 3;
      grade = '一般风险';
      color = '黄';
      checkFrequency = '每季度一次';
    } else {
      level = 4;
      grade = '低风险';
      color = '蓝';
      checkFrequency = '每半年一次';
    }

    // 如果提供了riskId，更新数据库
    if (riskId) {
      const db = cloud.database();
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
          nextCheckDate: getNextCheckDate(checkFrequency),
          updatedAt: new Date()
        }
      });

      console.log('风险等级更新成功:', result);
    }

    return {
      success: true,
      data: {
        m, e1, e2, s,
        e, r,
        level,
        grade,
        color,
        checkFrequency
      }
    };

  } catch (error) {
    console.error('风险评估计算失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// 获取下次检查日期
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

// MES参数说明
/*
M - 控制措施的状态:
  5: 无控制措施
  3: 有减轻后果的应急措施，包括警报系统、个体防护用品等
  1: 有预防措施、控制文件，如机电防护装置，但须保证有效

E1 - 人员暴露于危险环境的频繁程度:
  10: 连续暴露  6: 每天工作时间内暴露  3: 每周一次，或偶然暴露
  2: 每月一次暴露  1: 每年几次暴露  0.5: 更少地暴露

E2 - 危险状态出现的频次:
  10: 常态  6: 每天工作时间出现  3: 每周一次或偶尔出现
  2: 每月一次出现  1: 每年几次出现  0.5: 更少地出现

S - 事故的可能后果:
  10: 有多人死亡 / ＞1000万 / 有重大环境影响的不可控排放
  8: 有1人死亡或多人永久失能 / 100万-1000万 / 有中等环境影响的不可控排放
  4: 永久失能（1人）/ 10万-100万 / 有较轻环境影响的不可控排放
  2: 需医院治理，缺工 / 1万-10万 / 有局部环境影响的可控排放
  1: 轻微，仅需急救 / ＜1万 / 无环境影响

风险程度:
  R > 180: 1级（重大风险，红色）
  90-150: 2级（较大风险，橙色）
  40-80: 3级（一般风险，黄色）
  ≤38: 4级（低风险，蓝色）
*/
