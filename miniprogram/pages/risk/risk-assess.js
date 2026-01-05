const app = getApp()

Page({
  data: {
    riskId: '',
    riskInfo: null,
    
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
    riskLevelClass: 'blue',
    checkFrequency: '',
    
    // MES显示值
    mLabel: '',
    e1Label: '',
    e2Label: '',
    sLabel: '',
    mDesc: '',
    e1Desc: '',
    e2Desc: '',
    sDesc: '',
    
    // 评估信息
    assessmentDate: '',
    assessor: '',
    assessorDept: '',
    assessmentNotes: ''
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
        this.setData({
          riskInfo: risk,
          mValue: risk.mValue || 1,
          e1Value: risk.e1Value || 3,
          e2Value: risk.e2Value || 2,
          sValue: risk.sValue || 4,
          rValue: risk.rValue || 0,
          riskLevel: risk.riskLevel || 0,
          riskGrade: risk.riskGrade || '',
          riskColor: risk.riskColor || '',
          checkFrequency: risk.checkFrequency || '',
          assessmentDate: risk.assessmentDate ? this.formatDate(new Date(risk.assessmentDate)) : this.formatDate(new Date()),
          assessor: risk.assessor || app.globalData.userInfo?.name || '',
          assessorDept: risk.assessorDept || app.globalData.userInfo?.dept || '',
          assessmentNotes: risk.assessmentNotes || ''
        })
        
        this.updateMESLabels()
        
        this.calculateRisk()
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

  onMValueChange(e) {
    const index = parseInt(e.detail.value)
    const option = this.data.mOptions[index]
    this.setData({
      mValue: option.value
    })
    this.calculateRisk()
  },

  onE1ValueChange(e) {
    const index = parseInt(e.detail.value)
    const option = this.data.e1Options[index]
    this.setData({
      e1Value: option.value
    })
    this.calculateRisk()
  },

  onE2ValueChange(e) {
    const index = parseInt(e.detail.value)
    const option = this.data.e2Options[index]
    this.setData({
      e2Value: option.value
    })
    this.calculateRisk()
  },

  onSValueChange(e) {
    const index = parseInt(e.detail.value)
    const option = this.data.sOptions[index]
    this.setData({
      sValue: option.value
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

    const colorMap = {
      '红': 'red',
      '橙': 'orange',
      '黄': 'yellow',
      '蓝': 'blue'
    }

    this.setData({
      rValue: r.toFixed(2),
      riskLevel: level,
      riskGrade: grade,
      riskColor: color,
      riskLevelClass: colorMap[color] || 'blue',
      checkFrequency: checkFrequency
    })
    
    this.updateMESLabels()
  },

  updateMESLabels() {
    const { mValue, e1Value, e2Value, sValue, mOptions, e1Options, e2Options, sOptions } = this.data
    
    const mOption = mOptions.find(o => o.value === mValue)
    const e1Option = e1Options.find(o => o.value === e1Value)
    const e2Option = e2Options.find(o => o.value === e2Value)
    const sOption = sOptions.find(o => o.value === sValue)
    
    this.setData({
      mLabel: mOption ? mOption.label : '',
      e1Label: e1Option ? e1Option.label : '',
      e2Label: e2Option ? e2Option.label : '',
      sLabel: sOption ? sOption.label : '',
      mDesc: mOption ? mOption.desc : '',
      e1Desc: e1Option ? e1Option.desc : '',
      e2Desc: e2Option ? e2Option.desc : '',
      sDesc: sOption ? sOption.desc : ''
    })
  },

  onAssessorChange(e) {
    this.setData({ assessor: e.detail.value })
  },

  onAssessorDeptChange(e) {
    this.setData({ assessorDept: e.detail.value })
  },

  onAssessmentDateChange(e) {
    this.setData({ assessmentDate: e.detail.value })
  },

  onAssessmentNotesChange(e) {
    this.setData({ assessmentNotes: e.detail.value })
  },

  onSaveDraft() {
    wx.showLoading({ title: '保存中...' })

    const data = {
      mValue: this.data.mValue,
      e1Value: this.data.e1Value,
      e2Value: this.data.e2Value,
      sValue: this.data.sValue,
      rValue: parseFloat(this.data.rValue),
      riskLevel: this.data.riskLevel,
      riskGrade: this.data.riskGrade,
      riskColor: this.data.riskColor,
      checkFrequency: this.data.checkFrequency,
      assessmentDate: new Date(this.data.assessmentDate),
      assessor: this.data.assessor,
      assessorDept: this.data.assessorDept,
      assessmentNotes: this.data.assessmentNotes,
      status: '待评估',
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

  onSubmitForControl() {
    if (this.data.rValue === 0) {
      app.showError('请先完成MES评估')
      return
    }

    wx.showModal({
      title: '确认提交',
      content: `风险等级：${this.data.riskGrade}（${this.data.riskColor}色）\n确认提交给责任部门制定管控措施？`,
      success: (res) => {
        if (res.confirm) {
          this.onSubmit()
        }
      }
    })
  },

  onSubmit() {
    wx.showLoading({ title: '提交中...' })

    const data = {
      mValue: this.data.mValue,
      e1Value: this.data.e1Value,
      e2Value: this.data.e2Value,
      sValue: this.data.sValue,
      rValue: parseFloat(this.data.rValue),
      riskLevel: this.data.riskLevel,
      riskGrade: this.data.riskGrade,
      riskColor: this.data.riskColor,
      checkFrequency: this.data.checkFrequency,
      assessmentDate: new Date(this.data.assessmentDate),
      assessor: this.data.assessor,
      assessorDept: this.data.assessorDept,
      assessmentNotes: this.data.assessmentNotes,
      status: '待管控',
      assessedBy: app.globalData.userInfo?.name || '',
      updatedAt: new Date()
    }

    wx.cloud.database().collection('risk_library').doc(this.data.riskId).update({
      data: data,
      success: () => {
        app.showSuccess('已提交给责任部门制定管控措施')
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

  formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
})