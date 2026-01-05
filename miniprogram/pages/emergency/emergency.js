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
    // 应急物资清单
    emergencySupplies: [],
    // 统计数据
    statistics: {
      totalPlans: 0,
      completedDrills: 0,
      plannedDrills: 0,
      suppliesReady: 0
    },
    activeTab: 'plans' // plans, drills, supplies
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
        selected: 5
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
        nextReviewDate: '2025-11-15', // 每年至少评审一次
        approvalDept: '安全管理部门',
        drillFrequency: '每年2次',
        effectiveness: '已通过演练验证有效'
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
        effectiveness: '需补充低温天气专项演练'
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
        effectiveness: '演练效果良好'
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
      }
    ]

    const mockSupplies = [
      {
        id: 'ES001',
        name: '担架',
        category: 'medical', // 医疗救护类
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
        category: 'emergency-light', // 应急照明类
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
        category: 'communication', // 通信装备类
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
        name: '灭火器干粉',
        category: 'fire-fighting', // 消防器材类
        categoryName: '消防器材',
        quantity: 20,
        minimumStock: 15,
        unit: '具',
        location: '应急物资仓库C区',
        status: 'expiring',
        statusText: '即将过期',
        lastCheckDate: '2024-12-10',
        expiryDate: '2025-03-15',
        manager: '安全员_王'
      }
    ]

    this.setData({
      emergencyPlans: mockPlans,
      drillRecords: mockDrills,
      emergencySupplies: mockSupplies,
      statistics: {
        totalPlans: mockPlans.length,
        completedDrills: mockDrills.filter(d => d.completionStatus === 'completed').length,
        plannedDrills: mockDrills.filter(d => d.completionStatus === 'planned').length,
        suppliesReady: mockSupplies.filter(s => s.status === 'normal').length
      }
    })
  },

  /**
   * 切换标签页
   */
  switchTab(event) {
    const tab = event.currentTarget.dataset.tab
    this.setData({ activeTab: tab })
  },

  /**
   * 查看应急预案详情
   */
  viewPlanDetail(event) {
    const planId = event.currentTarget.dataset.id
    wx.showToast({
      title: '预案详情开发中',
      icon: 'none'
    })
  },

  /**
   * 启动应急预案
   */
  activatePlan(event) {
    const planId = event.currentTarget.dataset.id
    wx.showModal({
      title: '启动应急预案',
      content: '确认启动该应急预案？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '预案已启动',
            icon: 'success'
          })
        }
      }
    })
  },

  /**
   * 查看演练详情
   */
  viewDrillDetail(event) {
    const drillId = event.currentTarget.dataset.id
    wx.showToast({
      title: '演练详情开发中',
      icon: 'none'
    })
  },

  /**
   * 记录演练评估
   */
  evaluateDrill(event) {
    const drillId = event.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/emergency/drill-evaluation?id=${drillId}`
    })
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
