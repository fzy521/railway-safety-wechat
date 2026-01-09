const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    drillId: '',
    drill: null,
    loading: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (options.id) {
      this.setData({
        drillId: options.id
      })
      this.loadDrillDetail(options.id)
    }
  },

  /**
   * 加载演练详情
   */
  loadDrillDetail(drillId) {
    // 从应急页面获取演练数据
    const pages = getCurrentPages()
    const emergencyPage = pages.find(page => page.route === 'pages/emergency/emergency')
    
    if (emergencyPage && emergencyPage.data.drillRecords) {
      const drill = emergencyPage.data.drillRecords.find(d => d.id === drillId)
      
      if (drill) {
        this.setData({
          drill: drill,
          loading: false
        })
      } else {
        wx.showToast({
          title: '演练记录不存在',
          icon: 'none'
        })
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      }
    } else {
      // 如果找不到应急页面，使用模拟数据
      this.loadMockData(drillId)
    }
  },

  /**
   * 加载模拟数据
   */
  loadMockData(drillId) {
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

    const drill = mockDrills.find(d => d.id === drillId)
    
    if (drill) {
      this.setData({
        drill: drill,
        loading: false
      })
    } else {
      wx.showToast({
        title: '演练记录不存在',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  },

  /**
   * 评估演练
   */
  evaluateDrill() {
    wx.navigateTo({
      url: `/pages/emergency/drill-evaluation/drill-evaluation?id=${this.data.drillId}`
    })
  },

  /**
   * 返回上一页
   */
  goBack() {
    wx.navigateBack()
  }
})