const DatabaseManager = require('../models/database-manager');
const AuthService = require('./auth-service');

/**
 * API服务类
 * 重构后的API服务层，支持SQLite数据库操作
 */
class ApiService {
    constructor() {
        this.dbManager = new DatabaseManager();
        this.authService = new AuthService(this.dbManager);
        
        // 初始化数据库
        this.dbManager.initDatabase();
    }

    // =============================================
    // 认证相关API
    // =============================================

    /**
     * 用户登录
     */
    async login(username, password, loginInfo = {}) {
        return await this.authService.login(username, password, loginInfo);
    }

    /**
     * 用户登出
     */
    async logout(token, logoutInfo = {}) {
        return await this.authService.logout(token, logoutInfo);
    }

    /**
     * 验证令牌
     */
    verifyToken(token) {
        return this.authService.verifyToken(token);
    }

    /**
     * 刷新令牌
     */
    refreshToken(token) {
        return this.authService.refreshToken(token);
    }

    /**
     * 获取用户信息
     */
    getUserInfo(token) {
        return this.authService.getUserInfo(token);
    }

    /**
     * 修改密码
     */
    async changePassword(token, oldPassword, newPassword) {
        return await this.authService.changePassword(token, oldPassword, newPassword);
    }

    // =============================================
    // 用户管理API
    // =============================================

    /**
     * 获取用户列表
     */
    getUsers(params = {}) {
        try {
            let sql = `
                SELECT u.id, u.username, u.full_name, u.email, u.phone,
                       u.department, u.position, u.status, u.created_at, u.last_login,
                       r.name as role_name
                FROM users u
                LEFT JOIN user_roles ur ON u.id = ur.user_id
                LEFT JOIN roles r ON ur.role_id = r.id
                WHERE 1=1
            `;
            const queryParams = [];

            // 条件过滤
            if (params.status) {
                sql += ' AND u.status = ?';
                queryParams.push(params.status);
            }
            if (params.department) {
                sql += ' AND u.department = ?';
                queryParams.push(params.department);
            }
            if (params.search) {
                sql += ' AND (u.full_name LIKE ? OR u.username LIKE ?)';
                queryParams.push(`%${params.search}%`, `%${params.search}%`);
            }

            sql += ' ORDER BY u.created_at DESC';

            // 分页处理
            const page = parseInt(params.page) || 1;
            const limit = parseInt(params.limit) || 20;
            
            return this.dbManager.paginate(sql, queryParams, page, limit);
        } catch (error) {
            console.error('获取用户列表失败:', error);
            return { success: false, message: '获取用户列表失败' };
        }
    }

    /**
     * 根据ID获取用户
     */
    getUserById(id) {
        try {
            const user = this.dbManager.get(`
                SELECT u.id, u.username, u.full_name, u.email, u.phone,
                       u.department, u.position, u.status, u.created_at, u.last_login,
                       r.name as role_name, GROUP_CONCAT(p.name) as permissions
                FROM users u
                LEFT JOIN user_roles ur ON u.id = ur.user_id
                LEFT JOIN roles r ON ur.role_id = r.id
                LEFT JOIN role_permissions rp ON r.id = rp.role_id
                LEFT JOIN permissions p ON rp.permission_id = p.id
                WHERE u.id = ?
                GROUP BY u.id
            `, [id]);

            if (user && user.permissions) {
                user.permissions = user.permissions.split(',');
            }

            return {
                success: true,
                data: user
            };
        } catch (error) {
            console.error('获取用户信息失败:', error);
            return { success: false, message: '获取用户信息失败' };
        }
    }

    /**
     * 创建用户
     */
    async createUser(userData, createdBy) {
        try {
            return this.dbManager.transaction(() => {
                // 检查用户名是否已存在
                const existingUser = this.dbManager.get('SELECT id FROM users WHERE username = ?', [userData.username]);
                if (existingUser) {
                    return { success: false, message: '用户名已存在' };
                }

                // 插入用户
                const result = this.dbManager.insert('users', {
                    username: userData.username,
                    password: userData.password, // 应该是已加密的密码
                    email: userData.email,
                    phone: userData.phone,
                    full_name: userData.fullName,
                    department: userData.department,
                    position: userData.position,
                    status: userData.status || 'active',
                    created_by: createdBy
                });

                // 分配角色
                if (userData.roleId) {
                    this.dbManager.insert('user_roles', {
                        user_id: result.insertId,
                        role_id: userData.roleId,
                        assigned_by: createdBy
                    });
                }

                // 记录操作日志
                this.authService.logOperation(createdBy, 'create', 'user', `创建用户: ${userData.username}`);

                return {
                    success: true,
                    data: { id: result.insertId, ...userData }
                };
            })();
        } catch (error) {
            console.error('创建用户失败:', error);
            return { success: false, message: '创建用户失败' };
        }
    }

    /**
     * 更新用户
     */
    async updateUser(id, userData, updatedBy) {
        try {
            const updateData = {};
            if (userData.email !== undefined) updateData.email = userData.email;
            if (userData.phone !== undefined) updateData.phone = userData.phone;
            if (userData.fullName !== undefined) updateData.full_name = userData.fullName;
            if (userData.department !== undefined) updateData.department = userData.department;
            if (userData.position !== undefined) updateData.position = userData.position;
            if (userData.status !== undefined) updateData.status = userData.status;

            const result = this.dbManager.update('users', updateData, { id });

            // 更新角色
            if (userData.roleId !== undefined) {
                // 先删除现有角色
                this.dbManager.delete('user_roles', { user_id: id });
                
                // 分配新角色
                if (userData.roleId) {
                    this.dbManager.insert('user_roles', {
                        user_id: id,
                        role_id: userData.roleId,
                        assigned_by: updatedBy
                    });
                }
            }

            // 记录操作日志
            this.authService.logOperation(updatedBy, 'update', 'user', `更新用户信息: ${userData.username || id}`);

            return {
                success: true,
                changes: result.changes
            };
        } catch (error) {
            console.error('更新用户失败:', error);
            return { success: false, message: '更新用户失败' };
        }
    }

    /**
     * 删除用户
     */
    deleteUser(id, deletedBy) {
        try {
            const result = this.dbManager.delete('users', { id });
            
            // 记录操作日志
            this.authService.logOperation(deletedBy, 'delete', 'user', `删除用户: ${id}`);

            return {
                success: true,
                changes: result.changes
            };
        } catch (error) {
            console.error('删除用户失败:', error);
            return { success: false, message: '删除用户失败' };
        }
    }

    // =============================================
    // 安全监控API
    // =============================================

    /**
     * 获取安全监控数据
     */
    getSafetyData(date = null) {
        try {
            const targetDate = date || new Date().toISOString().split('T')[0];
            
            let data = this.dbManager.get('SELECT * FROM safety_monitoring WHERE date = ?', [targetDate]);
            
            // 如果当天没有数据，使用最新数据
            if (!data) {
                data = this.dbManager.get('SELECT * FROM safety_monitoring ORDER BY date DESC LIMIT 1');
            }

            // 计算站点状态
            const stations = this.dbManager.get(`
                SELECT 
                    COUNT(CASE WHEN status = 'active' THEN 1 END) as normal,
                    COUNT(CASE WHEN status = 'inactive' THEN 1 END) as maintenance,
                    COUNT(CASE WHEN status = 'fault' THEN 1 END) as fault
                FROM inspection_points
            `);

            if (data && stations) {
                data.normal_stations = stations.normal;
                data.maintenance_stations = stations.maintenance;
                data.fault_stations = stations.fault;
            }

            return {
                success: true,
                data: data || {
                    dailyEvents: 0,
                    monthlyIncidents: 0,
                    inspectionRate: 0,
                    riskLevel: '中',
                    normal_stations: 0,
                    maintenance_stations: 0,
                    fault_stations: 0,
                    safetyIndex: 0
                }
            };
        } catch (error) {
            console.error('获取安全监控数据失败:', error);
            return { success: false, message: '获取安全监控数据失败' };
        }
    }

    /**
     * 更新安全监控数据
     */
    updateSafetyData(data, updatedBy) {
        try {
            const today = new Date().toISOString().split('T')[0];
            
            const updateData = {
                daily_events: data.dailyEvents || 0,
                monthly_incidents: data.monthlyIncidents || 0,
                inspection_rate: data.inspectionRate || 0,
                risk_level: data.riskLevel || '中',
                safety_index: data.safetyIndex || 0,
                updated_by: updatedBy
            };

            const result = this.dbManager.update('safety_monitoring', updateData, { date: today });
            
            // 如果没有更新任何记录，说明当天数据不存在，需要创建
            if (result.changes === 0) {
                this.dbManager.insert('safety_monitoring', {
                    date: today,
                    ...updateData
                });
            }

            // 记录操作日志
            this.authService.logOperation(updatedBy, 'update', 'safety', '更新安全监控数据');

            return { success: true };
        } catch (error) {
            console.error('更新安全监控数据失败:', error);
            return { success: false, message: '更新安全监控数据失败' };
        }
    }

    // =============================================
    // 风险评估API
    // =============================================

    /**
     * 获取风险评估列表
     */
    getRisks(params = {}) {
        try {
            let sql = `
                SELECT r.*, u.full_name as reporter_name
                FROM risk_assessments r
                LEFT JOIN users u ON r.reporter_id = u.id
                WHERE 1=1
            `;
            const queryParams = [];

            if (params.status) {
                sql += ' AND r.status = ?';
                queryParams.push(params.status);
            }
            if (params.type) {
                sql += ' AND r.risk_type = ?';
                queryParams.push(params.type);
            }
            if (params.level) {
                sql += ' AND r.risk_level = ?';
                queryParams.push(params.level);
            }

            sql += ' ORDER BY r.created_at DESC';

            const page = parseInt(params.page) || 1;
            const limit = parseInt(params.limit) || 20;
            
            return this.dbManager.paginate(sql, queryParams, page, limit);
        } catch (error) {
            console.error('获取风险评估列表失败:', error);
            return { success: false, message: '获取风险评估列表失败' };
        }
    }

    /**
     * 创建风险评估
     */
    async createRisk(riskData, userId) {
        try {
            return this.dbManager.transaction(() => {
                // 计算风险等级
                const riskScore = riskData.probability * riskData.severity;
                let riskLevel = '低风险';
                if (riskScore > 12) riskLevel = '高风险';
                else if (riskScore > 6) riskLevel = '中等风险';

                const result = this.dbManager.insert('risk_assessments', {
                    location: riskData.location,
                    risk_type: riskData.risk_type,
                    description: riskData.description,
                    probability: riskData.probability,
                    severity: riskData.severity,
                    risk_level: riskLevel,
                    reporter_id: userId,
                    measures: riskData.measures
                });

                // 记录操作日志
                this.authService.logOperation(userId, 'create', 'risk', `创建风险评估: ${riskData.location}`);

                return {
                    success: true,
                    data: { 
                        id: result.insertId, 
                        riskLevel,
                        ...riskData 
                    }
                };
            })();
        } catch (error) {
            console.error('创建风险评估失败:', error);
            return { success: false, message: '创建风险评估失败' };
        }
    }

    /**
     * 更新风险评估
     */
    updateRisk(id, riskData, userId) {
        try {
            const updateData = {};
            if (riskData.location !== undefined) updateData.location = riskData.location;
            if (riskData.risk_type !== undefined) updateData.risk_type = riskData.risk_type;
            if (riskData.description !== undefined) updateData.description = riskData.description;
            if (riskData.probability !== undefined) updateData.probability = riskData.probability;
            if (riskData.severity !== undefined) updateData.severity = riskData.severity;
            if (riskData.status !== undefined) updateData.status = riskData.status;
            if (riskData.measures !== undefined) updateData.measures = riskData.measures;

            // 重新计算风险等级
            if (riskData.probability !== undefined && riskData.severity !== undefined) {
                const riskScore = riskData.probability * riskData.severity;
                let riskLevel = '低风险';
                if (riskScore > 12) riskLevel = '高风险';
                else if (riskScore > 6) riskLevel = '中等风险';
                updateData.risk_level = riskLevel;
            }

            // 如果状态改为已解决，记录解决时间和解决人
            if (riskData.status === 'resolved') {
                updateData.resolved_at = new Date().toISOString();
                updateData.resolved_by = userId;
            }

            const result = this.dbManager.update('risk_assessments', updateData, { id });

            // 记录操作日志
            this.authService.logOperation(userId, 'update', 'risk', `更新风险评估: ${id}`);

            return {
                success: true,
                changes: result.changes
            };
        } catch (error) {
            console.error('更新风险评估失败:', error);
            return { success: false, message: '更新风险评估失败' };
        }
    }

    /**
     * 删除风险评估
     */
    deleteRisk(id, userId) {
        try {
            const result = this.dbManager.delete('risk_assessments', { id });
            
            // 记录操作日志
            this.authService.logOperation(userId, 'delete', 'risk', `删除风险评估: ${id}`);

            return {
                success: true,
                changes: result.changes
            };
        } catch (error) {
            console.error('删除风险评估失败:', error);
            return { success: false, message: '删除风险评估失败' };
        }
    }

    // =============================================
    // 事故报告API
    // =============================================

    /**
     * 获取事故报告列表
     */
    getIncidents(params = {}) {
        try {
            let sql = `
                SELECT i.*, u.full_name as reporter_name
                FROM incident_reports i
                LEFT JOIN users u ON i.reporter_id = u.id
                WHERE 1=1
            `;
            const queryParams = [];

            if (params.status) {
                sql += ' AND i.status = ?';
                queryParams.push(params.status);
            }
            if (params.severity) {
                sql += ' AND i.severity = ?';
                queryParams.push(params.severity);
            }
            if (params.startDate) {
                sql += ' AND i.incident_time >= ?';
                queryParams.push(params.startDate);
            }
            if (params.endDate) {
                sql += ' AND i.incident_time <= ?';
                queryParams.push(params.endDate);
            }

            sql += ' ORDER BY i.incident_time DESC';

            const page = parseInt(params.page) || 1;
            const limit = parseInt(params.limit) || 20;
            
            return this.dbManager.paginate(sql, queryParams, page, limit);
        } catch (error) {
            console.error('获取事故报告列表失败:', error);
            return { success: false, message: '获取事故报告列表失败' };
        }
    }

    /**
     * 创建事故报告
     */
    createIncident(incidentData, userId) {
        try {
            const result = this.dbManager.insert('incident_reports', {
                incident_time: incidentData.incident_time,
                location: incidentData.location,
                incident_type: incidentData.incident_type,
                severity: incidentData.severity,
                description: incidentData.description,
                cause_analysis: incidentData.cause_analysis,
                measures: incidentData.measures,
                reporter_id: userId,
                status: incidentData.status || 'pending'
            });

            // 记录操作日志
            this.authService.logOperation(userId, 'create', 'incident', `创建事故报告: ${incidentData.location}`);

            return {
                success: true,
                data: { id: result.insertId, ...incidentData }
            };
        } catch (error) {
            console.error('创建事故报告失败:', error);
            return { success: false, message: '创建事故报告失败' };
        }
    }

    /**
     * 更新事故报告
     */
    updateIncident(id, incidentData, userId) {
        try {
            const updateData = {};
            if (incidentData.incident_time !== undefined) updateData.incident_time = incidentData.incident_time;
            if (incidentData.location !== undefined) updateData.location = incidentData.location;
            if (incidentData.incident_type !== undefined) updateData.incident_type = incidentData.incident_type;
            if (incidentData.severity !== undefined) updateData.severity = incidentData.severity;
            if (incidentData.description !== undefined) updateData.description = incidentData.description;
            if (incidentData.cause_analysis !== undefined) updateData.cause_analysis = incidentData.cause_analysis;
            if (incidentData.measures !== undefined) updateData.measures = incidentData.measures;
            if (incidentData.status !== undefined) updateData.status = incidentData.status;

            // 如果状态改为已关闭，记录关闭时间和关闭人
            if (incidentData.status === 'closed') {
                updateData.closed_at = new Date().toISOString();
                updateData.closed_by = userId;
            }

            const result = this.dbManager.update('incident_reports', updateData, { id });

            // 记录操作日志
            this.authService.logOperation(userId, 'update', 'incident', `更新事故报告: ${id}`);

            return {
                success: true,
                changes: result.changes
            };
        } catch (error) {
            console.error('更新事故报告失败:', error);
            return { success: false, message: '更新事故报告失败' };
        }
    }

    /**
     * 删除事故报告
     */
    deleteIncident(id, userId) {
        try {
            const result = this.dbManager.delete('incident_reports', { id });
            
            // 记录操作日志
            this.authService.logOperation(userId, 'delete', 'incident', `删除事故报告: ${id}`);

            return {
                success: true,
                changes: result.changes
            };
        } catch (error) {
            console.error('删除事故报告失败:', error);
            return { success: false, message: '删除事故报告失败' };
        }
    }

    // =============================================
    // 培训管理API
    // =============================================

    /**
     * 获取培训记录列表
     */
    getTrainings(params = {}) {
        try {
            let sql = `
                SELECT t.*, u.full_name as created_by_name
                FROM training_records t
                LEFT JOIN users u ON t.created_by = u.id
                WHERE 1=1
            `;
            const queryParams = [];

            if (params.status) {
                sql += ' AND t.status = ?';
                queryParams.push(params.status);
            }
            if (params.department) {
                sql += ' AND t.department = ?';
                queryParams.push(params.department);
            }
            if (params.startDate) {
                sql += ' AND t.training_date >= ?';
                queryParams.push(params.startDate);
            }
            if (params.endDate) {
                sql += ' AND t.training_date <= ?';
                queryParams.push(params.endDate);
            }

            sql += ' ORDER BY t.training_date DESC';

            const page = parseInt(params.page) || 1;
            const limit = parseInt(params.limit) || 20;
            
            return this.dbManager.paginate(sql, queryParams, page, limit);
        } catch (error) {
            console.error('获取培训记录列表失败:', error);
            return { success: false, message: '获取培训记录列表失败' };
        }
    }

    /**
     * 创建培训记录
     */
    createTraining(trainingData, userId) {
        try {
            const result = this.dbManager.insert('training_records', {
                topic: trainingData.topic,
                training_type: trainingData.training_type,
                training_date: trainingData.training_date,
                duration: trainingData.duration,
                instructor: trainingData.instructor,
                location: trainingData.location,
                department: trainingData.department,
                participants: trainingData.participants || 0,
                pass_rate: trainingData.pass_rate || 0,
                status: trainingData.status || 'scheduled',
                notes: trainingData.notes,
                created_by: userId
            });

            // 记录操作日志
            this.authService.logOperation(userId, 'create', 'training', `创建培训记录: ${trainingData.topic}`);

            return {
                success: true,
                data: { id: result.insertId, ...trainingData }
            };
        } catch (error) {
            console.error('创建培训记录失败:', error);
            return { success: false, message: '创建培训记录失败' };
        }
    }

    /**
     * 更新培训记录
     */
    updateTraining(id, trainingData, userId) {
        try {
            const updateData = {};
            if (trainingData.topic !== undefined) updateData.topic = trainingData.topic;
            if (trainingData.training_type !== undefined) updateData.training_type = trainingData.training_type;
            if (trainingData.training_date !== undefined) updateData.training_date = trainingData.training_date;
            if (trainingData.duration !== undefined) updateData.duration = trainingData.duration;
            if (trainingData.instructor !== undefined) updateData.instructor = trainingData.instructor;
            if (trainingData.location !== undefined) updateData.location = trainingData.location;
            if (trainingData.department !== undefined) updateData.department = trainingData.department;
            if (trainingData.participants !== undefined) updateData.participants = trainingData.participants;
            if (trainingData.pass_rate !== undefined) updateData.pass_rate = trainingData.pass_rate;
            if (trainingData.status !== undefined) updateData.status = trainingData.status;
            if (trainingData.notes !== undefined) updateData.notes = trainingData.notes;

            const result = this.dbManager.update('training_records', updateData, { id });

            // 记录操作日志
            this.authService.logOperation(userId, 'update', 'training', `更新培训记录: ${id}`);

            return {
                success: true,
                changes: result.changes
            };
        } catch (error) {
            console.error('更新培训记录失败:', error);
            return { success: false, message: '更新培训记录失败' };
        }
    }

    /**
     * 删除培训记录
     */
    deleteTraining(id, userId) {
        try {
            const result = this.dbManager.delete('training_records', { id });
            
            // 记录操作日志
            this.authService.logOperation(userId, 'delete', 'training', `删除培训记录: ${id}`);

            return {
                success: true,
                changes: result.changes
            };
        } catch (error) {
            console.error('删除培训记录失败:', error);
            return { success: false, message: '删除培训记录失败' };
        }
    }

    // =============================================
    // 证书管理API
    // =============================================

    /**
     * 获取证书列表
     */
    getCertificates(params = {}) {
        try {
            let sql = `
                SELECT c.*, u.full_name as user_name, u.department
                FROM certificates c
                LEFT JOIN users u ON c.user_id = u.id
                WHERE 1=1
            `;
            const queryParams = [];

            if (params.status) {
                sql += ' AND c.status = ?';
                queryParams.push(params.status);
            }
            if (params.type) {
                sql += ' AND c.certificate_type = ?';
                queryParams.push(params.type);
            }
            if (params.userId) {
                sql += ' AND c.user_id = ?';
                queryParams.push(params.userId);
            }
            if (params.search) {
                sql += ' AND (c.certificate_name LIKE ? OR c.certificate_number LIKE ?)';
                queryParams.push(`%${params.search}%`, `%${params.search}%`);
            }

            sql += ' ORDER BY c.expiry_date ASC';

            const page = parseInt(params.page) || 1;
            const limit = parseInt(params.limit) || 20;
            
            return this.dbManager.paginate(sql, queryParams, page, limit);
        } catch (error) {
            console.error('获取证书列表失败:', error);
            return { success: false, message: '获取证书列表失败' };
        }
    }

    /**
     * 创建证书记录
     */
    createCertificate(certificateData, userId) {
        try {
            // 检查证书编号是否已存在
            if (certificateData.certificate_number) {
                const existing = this.dbManager.get(
                    'SELECT id FROM certificates WHERE certificate_number = ?',
                    [certificateData.certificate_number]
                );
                if (existing) {
                    return { success: false, message: '证书编号已存在' };
                }
            }

            // 根据到期日期自动设置状态
            const today = new Date();
            const expiryDate = new Date(certificateData.expiry_date);
            const warningDays = 30; // 30天预警
            const warningDate = new Date(expiryDate);
            warningDate.setDate(warningDate.getDate() - warningDays);

            let status = 'valid';
            if (today > expiryDate) {
                status = 'expired';
            } else if (today >= warningDate) {
                status = 'expiring';
            }

            const result = this.dbManager.insert('certificates', {
                user_id: certificateData.user_id,
                certificate_name: certificateData.certificate_name,
                certificate_number: certificateData.certificate_number,
                issuing_authority: certificateData.issuing_authority,
                issue_date: certificateData.issue_date,
                expiry_date: certificateData.expiry_date,
                certificate_type: certificateData.certificate_type,
                status: status,
                notes: certificateData.notes
            });

            // 记录操作日志
            this.authService.logOperation(userId, 'create', 'certificate', `创建证书记录: ${certificateData.certificate_name}`);

            return {
                success: true,
                data: { id: result.insertId, status, ...certificateData }
            };
        } catch (error) {
            console.error('创建证书记录失败:', error);
            return { success: false, message: '创建证书记录失败' };
        }
    }

    /**
     * 更新证书记录
     */
    updateCertificate(id, certificateData, userId) {
        try {
            const updateData = {};
            if (certificateData.user_id !== undefined) updateData.user_id = certificateData.user_id;
            if (certificateData.certificate_name !== undefined) updateData.certificate_name = certificateData.certificate_name;
            if (certificateData.certificate_number !== undefined) updateData.certificate_number = certificateData.certificate_number;
            if (certificateData.issuing_authority !== undefined) updateData.issuing_authority = certificateData.issuing_authority;
            if (certificateData.issue_date !== undefined) updateData.issue_date = certificateData.issue_date;
            if (certificateData.expiry_date !== undefined) updateData.expiry_date = certificateData.expiry_date;
            if (certificateData.certificate_type !== undefined) updateData.certificate_type = certificateData.certificate_type;
            if (certificateData.notes !== undefined) updateData.notes = certificateData.notes;

            // 如果更新了到期日期，重新计算状态
            if (certificateData.expiry_date !== undefined) {
                const today = new Date();
                const expiryDate = new Date(certificateData.expiry_date);
                const warningDays = 30;
                const warningDate = new Date(expiryDate);
                warningDate.setDate(warningDate.getDate() - warningDays);

                let status = 'valid';
                if (today > expiryDate) {
                    status = 'expired';
                } else if (today >= warningDate) {
                    status = 'expiring';
                }
                updateData.status = status;
            }

            const result = this.dbManager.update('certificates', updateData, { id });

            // 记录操作日志
            this.authService.logOperation(userId, 'update', 'certificate', `更新证书记录: ${id}`);

            return {
                success: true,
                changes: result.changes
            };
        } catch (error) {
            console.error('更新证书记录失败:', error);
            return { success: false, message: '更新证书记录失败' };
        }
    }

    /**
     * 删除证书记录
     */
    deleteCertificate(id, userId) {
        try {
            const result = this.dbManager.delete('certificates', { id });
            
            // 记录操作日志
            this.authService.logOperation(userId, 'delete', 'certificate', `删除证书记录: ${id}`);

            return {
                success: true,
                changes: result.changes
            };
        } catch (error) {
            console.error('删除证书记录失败:', error);
            return { success: false, message: '删除证书记录失败' };
        }
    }

    // =============================================
    // 巡检管理API
    // =============================================

    /**
     * 获取巡检点列表
     */
    getInspectionPoints(params = {}) {
        try {
            let sql = `
                SELECT p.*, 
                       (SELECT COUNT(*) FROM inspection_records r WHERE r.point_id = p.id AND r.inspection_time >= date('now', '-7 days')) as recent_inspections
                FROM inspection_points p
                WHERE 1=1
            `;
            const queryParams = [];

            if (params.status) {
                sql += ' AND p.status = ?';
                queryParams.push(params.status);
            }
            if (params.type) {
                sql += ' AND p.type = ?';
                queryParams.push(params.type);
            }
            if (params.search) {
                sql += ' AND (p.name LIKE ? OR p.location LIKE ?)';
                queryParams.push(`%${params.search}%`, `%${params.search}%`);
            }

            sql += ' ORDER BY p.created_at DESC';

            const page = parseInt(params.page) || 1;
            const limit = parseInt(params.limit) || 20;
            
            return this.dbManager.paginate(sql, queryParams, page, limit);
        } catch (error) {
            console.error('获取巡检点列表失败:', error);
            return { success: false, message: '获取巡检点列表失败' };
        }
    }

    /**
     * 创建巡检点
     */
    createInspectionPoint(pointData, userId) {
        try {
            const result = this.dbManager.insert('inspection_points', {
                name: pointData.name,
                type: pointData.type,
                location: pointData.location,
                description: pointData.description,
                requirements: pointData.requirements,
                inspection_cycle: pointData.inspection_cycle || 1,
                responsible_department: pointData.responsible_department,
                responsible_person: pointData.responsible_person,
                status: pointData.status || 'active',
                created_by: userId
            });

            // 创建巡检项目
            if (pointData.items && Array.isArray(pointData.items)) {
                pointData.items.forEach((item, index) => {
                    this.dbManager.insert('inspection_items', {
                        point_id: result.insertId,
                        item_name: item.item_name,
                        item_type: item.item_type || 'checkbox',
                        required: item.required || 0,
                        sort_order: index
                    });
                });
            }

            // 记录操作日志
            this.authService.logOperation(userId, 'create', 'inspection', `创建巡检点: ${pointData.name}`);

            return {
                success: true,
                data: { id: result.insertId, ...pointData }
            };
        } catch (error) {
            console.error('创建巡检点失败:', error);
            return { success: false, message: '创建巡检点失败' };
        }
    }

    /**
     * 更新巡检点
     */
    updateInspectionPoint(id, pointData, userId) {
        try {
            const updateData = {};
            if (pointData.name !== undefined) updateData.name = pointData.name;
            if (pointData.type !== undefined) updateData.type = pointData.type;
            if (pointData.location !== undefined) updateData.location = pointData.location;
            if (pointData.description !== undefined) updateData.description = pointData.description;
            if (pointData.requirements !== undefined) updateData.requirements = pointData.requirements;
            if (pointData.inspection_cycle !== undefined) updateData.inspection_cycle = pointData.inspection_cycle;
            if (pointData.responsible_department !== undefined) updateData.responsible_department = pointData.responsible_department;
            if (pointData.responsible_person !== undefined) updateData.responsible_person = pointData.responsible_person;
            if (pointData.status !== undefined) updateData.status = pointData.status;

            const result = this.dbManager.update('inspection_points', updateData, { id });

            // 更新巡检项目
            if (pointData.items && Array.isArray(pointData.items)) {
                // 先删除原有项目
                this.dbManager.delete('inspection_items', { point_id: id });
                
                // 重新创建项目
                pointData.items.forEach((item, index) => {
                    this.dbManager.insert('inspection_items', {
                        point_id: id,
                        item_name: item.item_name,
                        item_type: item.item_type || 'checkbox',
                        required: item.required || 0,
                        sort_order: index
                    });
                });
            }

            // 记录操作日志
            this.authService.logOperation(userId, 'update', 'inspection', `更新巡检点: ${id}`);

            return {
                success: true,
                changes: result.changes
            };
        } catch (error) {
            console.error('更新巡检点失败:', error);
            return { success: false, message: '更新巡检点失败' };
        }
    }

    /**
     * 删除巡检点
     */
    deleteInspectionPoint(id, userId) {
        try {
            const result = this.dbManager.delete('inspection_points', { id });
            
            // 记录操作日志
            this.authService.logOperation(userId, 'delete', 'inspection', `删除巡检点: ${id}`);

            return {
                success: true,
                changes: result.changes
            };
        } catch (error) {
            console.error('删除巡检点失败:', error);
            return { success: false, message: '删除巡检点失败' };
        }
    }

    /**
     * 获取巡检记录列表
     */
    getInspectionRecords(params = {}) {
        try {
            let sql = `
                SELECT r.*, p.name as point_name, p.location as point_location,
                       u.full_name as inspector_name
                FROM inspection_records r
                LEFT JOIN inspection_points p ON r.point_id = p.id
                LEFT JOIN users u ON r.inspector_id = u.id
                WHERE 1=1
            `;
            const queryParams = [];

            if (params.pointId) {
                sql += ' AND r.point_id = ?';
                queryParams.push(params.pointId);
            }
            if (params.inspectorId) {
                sql += ' AND r.inspector_id = ?';
                queryParams.push(params.inspectorId);
            }
            if (params.status) {
                sql += ' AND r.status = ?';
                queryParams.push(params.status);
            }
            if (params.startDate) {
                sql += ' AND r.inspection_time >= ?';
                queryParams.push(params.startDate);
            }
            if (params.endDate) {
                sql += ' AND r.inspection_time <= ?';
                queryParams.push(params.endDate);
            }

            sql += ' ORDER BY r.inspection_time DESC';

            const page = parseInt(params.page) || 1;
            const limit = parseInt(params.limit) || 20;
            
            return this.dbManager.paginate(sql, queryParams, page, limit);
        } catch (error) {
            console.error('获取巡检记录列表失败:', error);
            return { success: false, message: '获取巡检记录列表失败' };
        }
    }

    /**
     * 创建巡检记录
     */
    createInspectionRecord(recordData, userId) {
        try {
            // 计算下次巡检日期
            const point = this.dbManager.get('SELECT inspection_cycle FROM inspection_points WHERE id = ?', [recordData.point_id]);
            const nextInspectionDate = new Date();
            if (point && point.inspection_cycle) {
                nextInspectionDate.setDate(nextInspectionDate.getDate() + point.inspection_cycle);
            }

            const result = this.dbManager.insert('inspection_records', {
                point_id: recordData.point_id,
                inspector_id: userId,
                inspection_time: recordData.inspection_time || new Date().toISOString(),
                status: recordData.status || 'normal',
                items_checked: recordData.items_checked ? JSON.stringify(recordData.items_checked) : null,
                abnormal_items: recordData.abnormal_items ? JSON.stringify(recordData.abnormal_items) : null,
                photos: recordData.photos ? JSON.stringify(recordData.photos) : null,
                notes: recordData.notes,
                gps_location: recordData.gps_location,
                weather_condition: recordData.weather_condition,
                next_inspection_date: nextInspectionDate.toISOString().split('T')[0]
            });

            // 记录操作日志
            this.authService.logOperation(userId, 'create', 'inspection', `创建巡检记录: ${recordData.point_id}`);

            return {
                success: true,
                data: { id: result.insertId, ...recordData }
            };
        } catch (error) {
            console.error('创建巡检记录失败:', error);
            return { success: false, message: '创建巡检记录失败' };
        }
    }

    /**
     * 生成二维码
     */
    generateQRCode(pointId, userId) {
        try {
            const point = this.dbManager.get('SELECT * FROM inspection_points WHERE id = ?', [pointId]);
            if (!point) {
                return { success: false, message: '巡检点不存在' };
            }

            // 生成唯一的二维码令牌
            const token = 'qr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            const expireTime = new Date();
            expireTime.setHours(expireTime.getHours() + 24); // 24小时后过期

            // 更新巡检点的二维码信息
            this.dbManager.update('inspection_points', {
                qr_token: token,
                qr_expire_time: expireTime.toISOString()
            }, { id: pointId });

            // 生成二维码内容（这里简化处理，实际应用中需要使用二维码生成库）
            const qrContent = JSON.stringify({
                type: 'inspection_point',
                pointId: pointId,
                token: token,
                timestamp: new Date().toISOString()
            });

            // 记录操作日志
            this.authService.logOperation(userId, 'generate_qr', 'inspection', `生成二维码: ${point.name}`);

            return {
                success: true,
                data: {
                    pointId,
                    token,
                    qrContent,
                    expireTime: expireTime.toISOString(),
                    pointName: point.name,
                    location: point.location
                }
            };
        } catch (error) {
            console.error('生成二维码失败:', error);
            return { success: false, message: '生成二维码失败' };
        }
    }

    /**
     * 验证二维码
     */
    verifyQRCode(token, scanInfo = {}) {
        try {
            // 查询巡检点信息
            const point = this.dbManager.get(`
                SELECT p.*, i.item_name, i.item_type, i.required, i.sort_order
                FROM inspection_points p
                LEFT JOIN inspection_items i ON p.id = i.point_id
                WHERE p.qr_token = ? AND p.status = 'active'
            `, [token]);

            if (!point) {
                return { success: false, message: '二维码无效或巡检点不存在' };
            }

            // 检查二维码是否过期
            if (point.qr_expire_time && new Date() > new Date(point.qr_expire_time)) {
                return { success: false, message: '二维码已过期' };
            }

            // 获取巡检项目
            const items = this.dbManager.all(`
                SELECT * FROM inspection_items 
                WHERE point_id = ? 
                ORDER BY sort_order
            `, [point.id]);

            // 获取最近一次巡检记录
            const lastRecord = this.dbManager.get(`
                SELECT * FROM inspection_records 
                WHERE point_id = ? 
                ORDER BY inspection_time DESC 
                LIMIT 1
            `, [point.id]);

            // 记录扫码日志
            this.dbManager.insert('qr_code_logs', {
                point_id: point.id,
                qr_token: token,
                scan_time: new Date().toISOString(),
                scanner_id: scanInfo.scannerId || null,
                gps_location: scanInfo.gpsLocation || '',
                device_info: scanInfo.deviceInfo || '',
                ip_address: scanInfo.ipAddress || '',
                scan_result: 'success'
            });

            return {
                success: true,
                data: {
                    pointId: point.id,
                    pointName: point.name,
                    location: point.location,
                    description: point.description,
                    requirements: point.requirements,
                    inspectionItems: items,
                    lastInspection: lastRecord ? lastRecord.inspection_time : null,
                    nextInspection: lastRecord ? lastRecord.next_inspection_date : null
                }
            };
        } catch (error) {
            console.error('验证二维码失败:', error);
            return { success: false, message: '验证二维码失败' };
        }
    }

    // =============================================
    // 系统管理API
    // =============================================

    /**
     * 获取系统统计信息
     */
    getSystemStats() {
        try {
            return this.dbManager.getStats();
        } catch (error) {
            console.error('获取系统统计信息失败:', error);
            return { success: false, message: '获取系统统计信息失败' };
        }
    }

    /**
     * 获取操作日志
     */
    getOperationLogs(params = {}) {
        try {
            let sql = `
                SELECT l.*, u.full_name as user_name
                FROM operation_logs l
                LEFT JOIN users u ON l.user_id = u.id
                WHERE 1=1
            `;
            const queryParams = [];

            if (params.userId) {
                sql += ' AND l.user_id = ?';
                queryParams.push(params.userId);
            }
            if (params.module) {
                sql += ' AND l.module = ?';
                queryParams.push(params.module);
            }
            if (params.action) {
                sql += ' AND l.action = ?';
                queryParams.push(params.action);
            }
            if (params.startDate) {
                sql += ' AND l.created_at >= ?';
                queryParams.push(params.startDate);
            }
            if (params.endDate) {
                sql += ' AND l.created_at <= ?';
                queryParams.push(params.endDate);
            }

            sql += ' ORDER BY l.created_at DESC';

            const page = parseInt(params.page) || 1;
            const limit = parseInt(params.limit) || 50;
            
            return this.dbManager.paginate(sql, queryParams, page, limit);
        } catch (error) {
            console.error('获取操作日志失败:', error);
            return { success: false, message: '获取操作日志失败' };
        }
    }

    /**
     * 数据库备份
     */
    backupDatabase(userId) {
        try {
            const backupResult = this.dbManager.backup();
            
            // 记录操作日志
            this.authService.logOperation(userId, 'backup', 'system', `数据库备份: ${backupResult.backupPath}`);

            return {
                success: true,
                backupPath: backupResult.backupPath,
                timestamp: backupResult.timestamp
            };
        } catch (error) {
            console.error('数据库备份失败:', error);
            return { success: false, message: '数据库备份失败' };
        }
    }

    /**
     * 数据库健康检查
     */
    healthCheck() {
        try {
            return this.dbManager.healthCheck();
        } catch (error) {
            console.error('数据库健康检查失败:', error);
            return { success: false, message: '数据库健康检查失败' };
        }
    }

    /**
     * 关闭服务
     */
    close() {
        try {
            this.dbManager.close();
            console.log('API服务已关闭');
        } catch (error) {
            console.error('关闭API服务失败:', error);
        }
    }
}

module.exports = ApiService;