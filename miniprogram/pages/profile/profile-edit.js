const app = getApp()

Page({
  data: {
    userInfo: {},
    loading: true,
    formData: {
      name: '',
      phone: '',
      dept: '',
      position: '',
      email: ''
    }
  },

  onLoad() {
    this.loadUserInfo()
  },

  loadUserInfo() {
    const userInfo = app.globalData.userInfo
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        formData: {
          name: userInfo.nickName || '',
          phone: userInfo.phone || '',
          dept: userInfo.dept || '',
          position: userInfo.position || '',
          email: userInfo.email || ''
        },
        loading: false
      })
    } else {
      this.setData({ loading: false })
    }
  },

  onNameInput(e) {
    this.setData({ 'formData.name': e.detail.value })
  },

  onPhoneInput(e) {
    this.setData({ 'formData.phone': e.detail.value })
  },

  onDeptInput(e) {
    this.setData({ 'formData.dept': e.detail.value })
  },

  onPositionInput(e) {
    this.setData({ 'formData.position': e.detail.value })
  },

  onEmailInput(e) {
    this.setData({ 'formData.email': e.detail.value })
  },

  onSave() {
    if (!this.data.formData.name) {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none'
      })
      return
    }

    wx.showLoading({ title: '保存中...' })

    wx.cloud.callFunction({
      name: 'updateUserInfo',
      data: {
        userInfo: this.data.formData
      },
      success: res => {
        wx.hideLoading()
        if (res.result.success) {
          app.globalData.userInfo = {
            ...app.globalData.userInfo,
            ...this.data.formData
          }
          wx.showToast({
            title: '保存成功',
            icon: 'success'
          })
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
        } else {
          app.showError(res.result.error || '保存失败')
        }
      },
      fail: err => {
        wx.hideLoading()
        console.error('保存失败:', err)
        app.showError('保存失败')
      }
    })
  }
})