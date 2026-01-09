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
    
    // 统计数据 - 符合GBT 33000-2025要求的关键指标
    statistics: {
      total: 0,
      pendingAssess: 0,
      pendingControl: 0,
      controlling: 0,
      majorRisks: 0,
      largeRisks: 0,
      generalRisks: 0,
      minorRisks: 0
    },
    
    // 风险矩阵数据 - 严格遵循GBT 33000-2025表D.1
    riskMatrix: [
      {
        likelihood: '几乎不可能',
        levels: [
          { level: '低风险', color: 'blue' },
          { level: '低风险', color: 'blue' },
          { level: '一般风险', color: 'yellow' },
          { level: '较大风险', color: 'orange' },
          { level: '重大风险', color: 'red' }
        ]
      },
      {
        likelihood: '不太可能',
        levels: [
          { level: '低风险', color: 'blue' },
          { level: '一般风险', color: 'yellow' },
          { level: '一般风险', color: 'yellow' },
          { level: '较大风险', color: 'orange' },
          { level: '重大风险', color: 'red' }
        ]
      },
      {
        likelihood: '可能',
        levels: [
          { level: '低风险', color: 'blue' },
          { level: '一般风险', color: 'yellow' },
          { level: '较大风险', color: 'orange' },
          { level: '重大风险', color: 'red' },
          { level: '重大风险', color: 'red' }
        ]
      },
      {
        likelihood: '很可能',
        levels: [
          { level: '一般风险', color: 'yellow' },
          { level: '较大风险', color: 'orange' },
          { level: '重大风险', color: 'red' },
          { level: '重大风险', color: 'red' },
          { level: '重大风险', color: 'red' }
        ]
      },
      {
        likelihood: '几乎肯定',
        levels: [
          { level: '较大风险', color: 'orange' },
          { level: '重大风险', color: 'red' },
          { level: '重大风险', color: 'red' },
          { level: '重大风险', color: 'red' },
          { level: '重大风险', color: 'red' }
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
      // 风险等级矩阵 - 严格遵循GBT 33000-2025表D.1
      riskMatrix: [
        { likelihood: '几乎不可能', severity: '轻微', risk: '蓝', level: '低风险', controlNeeded: '一般控制', colorCode: 'blue' },
        { likelihood: '不太可能', severity: '一般', risk: '蓝', level: '低风险', controlNeeded: '一般控制', colorCode: 'blue' },
        { likelihood: '可能', severity: '一般', risk: '黄', level: '一般风险', controlNeeded: '监测与审查', colorCode: 'yellow' },
        { likelihood: '可能', severity: '较大', risk: '橙', level: '较大风险', controlNeeded: '管控措施', colorCode: 'orange' },
        { likelihood: '很可能', severity: '重大', risk: '红', level: '重大风险', controlNeeded: '立即整改', colorCode: 'red' },
        { likelihood: '几乎肯定', severity: '特大', risk: '红', level: '重大风险', controlNeeded: '立即停止作业', colorCode: 'red' }
      ],
      
      // MES法风险评估参数 (符合GBT 33000-2025要求)
      mesParameters: {
        // 控制措施状态 (M)
        controlMeasures: [
          { value: 1, name: '措施完善且有效实施', description: '已建立完善的控制措施并有效实施' },
          { value: 2, name: '措施基本完善', description: '有基本的控制措施但需优化' },
          { value: 3, name: '措施不完善', description: '控制措施不完善，存在明显漏洞' },
          { value: 4, name: '措施缺失', description: '基本无控制措施' },
          { value: 5, name: '无措施', description: '完全没有控制措施' }
        ],
        
        // 暴露频次 (E)
        exposureFrequency: [
          { value: 1, name: '非常低', description: '每年少于1次' },
          { value: 2, name: '低', description: '每季度1次' },
          { value: 3, name: '中等', description: '每月1次' },
          { value: 4, name: '高', description: '每周1次' },
          { value: 5, name: '非常高', description: '每天或以上' }
        ],
        
        // 事故后果 (S)
        accidentConsequence: [
          { value: 1, name: '轻微', description: '无人员伤亡，轻微财产损失' },
          { value: 2, name: '一般', description: '轻微人员伤害，较小财产损失' },
          { value: 3, name: '较大', description: '一般人员伤害，较大财产损失' },
          { value: 4, name: '重大', description: '严重人员伤害，重大财产损失' },
          { value: 5, name: '特大', description: '多人伤亡或重大财产损失' }
        ]
      },
      
      // 风险等级判定标准
      riskLevelCriteria: [
        { range: '≤5', level: '低风险', color: '蓝', colorCode: 'blue', controlType: '一般控制' },
        { range: '6-9', level: '一般风险', color: '黄', colorCode: 'yellow', controlType: '监测与审查' },
        { range: '10-12', level: '较大风险', color: '橙', colorCode: 'orange', controlType: '管控措施' },
        { range: '≥13', level: '重大风险', color: '红', colorCode: 'red', controlType: '立即整改' }
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
            pendingAssess: riskList.filter(r => r.status === '待评估').length,
            pendingControl: riskList.filter(r => r.status === '待管控').length,
            controlling: riskList.filter(r => r.status === '管控中').length,
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

    // 风险等级说明 - 符合GBT 33000-2025标准
    const riskDescriptions = {
      '低风险': '低风险，一般控制，可接受风险，继续监控',
      '一般风险': '一般风险，监测与审查，需注意并进行控制',
      '较大风险': '较大风险，管控措施，必须采取控制措施',
      '重大风险': '重大风险，立即整改，必须立即采取行动'
    }

    const riskColors = {
      '低风险': { color: 'minor', text: '低风险' },
      '一般风险': { color: 'general', text: '一般风险' },
      '较大风险': { color: 'large', text: '较大风险' },
      '重大风险': { color: 'major', text: '重大风险' }
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
