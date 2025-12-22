// require('dotenv').config(); // 临时禁用以解决依赖问题
const ApiClient = require('./api-client');

/**
 * 系统功能测试脚本
 * 用于验证SQLite数据库集成后的系统功能
 */
class SystemTester {
    constructor() {
        this.apiClient = new ApiClient();
        this.testResults = [];
        this.testUser = {
            username: 'admin',
            password: 'admin123'
        };
    }

    /**
     * 运行所有测试
     */
    async runAllTests() {
        console.log('🧪 开始系统功能测试...\n');
        
        try {
            // 1. 测试服务器连接
            await this.testServerConnection();
            
            // 2. 测试用户认证
            await this.testAuthentication();
            
            // 3. 测试安全监控API
            await this.testSafetyAPI();
            
            // 4. 测试风险评估API
            await this.testRiskAPI();
            
            // 5. 测试培训管理API
            await this.testTrainingAPI();
            
            // 6. 测试证书管理API
            await this.testCertificateAPI();
            
            // 7. 测试巡检管理API
            await this.testInspectionAPI();
            
            // 8. 测试系统管理API
            await this.testSystemAPI();
            
            // 输出测试结果
            this.printTestResults();
            
        } catch (error) {
            console.error('❌ 测试过程中发生错误:', error);
        }
    }

    /**
     * 测试服务器连接
     */
    async testServerConnection() {
        console.log('🔗 测试服务器连接...');
        
        try {
            const response = await this.apiClient.healthCheck();
            if (response.success) {
                this.addTestResult('服务器连接', true, '连接成功');
            } else {
                this.addTestResult('服务器连接', false, response.message);
            }
        } catch (error) {
            this.addTestResult('服务器连接', false, error.message);
        }
    }

    /**
     * 测试用户认证
     */
    async testAuthentication() {
        console.log('🔐 测试用户认证...');
        
        try {
            // 测试登录
            const loginResponse = await this.apiClient.login(this.testUser.username, this.testUser.password);
            if (!loginResponse.success) {
                this.addTestResult('用户登录', false, loginResponse.message);
                return;
            }
            
            this.addTestResult('用户登录', true, '登录成功');
            
            // 测试获取当前用户信息
            const userResponse = await this.apiClient.getCurrentUser();
            if (userResponse.success) {
                this.addTestResult('获取用户信息', true, '获取成功');
            } else {
                this.addTestResult('获取用户信息', false, userResponse.message);
            }
            
            // 测试令牌验证
            const tokenValidation = this.apiClient.verifyToken(this.apiClient.token);
            if (tokenValidation.success) {
                this.addTestResult('令牌验证', true, '令牌有效');
            } else {
                this.addTestResult('令牌验证', false, tokenValidation.message);
            }
            
        } catch (error) {
            this.addTestResult('用户认证', false, error.message);
        }
    }

    /**
     * 测试安全监控API
     */
    async testSafetyAPI() {
        console.log('📊 测试安全监控API...');
        
        try {
            // 测试获取安全数据
            const safetyData = await this.apiClient.getSafetyData();
            if (safetyData.success) {
                this.addTestResult('获取安全数据', true, '数据获取成功');
            } else {
                this.addTestResult('获取安全数据', false, safetyData.message);
            }
            
            // 测试获取安全图表数据
            const chartsData = await this.apiClient.getSafetyCharts('trend');
            if (chartsData.success) {
                this.addTestResult('获取图表数据', true, '图表数据获取成功');
            } else {
                this.addTestResult('获取图表数据', false, chartsData.message);
            }
            
            // 测试获取KPI数据
            const kpiData = await this.apiClient.getSafetyKpi();
            if (kpiData.success) {
                this.addTestResult('获取KPI数据', true, 'KPI数据获取成功');
            } else {
                this.addTestResult('获取KPI数据', false, kpiData.message);
            }
            
        } catch (error) {
            this.addTestResult('安全监控API', false, error.message);
        }
    }

    /**
     * 测试风险评估API
     */
    async testRiskAPI() {
        console.log('⚠️ 测试风险评估API...');
        
        try {
            // 测试获取风险评估列表
            const risksData = await this.apiClient.getRisks();
            if (risksData.success) {
                this.addTestResult('获取风险评估列表', true, `获取到 ${risksData.data.length || 0} 条记录`);
            } else {
                this.addTestResult('获取风险评估列表', false, risksData.message);
            }
            
            // 测试创建风险评估
            const newRisk = {
                location: '测试地点',
                risk_type: '设备故障',
                description: '测试风险评估描述',
                probability: 2,
                severity: 3
            };
            
            const createResponse = await this.apiClient.createRisk(newRisk);
            if (createResponse.success) {
                this.addTestResult('创建风险评估', true, '创建成功');
                
                // 测试更新风险评估
                const updateResponse = await this.apiClient.updateRisk(createResponse.data.id, {
                    description: '更新后的描述'
                });
                
                if (updateResponse.success) {
                    this.addTestResult('更新风险评估', true, '更新成功');
                } else {
                    this.addTestResult('更新风险评估', false, updateResponse.message);
                }
                
                // 测试删除风险评估
                const deleteResponse = await this.apiClient.deleteRisk(createResponse.data.id);
                if (deleteResponse.success) {
                    this.addTestResult('删除风险评估', true, '删除成功');
                } else {
                    this.addTestResult('删除风险评估', false, deleteResponse.message);
                }
            } else {
                this.addTestResult('创建风险评估', false, createResponse.message);
            }
            
        } catch (error) {
            this.addTestResult('风险评估API', false, error.message);
        }
    }

    /**
     * 测试培训管理API
     */
    async testTrainingAPI() {
        console.log('📚 测试培训管理API...');
        
        try {
            // 测试获取培训记录列表
            const trainingsData = await this.apiClient.getTrainings();
            if (trainingsData.success) {
                this.addTestResult('获取培训记录列表', true, `获取到 ${trainingsData.data.length || 0} 条记录`);
            } else {
                this.addTestResult('获取培训记录列表', false, trainingsData.message);
            }
            
            // 测试创建培训记录
            const newTraining = {
                topic: '测试培训',
                training_type: '安全培训',
                training_date: '2025-12-25',
                duration: 4,
                instructor: '测试讲师',
                location: '培训室',
                department: '安全部',
                participants: 10
            };
            
            const createResponse = await this.apiClient.createTraining(newTraining);
            if (createResponse.success) {
                this.addTestResult('创建培训记录', true, '创建成功');
                
                // 测试更新培训记录
                const updateResponse = await this.apiClient.updateTraining(createResponse.data.id, {
                    topic: '更新后的培训主题'
                });
                
                if (updateResponse.success) {
                    this.addTestResult('更新培训记录', true, '更新成功');
                } else {
                    this.addTestResult('更新培训记录', false, updateResponse.message);
                }
                
                // 测试删除培训记录
                const deleteResponse = await this.apiClient.deleteTraining(createResponse.data.id);
                if (deleteResponse.success) {
                    this.addTestResult('删除培训记录', true, '删除成功');
                } else {
                    this.addTestResult('删除培训记录', false, deleteResponse.message);
                }
            } else {
                this.addTestResult('创建培训记录', false, createResponse.message);
            }
            
        } catch (error) {
            this.addTestResult('培训管理API', false, error.message);
        }
    }

    /**
     * 测试证书管理API
     */
    async testCertificateAPI() {
        console.log('📜 测试证书管理API...');
        
        try {
            // 测试获取证书列表
            const certificatesData = await this.apiClient.getCertificates();
            if (certificatesData.success) {
                this.addTestResult('获取证书列表', true, `获取到 ${certificatesData.data.length || 0} 条记录`);
            } else {
                this.addTestResult('获取证书列表', false, certificatesData.message);
            }
            
            // 测试创建证书记录
            const newCertificate = {
                user_id: 1,
                certificate_name: '测试证书',
                certificate_number: 'TEST001',
                issuing_authority: '测试机构',
                issue_date: '2024-01-01',
                expiry_date: '2026-01-01',
                certificate_type: '安全证'
            };
            
            const createResponse = await this.apiClient.createCertificate(newCertificate);
            if (createResponse.success) {
                this.addTestResult('创建证书记录', true, '创建成功');
                
                // 测试更新证书记录
                const updateResponse = await this.apiClient.updateCertificate(createResponse.data.id, {
                    certificate_name: '更新后的证书名称'
                });
                
                if (updateResponse.success) {
                    this.addTestResult('更新证书记录', true, '更新成功');
                } else {
                    this.addTestResult('更新证书记录', false, updateResponse.message);
                }
                
                // 测试删除证书记录
                const deleteResponse = await this.apiClient.deleteCertificate(createResponse.data.id);
                if (deleteResponse.success) {
                    this.addTestResult('删除证书记录', true, '删除成功');
                } else {
                    this.addTestResult('删除证书记录', false, deleteResponse.message);
                }
            } else {
                this.addTestResult('创建证书记录', false, createResponse.message);
            }
            
        } catch (error) {
            this.addTestResult('证书管理API', false, error.message);
        }
    }

    /**
     * 测试巡检管理API
     */
    async testInspectionAPI() {
        console.log('🔍 测试巡检管理API...');
        
        try {
            // 测试获取巡检点列表
            const pointsData = await this.apiClient.getInspectionPoints();
            if (pointsData.success) {
                this.addTestResult('获取巡检点列表', true, `获取到 ${pointsData.data.length || 0} 条记录`);
            } else {
                this.addTestResult('获取巡检点列表', false, pointsData.message);
            }
            
            // 测试创建巡检点
            const newPoint = {
                name: '测试巡检点',
                type: '设备',
                location: '测试位置',
                description: '测试巡检点描述',
                inspection_cycle: 1
            };
            
            const createPointResponse = await this.apiClient.createInspectionPoint(newPoint);
            if (createPointResponse.success) {
                this.addTestResult('创建巡检点', true, '创建成功');
                
                // 测试生成二维码
                const qrResponse = await this.apiClient.generateQRCode(createPointResponse.data.id);
                if (qrResponse.success) {
                    this.addTestResult('生成二维码', true, '二维码生成成功');
                } else {
                    this.addTestResult('生成二维码', false, qrResponse.message);
                }
                
                // 测试更新巡检点
                const updatePointResponse = await this.apiClient.updateInspectionPoint(createPointResponse.data.id, {
                    name: '更新后的巡检点名称'
                });
                
                if (updatePointResponse.success) {
                    this.addTestResult('更新巡检点', true, '更新成功');
                } else {
                    this.addTestResult('更新巡检点', false, updatePointResponse.message);
                }
                
                // 测试删除巡检点
                const deletePointResponse = await this.apiClient.deleteInspectionPoint(createPointResponse.data.id);
                if (deletePointResponse.success) {
                    this.addTestResult('删除巡检点', true, '删除成功');
                } else {
                    this.addTestResult('删除巡检点', false, deletePointResponse.message);
                }
            } else {
                this.addTestResult('创建巡检点', false, createPointResponse.message);
            }
            
        } catch (error) {
            this.addTestResult('巡检管理API', false, error.message);
        }
    }

    /**
     * 测试系统管理API
     */
    async testSystemAPI() {
        console.log('⚙️ 测试系统管理API...');
        
        try {
            // 测试获取系统统计
            const statsResponse = await this.apiClient.getSystemStats();
            if (statsResponse.success) {
                this.addTestResult('获取系统统计', true, '统计获取成功');
            } else {
                this.addTestResult('获取系统统计', false, statsResponse.message);
            }
            
            // 测试数据库备份
            const backupResponse = await this.apiClient.backupDatabase();
            if (backupResponse.success) {
                this.addTestResult('数据库备份', true, '备份成功');
            } else {
                this.addTestResult('数据库备份', false, backupResponse.message);
            }
            
        } catch (error) {
            this.addTestResult('系统管理API', false, error.message);
        }
    }

    /**
     * 添加测试结果
     */
    addTestResult(testName, success, message) {
        this.testResults.push({
            name: testName,
            success,
            message,
            timestamp: new Date().toISOString()
        });
        
        const status = success ? '✅' : '❌';
        console.log(`   ${status} ${testName}: ${message}`);
    }

    /**
     * 打印测试结果摘要
     */
    printTestResults() {
        console.log('\n📋 测试结果摘要:');
        console.log('═════════════════════════════════════════════════════');
        
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.success).length;
        const failedTests = totalTests - passedTests;
        
        console.log(`总测试数: ${totalTests}`);
        console.log(`通过: ${passedTests} (${((passedTests/totalTests)*100).toFixed(1)}%)`);
        console.log(`失败: ${failedTests} (${((failedTests/totalTests)*100).toFixed(1)}%)`);
        
        if (failedTests > 0) {
            console.log('\n❌ 失败的测试:');
            this.testResults.filter(r => !r.success).forEach(test => {
                console.log(`   - ${test.name}: ${test.message}`);
            });
        }
        
        console.log('\n═════════════════════════════════════════════════════');
        
        if (failedTests === 0) {
            console.log('🎉 所有测试通过！系统功能正常。');
        } else {
            console.log('⚠️  部分测试失败，请检查相关功能。');
        }
        
        console.log('\n💡 提示: 可以通过浏览器访问 http://localhost:3000 进行完整的功能测试');
    }
}

// 运行测试
const tester = new SystemTester();
tester.runAllTests().catch(error => {
    console.error('测试运行失败:', error);
    process.exit(1);
});