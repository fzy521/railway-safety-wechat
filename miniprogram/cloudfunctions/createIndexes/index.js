const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    console.log('开始创建数据库索引...');

    const results = [];

    // 1. 风险库索引
    try {
      await db.collection('risk_library').createIndex({
        keys: { createdAt: -1 }
      });
      results.push({ collection: 'risk_library', index: 'createdAt: -1', status: 'success' });
      console.log('✓ 风险库索引创建成功: createdAt');
    } catch (err) {
      results.push({ collection: 'risk_library', index: 'createdAt: -1', status: 'error', error: err.message });
      console.log('✗ 风险库索引创建失败:', err.message);
    }

    try {
      await db.collection('risk_library').createIndex({
        keys: { riskLevel: 1 }
      });
      results.push({ collection: 'risk_library', index: 'riskLevel: 1', status: 'success' });
      console.log('✓ 风险库索引创建成功: riskLevel');
    } catch (err) {
      results.push({ collection: 'risk_library', index: 'riskLevel: 1', status: 'error', error: err.message });
      console.log('✗ 风险库索引创建失败:', err.message);
    }

    try {
      await db.collection('risk_library').createIndex({
        keys: { manage_dept: 1 }
      });
      results.push({ collection: 'risk_library', index: 'manage_dept: 1', status: 'success' });
      console.log('✓ 风险库索引创建成功: manage_dept');
    } catch (err) {
      results.push({ collection: 'risk_library', index: 'manage_dept: 1', status: 'error', error: err.message });
      console.log('✗ 风险库索引创建失败:', err.message);
    }

    // 2. 隐患库索引
    try {
      await db.collection('hidden_danger_library').createIndex({
        keys: { status: 1 }
      });
      results.push({ collection: 'hidden_danger_library', index: 'status: 1', status: 'success' });
      console.log('✓ 隐患库索引创建成功: status');
    } catch (err) {
      results.push({ collection: 'hidden_danger_library', index: 'status: 1', status: 'error', error: err.message });
      console.log('✗ 隐患库索引创建失败:', err.message);
    }

    try {
      await db.collection('hidden_danger_library').createIndex({
        keys: { dangerLevel: 1 }
      });
      results.push({ collection: 'hidden_danger_library', index: 'dangerLevel: 1', status: 'success' });
      console.log('✓ 隐患库索引创建成功: dangerLevel');
    } catch (err) {
      results.push({ collection: 'hidden_danger_library', index: 'dangerLevel: 1', status: 'error', error: err.message });
      console.log('✗ 隐患库索引创建失败:', err.message);
    }

    try {
      await db.collection('hidden_danger_library').createIndex({
        keys: { discoveryDate: -1 }
      });
      results.push({ collection: 'hidden_danger_library', index: 'discoveryDate: -1', status: 'success' });
      console.log('✓ 隐患库索引创建成功: discoveryDate');
    } catch (err) {
      results.push({ collection: 'hidden_danger_library', index: 'discoveryDate: -1', status: 'error', error: err.message });
      console.log('✗ 隐患库索引创建失败:', err.message);
    }

    // 3. 事故记录索引
    try {
      await db.collection('incidents').createIndex({
        keys: { incidentDate: -1 }
      });
      results.push({ collection: 'incidents', index: 'incidentDate: -1', status: 'success' });
      console.log('✓ 事故记录索引创建成功: incidentDate');
    } catch (err) {
      results.push({ collection: 'incidents', index: 'incidentDate: -1', status: 'error', error: err.message });
      console.log('✗ 事故记录索引创建失败:', err.message);
    }

    try {
      await db.collection('incidents').createIndex({
        keys: { status: 1 }
      });
      results.push({ collection: 'incidents', index: 'status: 1', status: 'success' });
      console.log('✓ 事故记录索引创建成功: status');
    } catch (err) {
      results.push({ collection: 'incidents', index: 'status: 1', status: 'error', error: err.message });
      console.log('✗ 事故记录索引创建失败:', err.message);
    }

    // 4. 检查记录索引
    try {
      await db.collection('check_records').createIndex({
        keys: { checkDate: -1 }
      });
      results.push({ collection: 'check_records', index: 'checkDate: -1', status: 'success' });
      console.log('✓ 检查记录索引创建成功: checkDate');
    } catch (err) {
      results.push({ collection: 'check_records', index: 'checkDate: -1', status: 'error', error: err.message });
      console.log('✗ 检查记录索引创建失败:', err.message);
    }

    try {
      await db.collection('check_records').createIndex({
        keys: { status: 1 }
      });
      results.push({ collection: 'check_records', index: 'status: 1', status: 'success' });
      console.log('✓ 检查记录索引创建成功: status');
    } catch (err) {
      results.push({ collection: 'check_records', index: 'status: 1', status: 'error', error: err.message });
      console.log('✗ 检查记录索引创建失败:', err.message);
    }

    // 5. 风险预警索引
    try {
      await db.collection('risk_warnings').createIndex({
        keys: { warningLevel: 1 }
      });
      results.push({ collection: 'risk_warnings', index: 'warningLevel: 1', status: 'success' });
      console.log('✓ 风险预警索引创建成功: warningLevel');
    } catch (err) {
      results.push({ collection: 'risk_warnings', index: 'warningLevel: 1', status: 'error', error: err.message });
      console.log('✗ 风险预警索引创建失败:', err.message);
    }

    try {
      await db.collection('risk_warnings').createIndex({
        keys: { status: 1 }
      });
      results.push({ collection: 'risk_warnings', index: 'status: 1', status: 'success' });
      console.log('✓ 风险预警索引创建成功: status');
    } catch (err) {
      results.push({ collection: 'risk_warnings', index: 'status: 1', status: 'error', error: err.message });
      console.log('✗ 风险预警索引创建失败:', err.message);
    }

    // 6. 证书管理索引
    try {
      await db.collection('certificates').createIndex({
        keys: { expiryDate: 1 }
      });
      results.push({ collection: 'certificates', index: 'expiryDate: 1', status: 'success' });
      console.log('✓ 证书管理索引创建成功: expiryDate');
    } catch (err) {
      results.push({ collection: 'certificates', index: 'expiryDate: 1', status: 'error', error: err.message });
      console.log('✗ 证书管理索引创建失败:', err.message);
    }

    try {
      await db.collection('certificates').createIndex({
        keys: { status: 1 }
      });
      results.push({ collection: 'certificates', index: 'status: 1', status: 'success' });
      console.log('✓ 证书管理索引创建成功: status');
    } catch (err) {
      results.push({ collection: 'certificates', index: 'status: 1', status: 'error', error: err.message });
      console.log('✗ 证书管理索引创建失败:', err.message);
    }

    // 7. 设备索引
    try {
      await db.collection('devices').createIndex({
        keys: { status: 1 }
      });
      results.push({ collection: 'devices', index: 'status: 1', status: 'success' });
      console.log('✓ 设备索引创建成功: status');
    } catch (err) {
      results.push({ collection: 'devices', index: 'status: 1', status: 'error', error: err.message });
      console.log('✗ 设备索引创建失败:', err.message);
    }

    try {
      await db.collection('devices').createIndex({
        keys: { location: 1 }
      });
      results.push({ collection: 'devices', index: 'location: 1', status: 'success' });
      console.log('✓ 设备索引创建成功: location');
    } catch (err) {
      results.push({ collection: 'devices', index: 'location: 1', status: 'error', error: err.message });
      console.log('✗ 设备索引创建失败:', err.message);
    }

    // 8. 用户索引
    try {
      await db.collection('users').createIndex({
        keys: { role: 1 }
      });
      results.push({ collection: 'users', index: 'role: 1', status: 'success' });
      console.log('✓ 用户索引创建成功: role');
    } catch (err) {
      results.push({ collection: 'users', index: 'role: 1', status: 'error', error: err.message });
      console.log('✗ 用户索引创建失败:', err.message);
    }

    try {
      await db.collection('users').createIndex({
        keys: { department: 1 }
      });
      results.push({ collection: 'users', index: 'department: 1', status: 'success' });
      console.log('✓ 用户索引创建成功: department');
    } catch (err) {
      results.push({ collection: 'users', index: 'department: 1', status: 'error', error: err.message });
      console.log('✗ 用户索引创建失败:', err.message);
    }

    // 统计成功和失败的数量
    const successCount = results.filter(r => r.status === 'success').length;
    const failCount = results.filter(r => r.status === 'error').length;

    console.log(`\n索引创建完成！`);
    console.log(`成功: ${successCount} 个`);
    console.log(`失败: ${failCount} 个`);

    return {
      success: true,
      message: `索引创建完成！成功: ${successCount} 个，失败: ${failCount} 个`,
      results: results
    };

  } catch (error) {
    console.error('创建索引失败:', error);
    return {
      success: false,
      message: '创建索引失败',
      error: error.message
    };
  }
};