const app = getApp()

Page({
  data: {
    drillId: '',
    drill: {},
    loading: true,
    evaluation: {
      effectiveness: '',
      issues: '',
      improvements: '',
      suggestions: '',
      score: 0
    },
    effectivenessOptions: [
      { label: '优秀', value: 'excellent' },
      { label: '良好', value: 'good' },
      { label: '合格', value: 'qualified' },
      { label: '不合格', value: 'unqualified' }
    ]
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ drillId: options.id })
      this.loadDrillDetail(options.id)
    }
  },

  async loadDrillDetail(id) {
    wx.showLoading({ title: '加载中...' })

    try {
      const result = await wx.cloud.callFunction({
        name: 'getDrillDetail',
        data: { id }
      })

      if (result.result.success) {
        this.setData({
          drill: result.result.data,
          evaluation: result.result.data.evaluation || this.data.evaluation,
          loading: false
        })
      } else {
        this.useMockData()
      }
    } catch (error) {
      console.error('获取演练详情失败:', error)
      this.useMockData()
    } finally {
      wx.hideLoading()
    }
  },

  useMockData() {
    const mockData = {
      id: this.data.drillId,
      planName: '接触网故障现场处置方案',
      date: '2024-12-15',
      startTime: '09:00',
      endTime: '11:30',
      duration: '2.5小时',
      type: 'field',
      typeName: '现场演练',
      participants: '15人',
      executor: '电力抢修班组',
      scenario: '冬季接触网结冰故障',
      objectives: '检验抢修响应速度和现场处置能力',
      completionStatus: 'completed'
    }

    this.setData({
      drill: mockData,
      loading: false
    })
  },

  onEffectivenessChange(e) {
    this.setData({
      'evaluation.effectiveness': this.data.effectivenessOptions[e.detail.value].value
    })
  },

  onScoreChange(e) {
    this.setData({
      'evaluation.score': e.detail.value
    })
  },

  onIssuesInput(e) {
    this.setData({
      'evaluation.issues': e.detail.value
    })
  },

  onImprovementsInput(e) {
    this.setData({
      'evaluation.improvements': e.detail.value
    })
  },

  onSuggestionsInput(e) {
    this.setData({
      'evaluation.suggestions': e.detail.value
    })
  },

  onSubmit() {
    if (!this.data.evaluation.effectiveness) {
      wx.showToast({
        title: '请选择演练效果',
        icon: 'none'
      })
      return
    }

    wx.showLoading({ title: '提交中...' })

    wx.cloud.callFunction({
      name: 'submitDrillEvaluation',
      data: {
        drillId: this.data.drillId,
        evaluation: this.data.evaluation
      },
      success: res => {
        wx.hideLoading()
        if (res.result.success) {
          wx.showToast({
            title: '评估已提交',
            icon: 'success'
          })
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
        } else {
          app.showError(res.result.error || '提交失败')
        }
      },
      fail: err => {
        wx.hideLoading()
        console.error('提交评估失败:', err)
        app.showError('提交失败')
      }
    })
  }
})