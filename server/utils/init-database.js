// require('dotenv').config(); // 临时禁用以解决依赖问题
const DatabaseManager = require('../models/database-manager');
const SecurityService = require('../services/security-service');
const logger = require('./logger');

/**
 * 数据库初始化脚本
 * 用于创建数据库表结构和插入初始数据
 */
class DatabaseInitializer {
    constructor() {
        this.dbManager = new DatabaseManager();
        this.securityService = new SecurityService();
    }

    /**
     * 初始化数据库
     */
    async init() {
        try {
            console.log('🚀 开始初始化数据库...');
            
            // 1. 初始化数据库架构
            await this.initSchema();
            
            // 2. 插入初始数据
            await this.seedData();
            
            // 3. 验证初始化结果
            await this.validateInitialization();
            
            console.log('✅ 数据库初始化完成');
            logger.info('数据库初始化成功');
            
        } catch (error) {
            console.error('❌ 数据库初始化失败:', error);
            logger.error('数据库初始化失败', { error: error.message });
            process.exit(1);
        } finally {
            this.dbManager.close();
        }
    }

    /**
     * 初始化数据库架构
     */
    async initSchema() {
        console.log('📝 创建数据库表结构...');
        
        try {
            await this.dbManager.initDatabase();
            console.log('✅ 数据库表结构创建完成');
        } catch (error) {
            throw new Error(`数据库架构初始化失败: ${error.message}`);
        }
    }

    /**
     * 插入初始数据
     */
    async seedData() {
        console.log('🌱 插入初始数据...');
        
        try {
            // 检查是否已有数据
            const userCount = this.dbManager.get('SELECT COUNT(*) as count FROM users');
            if (userCount.count > 0) {
                console.log('ℹ️  数据库已有数据，跳过初始数据插入');
                return;
            }
            
            // 插入角色数据
            await this.seedRoles();
            
            // 插入权限数据
            await this.seedPermissions();
            
            // 分配角色权限
            await this.seedRolePermissions();
            
            // 插入用户数据
            await this.seedUsers();
            
            // 分配用户角色
            await this.seedUserRoles();
            
            // 插入业务初始数据
            await this.seedBusinessData();
            
            // 插入系统配置
            await this.seedSystemConfig();
            
            console.log('✅ 初始数据插入完成');
        } catch (error) {
            throw new Error(`初始数据插入失败: ${error.message}`);
        }
    }

    /**
     * 插入角色数据
     */
    async seedRoles() {
        const roles = [
            { name: '超级管理员', description: '拥有系统所有权限' },
            { name: '安全管理员', description: '负责安全监控、风险评估、事故报告管理' },
            { name: '培训管理员', description: '负责培训管理和证书管理' },
            { name: '巡检员', description: '负责执行巡检任务' },
            { name: '普通用户', description: '只能查看基本信息' }
        ];

        for (const role of roles) {
            this.dbManager.insert('roles', role);
        }
        
        console.log('✅ 角色数据插入完成');
    }

    /**
     * 插入权限数据
     */
    async seedPermissions() {
        const permissions = [
            // 用户管理权限
            { name: 'user.view', description: '查看用户信息', module: 'user', action: 'view' },
            { name: 'user.create', description: '创建用户', module: 'user', action: 'create' },
            { name: 'user.update', description: '更新用户信息', module: 'user', action: 'update' },
            { name: 'user.delete', description: '删除用户', module: 'user', action: 'delete' },
            { name: 'user.manage', description: '管理用户权限', module: 'user', action: 'manage' },

            // 安全监控权限
            { name: 'safety.view', description: '查看安全监控数据', module: 'safety', action: 'view' },
            { name: 'safety.update', description: '更新安全监控数据', module: 'safety', action: 'update' },
            { name: 'safety.export', description: '导出安全报告', module: 'safety', action: 'export' },

            // 风险评估权限
            { name: 'risk.view', description: '查看风险评估', module: 'risk', action: 'view' },
            { name: 'risk.create', description: '创建风险评估', module: 'risk', action: 'create' },
            { name: 'risk.update', description: '更新风险评估', module: 'risk', action: 'update' },
            { name: 'risk.delete', description: '删除风险评估', module: 'risk', action: 'delete' },
            { name: 'risk.resolve', description: '处理风险', module: 'risk', action: 'resolve' },

            // 事故报告权限
            { name: 'incident.view', description: '查看事故报告', module: 'incident', action: 'view' },
            { name: 'incident.create', description: '创建事故报告', module: 'incident', action: 'create' },
            { name: 'incident.update', description: '更新事故报告', module: 'incident', action: 'update' },
            { name: 'incident.delete', description: '删除事故报告', module: 'incident', action: 'delete' },
            { name: 'incident.investigate', description: '调查事故', module: 'incident', action: 'investigate' },
            { name: 'incident.close', description: '关闭事故', module: 'incident', action: 'close' },

            // 培训管理权限
            { name: 'training.view', description: '查看培训记录', module: 'training', action: 'view' },
            { name: 'training.create', description: '创建培训记录', module: 'training', action: 'create' },
            { name: 'training.update', description: '更新培训记录', module: 'training', action: 'update' },
            { name: 'training.delete', description: '删除培训记录', module: 'training', action: 'delete' },

            // 证书管理权限
            { name: 'certificate.view', description: '查看证书信息', module: 'certificate', action: 'view' },
            { name: 'certificate.create', description: '创建证书记录', module: 'certificate', action: 'create' },
            { name: 'certificate.update', description: '更新证书记录', module: 'certificate', action: 'update' },
            { name: 'certificate.delete', description: '删除证书记录', module: 'certificate', action: 'delete' },

            // 巡检管理权限
            { name: 'inspection.view', description: '查看巡检信息', module: 'inspection', action: 'view' },
            { name: 'inspection.create', description: '创建巡检点', module: 'inspection', action: 'create' },
            { name: 'inspection.update', description: '更新巡检信息', module: 'inspection', action: 'update' },
            { name: 'inspection.delete', description: '删除巡检点', module: 'inspection', action: 'delete' },
            { name: 'inspection.execute', description: '执行巡检', module: 'inspection', action: 'execute' },
            { name: 'inspection.qr', description: '生成二维码', module: 'inspection', action: 'qr' },

            // 系统管理权限
            { name: 'system.config', description: '系统配置管理', module: 'system', action: 'config' },
            { name: 'system.logs', description: '查看系统日志', module: 'system', action: 'logs' },
            { name: 'system.backup', description: '数据备份', module: 'system', action: 'backup' }
        ];

        for (const permission of permissions) {
            this.dbManager.insert('permissions', permission);
        }
        
        console.log('✅ 权限数据插入完成');
    }

    /**
     * 分配角色权限
     */
    async seedRolePermissions() {
        // 超级管理员拥有所有权限
        const allPermissions = this.dbManager.all('SELECT id FROM permissions');
        for (const permission of allPermissions) {
            this.dbManager.insert('role_permissions', {
                role_id: 1, // 超级管理员
                permission_id: permission.id
            });
        }

        // 安全管理员权限
        const safetyPermissions = this.dbManager.all(`
            SELECT id FROM permissions 
            WHERE module IN ('safety', 'risk', 'incident') OR name = 'user.view'
        `);
        for (const permission of safetyPermissions) {
            this.dbManager.insert('role_permissions', {
                role_id: 2, // 安全管理员
                permission_id: permission.id
            });
        }

        // 培训管理员权限
        const trainingPermissions = this.dbManager.all(`
            SELECT id FROM permissions 
            WHERE module IN ('training', 'certificate') OR name = 'user.view'
        `);
        for (const permission of trainingPermissions) {
            this.dbManager.insert('role_permissions', {
                role_id: 3, // 培训管理员
                permission_id: permission.id
            });
        }

        // 巡检员权限
        const inspectionPermissions = this.dbManager.all(`
            SELECT id FROM permissions 
            WHERE module = 'inspection' OR name = 'user.view'
        `);
        for (const permission of inspectionPermissions) {
            this.dbManager.insert('role_permissions', {
                role_id: 4, // 巡检员
                permission_id: permission.id
            });
        }

        // 普通用户权限
        const userPermissions = this.dbManager.all(`
            SELECT id FROM permissions 
            WHERE name LIKE '%.view' AND module IN ('safety', 'risk', 'incident', 'training', 'certificate')
        `);
        for (const permission of userPermissions) {
            this.dbManager.insert('role_permissions', {
                role_id: 5, // 普通用户
                permission_id: permission.id
            });
        }
        
        console.log('✅ 角色权限分配完成');
    }

    /**
     * 插入用户数据
     */
    async seedUsers() {
        const users = [
            {
                username: 'admin',
                password: await this.securityService.hashPassword('admin123'),
                email: 'admin@railway.com',
                full_name: '系统管理员',
                department: '信息技术部',
                position: '系统管理员',
                status: 'active'
            },
            {
                username: 'safety',
                password: await this.securityService.hashPassword('safety123'),
                email: 'safety@railway.com',
                full_name: '张安全',
                department: '安全部',
                position: '安全管理员',
                status: 'active'
            },
            {
                username: 'training',
                password: await this.securityService.hashPassword('training123'),
                email: 'training@railway.com',
                full_name: '李培训',
                department: '培训部',
                position: '培训管理员',
                status: 'active'
            },
            {
                username: 'inspector',
                password: await this.securityService.hashPassword('inspector123'),
                email: 'inspector@railway.com',
                full_name: '王巡检',
                department: '运营部',
                position: '巡检员',
                status: 'active'
            },
            {
                username: 'user',
                password: await this.securityService.hashPassword('user123'),
                email: 'user@railway.com',
                full_name: '赵用户',
                department: '运营部',
                position: '操作员',
                status: 'active'
            }
        ];

        for (const user of users) {
            this.dbManager.insert('users', user);
        }
        
        console.log('✅ 用户数据插入完成');
    }

    /**
     * 分配用户角色
     */
    async seedUserRoles() {
        const userRoles = [
            { user_id: 1, role_id: 1 }, // admin -> 超级管理员
            { user_id: 2, role_id: 2 }, // safety -> 安全管理员
            { user_id: 3, role_id: 3 }, // training -> 培训管理员
            { user_id: 4, role_id: 4 }, // inspector -> 巡检员
            { user_id: 5, role_id: 5 }  // user -> 普通用户
        ];

        for (const userRole of userRoles) {
            this.dbManager.insert('user_roles', userRole);
        }
        
        console.log('✅ 用户角色分配完成');
    }

    /**
     * 插入业务初始数据
     */
    async seedBusinessData() {
        // 安全监控数据
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

        // 风险评估数据
        this.dbManager.insert('risk_assessments', {
            location: 'A站信号设备',
            risk_type: '设备故障',
            description: '信号机老化，存在故障风险',
            probability: 3,
            severity: 4,
            risk_level: '高风险',
            status: 'processing',
            reporter_id: 2,
            measures: '计划下月更换设备'
        });

        // 事故报告数据
        this.dbManager.insert('incident_reports', {
            incident_time: '2025-12-15 14:30:00',
            location: 'A站站台',
            incident_type: '设备故障',
            severity: '一般事故',
            description: '售票机故障导致旅客滞留',
            cause_analysis: '设备老化，维护不及时',
            measures: '已更换故障部件，加强日常维护',
            reporter_id: 2,
            status: 'closed'
        });

        // 培训记录数据
        this.dbManager.insert('training_records', {
            topic: '安全生产培训',
            training_type: '安全培训',
            training_date: '2025-12-01',
            duration: 8,
            instructor: '李培训',
            location: '培训中心',
            department: '运营部',
            participants: 25,
            pass_rate: 96.0,
            status: 'completed',
            created_by: 3
        });

        // 证书数据
        this.dbManager.insert('certificates', {
            user_id: 2,
            certificate_name: '安全管理员证',
            certificate_number: 'SAFE2024001',
            issuing_authority: '铁路安全监督管理局',
            issue_date: '2024-01-15',
            expiry_date: '2026-01-15',
            certificate_type: '安全证',
            status: 'valid'
        });

        // 巡检点数据
        this.dbManager.insert('inspection_points', {
            name: 'A站信号设备',
            type: '设备',
            location: 'A站信号机室',
            description: '铁路信号设备状态检查',
            requirements: '检查设备运行状态、指示灯、连接线路',
            inspection_cycle: 1,
            responsible_department: '技术部',
            responsible_person: '张技术',
            status: 'active',
            created_by: 1
        });

        console.log('✅ 业务初始数据插入完成');
    }

    /**
     * 插入系统配置
     */
    async seedSystemConfig() {
        const configs = [
            { config_key: 'system.name', config_value: '梁邹铁路专用线运营安全监控系统', description: '系统名称' },
            { config_key: 'system.version', config_value: '1.0.0', description: '系统版本' },
            { config_key: 'inspection.default_cycle', config_value: '1', description: '默认巡检周期(天)' },
            { config_key: 'certificate.expire_warning_days', config_value: '30', description: '证书到期预警天数' },
            { config_key: 'risk.high_threshold', config_value: '12', description: '高风险阈值' },
            { config_key: 'risk.medium_threshold', config_value: '6', description: '中等风险阈值' },
            { config_key: 'backup.retention_days', config_value: '30', description: '备份保留天数' },
            { config_key: 'session.timeout', config_value: '24', description: '会话超时时间(小时)' }
        ];

        for (const config of configs) {
            this.dbManager.insert('system_config', config);
        }
        
        console.log('✅ 系统配置插入完成');
    }

    /**
     * 验证初始化结果
     */
    async validateInitialization() {
        console.log('🔍 验证初始化结果...');
        
        const stats = this.dbManager.getStats();
        
        if (stats.success) {
            console.log('📊 数据库统计信息:');
            console.log(`   - 用户: ${stats.stats.users || 0}`);
            console.log(`   - 角色: ${stats.stats.roles || 0}`);
            console.log(`   - 权限: ${stats.stats.permissions || 0}`);
            console.log(`   - 风险评估: ${stats.stats.risk_assessments || 0}`);
            console.log(`   - 事故报告: ${stats.stats.incident_reports || 0}`);
            console.log(`   - 培训记录: ${stats.stats.training_records || 0}`);
            console.log(`   - 证书: ${stats.stats.certificates || 0}`);
            console.log(`   - 巡检点: ${stats.stats.inspection_points || 0}`);
            console.log(`   - 巡检记录: ${stats.stats.inspection_records || 0}`);
            
            // 验证关键数据
            const userCount = stats.stats.users || 0;
            const roleCount = stats.stats.roles || 0;
            
            if (userCount === 0) {
                throw new Error('用户数据初始化失败');
            }
            
            if (roleCount === 0) {
                throw new Error('角色数据初始化失败');
            }
            
            console.log('✅ 初始化验证通过');
        } else {
            throw new Error('获取数据库统计信息失败');
        }
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const initializer = new DatabaseInitializer();
    initializer.init();
}

module.exports = DatabaseInitializer;