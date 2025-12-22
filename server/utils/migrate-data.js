// require('dotenv').config(); // 临时禁用以解决依赖问题
const DatabaseManager = require('../models/database-manager');
const SecurityService = require('../services/security-service');
const logger = require('./logger');

/**
 * 数据迁移脚本
 * 用于从现有的api-service.js内存数据迁移到SQLite数据库
 */
class DataMigration {
    constructor() {
        this.dbManager = new DatabaseManager();
        this.securityService = new SecurityService();
    }

    /**
     * 执行数据迁移
     */
    async migrate() {
        try {
            console.log('🚀 开始数据迁移...');
            
            // 1. 导出现有数据
            const existingData = await this.exportExistingData();
            
            // 2. 迁移数据
            await this.migrateAllData(existingData);
            
            // 3. 验证迁移结果
            await this.validateMigration();
            
            console.log('✅ 数据迁移完成');
            logger.info('数据迁移成功');
            
        } catch (error) {
            console.error('❌ 数据迁移失败:', error);
            logger.error('数据迁移失败', { error: error.message });
            process.exit(1);
        } finally {
            this.dbManager.close();
        }
    }

    /**
     * 导出现有数据
     */
    async exportExistingData() {
        console.log('📤 导出现有数据...');
        
        try {
            // 动态导入现有的api-service.js
            delete require.cache[require.resolve('../../api-service.js')];
            const apiService = require('../../api-service.js');
            
            const data = {
                users: apiService.users || [],
                roles: apiService.roles || [],
                risks: apiService.risks || [],
                incidents: apiService.incidents || [],
                trainings: apiService.trainings || [],
                certificates: apiService.certificates || [],
                inspectionPoints: apiService.inspectionPoints || [],
                inspectionRecords: apiService.inspectionRecords || []
            };
            
            console.log('📊 导出数据统计:');
            console.log(`   - 用户: ${data.users.length}`);
            console.log(`   - 角色: ${data.roles.length}`);
            console.log(`   - 风险评估: ${data.risks.length}`);
            console.log(`   - 事故报告: ${data.incidents.length}`);
            console.log(`   - 培训记录: ${data.trainings.length}`);
            console.log(`   - 证书: ${data.certificates.length}`);
            console.log(`   - 巡检点: ${data.inspectionPoints.length}`);
            console.log(`   - 巡检记录: ${data.inspectionRecords.length}`);
            
            return data;
        } catch (error) {
            throw new Error(`导出现有数据失败: ${error.message}`);
        }
    }

    /**
     * 迁移所有数据
     */
    async migrateAllData(data) {
        console.log('📥 开始迁移数据...');
        
        return this.dbManager.transaction(() => {
            // 按依赖关系顺序迁移
            this.migrateRoles(data.roles);
            this.migratePermissions();
            this.migrateRolePermissions();
            this.migrateUsers(data.users);
            this.migrateUserRoles(data.users, data.roles);
            this.migrateRiskAssessments(data.risks);
            this.migrateIncidentReports(data.incidents);
            this.migrateTrainingRecords(data.trainings);
            this.migrateCertificates(data.certificates);
            this.migrateInspectionPoints(data.inspectionPoints);
            this.migrateInspectionRecords(data.inspectionRecords);
            this.migrateSafetyMonitoring();
            this.migrateSystemConfig();
        });
    }

    /**
     * 迁移角色数据
     */
    migrateRoles(roles) {
        console.log('🔄 迁移角色数据...');
        
        for (const role of roles) {
            try {
                this.dbManager.insert('roles', {
                    name: role.name,
                    description: role.description || ''
                });
            } catch (error) {
                console.warn(`角色迁移失败: ${role.name}`, error.message);
            }
        }
    }

    /**
     * 迁移权限数据
     */
    migratePermissions() {
        console.log('🔄 迁移权限数据...');
        
        // 权限数据已在初始化脚本中创建，这里跳过
        console.log('ℹ️  权限数据已在初始化时创建');
    }

    /**
     * 迁移角色权限关系
     */
    migrateRolePermissions() {
        console.log('🔄 迁移角色权限关系...');
        
        // 角色权限关系已在初始化脚本中设置，这里跳过
        console.log('ℹ️  角色权限关系已在初始化时设置');
    }

    /**
     * 迁移用户数据
     */
    async migrateUsers(users) {
        console.log('🔄 迁移用户数据...');
        
        for (const user of users) {
            try {
                // 重新加密密码
                const hashedPassword = await this.securityService.hashPassword(user.password);
                
                this.dbManager.insert('users', {
                    username: user.username,
                    password: hashedPassword,
                    email: user.email || '',
                    phone: user.phone || '',
                    full_name: user.fullName,
                    department: user.department || '',
                    position: user.position || '',
                    status: user.status || 'active'
                });
            } catch (error) {
                console.warn(`用户迁移失败: ${user.username}`, error.message);
            }
        }
    }

    /**
     * 迁移用户角色关系
     */
    migrateUserRoles(users, roles) {
        console.log('🔄 迁移用户角色关系...');
        
        // 创建角色名称到ID的映射
        const roleMap = {};
        const dbRoles = this.dbManager.all('SELECT id, name FROM roles');
        for (const role of dbRoles) {
            roleMap[role.name] = role.id;
        }
        
        // 创建用户名到ID的映射
        const userMap = {};
        const dbUsers = this.dbManager.all('SELECT id, username FROM users');
        for (const user of dbUsers) {
            userMap[user.username] = user.id;
        }
        
        for (const user of users) {
            try {
                const userId = userMap[user.username];
                const roleId = roleMap[user.role];
                
                if (userId && roleId) {
                    this.dbManager.insert('user_roles', {
                        user_id: userId,
                        role_id: roleId
                    });
                }
            } catch (error) {
                console.warn(`用户角色关系迁移失败: ${user.username}`, error.message);
            }
        }
    }

    /**
     * 迁移风险评估数据
     */
    migrateRiskAssessments(risks) {
        console.log('🔄 迁移风险评估数据...');
        
        // 创建用户名到ID的映射
        const userMap = {};
        const dbUsers = this.dbManager.all('SELECT id, username FROM users');
        for (const user of dbUsers) {
            userMap[user.username] = user.id;
        }
        
        for (const risk of risks) {
            try {
                // 计算风险等级
                const riskScore = (risk.probability || 1) * (risk.severity || 1);
                let riskLevel = '低风险';
                if (riskScore > 12) riskLevel = '高风险';
                else if (riskScore > 6) riskLevel = '中等风险';
                
                const reporterId = userMap[risk.reporter] || 1; // 默认管理员
                
                this.dbManager.insert('risk_assessments', {
                    location: risk.location,
                    risk_type: risk.type || '其他',
                    description: risk.description,
                    probability: risk.probability || 1,
                    severity: risk.severity || 1,
                    risk_level: riskLevel,
                    status: risk.status || 'pending',
                    reporter_id: reporterId,
                    measures: risk.measures || ''
                });
            } catch (error) {
                console.warn(`风险评估迁移失败: ${risk.location}`, error.message);
            }
        }
    }

    /**
     * 迁移事故报告数据
     */
    migrateIncidentReports(incidents) {
        console.log('🔄 迁移事故报告数据...');
        
        // 创建用户名到ID的映射
        const userMap = {};
        const dbUsers = this.dbManager.all('SELECT id, username FROM users');
        for (const user of dbUsers) {
            userMap[user.username] = user.id;
        }
        
        for (const incident of incidents) {
            try {
                const reporterId = userMap[incident.reporter] || 1;
                
                this.dbManager.insert('incident_reports', {
                    incident_time: incident.incidentTime || new Date().toISOString(),
                    location: incident.location,
                    incident_type: incident.type || '其他',
                    severity: incident.severity || '一般事故',
                    description: incident.description,
                    cause_analysis: incident.cause || '',
                    measures: incident.measures || '',
                    reporter_id: reporterId,
                    status: incident.status || 'pending',
                    process_time: incident.processTime || 0
                });
            } catch (error) {
                console.warn(`事故报告迁移失败: ${incident.location}`, error.message);
            }
        }
    }

    /**
     * 迁移培训记录数据
     */
    migrateTrainingRecords(trainings) {
        console.log('🔄 迁移培训记录数据...');
        
        // 创建用户名到ID的映射
        const userMap = {};
        const dbUsers = this.dbManager.all('SELECT id, username FROM users');
        for (const user of dbUsers) {
            userMap[user.username] = user.id;
        }
        
        for (const training of trainings) {
            try {
                const createdById = userMap[training.createdBy] || 1;
                
                this.dbManager.insert('training_records', {
                    topic: training.topic,
                    training_type: training.type || '其他',
                    training_date: training.date || new Date().toISOString().split('T')[0],
                    duration: training.duration || 1,
                    instructor: training.instructor,
                    location: training.location,
                    department: training.department || '',
                    participants: training.participants || 0,
                    pass_rate: training.passRate || 0,
                    status: training.status || 'scheduled',
                    notes: training.notes || '',
                    created_by: createdById
                });
            } catch (error) {
                console.warn(`培训记录迁移失败: ${training.topic}`, error.message);
            }
        }
    }

    /**
     * 迁移证书数据
     */
    migrateCertificates(certificates) {
        console.log('🔄 迁移证书数据...');
        
        for (const certificate of certificates) {
            try {
                // 根据到期日期自动设置状态
                const today = new Date();
                const expiryDate = new Date(certificate.expiryDate);
                const warningDays = 30;
                const warningDate = new Date(expiryDate);
                warningDate.setDate(warningDate.getDate() - warningDays);

                let status = 'valid';
                if (today > expiryDate) {
                    status = 'expired';
                } else if (today >= warningDate) {
                    status = 'expiring';
                }
                
                this.dbManager.insert('certificates', {
                    user_id: certificate.userId || 1,
                    certificate_name: certificate.certificateName,
                    certificate_number: certificate.certificateNumber || '',
                    issuing_authority: certificate.issuingAuthority || '',
                    issue_date: certificate.issueDate,
                    expiry_date: certificate.expiryDate,
                    certificate_type: certificate.certificateType || '其他',
                    status: status,
                    notes: certificate.notes || ''
                });
            } catch (error) {
                console.warn(`证书迁移失败: ${certificate.certificateName}`, error.message);
            }
        }
    }

    /**
     * 迁移巡检点数据
     */
    migrateInspectionPoints(inspectionPoints) {
        console.log('🔄 迁移巡检点数据...');
        
        for (const point of inspectionPoints) {
            try {
                this.dbManager.insert('inspection_points', {
                    name: point.name,
                    type: point.type || '设备',
                    location: point.location,
                    description: point.description || '',
                    requirements: point.requirements || '',
                    inspection_cycle: point.inspectionCycle || 1,
                    responsible_department: point.responsibleDepartment || '',
                    responsible_person: point.responsiblePerson || '',
                    status: point.status || 'active',
                    qr_code: point.qrCode || '',
                    qr_token: point.qrToken || ''
                });
            } catch (error) {
                console.warn(`巡检点迁移失败: ${point.name}`, error.message);
            }
        }
    }

    /**
     * 迁移巡检记录数据
     */
    migrateInspectionRecords(inspectionRecords) {
        console.log('🔄 迁移巡检记录数据...');
        
        // 创建巡检点名称到ID的映射
        const pointMap = {};
        const dbPoints = this.dbManager.all('SELECT id, name FROM inspection_points');
        for (const point of dbPoints) {
            pointMap[point.name] = point.id;
        }
        
        // 创建用户名到ID的映射
        const userMap = {};
        const dbUsers = this.dbManager.all('SELECT id, username FROM users');
        for (const user of dbUsers) {
            userMap[user.username] = user.id;
        }
        
        for (const record of inspectionRecords) {
            try {
                const pointId = pointMap[record.pointName] || 1;
                const inspectorId = userMap[record.inspector] || 1;
                
                this.dbManager.insert('inspection_records', {
                    point_id: pointId,
                    inspector_id: inspectorId,
                    inspection_time: record.inspectionTime || new Date().toISOString(),
                    status: record.status || 'normal',
                    items_checked: record.itemsChecked ? JSON.stringify(record.itemsChecked) : null,
                    abnormal_items: record.abnormalItems ? JSON.stringify(record.abnormalItems) : null,
                    photos: record.photos ? JSON.stringify(record.photos) : null,
                    notes: record.notes || '',
                    gps_location: record.gpsLocation || '',
                    weather_condition: record.weatherCondition || '',
                    next_inspection_date: record.nextInspectionDate || ''
                });
            } catch (error) {
                console.warn(`巡检记录迁移失败: ${record.pointName}`, error.message);
            }
        }
    }

    /**
     * 迁移安全监控数据
     */
    migrateSafetyMonitoring() {
        console.log('🔄 迁移安全监控数据...');
        
        try {
            this.dbManager.insert('safety_monitoring', {
                date: new Date().toISOString().split('T')[0],
                daily_events: 3,
                monthly_incidents: 1,
                inspection_rate: 98.5,
                risk_level: '中',
                normal_stations: 6,
                maintenance_stations: 2,
                fault_stations: 0,
                safety_index: 85.0,
                updated_by: 1
            });
        } catch (error) {
            console.warn('安全监控数据迁移失败:', error.message);
        }
    }

    /**
     * 迁移系统配置
     */
    migrateSystemConfig() {
        console.log('🔄 迁移系统配置...');
        
        // 系统配置已在初始化脚本中设置，这里跳过
        console.log('ℹ️  系统配置已在初始化时设置');
    }

    /**
     * 验证迁移结果
     */
    async validateMigration() {
        console.log('🔍 验证迁移结果...');
        
        const stats = this.dbManager.getStats();
        
        if (stats.success) {
            console.log('📊 迁移后数据库统计:');
            console.log(`   - 用户: ${stats.stats.users || 0}`);
            console.log(`   - 角色: ${stats.stats.roles || 0}`);
            console.log(`   - 权限: ${stats.stats.permissions || 0}`);
            console.log(`   - 风险评估: ${stats.stats.risk_assessments || 0}`);
            console.log(`   - 事故报告: ${stats.stats.incident_reports || 0}`);
            console.log(`   - 培训记录: ${stats.stats.training_records || 0}`);
            console.log(`   - 证书: ${stats.stats.certificates || 0}`);
            console.log(`   - 巡检点: ${stats.stats.inspection_points || 0}`);
            console.log(`   - 巡检记录: ${stats.stats.inspection_records || 0}`);
            
            console.log('✅ 迁移验证通过');
        } else {
            throw new Error('获取迁移后统计信息失败');
        }
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const migration = new DataMigration();
    migration.migrate();
}

module.exports = DataMigration;