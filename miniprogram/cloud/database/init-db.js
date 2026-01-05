// 数据库初始化脚本
// 用于创建双控机制所需的数据集合和索引

const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  try {
    console.log('开始初始化双控机制数据库...')

    // 1. 创建风险库（如果还不存在会自动创建）
    await createRiskLibraryIndexes()
    console.log('✅ risk_library 集合索引创建完成')

    // 2. 创建隐患库
    await createDangerLibraryIndexes()
    console.log('✅ hidden_danger_library 集合索引创建完成')

    // 3. 创建风险预警表
    await createRiskWarningsCollection()
    console.log('✅ risk_warnings 集合创建完成')

    // 4. 创建检查记录表
    await createCheckRecordsCollection()
    console.log('✅ check_records 集合创建完成')

    // 5. 创建督办记录表
    await createSupervisionRecordsCollection()
    console.log('✅ supervision_records 集合创建完成')

    console.log('数据库初始化完成！')

    return {
      success: true,
      message: '双控机制数据库初始化成功'
    }

  } catch (error) {
    console.error('数据库初始化失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// 创建风险库索引
async function createRiskLibraryIndexes() {
  // 创建复合索引以支持按部门和地点查询
  await db.collection('risk_library').createIndex({
    manage_dept: 1,
    location: 1,
    risk_level: 1
  })

  // 创建索引支持按颜色查询
  await db.collection('risk_library').createIndex({
    risk_color: 1,
    status: 1
  })

  // 创建索引支持按检查日期查询
  await db.collection('risk_library').createIndex({
    next_check_date: 1
  })

  console.log('  - risk_library 索引创建完成')
}

// 创建隐患库索引
async function createDangerLibraryIndexes() {
  // 按状态和等级索引
  await db.collection('hidden_danger_library').createIndex({
    status: 1,
    danger_level: 1
  })

  // 按责任部门索引
  await db.collection('hidden_danger_library').createIndex({
    responsible_dept: 1,
    status: 1
  })

  // 按计划完成日期索引（用于超期检查）
  await db.collection('hidden_danger_library').createIndex({
    planned_complete_date: 1,
    is_supervised: 1
  })

  // 按发现日期索引（用于报表统计）
  await db.collection('hidden_danger_library').createIndex({
    discovery_date: 1
  })

  console.log('  - hidden_danger_library 索引创建完成')
}

// 创建风险预警集合
async function createRiskWarningsCollection() {
  // 检查集合是否存在
  try {
    await db.collection('risk_warnings').limit(1).get()
    console.log('  - risk_warnings 集合已存在')
  } catch (e) {
    // 如果集合不存在，会自动创建
    console.log('  - risk_warnings 集合将在首次写入时创建')
  }

  // 创建索引
  await db.collection('risk_warnings').createIndex({
    warning_level: 1,
    status: 1
  })

  await db.collection('risk_warnings').createIndex({
    target_unit: 1,
    deadline: 1
  })
}

// 创建检查记录集合
async function createCheckRecordsCollection() {
  await db.collection('check_records').createIndex({
    check_type: 1,
    check_date: 1
  })

  await db.collection('check_records').createIndex({
    check_dept: 1,
    check_date: 1
  })
}

// 创建督办记录集合
async function createSupervisionRecordsCollection() {
  await db.collection('supervision_records').createIndex({
    danger_id: 1
  })

  await db.collection('supervision_records').createIndex({
    supervision_level: 1,
    status: 1
  })
}

// 测试数据插入（可选）
exports.insertTestData = async (event, context) => {
  const { collection } = event

  try {
    let result

    switch (collection) {
      case 'risk_library':
        result = await insertTestRiskData()
        break
      case 'hidden_danger_library':
        result = await insertTestDangerData()
        break
      default:
        throw new Error('未知的集合名称')
    }

    return {
      success: true,
      data: result
    }

  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

// 插入测试风险数据
async function insertTestRiskData() {
  const testRisks = [
    {
      riskName: '轨道连接螺栓松动',
      riskType: '设备类',
      operationLink: '轨道巡检',
      location: '邹平站场 K15+300',
      mValue: 1,
      e1Value: 3,
      e2Value: 2,
      sValue: 4,
      rValue: 12,
      riskLevel: 4,
      riskGrade: '低风险',
      riskColor: '蓝',
      controlMeasures: '每班巡检，发现松动立即紧固',
      controlPerson: '巡检员',
      manageMeasures: '每月专项检查，建立台账',
      manageDept: '工务段',
      managePerson: '工务段长',
      checkFrequency: '每半年一次',
      identificationDate: new Date('2025-01-01'),
      identificationMethod: '作业安全分析法',
      nextReviewDate: new Date('2025-07-01'),
      status: 'active'
    },
    {
      riskName: '接触网支柱基础开裂',
      riskType: '设备类',
      operationLink: '接触网维护',
      location: '专用线 K8+200',
      mValue: 3,
      e1Value: 2,
      e2Value: 1,
      sValue: 8,
      rValue: 48,
      riskLevel: 3,
      riskGrade: '一般风险',
      riskColor: '黄',
      controlMeasures: '加强巡视，监测裂缝发展',
      controlPerson: '接触网工',
      manageMeasures: '制定加固方案，必要时更换支柱',
      manageDept: '供电段',
      managePerson: '供电段长',
      checkFrequency: '每季度一次',
      identificationDate: new Date('2025-01-01'),
      identificationMethod: '安全检查表法',
      nextReviewDate: new Date('2025-04-01'),
      status: 'active'
    },
    {
      riskName: '道口防护设备故障',
      riskType: '设备类',
      operationLink: '道口作业',
      location: '邹平站场道口',
      mValue: 3,
      e1Value: 6,
      e2Value: 6,
      sValue: 8,
      rValue: 144,
      riskLevel: 2,
      riskGrade: '较大风险',
      riskColor: '橙',
      controlMeasures: '每日检查防护设备，发现故障立即停用',
      controlPerson: '道口员',
      manageMeasures: '建立防护设备台账，定期更换老化设备',
      manageDept: '安全监察部',
      managePerson: '安全监察部长',
      checkFrequency: '每月一次',
      identificationDate: new Date('2025-01-01'),
      identificationMethod: '作业安全分析法',
      nextReviewDate: new Date('2025-02-01'),
      status: 'active'
    },
    {
      riskName: '调车作业人员违规操作',
      riskType: '行为类',
      operationLink: '调车作业',
      location: '邹平站场',
      mValue: 5,
      e1Value: 6,
      e2Value: 6,
      sValue: 10,
      rValue: 300,
      riskLevel: 1,
      riskGrade: '重大风险',
      riskColor: '红',
      controlMeasures: '严格执行作业标准，加强现场监督',
      controlPerson: '调车长',
      manageMeasures: '开展安全培训，建立违章处罚制度',
      manageDept: '运输部',
      managePerson: '运输部长',
      checkFrequency: '每周一次',
      identificationDate: new Date('2025-01-01'),
      identificationMethod: '作业安全分析法',
      nextReviewDate: new Date('2025-01-15'),
      status: 'active'
    }
  ]

  const results = []
  for (const risk of testRisks) {
    const result = await db.collection('risk_library').add({
      data: {
        ...risk,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    results.push(result)
  }

  return results
}

// 插入测试隐患数据
async function insertTestDangerData() {
  const testDangers = [
    {
      dangerLocation: '邹平站场',
      dangerPart: '轨道连接螺栓',
      dangerLevel: '一般隐患',
      dangerCategory: '行车安全',
      dangerDescription: '5处轨道连接螺栓有松动现象',
      dangerStatus: '螺栓松动，存在脱轨风险',
      causeAnalysis: '日常巡检不到位，螺栓紧固周期过长',
      hazardAnalysis: '可能导致轨道变形，影响行车安全，整改难度中等',
      treatmentPlan: '制定专项整改方案，全面检查并紧固所有螺栓',
      treatmentMeasures: '立即组织人员紧固，建立定期检查制度',
      responsibleDept: '工务段',
      responsiblePerson: '工务段长',
      supervisionPerson: '安全监察员',
      plannedCompleteDate: new Date('2025-01-15'),
      actualCompleteDate: null,
      completionCriteria: '所有螺栓紧固到位，无松动现象',
      verificationMethod: '现场检查+扭矩测试',
      verificationResult: null,
      verificationPerson: null,
      verificationDate: null,
      isMajorDanger: false,
      isSupervised: false,
      supervisionLevel: null,
      supervisionStatus: null,
      discoveryDate: new Date('2025-01-05'),
      discoverer: '巡检员张三',
      findMethod: '日常排查',
      inDangerLibrary: true,
      status: '整改中',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      dangerLocation: '专用线 K8+200',
      dangerPart: '接触网支柱基础',
      dangerLevel: '重大隐患',
      dangerCategory: '行车安全',
      dangerDescription: '接触网支柱基础出现严重裂缝，存在倾倒风险',
      dangerStatus: '基础开裂严重，裂缝宽度超过5mm',
      causeAnalysis: '地质沉降，基础设计标准不足',
      hazardAnalysis: '可能导致支柱倾倒，影响接触网供电，危及行车安全，整改难度大',
      treatmentPlan: '制定专项治理方案，采取加固措施或更换支柱',
      treatmentMeasures: '立即设置警戒区，制定加固方案，组织专家评审',
      responsibleDept: '供电段',
      responsiblePerson: '供电段长',
      supervisionPerson: '公司分管安全副总',
      plannedCompleteDate: new Date('2025-04-05'),
      actualCompleteDate: null,
      completionCriteria: '基础加固完成，裂缝稳定，支柱垂直度符合要求',
      verificationMethod: '第三方检测+专家验收',
      verificationResult: null,
      verificationPerson: null,
      verificationDate: null,
      isMajorDanger: true,
      isSupervised: true,
      supervisionLevel: '公司级',
      supervisionStatus: '督办中',
      discoveryDate: new Date('2025-01-05'),
      discoverer: '接触网工李四',
      findMethod: '专项排查',
      inDangerLibrary: true,
      status: '整改中',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]

  const results = []
  for (const danger of testDangers) {
    const result = await db.collection('hidden_danger_library').add({
      data: danger
    })
    results.push(result)
  }

  return results
}
