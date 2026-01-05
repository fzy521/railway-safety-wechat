const app = getApp()

Page({
  data: {
    notifications: [],
    activeTab: 'all',
    unreadCount: 0,
    hasUnread: false,
    loading: true
  },

  onLoad() {
    this.loadNotifications()
  },

  loadNotifications() {
    wx.showLoading({ title: '加载中...' })

    // 模拟数据 - 实际应该从数据库读取
    const mockNotifications = [
      {
        id: '1',
        type: 'risk',
        title: '重大风险预警',
        desc: '邹平站场 K15+300 处轨道连接螺栓松动风险等级上升为重大风险，请立即处理',
        icon: '/images/exclamationcircle-f.png',
        time: '10分钟前',
        read: false,
        tag: '紧急'
      },
      {
        id: '2',
        type: 'danger',
        title: '隐患整改提醒',
        desc: '专用线 K8+200 接触网支柱基础开裂隐患整改期限即将到期，请加快整改进度',
        icon: '/images/bug-report.png',
        time: '1小时前',
        read: false,
        tag: '督办'
      },
      {
        id: '3',
        type: 'system',
        title: '系统更新通知',
        desc: '铁路安全监控系统已更新至 v1.1.0 版本，新增数据导出功能',
        icon: '/images/icon-notification.png',
        time: '昨天',
        read: true,
        tag: null
      },
      {
        id: '4',
        type: 'risk',
        title: '风险识别提醒',
        desc: '本月风险识别任务即将到期，请及时完成风险点排查工作',
        icon: '/images/exclamationcircle-f.png',
        time: '2天前',
        read: true,
        tag: null
      },
      {
        id: '5',
        type: 'danger',
        title: '隐患验收通知',
        desc: '邹平站场轨道连接螺栓隐患已完成整改，请进行验收确认',
        icon: '/images/bug-report.png',
        time: '3天前',
        read: true,
        tag: null
      }
    ]

    setTimeout(() => {
      wx.hideLoading()
      const unreadCount = mockNotifications.filter(n => !n.read).length
      this.setData({
        notifications: mockNotifications,
        unreadCount: unreadCount,
        hasUnread: unreadCount > 0,
        loading: false
      })
    }, 1000)
  },

  get filteredNotifications() {
    const { notifications, activeTab } = this.data
    if (activeTab === 'all') {
      return notifications
    }
    return notifications.filter(n => n.type === activeTab)
  },

  switchTab(event) {
    const tab = event.currentTarget.dataset.tab
    this.setData({ activeTab: tab })
  },

  viewNotification(event) {
    const id = event.currentTarget.dataset.id
    const notification = this.data.notifications.find(n => n.id === id)

    if (notification && !notification.read) {
      // 标记为已读
      const notifications = this.data.notifications.map(n => {
        if (n.id === id) {
          return { ...n, read: true }
        }
        return n
      })
      const unreadCount = notifications.filter(n => !n.read).length
      this.setData({
        notifications,
        unreadCount,
        hasUnread: unreadCount > 0
      })
    }

    // 跳转到详情页
    wx.navigateTo({
      url: `/pages/notifications/notification-detail?id=${id}`
    })
  },

  markAllRead() {
    wx.showModal({
      title: '确认操作',
      content: '确定将所有通知标记为已读吗？',
      success: res => {
        if (res.confirm) {
          const notifications = this.data.notifications.map(n => ({ ...n, read: true }))
          this.setData({
            notifications,
            unreadCount: 0,
            hasUnread: false
          })
          wx.showToast({
            title: '已全部标记为已读',
            icon: 'success'
          })
        }
      }
    })
  }
})