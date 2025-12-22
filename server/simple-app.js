const express = require('express');
const cors = require('cors');
const path = require('path');
const SimpleApiService = require('./services/simple-api-service');

/**
 * 简化的Express应用
 * 使用内存存储，用于演示系统功能
 */
class SimpleApp {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.host = process.env.HOST || 'localhost';
        this.apiService = new SimpleApiService();
        
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }

    /**
     * 设置中间件
     */
    setupMiddleware() {
        // CORS配置
        this.app.use(cors({
            origin: true,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization']
        }));

        // 请求体解析
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // 请求日志
        this.app.use((req, res, next) => {
            console.log(`${req.method} ${req.path}`, {
                ip: req.ip,
                timestamp: new Date().toISOString()
            });
            next();
        });
    }

    /**
     * 设置路由
     */
    setupRoutes() {
        // 健康检查
        this.app.get('/health', (req, res) => {
            const healthCheck = this.apiService.healthCheck();
            res.json(healthCheck);
        });

        // 认证路由
        this.app.post('/api/auth/login', async (req, res) => {
            try {
                const { username, password } = req.body;
                const loginInfo = {
                    ipAddress: req.ip,
                    userAgent: req.get('User-Agent')
                };
                
                const result = await this.apiService.login(username, password, loginInfo);
                res.json(result);
            } catch (error) {
                res.status(500).json({ success: false, message: '登录失败' });
            }
        });

        this.app.post('/api/auth/logout', (req, res) => {
            const result = this.apiService.logout();
            res.json(result);
        });

        this.app.get('/api/auth/me', (req, res) => {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ success: false, message: '缺少认证令牌' });
            }

            const token = authHeader.substring(7);
            const tokenValidation = this.apiService.verifyToken(token);
            
            if (tokenValidation.success) {
                res.json({ success: true, data: tokenValidation.user });
            } else {
                res.status(401).json({ success: false, message: tokenValidation.message });
            }
        });

        // 安全监控路由
        this.app.get('/api/safety/data', (req, res) => {
            const result = this.apiService.getSafetyData();
            res.json(result);
        });

        // 风险评估路由
        this.app.get('/api/risks', (req, res) => {
            const result = this.apiService.getRisks(req.query);
            res.json(result);
        });

        this.app.post('/api/risks', async (req, res) => {
            try {
                const result = await this.apiService.createRisk(req.body, 1); // 假设用户ID为1
                res.json(result);
            } catch (error) {
                res.status(500).json({ success: false, message: '创建风险评估失败' });
            }
        });

        // 事故报告路由
        this.app.get('/api/incidents', (req, res) => {
            const result = this.apiService.getIncidents(req.query);
            res.json(result);
        });

        this.app.post('/api/incidents', async (req, res) => {
            try {
                const result = await this.apiService.createIncident(req.body, 1); // 假设用户ID为1
                res.json(result);
            } catch (error) {
                res.status(500).json({ success: false, message: '创建事故报告失败' });
            }
        });

        // 培训管理路由
        this.app.get('/api/training', (req, res) => {
            const result = this.apiService.getTrainings(req.query);
            res.json(result);
        });

        this.app.post('/api/training', async (req, res) => {
            try {
                const result = await this.apiService.createTraining(req.body, 1); // 假设用户ID为1
                res.json(result);
            } catch (error) {
                res.status(500).json({ success: false, message: '创建培训记录失败' });
            }
        });

        // 证书管理路由
        this.app.get('/api/certificates', (req, res) => {
            const result = this.apiService.getCertificates(req.query);
            res.json(result);
        });

        this.app.post('/api/certificates', async (req, res) => {
            try {
                const result = await this.apiService.createCertificate(req.body, 1); // 假设用户ID为1
                res.json(result);
            } catch (error) {
                res.status(500).json({ success: false, message: '创建证书记录失败' });
            }
        });

        // 巡检管理路由
        this.app.get('/api/inspection/points', (req, res) => {
            const result = this.apiService.getInspectionPoints(req.query);
            res.json(result);
        });

        this.app.post('/api/inspection/points', async (req, res) => {
            try {
                const result = await this.apiService.createInspectionPoint(req.body, 1); // 假设用户ID为1
                res.json(result);
            } catch (error) {
                res.status(500).json({ success: false, message: '创建巡检点失败' });
            }
        });

        this.app.get('/api/inspection/records', (req, res) => {
            const result = this.apiService.getInspectionRecords(req.query);
            res.json(result);
        });

        this.app.post('/api/inspection/records', async (req, res) => {
            try {
                const result = await this.apiService.createInspectionRecord(req.body, 1); // 假设用户ID为1
                res.json(result);
            } catch (error) {
                res.status(500).json({ success: false, message: '创建巡检记录失败' });
            }
        });

        this.app.post('/api/inspection/points/:id/qr', async (req, res) => {
            try {
                const pointId = parseInt(req.params.id);
                const result = this.apiService.generateQRCode(pointId, 1);
                res.json(result);
            } catch (error) {
                res.status(500).json({ success: false, message: '生成二维码失败' });
            }
        });

        this.app.post('/api/inspection/verify-qr', (req, res) => {
            try {
                const { token } = req.body;
                const result = this.apiService.verifyQRCode(token);
                res.json(result);
            } catch (error) {
                res.status(500).json({ success: false, message: '验证二维码失败' });
            }
        });

        // 系统管理路由
        this.app.get('/api/system/stats', (req, res) => {
            const result = this.apiService.getSystemStats();
            res.json(result);
        });

        // 静态文件服务
        this.app.use(express.static(path.join(__dirname, '../')));
        
        // SPA路由支持
        this.app.get('*', (req, res) => {
            if (req.path.startsWith('/api')) {
                res.status(404).json({
                    success: false,
                    message: 'API接口不存在'
                });
            } else {
                res.sendFile(path.join(__dirname, '../index.html'));
            }
        });
    }

    /**
     * 设置错误处理
     */
    setupErrorHandling() {
        // 404处理
        this.app.use((req, res) => {
            res.status(404).json({
                success: false,
                message: '请求的资源不存在'
            });
        });

        // 全局错误处理
        this.app.use((err, req, res, next) => {
            console.error('服务器错误:', err);
            res.status(500).json({
                success: false,
                message: '服务器内部错误'
            });
        });
    }

    /**
     * 启动服务器
     */
    start() {
        this.app.listen(this.port, this.host, () => {
            console.log(`🚀 梁邹铁路安全监控系统API服务器启动成功`);
            console.log(`📍 服务地址: http://${this.host}:${this.port}`);
            console.log(`🌍 环境: 演示模式 (内存存储)`);
            
            this.printStartupInfo();
        });

        // 优雅关闭处理
        this.setupGracefulShutdown();
    }

    /**
     * 打印启动信息
     */
    printStartupInfo() {
        console.log('\n🎉 梁邹铁路专用线运营安全监控系统已启动!');
        console.log('═════════════════════════════════════════════════════');
        console.log(`📍 Web服务地址: http://${this.host}:${this.port}`);
        console.log(`📍 API服务地址: http://${this.host}:${this.port}/api`);
        console.log(`📍 健康检查: http://${this.host}:${this.port}/health`);
        console.log('═════════════════════════════════════════════════════');
        
        console.log('\n⚠️  当前使用演示模式:');
        console.log('   - 数据存储在内存中');
        console.log('   - 服务器重启后数据会丢失');
        console.log('   - 仅用于功能演示');
        
        console.log('\n👤 默认登录账户:');
        console.log('   超级管理员: admin / admin123');
        console.log('   安全管理员: safety / safety123');
        console.log('   培训管理员: training / training123');
        console.log('   巡检员: inspector / inspector123');
        console.log('   普通用户: user / user123');
        
        console.log('\n📋 可用的API接口:');
        console.log('   POST /api/auth/login - 用户登录');
        console.log('   GET  /api/safety/data - 安全监控数据');
        console.log('   GET  /api/risks - 风险评估列表');
        console.log('   GET  /api/incidents - 事故报告列表');
        console.log('   GET  /api/training - 培训记录列表');
        console.log('   GET  /api/certificates - 证书列表');
        console.log('   GET  /api/inspection/points - 巡检点列表');
        console.log('   GET  /api/system/stats - 系统统计');
        
        console.log('\n💡 提示: 这是演示版本，完整版本需要SQLite数据库支持');
        console.log('═════════════════════════════════════════════════════\n');
    }

    /**
     * 设置优雅关闭
     */
    setupGracefulShutdown() {
        const gracefulShutdown = (signal) => {
            console.log(`\n收到${signal}信号，正在优雅关闭服务器...`);
            
            if (this.server) {
                this.server.close(() => {
                    console.log('服务器已关闭');
                    process.exit(0);
                });
            }

            // 强制关闭超时
            setTimeout(() => {
                console.log('强制关闭服务器');
                process.exit(1);
            }, 5000);
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    }
}

// 全局错误处理
process.on('uncaughtException', (error) => {
    console.error('未捕获的异常:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('未处理的Promise拒绝:', { reason, promise });
    process.exit(1);
});

// 启动应用程序
const app = new SimpleApp();
const server = app.start();

module.exports = app;