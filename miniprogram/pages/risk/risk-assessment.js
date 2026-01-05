const app = getApp()

Page({
  data: {
    riskId: '',
    isEdit: false,
    
    // 基本信息
    riskName: '',
    riskType: '设备类',
    riskTypes: ['设备类', '行为类', '环境类', '管理类'],
    operationLink: '',
    location: '',
    
    // MES评估参数
    mValue: 1,
    mOptions: [
      { label: '5分 - 无控制措施', value: 5, desc: '完全没有任何控制措施' },
      { label: '3分 - 有应急措施', value: 3, desc: '有减轻后果的应急措施，包括警报系统、个体防护用品等' },
      { label: '1分 - 有预防措施', value: 1, desc: '有预防措施、控制文件，如机电防护装置，但须保证有效' }
    ],
    
    e1Value: 3,
    e1Options: [
      { label: '10分 - 连续暴露', value: 10, desc: '人员连续暴露于危险环境中' },
      { label: '6分 - 每天暴露', value: 6, desc: '每天工作时间内暴露' },
      { label: '3分 - 每周暴露', value: 3, desc: '每周一次，或偶然暴露' },
      { label: '2分 - 每月暴露', value: 2, desc: '每月一次暴露' },
      { label: '1分 - 每年暴露', value: 1, desc: '每年几次暴露' },
      { label: '0.5分 - 更少暴露', value: 0.5, desc: '更少地暴露' }
    ],
    
    e2Value: 2,
    e2Options: [
      { label: '10分 - 常态', value: 10, desc: '危险状态经常出现' },
      { label: '6分 - 每天出现', value: 6, desc: '每天工作时间出现' },
      { label: '3分 - 每周出现', value: 3, desc: '每周一次或偶尔出现' },
      { label: '2分 - 每月出现', value: 2, desc: '每月一次出现' },
      { label: '1分 - 每年出现', value: 1, desc: '每年几次出现' },
      { label: '0.5分 - 更少出现', value: 0.5, desc: '更少地出现' }
    ],
    
    sValue: 4,
    sOptions: [
      { label: '10分 - 多人死亡', value: 10, desc: '可能有多人死亡；财产损失>1000万；重大环境影响' },
      { label: '8分 - 一人死亡', value: 8, desc: '1人死亡或多人永久失能；财产损失100万-1000万；中等环境影响' },
      { label: '4分 - 永久失能', value: 4, desc: '永久失能（1人）；财产损失10万-100万；较轻环境影响' },
      { label: '2分 - 需医院治疗', value: 2, desc: '需医院治疗，缺工；财产损失1万-10万；局部环境影响' },
      { label: '1分 - 轻微伤害', value: 1, desc: '轻微，仅需急救；财产损失<1万；无环境影响' }
    ],
    
    // 计算结果
    rValue: 0,
    riskLevel: 0,
    riskGrade: '',
    riskColor: '',
    checkFrequency: '',
    
    // 管控措施
    controlMeasures: '',
    controlPerson: '',
    manageMeasures: '',
    manageDept: '',
    managePerson: '',
    
    // 辨识信息
    identificationDate: '',
    identificationMethod: '作业安全分析法',
    identificationMethods: ['作业安全分析法', '安全检查表法', '工作危害分析法', '故障类型和影响分析法'],
    
    showMPicker: false,
    showE1Picker: false,
    showE2Picker: false,
    showSPicker: false
  },

  onLoad(options) {
    if (options.riskId) {
      this.setData({
        riskId: options.riskId,
        isEdit: true
      })
      this.loadRiskDetail(options.riskId)
    } else {
      this.setData({
        identificationDate: this.formatDate(new Date())
      })
    }
  },

  loadRiskDetail(riskId) {
    wx.showLoading({ title: '加载中...' })
    
    wx.cloud.database().collection('risk_library').doc(riskId).get({
      success: res => {
        const risk = res.data
        this.setData({
          riskName: risk.riskName || '',
          riskType: risk.riskType || '设备类',
          operationLink: risk.operationLink || '',
          location: risk.location || '',
          mValue: risk.mValue || 1,
          e1Value: risk.e1Value || 3,
          e2Value: risk.e2Value || 2,
          sValue: risk.sValue || 4,
          rValue: risk.rValue || 0,
          riskLevel: risk.riskLevel || 0,
          riskGrade: risk.riskGrade || '',
          riskColor: risk.riskColor || '',
          checkFrequency: risk.checkFrequency || '',
          controlMeasures: risk.controlMeasures || '',
          controlPerson: risk.controlPerson || '',
          manageMeasures: risk.manageMeasures || '',
          manageDept: risk.manageDept || '',
          managePerson: risk.managePerson || '',
          identificationDate: this.formatDate(new Date(risk.identificationDate)),
          identificationMethod: risk.identificationMethod || '作业安全分析法'
        })
      },
      fail: err => {
        console.error('加载风险详情失败:', err)
        app.showError('加载失败')
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },

  onMValueChange(e) {
    const value = parseFloat(e.detail.value)
    this.setData({
      mValue: value,
      showMPicker: false
    })
    this.calculateRisk()
  },

  onE1ValueChange(e) {
    const value = parseFloat(e.detail.value)
    this.setData({
      e1Value: value,
      showE1Picker: false
    })
    this.calculateRisk()
  },

  onE2ValueChange(e) {
    const value = parseFloat(e.detail.value)
    this.setData({
      e2Value: value,
      showE2Picker: false
    })
    this.calculateRisk()
  },

  onSValueChange(e) {
    const value = parseFloat(e.detail.value)
    this.setData({
      sValue: value,
      showSPicker: false
    })
    this.calculateRisk()
  },

  calculateRisk() {
    const { mValue, e1Value, e2Value, sValue } = this.data
    const e = Math.max(e1Value, e2Value)
    const r = mValue * e * sValue

    let level, grade, color, checkFrequency
    if (r > 180) {
      level = 1
      grade = '重大风险'
      color = '红'
      checkFrequency = '每周一次'
    } else if (r >= 90) {
      level = 2
      grade = '较大风险'
      color = '橙'
      checkFrequency = '每月一次'
    } else if (r >= 40) {
      level = 3
      grade = '一般风险'
      color = '黄'
      checkFrequency = '每季度一次'
    } else {
      level = 4
      grade = '低风险'
      color = '蓝'
      checkFrequency = '每半年一次'
    }

    this.setData({
      rValue: r.toFixed(2),
      riskLevel: level,
      riskGrade: grade,
      riskColor: color,
      checkFrequency: checkFrequency
    })
  },

  onRiskNameChange(e) {
    this.setData({ riskName: e.detail.value })
  },

  onRiskTypeChange(e) {
    this.setData({ riskType: this.data.riskTypes[e.detail.value] })
  },

  onOperationLinkChange(e) {
    this.setData({ operationLink: e.detail.value })
  },

  onLocationChange(e) {
    this.setData({ location: e.detail.value })
  },

  onControlMeasuresChange(e) {
    this.setData({ controlMeasures: e.detail.value })
  },

  onControlPersonChange(e) {
    this.setData({ controlPerson: e.detail.value })
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

  onIdentificationMethodChange(e) {
    this.setData({ identificationMethod: this.data.identificationMethods[e.detail.value] })
  },

  showPicker(type) {
    switch (type) {
      case 'm':
        this.setData({ showMPicker: true })
        break
      case 'e1':
        this.setData({ showE1Picker: true })
        break
      case 'e2':
        this.setData({ showE2Picker: true })
        break
      case 's':
        this.setData({ showSPicker: true })
        break
    }
  },

  hidePicker(type) {
    switch (type) {
      case 'm':
        this.setData({ showMPicker: false })
        break
      case 'e1':
        this.setData({ showE1Picker: false })
        break
      case 'e2':
        this.setData({ showE2Picker: false })
        break
      case 's':
        this.setData({ showSPicker: false })
        break
    }
  },

  onSave() {
    if (!this.validateForm()) {
      return
    }

    wx.showLoading({ title: '保存中...' })

    const data = {
      riskName: this.data.riskName,
      riskType: this.data.riskType,
      operationLink: this.data.operationLink,
      location: this.data.location,
      mValue: this.data.mValue,
      e1Value: this.data.e1Value,
      e2Value: this.data.e2Value,
      sValue: this.data.sValue,
      rValue: parseFloat(this.data.rValue),
      riskLevel: this.data.riskLevel,
      riskGrade: this.data.riskGrade,
      riskColor: this.data.riskColor,
      checkFrequency: this.data.checkFrequency,
      controlMeasures: this.data.controlMeasures,
      controlPerson: this.data.controlPerson,
      manageMeasures: this.data.manageMeasures,
      manageDept: this.data.manageDept,
      managePerson: this.data.managePerson,
      identificationDate: new Date(this.data.identificationDate),
      identificationMethod: this.data.identificationMethod,
      status: 'active',
      updatedAt: new Date()
    }

    if (this.data.isEdit) {
      wx.cloud.database().collection('risk_library').doc(this.data.riskId).update({
        data: data,
        success: () => {
          app.showSuccess('更新成功')
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
        },
        fail: err => {
          console.error('更新失败:', err)
          app.showError('更新失败')
        },
        complete: () => {
          wx.hideLoading()
        }
      })
    } else {
      data.createdAt = new Date()
      wx.cloud.database().collection('risk_library').add({
        data: data,
        success: () => {
          app.showSuccess('创建成功')
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
        },
        fail: err => {
          console.error('创建失败:', err)
          app.showError('创建失败')
        },
        complete: () => {
          wx.hideLoading()
        }
      })
    }
  },

  validateForm() {
    if (!this.data.riskName) {
      app.showError('请输入风险名称')
      return false
    }
    if (!this.data.location) {
      app.showError('请输入风险地点')
      return false
    }
    if (!this.data.controlMeasures) {
      app.showError('请输入岗位控制措施')
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
    return true
  },

  formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
})