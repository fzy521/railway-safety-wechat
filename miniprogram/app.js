App({
  // 全局数据
  globalData: {
    // 云开发环境ID
    cloudEnv: 'cloud1-9gz3lqctb5e4f85d',
    userInfo: null,
    hasUserInfo: false,
    systemInfo: {}
  },

  onLaunch() {
    console.log('小程序启动')
    const that = this

    // 初始化云开发环境
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: this.globalData.cloudEnv,
        traceUser: true,
      })
    }

    // 获取系统信息
    wx.getSystemInfo({
      success: res => {
        that.globalData.systemInfo = res
      }
    })

    // 检查登录状态
    this.checkLoginStatus()
  },

  // 检查登录状态
  checkLoginStatus() {
    wx.checkSession({
      success: () => {
        // session_key 未过期，并且在本生命周期一直有效
        this.getUserInfo()
      },
      fail: () => {
        // session_key 已经失效，需要重新执行登录流程
        console.log('session_key 已过期，需要重新登录')
      }
    })
  },

  // 获取用户信息
  getUserInfo() {
    const that = this
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              that.globalData.userInfo = res.userInfo
              that.globalData.hasUserInfo = true
              // 获取用户openid等信息
              that.getUserOpenId()
            }
          })
        }
      }
    })
  },

  // 获取用户openid
  getUserOpenId() {
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        this.globalData.openid = res.result.openid
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  },

  // 全局函数：跳转到登录页面
  toLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  },

  // 全局函数：显示错误提示
  showError(message) {
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    })
  },

  // 全局函数：显示成功提示
  showSuccess(message) {
    wx.showToast({
      title: message,
      icon: 'success',
      duration: 2000
    })
  }
})