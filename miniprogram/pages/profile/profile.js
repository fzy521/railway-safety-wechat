const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    hasUserInfo: false,
    statistics: {
      inspections: 0,
      incidents: 0,
      certificates: 0,
      experience: 0
    },
    menuItems: [
      {
        icon: '/images/icon-setting.png',
        title: '账号设置',
        desc: '修改密码和个人信息',
        page: '/pages/settings/settings'
      },
      {
        icon: '/images/icon-certificate.png',
        title: '我的证书',
        desc: '查看培训证书',
        page: '/pages/certificates/certificates'
      },
      {
        icon: '/images/icon-notification.png',
        title: '消息通知',
        desc: '系统通知和提醒',
        page: '/pages/notifications/notifications'
      },
      {
        icon: '/images/icon-help.png',
        title: '使用帮助',
        desc: '查看使用指南',
        page: '/pages/help/help'
      },
      {
        icon: '/images/icon-info.png',
        title: '关于系统',
        desc: '版本信息和更新日志',
        page: '/pages/about/about'
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.loadUserData()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 4
      })
    }
  },

  /**
   * 加载用户数据
   */
  loadUserData() {
    const userInfo = app.globalData.userInfo
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        hasUserInfo: true
      })
    }

    // 加载统计数据（使用模拟数据）
    this.setData({
      statistics: {
        inspections: 156,
        incidents: 23,
        certificates: 8,
        experience: 5
      }
    })
  },

  /**
   * 查看个人信息
   */
  viewProfile() {
    wx.navigateTo({
      url: '/pages/profile/profile-edit'
    })
  },

  /**
   * 处理菜单点击
   */
  handleMenuTap(event) {
    const page = event.currentTarget.dataset.page
    if (page) {
      wx.navigateTo({
        url: page,
        fail: () => {
          wx.showToast({
            title: '页面开发中',
            icon: 'none'
          })
        }
      })
    }
  },

  /**
   * 退出登录
   */
  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除登录状态
          app.globalData.userInfo = null
          app.globalData.hasUserInfo = false
          app.globalData.openid = null

          wx.showToast({
            title: '已退出登录',
            icon: 'success',
            duration: 2000,
            success: () => {
              setTimeout(() => {
                wx.reLaunch({
                  url: '/pages/login/login'
                })
              }, 2000)
            }
          })
        }
      }
    })
  },

  /**
   * 分享
   */
  onShareAppMessage() {
    return {
      title: '个人中心 - 铁路安全监控',
      path: '/pages/profile/profile'
    }
  }
})
