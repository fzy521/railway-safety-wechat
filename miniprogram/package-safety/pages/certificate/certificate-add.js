const app = getApp()

Page({
  data: {
    formData: {
      certNo: '',
      employeeId: '',
      employeeName: '',
      department: '',
      position: '',
      certType: 'special',
      typeName: '特种作业操作证',
      certName: '',
      issuingAuthority: '',
      issueDate: '',
      expiryDate: '',
      workingYears: 0,
      isSpecialOperation: true,
      notes: ''
    },
    typeOptions: [
      { label: '特种作业操作证', value: 'special' },
      { label: '安全培训合格证', value: 'training' },
      { label: '安全管理人员资格证', value: 'safety-manager' },
      { label: '职业资格证书', value: 'professional' }
    ]
  },

  onLoad() {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    this.setData({
      'formData.issueDate': `${year}-${month}-${day}`
    })
  },

  onCertNoInput(e) {
    this.setData({ 'formData.certNo': e.detail.value })
  },

  onEmployeeIdInput(e) {
    this.setData({ 'formData.employeeId': e.detail.value })
  },

  onEmployeeNameInput(e) {
    this.setData({ 'formData.employeeName': e.detail.value })
  },

  onDepartmentInput(e) {
    this.setData({ 'formData.department': e.detail.value })
  },

  onPositionInput(e) {
    this.setData({ 'formData.position': e.detail.value })
  },

  onTypeChange(e) {
    const index = e.detail.value
    const isSpecial = this.data.typeOptions[index].value === 'special'
    this.setData({
      'formData.certType': this.data.typeOptions[index].value,
      'formData.typeName': this.data.typeOptions[index].label,
      'formData.isSpecialOperation': isSpecial
    })
  },

  onCertNameInput(e) {
    this.setData({ 'formData.certName': e.detail.value })
  },

  onIssuingAuthorityInput(e) {
    this.setData({ 'formData.issuingAuthority': e.detail.value })
  },

  onIssueDateChange(e) {
    this.setData({ 'formData.issueDate': e.detail.value })
  },

  onExpiryDateChange(e) {
    this.setData({ 'formData.expiryDate': e.detail.value })
  },

  onWorkingYearsInput(e) {
    this.setData({ 'formData.workingYears': parseFloat(e.detail.value) || 0 })
  },

  onIsSpecialOperationChange(e) {
    this.setData({ 'formData.isSpecialOperation': e.detail.value })
  },

  onNotesInput(e) {
    this.setData({ 'formData.notes': e.detail.value })
  },

  onSubmit() {
    if (!this.data.formData.certNo) {
      wx.showToast({
        title: '请输入证书编号',
        icon: 'none'
      })
      return
    }

    if (!this.data.formData.employeeName) {
      wx.showToast({
        title: '请输入员工姓名',
        icon: 'none'
      })
      return
    }

    if (!this.data.formData.certName) {
      wx.showToast({
        title: '请输入证书名称',
        icon: 'none'
      })
      return
    }

    if (!this.data.formData.issueDate) {
      wx.showToast({
        title: '请选择发证日期',
        icon: 'none'
      })
      return
    }

    if (!this.data.formData.expiryDate) {
      wx.showToast({
        title: '请选择有效期',
        icon: 'none'
      })
      return
    }

    wx.showLoading({ title: '提交中...' })

    wx.cloud.callFunction({
      name: 'addCertificate',
      data: {
        certificate: this.data.formData
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
        console.error('添加证书失败:', err)
        app.showError('添加失败')
      }
    })
  }
})