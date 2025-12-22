const { UnauthorizedError, ForbiddenError, asyncHandler } = require('./error-handler');

/**
 * 认证中间件
 */
class AuthMiddleware {
    constructor(apiService) {
        this.apiService = apiService;
    }

    /**
     * JWT认证中间件
     * 验证请求头中的Authorization令牌
     */
    authenticate() {
        return asyncHandler(async (req, res, next) => {
            const authHeader = req.headers.authorization;
            
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                throw new UnauthorizedError('缺少认证令牌');
            }

            const token = authHeader.substring(7); // 移除 'Bearer ' 前缀
            
            if (!token) {
                throw new UnauthorizedError('认证令牌无效');
            }

            // 验证令牌
            const tokenValidation = this.apiService.verifyToken(token);
            if (!tokenValidation.success) {
                throw new UnauthorizedError(tokenValidation.message);
            }

            // 将用户信息添加到请求对象
            req.user = tokenValidation.user;
            req.token = token;
            
            next();
        });
    }

    /**
     * 可选认证中间件
     * 如果有令牌则验证，没有则继续
     */
    optionalAuthenticate() {
        return asyncHandler(async (req, res, next) => {
            const authHeader = req.headers.authorization;
            
            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.substring(7);
                
                if (token) {
                    const tokenValidation = this.apiService.verifyToken(token);
                    if (tokenValidation.success) {
                        req.user = tokenValidation.user;
                        req.token = token;
                    }
                }
            }
            
            next();
        });
    }

    /**
     * 权限检查中间件
     * @param {string} permission - 需要的权限
     */
    requirePermission(permission) {
        return asyncHandler(async (req, res, next) => {
            if (!req.user) {
                throw new UnauthorizedError('需要登录');
            }

            const permissionCheck = this.apiService.authService.checkPermission(req.token, permission);
            if (!permissionCheck.success) {
                throw new UnauthorizedError(permissionCheck.message);
            }

            if (!permissionCheck.hasPermission) {
                throw new ForbiddenError(`需要权限: ${permission}`);
            }

            next();
        });
    }

    /**
     * 多权限检查中间件
     * @param {Array} permissions - 需要的权限数组
     * @param {string} mode - 检查模式：'all'(全部需要) 或 'any'(任一需要)
     */
    requirePermissions(permissions, mode = 'any') {
        return asyncHandler(async (req, res, next) => {
            if (!req.user) {
                throw new UnauthorizedError('需要登录');
            }

            const permissionCheck = this.apiService.authService.checkPermissions(req.token, permissions, mode);
            if (!permissionCheck.success) {
                throw new UnauthorizedError(permissionCheck.message);
            }

            if (!permissionCheck.hasPermissions) {
                const modeText = mode === 'all' ? '全部' : '任一';
                throw new ForbiddenError(`需要权限: ${permissions.join(', ')} (${modeText})`);
            }

            next();
        });
    }

    /**
     * 角色检查中间件
     * @param {string|Array} roles - 允许的角色
     */
    requireRole(roles) {
        return asyncHandler(async (req, res, next) => {
            if (!req.user) {
                throw new UnauthorizedError('需要登录');
            }

            const allowedRoles = Array.isArray(roles) ? roles : [roles];
            
            if (!allowedRoles.includes(req.user.roleName)) {
                throw new ForbiddenError(`需要角色: ${allowedRoles.join(' 或 ')}`);
            }

            next();
        });
    }

    /**
     * 超级管理员检查中间件
     */
    requireSuperAdmin() {
        return this.requireRole('超级管理员');
    }

    /**
     * 管理员检查中间件
     * 包括超级管理员和安全管理员
     */
    requireAdmin() {
        return this.requireRole(['超级管理员', '安全管理员']);
    }

    /**
     * 资源所有者检查中间件
     * 检查用户是否是资源的创建者或具有管理权限
     * @param {string} resourceParam - 资源ID参数名
     * @param {string} resourceTable - 资源表名
     * @param {string} ownerField - 所有者字段名
     */
    requireOwnerOrAdmin(resourceParam = 'id', resourceTable = null, ownerField = 'created_by') {
        return asyncHandler(async (req, res, next) => {
            if (!req.user) {
                throw new UnauthorizedError('需要登录');
            }

            // 超级管理员跳过检查
            if (req.user.roleName === '超级管理员') {
                return next();
            }

            // 如果没有指定资源表，跳过检查
            if (!resourceTable) {
                return next();
            }

            const resourceId = req.params[resourceParam];
            if (!resourceId) {
                throw new UnauthorizedError('缺少资源ID');
            }

            // 查询资源所有者
            const resource = this.apiService.dbManager.get(
                `SELECT ${ownerField} FROM ${resourceTable} WHERE id = ?`,
                [resourceId]
            );

            if (!resource) {
                throw new UnauthorizedError('资源不存在');
            }

            // 检查是否是资源所有者
            if (resource[ownerField] !== req.user.id) {
                throw new ForbiddenError('只能操作自己创建的资源');
            }

            next();
        });
    }

    /**
     * IP白名单检查中间件
     * @param {Array} allowedIPs - 允许的IP地址数组
     */
    requireIPWhitelist(allowedIPs) {
        return (req, res, next) => {
            const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
            
            if (!allowedIPs.includes(clientIP)) {
                throw new ForbiddenError('IP地址不在允许范围内');
            }

            next();
        };
    }

    /**
     * 请求频率限制中间件
     * @param {number} maxRequests - 最大请求数
     * @param {number} windowMs - 时间窗口(毫秒)
     */
    rateLimit(maxRequests, windowMs) {
        const requests = new Map();

        return (req, res, next) => {
            const key = req.user ? `user:${req.user.id}` : `ip:${req.ip}`;
            const now = Date.now();
            const windowStart = now - windowMs;

            // 清理过期记录
            if (requests.has(key)) {
                const userRequests = requests.get(key).filter(time => time > windowStart);
                requests.set(key, userRequests);
            }

            // 检查请求数量
            const userRequests = requests.get(key) || [];
            if (userRequests.length >= maxRequests) {
                throw new ForbiddenError('请求过于频繁，请稍后再试');
            }

            // 记录当前请求
            userRequests.push(now);
            requests.set(key, userRequests);

            next();
        };
    }

    /**
     * 会话有效性检查中间件
     */
    requireValidSession() {
        return asyncHandler(async (req, res, next) => {
            if (!req.user) {
                throw new UnauthorizedError('需要登录');
            }

            // 检查会话是否有效
            const session = this.apiService.authService.getSession(req.user.id);
            if (!session || session.token !== req.token) {
                throw new UnauthorizedError('会话已失效，请重新登录');
            }

            next();
        });
    }
}

module.exports = AuthMiddleware;