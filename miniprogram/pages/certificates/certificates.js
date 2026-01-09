const app = getApp()

Page({
  data: {
    certificates: [],
    loading: true
  },

  onLoad() {
    this.loadCertificates()
  },

  loadCertificates() {
    wx.showLoading({ title: '加载中...' })

    // 模拟数据 - 实际应该从数据库读取
    const mockCertificates = [
      {
        id: '1',
        name: '铁路安全管理资格证',
        type: '安全管理',
        issuer: '国家铁路局',
        number: 'TLS20240001',
        issueDate: '2024-01-15',
        expiryDate: '2026-01-15',
        status: 'valid',
        statusText: '有效',
        daysLeft: 375,
        isExpiring: false
      },
      {
        id: '2',
        name: '特种设备操作证',
        type: '技能资格',
        issuer: '质量技术监督局',
        number: 'TSE20240002',
        issueDate: '2024-03-20',
        expiryDate: '2026-03-20',
        status: 'valid',
        statusText: '有效',
        daysLeft: 409,
        isExpiring: false
      },
      {
        id: '3',
        name: '消防培训合格证',
        type: '安全培训',
        issuer: '消防救援局',
        number: 'FET20240003',
        issueDate: '2024-06-10',
        expiryDate: '2025-06-10',
        status: 'expiring',
        statusText: '即将过期',
        daysLeft: 155,
        isExpiring: true
      }
    ]

    setTimeout(() => {
      wx.hideLoading()
      this.setData({
        certificates: mockCertificates,
        loading: false
      })
    }, 1000)
  },

  viewCertificate(event) {
    const id = event.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/certificate/certificate?id=' + id
    })
  }
})