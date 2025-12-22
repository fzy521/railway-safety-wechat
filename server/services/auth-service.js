const SecurityService = require('./security-service');

/**
 * 认证服务类
 * 负责用户认证、权限验证、会话管理等功能
 */
class AuthService {
    constructor(dbManager) {
        this.db = dbManager;
        this.securityService = new SecurityService();
        this.activeSessions = new Map(); // 存储活跃会话
    }

    /**
     * 用户登录
     * @param {string} username - 用户名
     * @param {string} password - 密码
     * @param {Object} loginInfo - 登录信息(IP、User-Agent等)
     * @returns {Object} - 登录结果
     */
    async login(username, password, loginInfo = {}) {
        try {
            // 输入验证
            const usernameValidation = this.securityService.validateInput(username, 'username');
            if (!usernameValidation.valid) {
                return { success: false, message: usernameValidation.message };
            }

            // 检查登录尝试次数
            const attemptCheck = this.securityService.checkLoginAttempts(username);
            if (!attemptCheck.allowed) {
                this.recordLoginAttempt(username, false, loginInfo);
                return {
                    success: false,
                    message: attemptCheck.message,
                    locked: attemptCheck.locked,
                    lockTimeRemaining: attemptCheck.lockTimeRemaining
                };
            }

            // 查询用户信息
            const userQuery = `
                SELECT u.*, 
                       r.id as role_id, r.name as role_name,
                       GROUP_CONCAT(p.name) as permissions
                FROM users u
                LEFT JOIN user_roles ur ON u.id = ur.user_id
                LEFT JOIN roles r ON ur.role_id = r.id
                LEFT JOIN role_permissions rp ON r.id = rp.role_id
                LEFT JOIN permissions p ON rp.permission_id = p.id
                WHERE u.username = ? AND u.status = 'active'
                GROUP BY u.id
            `;
            
            const user = this.db.get(userQuery, [username]);
            
            if (!user) {
                this.recordLoginAttempt(username, false, loginInfo);
                return { success: false, message: '用户名或密码错误' };
            }

            // 验证密码
            const passwordValid = await this.securityService.verifyPassword(password, user.password);
            if (!passwordValid) {
                this.recordLoginAttempt(username, false, loginInfo);
                return { success: false, message: '用户名或密码错误' };
            }

            // 生成JWT令牌
            const tokenPayload = {
                id: user.id,
                username: user.username,
                roleId: user.role_id,
                roleName: user.role_name,
                permissions: user.permissions ? user.permissions.split(',') : []
            };
            
            const token = this.securityService.generateToken(tokenPayload);
            
            // 更新最后登录时间
            this.db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);
            
            // 记录登录成功
            this.recordLoginAttempt(username, true, loginInfo);
            this.logOperation(user.id, 'login', 'auth', '用户登录', loginInfo);
            
            // 存储会话信息
            this.storeSession(user.id, {
                token,
                loginTime: new Date().toISOString(),
                loginInfo
            });

            return {
                success: true,
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    fullName: user.full_name,
                    email: user.email,
                    department: user.department,
                    position: user.position,
                    role: user.role_name,
                    roleId: user.role_id,
                    permissions: user.permissions ? user.permissions.split(',') : [],
                    lastLogin: user.last_login
                }
            };
        } catch (error) {
            console.error('登录失败:', error);
            return { success: false, message: '登录过程中发生错误' };
        }
    }

    /**
     * 用户登出
     * @param {string} token - JWT令牌
     * @param {Object} logoutInfo - 登出信息
     * @returns {Object} - 登出结果
     */
    async logout(token, logoutInfo = {}) {
        try {
            const tokenValidation = this.securityService.verifyToken(token);
            if (!tokenValidation.success) {
                return { success: false, message: '无效的令牌' };
            }

            const user = tokenValidation.user;
            
            // 移除会话
            this.removeSession(user.userId);
            
            // 记录登出操作
            this.logOperation(user.userId, 'logout', 'auth', '用户登出', logoutInfo);
            
            return { success: true, message: '登出成功' };
        } catch (error) {
            console.error('登出失败:', error);
            return { success: false, message: '登出过程中发生错误' };
        }
    }

    /**
     * 验证令牌
     * @param {string} token - JWT令牌
     * @returns {Object} - 验证结果
     */
    verifyToken(token) {
        try {
            const tokenValidation = this.securityService.verifyToken(token);
            if (!tokenValidation.success) {
                return tokenValidation;
            }

            const user = tokenValidation.user;
            
            // 检查会话是否有效
            const session = this.getSession(user.userId);
            if (!session || session.token !== token) {
                return { success: false, message: '会话已失效' };
            }

            // 检查用户状态
            const userStatus = this.db.get('SELECT status FROM users WHERE id = ?', [user.userId]);
            if (!userStatus || userStatus.status !== 'active') {
                this.removeSession(user.userId);
                return { success: false, message: '用户账户已被禁用' };
            }

            // 更新会话活跃时间
            this.updateSessionActivity(user.userId);

            return {
                success: true,
                user: {
                    id: user.userId,
                    username: user.username,
                    roleId: user.roleId,
                    roleName: user.roleName,
                    permissions: user.permissions || []
                }
            };
        } catch (error) {
            console.error('令牌验证失败:', error);
            return { success: false, message: '令牌验证过程中发生错误' };
        }
    }

    /**
     * 刷新令牌
     * @param {string} token - 旧的JWT令牌
     * @returns {Object} - 刷新结果
     */
    refreshToken(token) {
        try {
            const newToken = this.securityService.refreshToken(token);
            if (!newToken) {
                return { success: false, message: '令牌刷新失败' };
            }

            const tokenValidation = this.securityService.verifyToken(newToken);
            if (tokenValidation.success) {
                const user = tokenValidation.user;
                
                // 更新会话令牌
                const session = this.getSession(user.userId);
                if (session) {
                    session.token = newToken;
                    this.storeSession(user.userId, session);
                }
            }

            return {
                success: true,
                token: newToken
            };
        } catch (error) {
            console.error('令牌刷新失败:', error);
            return { success: false, message: '令牌刷新过程中发生错误' };
        }
    }

    /**
     * 检查用户权限
     * @param {string} token - JWT令牌
     * @param {string} requiredPermission - 需要的权限
     * @returns {Object} - 权限检查结果
     */
    checkPermission(token, requiredPermission) {
        const tokenValidation = this.verifyToken(token);
        if (!tokenValidation.success) {
            return { success: false, message: tokenValidation.message };
        }

        const user = tokenValidation.user;
        const hasPermission = this.securityService.hasPermission(user.permissions, requiredPermission);

        return {
            success: true,
            hasPermission,
            user
        };
    }

    /**
     * 检查用户多个权限
     * @param {string} token - JWT令牌
     * @param {Array} requiredPermissions - 需要的权限数组
     * @param {string} mode - 检查模式：'all' 或 'any'
     * @returns {Object} - 权限检查结果
     */
    checkPermissions(token, requiredPermissions, mode = 'any') {
        const tokenValidation = this.verifyToken(token);
        if (!tokenValidation.success) {
            return { success: false, message: tokenValidation.message };
        }

        const user = tokenValidation.user;
        const hasPermissions = this.securityService.hasPermissions(user.permissions, requiredPermissions, mode);

        return {
            success: true,
            hasPermissions,
            user
        };
    }

    /**
     * 修改密码
     * @param {string} token - JWT令牌
     * @param {string} oldPassword - 旧密码
     * @param {string} newPassword - 新密码
     * @returns {Object} - 修改结果
     */
    async changePassword(token, oldPassword, newPassword) {
        try {
            const tokenValidation = this.verifyToken(token);
            if (!tokenValidation.success) {
                return { success: false, message: tokenValidation.message };
            }

            const user = tokenValidation.user;
            
            // 获取用户当前密码
            const userRecord = this.db.get('SELECT password FROM users WHERE id = ?', [user.id]);
            if (!userRecord) {
                return { success: false, message: '用户不存在' };
            }

            // 验证旧密码
            const oldPasswordValid = await this.securityService.verifyPassword(oldPassword, userRecord.password);
            if (!oldPasswordValid) {
                return { success: false, message: '原密码不正确' };
            }

            // 验证新密码
            const passwordValidation = this.securityService.validateInput(newPassword, 'password');
            if (!passwordValidation.valid) {
                return { success: false, message: passwordValidation.message };
            }

            // 加密新密码
            const hashedNewPassword = await this.securityService.hashPassword(newPassword);
            
            // 更新密码
            this.db.prepare('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
                .run(hashedNewPassword, user.id);

            // 记录操作日志
            this.logOperation(user.id, 'change_password', 'auth', '修改密码');

            // 清除所有会话（强制重新登录）
            this.removeAllUserSessions(user.id);

            return { success: true, message: '密码修改成功，请重新登录' };
        } catch (error) {
            console.error('修改密码失败:', error);
            return { success: false, message: '修改密码过程中发生错误' };
        }
    }

    /**
     * 重置密码
     * @param {string} username - 用户名
     * @param {string} resetToken - 重置令牌
     * @param {string} newPassword - 新密码
     * @returns {Object} - 重置结果
     */
    async resetPassword(username, resetToken, newPassword) {
        try {
            // 验证重置令牌（这里简化处理，实际应用中需要更复杂的验证逻辑）
            const user = this.db.get('SELECT id, password_reset_token, password_reset_expires FROM users WHERE username = ?', [username]);
            if (!user) {
                return { success: false, message: '用户不存在' };
            }

            if (!user.password_reset_token || user.password_reset_token !== resetToken) {
                return { success: false, message: '重置令牌无效' };
            }

            if (new Date() > new Date(user.password_reset_expires)) {
                return { success: false, message: '重置令牌已过期' };
            }

            // 验证新密码
            const passwordValidation = this.securityService.validateInput(newPassword, 'password');
            if (!passwordValidation.valid) {
                return { success: false, message: passwordValidation.message };
            }

            // 加密新密码
            const hashedNewPassword = await this.securityService.hashPassword(newPassword);
            
            // 更新密码并清除重置令牌
            this.db.prepare(`
                UPDATE users 
                SET password = ?, 
                    password_reset_token = NULL,
                    password_reset_expires = NULL,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `).run(hashedNewPassword, user.id);

            // 记录操作日志
            this.logOperation(user.id, 'reset_password', 'auth', '重置密码');

            // 清除所有会话
            this.removeAllUserSessions(user.id);

            return { success: true, message: '密码重置成功' };
        } catch (error) {
            console.error('重置密码失败:', error);
            return { success: false, message: '重置密码过程中发生错误' };
        }
    }

    /**
     * 获取用户信息
     * @param {string} token - JWT令牌
     * @returns {Object} - 用户信息
     */
    getUserInfo(token) {
        try {
            const tokenValidation = this.verifyToken(token);
            if (!tokenValidation.success) {
                return { success: false, message: tokenValidation.message };
            }

            const user = tokenValidation.user;
            
            // 获取详细用户信息
            const userInfo = this.db.get(`
                SELECT u.id, u.username, u.full_name, u.email, u.phone, 
                       u.department, u.position, u.status, u.last_login,
                       r.name as role_name, r.description as role_description
                FROM users u
                LEFT JOIN user_roles ur ON u.id = ur.user_id
                LEFT JOIN roles r ON ur.role_id = r.id
                WHERE u.id = ?
            `, [user.id]);

            if (!userInfo) {
                return { success: false, message: '用户信息不存在' };
            }

            return {
                success: true,
                user: {
                    id: userInfo.id,
                    username: userInfo.username,
                    fullName: userInfo.full_name,
                    email: userInfo.email,
                    phone: userInfo.phone,
                    department: userInfo.department,
                    position: userInfo.position,
                    status: userInfo.status,
                    lastLogin: userInfo.last_login,
                    role: userInfo.role_name,
                    roleDescription: userInfo.role_description,
                    permissions: user.permissions || []
                }
            };
        } catch (error) {
            console.error('获取用户信息失败:', error);
            return { success: false, message: '获取用户信息过程中发生错误' };
        }
    }

    /**
     * 记录登录尝试
     * @param {string} username - 用户名
     * @param {boolean} success - 是否成功
     * @param {Object} loginInfo - 登录信息
     */
    recordLoginAttempt(username, success, loginInfo = {}) {
        this.securityService.recordLoginAttempt(username, success);
        
        // 记录登录尝试日志
        try {
            const user = this.db.get('SELECT id FROM users WHERE username = ?', [username]);
            if (user) {
                this.logOperation(user.id, success ? 'login_success' : 'login_failed', 'auth', 
                    success ? '登录成功' : '登录失败', loginInfo);
            }
        } catch (error) {
            console.error('记录登录尝试失败:', error);
        }
    }

    /**
     * 记录操作日志
     * @param {number} userId - 用户ID
     * @param {string} action - 操作类型
     * @param {string} module - 模块名称
     * @param {string} description - 操作描述
     * @param {Object} extra - 额外信息
     */
    logOperation(userId, action, module, description, extra = {}) {
        try {
            this.db.prepare(`
                INSERT INTO operation_logs (user_id, action, module, description, ip_address, user_agent)
                VALUES (?, ?, ?, ?, ?, ?)
            `).run(
                userId,
                action,
                module,
                description,
                extra.ipAddress || '',
                extra.userAgent || ''
            );
        } catch (error) {
            console.error('记录操作日志失败:', error);
        }
    }

    /**
     * 存储会话信息
     * @param {number} userId - 用户ID
     * @param {Object} sessionData - 会话数据
     */
    storeSession(userId, sessionData) {
        this.activeSessions.set(userId, {
            ...sessionData,
            lastActivity: new Date().toISOString()
        });
    }

    /**
     * 获取会话信息
     * @param {number} userId - 用户ID
     * @returns {Object|null} - 会话信息
     */
    getSession(userId) {
        return this.activeSessions.get(userId) || null;
    }

    /**
     * 更新会话活跃时间
     * @param {number} userId - 用户ID
     */
    updateSessionActivity(userId) {
        const session = this.activeSessions.get(userId);
        if (session) {
            session.lastActivity = new Date().toISOString();
        }
    }

    /**
     * 移除会话
     * @param {number} userId - 用户ID
     */
    removeSession(userId) {
        this.activeSessions.delete(userId);
    }

    /**
     * 移除用户所有会话
     * @param {number} userId - 用户ID
     */
    removeAllUserSessions(userId) {
        this.activeSessions.delete(userId);
    }

    /**
     * 清理过期会话
     */
    cleanupExpiredSessions() {
        const now = new Date();
        const maxAge = 24 * 60 * 60 * 1000; // 24小时
        
        for (const [userId, session] of this.activeSessions.entries()) {
            const lastActivity = new Date(session.lastActivity);
            if (now - lastActivity > maxAge) {
                this.activeSessions.delete(userId);
            }
        }
    }

    /**
     * 获取活跃会话统计
     * @returns {Object} - 会话统计信息
     */
    getSessionStats() {
        return {
            totalSessions: this.activeSessions.size,
            activeUsers: Array.from(this.activeSessions.keys()).length
        };
    }
}

module.exports = AuthService;