const app = getApp()

Page({
  data: {
    riskId: '',
    riskInfo: null,
    loading: true,
    relatedDangers: [],
    dangersLoading: true
  },

  onLoad(options) {
    if (!options.riskId) {
      app.showError('缺少风险ID')
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
      return
    }

    this.setData({
      riskId: options.riskId
    })
    
    this.loadRiskDetail(options.riskId)
    this.loadRelatedDangers(options.riskId)
  },

  loadRiskDetail(riskId) {
    wx.showLoading({ title: '加载中...' })
    
    wx.cloud.database().collection('risk_library').doc(riskId).get({
      success: res => {
        this.setData({
          riskInfo: res.data,
          riskLevelClass: this.getRiskLevelClass(res.data.riskColor),
          statusClass: this.getStatusClass(res.data.status),
          loading: false
        })
      },
      fail: err => {
        console.error('加载风险详情失败:', err)
        app.showError('加载失败')
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },

  loadRelatedDangers(riskId) {
    this.setData({ dangersLoading: true })
    
    wx.cloud.database().collection('hidden_danger_library').where({
      'associatedRisks.riskId': riskId
    }).get({
      success: res => {
        this.setData({
          relatedDangers: res.data,
          dangersLoading: false
        })
      },
      fail: err => {
        console.error('加载关联隐患失败:', err)
        this.setData({ dangersLoading: false })
      }
    })
  },

  onEditRisk() {
    wx.navigateTo({
      url: `/pages/risk/risk-identify?riskId=${this.data.riskId}`
    })
  },

  onReAssess() {
    wx.navigateTo({
      url: `/pages/risk/risk-assess?riskId=${this.data.riskId}`
    })
  },

  onReControl() {
    wx.navigateTo({
      url: `/pages/risk/risk-control?riskId=${this.data.riskId}`
    })
  },

  formatDate(date) {
    if (!date) return ''
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  getRiskLevelClass(riskColor) {
    const colorMap = {
      '红': 'red',
      '橙': 'orange',
      '黄': 'yellow',
      '蓝': 'blue'
    }
    return colorMap[riskColor] || 'blue'
  },

  getStatusClass(status) {
    const statusMap = {
      '待评估': 'pending-assess',
      '待管控': 'pending-control',
      '管控中': 'controlling',
      '管控有效': 'effective'
    }
    return statusMap[status] || ''
  }
})