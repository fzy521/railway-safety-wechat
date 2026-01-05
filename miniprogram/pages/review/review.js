const app = getApp()

Page({
  /**
   * 页面的初始数据 - GBT 33000-2025 管理评审与持续改进
   */
  data: {
    // 管理评审计划
    reviewPlans: [],
    // 管理评审报告
    reviewReports: [],
    // 不符合项和改进措施
    improvementItems: [],
    // 统计数据
    statistics: {
      totalPlans: 0,
      completedReviews: 0,
      pendingItems: 0,
      completedImprovements: 0
    },
    activeTab: 'plans' // plans, reports, improvements
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.loadReviewData()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 6 // 如果添加到tabBar
      })
    }
  },

  /**
   * 加载评审数据
   */
  loadReviewData() {
    wx.showLoading({ title: '加载中...' })

    // 模拟管理评审计划 - GBT 33000-2025 5.9
    const mockPlans = [
      {
        id: 'RP001',
        name: '2024年度安全生产标准化管理体系评审',
        type: 'annual',
        typeName: '年度评审',
        year: 2024,
        plannedDate: '2024-12-30',
        responsibleDept: '安全管理部门',
        responsiblePerson: '安全总监_李',
        participants: '管理层、各部门负责人、安全员',
        reviewScope: 'GBT 33000-2025全部10个要素',
        reviewBasis: '管理体系运行情况、法律法规合规性、事故/事件分析',
        status: 'planned',
        statusText: '计划中',
        reviewFocus: [ // 评审重点
          '领导作用和承诺落实情况',
          '安全风险分级管控效果',
          '隐患排查治理闭环率',
          '应急准备和响应能力',
          '人员培训和持证情况',
          '持续改进机制有效性'
        ],
        notes: '根据GBT 33000-2025 5.9.2条款要求，每年至少进行一次评审'
      },
      {
        id: 'RP002',
        name: '2024年下半年管理评审',
        type: 'semi-annual',
        typeName: '半年评审',
        year: 2024,
        plannedDate: '2024-12-20',
        responsibleDept: '总经理办公室',
        responsiblePerson: '总经理',
        participants: '高层管理人员',
        reviewScope: '半年度安全目标完成情况',
        reviewBasis: '半年度安全绩效数据',
        status: 'completed',
        statusText: '已完成',
        reviewFocus: [
          '安全目标指标完成情况',
          '重大风险管控效果',
          '重大隐患整改情况'
        ],
        actualDate: '2024-12-20',
        conclusion: '体系运行基本有效，需加强冬季安全管理',
        notes: '针对冬季特点提出强化措施'
      },
      {
        id: 'RP003',
        name: '接触网事故后专项评审',
        type: 'special',
        typeName: '专项评审',
        plannedDate: '2024-11-15',
        responsibleDept: '安全管理部门',
        responsiblePerson: '技术经理_陈',
        participants: '技术专家、电力部门、安全管理部门',
        reviewScope: '接触网作业安全管理体系',
        reviewBasis: '事故调查报告、风险重新评估',
        status: 'completed',
        statusText: '已完成',
        reviewFocus: [
          '事故根本原因分析',
          '风险控制措施有效性',
          '操作规程完善性',
          '人员操作规范性'
        ],
        actualDate: '2024-11-15',
        conclusion: '作业规程需完善，加强人员培训',
        notes: '事故后评审，提出系统性改进措施'
      }
    ]

    // 模拟管理评审报告
    const mockReports = [
      {
        id: 'RR001',
        planId: 'RP002',
        planName: '2024年下半年管理评审',
        reportDate: '2024-12-20',
        submitter: '安全总监_李',
        approver: '总经理',
        approveDate: '2024-12-20',
        content: {
          performance: [ // 绩效评价
            {
              indicator: '事故发生率',
              target: '下降10%',
              actual: '下降15%',
              status: 'exceed'
            },
            {
              indicator: '隐患整改率',
              target: '≥95%',
              actual: '98%',
              status: 'meet'
            },
            {
              indicator: '培训完成率',
              target: '100%',
              actual: '95%',
              status: 'partial'
            }
          ],
          findings: [ // 存在的问题
            '部分员工安全意识仍需提高',
            '应急预案演练频次不足',
            '冬季防寒措施需加强',
            '部分设备老化需更新'
          ],
          conclusions: '体系总体有效，需持续改进',
          recommendations: [ // 改进建议
            '增加安全培训频次',
            '提高应急演练频率',
            '加强设备维护保养',
            '完善冬季安全管理制度'
          ]
        },
        status: 'approved',
        statusText: '已批准',
        distribution: '管理层、各部门负责人',
        implementationDeadline: '2025-01-31' // 实施期限
      }
    ]

    // 模拟不符合项和改进措施 - GBT 33000-2025 5.10
    const mockImprovements = [
      {
        id: 'IMP001',
        type: 'non-conformity', // 不符合项
        typeName: '不符合项',
        title: '应急预案演练频率不足',
        source: '管理评审',
        sourceReport: 'RR001',
        discoveryDate: '2024-12-20',
        responsibleDept: '安全管理部门',
        responsiblePerson: '安全总监_李',
        currentStatus: 'treating', // 整改中
        statusText: '整改中',
        priority: 'high', // 高优先级
        description: '根据规定每年至少组织2次综合应急演练，上半年仅完成1次',
        rootCause: '演练组织工作量大，协调困难',
        correctiveActions: [ // 纠正措施
          '增加演练频次至每季度1次',
          '简化演练流程，提高组织效率',
          '建立演练计划提前申报制度'
        ],
        completionCriteria: '完成2025年度演练计划并实施至少2次',
        plannedCompleteDate: '2025-06-30',
        actualProgress: '已制定2025年度演练计划',
        effectivenessVerification: '通过演练记录验证',
        notes: 'GBT 33000-2025 5.10.2要求'
      },
      {
        id: 'IMP002',
        type: 'improvement-opportunity', // 改进机会
        typeName: '改进机会',
        title: '安全培训内容需更新',
        source: '员工反馈',
        sourceReport: '员工满意度调查',
        discoveryDate: '2024-12-15',
        responsibleDept: '人力资源部',
        responsiblePerson: '培训主管_王',
        currentStatus: 'treating',
        statusText: '实施中',
        priority: 'medium',
        description: '培训内容与实际工作结合不够紧密，员工参与度不高',
        rootCause: '培训需求调研不够充分',
        correctiveActions: [
          '开展培训需求调研',
          '更新培训教材，增加案例分析',
          '引入互动式培训方法'
        ],
        completionCriteria: '完成新教材编制并实施，员工满意度提升20%',
        plannedCompleteDate: '2025-03-31',
        actualProgress: '已完成需求调研，正在编制新教材',
        effectivenessVerification: '通过问卷调查和考核成绩验证',
        notes: '持续改进机制'
      },
      {
        id: 'IMP003',
        type: 'preventive-action', // 预防措施
        typeName: '预防措施',
        title: '防止接触网支柱基础开裂',
        source: '风险评估',
        sourceReport: '安全风险评估报告',
        discoveryDate: '2024-12-18',
        responsibleDept: '电力部门',
        responsiblePerson: '技术经理_陈',
        currentStatus: 'completed',
        statusText: '已完成',
        priority: 'high',
        description: '接触网支柱基础存在开裂隐患，可能引发安全事故',
        rootCause: '地基沉降、材料老化、设计缺陷',
        correctiveActions: [
          '全面检测所有接触网支柱基础',
          '对存在问题的支柱进行加固处理',
          '建立定期检测制度，每季度检查一次',
          '改进设计，提高基础承载能力'
        ],
        completionCriteria: '完成全部支柱检测和加固，建立检测制度',
        plannedCompleteDate: '2024-12-25',
        actualCompleteDate: '2024-12-22',
        actualProgress: '已完成全部检测和加固',
        effectivenessVerification: '通过现场检查和监测数据验证',
        verificationPerson: '安全总监_李',
        verificationDate: '2024-12-23',
        verificationResult: '合格',
        notes: '重大风险预防措施，GBT 33000-2025 5.4.4要求'
      }
    ]

    this.setData({
      reviewPlans: mockPlans,
      reviewReports: mockReports,
      improvementItems: mockImprovements,
      statistics: {
        totalPlans: mockPlans.length,
        completedReviews: mockPlans.filter(p => p.status === 'completed').length,
        pendingItems: mockImprovements.filter(i => i.currentStatus !== 'completed').length,
        completedImprovements: mockImprovements.filter(i => i.currentStatus === 'completed').length
      }
    })

    wx.hideLoading()
  },

  /**
   * 切换标签页
   */
  switchTab(event) {
    const tab = event.currentTarget.dataset.tab
    this.setData({ activeTab: tab })
  },

  /**
   * 查看评审计划详情
   */
  viewPlanDetail(event) {
    const planId = event.currentTarget.dataset.id
    wx.showToast({
      title: '评审计划详情开发中',
      icon: 'none'
    })
  },

  /**
   * 查看评审报告
   */
  viewReportDetail(event) {
    const reportId = event.currentTarget.dataset.id
    wx.showToast({
      title: '评审报告详情开发中',
      icon: 'none'
    })
  },

  /**
   * 查看改进措施详情
   */
  viewImprovementDetail(event) {
    const itemId = event.currentTarget.dataset.id
    wx.showToast({
      title: '改进措施详情开发中',
      icon: 'none'
    })
  },

  /**
   * 添加管理评审计划
   */
  addReviewPlan() {
    wx.navigateTo({
      url: '/pages/review/review-plan-add'
    })
  },

  /**
   * 验证改进措施有效性
   */
  verifyEffectiveness(event) {
    const itemId = event.currentTarget.dataset.id
    wx.showModal({
      title: '有效性验证',
      content: '确认该改进措施已有效实施？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '验证记录已提交',
            icon: 'success'
          })
        }
      }
    })
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.loadReviewData()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 500)
  },

  /**
   * 分享
   */
  onShareAppMessage() {
    return {
      title: '管理评审 - 铁路安全监控',
      path: '/pages/review/review'
    }
  }
})
