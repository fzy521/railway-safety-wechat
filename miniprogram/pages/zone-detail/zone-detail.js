Page({
  data: {
    zoneId: '',
    zoneName: '',
    zoneInfo: {},
    loading: true,
    // 区域设备状态
    deviceStatus: {
      total: 0,
      online: 0,
      offline: 0,
      warning: 0
    },
    // 区域风险等级分布
    riskDistribution: [],
    // 区域隐患统计
    hazardStats: {
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0
    },
    // 最近检查记录
    recentInspections: []
  },

  onLoad(options) {
    if (options.zoneId && options.zoneName) {
      this.setData({
        zoneId: options.zoneId,
        zoneName: decodeURIComponent(options.zoneName)
      });
      this.loadZoneDetail();
    }
  },

  onReady() {
    wx.setNavigationBarTitle({
      title: this.data.zoneName
    });
  },

  // 加载区域详情数据
  async loadZoneDetail() {
    this.setData({ loading: true });
    wx.showLoading({ title: '加载中...' });

    try {
      // 调用云函数获取区域详情
      const result = await wx.cloud.callFunction({
        name: 'getZoneDetail',
        data: { zoneId: this.data.zoneId }
      });

      if (result && result.result && result.result.success) {
        const { zoneInfo, deviceStatus, riskDistribution, hazardStats, recentInspections } = result.result.data;
        this.setData({
          zoneInfo,
          deviceStatus,
          riskDistribution,
          hazardStats,
          recentInspections
        });
      } else {
        // 使用模拟数据
        this.loadMockData();
      }
    } catch (error) {
      console.error('加载区域详情失败:', error);
      wx.showToast({ title: '加载失败', icon: 'none' });
      // 使用模拟数据
      this.loadMockData();
    } finally {
      this.setData({ loading: false });
      wx.hideLoading();
    }
  },

  // 加载模拟数据
  loadMockData() {
    const mockZoneInfo = {
      id: this.data.zoneId,
      name: this.data.zoneName,
      status: 'safe',
      statusText: '安全',
      description: '铁路站场，负责列车停靠和货物装卸',
      area: '12000㎡',
      personnel: 35,
      incidents: 0,
      risks: 2,
      lastInspection: '2024-01-10 14:30',
      safetyScore: 95
    };

    const mockDeviceStatus = {
      total: 25,
      online: 23,
      offline: 2,
      warning: 0
    };

    const mockRiskDistribution = [
      { label: '低风险', value: 15, color: '#07c160' },
      { label: '一般风险', value: 2, color: '#ffbe00' },
      { label: '较大风险', value: 0, color: '#ff7d00' },
      { label: '重大风险', value: 0, color: '#ee0a24' }
    ];

    const mockHazardStats = {
      total: 12,
      pending: 2,
      inProgress: 1,
      completed: 9
    };

    const mockRecentInspections = [
      { id: 1, time: '2024-01-10 14:30', inspector: '张三', result: '正常', issues: 0 },
      { id: 2, time: '2024-01-09 09:15', inspector: '李四', result: '正常', issues: 1 },
      { id: 3, time: '2024-01-08 16:45', inspector: '王五', result: '正常', issues: 0 }
    ];

    this.setData({
      zoneInfo: mockZoneInfo,
      deviceStatus: mockDeviceStatus,
      riskDistribution: mockRiskDistribution,
      hazardStats: mockHazardStats,
      recentInspections: mockRecentInspections
    });
  },

  // 查看设备详情
  viewDeviceDetail() {
    wx.navigateTo({
      url: `/pages/device-list/device-list?zoneId=${this.data.zoneId}&zoneName=${encodeURIComponent(this.data.zoneName)}`
    });
  },

  // 查看隐患详情
  viewHazardDetail() {
    wx.navigateTo({
      url: `/pages/hazard-list/hazard-list?zoneId=${this.data.zoneId}&zoneName=${encodeURIComponent(this.data.zoneName)}`
    });
  },

  // 查看检查记录
  viewInspectionDetail() {
    wx.navigateTo({
      url: `/pages/inspection-list/inspection-list?zoneId=${this.data.zoneId}&zoneName=${encodeURIComponent(this.data.zoneName)}`
    });
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  }
});