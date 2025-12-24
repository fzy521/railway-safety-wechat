import * as echarts from '../../utils/ec-canvas/echarts';

let chartInstance = null;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    todayIncidents: 0,
    riskLevel: '正常',
    safetyRate: 95,
    completionRate: 98,
    lowRisks: 12,
    mediumRisks: 3,
    highRisks: 1,
    zones: [
      {
        id: 1,
        name: '梁邹站场',
        status: 'safe',
        statusText: '安全',
        incidents: 0,
        risks: 2
      },
      {
        id: 2,
        name: '专用线区间',
        status: 'warning',
        statusText: '注意',
        incidents: 1,
        risks: 3
      },
      {
        id: 3,
        name: '货场线',
        status: 'safe',
        statusText: '安全',
        incidents: 0,
        risks: 1
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.loadDashboardData();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      })
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.loadDashboardData().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    this.initChart();
  },

  /**
   * 加载仪表板数据
   */
  async loadDashboardData() {
    wx.showLoading({ title: '加载中...' });

    try {
      // 调用云函数获取数据
      const result = await wx.cloud.callFunction({
        name: 'getSafetyMetrics',
        data: {
          date: new Date().toISOString().split('T')[0]
        }
      });

      if (result.result.success) {
        const data = result.result.data;
        this.setData({
          todayIncidents: data.todayIncidents || 0,
          riskLevel: data.riskLevel || '正常',
          safetyRate: data.safetyRate || 95,
          completionRate: data.completionRate || 98,
          lowRisks: data.riskCounts?.low || 12,
          mediumRisks: data.riskCounts?.medium || 3,
          highRisks: data.riskCounts?.high || 1,
          zones: data.zones || this.data.zones
        });

        // 更新图表
        this.updateChart(data.trendData || []);
      }
    } catch (error) {
      console.error('获取仪表板数据失败:', error);
      app.showError('获取数据失败');

      // 使用模拟数据演示
      this.useMockData();
    } finally {
      wx.hideLoading();
    }
  },

  /**
   * 使用模拟数据
   */
  useMockData() {
    // 模拟事故趋势数据
    const trendData = [
      { date: '周一', incidents: 2 },
      { date: '周二', incidents: 1 },
      { date: '周三', incidents: 3 },
      { date: '周四', incidents: 0 },
      { date: '周五', incidents: 1 },
      { date: '周六', incidents: 0 },
      { date: '今日', incidents: 0 }
    ];

    this.updateChart(trendData);
  },

  /**
   * 初始化图表
   */
  initChart() {
    // 使用小程序canvas API直接绘制
    this.drawSimpleChart();
  },

  /**
   * 绘制简单图表
   */
  drawSimpleChart() {
    const query = wx.createSelectorQuery().in(this);
    query.select('#incidentChart')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) return;

        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const { width, height } = res[0];

        // 设置canvas实际渲染大小
        canvas.width = width * wx.getSystemInfoSync().pixelRatio;
        canvas.height = height * wx.getSystemInfoSync().pixelRatio;
        ctx.scale(wx.getSystemInfoSync().pixelRatio, wx.getSystemInfoSync().pixelRatio);

        // 绘制简单的柱状图
        this.drawColumnChart(ctx, width, height, [
          { label: '周一', value: 2 },
          { label: '周二', value: 1 },
          { label: '周三', value: 3 },
          { label: '周四', value: 0 },
          { label: '周五', value: 1 },
          { label: '周六', value: 0 },
          { label: '今日', value: 0 }
        ]);
      });
  },

  /**
   * 绘制柱状图
   */
  drawColumnChart(ctx, width, height, data) {
    const padding = 40;
    const barWidth = (width - padding * 2) / data.length - 10;
    const maxValue = Math.max(...data.map(d => d.value), 5);
    const chartHeight = height - padding * 2;

    // 清空画布
    ctx.clearRect(0, 0, width, height);

    // 绘制网格线
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // 绘制柱状图
    data.forEach((item, index) => {
      const x = padding + index * (barWidth + 10) + 5;
      const barHeight = (item.value / maxValue) * chartHeight;
      const y = height - padding - barHeight;

      // 绘制柱子
      ctx.fillStyle = item.value > 2 ? '#ee0a24' : item.value > 0 ? '#ffbe00' : '#07c160';
      ctx.fillRect(x, y, barWidth, barHeight);

      // 绘制标签
      ctx.fillStyle = '#666';
      ctx.font = '24rpx sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(item.label, x + barWidth / 2, height - padding + 30);

      // 绘制数值
      if (item.value > 0) {
        ctx.fillStyle = '#333';
        ctx.font = '24rpx sans-serif';
        ctx.fillText(item.value, x + barWidth / 2, y - 10);
      }
    });
  },

  /**
   * 更新图表数据
   */
  updateChart(trendData) {
    // 简化版本，直接重绘
    this.drawSimpleChart();
  },

  /**
   * 跳转详情页面
   */
  goToIncidentDetail() {
    wx.navigateTo({
      url: '/pages/incident/incident'
    });
  },

  /**
   * 跳转风险评估详情
   */
  goToRiskDetail() {
    wx.navigateTo({
      url: '/pages/risk/risk'
    });
  },

  /**
   * 分享
   */
  onShareAppMessage() {
    return {
      title: '梁邹铁路安全监控 - 实时数据',
      path: '/pages/dashboard/dashboard'
    };
  }
});