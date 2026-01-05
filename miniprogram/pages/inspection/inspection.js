const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 检查类型
    checkTypes: [
      { label: '日常排查', value: 'daily', desc: '每班/每日检查' },
      { label: '定期排查', value: 'regular', desc: '每月/每季检查' },
      { label: '专项排查', value: 'special', desc: '特定领域检查' }
    ],
    selectedCheckType: 'daily',
    showCheckTypePicker: false,
    
    // 巡检列表
    inspectionList: [],
    // 筛选状态
    filterStatus: 'all',
    // 统计数据
    statistics: {
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0
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
    this.loadInspectionData()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // inspection页面不在TabBar中，无需设置TabBar状态
  },

  /**
   * 加载巡检数据
   */
  async loadInspectionData(reset = true) {
    if (this.data.isLoading) return

    this.setData({ isLoading: true })
    wx.showLoading({ title: '加载中...' })

    try {
      // 调用云函数获取巡检数据
      const result = await wx.cloud.callFunction({
        name: 'getInspections',
        data: {
          status: this.data.filterStatus === 'all' ? null : this.data.filterStatus,
          page: this.data.page,
          size: 20
        }
      })

      if (result.result.success) {
        const data = result.result.data

        this.setData({
          inspectionList: reset ? data.inspections : [...this.data.inspectionList, ...data.inspections],
          statistics: data.statistics,
          hasMore: data.currentPage < data.totalPages,
          page: reset ? 1 : this.data.page
        })
      } else {
        // 使用模拟数据
        this.useMockData()
      }
    } catch (error) {
      console.error('获取巡检数据失败:', error)
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
      inspectionList: [
        {
          id: 1,
          title: '日常安全巡检',
          type: 'daily',
          typeName: '日常排查',
          priority: 2,
          priorityName: '一般',
          status: 'pending',
          statusName: '待巡检',
          plannedDate: '2024-12-25',
          plannedTime: '09:00',
          inspector: '张工',
          zone: '邹平站场',
          description: '对站场设备进行全面检查'
        },
        {
          id: 2,
          title: '轨道线路巡检',
          type: 'regular',
          typeName: '定期排查',
          priority: 1,
          priorityName: '重要',
          status: 'in-progress',
          statusName: '进行中',
          plannedDate: '2024-12-24',
          plannedTime: '14:00',
          inspector: '李工',
          zone: '专用线区间',
          description: '检查轨道连接、轨距、水平等参数'
        },
        {
          id: 3,
          title: '接触网专项检查',
          type: 'special',
          typeName: '专项排查',
          priority: 1,
          priorityName: '重要',
          status: 'completed',
          statusName: '已完成',
          plannedDate: '2024-12-23',
          plannedTime: '10:00',
          inspector: '王工',
          zone: '接触网支柱',
          description: '检查接触网支柱基础状态',
          findings: '发现3处支柱基础有轻微裂缝，已记录'
        }
      ],
      statistics: {
        total: 3,
        pending: 1,
        inProgress: 1,
        completed: 1
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
    this.loadInspectionData(true)
  },

  /**
   * 选择检查类型
   */
  selectCheckType(e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      selectedCheckType: type
    })
    this.loadInspectionData(true)
  },

  /**
   * 开始巡检
   */
  startInspection(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认开始',
      content: '是否开始此巡检任务？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '开始巡检',
            icon: 'success'
          })
          // 这里可以调用云函数更新状态
        }
      }
    })
  },

  /**
   * 查看巡检详情
   */
  viewInspectionDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/inspection/inspection-detail?id=${id}`
    })
  },

  /**
   * 添加巡检
   */
  addInspection() {
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
      this.loadInspectionData(false)
    }
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.setData({
      page: 1
    })
    this.loadInspectionData(true).then(() => {
      wx.stopPullDownRefresh()
    })
  },

  /**
   * 分享到微信
   */
  onShareAppMessage() {
    return {
      title: '巡检管理 - 铁路安全监控',
      path: '/pages/inspection/inspection'
    }
  }
})