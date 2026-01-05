// package-safety/pages/certificate/certificate.js
const app = getApp()

Page({
  /**
   * 页面的初始数据 - GBT 33000-2025 人员证书管理
   */
  data: {
    // 证书列表
    certificates: [],
    // 筛选状态
    filterStatus: 'all', // all, valid, expiring, expired
    // 统计数据
    statistics: {
      total: 0,
      valid: 0,
      expiring: 0,
      expired: 0
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.loadCertificateData()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 加载证书数据
   */
  loadCertificateData() {
    wx.showLoading({ title: '加载中...' })

    // 模拟证书数据 - GBT 33000-2025 持证上岗要求
    const mockCertificates = [
      {
        id: 'CERT001',
        certNo: 'CERT-2024-DQ-001',
        employeeId: 'EMP001',
        employeeName: '张三',
        department: '电力部门',
        position: '接触网工',
        certType: '特种作业操作证', // 证书类型
        certName: '高处作业操作证',
        issuingAuthority: '应急管理厅', // 发证机关
        issueDate: '2024-12-20',
        expiryDate: '2027-12-19', // 有效期3年
        nextReviewDate: '2027-11-19', // 提前30天复审
        status: 'valid',
        statusText: '有效',
        workingYears: 5, // 从业年限
        photo: '', // 证书照片
        isSpecialOperation: true, // 是否特种作业
        reviewStatus: 'not-due', // 未到复审期
        notes: '从事接触网维护作业必须持证'
      },
      {
        id: 'CERT002',
        certNo: 'CERT-2024-DQ-002',
        employeeId: 'EMP002',
        employeeName: '李四',
        department: '电力部门',
        position: '接触网工',
        certType: '特种作业操作证',
        certName: '电工作业证',
        issuingAuthority: '应急管理厅',
        issueDate: '2024-12-20',
        expiryDate: '2027-12-19',
        nextReviewDate: '2027-11-19',
        status: 'valid',
        statusText: '有效',
        workingYears: 3,
        isSpecialOperation: true,
        reviewStatus: 'not-due',
        notes: '高压电工作业'
      },
      {
        id: 'CERT003',
        certNo: 'CERT-2024-NEW-003',
        employeeId: 'EMP003',
        employeeName: '王五',
        department: '线路维护组',
        position: '线路工',
        certType: '安全培训合格证',
        certName: '新员工安全培训合格证',
        issuingAuthority: '安全管理部门',
        issueDate: '2024-12-18',
        expiryDate: '2025-12-17', // 有效期1年
        nextReviewDate: '2025-11-17',
        status: 'valid',
        statusText: '有效',
        workingYears: 0.5,
        isSpecialOperation: false,
        reviewStatus: 'not-due',
        notes: '新员工必须完成三级安全教育'
      },
      {
        id: 'CERT004',
        certNo: 'CERT-2021-OLD-004',
        employeeId: 'EMP004',
        employeeName: '赵六',
        department: '线路维护组',
        position: '线路工',
        certType: '特种作业操作证',
        certName: '焊接与热切割作业证',
        issuingAuthority: '应急管理厅',
        issueDate: '2021-05-10',
        expiryDate: '2024-05-09', // 已过期
        nextReviewDate: '2024-04-09', // 已过期
        status: 'expired',
        statusText: '已过期',
        workingYears: 8,
        isSpecialOperation: true,
        reviewStatus: 'overdue', // 超期
        notes: '证书已过期，禁止从事焊接作业'
      },
      {
        id: 'CERT005',
        certNo: 'CERT-2022-EMP-005',
        employeeId: 'EMP005',
        employeeName: '孙七',
        department: '安全管理部门',
        position: '安全员',
        certType: '安全管理人员资格证',
        certName: '安全生产管理人员资格证',
        issuingAuthority: '应急管理厅',
        issueDate: '2022-03-15',
        expiryDate: '2025-03-14', // 即将过期（3个月内）
        nextReviewDate: '2025-02-14', // 即将复审
        status: 'valid',
        statusText: '有效',
        workingYears: 6,
        isSpecialOperation: false,
        reviewStatus: 'due-soon', // 即将到期
        notes: '安全管理人员必须持证，即将到期需复审'
      }
    ]

    // 统计证书状态
    const stats = {
      total: mockCertificates.length,
      valid: mockCertificates.filter(c => c.status === 'valid').length,
      expiring: mockCertificates.filter(c => c.reviewStatus === 'due-soon').length,
      expired: mockCertificates.filter(c => c.status === 'expired').length
    }

    this.setData({
      certificates: mockCertificates,
      statistics: stats
    })

    wx.hideLoading()
  },

  /**
   * 筛选状态变化
   */
  onFilterChange(event) {
    const status = event.currentTarget.dataset.status
    this.setData({
      filterStatus: status
    })
  },

  /**
   * 查看证书详情
   */
  viewCertificateDetail(event) {
    const certId = event.currentTarget.dataset.id
    wx.showToast({
      title: '证书详情开发中',
      icon: 'none'
    })
  },

  /**
   * 添加证书
   */
  addCertificate() {
    wx.navigateTo({
      url: '/package-safety/pages/certificate/certificate-add'
    })
  },

  /**
   * 申请复审
   */
  applyReview(event) {
    const certId = event.currentTarget.dataset.id
    wx.showModal({
      title: '申请复审',
      content: '确认申请证书复审？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '复审申请已提交',
            icon: 'success'
          })
        }
      }
    })
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.loadCertificateData()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 500)
  },

  /**
   * 分享
   */
  onShareAppMessage() {
    return {
      title: '证书管理 - 铁路安全监控',
      path: '/package-safety/pages/certificate/certificate'
    }
  }
})