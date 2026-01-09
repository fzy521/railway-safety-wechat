const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    dangerId: '',
    dangerDetail: null,
    relatedRisks: [],
    risksLoading: false,
    loading: true,
    statusMap: {
      'identified': '已发现',
      'treating': '整改中',
      'completed': '已完成',
      'verified': '已验证',
      'closed': '已关闭'
    },
    priorityMap: {
      '1': '重要',
      '2': '较重要',
      '3': '一般'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const dangerId = options.id || options.dangerId
    this.setData({
      dangerId: dangerId
    })
    this.loadDangerDetail(dangerId)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      })
    }
  },

  /**
   * 加载隐患详情
   */
  loadDangerDetail(id) {
    this.setData({ loading: true })
    wx.showLoading({ title: '加载中...' })

    const db = wx.cloud.database()
    db.collection('hidden_danger_library').doc(id).get({
      success: res => {
        const dangerDetail = res.data
        this.setData({
          dangerDetail: this.formatDangerDetail(dangerDetail),
          loading: false
        })
        wx.hideLoading()
        this.loadRelatedRisks(id)
      },
      fail: err => {
        console.error('加载隐患详情失败:', err)
        app.showError('加载失败')
        wx.hideLoading()
        this.setData({ loading: false })
      }
    })
  },

  /**
   * 加载关联风险
   */
  loadRelatedRisks(dangerId) {
    this.setData({ risksLoading: true })
    
    const db = wx.cloud.database()
    const _ = db.command
    
    // 从隐患详情中获取关联的风险ID，然后查询风险信息
    db.collection('risk_library').where({
      id: _.in(this.data.dangerDetail.associatedRisks.map(risk => risk.riskId))
    }).get({
      success: res => {
        const relatedRisks = res.data.map(risk => ({
          ...risk,
          riskColor: this.getRiskColor(risk.riskLevel)
        }))
        
        this.setData({
          relatedRisks: relatedRisks,
          risksLoading: false
        })
      },
      fail: err => {
        console.error('加载关联风险失败:', err)
        app.showError('加载关联风险失败')
        this.setData({ risksLoading: false })
      }
    })
  },

  /**
   * 格式化隐患详情数据
   */
  formatDangerDetail(danger) {
    // 格式化日期
    if (danger.discoveryDate) {
      danger.discoveryDate = this.formatDate(new Date(danger.discoveryDate))
    }
    if (danger.plannedCompleteDate) {
      danger.plannedCompleteDate = this.formatDate(new Date(danger.plannedCompleteDate))
    }
    if (danger.actualCompleteDate) {
      danger.actualCompleteDate = this.formatDate(new Date(danger.actualCompleteDate))
    }
    
    // 格式化状态
    if (danger.status) {
      danger.statusName = this.data.statusMap[danger.status] || danger.status
    }
    
    // 格式化优先级
    if (danger.priority) {
      danger.priorityName = this.data.priorityMap[danger.priority] || danger.priority
    }
    
    return danger
  },

  /**
   * 格式化日期
   */
  formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}`
  },

  /**
   * 获取风险颜色
   */
  getRiskColor(level) {
    switch (level) {
      case '重大':
        return '#ee0a24'
      case '较大':
        return '#ff6b35'
      case '一般':
        return '#ff976a'
      case '低风险':
        return '#36cbcb'
      default:
        return '#999'
    }
  },

  /**
   * 查看风险详情
   */
  viewRiskDetail(e) {
    const riskId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/risk/risk-detail?riskId=${riskId}`
    })
  },

  /**
   * 开始整改
   */
  startRectification() {
    wx.showModal({
      title: '确认开始整改',
      content: '是否开始整改此隐患？',
      success: (res) => {
        if (res.confirm) {
          this.updateDangerStatus('treating')
        }
      }
    })
  },

  /**
   * 完成整改
   */
  completeRectification() {
    wx.showModal({
      title: '确认完成整改',
      content: '是否确认完成此隐患的整改？',
      success: (res) => {
        if (res.confirm) {
          this.updateDangerStatus('completed')
        }
      }
    })
  },

  /**
   * 提交验证
   */
  submitVerification() {
    wx.showModal({
      title: '提交验证',
      content: '是否提交整改验证申请？',
      success: (res) => {
        if (res.confirm) {
          this.updateDangerStatus('verified')
        }
      }
    })
  },

  /**
   * 更新隐患状态
   */
  updateDangerStatus(newStatus) {
    wx.showLoading({ title: '处理中...' })
    
    const db = wx.cloud.database()
    db.collection('hidden_danger_library').doc(this.data.dangerId).update({
      data: {
        status: newStatus,
        updatedAt: db.serverDate()
      },
      success: res => {
        wx.hideLoading()
        wx.showToast({ title: '操作成功', icon: 'success' })
        // 重新加载隐患详情
        this.loadDangerDetail(this.data.dangerId)
      },
      fail: err => {
        console.error('更新状态失败:', err)
        wx.hideLoading()
        app.showError('操作失败')
      }
    })
  },

  /**
   * 分享到微信
   */
  onShareAppMessage() {
    return {
      title: `隐患详情：${this.data.dangerDetail?.title || '隐患详情'}`,
      path: `/pages/inspection/danger-detail?id=${this.data.dangerId}`
    }
  }
})
