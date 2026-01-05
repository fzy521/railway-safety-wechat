const app = getApp()

Page({
  data: {
    formData: {
      name: '',
      type: 'safety',
      typeName: '安全培训',
      target: '',
      participants: 0,
      plannedDate: '',
      plannedHours: 0,
      trainer: '',
      department: '',
      content: '',
      trainingMethod: '',
      objectives: '',
      assessmentMethod: '',
      requiredByLaw: false,
      notes: ''
    },
    typeOptions: [
      { label: '安全培训', value: 'safety' },
      { label: '资格培训', value: 'qualification' },
      { label: '应急培训', value: 'emergency' },
      { label: '技能培训', value: 'skill' }
    ]
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

  onTargetInput(e) {
    this.setData({ 'formData.target': e.detail.value })
  },

  onParticipantsInput(e) {
    this.setData({ 'formData.participants': parseInt(e.detail.value) || 0 })
  },

  onPlannedDateChange(e) {
    this.setData({ 'formData.plannedDate': e.detail.value })
  },

  onPlannedHoursInput(e) {
    this.setData({ 'formData.plannedHours': parseInt(e.detail.value) || 0 })
  },

  onTrainerInput(e) {
    this.setData({ 'formData.trainer': e.detail.value })
  },

  onDepartmentInput(e) {
    this.setData({ 'formData.department': e.detail.value })
  },

  onContentInput(e) {
    this.setData({ 'formData.content': e.detail.value })
  },

  onTrainingMethodInput(e) {
    this.setData({ 'formData.trainingMethod': e.detail.value })
  },

  onObjectivesInput(e) {
    this.setData({ 'formData.objectives': e.detail.value })
  },

  onAssessmentMethodInput(e) {
    this.setData({ 'formData.assessmentMethod': e.detail.value })
  },

  onRequiredByLawChange(e) {
    this.setData({ 'formData.requiredByLaw': e.detail.value })
  },

  onNotesInput(e) {
    this.setData({ 'formData.notes': e.detail.value })
  },

  onSubmit() {
    if (!this.data.formData.name) {
      wx.showToast({
        title: '请输入培训名称',
        icon: 'none'
      })
      return
    }

    if (!this.data.formData.target) {
      wx.showToast({
        title: '请输入培训对象',
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

    wx.showLoading({ title: '提交中...' })

    wx.cloud.callFunction({
      name: 'addTrainingPlan',
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
        console.error('添加培训计划失败:', err)
        app.showError('添加失败')
      }
    })
  }
})