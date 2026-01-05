const app = getApp()

Page({
  data: {
    supervisionList: [],
    loading: true,
    filterStatus: 'all',
    currentFilterLabel: '全部',
    statusOptions: [
      { label: '全部', value: 'all' },
      { label: '立案督办', value: '立案督办' },
      { label: '整改中', value: '整改中' },
      { label: '待验证', value: '待验证' },
      { label: '已销号', value: '已销号' }
    ]
  },

  onLoad() {
    this.loadSupervisionList()
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      })
    }
  },

  onPullDownRefresh() {
    this.loadSupervisionList().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  loadSupervisionList() {
    this.setData({ loading: true })

    const db = wx.cloud.database()
    const _ = db.command

    let query = db.collection('hidden_danger_library').where({
      isSupervised: true
    })

    if (this.data.filterStatus !== 'all') {
      query = query.where({
        supervisionStatus: this.data.filterStatus
      })
    }

    query.orderBy('createdAt', 'desc').get({
      success: res => {
        const list = res.data.map(item => this.formatSupervisionItem(item))
        this.setData({
          supervisionList: list,
          loading: false
        })
      },
      fail: err => {
        console.error('加载督办列表失败:', err)
        app.showError('加载失败')
        this.setData({ loading: false })
      }
    })
  },

  formatSupervisionItem(item) {
    const now = new Date()
    const plannedDate = new Date(item.plannedCompleteDate)
    const remainingDays = Math.ceil((plannedDate - now) / (1000 * 60 * 60 * 24))
    
    let statusColor = '#1989fa'
    if (item.supervisionStatus === '已销号') {
      statusColor = '#07c160'
    } else if (item.supervisionStatus === '验收不通过继续整改') {
      statusColor = '#ee0a24'
    } else if (remainingDays < 0) {
      statusColor = '#ee0a24'
    } else if (remainingDays <= 7) {
      statusColor = '#ff976a'
    }

    return {
      ...item,
      remainingDays,
      isOverdue: remainingDays < 0,
      statusColor,
      plannedCompleteDate: this.formatDate(plannedDate),
      discoveryDate: this.formatDate(new Date(item.discoveryDate))
    }
  },

  onFilterChange(e) {
    const status = this.data.statusOptions[e.detail.value].value
    this.setData({
      filterStatus: status,
      currentFilterLabel: this.data.statusOptions[e.detail.value].label
    })
    this.loadSupervisionList()
  },

  onDetailTap(e) {
    const dangerId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/inspection/danger-detail?dangerId=${dangerId}`
    })
  },

  onSuperviseTap(e) {
    const dangerId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/inspection/supervision-detail?dangerId=${dangerId}`
    })
  },

  onVerifyTap(e) {
    const dangerId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/inspection/verify-danger?dangerId=${dangerId}`
    })
  },

  formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
})