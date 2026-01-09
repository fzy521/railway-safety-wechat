// 实时数据库监听补丁代码
// 将此代码添加到 dashboard.js 的 Page() 对象中

// 1. 在 data 中添加配置
data: {
  // ... 其他配置
  enableRealtime: true, // 是否启用实时数据库监听
  realtimeWatchers: [], // 存储所有监听器实例
  realtimeConnected: false // 实时数据库连接状态
},

// 2. 修改 onLoad 方法
onLoad(options) {
  console.log('数据看板页面加载');
  if (!app.globalData.hasUserInfo) {
    wx.redirectTo({ url: '/pages/login/login' });
    return;
  }
  this.loadDashboardData();
  
  // 启用实时数据库监听
  if (this.data.enableRealtime) {
    this.setupRealtimeUpdates();
  }
  
  if (typeof this.getTabBar === 'function' && this.getTabBar()) {
    this.getTabBar().setData({ selected: 0 });
  }
},

// 3. 修改 onShow 方法
onShow() {
  console.log('数据看板页面显示');
  if (!app.globalData.hasUserInfo) {
    wx.redirectTo({ url: '/pages/login/login' });
    return;
  }
  // 启用实时数据库监听
  if (this.data.enableRealtime && !this.data.realtimeConnected) {
    this.setupRealtimeUpdates();
  }
},

// 4. 修改 onHide 方法
onHide() {
  console.log('数据看板页面隐藏');
  this.stopRealtimeUpdates();
},

// 5. 修改 onUnload 方法
onUnload() {
  console.log('数据看板页面卸载');
  this.stopRealtimeUpdates();
},

// 6. 添加以下方法到 Page() 对象中

// 设置实时更新
setupRealtimeUpdates() {
  console.log('启动实时数据更新监听');
  this.setupRealtimeWatchers();
},

// 停止实时更新
stopRealtimeUpdates() {
  this.closeRealtimeWatchers();
},

// 设置实时数据监听器
setupRealtimeWatchers() {
  const db = wx.cloud.database();
  const _ = db.command;

  try {
    console.log('开始设置实时数据监听器');

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

    this.setData({ realtimeConnected: true });
    console.log('实时数据监听器已启动');
  } catch (error) {
    console.error('设置实时数据监听失败:', error);
    this.setData({ realtimeConnected: false });
  }
},

// 关闭实时数据监听器
closeRealtimeWatchers() {
  try {
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
    this.setData({ realtimeConnected: false });
    console.log('实时数据监听器已关闭');
  } catch (error) {
    console.error('关闭监听器失败:', error);
  }
},

// 处理风险预警数据更新
handleRiskWarningUpdate(snapshot) {
  const docs = snapshot.docs || [];
  const pendingCount = docs.filter(item => item.status === '待处理').length;

  this.setData({
    'recentAlerts': docs.map(item => ({
      id: item._id,
      type: '风险预警',
      level: item.warningLevel,
      message: item.warningContent,
      time: this.formatDate(new Date(item.createdAt))
    }))
  });

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
  
  if (snapshot.type === 'init') {
    console.log('隐患数据初始化完成');
  } else {
    // 更新隐患统计
    this.loadDashboardData();
  }
},

// 处理事故数据更新
handleIncidentUpdate(snapshot) {
  const docs = snapshot.docs || [];
  
  if (snapshot.type === 'init') {
    console.log('事故数据初始化完成');
  } else {
    // 更新事故统计
    this.loadDashboardData();
  }
}