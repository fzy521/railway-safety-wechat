const http = require('http');
const url = require('url');
const path = require('path');

/**
 * 原生Node.js应用
 * 不依赖任何外部模块，用于演示系统功能
 */
class NativeApp {
    constructor() {
        this.port = process.env.PORT || 3000;
        this.host = process.env.HOST || 'localhost';
        
        // 模拟用户数据
        this.users = [
            {
                id: 1,
                username: 'admin',
                password: 'admin123', // 明文密码仅用于演示
                fullName: '系统管理员',
                role: '超级管理员',
                permissions: ['all']
            },
            {
                id: 2,
                username: 'safety',
                password: 'safety123',
                fullName: '张安全',
                role: '安全管理员',
                permissions: ['safety', 'risk', 'incident']
            },
            {
                id: 3,
                username: 'training',
                password: 'training123',
                fullName: '李培训',
                role: '培训管理员',
                permissions: ['training', 'certificate']
            },
            {
                id: 4,
                username: 'inspector',
                password: 'inspector123',
                fullName: '王巡检',
                role: '巡检员',
                permissions: ['inspection']
            },
            {
                id: 5,
                username: 'user',
                password: 'user123',
                fullName: '赵用户',
                role: '普通用户',
                permissions: ['view']
            }
        ];
        
        // 模拟业务数据
        this.safetyData = {
            dailyEvents: 3,
            monthlyIncidents: 1,
            inspectionRate: 98.5,
            riskLevel: '中等',
            normalStations: 6,
            maintenanceStations: 2,
            faultStations: 0,
            safetyIndex: 85.0
        };
        
        this.risks = [
            {
                id: 1,
                location: 'A站信号设备',
                type: '设备故障',
                description: '信号机老化，存在故障风险',
                probability: 3,
                severity: 4,
                level: '高风险',
                status: 'processing'
            }
        ];
        
        this.incidents = [
            {
                id: 1,
                incidentTime: '2025-12-15T14:30:00Z',
                location: 'A站站台',
                type: '设备故障',
                severity: '一般事故',
                description: '售票机故障导致旅客滞留',
                status: 'closed'
            }
        ];
        
        this.trainings = [
            {
                id: 1,
                topic: '安全生产培训',
                type: '安全培训',
                date: '2025-12-01',
                duration: 8,
                instructor: '李培训',
                status: 'completed'
            }
        ];
        
        this.certificates = [
            {
                id: 1,
                certificateName: '安全管理员证',
                certificateNumber: 'SAFE2024001',
                issuingAuthority: '铁路安全监督管理局',
                issueDate: '2024-01-15',
                expiryDate: '2026-01-15',
                status: 'valid'
            }
        ];
        
        this.inspectionPoints = [
            {
                id: 1,
                name: 'A站信号设备',
                type: '设备',
                location: 'A站信号机室',
                status: 'active'
            }
        ];
        
        this.inspectionRecords = [
            {
                id: 1,
                pointId: 1,
                inspectorId: 4,
                inspectionTime: '2025-12-16T10:30:00Z',
                status: 'normal'
            }
        ];
    }

    /**
     * 启动服务器
     */
    start() {
        this.server = http.createServer((req, res) => {
            this.handleRequest(req, res);
        });

        this.server.listen(this.port, this.host, () => {
            console.log(`🚀 梁邹铁路安全监控系统原生版本启动成功`);
            console.log(`📍 服务地址: http://${this.host}:${this.port}`);
            this.printStartupInfo();
        });

        // 优雅关闭处理
        this.setupGracefulShutdown();
    }

    /**
     * 处理HTTP请求
     */
    handleRequest(req, res) {
        const parsedUrl = url.parse(req.url, true);
        const method = req.method;
        const pathname = parsedUrl.pathname;

        // 设置CORS头
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }

        // 路由处理
        if (pathname === '/health') {
            this.handleHealth(req, res);
        } else if (pathname.startsWith('/api/')) {
            this.handleApi(req, res, parsedUrl);
        } else {
            this.handleStatic(req, res);
        }
    }

    /**
     * 健康检查
     */
    handleHealth(req, res) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: true,
            message: '系统运行正常',
            timestamp: new Date().toISOString(),
            version: '1.0.0-demo'
        }));
    }

    /**
     * API处理
     */
    handleApi(req, res, parsedUrl) {
        const pathname = parsedUrl.pathname;
        const method = req.method;

        try {
            // 解析请求体
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            
            req.on('end', () => {
                let jsonData = {};
                if (body && (method === 'POST' || method === 'PUT')) {
                    try {
                        jsonData = JSON.parse(body);
                    } catch (e) {
                        jsonData = {};
                    }
                }

                // 路由分发
                if (pathname === '/api/auth/login' && method === 'POST') {
                    this.handleLogin(jsonData, res);
                } else if (pathname === '/api/auth/logout' && method === 'POST') {
                    this.handleLogout(res);
                } else if (pathname === '/api/safety/data' && method === 'GET') {
                    this.handleSafetyData(res);
                } else if (pathname === '/api/risks' && method === 'GET') {
                    this.handleRisks(res);
                } else if (pathname === '/api/incidents' && method === 'GET') {
                    this.handleIncidents(res);
                } else if (pathname === '/api/training' && method === 'GET') {
                    this.handleTrainings(res);
                } else if (pathname === '/api/certificates' && method === 'GET') {
                    this.handleCertificates(res);
                } else if (pathname === '/api/inspection/points' && method === 'GET') {
                    this.handleInspectionPoints(res);
                } else if (pathname === '/api/inspection/records' && method === 'GET') {
                    this.handleInspectionRecords(res);
                } else if (pathname === '/api/system/stats' && method === 'GET') {
                    this.handleSystemStats(res);
                } else {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: false,
                        message: 'API接口不存在'
                    }));
                }
            });
        } catch (error) {
            console.error('API处理错误:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: '服务器内部错误'
            }));
        }
    }

    /**
     * 用户登录
     */
    handleLogin(data, res) {
        const { username, password } = data;
        
        const user = this.users.find(u => u.username === username && u.password === password);
        
        if (user) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                message: '登录成功',
                token: 'demo-token-' + Date.now(),
                user: {
                    id: user.id,
                    username: user.username,
                    fullName: user.fullName,
                    role: user.role,
                    permissions: user.permissions
                }
            }));
        } else {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: '用户名或密码错误'
            }));
        }
    }

    /**
     * 用户登出
     */
    handleLogout(res) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: true,
            message: '登出成功'
        }));
    }

    /**
     * 安全监控数据
     */
    handleSafetyData(res) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: true,
            data: this.safetyData
        }));
    }

    /**
     * 风险评估
     */
    handleRisks(res) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: true,
            data: this.risks,
            total: this.risks.length
        }));
    }

    /**
     * 事故报告
     */
    handleIncidents(res) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: true,
            data: this.incidents,
            total: this.incidents.length
        }));
    }

    /**
     * 培训管理
     */
    handleTrainings(res) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: true,
            data: this.trainings,
            total: this.trainings.length
        }));
    }

    /**
     * 证书管理
     */
    handleCertificates(res) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: true,
            data: this.certificates,
            total: this.certificates.length
        }));
    }

    /**
     * 巡检点
     */
    handleInspectionPoints(res) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: true,
            data: this.inspectionPoints,
            total: this.inspectionPoints.length
        }));
    }

    /**
     * 巡检记录
     */
    handleInspectionRecords(res) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: true,
            data: this.inspectionRecords,
            total: this.inspectionRecords.length
        }));
    }

    /**
     * 系统统计
     */
    handleSystemStats(res) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: true,
            data: {
                users: this.users.length,
                risks: this.risks.length,
                incidents: this.incidents.length,
                trainings: this.trainings.length,
                certificates: this.certificates.length,
                inspectionPoints: this.inspectionPoints.length,
                inspectionRecords: this.inspectionRecords.length
            }
        }));
    }

    /**
     * 静态文件服务
     */
    handleStatic(req, res) {
        const pathname = req.pathname;
        let filePath = pathname === '/' ? '/index.html' : pathname;
        
        // 简单的文件类型映射
        const contentTypes = {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.gif': 'image/gif'
        };
        
        const ext = path.extname(filePath);
        const contentType = contentTypes[ext] || 'text/plain';
        
        // 尝试提供HTML文件
        if (ext === '' || ext === '.html') {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(this.getHtmlContent());
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('文件未找到');
        }
    }

    /**
     * 获取HTML内容
     */
    getHtmlContent() {
        return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>梁邹铁路专用线运营安全监控系统 - 演示版</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/echarts/5.4.3/echarts.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&family=Noto+Sans+SC:wght@300;400;500;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Noto Sans SC', sans-serif; background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); }
        .hero-title { font-family: 'Noto Serif SC', serif; }
        .gradient-text { background: linear-gradient(135deg, #1e3a8a, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    </style>
</head>
<body class="min-h-screen">
    <div class="container mx-auto px-4 py-8">
        <div class="text-center mb-8">
            <h1 class="hero-title text-4xl font-bold text-gray-800 mb-4">梁邹铁路专用线运营安全监控系统</h1>
            <p class="text-xl text-gray-600 mb-8">演示版本 - 原生Node.js实现</p>
            
            <div class="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
                <h2 class="text-2xl font-semibold text-gray-800 mb-4">系统状态</h2>
                <div class="grid grid-cols-2 gap-4 text-left">
                    <div>
                        <p class="text-sm text-gray-600">服务器状态</p>
                        <p class="text-lg font-bold text-green-600">运行中</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">数据存储</p>
                        <p class="text-lg font-bold text-blue-600">内存存储</p>
                    </div>
                </div>
            </div>
            
            <div class="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
                <h2 class="text-2xl font-semibold text-gray-800 mb-6">API接口测试</h2>
                
                <div class="space-y-4">
                    <div class="border rounded-lg p-4">
                        <h3 class="font-semibold text-gray-700 mb-2">登录接口</h3>
                        <p class="text-sm text-gray-600 mb-2">POST /api/auth/login</p>
                        <button onclick="testLogin()" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">测试登录</button>
                        <div id="login-result" class="mt-2 text-sm"></div>
                    </div>
                    
                    <div class="border rounded-lg p-4">
                        <h3 class="font-semibold text-gray-700 mb-2">安全监控数据</h3>
                        <p class="text-sm text-gray-600 mb-2">GET /api/safety/data</p>
                        <button onclick="testSafetyData()" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">获取数据</button>
                        <div id="safety-result" class="mt-2 text-sm"></div>
                    </div>
                    
                    <div class="border rounded-lg p-4">
                        <h3 class="font-semibold text-gray-700 mb-2">风险评估</h3>
                        <p class="text-sm text-gray-600 mb-2">GET /api/risks</p>
                        <button onclick="testRisks()" class="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">获取数据</button>
                        <div id="risks-result" class="mt-2 text-sm"></div>
                    </div>
                    
                    <div class="border rounded-lg p-4">
                        <h3 class="font-semibold text-gray-700 mb-2">系统统计</h3>
                        <p class="text-sm text-gray-600 mb-2">GET /api/system/stats</p>
                        <button onclick="testSystemStats()" class="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">获取统计</button>
                        <div id="stats-result" class="mt-2 text-sm"></div>
                    </div>
                </div>
                
                <div class="mt-6 p-4 bg-gray-100 rounded-lg">
                    <h3 class="font-semibold text-gray-800 mb-2">默认登录账户</h3>
                    <div class="space-y-2 text-sm">
                        <div><strong>admin / admin123</strong> - 超级管理员 (所有权限)</div>
                        <div><strong>safety / safety123</strong> - 安全管理员</div>
                        <div><strong>training / training123</strong> - 培训管理员</div>
                        <div><strong>inspector / inspector123</strong> - 巡检员</div>
                        <div><strong>user / user123</strong> - 普通用户</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        async function testLogin() {
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: 'admin', password: 'admin123' })
                });
                const data = await response.json();
                document.getElementById('login-result').innerHTML = 
                    \`<span class="text-green-600">✅ \${data.message}</span>\`
                    + (data.success ? \`<br>用户: \${data.user.fullName}\` : '');
            } catch (error) {
                document.getElementById('login-result').innerHTML = 
                    \`<span class="text-red-600">❌ 请求失败</span>\`;
            }
        }
        
        async function testSafetyData() {
            try {
                const response = await fetch('/api/safety/data');
                const data = await response.json();
                document.getElementById('safety-result').innerHTML = 
                    \`<span class="text-green-600">✅ 获取成功</span>\`
                    + \`<br>安全指数: \${data.data.safetyIndex}\`;
            } catch (error) {
                document.getElementById('safety-result').innerHTML = 
                    \`<span class="text-red-600">❌ 请求失败</span>\`;
            }
        }
        
        async function testRisks() {
            try {
                const response = await fetch('/api/risks');
                const data = await response.json();
                document.getElementById('risks-result').innerHTML = 
                    \`<span class="text-green-600">✅ 获取成功</span>\`
                    + \`<br>风险评估数量: \${data.total}\`;
            } catch (error) {
                document.getElementById('risks-result').innerHTML = 
                    \`<span class="text-red-600">❌ 请求失败</span>\`;
            }
        }
        
        async function testSystemStats() {
            try {
                const response = await fetch('/api/system/stats');
                const data = await response.json();
                const stats = data.data;
                document.getElementById('stats-result').innerHTML = 
                    \`<span class="text-green-600">✅ 获取成功</span>\`
                    + \`<br>用户: \${stats.users}, 风险: \${stats.risks}, 事故: \${stats.incidents}\`;
            } catch (error) {
                document.getElementById('stats-result').innerHTML = 
                    \`<span class="text-red-600">❌ 请求失败</span>\`;
            }
        }
    </script>
</body>
</html>`;
    }

    /**
     * 打印启动信息
     */
    printStartupInfo() {
        console.log('\n🎉 梁邹铁路专用线运营安全监控系统原生版已启动!');
        console.log('═════════════════════════════════════════════════════');
        console.log(`📍 服务地址: http://${this.host}:${this.port}`);
        console.log(`📍 API服务地址: http://${this.host}:${this.port}/api`);
        console.log(`📍 健康检查: http://${this.host}:${this.port}/health`);
        console.log('═════════════════════════════════════════════════════');
        
        console.log('\n⚠️  原生Node.js演示版特点:');
        console.log('   📦 无外部依赖，仅使用Node.js内置模块');
        console.log('   🔄 内存存储，重启后数据重置');
        console.log('   🚀 启动迅速，适合功能演示');
        console.log('   📊 包含完整的API接口');
        console.log('   🔐 支持用户认证（演示版本）');
        
        console.log('\n👤 默认登录账户:');
        console.log('   超级管理员: admin / admin123');
        console.log('   安全管理员: safety / safety123');
        console.log('   培训管理员: training / training123');
        console.log('   巡检员: inspector / inspector123');
        console.log('   普通用户: user / user123');
        
        console.log('\n🔗 测试API接口:');
        console.log(`   curl -X POST http://${this.host}:${this.port}/api/auth/login -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}'`);
        console.log(`   curl -X GET http://${this.host}:${this.port}/api/safety/data`);
        console.log(`   curl -X GET http://${this.host}:${this.port}/api/risks`);
        console.log(`   curl -X GET http://${this.host}:${this.port}/api/system/stats`);
        
        console.log('\n📱 功能测试:');
        console.log('   1. 访问 http://' + this.host + ':' + this.port + ' 打开主页');
        console.log('2. 点击页面上的测试按钮');
        console.log('3. 使用 admin/admin123 登录系统');
        console.log('4. 测试各个API接口响应');
        
        console.log('\n🔧 技术说明:');
        console.log('   - 使用原生Node.js HTTP模块');
        console.log('   - 内存数据存储，重启后重置');
        console.log('   - 支持CORS跨域请求');
        console.log('   - 简化的JSON响应处理');
        
        console.log('\n📖 更多信息:');
        console.log('   - 这是演示版本，展示系统功能');
        console.log('   - 完整版本需要SQLite数据库支持');
        console.log('   - 查看项目文档了解更多功能');
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
            }, 3000);
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
const app = new NativeApp();
const server = app.start();

module.exports = app;