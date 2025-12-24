/**
 * 数据库配置文件
 * 集中管理所有数据库相关配置
 */

const path = require('path');

const databaseConfig = {
    // 基础配置
    development: {
        // 数据库路径
        dbPath: process.env.DB_PATH || path.join(__dirname, '../data/railway_safety.db'),

        // 备份配置
        backup: {
            enabled: true,
            backupDir: process.env.DB_BACKUP_DIR || path.join(__dirname, '../backups'),
            autoBackupInterval: 24 * 60 * 60 * 1000, // 24小时
            maxBackupFiles: 7, // 保留7个备份文件
            compressBackups: true
        },

        // 连接池配置
        pool: {
            enabled: true,
            minConnections: 1,
            maxConnections: 5,
            idleTimeout: 30000, // 30秒
            connectionTimeout: 5000, // 5秒
            acquireTimeout: 10000, // 10秒
            retryAttempts: 3,
            retryDelay: 1000
        },

        // 性能优化配置
        performance: {
            cacheSize: 10000,
            mmapSize: 268435456, // 256MB
            tempStore: 'memory',
            synchronous: 'NORMAL',
            journalMode: 'WAL',
            walAutocheckpoint: 1000
        },

        // 监控配置
        monitoring: {
            enabled: true,
            slowQueryThreshold: 1000, // 1秒
            healthCheckInterval: 30000, // 30秒
            metricsInterval: 5000, // 5秒
            enableProfiling: true,
            maxQueryHistory: 1000
        },

        // 缓存配置
        cache: {
            enabled: true,
            maxSize: 100,
            defaultTTL: 300000, // 5分钟
            cleanupInterval: 60000 // 1分钟
        },

        // 读写分离配置
        readReplicas: [],

        // 安全配置
        security: {
            enableForeignKeys: true,
            busyTimeout: 5000,
            trustedSchema: false
        }
    },

    // 测试环境配置
    test: {
        dbPath: process.env.TEST_DB_PATH || path.join(__dirname, '../test_data/test_railway_safety.db'),

        backup: {
            enabled: false
        },

        pool: {
            enabled: true,
            minConnections: 1,
            maxConnections: 2,
            idleTimeout: 10000,
            connectionTimeout: 2000,
            acquireTimeout: 5000,
            retryAttempts: 1,
            retryDelay: 100
        },

        performance: {
            cacheSize: 1000,
            mmapSize: 67108864, // 64MB
            tempStore: 'memory',
            synchronous: 'OFF', // 测试环境可以关闭同步以提高性能
            journalMode: 'MEMORY',
            walAutocheckpoint: 100
        },

        monitoring: {
            enabled: false
        },

        cache: {
            enabled: false
        },

        readReplicas: [],

        security: {
            enableForeignKeys: true,
            busyTimeout: 1000,
            trustedSchema: false
        }
    },

    // 生产环境配置
    production: {
        dbPath: process.env.DB_PATH || path.join(__dirname, '../data/railway_safety.db'),

        backup: {
            enabled: true,
            backupDir: process.env.DB_BACKUP_DIR || '/var/backups/railway_safety',
            autoBackupInterval: 6 * 60 * 60 * 1000, // 6小时
            maxBackupFiles: 30, // 保留30个备份文件
            compressBackups: true,
            backupOnShutdown: true
        },

        pool: {
            enabled: true,
            minConnections: 2,
            maxConnections: 10,
            idleTimeout: 60000, // 60秒
            connectionTimeout: 10000, // 10秒
            acquireTimeout: 30000, // 30秒
            retryAttempts: 5,
            retryDelay: 2000,
            maxWaitingRequests: 50
        },

        performance: {
            cacheSize: 20000,
            mmapSize: 1073741824, // 1GB
            tempStore: 'memory',
            synchronous: 'FULL', // 生产环境需要完全同步
            journalMode: 'WAL',
            walAutocheckpoint: 1000,
            cacheSpill: false,
            optimizeOnStartup: true
        },

        monitoring: {
            enabled: true,
            slowQueryThreshold: 500, // 500ms
            healthCheckInterval: 15000, // 15秒
            metricsInterval: 1000, // 1秒
            enableProfiling: true,
            maxQueryHistory: 10000,
            alertThresholds: {
                errorRate: 0.01, // 1%
                slowQueryRate: 0.05, // 5%
                connectionUsage: 0.8, // 80%
                responseTime: 2000 // 2秒
            }
        },

        cache: {
            enabled: true,
            maxSize: 500,
            defaultTTL: 600000, // 10分钟
            cleanupInterval: 300000, // 5分钟
            distributedCache: false
        },

        // 生产环境可以配置只读副本
        readReplicas: process.env.READ_REPLICA_PATHS ?
            process.env.READ_REPLICA_PATHS.split(',') : [],

        security: {
            enableForeignKeys: true,
            busyTimeout: 10000,
            trustedSchema: false,
            queryTimeout: 30000 // 30秒查询超时
        }
    }
};

// 获取当前环境的配置
const env = process.env.NODE_ENV || 'development';
const currentConfig = databaseConfig[env] || databaseConfig.development;

// 验证配置
function validateConfig(config) {
    const errors = [];

    // 验证数据库路径
    if (!config.dbPath) {
        errors.push('数据库路径不能为空');
    }

    // 验证连接池配置
    if (config.pool.enabled) {
        if (config.pool.minConnections < 0) {
            errors.push('最小连接数不能小于0');
        }
        if (config.pool.maxConnections < config.pool.minConnections) {
            errors.push('最大连接数不能小于最小连接数');
        }
        if (config.pool.maxConnections > 50) {
            console.warn('警告：最大连接数设置过大，可能影响性能');
        }
    }

    // 验证备份配置
    if (config.backup.enabled) {
        if (!config.backup.backupDir) {
            errors.push('备份目录不能为空');
        }
        if (config.backup.maxBackupFiles < 1) {
            errors.push('备份文件保留数量不能小于1');
        }
    }

    // 验证监控配置
    if (config.monitoring.enabled) {
        if (config.monitoring.slowQueryThreshold < 100) {
            console.warn('警告：慢查询阈值设置过小，可能产生大量日志');
        }
        if (config.monitoring.healthCheckInterval < 5000) {
            console.warn('警告：健康检查间隔设置过小，可能影响性能');
        }
    }

    if (errors.length > 0) {
        throw new Error(`数据库配置验证失败：\n${errors.join('\n')}`);
    }

    return true;
}

// 验证当前配置
try {
    validateConfig(currentConfig);
    console.log(`数据库配置验证通过 [环境: ${env}]`);
} catch (error) {
    console.error('数据库配置错误:', error.message);
    process.exit(1);
}

// 导出配置和工具函数
module.exports = {
    config: currentConfig,
    databaseConfig,
    validateConfig,

    // 获取特定环境的配置
    getConfig: (environment = process.env.NODE_ENV) => {
        return databaseConfig[environment] || databaseConfig.development;
    },

    // 更新配置
    updateConfig: (updates) => {
        Object.assign(currentConfig, updates);
        validateConfig(currentConfig);
    },

    // 获取SQLite PRAGMA配置
    getPragmaConfig: (config) => {
        const performance = config.performance;
        return {
            'journal_mode': performance.journalMode,
            'synchronous': performance.synchronous,
            'cache_size': performance.cacheSize,
            'temp_store': performance.tempStore,
            'mmap_size': performance.mmapSize,
            'wal_autocheckpoint': performance.walAutocheckpoint || 1000,
            'foreign_keys': config.security.enableForeignKeys ? 'ON' : 'OFF',
            'busy_timeout': config.security.busyTimeout
        };
    },

    // 创建数据库URL
    createDatabaseUrl: (config) => {
        return `sqlite:${config.dbPath}`;
    },

    // 获取推荐配置
    getRecommendedConfig: (environment, usage = 'standard') => {
        const baseConfig = databaseConfig[environment] || databaseConfig.development;
        const recommendations = {
            standard: {
                // 标准使用场景
            },
            high_concurrency: {
                // 高并发场景
                pool: {
                    maxConnections: 20,
                    idleTimeout: 120000
                },
                performance: {
                    cacheSize: 50000,
                    mmapSize: 2147483648 // 2GB
                }
            },
            large_dataset: {
                // 大数据集场景
                performance: {
                    cacheSize: 100000,
                    mmapSize: 4294967296, // 4GB
                    walAutocheckpoint: 4000
                }
            },
            embedded: {
                // 嵌入式场景
                pool: {
                    enabled: false
                },
                monitoring: {
                    enabled: false
                },
                cache: {
                    enabled: false
                }
            }
        };

        return {
            ...baseConfig,
            ...recommendations[usage]
        };
    }
};