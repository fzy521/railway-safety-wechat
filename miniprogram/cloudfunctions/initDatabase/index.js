// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    console.log('开始初始化数据库...')

    // 创建用户集合
    console.log('创建用户集合...')
    await db.createCollection('users')

    // 创建安全指标集合
    console.log('创建安全指标集合...')
    await db.createCollection('safety_metrics')

    // 创建事故记录集合
    console.log('创建事故记录集合...')
    await db.createCollection('incidents')

    // 创建风险评估集合
    console.log('创建风险评估集合...')
    await db.createCollection('risk_assessments')

    // 创建巡检记录集合
    console.log('创建巡检记录集合...')
    await db.createCollection('inspections')

    // 创建风险库集合
    console.log('创建风险库集合...')
    await db.createCollection('risk_library')

    // 创建隐患库集合
    console.log('创建隐患库集合...')
    await db.createCollection('hidden_danger_library')

    // 创建检查记录集合
    console.log('创建检查记录集合...')
    await db.createCollection('check_records')

    // 创建系统配置集合
    console.log('创建系统配置集合...')
    await db.createCollection('system_config')

    console.log('数据库初始化完成')

    return {
      success: true,
      message: '数据库初始化成功'
    }

  } catch (error) {
    console.error('数据库初始化失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}