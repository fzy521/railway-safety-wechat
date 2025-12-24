const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 风险矩阵数据
    riskMatrix: [
      {
        likelihood: '低',
        levels: [
          { level: 'A', color: 'green' },
          { level: 'B', color: 'green' },
          { level: 'C', color: 'yellow' },
          { level: 'D', color: 'yellow' },
          { level: 'E', color: 'orange' }
        ]
      },
      {
        likelihood: '中',
        levels: [
          { level: 'B', color: 'green' },
          { level: 'C', color: 'yellow' },
          { level: 'D', color: 'yellow' },
          { level: 'E', color: 'orange' },
          { level: 'F', color: 'red' }
        ]
      },
      {
        likelihood: '高',
        levels: [
          { level: 'C', color: 'yellow' },
          { level: 'D', color: 'yellow' },
          { level: 'E', color: 'orange' },
          { level: 'F', color: 'red' },
          { level: 'G', color: 'red' }
        ]
      },
      {
        likelihood: '很高',
        levels: [
          { level: 'D', color: 'yellow' },
          { level: 'E', color: 'orange' },
          { level: 'F', color: 'red' },
          { level: 'G', color: 'red' },
          { level: 'H', color: 'red' }
        ]
      },
      {
        likelihood: '确定',
        levels: [
          { level: 'E', color: 'orange' },
          { level: 'F', color: 'red' },
          { level: 'G', color: 'red' },
          { level: 'H', color: 'red' },
          { level: 'I', color: 'red' }
        ]
      }
    ],

    // 选中的风险等级
    selectedRisk: {
      level: '',
      color: '',
      colorText: '',
      description: '',
      likelihood: -1,
      severity: -1
    },

    // 风险清单
    riskList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.loadRiskData()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      })
    }
  },

  /**
   * 加载风险数据
   */
  loadRiskData() {
    wx.showLoading({ title: '加载中...' })

    // 模拟数据
    const mockRiskData = [
      {
        id: 1,
        name: '轨道老化磨损',
        description: '部分区段轨道使用年限较长，存在磨损过度的风险',
        assessment: 'B级(中风险)',
        levelColor: 'yellow',
        responder: '张工程师',
        date: '2024-12-20',
        status: 'processing',
        statusText: '整改中'
      },
      {
        id: 2,
        name: '信号系统故障风险',
        description: '恶劣天气下信号显示可能受影响',
        assessment: 'D级(中风险)',
        levelColor: 'yellow',
        responder: '李维护员',
        date: '2024-12-19',
        status: 'pending',
        statusText: '待处理'
      },
      {
        id: 3,
        name: '电气化设备检测',
        description: '接触网除冰装置需要定期检修',
        assessment: 'F级(高风险)',
        levelColor: 'red',
        responder: '王班长',
        date: '2024-12-18',
        status: 'processing',
        statusText: '保养中'
      },
      {
        id: 4,
        name: '防碰撞系统测试',
        description: '最新安装的防碰撞系统需要全面测试',
        assessment: 'A级(低风险)',
        levelColor: 'green',
        responder: '赵技术员',
        date: '2024-12-17',
        status: 'completed',
        statusText: '已完成'
      }
    ]

    this.setData({
      riskList: mockRiskData
    })

    wx.hideLoading()
  },

  /**
   * 风险选择
   */
  onRiskSelect(event) {
    const { likelihood, severity, level } = event.currentTarget.dataset

    // 风险等级说明
    const riskDescriptions = {
      'A': '可接受风险，继续监控',
      'B': '可接受风险，但需定期复核',
      'C': '中等风险，估计合适的控制措施',
      'D': '中等风险，需注意并进行控制',
      'E': '严重风险，必须采取控制措施',
      'F': '非常严重风险，立即采取行动',
      'G': '危急风险，必须立即处理',
      'H': '灾难性风险，必须停止作业',
      'I': '极高风险，立即停止一切作业'
    }

    const riskColors = {
      'A': { color: 'green', text: '低风险' },
      'B': { color: 'green', text: '低风险' },
      'C': { color: 'yellow', text: '中风险' },
      'D': { color: 'yellow', text: '中风险' },
      'E': { color: 'orange', text: '高风险' },
      'F': { color: 'red', text: '极高风险' },
      'G': { color: 'red', text: '极高风险' },
      'H': { color: 'red', text: '极高风险' },
      'I': { color: 'red', text: '极高风险' }
    }

    const riskInfo = riskColors[level]

    this.setData({
      selectedRisk: {
        level,
        color: riskInfo.color,
        colorText: riskInfo.text,
        description: riskDescriptions[level],
        likelihood,
        severity
      }
    })
  },

  /**
   * 添加新风险
   */
  addRisk() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.loadRiskData()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 500)
  },

  /**
   * 分享到微信
   */
  onShareAppMessage() {
    return {
      title: '风险评估 - 铁路安全监控',
      path: '/pages/risk/risk'
    }
  }
})
