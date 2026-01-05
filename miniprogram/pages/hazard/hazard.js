const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 隐患类型
    hazardTypes: [
      { label: '设备设施', value: 'equipment', desc: '设备类隐患' },
      { label: '人员行为', value: 'behavior', desc: '行为类隐患' },
      { label: '环境因素', value: 'environment', desc: '环境类隐患' }
    ],
    selectedType: 'equipment',
    showTypePicker: false,

    // 隐患列表 - GBT 33000-2025 隐患排查治理
    hazardList: [],
    // 筛选状态 - GBT 33000-2025 隐患状态
    filterStatus: 'all',
    // 统计数据 - GBT 33000-2025 隐患排查治理
    statistics: {
      total: 0,
      identified: 0,
      treating: 0,
      completed: 0,
      verified: 0,
      closureRate: 0
    },
    // 分页
    page: 1,
    hasMore: true,
    isLoading: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.loadHazardData()
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
   * 加载隐患数据
   */
  async loadHazardData(reset = true) {
    if (this.data.isLoading) return

    this.setData({ isLoading: true })
    wx.showLoading({ title: '加载中...' })

    try {
      // 调用云函数获取隐患数据
      const result = await wx.cloud.callFunction({
        name: 'getInspections',
        data: {
          status: this.data.filterStatus === 'all' ? null : this.data.filterStatus,
          type: this.data.selectedType === 'all' ? null : this.data.selectedType,
          page: this.data.page,
          size: 20
        }
      })

      if (result.result.success) {
        const data = result.result.data

        this.setData({
          hazardList: reset ? data.hazards : [...this.data.hazardList, ...data.hazards],
          statistics: data.statistics,
          hasMore: data.currentPage < data.totalPages,
          page: reset ? 1 : this.data.page
        })
      } else {
        // 使用模拟数据
        this.useMockData()
      }
    } catch (error) {
      console.error('获取隐患数据失败:', error)
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
    this.setData({
      hazardList: [
        {
          id: 'HDD001',
          title: '轨道连接螺栓松动',
          type: 'equipment',
          typeName: '设备设施',
          level: '一般隐患',
          status: 'identified',
          statusName: '已发现',
          severity: 'C类',
          zone: '梁邹站场 K15+300',
          description: '巡检发现5处轨道连接螺栓有松动现象',
          deadline: '2024-12-25',
          responsiblePerson: '李工',
          priority: 3,
          priorityName: '一般'
        },
        {
          id: 'HDD002',
          title: '接触网支柱基础开裂',
          type: 'equipment',
          typeName: '设备设施',
          level: '重大隐患',
          status: 'treating',
          statusName: '整改中',
          severity: 'A类',
          zone: '专用线 K8+200',
          description: '接触网支柱基础出现明显裂缝',
          deadline: '2024-12-22',
          responsiblePerson: '技术经理_陈',
          priority: 1,
          priorityName: '重要'
        },
        {
          id: 'HDD003',
          title: '排水系统堵塞',
          type: 'environment',
          typeName: '环境因素',
          level: '一般隐患',
          status: 'completed',
          statusName: '已销号',
          severity: 'D类',
          zone: '货场线路段',
          description: '高架桥下方排水口堆积杂物影响排水',
          deadline: '2024-12-19',
          responsiblePerson: '组长_刘',
          priority: 4,
          priorityName: '一般',
          rectificationResult: '已清理，排水畅通'
        },
        {
          id: 'HDD004',
          title: '作业人员未佩戴防护用品',
          type: 'behavior',
          typeName: '人员行为',
          level: '一般隐患',
          status: 'identified',
          statusName: '已发现',
          severity: 'C类',
          zone: '3号作业点',
          description: '发现作业人员未按规定佩戴安全帽',
          deadline: '2024-12-25',
          responsiblePerson: '现场安全员',
          priority: 3,
          priorityName: '一般'
        }
      ],
      statistics: {
        total: 4,
        identified: 2,
        treating: 1,
        completed: 1,
        verified: 0,
        closureRate: 25
      }
    })
  },

  /**
   * 筛选状态改变
   */
  onFilterChange(e) {
    const status = e.currentTarget.dataset.status
    this.setData({
      filterStatus: status,
      page: 1
    })
    this.loadHazardData(true)
  },

  /**
   * 选择隐患类型
   */
  selectType(e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      selectedType: type
    })
    this.loadHazardData(true)
  },

  /**
   * 开始整改
   */
  startRectification(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认开始整改',
      content: '是否开始整改此隐患？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '开始整改',
            icon: 'success'
          })
        }
      }
    })
  },

  /**
   * 查看隐患详情
   */
  viewHazardDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/inspection/danger-supervision?id=${id}`
    })
  },

  /**
   * 添加隐患
   */
  addHazard() {
    wx.navigateTo({
      url: '/pages/inspection/danger-add'
    })
  },

  /**
   * 触底加载更多
   */
  onReachBottom() {
    if (this.data.hasMore && !this.data.isLoading) {
      this.setData({
        page: this.data.page + 1
      })
      this.loadHazardData(false)
    }
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.setData({
      page: 1
    })
    this.loadHazardData(true).then(() => {
      wx.stopPullDownRefresh()
    })
  },

  /**
   * 分享到微信
   */
  onShareAppMessage() {
    return {
      title: '隐患排查治理 - 铁路安全监控',
      path: '/pages/hazard/hazard'
    }
  }
})