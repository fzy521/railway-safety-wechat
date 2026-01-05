Page({
  /**
   * 页面的初始数据
   */
  data: {
    planId: '',
    planName: '',
    formData: {
      date: '',
      startTime: '',
      endTime: '',
      typeIndex: '',
      participants: '',
      scenario: '',
      objectives: '',
      executor: '',
      recorder: '',
      completionStatusIndex: 0,
      effectivenessIndex: 0,
      issues: '',
      improvements: '',
      remarks: ''
    },
    drillTypes: [
      { label: '桌面演练', value: 'tabletop' },
      { label: '功能演练', value: 'functional' },
      { label: '现场演练', value: 'field' },
      { label: '综合演练', value: 'comprehensive' }
    ],
    completionStatuses: [
      { label: '已完成', value: 'completed' },
      { label: '进行中', value: 'ongoing' },
      { label: '已取消', value: 'cancelled' },
      { label: '延期', value: 'postponed' }
    ],
    effectivenessLevels: [
      { label: '效果良好', value: 'good' },
      { label: '合格', value: 'qualified' },
      { label: '需改进', value: 'need_improvement' },
      { label: '不合格', value: 'unqualified' }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 获取预案ID和名称
    const { planId, planName } = options
    
    if (planId) {
      this.setData({ planId, planName })
    }

    // 设置默认日期
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    
    this.setData({
      'formData.date': todayStr
    })
  },

  /**
   * 表单输入变化
   */
  onInputChange(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    this.setData({
      [`formData.${field}`]: value
    })
  },

  /**
   * 演练日期选择
   */
  onDateChange(e) {
    this.setData({
      'formData.date': e.detail.value
    })
  },

  /**
   * 开始时间选择
   */
  onStartTimeChange(e) {
    this.setData({
      'formData.startTime': e.detail.value
    })
  },

  /**
   * 结束时间选择
   */
  onEndTimeChange(e) {
    this.setData({
      'formData.endTime': e.detail.value
    })
  },

  /**
   * 演练类型选择
   */
  onTypeChange(e) {
    const index = e.detail.value
    this.setData({
      'formData.typeIndex': index
    })
  },

  /**
   * 完成状态选择
   */
  onCompletionStatusChange(e) {
    const index = e.detail.value
    this.setData({
      'formData.completionStatusIndex': index
    })
  },

  /**
   * 演练效果选择
   */
  onEffectivenessChange(e) {
    const index = e.detail.value
    this.setData({
      'formData.effectivenessIndex': index
    })
  },

  /**
   * 表单验证
   */
  validateForm() {
    const { formData, drillTypes, completionStatuses, effectivenessLevels } = this.data

    if (!formData.date) {
      wx.showToast({ title: '请选择演练日期', icon: 'none' })
      return false
    }

    if (!formData.startTime) {
      wx.showToast({ title: '请选择开始时间', icon: 'none' })
      return false
    }

    if (formData.typeIndex === '') {
      wx.showToast({ title: '请选择演练类型', icon: 'none' })
      return false
    }

    if (formData.completionStatusIndex === '') {
      wx.showToast({ title: '请选择完成状态', icon: 'none' })
      return false
    }

    if (formData.effectivenessIndex === '') {
      wx.showToast({ title: '请选择演练效果', icon: 'none' })
      return false
    }

    return true
  },

  /**
   * 提交表单
   */
  handleSubmit(e) {
    if (!this.validateForm()) {
      return
    }

    const { formData, planId, planName, drillTypes, completionStatuses, effectivenessLevels } = this.data

    // 生成演练记录ID
    const drillId = 'DR' + String(Date.now()).slice(-6)

    // 计算演练时长
    let duration = '进行中'
    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01 ${formData.startTime}`)
      const end = new Date(`2000-01-01 ${formData.endTime}`)
      const diff = end - start
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      
      if (hours > 0) {
        duration = `${hours}小时${minutes > 0 ? minutes + '分钟' : ''}`
      } else {
        duration = `${minutes}分钟`
      }
    }

    // 构建演练记录数据
    const drillData = {
      id: drillId,
      planId: planId,
      planName: planName,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      duration: duration,
      type: drillTypes[formData.typeIndex].value,
      typeName: drillTypes[formData.typeIndex].label,
      participants: formData.participants || '未记录',
      scenario: formData.scenario,
      objectives: formData.objectives,
      executor: formData.executor,
      recorder: formData.recorder,
      completionStatus: completionStatuses[formData.completionStatusIndex].value,
      effectiveness: effectivenessLevels[formData.effectivenessIndex].value,
      effectivenessText: effectivenessLevels[formData.effectivenessIndex].label,
      issues: formData.issues,
      improvements: formData.improvements,
      remarks: formData.remarks,
      createTime: new Date().toISOString()
    }

    // 保存演练记录
    this.saveDrill(drillData)
  },

  /**
   * 保存演练记录
   */
  saveDrill(drillData) {
    // TODO: 调用云函数保存到数据库
    wx.showLoading({ title: '保存中...' })

    // 模拟保存
    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({
        title: '演练记录添加成功',
        icon: 'success'
      })

      // 返回上一页
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }, 1000)
  },

  /**
   * 取消操作
   */
  handleCancel() {
    wx.showModal({
      title: '提示',
      content: '确定要取消添加演练记录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack()
        }
      }
    })
  }
})