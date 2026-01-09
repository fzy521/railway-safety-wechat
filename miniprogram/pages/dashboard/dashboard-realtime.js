// 微信云开发实时数据库监听示例代码
// 可以参考此代码实现实时数据更新

const db = wx.cloud.database();
const _ = db.command;

Page({
  data: {
    // 实时数据
    realtimeData: {
      riskWarnings: [],
      hazards: [],
      incidents: []
    }
  },

  onLoad() {
    this.setupRealtimeWatchers();
  },

  onUnload() {
    this.closeRealtimeWatchers();
  },

  // 设置实时数据监听器
  setupRealtimeWatchers() {
    try {
      // 1. 监听风险预警数据变化
      this.riskWarningWatcher = db.collection('risk_warnings')
        .where({
          status: _.in(['待处理', '处理中'])
        })
        .watch({
          onChange: (snapshot) => {
            console.log('风险预警数据变化:', snapshot);
            this.handleRiskWarningUpdate(snapshot);
          },
          onError: (err) => {
            console.error('监听风险预警数据失败:', err);
          }
        });

      // 2. 监听隐患数据变化
      this.hazardWatcher = db.collection('hidden_danger_library')
        .where({
          status: _.in(['待整改', '整改中', '待验证'])
        })
        .watch({
          onChange: (snapshot) => {
            console.log('隐患数据变化:', snapshot);
            this.handleHazardUpdate(snapshot);
          },
          onError: (err) => {
            console.error('监听隐患数据失败:', err);
          }
        });

      // 3. 监听事故数据变化
      this.incidentWatcher = db.collection('incidents')
        .where({
          status: _.in(['处理中', '待处理'])
        })
        .watch({
          onChange: (snapshot) => {
            console.log('事故数据变化:', snapshot);
            this.handleIncidentUpdate(snapshot);
          },
          onError: (err) => {
            console.error('监听事故数据失败:', err);
          }
        });

      console.log('实时数据监听器已启动');
    } catch (error) {
      console.error('设置实时数据监听失败:', error);
    }
  },

  // 关闭实时数据监听器
  closeRealtimeWatchers() {
    if (this.riskWarningWatcher) {
      this.riskWarningWatcher.close();
      this.riskWarningWatcher = null;
    }
    if (this.hazardWatcher) {
      this.hazardWatcher.close();
      this.hazardWatcher = null;
    }
    if (this.incidentWatcher) {
      this.incidentWatcher.close();
      this.incidentWatcher = null;
    }
    console.log('实时数据监听器已关闭');
  },

  // 处理风险预警数据更新
  handleRiskWarningUpdate(snapshot) {
    const docs = snapshot.docs || [];
    const pendingCount = docs.filter(item => item.status === '待处理').length;

    this.setData({
      'realtimeData.riskWarnings': docs
    });

    // 显示通知
    if (snapshot.type === 'init') {
      console.log('风险预警数据初始化完成');
    } else {
      wx.showToast({
        title: `有${pendingCount}条风险预警待处理`,
        icon: 'none',
        duration: 2000
      });
    }
  },

  // 处理隐患数据更新
  handleHazardUpdate(snapshot) {
    const docs = snapshot.docs || [];

    this.setData({
      'realtimeData.hazards': docs
    });

    if (snapshot.type === 'init') {
      console.log('隐患数据初始化完成');
    } else {
      // 刷新页面数据
      this.loadDashboardData();
    }
  },

  // 处理事故数据更新
  handleIncidentUpdate(snapshot) {
    const docs = snapshot.docs || [];

    this.setData({
      'realtimeData.incidents': docs
    });

    if (snapshot.type === 'init') {
      console.log('事故数据初始化完成');
    } else {
      // 刷新页面数据
      this.loadDashboardData();
    }
  },

  // 加载仪表盘数据
  loadDashboardData() {
    // 调用云函数获取最新数据
    wx.cloud.callFunction({
      name: 'getQuickStats',
      data: {},
      success: (res) => {
        console.log('获取统计数据成功:', res.result);
        // 更新页面数据
      },
      fail: (err) => {
        console.error('获取统计数据失败:', err);
      }
    });
  }
});