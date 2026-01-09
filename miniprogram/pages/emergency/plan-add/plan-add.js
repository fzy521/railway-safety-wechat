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
    ],
    uploadedFiles: [],
    uploading: false
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

  /**
   * 选择PDF文件
   */
  choosePdfFile() {
    wx.chooseMessageFile({
      count: 10,
      type: 'file',
      extension: ['pdf'],
      success: (res) => {
        const tempFiles = res.tempFiles
        if (tempFiles.length > 0) {
          this.uploadFiles(tempFiles)
        }
      }
    })
  },

  /**
   * 上传文件到云存储
   */
  uploadFiles(files) {
    this.setData({ uploading: true })

    const uploadPromises = files.map(file => {
      return new Promise((resolve, reject) => {
        // 生成唯一文件名
        const timestamp = new Date().getTime()
        const random = Math.floor(Math.random() * 10000)
        const cloudPath = `emergency-plans/${timestamp}_${random}_${file.name}`

        wx.cloud.uploadFile({
          cloudPath: cloudPath,
          filePath: file.path,
          success: (res) => {
            resolve({
              id: `PDF_${timestamp}_${random}`,
              fileName: file.name,
              fileSize: this.formatFileSize(file.size),
              uploadTime: this.formatTime(new Date()),
              fileUrl: res.fileID,
              cloudPath: cloudPath
            })
          },
          fail: (err) => {
            reject(err)
          }
        })
      })
    })

    Promise.all(uploadPromises)
      .then(results => {
        const newFiles = [...this.data.uploadedFiles, ...results]
        this.setData({
          uploadedFiles: newFiles,
          uploading: false
        })
        wx.showToast({
          title: `成功上传${results.length}个文件`,
          icon: 'success'
        })
      })
      .catch(err => {
        console.error('上传失败:', err)
        this.setData({ uploading: false })
        wx.showToast({
          title: '上传失败',
          icon: 'none'
        })
      })
  },

  /**
   * 格式化文件大小
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  },

  /**
   * 格式化时间
   */
  formatTime(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hour}:${minute}`
  },

  /**
   * 预览PDF文件
   */
  previewPdf(e) {
    const fileUrl = e.currentTarget.dataset.url
    const fileName = e.currentTarget.dataset.name
    
    wx.showLoading({
      title: '加载中...'
    })

    wx.downloadFile({
      url: fileUrl,
      success: (res) => {
        wx.hideLoading()
        if (res.statusCode === 200) {
          const filePath = res.tempFilePath
          wx.openDocument({
            filePath: filePath,
            fileType: 'pdf',
            showMenu: true,
            success: function (res) {
              console.log('打开文档成功')
            },
            fail: function (err) {
              wx.showToast({
                title: '打开文档失败',
                icon: 'none'
              })
            }
          })
        } else {
          wx.showToast({
            title: '下载失败',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        wx.hideLoading()
        wx.showToast({
          title: '下载失败',
          icon: 'none'
        })
      }
    })
  },

  /**
   * 删除已上传的文件
   */
  deleteFile(e) {
    const fileId = e.currentTarget.dataset.id
    const cloudPath = e.currentTarget.dataset.cloudPath
    const fileName = e.currentTarget.dataset.name
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除文件 "${fileName}" 吗？`,
      success: (res) => {
        if (res.confirm) {
          // 从云存储删除
          wx.cloud.deleteFile({
            fileList: [cloudPath],
            success: (res) => {
              console.log('云存储删除成功:', res)
            },
            fail: (err) => {
              console.error('云存储删除失败:', err)
            }
          })

          // 从列表中删除
          const updatedFiles = this.data.uploadedFiles.filter(f => f.id !== fileId)
          this.setData({
            uploadedFiles: updatedFiles
          })

          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  },

  /**
   * 提交表单
   */
  handleSubmit(e) {
    const { name, typeIndex } = this.data.formData

    if (!name) {
      wx.showToast({
        title: '请输入预案名称',
        icon: 'none'
      })
      return
    }

    if (typeIndex === '') {
      wx.showToast({
        title: '请选择预案类型',
        icon: 'none'
      })
      return
    }

    if (this.data.uploadedFiles.length === 0) {
      wx.showToast({
        title: '请至少上传一个PDF文件',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '保存中...'
    })

    // 构建预案数据
    const planData = {
      name: name,
      type: this.data.planTypes[typeIndex].value,
      typeName: this.data.planTypes[typeIndex].label,
      version: '2025-A',
      status: 'active',
      statusText: '已发布',
      lastReviewDate: this.formatTime(new Date()).split(' ')[0],
      nextReviewDate: this.getNextYearDate(),
      approvalDept: '安全管理部门',
      drillFrequency: '每年1次',
      drillFrequencyCode: 'yearly_1',
      effectiveness: '待验证',
      pdfFiles: this.data.uploadedFiles,
      createTime: new Date().getTime()
    }

    // TODO: 调用云函数保存到数据库
    console.log('预案数据:', planData)

    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })
      
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }, 1000)
  },

  /**
   * 获取明年同月日期
   */
  getNextYearDate() {
    const now = new Date()
    const nextYear = now.getFullYear() + 1
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${nextYear}-${month}-${day}`
  },

  /**
   * 取消
   */
  handleCancel() {
    if (this.data.uploadedFiles.length > 0) {
      wx.showModal({
        title: '确认取消',
        content: '取消后将丢失已上传的文件，确定要取消吗？',
        success: (res) => {
          if (res.confirm) {
            wx.navigateBack()
          }
        }
      })
    } else {
      wx.navigateBack()
    }
  }
})
