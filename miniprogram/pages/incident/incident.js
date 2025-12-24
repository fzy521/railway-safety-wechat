const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 统计数据
    statistics: {
      total: 0,
      thisMonth: 0,
      thisWeek: 0,
      today: 0,
      byType: {
        traffic: 0,
        equipment: 0,
        operation: 0,
        environment: 0
      }
    },

    // 当前显示的事故列表
    incidentList: [],

    // 筛选状态
    filterStatus: 'all', // all, pending, processing, resolved

    // 分页数据
    page: 1,
    pageSize: 10,
    hasMore: true,
    isLoading: false,

    // 图表相关
    chartData: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.loadIncidentData()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      })
    }
  },

  /**
   * 加载事故数据
   */
  async loadIncidentData(reset = true) {
    if (this.data.isLoading) return

    this.setData({ isLoading: true })
    wx.showLoading({ title: '加载中...' })

    try {
      // 调用云函数获取事故数据
      const result = await wx.cloud.callFunction({
        name: 'getIncidents',
        data: {
          status: this.data.filterStatus === 'all' ? null : this.data.filterStatus,
          page: this.data.page,
          size: this.data.pageSize
        }
      })

      if (result.result.success) {
        const data = result.result.data

        this.setData({
          statistics: data.statistics,
          incidentList: reset ? data.incidents : [...this.data.incidentList, ...data.incidents],
          hasMore: data.currentPage < data.totalPages,
          page: reset ? 1 : this.data.page,
          chartData: this.generateChartData(data.statistics)
        })
      }
    } catch (error) {
      console.error('获取事故数据失败:', error)

      // 使用模拟数据
      this.useMockData()
    } finally {
      wx.hideLoading()
      this.setData({ isLoading: false })
    }
  },

  /**
   * 使用模拟数据
   */
  useMockData() {
    const mockData = {
      statistics: {
        total: 5,
        thisMonth: 1,
        thisWeek: 0,
        today: 0,
        byType: {
          traffic: 2,
          equipment: 2,
          operation: 1,
          environment: 0
        }
      },
      incidents: [
        {
          id: 'INC001',
          title: '2号轨道信号异常',
          type: 'equipment',
          typeName: '设备故障',
          level: 'low',
          levelName: '一般事故',
          status: 'resolved',
          statusName: '已处理',
          date: '2024-12-22',
          time: '10:25',
          description: '2号轨道信号系统出现短暂异常',
          location: '梁邹站场'
        },
        {
          id: 'INC002',
          title: '机车制动距离过长',
          type: 'traffic',
          typeName: '行车事故',
          level: 'medium',
          levelName: '险性事故',
          status: 'processing',
          statusName: '处理中',
          date: '2024-12-20',
          time: '15:10',
          description: '司机反映制动距离异常',
          location: '专用线K15+300'
        }
      ],
      currentPage: 1,
      totalPages: 1,
      totalCount: 2
    }

    this.setData({
      statistics: mockData.statistics,
      incidentList: mockData.incidents,
      chartData: this.generateChartData(mockData.statistics)
    })
  },

  /**
   * 生成图表数据
   */
  generateChartData(statistics) {
    return [
      { label: '行车事故', value: statistics.byType.traffic },
      { label: '设备故障', value: statistics.byType.equipment },
      { label: '操作事故', value: statistics.byType.operation },
      { label: '环境因素', value: statistics.byType.environment }
    ]
  },

  /**
   * 筛选状态变化
   */
  onFilterChange(event) {
    const status = event.currentTarget.dataset.status
    this.setData({
      filterStatus: status,
      page: 1,
      incidentList: []
    })
    this.loadIncidentData(true)
  },

  /**
   * 查看事故详情
   */
  viewIncidentDetail(event) {
    const incidentId = event.currentTarget.dataset.id
    wx.showToast({
      title: '详情页开发中',
      icon: 'none'
    })
  },

  /**
   * 上拉加载更多
   */
  onReachBottom() {
    if (this.data.hasMore && !this.data.isLoading) {
      this.setData({
        page: this.data.page + 1
      })
      this.loadIncidentData(false)
    }
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.setData({
      page: 1,
      incidentList: []
    })
    this.loadIncidentData(true).then(() => {
      wx.stopPullDownRefresh()
    })
  },

  /**
   * 分享
   */
  onShareAppMessage() {
    return {
      title: '事故管理 - 铁路安全监控',
      path: '/pages/incident/incident'
    }
  }
})
