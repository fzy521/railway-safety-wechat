// pages/scan-login/scan-login.js
const app = getApp()

Page({
  data: {
    status: ''
  },

  onLoad() {
    // 检查用户是否已登录
    this.checkLoginStatus()
  },

  // 检查登录状态
  checkLoginStatus() {
    const userInfo = app.globalData.userInfo

    if (!userInfo) {
      this.setData({
        status: '请先登录小程序'
      })

      // 显示登录提示
      wx.showModal({
        title: '提示',
        content: '需要先登录小程序才能使用扫码登录功能',
        confirmText: '去登录',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            // 跳转到登录页面
            wx.reLaunch({
              url: '/pages/login/login'
            })
          } else {
            // 返回上一页
            wx.navigateBack()
          }
        }
      })
      return
    }

    // 已登录,自动开始扫码
    setTimeout(() => {
      this.handleScanCode()
    }, 500)
  },

  // 扫码
  handleScanCode() {
    wx.scanCode({
      scanType: ['qrCode'],
      success: (res) => {
        console.log('扫码结果:', res.result)

        try {
          const loginData = JSON.parse(res.result)

          // 验证是否是Web登录二维码
          if (loginData.type === 'web_login' && loginData.sessionId) {
            this.setData({
              status: '扫码成功,请确认登录'
            })

            // 调用云函数确认登录
            this.confirmLogin(loginData.sessionId)
          } else {
            this.setData({
              status: '无效的二维码'
            })
            wx.showToast({
              title: '无效的二维码',
              icon: 'none'
            })
          }
        } catch (error) {
          console.error('解析二维码失败:', error)
          this.setData({
            status: '二维码格式错误'
          })
          wx.showToast({
            title: '二维码格式错误',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        console.error('扫码失败:', err)
        if (err.errMsg !== 'scanCode:fail cancel') {
          wx.showToast({
            title: '扫码失败',
            icon: 'none'
          })
        }
      }
    })
  },

  // 确认登录
  async confirmLogin(sessionId) {
    try {
      // 获取用户信息
      const userInfo = app.globalData.userInfo

      if (!userInfo) {
        wx.showToast({
          title: '请先登录小程序',
          icon: 'none'
        })
        setTimeout(() => {
          wx.reLaunch({
            url: '/pages/login/login'
          })
        }, 1500)
        return
      }

      // 调用云函数确认登录
      const result = await wx.cloud.callFunction({
        name: 'webLogin',
        data: {
          action: 'confirm',
          sessionId: sessionId,
          userInfo: userInfo
        }
      })

      console.log('确认登录结果:', result)

      if (result.result.success) {
        this.setData({
          status: '登录成功!'
        })

        wx.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 2000
        })

        // 返回上一页
        setTimeout(() => {
          wx.navigateBack()
        }, 2000)
      } else {
        this.setData({
          status: '登录失败'
        })
        wx.showToast({
          title: result.result.error || '登录失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('确认登录失败:', error)
      this.setData({
        status: '登录失败'
      })
      wx.showToast({
        title: '登录失败',
        icon: 'none'
      })
    }
  },

  // 取消
  handleCancel() {
    wx.navigateBack()
  }
})