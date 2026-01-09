const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    planId: '',
    plan: null,
    pdfFiles: [],
    loading: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (options.id) {
      this.setData({
        planId: options.id
      })
      this.loadPlanDetail(options.id)
    }
  },

  /**
   * 加载预案详情
   */
  loadPlanDetail(planId) {
    // 直接使用模拟数据
    this.loadMockData(planId)
  },

  /**
   * 加载模拟数据
   */
  loadMockData(planId) {
    const mockPlans = [
      {
        id: 'EP001',
        name: '特种设备事故专项应急预案',
        type: 'special',
        typeName: '专项预案',
        version: '2024-A',
        status: 'active',
        statusText: '已发布',
        lastReviewDate: '2024-11-15',
        nextReviewDate: '2025-11-15',
        approvalDept: '安全管理部门',
        drillFrequency: '每年2次',
        drillFrequencyCode: 'yearly_2',
        effectiveness: '已通过演练验证有效',
        pdfFiles: [
          {
            id: 'PDF001',
            fileName: '特种设备事故专项应急预案.pdf',
            fileSize: '2.3MB',
            uploadTime: '2024-11-15 10:30',
            fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
          }
        ]
      },
      {
        id: 'EP002',
        name: '生产安全事故综合应急预案',
        type: 'comprehensive',
        typeName: '综合预案',
        version: '2024-B',
        status: 'active',
        statusText: '已发布',
        lastReviewDate: '2024-10-20',
        nextReviewDate: '2025-10-20',
        approvalDept: '总经理办公室',
        drillFrequency: '每年1次',
        drillFrequencyCode: 'yearly_1',
        effectiveness: '需补充低温天气专项演练',
        pdfFiles: []
      },
      {
        id: 'EP003',
        name: '接触网故障现场处置方案',
        type: 'site',
        typeName: '现场处置方案',
        version: '2024-01',
        status: 'active',
        statusText: '已发布',
        lastReviewDate: '2024-12-01',
        nextReviewDate: '2025-12-01',
        approvalDept: '电力部门',
        drillFrequency: '每季度1次',
        drillFrequencyCode: 'quarterly_1',
        effectiveness: '演练效果良好',
        pdfFiles: [
          {
            id: 'PDF003',
            fileName: '接触网故障现场处置方案.pdf',
            fileSize: '1.8MB',
            uploadTime: '2024-12-01 14:20',
            fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
          }
        ]
      },
      {
        id: 'EP004',
        name: '自然灾害应急响应预案',
        type: 'special',
        typeName: '专项预案',
        version: '2024-A',
        status: 'active',
        statusText: '已发布',
        lastReviewDate: '2024-09-10',
        nextReviewDate: '2025-09-10',
        approvalDept: '安全管理部门',
        drillFrequency: '每年1次',
        drillFrequencyCode: 'yearly_1',
        effectiveness: '待验证',
        pdfFiles: []
      }
    ]

    const plan = mockPlans.find(p => p.id === planId)
    
    if (plan) {
      this.setData({
        plan: plan,
        pdfFiles: plan.pdfFiles || [],
        loading: false
      })
    } else {
      wx.showToast({
        title: '预案不存在',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  },

  /**
   * 预览PDF文档
   */
  previewPdf(e) {
    const fileUrl = e.currentTarget.dataset.url
    const fileName = e.currentTarget.dataset.name
    const cloudPath = e.currentTarget.dataset.cloudPath

    console.log('预览PDF:', { fileUrl, fileName, cloudPath })

    wx.showLoading({
      title: '加载中...'
    })

    // 如果是云存储路径，先获取临时链接
    if (cloudPath && cloudPath.startsWith('cloud://')) {
      wx.cloud.getTempFileURL({
        fileList: [cloudPath],
        success: (res) => {
          if (res.fileList && res.fileList[0] && res.fileList[0].tempFileURL) {
            this.downloadAndOpenPdf(res.fileList[0].tempFileURL, fileName)
          } else {
            wx.hideLoading()
            wx.showToast({
              title: '获取文件链接失败',
              icon: 'none'
            })
          }
        },
        fail: (err) => {
          wx.hideLoading()
          console.error('获取临时链接失败:', err)
          wx.showToast({
            title: '获取文件链接失败',
            icon: 'none'
          })
        }
      })
    } else {
      // 直接下载
      this.downloadAndOpenPdf(fileUrl, fileName)
    }
  },

  /**
   * 下载并打开PDF
   */
  downloadAndOpenPdf(fileUrl, fileName) {
    console.log('开始下载:', fileUrl)

    wx.downloadFile({
      url: fileUrl,
      success: (res) => {
        wx.hideLoading()
        console.log('下载结果:', res)

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
              console.error('打开文档失败:', err)
              wx.showToast({
                title: '打开文档失败',
                icon: 'none'
              })
            }
          })
        } else {
          console.error('下载失败，状态码:', res.statusCode)
          wx.showToast({
            title: '下载失败，状态码: ' + res.statusCode,
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        wx.hideLoading()
        console.error('下载失败:', err)
        wx.showToast({
          title: '下载失败: ' + (err.errMsg || '未知错误'),
          icon: 'none'
        })
      }
    })
  },

  /**
   * 下载PDF文档
   */
  downloadPdf(e) {
    const fileUrl = e.currentTarget.dataset.url
    const fileName = e.currentTarget.dataset.name
    const cloudPath = e.currentTarget.dataset.cloudPath

    console.log('下载PDF:', { fileUrl, fileName, cloudPath })

    wx.showLoading({
      title: '下载中...'
    })

    // 如果是云存储路径，先获取临时链接
    if (cloudPath && cloudPath.startsWith('cloud://')) {
      wx.cloud.getTempFileURL({
        fileList: [cloudPath],
        success: (res) => {
          if (res.fileList && res.fileList[0] && res.fileList[0].tempFileURL) {
            this.downloadAndSavePdf(res.fileList[0].tempFileURL, fileName)
          } else {
            wx.hideLoading()
            wx.showToast({
              title: '获取文件链接失败',
              icon: 'none'
            })
          }
        },
        fail: (err) => {
          wx.hideLoading()
          console.error('获取临时链接失败:', err)
          wx.showToast({
            title: '获取文件链接失败',
            icon: 'none'
          })
        }
      })
    } else {
      // 直接下载
      this.downloadAndSavePdf(fileUrl, fileName)
    }
  },

  /**
   * 下载并保存PDF
   */
  downloadAndSavePdf(fileUrl, fileName) {
    console.log('开始下载:', fileUrl)

    wx.downloadFile({
      url: fileUrl,
      success: (res) => {
        wx.hideLoading()
        console.log('下载结果:', res)

        if (res.statusCode === 200) {
          wx.saveFile({
            tempFilePath: res.tempFilePath,
            success: (saveRes) => {
              console.log('保存成功:', saveRes)
              wx.showToast({
                title: '下载成功',
                icon: 'success'
              })
            },
            fail: (err) => {
              console.error('保存失败:', err)
              wx.showToast({
                title: '保存失败: ' + (err.errMsg || '未知错误'),
                icon: 'none'
              })
            }
          })
        } else {
          console.error('下载失败，状态码:', res.statusCode)
          wx.showToast({
            title: '下载失败，状态码: ' + res.statusCode,
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        wx.hideLoading()
        console.error('下载失败:', err)
        wx.showToast({
          title: '下载失败: ' + (err.errMsg || '未知错误'),
          icon: 'none'
        })
      }
    })
  },

  /**
   * 删除PDF文档
   */
  deletePdf(e) {
    const fileId = e.currentTarget.dataset.id
    const fileName = e.currentTarget.dataset.name
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除文档 "${fileName}" 吗？`,
      success: (res) => {
        if (res.confirm) {
          // 从列表中删除
          const updatedFiles = this.data.pdfFiles.filter(f => f.id !== fileId)
          this.setData({
            pdfFiles: updatedFiles
          })
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
          
          // TODO: 调用云函数删除云存储中的文件
        }
      }
    })
  },

  /**
   * 返回上一页
   */
  goBack() {
    wx.navigateBack()
  }
})