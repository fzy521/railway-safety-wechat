const express = require('express');
const { asyncHandler } = require('../middleware/error-handler');

/**
 * 认证路由
 */
function createAuthRoutes(apiService, authMiddleware) {
    const router = express.Router();

    /**
     * 用户登录
     * POST /api/auth/login
     */
    router.post('/login', asyncHandler(async (req, res) => {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: '用户名和密码不能为空'
            });
        }

        const loginInfo = {
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        };

        const result = await apiService.login(username, password, loginInfo);
        
        if (result.success) {
            res.json(result);
        } else {
            const statusCode = result.locked ? 423 : 401; // 423 Locked
            res.status(statusCode).json(result);
        }
    }));

    /**
     * 用户登出
     * POST /api/auth/logout
     */
    router.post('/logout', authMiddleware.authenticate(), asyncHandler(async (req, res) => {
        const logoutInfo = {
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        };

        const result = await apiService.logout(req.token, logoutInfo);
        res.json(result);
    }));

    /**
     * 刷新令牌
     * POST /api/auth/refresh
     */
    router.post('/refresh', asyncHandler(async (req, res) => {
        const { token } = req.body;
        
        if (!token) {
            return res.status(400).json({
                success: false,
                message: '刷新令牌不能为空'
            });
        }

        const result = apiService.refreshToken(token);
        
        if (result) {
            res.json({
                success: true,
                token: result
            });
        } else {
            res.status(401).json({
                success: false,
                message: '令牌刷新失败'
            });
        }
    }));

    /**
     * 验证令牌
     * GET /api/auth/verify
     */
    router.get('/verify', authMiddleware.authenticate(), (req, res) => {
        res.json({
            success: true,
            user: req.user,
            message: '令牌有效'
        });
    });

    /**
     * 获取当前用户信息
     * GET /api/auth/me
     */
    router.get('/me', authMiddleware.authenticate(), asyncHandler(async (req, res) => {
        const result = apiService.getUserInfo(req.token);
        res.json(result);
    }));

    /**
     * 修改密码
     * POST /api/auth/change-password
     */
    router.post('/change-password', authMiddleware.authenticate(), asyncHandler(async (req, res) => {
        const { oldPassword, newPassword } = req.body;
        
        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: '原密码和新密码不能为空'
            });
        }

        const result = await apiService.changePassword(req.token, oldPassword, newPassword);
        res.json(result);
    }));

    /**
     * 检查权限
     * POST /api/auth/check-permission
     */
    router.post('/check-permission', authMiddleware.authenticate(), asyncHandler(async (req, res) => {
        const { permission } = req.body;
        
        if (!permission) {
            return res.status(400).json({
                success: false,
                message: '权限名称不能为空'
            });
        }

        const result = apiService.authService.checkPermission(req.token, permission);
        res.json(result);
    }));

    /**
     * 检查多个权限
     * POST /api/auth/check-permissions
     */
    router.post('/check-permissions', authMiddleware.authenticate(), asyncHandler(async (req, res) => {
        const { permissions, mode = 'any' } = req.body;
        
        if (!permissions || !Array.isArray(permissions)) {
            return res.status(400).json({
                success: false,
                message: '权限列表不能为空且必须是数组'
            });
        }

        const result = apiService.authService.checkPermissions(req.token, permissions, mode);
        res.json(result);
    }));

    /**
     * 获取会话统计
     * GET /api/auth/sessions/stats
     */
    router.get('/sessions/stats', authMiddleware.requireSuperAdmin(), (req, res) => {
        const stats = apiService.authService.getSessionStats();
        res.json({
            success: true,
            data: stats
        });
    });

    return router;
}

module.exports = createAuthRoutes;