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
    riskDescription: '',
    
    // 辨识信息
    identificationDate: '',
    identificationMethod: '作业安全分析法',
    identificationMethods: ['作业安全分析法', '安全检查表法', '工作危害分析法', '故障类型和影响分析法', '头脑风暴法', '现场观察法'],
    discoverer: '',
    discovererDept: '',
    
    // 附件
    photos: [],
    attachments: []
  },

  onLoad(options) {
    if (options.riskId) {
      this.setData({
        riskId: options.riskId,
        isEdit: true
      })
      this.loadRiskDetail(options.riskId)
    } else {
      const today = new Date()
      this.setData({
        identificationDate: this.formatDate(today),
        discoverer: app.globalData.userInfo?.name || '',
        discovererDept: app.globalData.userInfo?.dept || ''
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
          riskDescription: risk.riskDescription || '',
          identificationDate: this.formatDate(new Date(risk.identificationDate)),
          identificationMethod: risk.identificationMethod || '作业安全分析法',
          discoverer: risk.discoverer || '',
          discovererDept: risk.discovererDept || '',
          photos: risk.photos || [],
          attachments: risk.attachments || []
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

  onRiskDescriptionChange(e) {
    this.setData({ riskDescription: e.detail.value })
  },

  onIdentificationMethodChange(e) {
    this.setData({ identificationMethod: this.data.identificationMethods[e.detail.value] })
  },

  onDiscovererChange(e) {
    this.setData({ discoverer: e.detail.value })
  },

  onDiscovererDeptChange(e) {
    this.setData({ discovererDept: e.detail.value })
  },

  onIdentificationDateChange(e) {
    this.setData({ identificationDate: e.detail.value })
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
        cloudPath: `risk_photos/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`,
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

  onSave() {
    if (!this.validateForm()) {
      return
    }

    wx.hideLoading()
    wx.showLoading({ title: '保存中...' })

    const data = {
      riskName: this.data.riskName,
      riskType: this.data.riskType,
      operationLink: this.data.operationLink,
      location: this.data.location,
      riskDescription: this.data.riskDescription,
      identificationDate: new Date(this.data.identificationDate),
      identificationMethod: this.data.identificationMethod,
      discoverer: this.data.discoverer,
      discovererDept: this.data.discovererDept,
      photos: this.data.photos,
      attachments: this.data.attachments,
      status: '已辨识',
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
      data.identifiedBy = app.globalData.userInfo?.name || ''
      
      wx.cloud.database().collection('risk_library').add({
        data: data,
        success: () => {
          app.showSuccess('提交成功，已发送给安全工程师评估')
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

  onSubmitForAssessment() {
    console.log('onSubmitForAssessment 被调用')
    
    if (!this.validateForm()) {
      console.log('表单验证失败')
      return
    }

    console.log('表单验证通过，显示确认对话框')
    wx.showModal({
      title: '确认提交',
      content: '确认提交给安全工程师进行MES风险评估？',
      success: (res) => {
        if (res.confirm) {
          this.onSubmitAssessment()
        }
      }
    })
  },

  onSubmitAssessment() {
    wx.hideLoading()
    wx.showLoading({ title: '提交中...' })

    const data = {
      riskName: this.data.riskName,
      riskType: this.data.riskType,
      operationLink: this.data.operationLink,
      location: this.data.location,
      riskDescription: this.data.riskDescription,
      identificationDate: new Date(this.data.identificationDate),
      identificationMethod: this.data.identificationMethod,
      discoverer: this.data.discoverer,
      discovererDept: this.data.discovererDept,
      photos: this.data.photos,
      attachments: this.data.attachments,
      status: '待评估',
      updatedAt: new Date()
    }

    if (this.data.isEdit) {
      wx.cloud.database().collection('risk_library').doc(this.data.riskId).update({
        data: data,
        success: () => {
          app.showSuccess('已提交给安全工程师评估')
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
    } else {
      data.createdAt = new Date()
      data.identifiedBy = app.globalData.userInfo?.name || ''
      
      wx.cloud.database().collection('risk_library').add({
        data: data,
        success: () => {
          app.showSuccess('已提交给安全工程师评估')
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
    if (!this.data.riskDescription) {
      app.showError('请输入风险描述')
      return false
    }
    if (!this.data.discoverer) {
      app.showError('请输入发现人')
      return false
    }
    if (!this.data.discovererDept) {
      app.showError('请输入发现部门')
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