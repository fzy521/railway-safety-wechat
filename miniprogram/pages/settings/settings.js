const app = getApp()

Page({
  data: {
    userInfo: {},
    settings: {
      messageNotification: true,
      riskAlert: true,
      dangerAlert: true
    },
    cacheSize: '0MB'
  },

  onLoad() {
    this.loadUserInfo()
    this.getCacheSize()
  },

  loadUserInfo() {
    const userInfo = app.globalData.userInfo
    if (userInfo) {
      this.setData({ userInfo })
    }
  },

  getCacheSize() {
    wx.getStorageInfo({
      success: res => {
        const size = (res.currentSize / 1024).toFixed(2)
        this.setData({ cacheSize: size + 'MB' })
      }
    })
  },

  editProfile() {
    wx.navigateTo({
      url: '/pages/profile/profile-edit'
    })
  },

  changeAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        const tempFilePath = res.tempFilePaths[0]
        this.uploadAvatar(tempFilePath)
      }
    })
  },

  uploadAvatar(filePath) {
    wx.showLoading({ title: '上传中...' })

    wx.cloud.uploadFile({
      cloudPath: 'avatars/' + Date.now() + '.jpg',
      filePath: filePath,
      success: res => {
        wx.hideLoading()
        this.updateAvatarUrl(res.fileID)
      },
      fail: err => {
        wx.hideLoading()
        console.error('上传失败:', err)
        app.showError('上传失败')
      }
    })
  },

  updateAvatarUrl(fileID) {
    wx.cloud.callFunction({
      name: 'updateUserInfo',
      data: {
        action: 'update',
        userInfo: {
          avatarUrl: fileID
        }
      },
      success: res => {
        if (res.result.success) {
          app.globalData.userInfo.avatarUrl = fileID
          this.setData({
            'userInfo.avatarUrl': fileID
          })
          wx.showToast({
            title: '修改成功',
            icon: 'success'
          })
        }
      }
    })
  },

  changePassword() {
    wx.navigateTo({
      url: '/pages/settings/change-password'
    })
  },

  bindPhone() {
    wx.navigateTo({
      url: '/pages/settings/bind-phone'
    })
  },

  bindEmail() {
    wx.navigateTo({
      url: '/pages/settings/bind-email'
    })
  },

  onNotificationChange(e) {
    this.setData({
      'settings.messageNotification': e.detail.value
    })
    this.saveSettings()
  },

  onRiskAlertChange(e) {
    this.setData({
      'settings.riskAlert': e.detail.value
    })
    this.saveSettings()
  },

  onDangerAlertChange(e) {
    this.setData({
      'settings.dangerAlert': e.detail.value
    })
    this.saveSettings()
  },

  saveSettings() {
    wx.cloud.callFunction({
      name: 'updateUserInfo',
      data: {
        action: 'update',
        userInfo: {
          settings: this.data.settings
        }
      },
      success: res => {
        if (res.result.success) {
          wx.showToast({
            title: '设置已保存',
            icon: 'success'
          })
        }
      }
    })
  },

  clearCache() {
    wx.showModal({
      title: '确认清除',
      content: '确定要清除缓存吗？',
      success: res => {
        if (res.confirm) {
          wx.clearStorage({
            success: () => {
              wx.showToast({
                title: '清除成功',
                icon: 'success'
              })
              this.getCacheSize()
            }
          })
        }
      }
    })
  },

  checkUpdate() {
    wx.showLoading({ title: '检查中...' })

    setTimeout(() => {
      wx.hideLoading()
      wx.showModal({
        title: '已是最新版本',
        content: '当前版本 v1.0.0 已是最新版本',
        showCancel: false
      })
    }, 1000)
  }
})