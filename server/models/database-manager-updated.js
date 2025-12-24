const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const ConnectionPool = require('./connection-pool');
const DatabaseMonitor = require('../utils/database-monitor');
const { config: dbConfig, getPragmaConfig } = require('../../config/database');

/**
 * 更新版数据库管理器
 * 集成连接池、监控、配置管理等高级功能
 */
class DatabaseManager {
    constructor(options = {}) {
        // 合并配置
        this.config = {
            dbPath: options.dbPath || dbConfig.dbPath,
            usePool: options.usePool !== undefined ? options.usePool : dbConfig.pool.enabled,
            enableMonitoring: options.enableMonitoring !== undefined ? options.enableMonitoring : dbConfig.monitoring.enabled,
            enableCache: options.enableCache !== undefined ? options.enableCache : dbConfig.cache.enabled,
            ...options
        };

        // 初始化属性
        this.db = null;
        this.pool = null;
        this.monitor = null;
        this.isInitialized = false;
        this.cache = new Map();
        this.metrics = {
            queries: 0,
            cacheHits: 0,
            cacheMisses: 0,
            errors: 0,
            slowQueries: 0,
            startTime: Date.now()
        };

        // 确保数据目录存在
        this.ensureDataDirectory();

        // 初始化数据库
        this.initialize();
    }

    /**
     * 初始化数据库
     */
    async initialize() {
        try {
            // 初始化连接
            if (this.config.usePool) {
                await this.initializePool();
            } else {
                this.connect();
            }

            // 初始化数据库结构
            await this.initDatabase();

            // 初始化监控
            if (this.config.enableMonitoring) {
                this.initializeMonitoring();
            }

            this.isInitialized = true;
            console.log('数据库管理器初始化完成');
        } catch (error) {
            console.error('数据库初始化失败:', error);
            throw error;
        }
    }

    /**
     * 初始化连接池
     */
    async initializePool() {
        const poolConfig = dbConfig.pool;

        this.pool = new ConnectionPool({
            dbPath: this.config.dbPath,
            minConnections: poolConfig.minConnections,
            maxConnections: poolConfig.maxConnections,
            idleTimeout: poolConfig.idleTimeout,
            connectionTimeout: poolConfig.connectionTimeout,
            acquireTimeout: poolConfig.acquireTimeout
        });

        // 监听连接池事件
        this.pool.on('error', (error) => {
            console.error('连接池错误:', error);
            this.metrics.errors++;
        });

        return new Promise((resolve, reject) => {
            this.pool.once('ready', resolve);
            this.pool.once('error', reject);
        });
    }

    /**
     * 连接数据库（单连接模式）
     */
    connect() {
        try {
            this.db = new Database(this.config.dbPath);

            // 应用性能优化配置
            const pragmaConfig = getPragmaConfig(dbConfig);
            Object.entries(pragmaConfig).forEach(([key, value]) => {
                try {
                    this.db.pragma(`${key} = ${value}`);
                } catch (error) {
                    console.warn(`设置PRAGMA ${key}失败:`, error.message);
                }
            });

            console.log(`数据库连接成功: ${this.config.dbPath}`);
        } catch (error) {
            console.error('数据库连接失败:', error);
            throw error;
        }
    }

    /**
     * 确保数据目录存在
     */
    ensureDataDirectory() {
        const dataDir = path.dirname(this.config.dbPath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
    }

    /**
     * 初始化数据库结构
     */
    async initDatabase() {
        if (this.isInitialized) {
            return;
        }

        try {
            // 执行架构SQL
            const schemaPath = path.join(__dirname, '../../database/schema.sql');
            if (fs.existsSync(schemaPath)) {
                const schema = fs.readFileSync(schemaPath, 'utf8');

                if (this.config.usePool) {
                    await this.pool.transaction((db) => {
                        db.exec(schema);
                    });
                } else {
                    this.db.exec(schema);
                }
                console.log('数据库架构创建完成');
            }

            // 检查是否需要插入初始数据
            const userCount = await this.get('SELECT COUNT(*) as count FROM users');
            if (userCount.count === 0) {
                await this.seedDatabase();
            }

            this.isInitialized = true;
            console.log('数据库初始化完成');
        } catch (error) {
            console.error('数据库初始化失败:', error);
            throw error;
        }
    }

    /**
     * 插入初始数据
     */
    async seedDatabase() {
        try {
            const seedsPath = path.join(__dirname, '../../database/seeds.sql');
            if (fs.existsSync(seedsPath)) {
                const seeds = fs.readFileSync(seedsPath, 'utf8');

                if (this.config.usePool) {
                    await this.pool.transaction((db) => {
                        db.exec(seeds);
                    });
                } else {
                    this.db.exec(seeds);
                }
                console.log('初始数据插入完成');
            }
        } catch (error) {
            console.error('初始数据插入失败:', error);
            throw error;
        }
    }

    /**
     * 初始化监控
     */
    initializeMonitoring() {
        this.monitor = new DatabaseMonitor(this, {
            enableLogging: dbConfig.monitoring.enabled,
            slowQueryThreshold: dbConfig.monitoring.slowQueryThreshold,
            healthCheckInterval: dbConfig.monitoring.healthCheckInterval,
            enableProfiling: dbConfig.monitoring.enableProfiling,
            maxProfileHistory: dbConfig.monitoring.maxQueryHistory
        });

        // 监听监控事件
        this.monitor.on('slowQuery', (queryInfo) => {
            this.metrics.slowQueries++;
            console.warn(`[慢查询] ${queryInfo.duration}ms: ${queryInfo.sql}`);
        });

        this.monitor.on('healthAlert', (healthInfo) => {
            console.error('[健康警告]', healthInfo);
        });

        // 启动监控
        this.monitor.start();
    }

    /**
     * 执行查询（带缓存和监控）
     */
    async query(sql, params = [], options = {}) {
        const startTime = Date.now();
        const cacheKey = options.cacheKey || this.generateCacheKey(sql, params);

        try {
            // 缓存检查
            if (this.config.enableCache && !options.skipCache) {
                const cached = this.cache.get(cacheKey);
                if (cached && cached.expires > Date.now()) {
                    this.metrics.cacheHits++;
                    return cached.data;
                }
                this.metrics.cacheMisses++;
            }

            // 执行查询
            let result;
            if (this.config.usePool) {
                result = await this.pool.query(sql, params);
            } else {
                const stmt = this.db.prepare(sql);
                result = stmt.all(...params);
            }

            // 缓存结果
            if (this.config.enableCache && options.cacheTTL) {
                this.cache.set(cacheKey, {
                    data: result,
                    expires: Date.now() + options.cacheTTL
                });
            }

            // 记录监控数据
            const duration = Date.now() - startTime;
            this.metrics.queries++;

            if (this.monitor) {
                this.monitor.recordQuery({
                    sql,
                    params,
                    duration,
                    timestamp: startTime,
                    cacheHit: false
                });
            }

            return result;
        } catch (error) {
            this.metrics.errors++;

            if (this.monitor) {
                this.monitor.recordError(error);
            }

            throw error;
        }
    }

    /**
     * 执行更新操作
     */
    async run(sql, params = [], options = {}) {
        const startTime = Date.now();

        try {
            let result;
            if (this.config.usePool) {
                result = await this.pool.run(sql, params);
            } else {
                const stmt = this.db.prepare(sql);
                result = stmt.run(...params);
            }

            // 清除相关缓存
            if (this.config.enableCache && options.invalidateCache !== false) {
                this.invalidateCache(sql);
            }

            // 记录监控数据
            const duration = Date.now() - startTime;
            this.metrics.queries++;

            if (this.monitor) {
                this.monitor.recordQuery({
                    sql,
                    params,
                    duration,
                    timestamp: startTime,
                    isUpdate: true
                });
            }

            return result;
        } catch (error) {
            this.metrics.errors++;

            if (this.monitor) {
                this.monitor.recordError(error);
            }

            throw error;
        }
    }

    /**
     * 执行事务
     */
    async transaction(fn, options = {}) {
        if (this.config.usePool) {
            return this.pool.transaction(fn);
        } else {
            const tx = this.db.transaction(fn);
            return tx();
        }
    }

    /**
     * 查询单条记录
     */
    async get(sql, params = [], options = {}) {
        const results = await this.query(sql, params, options);
        return results && results.length > 0 ? results[0] : null;
    }

    /**
     * 查询多条记录
     */
    async all(sql, params = [], options = {}) {
        return this.query(sql, params, options);
    }

    /**
     * 插入记录
     */
    async insert(table, data, options = {}) {
        const columns = Object.keys(data);
        const placeholders = columns.map(() => '?').join(', ');
        const values = Object.values(data);

        const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
        const result = await this.run(sql, values, options);

        return {
            success: true,
            insertId: result.lastInsertRowid,
            changes: result.changes
        };
    }

    /**
     * 更新记录
     */
    async update(table, data, where, options = {}) {
        const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
        const values = [...Object.values(data), ...Object.values(where)];

        const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
        const result = await this.run(sql, values, options);

        return {
            success: true,
            changes: result.changes
        };
    }

    /**
     * 删除记录
     */
    async delete(table, where, options = {}) {
        const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
        const values = Object.values(where);

        const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
        const result = await this.run(sql, values, options);

        return {
            success: true,
            changes: result.changes
        };
    }

    /**
     * 分页查询
     */
    async paginate(sql, params = [], page = 1, limit = 20, options = {}) {
        const offset = (page - 1) * limit;

        // 查询总记录数
        const countSql = `SELECT COUNT(*) as total FROM (${sql}) as count_query`;
        const countResult = await this.get(countSql, params, options);
        const total = countResult.total;

        // 查询分页数据
        const dataSql = `${sql} LIMIT ${limit} OFFSET ${offset}`;
        const data = await this.all(dataSql, params, options);

        return {
            success: true,
            data,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        };
    }

    /**
     * 获取数据库统计信息
     */
    async getStats() {
        const tables = [
            'users', 'roles', 'permissions', 'risk_assessments',
            'incident_reports', 'training_records', 'certificates',
            'inspection_points', 'inspection_records', 'operation_logs'
        ];

        const stats = {};
        for (const table of tables) {
            try {
                const result = await this.get(`SELECT COUNT(*) as count FROM ${table}`);
                stats[table] = result.count;
            } catch (error) {
                stats[table] = 0;
            }
        }

        return {
            success: true,
            stats,
            dbPath: this.config.dbPath,
            isInitialized: this.isInitialized,
            metrics: this.metrics,
            pool: this.config.usePool ? this.pool.getStats() : null,
            monitoring: this.monitor ? this.monitor.getCurrentMetrics() : null
        };
    }

    /**
     * 数据库备份
     */
    async backup(backupPath = null) {
        try {
            if (!backupPath) {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const backupDir = dbConfig.backup.backupDir;
                if (!fs.existsSync(backupDir)) {
                    fs.mkdirSync(backupDir, { recursive: true });
                }
                backupPath = path.join(backupDir, `railway_safety_${timestamp}.db`);
            }

            if (this.config.usePool) {
                // 暂停写入操作进行备份
                await this.pool.transaction(() => {
                    fs.copyFileSync(this.config.dbPath, backupPath);
                });
            } else {
                fs.copyFileSync(this.config.dbPath, backupPath);
            }

            console.log(`数据库备份完成: ${backupPath}`);
            return {
                success: true,
                backupPath,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('数据库备份失败:', error);
            throw error;
        }
    }

    /**
     * 数据库恢复
     */
    async restore(backupPath) {
        try {
            if (!fs.existsSync(backupPath)) {
                throw new Error('备份文件不存在');
            }

            // 关闭当前连接
            await this.close();

            // 恢复数据库文件
            fs.copyFileSync(backupPath, this.config.dbPath);

            // 重新初始化
            await this.initialize();

            console.log(`数据库恢复完成: ${backupPath}`);
            return {
                success: true,
                backupPath,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('数据库恢复失败:', error);
            throw error;
        }
    }

    /**
     * 优化数据库
     */
    async optimize() {
        try {
            if (this.config.usePool) {
                await this.pool.transaction((db) => {
                    db.exec('VACUUM');
                    db.exec('ANALYZE');
                });
            } else {
                this.db.exec('VACUUM');
                this.db.exec('ANALYZE');
            }
            console.log('数据库优化完成');
        } catch (error) {
            console.error('数据库优化失败:', error);
            throw error;
        }
    }

    /**
     * 健康检查
     */
    async healthCheck() {
        const results = {
            database: 'unknown',
            pool: 'unknown',
            monitoring: 'unknown',
            metrics: this.metrics,
            timestamp: new Date().toISOString()
        };

        try {
            // 检查数据库连接
            await this.get('SELECT 1');
            results.database = 'ok';

            // 检查连接池
            if (this.config.usePool) {
                const poolStats = await this.pool.healthCheck();
                results.pool = poolStats;
            }

            // 检查监控状态
            if (this.monitor) {
                results.monitoring = this.monitor.getCurrentMetrics();
            }

            return {
                success: true,
                ...results
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                ...results
            };
        }
    }

    /**
     * 关闭数据库连接
     */
    async close() {
        try {
            // 停止监控
            if (this.monitor) {
                this.monitor.stop();
            }

            // 关闭连接池
            if (this.pool) {
                await this.pool.close();
            }

            // 关闭单连接
            if (this.db) {
                this.db.close();
            }

            console.log('数据库管理器已关闭');
        } catch (error) {
            console.error('关闭数据库管理器失败:', error);
            throw error;
        }
    }

    // 私有辅助方法

    generateCacheKey(sql, params) {
        return `${sql}:${JSON.stringify(params)}`;
    }

    invalidateCache(sql) {
        // 简单实现：清除所有缓存
        // 可以根据SQL分析更精确地清除相关缓存
        this.cache.clear();
    }

    /**
     * 获取数据库实例（兼容旧代码）
     */
    getDatabase() {
        if (this.config.usePool) {
            throw new Error('连接池模式下不支持直接获取数据库实例');
        }
        if (!this.db) {
            throw new Error('数据库未连接');
        }
        return this.db;
    }
}

module.exports = DatabaseManager;