const app = getApp()

Page({
  data: {
    // 基本信息
    dangerLocation: '',
    dangerPart: '',
    dangerDescription: '',
    
    // 分类
    dangerLevel: '一般隐患',
    dangerLevels: ['一般隐患', '重大隐患'],
    dangerCategory: '行车安全',
    dangerCategories: ['行车安全', '人身安全', '设备设施', '消防安全', '环境安全', '作业安全'],
    
    // 发现信息
    discoveryDate: '',
    discoverer: '',
    discovererDept: '',
    
    // 整改信息
    treatmentMeasures: '',
    responsibleDept: '',
    responsiblePerson: '',
    plannedCompleteDate: '',
    
    // 状态
    status: '待整改',
    
    // 附件
    photos: []
  },

  onLoad() {
    const today = new Date()
    this.setData({
      discoveryDate: this.formatDate(today),
      plannedCompleteDate: this.formatDate(new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)),
      discoverer: app.globalData.userInfo?.name || '',
      discovererDept: app.globalData.userInfo?.dept || ''
    })
  },

  onDangerLocationChange(e) {
    this.setData({ dangerLocation: e.detail.value })
  },

  onDangerPartChange(e) {
    this.setData({ dangerPart: e.detail.value })
  },

  onDangerLevelChange(e) {
    this.setData({ dangerLevel: this.data.dangerLevels[e.detail.value] })
  },

  onDangerCategoryChange(e) {
    this.setData({ dangerCategory: this.data.dangerCategories[e.detail.value] })
  },

  onDangerDescriptionChange(e) {
    this.setData({ dangerDescription: e.detail.value })
  },

  onDiscoveryDateChange(e) {
    this.setData({ discoveryDate: e.detail.value })
  },

  onDiscovererChange(e) {
    this.setData({ discoverer: e.detail.value })
  },

  onDiscovererDeptChange(e) {
    this.setData({ discovererDept: e.detail.value })
  },

  onTreatmentMeasuresChange(e) {
    this.setData({ treatmentMeasures: e.detail.value })
  },

  onResponsibleDeptChange(e) {
    this.setData({ responsibleDept: e.detail.value })
  },

  onResponsiblePersonChange(e) {
    this.setData({ responsiblePerson: e.detail.value })
  },

  onPlannedCompleteDateChange(e) {
    this.setData({ plannedCompleteDate: e.detail.value })
  },

  onSubmit() {
    if (!this.validateForm()) {
      return
    }

    wx.showLoading({ title: '提交中...' })

    const data = {
      dangerLocation: this.data.dangerLocation,
      dangerPart: this.data.dangerPart,
      dangerCategory: this.data.dangerCategory,
      dangerLevel: this.data.dangerLevel,
      dangerDescription: this.data.dangerDescription,
      dangerStatus: '检查发现异常',
      causeAnalysis: this.data.description,
      hazardAnalysis: '',
      treatmentPlan: this.data.treatmentMeasures,
      treatmentMeasures: this.data.treatmentMeasures,
      responsibleDept: this.data.responsibleDept,
      responsiblePerson: this.data.responsiblePerson,
      plannedCompleteDate: new Date(this.data.plannedCompleteDate),
      completionCriteria: '',
      verificationMethod: '',
      isMajorDanger: this.data.dangerLevel === '重大隐患',
      isSupervised: this.data.dangerLevel === '重大隐患',
      supervisionLevel: this.data.dangerLevel === '重大隐患' ? '公司级' : '',
      supervisionStatus: this.data.dangerLevel === '重大隐患' ? '待督办' : '',
      discoveryDate: new Date(this.data.discoveryDate),
      discoverer: this.data.discoverer,
      findMethod: '日常排查',
      inDangerLibrary: true,
      status: this.data.status,
      photos: this.data.photos,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    wx.cloud.database().collection('hidden_danger_library').add({
      data: data,
      success: () => {
        app.showSuccess('添加成功')
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      },
      fail: err => {
        console.error('添加失败:', err)
        app.showError('添加失败')
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },

  validateForm() {
    if (!this.data.dangerLocation) {
      app.showError('请输入隐患地点')
      return false
    }
    if (!this.data.dangerPart) {
      app.showError('请输入隐患部位')
      return false
    }
    if (!this.data.dangerDescription) {
      app.showError('请输入隐患描述')
      return false
    }
    if (!this.data.responsibleDept) {
      app.showError('请输入责任部门')
      return false
    }
    if (!this.data.responsiblePerson) {
      app.showError('请输入责任人')
      return false
    }
    return true
  },

  onChooseImage() {
    wx.chooseImage({
      count: 9,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        const tempFilePaths = res.tempFilePaths
        this.uploadImages(tempFilePaths)
      }
    })
  },

  uploadImages(filePaths) {
    wx.showLoading({ title: '上传中...' })
    
    const uploadPromises = filePaths.map(filePath => {
      return wx.cloud.uploadFile({
        cloudPath: `danger_photos/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`,
        filePath: filePath
      })
    })

    Promise.all(uploadPromises).then(results => {
      const fileIDs = results.map(res => res.fileID)
      this.setData({
        photos: [...this.data.photos, ...fileIDs]
      })
      wx.hideLoading()
      app.showSuccess('上传成功')
    }).catch(err => {
      console.error('上传失败:', err)
      wx.hideLoading()
      app.showError('上传失败')
    })
  },

  onRemovePhoto(e) {
    const index = e.currentTarget.dataset.index
    const photos = this.data.photos
    photos.splice(index, 1)
    this.setData({ photos })
  },

  formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
})