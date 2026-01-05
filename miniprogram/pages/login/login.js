const app = getApp()

Page({
  data: {
    // 登录页面数据
  },

  onLoad() {
    // 检查是否已经登录
    if (app.globalData.hasUserInfo) {
      this.redirectToHome()
    }
  },

  /**
   * 微信授权登录
   */
  onWechatLogin() {
    wx.showLoading({ title: '登录中...' })

    // 获取用户信息
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        console.log('获取用户信息成功:', res)

        // 保存用户信息
        app.globalData.userInfo = res.userInfo
        app.globalData.hasUserInfo = true

        // 调用云函数获取openid
        wx.cloud.callFunction({
          name: 'login',
          data: {},
          success: loginResult => {
            console.log('登录云函数调用成功:', loginResult)

            if (loginResult.result.success) {
              // 保存openid
              app.globalData.openid = loginResult.result.data.openid

              wx.hideLoading()

              // 显示登录成功提示
              wx.showToast({
                title: '登录成功',
                icon: 'success',
                duration: 1500
              })

              // 1秒后跳转到首页
              setTimeout(() => {
                this.redirectToHome()
              }, 1500)
            } else {
              this.handleLoginError(loginResult.result.error)
            }
          },
          fail: (err) => {
            console.error('登录云函数调用失败:', err)
            this.handleLoginError('登录失败，请重试')
          }
        })
      },
      fail: (err) => {
        console.error('获取用户信息失败:', err)
        this.handleLoginError('需要授权才能使用本小程序')
      }
    })
  },

  /**
   * 处理登录错误
   */
  handleLoginError(message) {
    wx.hideLoading()
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    })
  },

  /**
   * 跳转到首页
   */
  redirectToHome() {
    wx.reLaunch({
      url: '/pages/dashboard/dashboard'
    })
  },

  /**
   * 显示服务条款
   */
  showServiceTerms() {
    wx.showModal({
      title: '服务条款',
      content: `1. 本系统仅授权铁路相关人员使用\n2. 用户需遵守铁路安全规章制度\n3. 不得外传系统数据和信息\n4. 使用本系统即视为同意相关条款`,
      showCancel: false
    })
  },

  /**
   * 显示隐私政策
   */
  showPrivacyPolicy() {
    wx.showModal({
      title: '隐私政策',
      content: `1. 我们仅收集必要的用户信息\n2. 用户信息将严格保密\n3. 不会在未经同意的情况下共享信息\n4. 为用户提供数据查询和删除权利`,
      showCancel: false
    })
  },

  /**
   * 返回按钮
   */
  onBack() {
    wx.navigateBack()
  }
})