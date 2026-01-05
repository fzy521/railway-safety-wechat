Page({
  data: {
    formData: {
      name: '',
      typeIndex: ''
    },
    planTypes: [
      { label: '综合应急预案', value: 'comprehensive' },
      { label: '专项应急预案', value: 'special' },
      { label: '现场处置方案', value: 'field' }
    ]
  },

  onLoad(options) {
    console.log('plan-add page loaded')
  },

  onInputChange(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    const key = 'formData.' + field
    const updateData = {}
    updateData[key] = value
    this.setData(updateData)
  },

  onTypeChange(e) {
    const index = e.detail.value
    this.setData({
      'formData.typeIndex': index
    })
  },

  handleSubmit(e) {
    console.log('submit', e.detail.value)
    wx.showToast({
      title: '保存成功',
      icon: 'success'
    })
  },

  handleCancel() {
    wx.navigateBack()
  }
})
