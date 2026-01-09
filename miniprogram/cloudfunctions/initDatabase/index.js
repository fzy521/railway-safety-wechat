const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    console.log('开始初始化数据库...');

    // 创建用户集合
    await db.collection('users').add({
      data: {
        userId: 'admin',
        username: '管理员',
        role: 'admin',
        department: '安全管理部门',
        createdAt: new Date()
      }
    }).catch(err => console.log('用户记录已存在:', err));

    // 创建安全指标集合
    await db.collection('safety_metrics').add({
      data: {
        date: new Date().toISOString().split('T')[0],
        totalIncidents: 0,
        totalRisks: 15,
        majorRisks: 2,
        safetyScore: 92,
        createdAt: new Date()
      }
    }).catch(err => console.log('安全指标记录已存在:', err));

    // 创建事故记录集合
    await db.collection('incidents').add({
      data: {
        incidentType: '设备故障',
        severity: '一般',
        location: '邹平站场',
        incidentDate: new Date().toISOString().split('T')[0],
        description: '设备温度异常',
        status: '已处理',
        createdAt: new Date()
      }
    }).catch(err => console.log('事故记录已存在:', err));

    // 创建风险库集合
    const riskData = [
      { riskLevel: 1, riskType: '设备风险', description: '设备老化风险', location: '邹平站场', createdAt: new Date() },
      { riskLevel: 1, riskType: '安全风险', description: '安全防护缺失', location: '装卸作业区', createdAt: new Date() },
      { riskLevel: 2, riskType: '操作风险', description: '操作不规范', location: '专用线区间', createdAt: new Date() },
      { riskLevel: 2, riskType: '环境风险', description: '环境恶劣', location: '货场线', createdAt: new Date() },
      { riskLevel: 3, riskType: '管理风险', description: '管理制度不完善', location: '管理部门', createdAt: new Date() }
    ];
    for (const risk of riskData) {
      await db.collection('risk_library').add({ data: risk }).catch(err => console.log('风险记录已存在:', err));
    }

    // 创建隐患库集合
    const hazardData = [
      { status: 'completed', type: '设备隐患', description: '设备螺丝松动', location: '邹平站场', createdAt: new Date() },
      { status: 'pending', type: '安全隐患', description: '安全警示标识缺失', location: '装卸作业区', createdAt: new Date() },
      { status: 'completed', type: '环境隐患', description: '地面不平', location: '专用线区间', createdAt: new Date() }
    ];
    for (const hazard of hazardData) {
      await db.collection('hidden_danger_library').add({ data: hazard }).catch(err => console.log('隐患记录已存在:', err));
    }

    // 创建检查记录集合
    const inspectionData = [
      { inspectionDate: new Date().toISOString().split('T')[0], status: 'completed', result: 'pass', inspector: '张三', location: '邹平站场', createdAt: new Date() },
      { inspectionDate: new Date().toISOString().split('T')[0], status: 'pending', result: 'pending', inspector: '李四', location: '装卸作业区', createdAt: new Date() },
      { inspectionDate: new Date().toISOString().split('T')[0], status: 'completed', result: 'pass', inspector: '王五', location: '专用线区间', createdAt: new Date() }
    ];
    for (const inspection of inspectionData) {
      await db.collection('inspections').add({ data: inspection }).catch(err => console.log('检查记录已存在:', err));
    }

    // 创建系统配置集合
    await db.collection('system_config').add({
      data: {
        configKey: 'system_settings',
        configValue: { version: '1.0.0', safetyThreshold: 80 },
        createdAt: new Date()
      }
    }).catch(err => console.log('系统配置已存在:', err));

    // 创建设备数据集合
    await db.collection('devices').add({
      data: {
        deviceId: 'DEV001',
        name: '温度传感器',
        location: '邹平站场',
        status: 'online',
        lastHeartbeat: new Date(),
        createdAt: new Date()
      }
    }).catch(err => console.log('设备记录已存在:', err));
    await db.collection('devices').add({
      data: {
        deviceId: 'DEV002',
        name: '视频监控',
        location: '装卸作业区',
        status: 'online',
        lastHeartbeat: new Date(),
        createdAt: new Date()
      }
    }).catch(err => console.log('设备记录已存在:', err));
    await db.collection('devices').add({
      data: {
        deviceId: 'DEV003',
        name: '烟雾报警器',
        location: '专用线区间',
        status: 'offline',
        lastHeartbeat: new Date(Date.now() - 3600000),
        createdAt: new Date()
      }
    }).catch(err => console.log('设备记录已存在:', err));

    console.log('数据库初始化完成！');
    return { success: true, message: '数据库初始化完成' };

  } catch (error) {
    console.error('数据库初始化失败:', error);
    return { success: false, message: '数据库初始化失败', error };
  }
};