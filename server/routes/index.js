const express = require('express');
const path = require('path');

/**
 * 路由索引文件
 * 负责加载和配置所有API路由
 */
function createRoutes(apiService) {
    const router = express.Router();
    
    // 导入认证中间件
    const AuthMiddleware = require('../middleware/auth');
    const authMiddleware = new AuthMiddleware(apiService);
    
    // 加载路由模块
    const createAuthRoutes = require('./auth');
    const createSafetyRoutes = require('./safety');
    
    // 注册路由
    router.use('/auth', createAuthRoutes(apiService, authMiddleware));
    router.use('/safety', createSafetyRoutes(apiService, authMiddleware));
    
    // 简化的其他路由（返回基本响应）
    router.use('/users', (req, res) => {
        res.json({ success: true, message: '用户管理路由待实现' });
    });
    
    router.use('/risks', (req, res) => {
        res.json({ success: true, message: '风险评估路由待实现' });
    });
    
    router.use('/incidents', (req, res) => {
        res.json({ success: true, message: '事故报告路由待实现' });
    });
    
    router.use('/training', (req, res) => {
        res.json({ success: true, message: '培训管理路由待实现' });
    });
    
    router.use('/certificates', (req, res) => {
        res.json({ success: true, message: '证书管理路由待实现' });
    });
    
    router.use('/inspection', (req, res) => {
        res.json({ success: true, message: '巡检管理路由待实现' });
    });
    
    router.use('/system', (req, res) => {
        res.json({ success: true, message: '系统管理路由待实现' });
    });
    
    return router;
}

module.exports = createRoutes;