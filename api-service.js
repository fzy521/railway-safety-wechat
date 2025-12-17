// 梁邹铁路专用线安全管理系统 - API服务
// 模拟数据库交互和API调用

class ApiService {
    constructor() {
        this.baseURL = '/api';
        this.token = localStorage.getItem('token') || sessionStorage.getItem('token');
        this.initMockData();
    }

    // 初始化模拟数据
    initMockData() {
        // 用户数据
        this.users = [
            {
                id: 1,
                username: 'admin',
                password: 'admin123', // 实际应用中应该使用哈希密码
                fullName: '超级管理员',
                email: 'admin@example.com',
                phone: '138****1234',
                department: '信息部',
                position: '系统管理员',
                role: '超级管理员',
                status: 'active',
                createdAt: '2025-01-01 10:00:00',
                lastLogin: '2025-12-17 14:30:00',
                permissions: ['system.manage', 'user.manage', 'role.manage', 'permission.manage', 'safety.view', 'risk.manage', 'incident.manage', 'training.manage', 'certificate.manage']
            },
            {
                id: 2,
                username: 'safety_manager',
                password: 'safety123',
                fullName: '张三',
                email: 'safety@example.com',
                phone: '139****5678',
                department: '安全部',
                position: '安全主管',
                role: '安全管理员',
                status: 'active',
                createdAt: '2025-02-15 14:30:00',
                lastLogin: '2025-12-16 09:15:00',
                permissions: ['safety.view', 'risk.manage', 'incident.manage']
            },
            {
                id: 3,
                username: 'train_manager',
                password: 'train123',
                fullName: '李四',
                email: 'train@example.com',
                phone: '137****9012',
                department: '管理部',
                position: '培训主管',
                role: '培训管理员',
                status: 'active',
                createdAt: '2025-03-10 09:15:00',
                lastLogin: '2025-12-15 16:45:00',
                permissions: ['training.manage', 'certificate.manage']
            },
            {
                id: 4,
                username: 'operator1',
                password: 'op123456',
                fullName: '王五',
                email: 'op1@example.com',
                phone: '136****3456',
                department: '运营部',
                position: '操作员',
                role: '普通用户',
                status: 'active',
                createdAt: '2025-04-20 11:30:00',
                lastLogin: '2025-12-17 08:20:00',
                permissions: ['safety.view']
            }
        ];

        // 角色数据
        this.roles = [
            {
                id: 1,
                name: '超级管理员',
                description: '系统最高权限管理员',
                permissions: ['system.manage', 'user.manage', 'role.manage', 'permission.manage', 'safety.view', 'risk.manage', 'incident.manage', 'training.manage', 'certificate.manage']
            },
            {
                id: 2,
                name: '安全管理员',
                description: '负责安全监控和风险管理',
                permissions: ['safety.view', 'risk.manage', 'incident.manage']
            },
            {
                id: 3,
                name: '培训管理员',
                description: '负责培训计划和证书管理',
                permissions: ['training.manage', 'certificate.manage']
            },
            {
                id: 4,
                name: '普通用户',
                description: '一般系统用户',
                permissions: ['safety.view']
            }
        ];

        // 安全监控数据
        this.safetyData = {
            dailyEvents: 3,
            monthlyIncidents: 1,
            inspectionRate: 98.5,
            riskLevel: '中等',
            stations: { normal: 6, maintenance: 2, fault: 0 },
            safetyIndex: 85
        };

        // 风险数据
        this.risks = [
            {
                id: 1,
                location: 'A站',
                type: '设备故障',
                description: '信号设备老化，存在故障风险',
                probability: 3,
                severity: 4,
                level: '高风险',
                status: 'pending',
                reporterId: 2,
                measures: '计划下月更换设备',
                createdAt: '2025-12-10 10:30:00'
            },
            {
                id: 2,
                location: '轨道区间1',
                type: '环境因素',
                description: '近期降雨频繁，轨道湿滑',
                probability: 4,
                severity: 3,
                level: '中高风险',
                status: 'processing',
                reporterId: 2,
                measures: '加强巡检，及时清理',
                createdAt: '2025-12-08 14:20:00'
            }
        ];

        // 事故数据
        this.incidents = [
            {
                id: 1,
                incidentTime: '2025-12-10T08:30',
                location: 'A站',
                type: '信号故障',
                severity: '一般事故',
                description: 'A站信号机显示异常，导致列车临时停车',
                cause: '信号设备老化，电路接触不良',
                measures: '更换信号设备，加强日常维护',
                reporterId: 2,
                status: 'processing',
                processTime: 3.5,
                createdAt: '2025-12-10 08:45:00'
            }
        ];

        // 培训数据
        this.trainings = [
            {
                id: 1,
                topic: '铁路安全法规培训',
                type: '安全法规',
                date: '2025-12-15',
                duration: 4,
                instructor: '李教授',
                location: '培训室A',
                department: '全部',
                participants: 45,
                passRate: 95.6,
                status: 'completed',
                createdBy: 3
            },
            {
                id: 2,
                topic: '信号设备操作培训',
                type: '操作技能',
                date: '2025-12-20',
                duration: 3,
                instructor: '王工程师',
                location: '实训室B',
                department: '维护部',
                participants: 25,
                passRate: 0,
                status: 'scheduled',
                createdBy: 3
            }
        ];
    }

    // 用户认证相关API
    async login(username, password) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const user = this.users.find(u => u.username === username && u.password === password);
                
                if (user) {
                    // 更新最后登录时间
                    user.lastLogin = new Date().toLocaleString();
                    
                    resolve({
                        success: true,
                        token: 'simulated_jwt_token_' + Date.now(),
                        user: {
                            id: user.id,
                            username: user.username,
                            fullName: user.fullName,
                            email: user.email,
                            department: user.department,
                            position: user.position,
                            role: user.role,
                            permissions: user.permissions
                        }
                    });
                } else {
                    resolve({
                        success: false,
                        message: '用户名或密码错误'
                    });
                }
            }, 500);
        });
    }

    async logout() {
        return new Promise((resolve) => {
            setTimeout(() => {
                this.token = null;
                resolve({ success: true });
            }, 200);
        });
    }

    async getCurrentUser() {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (this.token) {
                    const user = this.users.find(u => u.username === 'admin'); // 模拟当前用户
                    resolve({
                        success: true,
                        user: user ? {
                            id: user.id,
                            username: user.username,
                            fullName: user.fullName,
                            email: user.email,
                            department: user.department,
                            position: user.position,
                            role: user.role,
                            permissions: user.permissions
                        } : null
                    });
                } else {
                    resolve({
                        success: false,
                        message: '未登录'
                    });
                }
            }, 200);
        });
    }

    // 用户管理相关API
    async getUsers(params = {}) {
        return new Promise((resolve) => {
            setTimeout(() => {
                let result = [...this.users];
                
                // 应用搜索过滤
                if (params.search) {
                    const search = params.search.toLowerCase();
                    result = result.filter(user => 
                        user.username.toLowerCase().includes(search) ||
                        user.fullName.toLowerCase().includes(search) ||
                        user.department.toLowerCase().includes(search)
                    );
                }
                
                // 应用状态过滤
                if (params.status) {
                    result = result.filter(user => user.status === params.status);
                }
                
                resolve({
                    success: true,
                    data: result,
                    total: result.length
                });
            }, 300);
        });
    }

    async getUserById(id) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const user = this.users.find(u => u.id === parseInt(id));
                if (user) {
                    resolve({
                        success: true,
                        data: user
                    });
                } else {
                    resolve({
                        success: false,
                        message: '用户不存在'
                    });
                }
            }, 200);
        });
    }

    async createUser(userData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // 检查用户名是否已存在
                if (this.users.find(u => u.username === userData.username)) {
                    resolve({
                        success: false,
                        message: '用户名已存在'
                    });
                    return;
                }
                
                // 检查邮箱是否已存在
                if (this.users.find(u => u.email === userData.email)) {
                    resolve({
                        success: false,
                        message: '邮箱已存在'
                    });
                    return;
                }
                
                const newUser = {
                    id: Math.max(...this.users.map(u => u.id)) + 1,
                    ...userData,
                    password: '123456', // 默认密码
                    status: userData.status || 'active',
                    createdAt: new Date().toLocaleString(),
                    lastLogin: null,
                    permissions: this.roles.find(r => r.name === userData.role)?.permissions || []
                };
                
                this.users.push(newUser);
                
                resolve({
                    success: true,
                    data: newUser
                });
            }, 500);
        });
    }

    async updateUser(id, userData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const index = this.users.findIndex(u => u.id === parseInt(id));
                if (index !== -1) {
                    this.users[index] = {
                        ...this.users[index],
                        ...userData,
                        permissions: this.roles.find(r => r.name === userData.role)?.permissions || this.users[index].permissions
                    };
                    
                    resolve({
                        success: true,
                        data: this.users[index]
                    });
                } else {
                    resolve({
                        success: false,
                        message: '用户不存在'
                    });
                }
            }, 500);
        });
    }

    async deleteUser(id) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const index = this.users.findIndex(u => u.id === parseInt(id));
                if (index !== -1) {
                    this.users.splice(index, 1);
                    resolve({
                        success: true
                    });
                } else {
                    resolve({
                        success: false,
                        message: '用户不存在'
                    });
                }
            }, 300);
        });
    }

    // 角色管理相关API
    async getRoles() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    data: this.roles
                });
            }, 200);
        });
    }

    // 安全监控相关API
    async getSafetyData() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    data: this.safetyData
                });
            }, 200);
        });
    }

    async updateSafetyData(data) {
        return new Promise((resolve) => {
            setTimeout(() => {
                this.safetyData = { ...this.safetyData, ...data };
                resolve({
                    success: true,
                    data: this.safetyData
                });
            }, 300);
        });
    }

    // 风险评估相关API
    async getRisks(params = {}) {
        return new Promise((resolve) => {
            setTimeout(() => {
                let result = [...this.risks];
                
                if (params.status) {
                    result = result.filter(risk => risk.status === params.status);
                }
                
                if (params.type) {
                    result = result.filter(risk => risk.type === params.type);
                }
                
                resolve({
                    success: true,
                    data: result,
                    total: result.length
                });
            }, 300);
        });
    }

    async createRisk(riskData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newRisk = {
                    id: Math.max(...this.risks.map(r => r.id)) + 1,
                    ...riskData,
                    level: this.calculateRiskLevel(riskData.probability, riskData.severity),
                    status: 'pending',
                    createdAt: new Date().toLocaleString()
                };
                
                this.risks.push(newRisk);
                
                resolve({
                    success: true,
                    data: newRisk
                });
            }, 500);
        });
    }

    // 事故报告相关API
    async getIncidents(params = {}) {
        return new Promise((resolve) => {
            setTimeout(() => {
                let result = [...this.incidents];
                
                if (params.status) {
                    result = result.filter(incident => incident.status === params.status);
                }
                
                if (params.type) {
                    result = result.filter(incident => incident.type === params.type);
                }
                
                resolve({
                    success: true,
                    data: result,
                    total: result.length
                });
            }, 300);
        });
    }

    async createIncident(incidentData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newIncident = {
                    id: Math.max(...this.incidents.map(i => i.id)) + 1,
                    ...incidentData,
                    status: 'pending',
                    processTime: 0,
                    createdAt: new Date().toLocaleString()
                };
                
                this.incidents.push(newIncident);
                
                resolve({
                    success: true,
                    data: newIncident
                });
            }, 500);
        });
    }

    // 培训管理相关API
    async getTrainings(params = {}) {
        return new Promise((resolve) => {
            setTimeout(() => {
                let result = [...this.trainings];
                
                if (params.status) {
                    result = result.filter(training => training.status === params.status);
                }
                
                if (params.type) {
                    result = result.filter(training => training.type === params.type);
                }
                
                resolve({
                    success: true,
                    data: result,
                    total: result.length
                });
            }, 300);
        });
    }

    async createTraining(trainingData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newTraining = {
                    id: Math.max(...this.trainings.map(t => t.id)) + 1,
                    ...trainingData,
                    status: 'scheduled',
                    createdBy: 1 // 假设当前用户ID为1
                };
                
                this.trainings.push(newTraining);
                
                resolve({
                    success: true,
                    data: newTraining
                });
            }, 500);
        });
    }

    // 辅助方法
    calculateRiskLevel(probability, severity) {
        const score = probability * severity;
        if (score <= 6) return '低风险';
        if (score <= 12) return '中等风险';
        return '高风险';
    }

    // 检查权限
    hasPermission(user, permission) {
        return user.permissions && user.permissions.includes(permission);
    }

    // 记录操作日志
    async logOperation(userId, action, module, description = '') {
        const log = {
            userId,
            action,
            module,
            description,
            ipAddress: '127.0.0.1', // 实际应用中应该获取真实IP
            userAgent: navigator.userAgent,
            createdAt: new Date().toLocaleString()
        };
        
        console.log('Operation log:', log);
        
        return Promise.resolve({
            success: true
        });
    }

    // 巡检相关数据
    this.inspectionPoints = [
        {
            id: 1,
            name: 'A站信号设备',
            type: '设备',
            location: 'A站控制室',
            description: 'A站主要信号设备状态检查',
            requirements: '检查信号机、轨道电路、道岔转换设备状态',
            inspection_cycle: 1,
            responsible_department: '维护部',
            responsible_person: '张三',
            status: 'active',
            created_at: '2025-12-01 10:00:00',
            qr_code: null,
            qr_token: null
        },
        {
            id: 2,
            name: 'B站通信设备',
            type: '设备',
            location: 'B站通信机房',
            description: 'B站通信设备运行状态检查',
            requirements: '检查通信线路、交换机、无线设备',
            inspection_cycle: 2,
            responsible_department: '维护部',
            responsible_person: '李四',
            status: 'active',
            created_at: '2025-12-02 14:30:00',
            qr_code: null,
            qr_token: null
        }
    ];

    this.inspectionRecords = [
        {
            id: 1,
            point_id: 1,
            point_name: 'A站信号设备',
            inspector_id: 2,
            inspector_name: '张三',
            inspection_time: '2025-12-17 10:30:00',
            status: 'normal',
            items_checked: [1, 2, 3],
            abnormal_items: [],
            photos: [],
            notes: '一切正常',
            gps_location: '116.3974,39.9093',
            weather_condition: '晴朗',
            created_at: '2025-12-17 10:35:00'
        },
        {
            id: 2,
            point_id: 2,
            point_name: 'B站通信设备',
            inspector_id: 3,
            inspector_name: '李四',
            inspection_time: '2025-12-17 11:15:00',
            status: 'abnormal',
            items_checked: [1, 2, 3, 4],
            abnormal_items: [4],
            photos: ['photo1.jpg'],
            notes: '通信线路有轻微干扰',
            gps_location: '116.3980,39.9095',
            weather_condition: '晴朗',
            created_at: '2025-12-17 11:20:00'
        }
    ];

    this.inspectionItems = [
        {
            id: 1,
            point_id: 1,
            item_name: '设备外观检查',
            item_type: 'checkbox',
            options: null,
            required: true,
            sort_order: 1
        },
        {
            id: 2,
            point_id: 1,
            item_name: '运行状态检查',
            item_type: 'checkbox',
            options: null,
            required: true,
            sort_order: 2
        },
        {
            id: 3,
            point_id: 1,
            item_name: '环境状况检查',
            item_type: 'radio',
            options: ['良好', '一般', '较差'],
            required: true,
            sort_order: 3
        },
        {
            id: 4,
            point_id: 1,
            item_name: '备注说明',
            item_type: 'text',
            options: null,
            required: false,
            sort_order: 4
        }
    ];

    // 巡检点管理相关API
    async getInspectionPoints(params = {}) {
        return new Promise((resolve) => {
            setTimeout(() => {
                let result = [...this.inspectionPoints];
                
                if (params.status) {
                    result = result.filter(point => point.status === params.status);
                }
                
                if (params.type) {
                    result = result.filter(point => point.type === params.type);
                }
                
                if (params.search) {
                    const search = params.search.toLowerCase();
                    result = result.filter(point => 
                        point.name.toLowerCase().includes(search) ||
                        point.location.toLowerCase().includes(search) ||
                        point.description.toLowerCase().includes(search)
                    );
                }
                
                resolve({
                    success: true,
                    data: result,
                    total: result.length
                });
            }, 300);
        });
    }

    async getInspectionPointById(id) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const point = this.inspectionPoints.find(p => p.id === parseInt(id));
                if (point) {
                    // 获取巡检项目
                    const items = this.inspectionItems.filter(item => item.point_id === point.id);
                    resolve({
                        success: true,
                        data: {
                            ...point,
                            inspection_items: items
                        }
                    });
                } else {
                    resolve({
                        success: false,
                        message: '巡检点不存在'
                    });
                }
            }, 200);
        });
    }

    async createInspectionPoint(pointData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newPoint = {
                    id: Math.max(...this.inspectionPoints.map(p => p.id)) + 1,
                    ...pointData,
                    status: pointData.status || 'active',
                    created_at: new Date().toLocaleString(),
                    qr_code: null,
                    qr_token: null
                };
                
                this.inspectionPoints.push(newPoint);
                
                resolve({
                    success: true,
                    data: newPoint
                });
            }, 500);
        });
    }

    async updateInspectionPoint(id, pointData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const index = this.inspectionPoints.findIndex(p => p.id === parseInt(id));
                if (index !== -1) {
                    this.inspectionPoints[index] = {
                        ...this.inspectionPoints[index],
                        ...pointData,
                        updated_at: new Date().toLocaleString()
                    };
                    
                    resolve({
                        success: true,
                        data: this.inspectionPoints[index]
                    });
                } else {
                    resolve({
                        success: false,
                        message: '巡检点不存在'
                    });
                }
            }, 500);
        });
    }

    async deleteInspectionPoint(id) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const index = this.inspectionPoints.findIndex(p => p.id === parseInt(id));
                if (index !== -1) {
                    this.inspectionPoints.splice(index, 1);
                    resolve({
                        success: true
                    });
                } else {
                    resolve({
                        success: false,
                        message: '巡检点不存在'
                    });
                }
            }, 300);
        });
    }

    // 巡检记录相关API
    async getInspectionRecords(params = {}) {
        return new Promise((resolve) => {
            setTimeout(() => {
                let result = [...this.inspectionRecords];
                
                if (params.point_id) {
                    result = result.filter(record => record.point_id === parseInt(params.point_id));
                }
                
                if (params.inspector_id) {
                    result = result.filter(record => record.inspector_id === parseInt(params.inspector_id));
                }
                
                if (params.status) {
                    result = result.filter(record => record.status === params.status);
                }
                
                if (params.start_date && params.end_date) {
                    const startDate = new Date(params.start_date);
                    const endDate = new Date(params.end_date);
                    result = result.filter(record => {
                        const recordDate = new Date(record.inspection_time);
                        return recordDate >= startDate && recordDate <= endDate;
                    });
                }
                
                resolve({
                    success: true,
                    data: result,
                    total: result.length
                });
            }, 300);
        });
    }

    async createInspectionRecord(recordData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newRecord = {
                    id: Math.max(...this.inspectionRecords.map(r => r.id)) + 1,
                    ...recordData,
                    created_at: new Date().toLocaleString()
                };
                
                this.inspectionRecords.push(newRecord);
                
                resolve({
                    success: true,
                    data: newRecord
                });
            }, 500);
        });
    }

    // 巡检项目相关API
    async getInspectionItems(pointId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const items = this.inspectionItems.filter(item => item.point_id === parseInt(pointId));
                resolve({
                    success: true,
                    data: items
                });
            }, 200);
        });
    }

    async createInspectionItem(itemData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newItem = {
                    id: Math.max(...this.inspectionItems.map(item => item.id)) + 1,
                    ...itemData,
                    sort_order: itemData.sort_order || 0
                };
                
                this.inspectionItems.push(newItem);
                
                resolve({
                    success: true,
                    data: newItem
                });
            }, 300);
        });
    }

    // 二维码验证相关API
    async verifyQRCode(qrData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                try {
                    const decodedData = JSON.parse(atob(qrData.qr_token));
                    
                    // 验证二维码有效性
                    if (decodedData.type !== 'inspection_point') {
                        resolve({
                            success: false,
                            message: '无效的二维码'
                        });
                        return;
                    }
                    
                    // 检查是否过期
                    const now = Date.now();
                    if (now > decodedData.timestamp + decodedData.expire_time) {
                        resolve({
                            success: false,
                            message: '二维码已过期'
                        });
                        return;
                    }
                    
                    // 获取巡检点信息
                    const point = this.inspectionPoints.find(p => p.id === parseInt(decodedData.point_id));
                    if (!point) {
                        resolve({
                            success: false,
                            message: '巡检点不存在'
                        });
                        return;
                    }
                    
                    // 获取巡检项目
                    const items = this.inspectionItems.filter(item => item.point_id === point.id);
                    
                    resolve({
                        success: true,
                        data: {
                            ...point,
                            inspection_items: items,
                            last_inspection: this.getLastInspectionTime(point.id),
                            next_inspection: this.getNextInspectionTime(point.id, point.inspection_cycle)
                        }
                    });
                } catch (error) {
                    resolve({
                        success: false,
                        message: '二维码解析失败'
                    });
                }
            }, 500);
        });
    }

    // 获取最后巡检时间
    getLastInspectionTime(pointId) {
        const records = this.inspectionRecords
            .filter(record => record.point_id === pointId)
            .sort((a, b) => new Date(b.inspection_time) - new Date(a.inspection_time));
        
        return records.length > 0 ? records[0].inspection_time : null;
    }

    // 获取下次巡检时间
    getNextInspectionTime(pointId, cycle) {
        const lastInspection = this.getLastInspectionTime(pointId);
        if (!lastInspection) return null;
        
        const lastDate = new Date(lastInspection);
        const nextDate = new Date(lastDate.getTime() + (cycle * 24 * 60 * 60 * 1000));
        return nextDate.toISOString();
    }

    // 巡检统计相关API
    async getInspectionStatistics(params = {}) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const stats = {
                    total_points: this.inspectionPoints.length,
                    active_points: this.inspectionPoints.filter(p => p.status === 'active').length,
                    today_inspections: this.inspectionRecords.filter(r => {
                        const today = new Date().toDateString();
                        const recordDate = new Date(r.inspection_time).toDateString();
                        return today === recordDate;
                    }).length,
                    total_inspections: this.inspectionRecords.length,
                    normal_inspections: this.inspectionRecords.filter(r => r.status === 'normal').length,
                    abnormal_inspections: this.inspectionRecords.filter(r => r.status === 'abnormal').length,
                    completion_rate: 0
                };
                
                // 计算完成率
                const today = new Date();
                const thisMonth = today.getMonth();
                const thisYear = today.getFullYear();
                const daysInMonth = new Date(thisYear, thisMonth + 1, 0).getDate();
                const expectedInspections = stats.active_points * daysInMonth;
                stats.completion_rate = expectedInspections > 0 ? (stats.total_inspections / expectedInspections * 100).toFixed(1) : 0;
                
                resolve({
                    success: true,
                    data: stats
                });
            }, 300);
        });
    }

    // 生成二维码内容
    generateQRContent(pointId, expireTime = 86400000) {
        const point = this.inspectionPoints.find(p => p.id === parseInt(pointId));
        if (!point) return null;
        
        return {
            type: 'inspection_point',
            point_id: pointId,
            point_name: point.name,
            token: 'qr_' + Math.random().toString(36).substr(2, 15) + '_' + Date.now(),
            timestamp: Date.now(),
            expire_time: expireTime
        };
    }

    // 生成二维码图片URL
    async generateQRCode(pointId, expireTime = 86400000) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const content = this.generateQRContent(pointId, expireTime);
                if (!content) {
                    resolve({
                        success: false,
                        message: '巡检点不存在'
                    });
                    return;
                }
                
                // 模拟生成二维码
                const qrDataURL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
                
                resolve({
                    success: true,
                    data: {
                        qr_code: qrDataURL,
                        content: content,
                        expire_time: expireTime
                    }
                });
            }, 500);
        });
    }
}

// 创建全局API服务实例
const apiService = new ApiService();

// 导出供其他文件使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = apiService;
}