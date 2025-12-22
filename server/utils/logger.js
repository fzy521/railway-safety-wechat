const winston = require('winston');
const path = require('path');

/**
 * 日志工具类
 */
class Logger {
    constructor() {
        this.createLogger();
    }

    /**
     * 创建Winston日志实例
     */
    createLogger() {
        // 定义日志格式
        const logFormat = winston.format.combine(
            winston.format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss'
            }),
            winston.format.errors({ stack: true }),
            winston.format.json(),
            winston.format.prettyPrint()
        );

        // 控制台输出格式
        const consoleFormat = winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp({
                format: 'HH:mm:ss'
            }),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
                let msg = `${timestamp} [${level}]: ${message}`;
                if (Object.keys(meta).length > 0) {
                    msg += '\n' + JSON.stringify(meta, null, 2);
                }
                return msg;
            })
        );

        // 创建传输器
        const transports = [
            // 控制台输出
            new winston.transports.Console({
                level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
                format: consoleFormat
            })
        ];

        // 生产环境添加文件输出
        if (process.env.NODE_ENV === 'production') {
            const logDir = path.dirname(process.env.LOG_FILE || './logs/app.log');
            
            // 确保日志目录存在
            const fs = require('fs');
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
            }

            // 添加所有日志文件传输器
            transports.push(
                new winston.transports.File({
                    filename: process.env.LOG_FILE || './logs/app.log',
                    level: 'info',
                    format: logFormat,
                    maxsize: 5242880, // 5MB
                    maxFiles: 10
                })
            );

            // 错误日志单独文件
            transports.push(
                new winston.transports.File({
                    filename: './logs/error.log',
                    level: 'error',
                    format: logFormat,
                    maxsize: 5242880, // 5MB
                    maxFiles: 5
                })
            );
        }

        // 创建logger实例
        this.logger = winston.createLogger({
            level: process.env.LOG_LEVEL || 'info',
            format: logFormat,
            transports,
            exitOnError: false
        });
    }

    /**
     * 记录信息日志
     */
    info(message, meta = {}) {
        this.logger.info(message, meta);
    }

    /**
     * 记录警告日志
     */
    warn(message, meta = {}) {
        this.logger.warn(message, meta);
    }

    /**
     * 记录错误日志
     */
    error(message, meta = {}) {
        this.logger.error(message, meta);
    }

    /**
     * 记录调试日志
     */
    debug(message, meta = {}) {
        this.logger.debug(message, meta);
    }

    /**
     * 记录详细日志
     */
    verbose(message, meta = {}) {
        this.logger.verbose(message, meta);
    }
}

// 创建单例实例
const logger = new Logger();

module.exports = logger;