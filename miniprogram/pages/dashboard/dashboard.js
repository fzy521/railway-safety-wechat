// pages/dashboard/dashboard.js
const chartUtils = require('../../utils/chart.js');
const app = getApp();

Page({
  data: {
    safetyOverview: {
      todayIncidents: 0,
      recentIncidents: 0,
      totalRisks: 0,
      majorRisks: 0,
      safetyScore: 0,
      riskLevel: '低风险',
      safetyRate: 0,
      totalInspections: 0,
      passedInspections: 0,
      pendingInspections: 0,
      inspectionCompletionRate: 0
    },
    onlineDevices: 0,
    offlineDevices: 0,
    recentAlerts: [],
    riskLevels: {
      low: 0,
      moderate: 0,
      critical: 0,
      major: 0
    },
    hazardData: {
      totalHazards: 0,
      resolvedHazards: 0,
      pendingHazards: 0,
      closureRate: 0
    },
    zoneStatus: [],
    filteredZoneStatus: [],
    // 区域排序和筛选配置
    zoneSortIndex: 0,
    zoneSortOptions: [
      { name: '默认', value: 'default' },
      { name: '按安全系数', value: 'safetyScore' },
      { name: '按事故数量', value: 'incidents' },
      { name: '按隐患数量', value: 'hazards' }
    ],
    zoneFilterIndex: 0,
    zoneFilterOptions: [
      { name: '全部', value: 'all' },
      { name: '安全', value: '安全' },
      { name: '警告', value: '警告' },
      { name: '危险', value: '危险' }
    ],
    trendChartData: {},
    riskChartData: {},
    hazardChartData: {},
    updateTime: '',
    loading: false,
    // WebSocket相关状态
    wsConnected: false,
    wsUrl: '', // WebSocket服务器地址（暂未配置）
    enableWebSocket: false // 是否启用WebSocket（暂不启用）
  },

  onLoad(options) {
    console.log('数据看板页面加载');
    // 检查登录状态
    if (!app.globalData.hasUserInfo) {
      wx.redirectTo({ url: '/pages/login/login' });
      return;
    }
    this.loadDashboardData();
    // 暂不启用WebSocket实时更新
    // this.setupRealtimeUpdates();
    
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 });
    }
  },

  onShow() {
    console.log('数据看板页面显示');
    if (!app.globalData.hasUserInfo) {
      wx.redirectTo({ url: '/pages/login/login' });
      return;
    }
    // 暂不启用WebSocket实时更新
    // this.setupRealtimeUpdates();
  },

  onHide() {
    console.log('数据看板页面隐藏');
    this.stopRealtimeUpdates();
  },

  onUnload() {
    console.log('数据看板页面卸载');
    this.stopRealtimeUpdates();
    this.stopPolling();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  },

  onPullDownRefresh() {
    this.loadDashboardData().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 云函数调用封装
  async callCloudFunction(name, data = {}) {
    try {
      console.log(`调用云函数 ${name}, 数据:`, data);
      const result = await wx.cloud.callFunction({
        name: name,
        data: data
      });
      console.log(`云函数 ${name} 返回结果:`, result);
      
      if (result.result && result.result.success) {
        return result.result;
      } else {
        throw new Error(result.result?.message || `调用云函数 ${name} 失败`);
      }
    } catch (error) {
      console.error(`调用云函数 ${name} 出错:`, error);
      throw error;
    }
  },

  // 加载仪表板数据
  async loadDashboardData() {
    try {
      console.log('开始加载仪表板数据');
      this.setData({ loading: true });

      // 生成安全概览数据
      const safetyScore = this.randomInt(80, 100);
      const totalInspections = this.randomInt(50, 200);
      const passedInspections = this.randomInt(45, totalInspections);
      const pendingInspections = this.randomInt(0, Math.max(0, totalInspections - passedInspections));
      
      const safetyOverview = {
        todayIncidents: this.randomInt(0, 5),
        recentIncidents: this.randomInt(0, 15),
        totalRisks: this.randomInt(10, 100),
        majorRisks: this.randomInt(0, 10),
        safetyScore: safetyScore,
        riskLevel: this.getRiskLevelText(this.randomInt(1, 4)),
        safetyRate: this.randomInt(85, 100),
        totalInspections: totalInspections,
        passedInspections: passedInspections,
        pendingInspections: pendingInspections,
        inspectionCompletionRate: Math.round((passedInspections / totalInspections) * 100)
      };

      // 生成风险等级数据
      const riskLevels = {
        low: this.randomInt(10, 50),
        moderate: this.randomInt(5, 30),
        critical: this.randomInt(2, 15),
        major: this.randomInt(0, 5)
      };

      // 生成隐患数据
      const totalHazards = this.randomInt(20, 80);
      const resolvedHazards = this.randomInt(15, totalHazards - 5);
      const pendingHazards = totalHazards - resolvedHazards;
      
      const hazardData = {
        totalHazards: totalHazards,
        resolvedHazards: resolvedHazards,
        pendingHazards: pendingHazards,
        closureRate: Math.round((resolvedHazards / totalHazards) * 100)
      };

      // 生成设备状态数据
      const totalDevices = this.randomInt(10, 55);
      const onlineDevices = this.randomInt(10, totalDevices);
      const offlineDevices = totalDevices - onlineDevices;

      // 处理告警数据并添加动画
      const mockAlerts = this.generateMockAlerts();
      const recentAlerts = this.processAlerts(mockAlerts);
      
      // 生成区域状态数据
      const zoneStatus = this.generateMockZones();
      
      // 初始化筛选和排序后的区域数据
      const filteredZoneStatus = this.filterAndSortZones(zoneStatus);
      
      this.setData({
        safetyOverview: safetyOverview,
        onlineDevices: onlineDevices,
        offlineDevices: offlineDevices,
        riskLevels: riskLevels,
        hazardData: hazardData,
        zoneStatus: zoneStatus,
        filteredZoneStatus: filteredZoneStatus,
        recentAlerts: recentAlerts,
        updateTime: this.formatTime(new Date()),
        loading: false
      });

      // 生成并绘制图表数据
      this.generateChartData();

    } catch (error) {
      console.error('加载数据失败:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '数据加载失败',
        icon: 'error',
        duration: 2000
      });
    }
  },

  // 生成所有图表数据
  generateChartData() {
    try {
      console.log('开始生成图表数据...');
      
      // 生成趋势图数据
      const trendData = this.generateTrendData();
      // 生成风险分布数据
      const riskDistData = this.generateRiskDistributionData(this.data.riskLevels);
      // 生成隐患状态数据
      const hazardStatusData = this.generateHazardStatusData(this.data.hazardData);
      
      this.setData({
        trendChartData: trendData,
        riskChartData: riskDistData,
        hazardChartData: hazardStatusData
      });
      
      // 绘制所有图表
      this.updateCharts();
      console.log('图表数据生成完成');
    } catch (error) {
      console.error('生成图表数据失败:', error);
    }
  },

  // 更新所有图表
  updateCharts() {
    try {
      this.updateTrendChart();
      this.updateRiskChart();
      this.updateHazardChart();
      console.log('所有图表更新完成');
    } catch (error) {
      console.error('更新图表失败:', error);
    }
  },

  // 生成趋势图数据
  generateTrendData() {
    const labels = [];
    const incidentsData = [];
    const hazardsData = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      labels.push(`${date.getMonth() + 1}/${date.getDate()}`);
      incidentsData.push(this.randomInt(0, 5));
      hazardsData.push(this.randomInt(2, 10));
    }
    
    return {
      labels: labels,
      datasets: [
        { color: '#F56C6C', data: incidentsData },
        { color: '#E6A23C', data: hazardsData }
      ]
    };
  },

  // 生成风险分布数据
  generateRiskDistributionData(riskLevels) {
    return {
      labels: ['低风险', '一般风险', '较大风险', '重大风险'],
      datasets: [
        {
          data: [riskLevels.low, riskLevels.moderate, riskLevels.critical, riskLevels.major],
          colors: ['#909399', '#E6A23C', '#F56C6C', '#9013FE']
        }
      ]
    };
  },

  // 生成隐患状态数据
  generateHazardStatusData(hazardData) {
    return {
      labels: ['待处理', '处理中', '已解决'],
      datasets: [
        {
          data: [hazardData.pendingHazards, this.randomInt(5, 15), hazardData.resolvedHazards],
          colors: ['#F56C6C', '#E6A23C', '#67C23A']
        }
      ]
    };
  },

  // 生成模拟区域数据
  generateMockZones() {
    const zones = ['车间A', '车间B', '仓库区域', '设备维护区', '办公区', '物资存储区'];
    const statusOptions = ['危险', '警告', '安全'];
    
    return zones.map((zone, index) => {
      const status = statusOptions[this.randomInt(0, 2)];
      // 根据状态生成合理的安全系数
      let safetyScore;
      if (status === '危险') {
        safetyScore = this.randomInt(0, 60);
      } else if (status === '警告') {
        safetyScore = this.randomInt(61, 80);
      } else {
        safetyScore = this.randomInt(81, 100);
      }
      
      return {
        id: index + 1,
        name: zone,
        status: status,
        incidents: this.randomInt(0, 3),
        hazards: this.randomInt(0, 10),
        devices: this.randomInt(5, 50),
        safetyScore: safetyScore,
        lastInspection: this.formatTime(new Date(Date.now() - this.randomInt(0, 7 * 24 * 60 * 60 * 1000)))
      };
    });
  },

  // 生成模拟告警数据
  generateMockAlerts() {
    const alertTitles = [
      '设备温度异常',
      '安全检查逾期',
      '人员未按规定操作',
      '消防设备状态异常',
      '区域风险等级上升',
      '巡检记录缺失'
    ];
    
    const alerts = [];
    const alertCount = this.randomInt(0, 5);
    const types = ['danger', 'warning', 'info'];
    
    for (let i = 0; i < alertCount; i++) {
      alerts.push({
        id: i + 1,
        title: alertTitles[this.randomInt(0, alertTitles.length - 1)],
        description: '请立即处理该安全隐患',
        type: types[this.randomInt(0, types.length - 1)],
        time: this.formatTime(new Date(Date.now() - this.randomInt(0, 24 * 60 * 60 * 1000)))
      });
    }
    
    return alerts;
  },

  // 处理告警数据并添加动画
  processAlerts(alerts) {
    return alerts.map((alert, index) => {
      const animation = wx.createAnimation({
        duration: 300,
        timingFunction: 'ease-out',
        delay: index * 100
      });
      
      animation.translateX(0).opacity(1).step();
      
      return {
        ...alert,
        animation: animation.export()
      };
    });
  },

  // 更新趋势图
  updateTrendChart() {
    try {
      if (this.data.trendChartData && this.data.trendChartData.labels && this.data.trendChartData.datasets) {
        const query = wx.createSelectorQuery().in(this);
        query.select('#trendChart')
          .boundingClientRect((rect) => {
            if (rect) {
              chartUtils.drawLineChart({
                canvasId: 'trendChart',
                data: this.data.trendChartData,
                width: rect.width,
                height: rect.height
              });
              console.log('趋势图绘制完成');
            }
          })
          .exec();
      }
    } catch (error) {
      console.error('更新趋势图失败:', error);
    }
  },

  // 更新风险图
  updateRiskChart() {
    try {
      if (this.data.riskChartData && this.data.riskChartData.labels && this.data.riskChartData.datasets) {
        const query = wx.createSelectorQuery().in(this);
        query.select('#riskChart')
          .boundingClientRect((rect) => {
            if (rect) {
              chartUtils.drawPieChart({
                canvasId: 'riskChart',
                data: this.data.riskChartData,
                width: rect.width,
                height: rect.height
              });
              console.log('风险分布图绘制完成');
            }
          })
          .exec();
      }
    } catch (error) {
      console.error('更新风险图失败:', error);
    }
  },

  // 更新隐患图
  updateHazardChart() {
    try {
      if (this.data.hazardChartData && this.data.hazardChartData.labels && this.data.hazardChartData.datasets) {
        const query = wx.createSelectorQuery().in(this);
        query.select('#hazardChart')
          .boundingClientRect((rect) => {
            if (rect) {
              chartUtils.drawBarChart({
                canvasId: 'hazardChart',
                data: this.data.hazardChartData,
                width: rect.width,
                height: rect.height
              });
              console.log('隐患处理进度图绘制完成');
            }
          })
          .exec();
      }
    } catch (error) {
      console.error('更新隐患图失败:', error);
    }
  },

  // 设置实时更新（使用微信云开发实时数据库）
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
      'recentAlerts': docs.map(item => ({
        id: item._id,
        type: '风险预警',
        level: item.warningLevel,
        message: item.warningContent,
        time: this.formatDate(new Date(item.createdAt))
      }))
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
    const pendingCount = docs.filter(item => item.status === '待整改').length;

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
  },
    }
  },

  // 发送WebSocket消息
  sendWebSocketMessage(message) {
    if (this.socketTask && this.data.wsConnected) {
      this.socketTask.send({
        data: JSON.stringify(message),
        success: () => {
          console.log('WebSocket消息发送成功:', message);
        },
        fail: (error) => {
          console.error('WebSocket消息发送失败:', error);
        }
      });
    } else {
      console.warn('WebSocket未连接，无法发送消息');
    }
  },

  // 处理WebSocket消息
  handleWebSocketMessage(data) {
    if (!data || !data.type) {
      console.error('无效的WebSocket消息:', data);
      return;
    }

    switch (data.type) {
      case 'dashboard_update':
        // 处理仪表盘数据更新
        this.updateDashboardData(data.payload);
        break;
      case 'alert':
        // 处理告警消息
        this.handleAlertMessage(data.payload);
        break;
      case 'status':
        // 处理状态消息
        console.log('WebSocket状态消息:', data.payload);
        break;
      default:
        console.log('未知的WebSocket消息类型:', data.type);
        break;
    }
  },

  // 重新连接WebSocket
  reconnectWebSocket() {
    // 避免频繁重连
    if (!this.reconnectTimer) {
      this.reconnectTimer = setTimeout(() => {
        console.log('尝试重新连接WebSocket');
        this.connectWebSocket();
        this.reconnectTimer = null;
      }, 5000); // 5秒后尝试重新连接
    }
  },

  // 回退到轮询（当WebSocket不可用时）
  fallbackToPolling() {
    console.log('回退到轮询更新');
    if (!this.pollingTimer) {
      this.pollingTimer = setInterval(() => {
        this.updateRealtimeData();
      }, 30000); // 30秒轮询一次
    }
  },

  // 停止轮询
  stopPolling() {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
      console.log('停止轮询更新');
    }
  },

  // 实时数据更新函数（轮询回退时使用）
  updateRealtimeData() {
    try {
      console.log('开始实时数据更新');
      
      // 从当前数据中获取基础值
      const currentSafetyOverview = this.data.safetyOverview;
      const currentRiskLevels = this.data.riskLevels;
      const currentHazardData = this.data.hazardData;
      
      // 更新安全概览（保持数据一致性）
      const todayIncidents = this.randomInt(0, 5);
      const riskLevel = this.getRiskLevelText(this.randomInt(1, 4));
      const safetyRate = this.randomInt(85, 100);
      
      // 更新设备状态（保持数据一致性）
      const totalDevices = this.data.onlineDevices + this.data.offlineDevices;
      const onlineDevices = this.randomInt(Math.max(10, totalDevices - 10), totalDevices);
      const offlineDevices = totalDevices - onlineDevices;
      
      // 更新风险等级（保持数据结构一致）
      const riskLevels = {
        low: this.randomInt(10, 50),
        moderate: this.randomInt(5, 30),
        critical: this.randomInt(2, 15),
        major: this.randomInt(0, 5)
      };
      
      // 更新隐患数据（保持数据一致性）
      const totalHazards = currentHazardData.totalHazards;
      const resolvedHazards = this.randomInt(15, totalHazards - 5);
      const pendingHazards = totalHazards - resolvedHazards;
      const closureRate = Math.round((resolvedHazards / totalHazards) * 100);
      
      const hazardData = {
        totalHazards: totalHazards,
        resolvedHazards: resolvedHazards,
        pendingHazards: pendingHazards,
        closureRate: closureRate
      };
      
      // 更新区域状态
      const zoneStatus = this.generateMockZones();
      
      // 更新最近告警
      const mockAlerts = this.generateMockAlerts();
      const recentAlerts = this.processAlerts(mockAlerts);
      
      // 筛选和排序后的区域数据
      const filteredZoneStatus = this.filterAndSortZones(zoneStatus);
      
      // 只更新变化较快的数据
      const updatedData = {
        // 更新安全概览（只更新关键指标）
        'safetyOverview.todayIncidents': todayIncidents,
        'safetyOverview.riskLevel': riskLevel,
        'safetyOverview.safetyRate': safetyRate,
        
        // 更新设备状态
        onlineDevices: onlineDevices,
        offlineDevices: offlineDevices,
        
        // 更新风险等级
        riskLevels: riskLevels,
        
        // 更新隐患数据
        hazardData: hazardData,
        
        // 更新区域状态
        zoneStatus: zoneStatus,
        filteredZoneStatus: filteredZoneStatus,
        
        // 更新最近告警
        recentAlerts: recentAlerts,
        
        // 更新时间
        updateTime: this.formatTime(new Date())
      };
      
      // 应用更新
      this.setData(updatedData);
      
      // 更新受影响的图表数据
      const updatedChartData = {
        // 更新趋势图数据
        trendChartData: this.generateTrendData(),
        
        // 更新风险分布数据
        riskChartData: this.generateRiskDistributionData(riskLevels),
        
        // 更新隐患状态数据
        hazardChartData: this.generateHazardStatusData(hazardData)
      };
      
      // 应用图表数据更新
      this.setData(updatedChartData);
      
      // 只更新变化的图表
      this.updateCharts();
      
      console.log('实时数据更新完成');
    } catch (error) {
      console.error('实时数据更新失败:', error);
      // 添加用户可见的错误提示
      wx.showToast({
        title: '数据更新失败',
        icon: 'error',
        duration: 1500
      });
    }
  },
  
  // 辅助函数
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  },

  // 获取风险等级文本
  getRiskLevelText(level) {
    switch(level) {
      case 1: return '低风险';
      case 2: return '一般风险';
      case 3: return '较大风险';
      case 4: return '重大风险';
      default: return '低风险';
    }
  },

  randomFloat(min, max, decimalPlaces = 2) {
    const random = Math.random() * (max - min) + min;
    return Number(random.toFixed(decimalPlaces));
  },

  formatTime(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    const second = date.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  },

  // 快速操作处理
  onQuickActionTap(event) {
    try {
      const actionType = event.currentTarget.dataset.type;
      if (!actionType) {
        throw new Error('未获取到操作类型');
      }
      console.log('快速操作:', actionType);
      wx.showToast({ 
        title: actionType + ' 功能', 
        icon: 'success',
        fail: (error) => {
          console.error('显示操作提示失败:', error);
        }
      });
    } catch (error) {
      console.error('快速操作处理失败:', error);
      wx.showToast({ 
        title: '操作处理失败', 
        icon: 'error' 
      });
    }
  },

  // 更新仪表盘数据（处理WebSocket消息）
  updateDashboardData(data) {
    try {
      if (!data) {
        console.error('更新数据为空');
        return;
      }
      
      console.log('开始更新仪表盘数据:', data);
      const updatedData = {};
      
      // 更新安全概览
      if (data.safetyOverview) {
        Object.keys(data.safetyOverview).forEach(key => {
          updatedData[`safetyOverview.${key}`] = data.safetyOverview[key];
        });
      }
      
      // 更新设备状态
      if (data.onlineDevices !== undefined) {
        updatedData.onlineDevices = data.onlineDevices;
      }
      if (data.offlineDevices !== undefined) {
        updatedData.offlineDevices = data.offlineDevices;
      }
      
      // 更新风险等级
      if (data.riskLevels) {
        updatedData.riskLevels = data.riskLevels;
      }
      
      // 更新隐患数据
      if (data.hazardData) {
        updatedData.hazardData = data.hazardData;
      }
      
      // 更新区域状态
      if (data.zoneStatus) {
        updatedData.zoneStatus = data.zoneStatus;
      }
      
      // 更新最近告警
      if (data.recentAlerts) {
        updatedData.recentAlerts = this.processAlerts(data.recentAlerts);
      }
      
      // 更新时间
      updatedData.updateTime = this.formatTime(new Date());
      
      // 应用更新
      if (Object.keys(updatedData).length > 0) {
        this.setData(updatedData);
      }
      
      // 更新图表数据
      const updatedChartData = {};
      
      if (data.trendChartData) {
        updatedChartData.trendChartData = data.trendChartData;
      } else {
        updatedChartData.trendChartData = this.generateTrendData();
      }
      
      if (data.riskChartData) {
        updatedChartData.riskChartData = data.riskChartData;
      } else if (data.riskLevels) {
        updatedChartData.riskChartData = this.generateRiskDistributionData(data.riskLevels);
      }
      
      if (data.hazardChartData) {
        updatedChartData.hazardChartData = data.hazardChartData;
      } else if (data.hazardData) {
        updatedChartData.hazardChartData = this.generateHazardStatusData(data.hazardData);
      }
      
      // 应用图表数据更新
      this.setData(updatedChartData);
      
      // 更新图表
      this.updateCharts();
      
      console.log('仪表盘数据更新完成');
    } catch (error) {
      console.error('更新仪表盘数据失败:', error);
    }
  },

  // 处理告警消息
  handleAlertMessage(data) {
    try {
      if (!data) {
        console.error('告警数据为空');
        return;
      }
      
      console.log('收到告警消息:', data);
      
      // 显示告警提示
      wx.showToast({
        title: data.title || '新告警',
        icon: 'none',
        duration: 3000,
        image: '/images/alert-icon.png'
      });
      
      // 更新告警列表
      const newAlert = { ...data, time: this.formatTime(new Date()) };
      let updatedAlerts = [newAlert, ...this.data.recentAlerts];
      // 保持告警列表不超过5条
      updatedAlerts = updatedAlerts.slice(0, 5);
      
      // 为新告警添加动画
      updatedAlerts = this.processAlerts(updatedAlerts);
      
      this.setData({ recentAlerts: updatedAlerts });
    } catch (error) {
      console.error('处理告警消息失败:', error);
    }
  },

  // 筛选和排序区域数据
  filterAndSortZones(zones) {
    let filtered = [...zones];
    
    // 筛选
    const filterValue = this.data.zoneFilterOptions[this.data.zoneFilterIndex].value;
    if (filterValue !== 'all') {
      filtered = filtered.filter(zone => zone.status === filterValue);
    }
    
    // 排序
    const sortValue = this.data.zoneSortOptions[this.data.zoneSortIndex].value;
    if (sortValue === 'default') {
      // 默认排序（按ID）
      filtered.sort((a, b) => a.id - b.id);
    } else if (sortValue === 'safetyScore') {
      // 按安全系数降序
      filtered.sort((a, b) => b.safetyScore - a.safetyScore);
    } else if (sortValue === 'incidents') {
      // 按事故数量降序
      filtered.sort((a, b) => b.incidents - a.incidents);
    } else if (sortValue === 'hazards') {
      // 按隐患数量降序
      filtered.sort((a, b) => b.hazards - a.hazards);
    }
    
    return filtered;
  },

  // 区域排序变更事件
  onZoneSortChange(e) {
    try {
      const index = e.detail.value;
      this.setData({
        zoneSortIndex: index
      });
      
      // 更新筛选和排序后的区域数据
      const filteredZoneStatus = this.filterAndSortZones(this.data.zoneStatus);
      this.setData({ filteredZoneStatus });
    } catch (error) {
      console.error('区域排序变更失败:', error);
    }
  },

  // 区域筛选变更事件
  onZoneFilterChange(e) {
    try {
      const index = e.detail.value;
      this.setData({
        zoneFilterIndex: index
      });
      
      // 更新筛选和排序后的区域数据
      const filteredZoneStatus = this.filterAndSortZones(this.data.zoneStatus);
      this.setData({ filteredZoneStatus });
    } catch (error) {
      console.error('区域筛选变更失败:', error);
    }
  },

  // 区域点击事件
  onZoneTap(e) {
    try {
      const zoneId = e.currentTarget.dataset.zoneId;
      const zoneName = e.currentTarget.dataset.zoneName;
      console.log('点击区域:', zoneName, 'ID:', zoneId);
      
      // 跳转到区域详情页
      wx.navigateTo({
        url: `/pages/zone-detail/zone-detail?id=${zoneId}&name=${encodeURIComponent(zoneName)}`,
        fail: (error) => {
          console.error('跳转到区域详情页失败:', error);
          wx.showToast({
            title: '查看详情失败',
            icon: 'error'
          });
        }
      });
    } catch (error) {
      console.error('区域点击事件处理失败:', error);
      wx.showToast({
        title: '操作失败',
        icon: 'error'
      });
    }
  },

  // 区域操作按钮点击事件
  onZoneActionTap(e) {
    try {
      const action = e.currentTarget.dataset.action;
      const zoneId = e.currentTarget.dataset.zoneId;
      const zoneName = e.currentTarget.dataset.zoneName;
      
      console.log('区域操作:', action, '区域:', zoneName, 'ID:', zoneId);
      
      switch (action) {
        case 'inspect':
          // 跳转到区域检查页面
          wx.navigateTo({
            url: `/pages/inspection/inspection?zoneId=${zoneId}&zoneName=${encodeURIComponent(zoneName)}`,
            fail: (error) => {
              console.error('跳转到区域检查页面失败:', error);
              wx.showToast({
                title: '检查功能失败',
                icon: 'error'
              });
            }
          });
          break;
        case 'alerts':
          // 跳转到区域告警页面
          wx.navigateTo({
            url: `/pages/zone-alerts/zone-alerts?zoneId=${zoneId}&zoneName=${encodeURIComponent(zoneName)}`,
            fail: (error) => {
              console.error('跳转到区域告警页面失败:', error);
              wx.showToast({
                title: '告警功能失败',
                icon: 'error'
              });
            }
          });
          break;
        case 'devices':
          // 跳转到区域设备页面
          wx.navigateTo({
            url: `/pages/zone-devices/zone-devices?zoneId=${zoneId}&zoneName=${encodeURIComponent(zoneName)}`,
            fail: (error) => {
              console.error('跳转到区域设备页面失败:', error);
              wx.showToast({
                title: '设备功能失败',
                icon: 'error'
              });
            }
          });
          break;
        default:
          console.warn('未知的区域操作:', action);
          break;
      }
    } catch (error) {
      console.error('区域操作处理失败:', error);
      wx.showToast({
        title: '操作失败',
        icon: 'error'
      });
    }
  },

  // 页面跳转
  goToRiskAssessment() { 
    try {
      wx.navigateTo({ 
        url: '/pages/risk/risk',
        fail: (error) => {
          console.error('跳转到风险评估页面失败:', error);
          wx.showToast({ 
            title: '页面跳转失败', 
            icon: 'error' 
          });
        }
      }); 
    } catch (error) {
      console.error('跳转到风险评估页面失败:', error);
      wx.showToast({ 
        title: '页面跳转失败', 
        icon: 'error' 
      });
    }
  },
  
  goToHazardInspection() { 
    try {
      wx.navigateTo({ 
        url: '/pages/hazard/hazard',
        fail: (error) => {
          console.error('跳转到隐患排查页面失败:', error);
          wx.showToast({ 
            title: '页面跳转失败', 
            icon: 'error' 
          });
        }
      }); 
    } catch (error) {
      console.error('跳转到隐患排查页面失败:', error);
      wx.showToast({ 
        title: '页面跳转失败', 
        icon: 'error' 
      });
    }
  },
  
  goToSafetyCheck() { 
    try {
      wx.navigateTo({ 
        url: '/pages/inspection/inspection',
        fail: (error) => {
          console.error('跳转到安全检查页面失败:', error);
          wx.showToast({ 
            title: '页面跳转失败', 
            icon: 'error' 
          });
        }
      }); 
    } catch (error) {
      console.error('跳转到安全检查页面失败:', error);
      wx.showToast({ 
        title: '页面跳转失败', 
        icon: 'error' 
      });
    }
  },
  
  goToDeviceManagement() { 
    try {
      wx.showToast({ 
        title: '设备管理功能', 
        icon: 'success' 
      });
    } catch (error) {
      console.error('显示设备管理功能提示失败:', error);
    }
  },

  // 分享功能
  onShareAppMessage() {
    try {
      return {
        title: '邹平货运铁路安全监控',
        path: '/pages/dashboard/dashboard'
      };
    } catch (error) {
      console.error('获取分享信息失败:', error);
      return {
        title: '邹平货运铁路安全监控',
        path: '/pages/dashboard/dashboard'
      };
    }
  }
});