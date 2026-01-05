// package-safety/pages/training/training.js
const app = getApp()

Page({
  /**
   * 页面的初始数据 - GBT 33000-2025 人员培训管理
   */
  data: {
    // 培训计划列表
    trainingPlans: [],
    // 培训记录列表
    trainingRecords: [],
    // 统计数据
    statistics: {
      totalPlans: 0,
      completedPlans: 0,
      totalParticipants: 0,
      qualifiedRate: 0
    },
    activeTab: 'plans' // plans, records
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.loadTrainingData()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 加载培训数据
   */
  loadTrainingData() {
    wx.showLoading({ title: '加载中...' })

    // 模拟培训计划数据 - GBT 33000-2025
    const mockPlans = [
      {
        id: 'TP001',
        name: '冬季安全生产专项培训',
        type: 'safety', // 安全培训
        typeName: '安全培训',
        target: '全体作业人员',
        participants: 45,
        plannedDate: '2024-12-25',
        plannedHours: 4,
        trainer: '安全总监_李',
        department: '安全管理部门',
        status: 'planned',
        statusText: '计划中',
        content: '冬季作业安全注意事项、防寒防冻措施、应急处理',
        trainingMethod: '集中授课+实操演练',
        objectives: '提高冬季作业安全意识，掌握防寒防冻技能',
        assessmentMethod: '理论考试+实操考核',
        requiredByLaw: true, // 法律法规要求
        notes: '根据GB/T 33000-2025 5.6.2条款要求'
      },
      {
        id: 'TP002',
        name: '接触网作业人员资格培训',
        type: 'qualification',
        typeName: '资格培训',
        target: '接触网作业人员',
        participants: 12,
        plannedDate: '2024-12-20',
        plannedHours: 16,
        trainer: '电力专家_张',
        department: '电力部门',
        status: 'completed',
        statusText: '已完成',
        content: '接触网结构原理、安全操作规程、故障处理',
        trainingMethod: '理论授课+现场实操',
        objectives: '取得接触网作业资格证书',
        assessmentMethod: '理论考试+实操考核+安全考试',
        requiredByLaw: true,
        passRate: 100, // 合格率
        evaluation: '培训效果良好，所有学员均通过考核',
        notes: '特种作业人员必须持证上岗'
      },
      {
        id: 'TP003',
        name: '新员工三级安全教育',
        type: 'safety',
        typeName: '安全培训',
        target: '新入职员工',
        participants: 8,
        plannedDate: '2024-12-18',
        plannedHours: 24,
        trainer: '培训师_王',
        department: '人力资源部',
        status: 'completed',
        statusText: '已完成',
        content: '公司级、部门级、班组级安全教育',
        trainingMethod: '授课+视频+实操',
        objectives: '掌握基本安全知识，熟悉岗位安全操作规程',
        assessmentMethod: '考试+实操考核',
        requiredByLaw: true,
        passRate: 100,
        evaluation: '培训效果良好',
        notes: 'GBT 33000-2025 5.6.1条款要求'
      },
      {
        id: 'TP004',
        name: '应急预案演练培训',
        type: 'emergency',
        typeName: '应急培训',
        target: '应急救援队伍',
        participants: 20,
        plannedDate: '2024-12-22',
        plannedHours: 8,
        trainer: '应急专家_陈',
        department: '安全管理部门',
        status: 'in-progress',
        statusText: '进行中',
        content: '应急预案解读、演练流程、职责分工',
        trainingMethod: '桌面推演+现场演练',
        objectives: '熟练掌握应急预案内容和处置流程',
        assessmentMethod: '演练评估',
        requiredByLaw: true,
        notes: 'GBT 33000-2025 5.8.3条款要求'
      }
    ]

    // 模拟培训记录
    const mockRecords = [
      {
        id: 'TR001',
        planId: 'TP002',
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
        certificateNo: 'CERT-2024-DQ-001', // 证书编号
        issueDate: '2024-12-20',
        expiryDate: '2027-12-19', // 3年有效期
        nextTrainingDate: '2027-11-19' // 提前1个月复审
      },
      {
        id: 'TR002',
        planId: 'TP002',
        planName: '接触网作业人员资格培训',
        employeeId: 'EMP002',
        employeeName: '李四',
        department: '电力部门',
        position: '接触网工',
        trainingDate: '2024-12-20',
        hours: 16,
        score: 88,
        result: 'passed',
        resultText: '合格',
        trainer: '电力专家_张',
        certificateNo: 'CERT-2024-DQ-002',
        issueDate: '2024-12-20',
        expiryDate: '2027-12-19',
        nextTrainingDate: '2027-11-19'
      },
      {
        id: 'TR003',
        planId: 'TP003',
        planName: '新员工三级安全教育',
        employeeId: 'EMP003',
        employeeName: '王五',
        department: '线路维护组',
        position: '线路工',
        trainingDate: '2024-12-18',
        hours: 24,
        score: 85,
        result: 'passed',
        resultText: '合格',
        trainer: '培训师_王',
        certificateNo: 'CERT-2024-NEW-003',
        issueDate: '2024-12-18',
        expiryDate: '2025-12-17', // 新员工培训证书有效期1年
        nextTrainingDate: '2025-11-17'
      }
    ]

    this.setData({
      trainingPlans: mockPlans,
      trainingRecords: mockRecords,
      statistics: {
        totalPlans: mockPlans.length,
        completedPlans: mockPlans.filter(p => p.status === 'completed').length,
        totalParticipants: mockRecords.length,
        qualifiedRate: 100 // 模拟合格率
      }
    })

    wx.hideLoading()
  },

  /**
   * 切换标签页
   */
  switchTab(event) {
    const tab = event.currentTarget.dataset.tab
    this.setData({ activeTab: tab })
  },

  /**
   * 查看培训计划详情
   */
  viewPlanDetail(event) {
    const planId = event.currentTarget.dataset.id
    wx.showToast({
      title: '培训计划详情开发中',
      icon: 'none'
    })
  },

  /**
   * 添加培训计划
   */
  addTrainingPlan() {
    wx.navigateTo({
      url: '/package-safety/pages/training/training-plan-add'
    })
  },

  /**
   * 查看培训记录详情
   */
  viewRecordDetail(event) {
    const recordId = event.currentTarget.dataset.id
    wx.navigateTo({
      url: `/package-safety/pages/training/training-record-detail?id=${recordId}`
    })
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.loadTrainingData()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 500)
  },

  /**
   * 分享
   */
  onShareAppMessage() {
    return {
      title: '培训管理 - 铁路安全监控',
      path: '/package-safety/pages/training/training'
    }
  }
})