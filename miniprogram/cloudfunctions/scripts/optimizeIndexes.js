// 数据库索引优化脚本
// 为云函数中频繁使用的查询字段添加索引，提升查询性能
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

/**
 * 为各个集合添加必要的索引
 */
async function optimizeDatabaseIndexes() {
  console.log('开始优化数据库索引...');

  try {
    // 1. users 集合索引优化
    console.log('优化 users 集合索引...');
    await db.collection('users').createIndex('openid_idx', {
      openid: 1
    });
    console.log('已添加 users 集合 openid 索引');

    await db.collection('users').createIndex('role_createdAt_idx', {
      role: 1,
      createdAt: -1
    });
    console.log('已添加 users 集合 role + createdAt 复合索引');

    // 2. risk_assessments 集合索引优化
    console.log('优化 risk_assessments 集合索引...');
    await db.collection('risk_assessments').createIndex('openid_createdAt_idx', {
      openid: 1,
      createdAt: -1
    });
    console.log('已添加 risk_assessments 集合 openid + createdAt 复合索引');

    // 3. risk_library 集合索引优化
    console.log('优化 risk_library 集合索引...');
    await db.collection('risk_library').createIndex('level_status_idx', {
      riskLevel: 1,
      status: 1
    });
    console.log('已添加 risk_library 集合 riskLevel + status 复合索引');

    // 4. function_cache 集合索引优化
    console.log('优化 function_cache 集合索引...');
    await db.collection('function_cache').createIndex('timestamp_idx', {
      timestamp: 1
    });
    console.log('已添加 function_cache 集合 timestamp 索引');

    // 5. safety_inspections 集合索引优化
    console.log('优化 safety_inspections 集合索引...');
    await db.collection('safety_inspections').createIndex('inspector_createdAt_idx', {
      inspector: 1,
      createdAt: -1
    });
    console.log('已添加 safety_inspections 集合 inspector + createdAt 复合索引');

    console.log('\n数据库索引优化完成！');
    console.log('已为以下集合添加索引:');
    console.log('- users: openid_idx, role_createdAt_idx');
    console.log('- risk_assessments: openid_createdAt_idx');
    console.log('- risk_library: level_status_idx');
    console.log('- function_cache: timestamp_idx');
    console.log('- safety_inspections: inspector_createdAt_idx');

    return { success: true, message: '数据库索引优化完成' };

  } catch (err) {
    console.error('数据库索引优化失败:', err);
    return { success: false, error: err.message };
  }
}

// 脚本入口
if (require.main === module) {
  // 如果直接运行该脚本
  optimizeDatabaseIndexes().then(result => {
    console.log('\n脚本执行结果:', result);
    process.exit(result.success ? 0 : 1);
  });
}

// 导出函数供云函数调用
module.exports = { optimizeDatabaseIndexes };