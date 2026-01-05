const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 状态筛选
    activeTab: 'all',
    statusTabs: [
      { label: '全部', value: 'all' },
      { label: '待评估', value: '待评估' },
      { label: '待管控', value: '待管控' },
      { label: '管控中', value: '管控中' }
    ],
    
    // 风险清单
    riskList: [],
    filteredList: [],
    
    // 统计数据
    statistics: {
      total: 0,
      pendingAssess: 0,
      pendingControl: 0,
      controlling: 0
    },
    
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

    // GBT 33000-2025 Standard Compliant Risk Classification
    riskAssessmentCriteria: {
      // 风险等级矩阵 - 基于GBT 33000-2025表D.1
      riskMatrix: [
        { likelihood: '不可能', severity: '一般', risk: '蓝', level: '低风险', controlNeeded: '一般控制' },
        { likelihood: '不太可能', severity: '较大', risk: '黄', level: '一般风险', controlNeeded: '监测与审查' },
        { likelihood: '可能发生', severity: '重大', risk: '橙', level: '较大风险', controlNeeded: '管控措施' },
        { likelihood: '很可能', severity: '特大', risk: '红', level: '重大风险', controlNeeded: '立即整改' }
      ]
    }
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

    wx.cloud.database().collection('risk_library')
      .orderBy('createdAt', 'desc')
      .get({
        success: res => {
          const riskList = res.data.map(item => ({
            id: item._id,
            name: item.riskName,
            description: item.riskDescription,
            riskLevel: this.getRiskLevelClass(item.riskColor),
            levelName: item.riskGrade,
            controlMeasures: item.controlMeasures,
            assessment: `M:${item.mValue} E:${Math.max(item.e1Value, item.e2Value)} S:${item.sValue}`,
            responder: item.managePerson,
            date: this.formatDate(new Date(item.identificationDate)),
            nextReviewDate: item.nextCheckDate ? this.formatDate(new Date(item.nextCheckDate)) : '',
            status: item.status,
            statusText: this.getStatusText(item.status),
            statusClass: this.getStatusClass(item.status),
            effectiveness: item.controlNotes || '',
            rValue: item.rValue
          }))

          // 统计各风险等级数量 - 符合GBT 33000-2025标准
          const statistics = {
            total: riskList.length,
            majorRisks: riskList.filter(r => r.levelName === '重大风险').length,
            largeRisks: riskList.filter(r => r.levelName === '较大风险').length,
            generalRisks: riskList.filter(r => r.levelName === '一般风险').length,
            minorRisks: riskList.filter(r => r.levelName === '低风险').length
          }

          this.setData({
            riskList: riskList,
            statistics: statistics
          })

          // 应用筛选
          this.applyFilter()
        },
        fail: err => {
          console.error('加载风险数据失败:', err)
          app.showError('加载失败')
        },
        complete: () => {
          wx.hideLoading()
        }
      })
  },

  /**
   * 应用状态筛选
   */
  applyFilter() {
    const { activeTab, riskList } = this.data
    
    let filteredList = riskList
    
    if (activeTab !== 'all') {
      filteredList = riskList.filter(item => item.status === activeTab)
    }

    // 按风险等级排序（重大>较大>一般>低）
    const sortedRisks = filteredList.sort((a, b) => {
      const riskOrder = { 'major': 4, 'large': 3, 'general': 2, 'minor': 1 }
      return riskOrder[b.riskLevel] - riskOrder[a.riskLevel]
    })

    this.setData({
      filteredList: sortedRisks
    })
  },

  /**
   * 切换状态Tab
   */
  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      activeTab: tab
    })
    this.applyFilter()
  },

  /**
   * 获取状态文本
   */
  getStatusText(status) {
    const statusMap = {
      '已辨识': '已辨识',
      '待评估': '待评估',
      '已评估': '已评估',
      '待管控': '待管控',
      '管控中': '管控中',
      '管控有效': '管控有效',
      '已销号': '已销号'
    }
    return statusMap[status] || status
  },

  /**
   * 格式化日期
   */
  formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
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
      'A': { color: 'minor', text: '低风险' },
      'B': { color: 'minor', text: '低风险' },
      'C': { color: 'general', text: '一般风险' },
      'D': { color: 'general', text: '一般风险' },
      'E': { color: 'large', text: '较大风险' },
      'F': { color: 'major', text: '重大风险' },
      'G': { color: 'major', text: '重大风险' },
      'H': { color: 'major', text: '重大风险' },
      'I': { color: 'major', text: '重大风险' }
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
    wx.navigateTo({
      url: '/pages/risk/risk-identify'
    })
  },

  /**
   * 查看风险详情
   */
  viewRiskDetail(e) {
    const riskId = e.currentTarget.dataset.id
    const risk = this.data.riskList.find(r => r.id === riskId)
    
    if (!risk) return

    // 根据状态跳转到不同页面
    if (risk.status === '待评估') {
      wx.navigateTo({
        url: `/pages/risk/risk-assess?riskId=${riskId}`
      })
    } else if (risk.status === '待管控') {
      wx.navigateTo({
        url: `/pages/risk/risk-control?riskId=${riskId}`
      })
    } else {
      wx.navigateTo({
        url: `/pages/risk/risk-detail?riskId=${riskId}`
      })
    }
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
  },

  /**
   * 获取风险等级对应的CSS类名
   */
  getRiskLevelClass(riskColor) {
    const colorMap = {
      '红': 'major',    // 重大风险
      '橙': 'large',    // 较大风险
      '黄': 'general',  // 一般风险
      '蓝': 'minor'     // 低风险
    }
    return colorMap[riskColor] || 'minor'
  },

  /**
   * 获取状态对应的CSS类名
   */
  getStatusClass(status) {
    const statusMap = {
      '已辨识': 'identified',
      '待评估': 'pending-assess',
      '已评估': 'assessed',
      '待管控': 'pending-control',
      '管控中': 'controlling',
      '管控有效': 'effective',
      '已销号': 'closed'
    }
    return statusMap[status] || ''
  }
})
