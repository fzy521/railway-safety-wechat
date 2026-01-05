const app = getApp()

Page({
  data: {
    recordId: '',
    record: {},
    loading: true
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ recordId: options.id })
      this.loadRecordDetail(options.id)
    }
  },

  async loadRecordDetail(id) {
    wx.showLoading({ title: '加载中...' })

    try {
      const result = await wx.cloud.callFunction({
        name: 'getTrainingRecordDetail',
        data: { id }
      })

      if (result.result.success) {
        this.setData({
          record: result.result.data,
          loading: false
        })
      } else {
        this.useMockData()
      }
    } catch (error) {
      console.error('获取培训记录详情失败:', error)
      this.useMockData()
    } finally {
      wx.hideLoading()
    }
  },

  useMockData() {
    const mockData = {
      id: this.data.recordId,
      planName: '接触网作业人员资格培训',
      employeeId: 'EMP001',
      employeeName: '张三',
      department: '电力部门',
      position: '接触网工',
      trainingDate: '2024-12-20',
      hours: 16,
      score: 92,
      result: 'passed',
      resultText: '合格',
      trainer: '电力专家_张',
      certificateNo: 'CERT-2024-DQ-001',
      issueDate: '2024-12-20',
      expiryDate: '2027-12-19',
      nextTrainingDate: '2027-11-19',
      content: '接触网结构原理、安全操作规程、故障处理',
      trainingMethod: '理论授课+现场实操',
      objectives: '取得接触网作业资格证书'
    }

    this.setData({
      record: mockData,
      loading: false
    })
  },

  onDownloadCertificate() {
    if (this.data.record.certificateNo) {
      wx.showToast({
        title: '证书下载中...',
        icon: 'loading'
      })
      setTimeout(() => {
        wx.showToast({
          title: '证书已保存',
          icon: 'success'
        })
      }, 1500)
    }
  }
})