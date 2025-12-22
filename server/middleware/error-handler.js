const logger = require('../utils/logger');

/**
 * 全局错误处理中间件
 */
function errorHandler(err, req, res, next) {
    // 记录错误日志
    logger.error('API错误', {
        error: err.message,
        stack: err.stack,
        method: req.method,
        url: req.path,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });

    // 默认错误响应
    let statusCode = 500;
    let message = '服务器内部错误';
    let details = null;

    // 根据错误类型设置响应
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = '请求参数验证失败';
        details = err.message;
    } else if (err.name === 'UnauthorizedError') {
        statusCode = 401;
        message = '未授权访问';
    } else if (err.name === 'ForbiddenError') {
        statusCode = 403;
        message = '权限不足';
    } else if (err.name === 'NotFoundError') {
        statusCode = 404;
        message = '请求的资源不存在';
    } else if (err.name === 'ConflictError') {
        statusCode = 409;
        message = '资源冲突';
    } else if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        statusCode = 409;
        message = '数据已存在，不能重复创建';
    } else if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
        statusCode = 400;
        message = '关联数据不存在';
    } else if (err.code === 'SQLITE_CONSTRAINT_NOTNULL') {
        statusCode = 400;
        message = '必填字段不能为空';
    }

    // 开发环境返回详细错误信息
    const response = {
        success: false,
        message,
        timestamp: new Date().toISOString()
    };

    if (process.env.NODE_ENV === 'development') {
        response.details = details || err.message;
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
}

/**
 * 404错误处理中间件
 */
function notFoundHandler(req, res) {
    res.status(404).json({
        success: false,
        message: '请求的API接口不存在',
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });
}

/**
 * 异步错误捕获包装器
 */
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

/**
 * 自定义错误类
 */
class AppError extends Error {
    constructor(message, statusCode = 500, details = null) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    constructor(message, details = null) {
        super(message, 400, details);
        this.name = 'ValidationError';
    }
}

class UnauthorizedError extends AppError {
    constructor(message = '未授权访问') {
        super(message, 401);
        this.name = 'UnauthorizedError';
    }
}

class ForbiddenError extends AppError {
    constructor(message = '权限不足') {
        super(message, 403);
        this.name = 'ForbiddenError';
    }
}

class NotFoundError extends AppError {
    constructor(message = '请求的资源不存在') {
        super(message, 404);
        this.name = 'NotFoundError';
    }
}

class ConflictError extends AppError {
    constructor(message = '资源冲突') {
        super(message, 409);
        this.name = 'ConflictError';
    }
}

module.exports = {
    errorHandler,
    notFoundHandler,
    asyncHandler,
    AppError,
    ValidationError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError
};