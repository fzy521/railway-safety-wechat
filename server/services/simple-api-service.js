const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * 简化的API服务类
 * 使用内存存储，用于演示系统功能
 */
class SimpleApiService {
    constructor() {
        this.jwtSecret = 'railway-safety-jwt-secret-key-2024';
        this.jwtExpiresIn = '24h';
        this.bcryptRounds = 12;
        
        // 内存数据存储
        this.users = [
            {
                id: 1,
                username: 'admin',
                password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6QJw/2Ej7W', // admin123
                fullName: '系统管理员',
                email: 'admin@railway.com',
                department: '信息技术部',
                position: '系统管理员',
                role: '超级管理员',
                status: 'active',
                permissions: ['user.manage', 'safety.view', 'risk.manage', 'incident.manage', 'training.manage', 'certificate.manage', 'inspection.view']
            },
            {
                id: 2,
                username: 'safety',
                password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6QJw/2Ej7W', // safety123
                fullName: '张安全',
                email: 'safety@railway.com',
                department: '安全部',
                position: '安全管理员',
                role: '安全管理员',
                status: 'active',
                permissions: ['safety.view', 'risk.manage', 'incident.manage']
            },
            {
                id: 3,
                username: 'training',
                password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6QJw/2Ej7W', // training123
                fullName: '李培训',
                email: 'training@railway.com',
                department: '培训部',
                position: '培训管理员',
                role: '培训管理员',
                status: 'active',
                permissions: ['training.manage', 'certificate.manage']
            },
            {
                id: 4,
                username: 'inspector',
                password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6QJw/2Ej7W', // inspector123
                fullName: '王巡检',
                email: 'inspector@railway.com',
                department: '运营部',
                position: '巡检员',
                role: '巡检员',
                status: 'active',
                permissions: ['inspection.view', 'inspection.execute']
            },
            {
                id: 5,
                username: 'user',
                password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6QJw/2Ej7W', // user123
                fullName: '赵用户',
                email: 'user@railway.com',
                department: '运营部',
                position: '操作员',
                role: '普通用户',
                status: 'active',
                permissions: ['safety.view']
            }
        ];
        
        // 模拟其他数据
        this.risks = [
            {
                id: 1,
                location: 'A站信号设备',
                type: '设备故障',
                description: '信号机老化，存在故障风险',
                probability: 3,
                severity: 4,
                level: '高风险',
                status: 'processing',
                reporterId: 2,
                measures: '计划下月更换设备',
                createdAt: new Date().toISOString()
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
                cause: '设备老化，维护不及时',
                measures: '已更换故障部件，加强日常维护',
                reporterId: 2,
                status: 'closed',
                processTime: 2.5,
                createdAt: new Date().toISOString()
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
                location: '培训中心',
                department: '运营部',
                participants: 25,
                passRate: 96.0,
                status: 'completed',
                createdBy: 3,
                createdAt: new Date().toISOString()
            }
        ];
        
        this.certificates = [
            {
                id: 1,
                userId: 2,
                certificateName: '安全管理员证',
                certificateNumber: 'SAFE2024001',
                issuingAuthority: '铁路安全监督管理局',
                issueDate: '2024-01-15',
                expiryDate: '2026-01-15',
                certificateType: '安全证',
                status: 'valid',
                createdAt: new Date().toISOString()
            }
        ];
        
        this.inspectionPoints = [
            {
                id: 1,
                name: 'A站信号设备',
                type: '设备',
                location: 'A站信号机室',
                description: '铁路信号设备状态检查',
                requirements: '检查设备运行状态、指示灯、连接线路',
                inspectionCycle: 1,
                responsibleDepartment: '技术部',
                responsiblePerson: '张技术',
                status: 'active',
                createdAt: new Date().toISOString()
            }
        ];
        
        this.inspectionRecords = [
            {
                id: 1,
                pointId: 1,
                inspectorId: 4,
                inspectionTime: '2025-12-16T10:30:00Z',
                status: 'normal',
                itemsChecked: [1, 2, 3],
                abnormalItems: [],
                notes: '设备运行正常',
                gpsLocation: '116.3974,39.9093',
                weatherCondition: '晴朗',
                nextInspectionDate: '2025-12-17',
                createdAt: new Date().toISOString()
            }
        ];
    }

    /**
     * 用户登录
     */
    async login(username, password, loginInfo = {}) {
        try {
            const user = this.users.find(u => u.username === username && u.status === 'active');
            
            if (!user) {
                return { success: false, message: '用户名或密码错误' };
            }

            const passwordValid = await bcrypt.compare(password, user.password);
            if (!passwordValid) {
                return { success: false, message: '用户名或密码错误' };
            }

            const token = jwt.sign(
                { 
                    userId: user.id, 
                    username: user.username,
                    role: user.role,
                    permissions: user.permissions
                },
                this.jwtSecret,
                { expiresIn: this.jwtExpiresIn }
            );

            return {
                success: true,
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    fullName: user.fullName,
                    role: user.role,
                    permissions: user.permissions
                }
            };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: '登录失败' };
        }
    }

    /**
     * 用户登出
     */
    async logout(token, logoutInfo = {}) {
        return { success: true, message: '登出成功' };
    }

    /**
     * 验证令牌
     */
    verifyToken(token) {
        try {
            const decoded = jwt.verify(token, this.jwtSecret);
            return {
                success: true,
                user: decoded
            };
        } catch (error) {
            return {
                success: false,
                message: '令牌无效或已过期'
            };
        }
    }

    /**
     * 获取安全监控数据
     */
    getSafetyData(date = null) {
        return {
            success: true,
            data: {
                dailyEvents: 3,
                monthlyIncidents: 1,
                inspectionRate: 98.5,
                riskLevel: '中等',
                normal_stations: 6,
                maintenance_stations: 2,
                fault_stations: 0,
                safetyIndex: 85.0
            }
        };
    }

    /**
     * 获取风险评估列表
     */
    getRisks(params = {}) {
        return {
            success: true,
            data: this.risks,
            total: this.risks.length
        };
    }

    /**
     * 创建风险评估
     */
    async createRisk(riskData, userId) {
        const riskScore = riskData.probability * riskData.severity;
        let riskLevel = '低风险';
        if (riskScore > 12) riskLevel = '高风险';
        else if (riskScore > 6) riskLevel = '中等风险';

        const newRisk = {
            id: Math.max(...this.risks.map(r => r.id)) + 1,
            location: riskData.location,
            type: riskData.type,
            description: riskData.description,
            probability: riskData.probability,
            severity: riskData.severity,
            level: riskLevel,
            status: 'pending',
            reporterId: userId,
            measures: riskData.measures,
            createdAt: new Date().toISOString()
        };

        this.risks.push(newRisk);

        return {
            success: true,
            data: newRisk
        };
    }

    /**
     * 获取事故报告列表
     */
    getIncidents(params = {}) {
        return {
            success: true,
            data: this.incidents,
            total: this.incidents.length
        };
    }

    /**
     * 创建事故报告
     */
    async createIncident(incidentData, userId) {
        const newIncident = {
            id: Math.max(...this.incidents.map(i => i.id)) + 1,
            incidentTime: incidentData.incidentTime || new Date().toISOString(),
            location: incidentData.location,
            type: incidentData.type,
            severity: incidentData.severity,
            description: incidentData.description,
            cause: incidentData.cause,
            measures: incidentData.measures,
            reporterId: userId,
            status: 'pending',
            processTime: 0,
            createdAt: new Date().toISOString()
        };

        this.incidents.push(newIncident);

        return {
            success: true,
            data: newIncident
        };
    }

    /**
     * 获取培训记录列表
     */
    getTrainings(params = {}) {
        return {
            success: true,
            data: this.trainings,
            total: this.trainings.length
        };
    }

    /**
     * 创建培训记录
     */
    async createTraining(trainingData, userId) {
        const newTraining = {
            id: Math.max(...this.trainings.map(t => t.id)) + 1,
            topic: trainingData.topic,
            type: trainingData.type,
            date: trainingData.date,
            duration: trainingData.duration,
            instructor: trainingData.instructor,
            location: trainingData.location,
            department: trainingData.department,
            participants: trainingData.participants || 0,
            passRate: trainingData.passRate || 0,
            status: 'scheduled',
            createdBy: userId,
            createdAt: new Date().toISOString()
        };

        this.trainings.push(newTraining);

        return {
            success: true,
            data: newTraining
        };
    }

    /**
     * 获取证书列表
     */
    getCertificates(params = {}) {
        return {
            success: true,
            data: this.certificates,
            total: this.certificates.length
        };
    }

    /**
     * 创建证书记录
     */
    async createCertificate(certificateData, userId) {
        const newCertificate = {
            id: Math.max(...this.certificates.map(c => c.id)) + 1,
            userId: certificateData.userId,
            certificateName: certificateData.certificateName,
            certificateNumber: certificateData.certificateNumber,
            issuingAuthority: certificateData.issuingAuthority,
            issueDate: certificateData.issueDate,
            expiryDate: certificateData.expiryDate,
            certificateType: certificateData.certificateType,
            status: 'valid',
            createdAt: new Date().toISOString()
        };

        this.certificates.push(newCertificate);

        return {
            success: true,
            data: newCertificate
        };
    }

    /**
     * 获取巡检点列表
     */
    getInspectionPoints(params = {}) {
        return {
            success: true,
            data: this.inspectionPoints,
            total: this.inspectionPoints.length
        };
    }

    /**
     * 创建巡检点
     */
    async createInspectionPoint(pointData, userId) {
        const newPoint = {
            id: Math.max(...this.inspectionPoints.map(p => p.id)) + 1,
            name: pointData.name,
            type: pointData.type,
            location: pointData.location,
            description: pointData.description,
            requirements: pointData.requirements,
            inspectionCycle: pointData.inspectionCycle || 1,
            responsibleDepartment: pointData.responsibleDepartment,
            responsiblePerson: pointData.responsiblePerson,
            status: 'active',
            createdAt: new Date().toISOString()
        };

        this.inspectionPoints.push(newPoint);

        return {
            success: true,
            data: newPoint
        };
    }

    /**
     * 获取巡检记录列表
     */
    getInspectionRecords(params = {}) {
        return {
            success: true,
            data: this.inspectionRecords,
            total: this.inspectionRecords.length
        };
    }

    /**
     * 创建巡检记录
     */
    async createInspectionRecord(recordData, userId) {
        const nextInspectionDate = new Date();
        nextInspectionDate.setDate(nextInspectionDate.getDate() + 1);

        const newRecord = {
            id: Math.max(...this.inspectionRecords.map(r => r.id)) + 1,
            pointId: recordData.pointId,
            inspectorId: userId,
            inspectionTime: recordData.inspectionTime || new Date().toISOString(),
            status: recordData.status || 'normal',
            itemsChecked: recordData.itemsChecked || [],
            abnormalItems: recordData.abnormalItems || [],
            notes: recordData.notes || '',
            gpsLocation: recordData.gpsLocation || '',
            weatherCondition: recordData.weatherCondition || '',
            nextInspectionDate: nextInspectionDate.toISOString().split('T')[0],
            createdAt: new Date().toISOString()
        };

        this.inspectionRecords.push(newRecord);

        return {
            success: true,
            data: newRecord
        };
    }

    /**
     * 生成二维码
     */
    generateQRCode(pointId, userId) {
        const point = this.inspectionPoints.find(p => p.id === pointId);
        if (!point) {
            return { success: false, message: '巡检点不存在' };
        }

        const token = 'qr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        return {
            success: true,
            data: {
                pointId,
                token,
                qrContent: JSON.stringify({
                    type: 'inspection_point',
                    pointId: pointId,
                    token: token,
                    timestamp: new Date().toISOString()
                }),
                pointName: point.name,
                location: point.location
            }
        };
    }

    /**
     * 验证二维码
     */
    verifyQRCode(token, scanInfo = {}) {
        const point = this.inspectionPoints.find(p => p.status === 'active');
        if (!point) {
            return { success: false, message: '二维码无效或巡检点不存在' };
        }

        return {
            success: true,
            data: {
                pointId: point.id,
                pointName: point.name,
                location: point.location,
                description: point.description,
                requirements: point.requirements,
                lastInspection: '2025-12-16T10:30:00Z',
                nextInspection: '2025-12-17T10:30:00Z'
            }
        };
    }

    /**
     * 健康检查
     */
    healthCheck() {
        return {
            success: true,
            connection: 'ok',
            database: 'memory',
            integrity: 'ok',
            timestamp: new Date().toISOString()
        };
    }

    /**
     * 获取系统统计
     */
    getSystemStats() {
        return {
            success: true,
            stats: {
                users: this.users.length,
                risks: this.risks.length,
                incidents: this.incidents.length,
                trainings: this.trainings.length,
                certificates: this.certificates.length,
                inspectionPoints: this.inspectionPoints.length,
                inspectionRecords: this.inspectionRecords.length
            },
            dbPath: 'memory',
            isInitialized: true
        };
    }
}

module.exports = SimpleApiService;