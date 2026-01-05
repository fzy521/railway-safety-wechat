const app = getApp()

Page({
  data: {
    riskId: '',
    riskInfo: null,
    
    // 管控措施
    controlMeasures: '',
    controlPerson: '',
    controlDept: '',
    
    manageMeasures: '',
    manageDept: '',
    managePerson: '',
    
    // 管控信息
    controlDate: '',
    controller: '',
    controllerDept: '',
    controlNotes: '',
    
    // 检查计划
    nextCheckDate: '',
    checkFrequency: '',
    
    // 应急措施
    emergencyMeasures: '',
    emergencyContact: '',
    emergencyPhone: ''
  },

  onLoad(options) {
    if (!options.riskId) {
      app.showError('缺少风险ID')
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
      return
    }

    this.setData({
      riskId: options.riskId
    })
    
    this.loadRiskDetail(options.riskId)
  },

  loadRiskDetail(riskId) {
    wx.showLoading({ title: '加载中...' })
    
    wx.cloud.database().collection('risk_library').doc(riskId).get({
      success: res => {
        const risk = res.data
        const today = new Date()
        
        // 根据检查频次计算下次检查日期
        let nextCheckDate = new Date()
        if (risk.checkFrequency === '每周一次') {
          nextCheckDate.setDate(today.getDate() + 7)
        } else if (risk.checkFrequency === '每月一次') {
          nextCheckDate.setMonth(today.getMonth() + 1)
        } else if (risk.checkFrequency === '每季度一次') {
          nextCheckDate.setMonth(today.getMonth() + 3)
        } else if (risk.checkFrequency === '每半年一次') {
          nextCheckDate.setMonth(today.getMonth() + 6)
        }
        
        this.setData({
          riskInfo: risk,
          riskLevelClass: this.getRiskLevelClass(risk.riskColor),
          controlMeasures: risk.controlMeasures || '',
          controlPerson: risk.controlPerson || '',
          controlDept: risk.controlDept || '',
          manageMeasures: risk.manageMeasures || '',
          manageDept: risk.manageDept || '',
          managePerson: risk.managePerson || '',
          controlDate: risk.controlDate ? this.formatDate(new Date(risk.controlDate)) : this.formatDate(today),
          controller: risk.controller || app.globalData.userInfo?.name || '',
          controllerDept: risk.controllerDept || app.globalData.userInfo?.dept || '',
          controlNotes: risk.controlNotes || '',
          checkFrequency: risk.checkFrequency || '',
          nextCheckDate: risk.nextCheckDate ? this.formatDate(new Date(risk.nextCheckDate)) : this.formatDate(nextCheckDate),
          emergencyMeasures: risk.emergencyMeasures || '',
          emergencyContact: risk.emergencyContact || '',
          emergencyPhone: risk.emergencyPhone || ''
        })
      },
      fail: err => {
        console.error('加载风险详情失败:', err)
        app.showError('加载失败')
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },

  onControlMeasuresChange(e) {
    this.setData({ controlMeasures: e.detail.value })
  },

  onControlPersonChange(e) {
    this.setData({ controlPerson: e.detail.value })
  },

  onControlDeptChange(e) {
    this.setData({ controlDept: e.detail.value })
  },

  onManageMeasuresChange(e) {
    this.setData({ manageMeasures: e.detail.value })
  },

  onManageDeptChange(e) {
    this.setData({ manageDept: e.detail.value })
  },

  onManagePersonChange(e) {
    this.setData({ managePerson: e.detail.value })
  },

  onControlDateChange(e) {
    this.setData({ controlDate: e.detail.value })
  },

  onControllerChange(e) {
    this.setData({ controller: e.detail.value })
  },

  onControllerDeptChange(e) {
    this.setData({ controllerDept: e.detail.value })
  },

  onControlNotesChange(e) {
    this.setData({ controlNotes: e.detail.value })
  },

  onNextCheckDateChange(e) {
    this.setData({ nextCheckDate: e.detail.value })
  },

  onEmergencyMeasuresChange(e) {
    this.setData({ emergencyMeasures: e.detail.value })
  },

  onEmergencyContactChange(e) {
    this.setData({ emergencyContact: e.detail.value })
  },

  onEmergencyPhoneChange(e) {
    this.setData({ emergencyPhone: e.detail.value })
  },

  onSaveDraft() {
    wx.showLoading({ title: '保存中...' })

    const data = {
      controlMeasures: this.data.controlMeasures,
      controlPerson: this.data.controlPerson,
      controlDept: this.data.controlDept,
      manageMeasures: this.data.manageMeasures,
      manageDept: this.data.manageDept,
      managePerson: this.data.managePerson,
      controlDate: new Date(this.data.controlDate),
      controller: this.data.controller,
      controllerDept: this.data.controllerDept,
      controlNotes: this.data.controlNotes,
      nextCheckDate: new Date(this.data.nextCheckDate),
      emergencyMeasures: this.data.emergencyMeasures,
      emergencyContact: this.data.emergencyContact,
      emergencyPhone: this.data.emergencyPhone,
      status: '待管控',
      updatedAt: new Date()
    }

    wx.cloud.database().collection('risk_library').doc(this.data.riskId).update({
      data: data,
      success: () => {
        app.showSuccess('保存成功')
      },
      fail: err => {
        console.error('保存失败:', err)
        app.showError('保存失败')
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },

  onSubmit() {
    if (!this.validateForm()) {
      return
    }

    wx.showModal({
      title: '确认提交',
      content: '确认提交管控措施？提交后风险将进入管控状态。',
      success: (res) => {
        if (res.confirm) {
          this.onSubmitControl()
        }
      }
    })
  },

  onSubmitControl() {
    wx.showLoading({ title: '提交中...' })

    const data = {
      controlMeasures: this.data.controlMeasures,
      controlPerson: this.data.controlPerson,
      controlDept: this.data.controlDept,
      manageMeasures: this.data.manageMeasures,
      manageDept: this.data.manageDept,
      managePerson: this.data.managePerson,
      controlDate: new Date(this.data.controlDate),
      controller: this.data.controller,
      controllerDept: this.data.controllerDept,
      controlNotes: this.data.controlNotes,
      nextCheckDate: new Date(this.data.nextCheckDate),
      emergencyMeasures: this.data.emergencyMeasures,
      emergencyContact: this.data.emergencyContact,
      emergencyPhone: this.data.emergencyPhone,
      status: '管控中',
      controlledBy: app.globalData.userInfo?.name || '',
      updatedAt: new Date()
    }

    wx.cloud.database().collection('risk_library').doc(this.data.riskId).update({
      data: data,
      success: () => {
        app.showSuccess('管控措施已生效')
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      },
      fail: err => {
        console.error('提交失败:', err)
        app.showError('提交失败')
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },

  validateForm() {
    if (!this.data.controlMeasures) {
      app.showError('请输入岗位控制措施')
      return false
    }
    if (!this.data.controlPerson) {
      app.showError('请输入岗位控制人')
      return false
    }
    if (!this.data.controlDept) {
      app.showError('请输入岗位控制部门')
      return false
    }
    if (!this.data.manageMeasures) {
      app.showError('请输入管控措施')
      return false
    }
    if (!this.data.manageDept) {
      app.showError('请输入管控责任部门')
      return false
    }
    if (!this.data.managePerson) {
      app.showError('请输入管控责任人')
      return false
    }
    if (!this.data.nextCheckDate) {
      app.showError('请选择下次检查日期')
      return false
    }
    return true
  },

  formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  getRiskLevelClass(riskColor) {
    const colorMap = {
      '红': 'red',
      '橙': 'orange',
      '黄': 'yellow',
      '蓝': 'blue'
    }
    return colorMap[riskColor] || 'blue'
  }
})