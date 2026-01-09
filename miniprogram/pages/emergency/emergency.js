const app = getApp()

Page({
  /**
   * 页面的初始数据 - GBT 33000-2025 应急响应管理
   */
  data: {
    // 应急预案列表
    emergencyPlans: [],
    // 应急演练记录
    drillRecords: [],
    // 过滤后的演练记录
    filteredDrills: null,
    // 当前查看的预案ID
    currentPlanId: null,
    // 当前查看的预案名称
    currentPlanName: '',
    // 应急物资清单
    emergencySupplies: [],
    // 统计数据
    statistics: {
      totalPlans: 0,
      completedDrills: 0,
      plannedDrills: 0,
      suppliesReady: 0
    },
    activeTab: 'plans', // plans, drills, supplies
    showAddMenu: false // 控制新增菜单显示
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.loadEmergencyData()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 3
      })
    }
  },

  /**
   * 加载应急数据
   */
  loadEmergencyData() {
    // 模拟数据 - GBT 33000-2025 应急准备
    const mockPlans = [
      {
        id: 'EP001',
        name: '特种设备事故专项应急预案',
        type: 'special',
        typeName: '专项预案',
        version: '2024-A',
        status: 'active',
        statusText: '已发布',
        lastReviewDate: '2024-11-15',
        nextReviewDate: '2025-11-15',
        approvalDept: '安全管理部门',
        drillFrequency: '每年2次',
        drillFrequencyCode: 'yearly_2',
        effectiveness: '已通过演练验证有效',
        pdfFiles: [
          {
            id: 'PDF001',
            fileName: '特种设备事故专项应急预案.pdf',
            fileSize: '2.3MB',
            uploadTime: '2024-11-15 10:30',
            fileUrl: 'https://example.com/files/EP001.pdf',
            cloudPath: 'emergency-plans/EP001.pdf'
          }
        ]
      },
      {
        id: 'EP002',
        name: '生产安全事故综合应急预案',
        type: 'comprehensive',
        typeName: '综合预案',
        version: '2024-B',
        status: 'active',
        statusText: '已发布',
        lastReviewDate: '2024-10-20',
        nextReviewDate: '2025-10-20',
        approvalDept: '总经理办公室',
        drillFrequency: '每年1次',
        drillFrequencyCode: 'yearly_1',
        effectiveness: '需补充低温天气专项演练',
        pdfFiles: []
      },
      {
        id: 'EP003',
        name: '接触网故障现场处置方案',
        type: 'site',
        typeName: '现场处置方案',
        version: '2024-01',
        status: 'active',
        statusText: '已发布',
        lastReviewDate: '2024-12-01',
        nextReviewDate: '2025-12-01',
        approvalDept: '电力部门',
        drillFrequency: '每季度1次',
        drillFrequencyCode: 'quarterly_1',
        effectiveness: '演练效果良好',
        pdfFiles: [
          {
            id: 'PDF003',
            fileName: '接触网故障现场处置方案.pdf',
            fileSize: '1.8MB',
            uploadTime: '2024-12-01 14:20',
            fileUrl: 'https://example.com/files/EP003.pdf',
            cloudPath: 'emergency-plans/EP003.pdf'
          }
        ]
      },
      {
        id: 'EP004',
        name: '自然灾害应急响应预案',
        type: 'special',
        typeName: '专项预案',
        version: '2024-A',
        status: 'active',
        statusText: '已发布',
        lastReviewDate: '2024-09-10',
        nextReviewDate: '2025-09-10',
        approvalDept: '安全管理部门',
        drillFrequency: '每年1次',
        drillFrequencyCode: 'yearly_1',
        effectiveness: '待验证',
        pdfFiles: []
      }
    ]

    const mockDrills = [
      {
        id: 'DR001',
        planId: 'EP003',
        planName: '接触网故障现场处置方案',
        date: '2024-12-15',
        startTime: '09:00',
        endTime: '11:30',
        duration: '2.5小时',
        type: 'field',
        typeName: '现场演练',
        participants: '15人',
        executor: '电力抢修班组',
        recorder: '安全员_王',
        scenario: '冬季接触网结冰故障',
        objectives: '检验抢修响应速度和现场处置能力',
        completionStatus: 'completed',
        effectiveness: 'good',
        effectivenessText: '效果良好',
        issues: '部分工具准备不充分',
        improvements: '完善应急物资清单，加强工具检查'
      },
      {
        id: 'DR002',
        planId: 'EP001',
        planName: '特种设备事故专项应急预案',
        date: '2024-12-10',
        startTime: '14:00',
        endTime: '15:30',
        duration: '1.5小时',
        type: 'tabletop',
        typeName: '桌面演练',
        participants: '8人',
        executor: '安全管理部门',
        recorder: '安全主任_李',
        scenario: '起重机倾覆事故',
        objectives: '检验应急响应流程和协调配合',
        completionStatus: 'completed',
        effectiveness: 'qualified',
        effectivenessText: '基本合格',
        issues: '部分人员对应急职责不够熟悉',
        improvements: '加强应急预案培训'
      },
      {
        id: 'DR003',
        planId: 'EP002',
        planName: '生产安全事故综合应急预案',
        date: '2024-12-20',
        startTime: '10:00',
        type: 'field',
        typeName: '现场演练',
        participants: '25人',
        executor: '应急指挥中心',
        scenario: '多设备同时故障',
        objectives: '综合应急响应能力测试',
        completionStatus: 'planned',
        effectiveness: 'pending',
        effectivenessText: '计划中'
      },
      {
        id: 'DR004',
        planId: 'EP003',
        planName: '接触网故障现场处置方案',
        date: '2024-09-15',
        startTime: '14:00',
        endTime: '16:00',
        duration: '2小时',
        type: 'field',
        typeName: '现场演练',
        participants: '12人',
        executor: '电力抢修班组',
        recorder: '安全员_王',
        scenario: '夏季高温天气接触网故障',
        objectives: '检验高温环境下的应急处置能力',
        completionStatus: 'completed',
        effectiveness: 'good',
        effectivenessText: '效果良好',
        issues: '防暑降温物资不足',
        improvements: '补充防暑降温物资'
      },
      {
        id: 'DR005',
        planId: 'EP003',
        planName: '接触网故障现场处置方案',
        date: '2024-06-20',
        startTime: '10:00',
        endTime: '12:00',
        duration: '2小时',
        type: 'field',
        typeName: '现场演练',
        participants: '14人',
        executor: '电力抢修班组',
        recorder: '安全员_王',
        scenario: '雷雨天气接触网故障',
        objectives: '检验恶劣天气下的应急处置能力',
        completionStatus: 'completed',
        effectiveness: 'good',
        effectivenessText: '效果良好',
        issues: '通信设备受雷雨影响',
        improvements: '加强通信设备防护'
      },
      {
        id: 'DR006',
        planId: 'EP003',
        planName: '接触网故障现场处置方案',
        date: '2024-03-15',
        startTime: '09:00',
        endTime: '11:00',
        duration: '2小时',
        type: 'field',
        typeName: '现场演练',
        participants: '13人',
        executor: '电力抢修班组',
        recorder: '安全员_王',
        scenario: '春季接触网检修期间故障',
        objectives: '检验检修期间的应急响应能力',
        completionStatus: 'completed',
        effectiveness: 'good',
        effectivenessText: '效果良好',
        issues: '无明显问题',
        improvements: '继续保持'
      }
    ]

    const mockSupplies = [
      {
        id: 'ES001',
        name: '担架',
        category: 'medical',
        categoryName: '医疗救护',
        quantity: 5,
        minimumStock: 2,
        unit: '副',
        location: '应急物资仓库A区',
        status: 'normal',
        statusText: '正常',
        lastCheckDate: '2024-12-18',
        expiryDate: '无',
        manager: '后勤_刘'
      },
      {
        id: 'ES002',
        name: '应急照明灯',
        category: 'emergency-light',
        categoryName: '应急照明',
        quantity: 10,
        minimumStock: 5,
        unit: '套',
        location: '应急物资仓库B区',
        status: 'warning',
        statusText: '库存不足',
        lastCheckDate: '2024-12-15',
        expiryDate: '无',
        manager: '后勤_刘'
      },
      {
        id: 'ES003',
        name: '手持对讲机',
        category: 'communication',
        categoryName: '通信设备',
        quantity: 8,
        minimumStock: 6,
        unit: '台',
        location: '应急指挥中心',
        status: 'normal',
        statusText: '正常',
        lastCheckDate: '2024-12-20',
        expiryDate: '无',
        manager: '安全主任_李'
      },
      {
        id: 'ES004',
        name: '急救包',
        category: 'medical',
        categoryName: '医疗救护',
        quantity: 3,
        minimumStock: 2,
        unit: '套',
        location: '应急物资仓库A区',
        status: 'normal',
        statusText: '正常',
        lastCheckDate: '2024-12-18',
        expiryDate: '2025-06-30',
        manager: '后勤_刘'
      },
      {
        id: 'ES005',
        name: '灭火器',
        category: 'fire',
        categoryName: '消防器材',
        quantity: 20,
        minimumStock: 10,
        unit: '具',
        location: '应急物资仓库C区',
        status: 'normal',
        statusText: '正常',
        lastCheckDate: '2024-12-19',
        expiryDate: '2025-03-15',
        manager: '后勤_刘'
      }
    ]

    // 计算每个预案的演练统计数据
    const plansWithDrillStats = this.calculateDrillStats(mockPlans, mockDrills)

    // 计算统计数据
    const statistics = {
      totalPlans: plansWithDrillStats.length,
      completedDrills: mockDrills.filter(d => d.completionStatus === 'completed').length,
      plannedDrills: mockDrills.filter(d => d.completionStatus === 'planned').length,
      suppliesReady: mockSupplies.filter(s => s.status === 'normal').length
    }

    this.setData({
      emergencyPlans: plansWithDrillStats,
      drillRecords: mockDrills,
      emergencySupplies: mockSupplies,
      statistics: statistics
    })
  },

  /**
   * 获取当前预案名称
   */
  getCurrentPlanName() {
    if (!this.data.currentPlanId) return ''
    const plan = this.data.emergencyPlans.find(p => p.id === this.data.currentPlanId)
    return plan ? plan.name : ''
  },

  /**
   * 计算每个预案的演练统计数据
   */
  calculateDrillStats(plans, drills) {
    const currentYear = new Date().getFullYear()
    
    return plans.map(plan => {
      // 获取该预案的所有演练记录
      const planDrills = drills.filter(drill => drill.planId === plan.id)
      
      // 获取今年已完成的演练
      const completedThisYear = planDrills.filter(drill => 
        drill.completionStatus === 'completed' && 
        new Date(drill.date).getFullYear() === currentYear
      )
      
      // 计算要求的演练次数
      const requiredCount = this.getRequiredDrillCount(plan.drillFrequencyCode, currentYear)
      
      // 判断演练状态
      const drillStatus = completedThisYear.length >= requiredCount ? 'sufficient' : 'insufficient'
      
      // 更新预案的演练统计信息
      return {
        ...plan,
        drillCount: completedThisYear.length,
        drillRequired: requiredCount,
        drillStatus: drillStatus,
        drillProgress: Math.round((completedThisYear.length / requiredCount) * 100),
        lastDrillDate: completedThisYear.length > 0 
          ? completedThisYear[completedThisYear.length - 1].date 
          : '未演练',
        nextDrillDate: this.calculateNextDrillDate(plan.drillFrequencyCode, currentYear)
      }
    })
  },

  /**
   * 根据演练频次代码计算要求的演练次数
   */
  getRequiredDrillCount(frequencyCode, year) {
    switch(frequencyCode) {
      case 'yearly_1':
        return 1
      case 'yearly_2':
        return 2
      case 'quarterly_1':
        return 4
      case 'monthly_1':
        return 12
      default:
        return 1
    }
  },

  /**
   * 计算下次演练日期
   */
  calculateNextDrillDate(frequencyCode, year) {
    const now = new Date()
    let nextDate = new Date()
    
    switch(frequencyCode) {
      case 'yearly_1':
        // 每年1次：明年同月
        nextDate.setFullYear(now.getFullYear() + 1)
        break
      case 'yearly_2':
        // 每年2次：每6个月一次
        const nextMonth = now.getMonth() + 6
        if (nextMonth >= 12) {
          nextDate.setFullYear(now.getFullYear() + 1)
          nextDate.setMonth(nextMonth - 12)
        } else {
          nextDate.setMonth(nextMonth)
        }
        break
      case 'quarterly_1':
        // 每季度1次：每3个月一次
        const nextQuarter = now.getMonth() + 3
        if (nextQuarter >= 12) {
          nextDate.setFullYear(now.getFullYear() + 1)
          nextDate.setMonth(nextQuarter - 12)
        } else {
          nextDate.setMonth(nextQuarter)
        }
        break
      case 'monthly_1':
        // 每月1次：下个月
        if (now.getMonth() === 11) {
          nextDate.setFullYear(now.getFullYear() + 1)
          nextDate.setMonth(0)
        } else {
          nextDate.setMonth(now.getMonth() + 1)
        }
        break
      default:
        nextDate.setFullYear(now.getFullYear() + 1)
    }
    
    return `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`
  },

  /**
   * 切换标签页
   */
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      activeTab: tab,
      filteredDrills: null,
      currentPlanId: null,
      currentPlanName: ''
    })
  },

  /**
   * 查看预案详情
   */
  viewPlanDetail(e) {
    console.log('viewPlanDetail 被调用', e)
    const planId = e.currentTarget.dataset.id
    console.log('planId:', planId)
    wx.navigateTo({
      url: '/pages/emergency/plan-detail/plan-detail?id=' + planId,
      success: (res) => {
        console.log('跳转成功', res)
      },
      fail: (err) => {
        console.log('跳转失败', err)
        wx.showToast({
          title: '跳转失败',
          icon: 'none'
        })
      }
    })
  },

  /**
   * 查看预案的演练记录
   */
  viewPlanDrills(e) {
    const planId = e.currentTarget.dataset.id
    const plan = this.data.emergencyPlans.find(p => p.id === planId)
    const planDrills = this.data.drillRecords.filter(d => d.planId === planId)
    
    // 切换到演练记录标签页，并只显示该预案的演练
    this.setData({
      activeTab: 'drills',
      filteredDrills: planDrills,
      currentPlanId: planId,
      currentPlanName: plan.name
    })
  },

  /**
   * 查看所有演练记录
   */
  viewAllDrills() {
    this.setData({
      activeTab: 'drills',
      filteredDrills: null,
      currentPlanId: null,
      currentPlanName: ''
    })
  },

  /**
   * 评估演练
   */
  evaluateDrill(event) {
    const drillId = event.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/emergency/drill-evaluation/drill-evaluation?id=${drillId}`
    })
  },

  /**
   * 查看演练详情
   */
  viewDrillDetail(e) {
    const drillId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/emergency/drill-detail/drill-detail?id=' + drillId
    })
  },

  /**
   * 查看物资详情
   */
  viewSupplyDetail(e) {
    const supplyId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/emergency/supply-detail/supply-detail?id=' + supplyId
    })
  },

  /**
   * 检查物资库存
   */
  checkSupply(e) {
    const supplyId = e.currentTarget.dataset.id
    const supply = this.data.emergencySupplies.find(s => s.id === supplyId)
    
    wx.showModal({
      title: '物资检查',
      content: `是否确认检查 ${supply.name} 的库存？`,
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '检查记录已更新',
            icon: 'success'
          })
        }
      }
    })
  },

  /**
   * 处理添加按钮点击
   */
  handleAddClick() {
    const { activeTab } = this.data
    
    switch(activeTab) {
      case 'plans':
        // 应急预案页面，直接跳转到新增预案
        wx.navigateTo({
          url: '/pages/emergency/plan-add/plan-add'
        })
        break
        
      case 'supplies':
        // 应急物资页面，直接跳转到新增物资
        wx.navigateTo({
          url: '/pages/emergency/supply-add/supply-add'
        })
        break
        
      case 'drills':
        // 演练记录页面，需要先选择预案
        this.selectPlanForDrill()
        break
        
      default:
        // 默认显示弹窗菜单
        this.setData({ showAddMenu: true })
    }
  },

  /**
   * 显示新增菜单
   */
  showAddMenu() {
    this.setData({ showAddMenu: true })
  },

  /**
   * 隐藏新增菜单
   */
  hideAddMenu() {
    this.setData({ showAddMenu: false })
  },

  /**
   * 阻止事件冒泡
   */
  stopPropagation() {
    // 阻止点击遮罩层时触发菜单项点击
  },

  /**
   * 添加应急预案
   */
  addPlan() {
    this.hideAddMenu()
    wx.navigateTo({
      url: '/pages/emergency/plan-add/plan-add'
    })
  },

  /**
   * 添加应急物资
   */
  addSupply() {
    this.hideAddMenu()
    wx.navigateTo({
      url: '/pages/emergency/supply-add/supply-add'
    })
  },

  /**
   * 为特定预案添加演练记录
   */
  addDrillForPlan(e) {
    const planId = e.currentTarget.dataset.id
    const planName = e.currentTarget.dataset.name
    
    wx.navigateTo({
      url: `/pages/emergency/drill-add/drill-add?planId=${planId}&planName=${planName}`
    })
  },

  /**
   * 选择预案添加演练记录（保留用于全局添加）
   */
  selectPlanForDrill() {
    const planOptions = this.data.emergencyPlans.map(plan => plan.name)
    
    wx.showActionSheet({
      itemList: planOptions,
      success: (res) => {
        if (!res.cancel) {
          const selectedPlan = this.data.emergencyPlans[res.tapIndex]
          wx.navigateTo({
            url: `/pages/emergency/drill-add/drill-add?planId=${selectedPlan.id}&planName=${selectedPlan.name}`
          })
        }
      }
    })
  },

  /**
   * 生成演练计划
   */
  generateDrillPlan() {
    const currentYear = new Date().getFullYear()
    const plansNeedingDrill = this.data.emergencyPlans.filter(plan => 
      plan.drillStatus === 'insufficient'
    )
    
    if (plansNeedingDrill.length === 0) {
      wx.showToast({
        title: '所有预案演练均达标',
        icon: 'success'
      })
      return
    }
    
    // 显示需要演练的预案列表
    const planNames = plansNeedingDrill.map(p => `${p.name} (${p.drillCount}/${p.drillRequired}次)`)
    
    wx.showModal({
      title: '演练计划',
      content: `以下预案需要补充演练：\n${planNames.join('\n')}`,
      confirmText: '生成计划',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '演练计划已生成',
            icon: 'success'
          })
        }
      }
    })
  },

  /**
   * 统计演练达标情况
   */
  getDrillComplianceStats() {
    const plans = this.data.emergencyPlans
    const total = plans.length
    const sufficient = plans.filter(p => p.drillStatus === 'sufficient').length
    const insufficient = plans.filter(p => p.drillStatus === 'insufficient').length
    
    return {
      total,
      sufficient,
      insufficient,
      complianceRate: total > 0 ? Math.round((sufficient / total) * 100) : 0
    }
  },

  /**
   * 分享
   */
  onShareAppMessage() {
    return {
      title: '应急管理中心 - 铁路安全监控',
      path: '/pages/emergency/emergency'
    }
  }
})