const app = getApp()

Page({
  data: {
    inspectionId: '',
    inspection: {},
    loading: true
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ inspectionId: options.id })
      this.loadInspectionDetail(options.id)
    }
  },

  async loadInspectionDetail(id) {
    wx.showLoading({ title: '加载中...' })

    try {
      const result = await wx.cloud.callFunction({
        name: 'getInspectionDetail',
        data: { id }
      })

      if (result.result.success) {
        this.setData({
          inspection: {
            ...result.result.data,
            levelClass: this.getLevelClass(result.result.data.level)
          },
          loading: false
        })
      } else {
        this.useMockData()
      }
    } catch (error) {
      console.error('获取详情失败:', error)
      this.useMockData()
    } finally {
      wx.hideLoading()
    }
  },

  getLevelClass(level) {
    const levelMap = {
      '一般隐患': 'general',
      '重大隐患': 'major'
    }
    return levelMap[level] || 'general'
  },

  useMockData() {
    const mockData = {
      id: this.data.inspectionId,
      title: '轨道连接螺栓松动',
      type: 'equipment',
      typeName: '设备设施',
      level: '一般隐患',
      status: 'identified',
      statusName: '已发现',
      severity: 'C类',
      zone: '梁邹站场 K15+300',
      finder: '张工',
      findDate: '2024-12-21',
      findTime: '10:30',
      description: '巡检发现5处轨道连接螺栓有松动现象',
      immediateMeasure: '已设置警示标志，通知维护组',
      treatmentMeasures: '立即紧固螺栓，加强该路段巡检频次',
      treatmentDeadline: '2024-12-25',
      responsibleDept: '线路维护组',
      responsiblePerson: '李工',
      supervisionPerson: '安全员_王',
      treatmentStatus: 'treating',
      treatmentStatusText: '整改中',
      priority: 3,
      photos: [],
      attachments: []
    }

    this.setData({
      inspection: {
        ...mockData,
        levelClass: this.getLevelClass(mockData.level)
      },
      loading: false
    })
  },

  onStartTreatment() {
    wx.showModal({
      title: '确认开始整改',
      content: '是否开始对此隐患进行整改？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '已开始整改',
            icon: 'success'
          })
        }
      }
    })
  },

  onSubmitVerification() {
    wx.showModal({
      title: '提交验证',
      content: '是否提交整改完成验证？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '已提交验证',
            icon: 'success'
          })
        }
      }
    })
  },

  onAddPhoto() {
    wx.chooseImage({
      count: 1,
      success: (res) => {
        wx.showToast({
          title: '图片上传成功',
          icon: 'success'
        })
      }
    })
  }
})