const app = getApp()

Page({
  data: {
    hasUserInfo: false,
    todayIncidents: 0,
    riskLevel: '正常',
    completionRate: 98,
    alerts: [
      {
        id: 1,
        type: '设备异常',
        time: '10:30',
        content: '2号轨道检测器信号异常，请及时检查'
      },
      {
        id: 2,
        type: '天气预警',
        time: '09:15',
        content: '预计下午有强降雨，注意防护措施'
      }
    ]
  },

  onLoad() {
    const that = this

    // 检查用户登录状态
    if (app.globalData.hasUserInfo) {
      this.setData({
        hasUserInfo: true
      })
      this.loadQuickData()
    } else {
      app.getUserInfo = res => {
        that.setData({
          hasUserInfo: true
        })
        that.loadQuickData()
      }
    }
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      })
    }
  },

  // 登录按钮点击
  onLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  },

  // 加载快览数据
  async loadQuickData() {
    wx.showLoading({ title: '加载中...' })

    try {
      // 调用云函数获取今日数据
      const result = await wx.cloud.callFunction({
        name: 'getQuickStats',
        data: {
          date: new Date().toISOString().split('T')[0]
        }
      })

      if (result.result.success) {
        this.setData({
          todayIncidents: result.result.data.incidents || 0,
          riskLevel: result.result.data.riskLevel || '正常',
          completionRate: result.result.data.completionRate || 98
        })
      }
    } catch (error) {
      console.error('获取数据失败:', error)
      app.showError('获取数据失败')
      // 使用模拟数据
      this.useMockData()
    } finally {
      wx.hideLoading()
    }
  },

  // 使用模拟数据
  useMockData() {
    this.setData({
      todayIncidents: 0,
      riskLevel: '正常',
      completionRate: 98,
      alerts: [
        {
          id: 1,
          type: '设备异常',
          time: '10:30',
          content: '2号轨道检测器信号异常，请及时检查'
        }
      ]
    })
  },

  // 导航到各个页面
  goToDashboard() {
    wx.switchTab({
      url: '/pages/dashboard/dashboard'
    })
  },

  goToRisk() {
    wx.switchTab({
      url: '/pages/risk/risk'
    })
  },

  goToIncident() {
    wx.switchTab({
      url: '/pages/incident/incident'
    })
  },

  goToInspection() {
    wx.switchTab({
      url: '/pages/inspection/inspection'
    })
  },

  goToAlerts() {
    wx.navigateTo({
      url: '/pages/alerts/alerts'
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadQuickData().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 分享到微信
  onShareAppMessage() {
    return {
      title: '梁邹铁路安全监控系统',
      path: '/pages/index/index',
      imageUrl: '/images/share-cover.png'
    }
  }
})