const app = getApp()

Page({
  data: {
    formData: {
      name: '',
      type: 'annual',
      typeName: '年度评审',
      plannedDate: '',
      responsibleDept: '',
      responsiblePerson: '',
      participants: '',
      reviewScope: '',
      reviewBasis: '',
      reviewFocus: '',
      notes: ''
    },
    typeOptions: [
      { label: '年度评审', value: 'annual' },
      { label: '半年评审', value: 'semi-annual' },
      { label: '季度评审', value: 'quarterly' },
      { label: '专项评审', value: 'special' }
    ],
    showTypePicker: false
  },

  onLoad() {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    this.setData({
      'formData.plannedDate': `${year}-${month}-${day}`
    })
  },

  onNameInput(e) {
    this.setData({ 'formData.name': e.detail.value })
  },

  onTypeChange(e) {
    const index = e.detail.value
    this.setData({
      'formData.type': this.data.typeOptions[index].value,
      'formData.typeName': this.data.typeOptions[index].label
    })
  },

  onPlannedDateChange(e) {
    this.setData({ 'formData.plannedDate': e.detail.value })
  },

  onResponsibleDeptInput(e) {
    this.setData({ 'formData.responsibleDept': e.detail.value })
  },

  onResponsiblePersonInput(e) {
    this.setData({ 'formData.responsiblePerson': e.detail.value })
  },

  onParticipantsInput(e) {
    this.setData({ 'formData.participants': e.detail.value })
  },

  onReviewScopeInput(e) {
    this.setData({ 'formData.reviewScope': e.detail.value })
  },

  onReviewBasisInput(e) {
    this.setData({ 'formData.reviewBasis': e.detail.value })
  },

  onReviewFocusInput(e) {
    this.setData({ 'formData.reviewFocus': e.detail.value })
  },

  onNotesInput(e) {
    this.setData({ 'formData.notes': e.detail.value })
  },

  onSubmit() {
    if (!this.data.formData.name) {
      wx.showToast({
        title: '请输入评审名称',
        icon: 'none'
      })
      return
    }

    if (!this.data.formData.plannedDate) {
      wx.showToast({
        title: '请选择计划日期',
        icon: 'none'
      })
      return
    }

    if (!this.data.formData.responsibleDept) {
      wx.showToast({
        title: '请输入责任部门',
        icon: 'none'
      })
      return
    }

    if (!this.data.formData.responsiblePerson) {
      wx.showToast({
        title: '请输入责任人',
        icon: 'none'
      })
      return
    }

    wx.showLoading({ title: '提交中...' })

    wx.cloud.callFunction({
      name: 'addReviewPlan',
      data: {
        plan: this.data.formData
      },
      success: res => {
        wx.hideLoading()
        if (res.result.success) {
          wx.showToast({
            title: '添加成功',
            icon: 'success'
          })
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
        } else {
          app.showError(res.result.error || '添加失败')
        }
      },
      fail: err => {
        wx.hideLoading()
        console.error('添加评审计划失败:', err)
        app.showError('添加失败')
      }
    })
  }
})