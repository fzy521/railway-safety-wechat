# 微信云开发实时数据库使用指南

## 📖 概述

本项目使用微信云开发实时数据库功能替代 WebSocket，实现数据的实时更新和推送。

## ✅ 优势

1. **无需额外服务器** - 使用微信云开发自带功能
2. **自动连接管理** - 自动处理连接断开和重连
3. **多端同步** - 支持小程序、Web后台等多端实时同步
4. **简单易用** - API 简单，易于集成

## 🔧 配置要求

### 1. 开启实时数据库功能

在微信云开发控制台中：
1. 进入"数据库"页面
2. 点击"设置"
3. 开启"实时数据库"功能

### 2. 数据库权限配置

确保相关集合的权限配置正确：
```json
{
  "read": true,
  "write": true
}
```

## 📝 使用方法

### 基本用法

```javascript
const db = wx.cloud.database();
const _ = db.command;

// 监听数据变化
db.collection('collection_name')
  .where({ status: 'active' })
  .watch({
    onChange: (snapshot) => {
      console.log('数据变化:', snapshot);
      // 处理数据更新
    },
    onError: (err) => {
      console.error('监听失败:', err);
    }
  });
```

### 监听器生命周期管理

```javascript
Page({
  onLoad() {
    // 页面加载时启动监听
    this.setupRealtimeWatchers();
  },

  onUnload() {
    // 页面卸载时关闭监听
    this.closeRealtimeWatchers();
  },

  setupRealtimeWatchers() {
    this.watcher = db.collection('collection_name').watch({
      onChange: (snapshot) => {
        // 处理数据变化
      },
      onError: (err) => {
        console.error(err);
      }
    });
  },

  closeRealtimeWatchers() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  }
});
```

## 🎯 本项目应用场景

### 1. 风险预警实时推送

监听 `risk_warnings` 集合，实时推送风险预警：

```javascript
this.riskWarningWatcher = db.collection('risk_warnings')
  .where({
    status: _.in(['待处理', '处理中'])
  })
  .watch({
    onChange: (snapshot) => {
      const docs = snapshot.docs || [];
      const pendingCount = docs.filter(item => item.status === '待处理').length;

      // 更新界面
      this.setData({ riskWarnings: docs });

      // 显示通知
      if (snapshot.type !== 'init') {
        wx.showToast({
          title: `有${pendingCount}条风险预警待处理`,
          icon: 'none'
        });
      }
    },
    onError: (err) => {
      console.error('监听风险预警数据失败:', err);
    }
  });
```

### 2. 隐患数据实时同步

监听 `hidden_danger_library` 集合，实时更新隐患数据：

```javascript
this.hazardWatcher = db.collection('hidden_danger_library')
  .where({
    status: _.in(['待整改', '整改中', '待验证'])
  })
  .watch({
    onChange: (snapshot) => {
      // 更新隐患列表
      this.setData({ hazards: snapshot.docs });

      // 刷新统计数据
      this.loadDashboardData();
    },
    onError: (err) => {
      console.error('监听隐患数据失败:', err);
    }
  });
```

### 3. 事故信息实时更新

监听 `incidents` 集合，实时更新事故信息：

```javascript
this.incidentWatcher = db.collection('incidents')
  .where({
    status: _.in(['处理中', '待处理'])
  })
  .watch({
    onChange: (snapshot) => {
      // 更新事故列表
      this.setData({ incidents: snapshot.docs });

      // 刷新统计数据
      this.loadDashboardData();
    },
    onError: (err) => {
      console.error('监听事故数据失败:', err);
    }
  });
```

## 📊 Snapshot 对象说明

`onChange` 回调中的 `snapshot` 对象包含以下属性：

```javascript
{
  type: 'init',        // 事件类型: 'init' | 'update' | 'add' | 'remove'
  docs: [],            // 当前查询结果文档数组
  docChanges: [        // 变化的文档
    {
      id: 'xxx',       // 文档ID
      dataType: 'update', // 数据类型
      doc: {}          // 文档内容
    }
  ]
}
```

### 事件类型

- `init` - 初始化，首次加载数据
- `update` - 文档更新
- `add` - 新增文档
- `remove` - 删除文档

## ⚠️ 注意事项

### 1. 监听器数量限制

- 每个小程序最多同时监听 10 个集合
- 建议在页面卸载时关闭监听器

### 2. 性能优化

- 合理设置查询条件，减少监听数据量
- 避免监听大量数据集合
- 及时关闭不需要的监听器

### 3. 错误处理

```javascript
watch({
  onChange: (snapshot) => {
    // 处理数据变化
  },
  onError: (err) => {
    console.error('监听失败:', err);
    // 错误处理，如重试或降级方案
    if (err.errCode === -1) {
      // 网络错误，尝试重连
      this.setupRealtimeWatchers();
    }
  }
});
```

### 4. 权限问题

确保当前用户有权限访问被监听的集合，否则会报错。

## 🔍 调试技巧

### 1. 查看监听状态

```javascript
console.log('监听器状态:', this.watcher);
```

### 2. 测试数据变化

在云开发控制台手动修改数据，观察小程序是否收到更新。

### 3. 使用日志

```javascript
watch({
  onChange: (snapshot) => {
    console.log('数据变化:', JSON.stringify(snapshot));
  }
});
```

## 📚 参考文档

- [微信云开发实时数据库文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/database/realtime.html)
- [数据库监听器 API](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/reference-sdk-api/database/Database.watch.html)

## 🎉 总结

使用微信云开发实时数据库可以轻松实现数据实时更新功能，无需额外的 WebSocket 服务器，大大简化了开发工作。

本项目已在 dashboard.js 中集成了实时数据监听功能，可以实时接收风险预警、隐患和事故数据的更新。