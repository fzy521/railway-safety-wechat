const app = getApp()

Page({
  data: {
    warningList: [],
    loading: true,
    filterStatus: 'all',
    currentFilterLabel: '全部',
    statusOptions: [
      { label: '全部', value: 'all' },
      { label: '已下发', value: '已下发' },
      { label: '整改中', value: '整改中' },
      { label: '待验收', value: '待验收' },
      { label: '已验收', value: '已验收' }
    ]
  },

  onLoad() {
    this.loadWarningList()
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      })
    }
  },

  onPullDownRefresh() {
    this.loadWarningList().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  loadWarningList() {
    this.setData({ loading: true })

    wx.cloud.callFunction({
      name: 'risk-warning',
      data: {
        action: 'list',
        status: this.data.filterStatus
      },
      success: res => {
        if (res.result.success) {
          const list = res.result.data.map(item => this.formatWarningItem(item))
          this.setData({
            warningList: list,
            loading: false
          })
        }
      },
      fail: err => {
        console.error('加载预警列表失败:', err)
        app.showError('加载失败')
        this.setData({ loading: false })
      }
    })
  },

  formatWarningItem(item) {
    const now = new Date()
    const deadline = new Date(item.deadline)
    const remainingDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24))

    let levelColor = '#1989fa'
    if (item.warningLevel === '红') {
      levelColor = '#ee0a24'
    } else if (item.warningLevel === '橙') {
      levelColor = '#ff976a'
    } else if (item.warningLevel === '黄') {
      levelColor = '#ffbe00'
    } else {
      levelColor = '#07c160'
    }

    return {
      ...item,
      remainingDays,
      isOverdue: remainingDays < 0 && item.status !== '已验收',
      levelColor
    }
  },

  onFilterChange(e) {
    const status = this.data.statusOptions[e.detail.value].value
    this.setData({
      filterStatus: status,
      currentFilterLabel: this.data.statusOptions[e.detail.value].label
    })
    this.loadWarningList()
  },

  onDetailTap(e) {
    const warningId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/risk/warning-detail?warningId=${warningId}`
    })
  },

  onCreateWarning() {
    wx.navigateTo({
      url: '/pages/risk/create-warning'
    })
  },

  onAutoTrigger() {
    wx.showModal({
      title: '确认触发',
      content: '是否自动触发高风险预警？',
      success: res => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' })
          
          wx.cloud.callFunction({
            name: 'risk-warning',
            data: {
              action: 'auto_trigger'
            },
            success: res => {
              if (res.result.success) {
                app.showSuccess(res.result.message)
                this.loadWarningList()
              }
            },
            fail: err => {
              console.error('自动触发失败:', err)
              app.showError('操作失败')
            },
            complete: () => {
              wx.hideLoading()
            }
          })
        }
      }
    })
  }
})