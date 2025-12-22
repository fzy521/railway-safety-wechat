const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * 安全服务类
 * 负责密码加密、JWT令牌管理、输入验证等安全相关功能
 */
class SecurityService {
    constructor() {
        this.jwtSecret = process.env.JWT_SECRET || 'railway-safety-jwt-secret-key-2024';
        this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
        this.bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        this.maxLoginAttempts = 5;
        this.lockoutDuration = 15 * 60 * 1000; // 15分钟
        this.loginAttempts = new Map(); // 存储登录尝试次数
    }

    /**
     * 密码哈希
     * @param {string} password - 明文密码
     * @returns {Promise<string>} - 哈希后的密码
     */
    async hashPassword(password) {
        try {
            const salt = await bcrypt.genSalt(this.bcryptRounds);
            const hashedPassword = await bcrypt.hash(password, salt);
            return hashedPassword;
        } catch (error) {
            console.error('密码哈希失败:', error);
            throw new Error('密码处理失败');
        }
    }

    /**
     * 密码验证
     * @param {string} password - 明文密码
     * @param {string} hashedPassword - 哈希密码
     * @returns {Promise<boolean>} - 验证结果
     */
    async verifyPassword(password, hashedPassword) {
        try {
            return await bcrypt.compare(password, hashedPassword);
        } catch (error) {
            console.error('密码验证失败:', error);
            return false;
        }
    }

    /**
     * 生成JWT令牌
     * @param {Object} user - 用户信息
     * @returns {string} - JWT令牌
     */
    generateToken(user) {
        try {
            const payload = {
                userId: user.id,
                username: user.username,
                roleId: user.roleId,
                roleName: user.roleName,
                permissions: user.permissions || [],
                iat: Math.floor(Date.now() / 1000)
            };

            return jwt.sign(payload, this.jwtSecret, {
                expiresIn: this.jwtExpiresIn,
                issuer: 'railway-safety-system',
                audience: 'railway-safety-users'
            });
        } catch (error) {
            console.error('JWT令牌生成失败:', error);
            throw new Error('令牌生成失败');
        }
    }

    /**
     * 验证JWT令牌
     * @param {string} token - JWT令牌
     * @returns {Object|null} - 解码后的用户信息
     */
    verifyToken(token) {
        try {
            const decoded = jwt.verify(token, this.jwtSecret, {
                issuer: 'railway-safety-system',
                audience: 'railway-safety-users'
            });
            
            return {
                success: true,
                user: decoded
            };
        } catch (error) {
            console.error('JWT令牌验证失败:', error);
            return {
                success: false,
                message: this.getJwtErrorMessage(error)
            };
        }
    }

    /**
     * 刷新JWT令牌
     * @param {string} token - 旧的JWT令牌
     * @returns {string|null} - 新的JWT令牌
     */
    refreshToken(token) {
        try {
            const decoded = jwt.verify(token, this.jwtSecret, {
                ignoreExpiration: true,
                issuer: 'railway-safety-system',
                audience: 'railway-safety-users'
            });
            
            // 检查令牌是否在刷新期内（过期后1小时内可刷新）
            const now = Math.floor(Date.now() / 1000);
            if (now - decoded.exp > 3600) {
                throw new Error('令牌刷新时间已过期');
            }
            
            // 生成新令牌
            return this.generateToken(decoded);
        } catch (error) {
            console.error('JWT令牌刷新失败:', error);
            return null;
        }
    }

    /**
     * 检查登录尝试次数
     * @param {string} identifier - 用户名或IP地址
     * @returns {Object} - 检查结果
     */
    checkLoginAttempts(identifier) {
        const attempts = this.loginAttempts.get(identifier) || { count: 0, lastAttempt: 0 };
        const now = Date.now();
        
        // 如果超过锁定时间，重置计数
        if (now - attempts.lastAttempt > this.lockoutDuration) {
            this.loginAttempts.set(identifier, { count: 0, lastAttempt: 0 });
            return { allowed: true, remainingAttempts: this.maxLoginAttempts };
        }
        
        // 如果超过最大尝试次数，检查是否仍在锁定期内
        if (attempts.count >= this.maxLoginAttempts) {
            const lockTimeRemaining = this.lockoutDuration - (now - attempts.lastAttempt);
            return {
                allowed: false,
                locked: true,
                lockTimeRemaining: Math.ceil(lockTimeRemaining / 60000), // 转换为分钟
                message: `账户已锁定，请${Math.ceil(lockTimeRemaining / 60000)}分钟后重试`
            };
        }
        
        return {
            allowed: true,
            remainingAttempts: this.maxLoginAttempts - attempts.count
        };
    }

    /**
     * 记录登录尝试
     * @param {string} identifier - 用户名或IP地址
     * @param {boolean} success - 是否登录成功
     */
    recordLoginAttempt(identifier, success) {
        if (success) {
            // 登录成功，清除记录
            this.loginAttempts.delete(identifier);
        } else {
            // 登录失败，增加计数
            const attempts = this.loginAttempts.get(identifier) || { count: 0, lastAttempt: 0 };
            this.loginAttempts.set(identifier, {
                count: attempts.count + 1,
                lastAttempt: Date.now()
            });
        }
    }

    /**
     * 权限检查
     * @param {Array} userPermissions - 用户权限数组
     * @param {string} requiredPermission - 需要的权限
     * @returns {boolean} - 是否有权限
     */
    hasPermission(userPermissions, requiredPermission) {
        if (!userPermissions || !Array.isArray(userPermissions)) {
            return false;
        }
        
        // 检查是否有超级管理员权限
        if (userPermissions.includes('user.manage')) {
            return true;
        }
        
        // 检查具体权限
        return userPermissions.includes(requiredPermission);
    }

    /**
     * 多权限检查
     * @param {Array} userPermissions - 用户权限数组
     * @param {Array} requiredPermissions - 需要的权限数组
     * @param {string} mode - 检查模式：'all'(全部需要) 或 'any'(任一需要)
     * @returns {boolean} - 是否有权限
     */
    hasPermissions(userPermissions, requiredPermissions, mode = 'any') {
        if (!userPermissions || !Array.isArray(userPermissions) || !requiredPermissions) {
            return false;
        }
        
        // 检查是否有超级管理员权限
        if (userPermissions.includes('user.manage')) {
            return true;
        }
        
        if (mode === 'all') {
            return requiredPermissions.every(permission => userPermissions.includes(permission));
        } else {
            return requiredPermissions.some(permission => userPermissions.includes(permission));
        }
    }

    /**
     * 输入验证
     * @param {any} input - 输入值
     * @param {string} type - 验证类型
     * @param {Object} options - 验证选项
     * @returns {Object} - 验证结果
     */
    validateInput(input, type, options = {}) {
        try {
            switch (type) {
                case 'username':
                    return this.validateUsername(input, options);
                case 'email':
                    return this.validateEmail(input, options);
                case 'phone':
                    return this.validatePhone(input, options);
                case 'password':
                    return this.validatePassword(input, options);
                case 'id':
                    return this.validateId(input, options);
                case 'text':
                    return this.validateText(input, options);
                case 'number':
                    return this.validateNumber(input, options);
                case 'date':
                    return this.validateDate(input, options);
                case 'enum':
                    return this.validateEnum(input, options);
                default:
                    return { valid: false, message: '未知的验证类型' };
            }
        } catch (error) {
            console.error('输入验证失败:', error);
            return { valid: false, message: '验证过程出错' };
        }
    }

    /**
     * 用户名验证
     */
    validateUsername(username, options = {}) {
        const minLength = options.minLength || 3;
        const maxLength = options.maxLength || 20;
        const pattern = /^[a-zA-Z0-9_]+$/;
        
        if (!username || typeof username !== 'string') {
            return { valid: false, message: '用户名不能为空' };
        }
        
        if (username.length < minLength) {
            return { valid: false, message: `用户名长度不能少于${minLength}个字符` };
        }
        
        if (username.length > maxLength) {
            return { valid: false, message: `用户名长度不能超过${maxLength}个字符` };
        }
        
        if (!pattern.test(username)) {
            return { valid: false, message: '用户名只能包含字母、数字和下划线' };
        }
        
        return { valid: true };
    }

    /**
     * 邮箱验证
     */
    validateEmail(email, options = {}) {
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!email || typeof email !== 'string') {
            return { valid: false, message: '邮箱不能为空' };
        }
        
        if (!pattern.test(email)) {
            return { valid: false, message: '邮箱格式不正确' };
        }
        
        return { valid: true };
    }

    /**
     * 电话号码验证
     */
    validatePhone(phone, options = {}) {
        const pattern = /^[0-9\-\+\(\)\s]+$/;
        
        if (!phone || typeof phone !== 'string') {
            return { valid: false, message: '电话号码不能为空' };
        }
        
        if (!pattern.test(phone)) {
            return { valid: false, message: '电话号码格式不正确' };
        }
        
        return { valid: true };
    }

    /**
     * 密码验证
     */
    validatePassword(password, options = {}) {
        const minLength = options.minLength || 6;
        const maxLength = options.maxLength || 50;
        const requireUppercase = options.requireUppercase !== false;
        const requireLowercase = options.requireLowercase !== false;
        const requireNumbers = options.requireNumbers !== false;
        const requireSpecialChars = options.requireSpecialChars || false;
        
        if (!password || typeof password !== 'string') {
            return { valid: false, message: '密码不能为空' };
        }
        
        if (password.length < minLength) {
            return { valid: false, message: `密码长度不能少于${minLength}个字符` };
        }
        
        if (password.length > maxLength) {
            return { valid: false, message: `密码长度不能超过${maxLength}个字符` };
        }
        
        if (requireUppercase && !/[A-Z]/.test(password)) {
            return { valid: false, message: '密码必须包含至少一个大写字母' };
        }
        
        if (requireLowercase && !/[a-z]/.test(password)) {
            return { valid: false, message: '密码必须包含至少一个小写字母' };
        }
        
        if (requireNumbers && !/[0-9]/.test(password)) {
            return { valid: false, message: '密码必须包含至少一个数字' };
        }
        
        if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            return { valid: false, message: '密码必须包含至少一个特殊字符' };
        }
        
        return { valid: true };
    }

    /**
     * ID验证
     */
    validateId(id, options = {}) {
        const pattern = /^[0-9]+$/;
        
        if (!id) {
            return { valid: false, message: 'ID不能为空' };
        }
        
        if (!pattern.test(id.toString())) {
            return { valid: false, message: 'ID必须是正整数' };
        }
        
        return { valid: true };
    }

    /**
     * 文本验证
     */
    validateText(text, options = {}) {
        const minLength = options.minLength || 0;
        const maxLength = options.maxLength || 1000;
        const allowEmpty = options.allowEmpty || false;
        
        if (!text && !allowEmpty) {
            return { valid: false, message: '文本不能为空' };
        }
        
        if (text && typeof text !== 'string') {
            return { valid: false, message: '文本必须是字符串' };
        }
        
        if (text && text.length < minLength) {
            return { valid: false, message: `文本长度不能少于${minLength}个字符` };
        }
        
        if (text && text.length > maxLength) {
            return { valid: false, message: `文本长度不能超过${maxLength}个字符` };
        }
        
        return { valid: true };
    }

    /**
     * 数字验证
     */
    validateNumber(number, options = {}) {
        const min = options.min;
        const max = options.max;
        const integer = options.integer || false;
        
        if (number === null || number === undefined) {
            return { valid: false, message: '数字不能为空' };
        }
        
        const num = parseFloat(number);
        
        if (isNaN(num)) {
            return { valid: false, message: '必须是有效的数字' };
        }
        
        if (integer && !Number.isInteger(num)) {
            return { valid: false, message: '必须是整数' };
        }
        
        if (min !== undefined && num < min) {
            return { valid: false, message: `数字不能小于${min}` };
        }
        
        if (max !== undefined && num > max) {
            return { valid: false, message: `数字不能大于${max}` };
        }
        
        return { valid: true };
    }

    /**
     * 日期验证
     */
    validateDate(date, options = {}) {
        const allowEmpty = options.allowEmpty || false;
        const minDate = options.minDate;
        const maxDate = options.maxDate;
        
        if (!date && !allowEmpty) {
            return { valid: false, message: '日期不能为空' };
        }
        
        if (date) {
            const dateObj = new Date(date);
            
            if (isNaN(dateObj.getTime())) {
                return { valid: false, message: '日期格式不正确' };
            }
            
            if (minDate && dateObj < new Date(minDate)) {
                return { valid: false, message: `日期不能早于${minDate}` };
            }
            
            if (maxDate && dateObj > new Date(maxDate)) {
                return { valid: false, message: `日期不能晚于${maxDate}` };
            }
        }
        
        return { valid: true };
    }

    /**
     * 枚举值验证
     */
    validateEnum(value, options = {}) {
        const { values = [], allowEmpty = false } = options;
        
        if (!value && !allowEmpty) {
            return { valid: false, message: '值不能为空' };
        }
        
        if (value && !values.includes(value)) {
            return { valid: false, message: `值必须是以下之一: ${values.join(', ')}` };
        }
        
        return { valid: true };
    }

    /**
     * SQL注入防护
     * @param {string} input - 输入字符串
     * @returns {string} - 清理后的字符串
     */
    sanitizeSqlInput(input) {
        if (typeof input !== 'string') {
            return input;
        }
        
        // 移除常见的SQL注入字符
        return input.replace(/['"\\;\-\-]/g, '');
    }

    /**
     * XSS防护
     * @param {string} input - 输入字符串
     * @returns {string} - 清理后的字符串
     */
    sanitizeXssInput(input) {
        if (typeof input !== 'string') {
            return input;
        }
        
        // 移除HTML标签和JavaScript代码
        return input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<[^>]*>/g, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '');
    }

    /**
     * 生成随机字符串
     * @param {number} length - 字符串长度
     * @returns {string} - 随机字符串
     */
    generateRandomString(length = 32) {
        return crypto.randomBytes(length).toString('hex');
    }

    /**
     * 生成密码重置令牌
     * @returns {Object} - 令牌信息
     */
    generatePasswordResetToken() {
        const token = this.generateRandomString(32);
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1小时后过期
        
        return {
            token,
            expiresAt: expiresAt.toISOString()
        };
    }

    /**
     * 获取JWT错误信息
     * @param {Error} error - JWT错误
     * @returns {string} - 错误信息
     */
    getJwtErrorMessage(error) {
        switch (error.name) {
            case 'TokenExpiredError':
                return '令牌已过期';
            case 'JsonWebTokenError':
                return '令牌无效';
            case 'NotBeforeError':
                return '令牌尚未生效';
            default:
                return '令牌验证失败';
        }
    }

    /**
     * 获取密码强度
     * @param {string} password - 密码
     * @returns {Object} - 密码强度信息
     */
    getPasswordStrength(password) {
        if (!password || typeof password !== 'string') {
            return { strength: 0, level: '无', message: '密码不能为空' };
        }
        
        let score = 0;
        const feedback = [];
        
        // 长度检查
        if (password.length >= 8) score += 1;
        else feedback.push('密码长度至少8位');
        
        // 大写字母
        if (/[A-Z]/.test(password)) score += 1;
        else feedback.push('包含大写字母');
        
        // 小写字母
        if (/[a-z]/.test(password)) score += 1;
        else feedback.push('包含小写字母');
        
        // 数字
        if (/[0-9]/.test(password)) score += 1;
        else feedback.push('包含数字');
        
        // 特殊字符
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
        else feedback.push('包含特殊字符');
        
        let level, message;
        switch (score) {
            case 0:
            case 1:
                level = '弱';
                message = '密码强度很弱，建议增加复杂度';
                break;
            case 2:
            case 3:
                level = '中等';
                message = '密码强度中等，可以进一步加强';
                break;
            case 4:
            case 5:
                level = '强';
                message = '密码强度良好';
                break;
        }
        
        return {
            strength: score,
            level,
            message,
            feedback
        };
    }
}

module.exports = SecurityService;