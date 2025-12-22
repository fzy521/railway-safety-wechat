// require('dotenv').config(); // 临时禁用以解决依赖问题
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const ApiService = require('./services/api-service');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/error-handler');
const createRoutes = require('./routes');

/**
 * Express应用程序主文件
 */
class RailwaySafetyApp {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.host = process.env.HOST || 'localhost';
        this.apiService = new ApiService();
        
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }

    /**
     * 设置中间件
     */
    setupMiddleware() {
        // 安全中间件
        this.app.use(helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
                    scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
                    imgSrc: ["'self'", "data:", "https:"],
                },
            },
        }));

        // CORS配置
        const corsOptions = {
            origin: process.env.CORS_ORIGIN === 'true' ? true : (process.env.CORS_ORIGIN || 'http://localhost:3000'),
            credentials: process.env.CORS_CREDENTIALS === 'true',
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization']
        };
        this.app.use(cors(corsOptions));

        // 压缩响应
        this.app.use(compression());

        // 请求体解析
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // 速率限制
        const limiter = rateLimit({
            windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15分钟
            max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 限制每个IP 100个请求
            message: {
                success: false,
                message: '请求过于频繁，请稍后再试'
            },
            standardHeaders: true,
            legacyHeaders: false,
        });
        this.app.use('/api/', limiter);

        // 请求日志
        this.app.use((req, res, next) => {
            logger.info(`${req.method} ${req.path}`, {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
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

        // API路由
        this.app.use('/api', createRoutes(this.apiService));

        // 静态文件服务（前端页面）
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
        this.app.use(errorHandler);
    }

    /**
     * 启动服务器
     */
    start() {
        this.app.listen(this.port, this.host, () => {
            logger.info(`服务器启动成功`, {
                host: this.host,
                port: this.port,
                env: process.env.NODE_ENV || 'development',
                timestamp: new Date().toISOString()
            });
            
            console.log(`🚀 梁邹铁路安全监控系统API服务器启动成功`);
            console.log(`📍 服务地址: http://${this.host}:${this.port}`);
            console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
        });

        // 优雅关闭处理
        this.setupGracefulShutdown();
    }

    /**
     * 设置优雅关闭
     */
    setupGracefulShutdown() {
        const gracefulShutdown = (signal) => {
            logger.info(`收到${signal}信号，开始优雅关闭...`);
            
            server.close(() => {
                logger.info('HTTP服务器已关闭');
                
                // 关闭数据库连接
                this.apiService.close();
                
                logger.info('应用程序已优雅关闭');
                process.exit(0);
            });

            // 强制关闭超时
            setTimeout(() => {
                logger.error('强制关闭应用程序');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    }
}

// 全局错误处理
process.on('uncaughtException', (error) => {
    logger.error('未捕获的异常:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('未处理的Promise拒绝:', { reason, promise });
    process.exit(1);
});

// 启动应用程序
const app = new RailwaySafetyApp();
const server = app.start();

module.exports = app;