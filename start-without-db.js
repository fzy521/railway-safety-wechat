const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;

// 基础中间件
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 模拟数据服务
const mockData = {
  users: [
    { id: 1, username: 'admin', password: 'admin123', role: '超级管理员' },
    { id: 2, username: 'safety', password: 'safety123', role: '安全管理员' },
    { id: 3, username: 'train', password: 'train123', role: '培训管理员' },
    { id: 4, username: 'user1', password: 'user123', role: '普通用户' }
  ],
  safetyStats: {
    totalChecks: 156,
    completedChecks: 142,
    pendingChecks: 14,
    passRate: 91
  },
  incidents: [
    { id: 1, type: '设备故障', location: 'K15+200', time: '2024-01-15 09:30', severity: '一般', status: '已处理' },
    { id: 2, type: '信号异常', location: 'K23+500', time: '2024-01-16 14:20', severity: '轻微', status: '处理中' }
  ],
  risks: [
    { id: 1, name: '轨道磨损', level: '高', probability: 4, impact: 5, status: '监控中' },
    { id: 2, name: '信号老化', level: '中', probability: 3, impact: 4, status: '处理中' }
  ]
};

// 模拟API路由
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = mockData.users.find(u => u.username === username && u.password === password);
  if (user) {
    res.json({
      success: true,
      token: 'mock-jwt-token-' + user.id,
      user: { id: user.id, username: user.username, role: user.role }
    });
  } else {
    res.status(401).json({ success: false, message: '用户名或密码错误' });
  }
});

app.get('/api/safety/stats', (req, res) => {
  res.json(mockData.safetyStats);
});

app.get('/api/incidents', (req, res) => {
  res.json(mockData.incidents);
});

app.get('/api/risks', (req, res) => {
  res.json(mockData.risks);
});

app.get('/api/users', (req, res) => {
  res.json(mockData.users);
});

// 静态文件服务
app.use(express.static(path.join(__dirname)));

// 处理所有其他路由，返回index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 铁路安全监控系统启动成功！`);
  console.log(`📊 访问地址: http://localhost:${PORT}`);
  console.log(`💡 使用模拟数据模式，无需数据库`);
});

module.exports = app;