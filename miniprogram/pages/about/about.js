Page({
  data: {
    version: '1.0.0',
    features: [
      {
        id: '1',
        icon: '/images/exclamationcircle-f.png',
        title: '风险分级管控',
        desc: '全面识别和管理各类安全风险'
      },
      {
        id: '2',
        icon: '/images/bug-report.png',
        title: '隐患排查治理',
        desc: '及时发现并整改安全隐患'
      },
      {
        id: '3',
        icon: '/images/check-circle-fill.png',
        title: '智能巡检记录',
        desc: '数字化记录巡检过程和结果'
      },
      {
        id: '4',
        icon: '/images/lightbulb-fill.png',
        title: '应急管理',
        desc: '应急预案管理和应急演练'
      }
    ]
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
  },

  viewAgreement() {
    wx.navigateTo({
      url: '/pages/about/agreement'
    })
  },

  viewPrivacy() {
    wx.navigateTo({
      url: '/pages/about/privacy'
    })
  },

  viewLicense() {
    wx.navigateTo({
      url: '/pages/about/license'
    })
  }
})