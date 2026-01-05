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
    
    // 隐患排查列表 - GBT 33000-2025 Compliant
    inspectionList: [],
    // 筛选状态 - Updated per GBT 33000-2025
    filterStatus: 'all', // all, identified, treating, completed, verified
    // 统计数据 - GBT 33000-2025 隐患排查治理
    statistics: {
      total: 0,
      identified: 0,
      treating: 0,
      completed: 0,
      verified: 0,
      closureRate: 0 // 隐患闭环率
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
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 3
      })
    }
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
   * 使用模拟数据 - GBT 33000-2025 Compliant
   */
  useMockData() {
    const mockData = {
      statistics: {
        total: 12,
        identified: 4,
        treating: 5,
        completed: 2,
        verified: 1,
        closureRate: 25 // 闭环率按已验证计算
      },
      inspections: [
        {
          id: 'HDD001', // 隐患编号
          title: '轨道连接螺栓松动',
          type: 'equipment', // 设备设施类
          typeName: '设备设施',
          level: '一般隐患', // 隐患等级
          status: 'identified',
          statusName: '已发现',
          severity: 'C类', // 严重性分类
          zone: '梁邹站场 K15+300',
          finder: '张工',
          findDate: '2024-12-21',
          findTime: '10:30',
          description: '巡检发现5处轨道连接螺栓有松动现象',
          immediateMeasure: '已设置警示标志，通知维护组',
          treatmentMeasures: '立即紧固螺栓，加强该路段巡检频次',
          treatmentDeadline: '2024-12-25', // 整改期限
          responsibleDept: '线路维护组',
          responsiblePerson: '李工',
          supervisionPerson: '安全员_王',
          treatmentStatus: 'treating', // 正在整改
          treatmentStatusText: '整改中',
          priority: 3 // 优先级
        },
        {
          id: 'HDD002',
          title: '接触网支柱基础开裂',
          type: 'equipment',
          typeName: '设备设施',
          level: '重大隐患', // 重大隐患需立即上报
          status: 'identified',
          statusName: '已发现-已上报',
          severity: 'A类', // 重大隐患
          zone: '专用线 K8+200',
          finder: '巡检组_王',
          findDate: '2024-12-20',
          findTime: '14:15',
          description: '接触网支柱基础出现明显裂缝',
          immediateMeasure: '已封锁该区域，设置安全警戒线',
          treatmentMeasures: '制定专项检测方案，评估结构安全性，必要时更换支柱',
          treatmentDeadline: '2024-12-22', // 重大隐患需立即整改
          responsibleDept: '电力工程部',
          responsiblePerson: '技术经理_陈',
          supervisionPerson: '安全总监',
          treatmentStatus: 'urgent-treating',
          treatmentStatusText: '紧急整改中',
          priority: 1 // 最高优先级
        },
        {
          id: 'HDD003',
          title: '排水系统堵塞',
          type: 'environment', // 环境类
          typeName: '环境因素',
          level: '一般隐患',
          status: 'completed', // 已整改
          statusName: '已完成',
          severity: 'D类',
          zone: '货场线路段',
          finder: '李工',
          findDate: '2024-12-19',
          findTime: '09:00',
          description: '高架桥下方排水口堆积杂物影响排水',
          immediateMeasure: '立即清理排水口',
          treatmentMeasures: '清理堆积物，增加该区域定期清理频次',
          treatmentDeadline: '2024-12-19',
          responsibleDept: '清洁维护组',
          responsiblePerson: '组长_刘',
          treatmentCompleteDate: '2024-12-19',
          treatmentCompleteTime: '11:30',
          treatmentStatus: 'completed',
          treatmentStatusText: '整改完成',
          verificationMethod: '现场复查排水畅通',
          verificationPerson: '安全员_张',
          verificationDate: '2024-12-20',
          verificationResult: '合格', // 验证结果
          effectiveness: '管路畅通，运行正常',
          priority: 4
        },
        {
          id: 'HDD004',
          title: '作业人员未佩戴防护用品',
          type: 'behavior', // 人员行为类
          typeName: '人员行为',
          level: '一般隐患',
          status: 'identified',
          statusName: '已发现-现场教育',
          severity: 'C类',
          zone: '3号作业点',
          finder: '现场安全员_张',
          findDate: '2024-12-21',
          findTime: '16:45',
          description: '2名作业人员未佩戴安全帽和反光背心',
          immediateMeasure: '立即停止作业，现场安全教育',
          treatmentMeasures: '加强安全培训，增加现场检查频次，违规者按规定处理',
          treatmentDeadline: '2024-12-23',
          responsibleDept: '作业班组',
          responsiblePerson: '班组长_赵',
          supervisionPerson: '安全员_张',
          treatmentStatus: 'treating',
          treatmentStatusText: '教育整改中',
          priority: 3
        }
      ]
    }

    this.setData({
      statistics: mockData.statistics,
      inspectionList: mockData.inspections
    })
  },

  /**
   * 筛选状态变化
   */
  onFilterChange(event) {
    const status = event.currentTarget.dataset.status
    this.setData({
      filterStatus: status,
      page: 1,
      inspectionList: []
    })
    this.loadInspectionData(true)
  },

  /**
   * 查看巡检详情
   */
  viewInspectionDetail(event) {
    const inspectionId = event.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/inspection/inspection-detail?id=${inspectionId}`
    })
  },

  /**
   * 开始巡检
   */
  startInspection(event) {
    const inspectionId = event.currentTarget.dataset.id
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
   * 添加隐患
   */
  addInspection() {
    wx.navigateTo({
      url: '/pages/inspection/danger-add'
    })
  },

  /**
   * 生成检查表
   */
  generateChecklist() {
    wx.showLoading({ title: '生成中...' })

    wx.cloud.callFunction({
      name: 'checklist-gen',
      data: {
        action: 'generate',
        checkType: this.data.selectedCheckType,
        dept: app.globalData.userInfo?.dept || '',
        location: ''
      },
      success: res => {
        if (res.result.success) {
          wx.hideLoading()
          wx.navigateTo({
            url: `/pages/inspection/check-detail?checkItems=${encodeURIComponent(JSON.stringify(res.result.data.checkItems))}&checkType=${res.result.data.checkType}`
          })
        } else {
          wx.hideLoading()
          app.showError(res.result.error || '生成失败')
        }
      },
      fail: err => {
        wx.hideLoading()
        console.error('生成检查表失败:', err)
        app.showError('生成失败')
      }
    })
  },

  /**
   * 选择检查类型
   */
  onCheckTypeChange(e) {
    const index = e.detail.value
    this.setData({
      selectedCheckType: this.data.checkTypes[index].value,
      showCheckTypePicker: false
    })
  },

  /**
   * 选择检查类型（点击选择）
   */
  selectCheckType(e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      selectedCheckType: type
    })
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.setData({
      page: 1,
      inspectionList: []
    })
    this.loadInspectionData(true).then(() => {
      wx.stopPullDownRefresh()
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
      this.loadInspectionData(false)
    }
  },

  /**
   * 分享
   */
  onShareAppMessage() {
    return {
      title: '铁路巡检管理 - 铁路安全监控',
      path: '/pages/inspection/inspection'
    }
  }
})
