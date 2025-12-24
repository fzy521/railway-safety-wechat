const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const ConnectionPool = require('./connection-pool');
const EventEmitter = require('events');

/**
 * 增强版数据库管理器类
 * 支持连接池、读写分离、自动重连、性能监控等高级功能
 */
class DatabaseManagerEnhanced extends EventEmitter {
    constructor(dbPath = null, options = {}) {
        super();

        // 根据环境确定数据库路径
        if (!dbPath) {
            const env = process.env.NODE_ENV || 'development';
            if (env === 'test') {
                dbPath = path.join(__dirname, '../../test_data/test_railway_safety.db');
            } else {
                dbPath = path.join(__dirname, '../../data/railway_safety.db');
            }
        }

        this.dbPath = dbPath;
        this.options = {
            usePool: true,
            poolSize: 5,
            readReplicas: [],
            enableCache: true,
            cacheSize: 100,
            enableMetrics: true,
            retryAttempts: 3,
            retryDelay: 1000,
            healthCheckInterval: 30000,
            ...options
        };

        this.isInitialized = false;
        this.isShuttingDown = false;
        this.primaryPool = null;
        this.readPools = [];
        this.cache = new Map();
        this.metrics = {
            queries: 0,
            cacheHits: 0,
            cacheMisses: 0,
            errors: 0,
            slowQueries: 0,
            connectionRetries: 0,
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
            // 初始化主连接池
            if (this.options.usePool) {
                await this.initializePrimaryPool();
            } else {
                await this.initializeSingleConnection();
            }

            // 初始化只读副本连接池
            if (this.options.readReplicas.length > 0) {
                await this.initializeReadPools();
            }

            // 初始化数据库结构
            await this.initDatabase();

            // 启动健康检查
            if (this.options.healthCheckInterval > 0) {
                this.startHealthCheck();
            }

            this.isInitialized = true;
            this.emit('initialized');
            console.log('数据库管理器初始化完成');
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * 初始化主连接池
     */
    async initializePrimaryPool() {
        this.primaryPool = new ConnectionPool({
            dbPath: this.dbPath,
            minConnections: 1,
            maxConnections: this.options.poolSize,
            idleTimeout: 30000,
            connectionTimeout: 5000,
            acquireTimeout: 10000
        });

        this.primaryPool.on('error', (error) => {
            console.error('主连接池错误:', error);
            this.metrics.errors++;
            this.emit('poolError', error);
        });

        return new Promise((resolve, reject) => {
            this.primaryPool.once('ready', resolve);
            this.primaryPool.once('error', reject);
        });
    }

    /**
     * 初始化只读副本连接池
     */
    async initializeReadPools() {
        for (const replicaPath of this.options.readReplicas) {
            const pool = new ConnectionPool({
                dbPath: replicaPath,
                minConnections: 1,
                maxConnections: Math.ceil(this.options.poolSize / 2),
                idleTimeout: 60000,
                connectionTimeout: 5000,
                acquireTimeout: 10000
            });

            pool.on('error', (error) => {
                console.error(`只读副本连接池错误 [${replicaPath}]:`, error);
                this.metrics.errors++;
            });

            await new Promise((resolve, reject) => {
                pool.once('ready', resolve);
                pool.once('error', reject);
            });

            this.readPools.push(pool);
        }
    }

    /**
     * 初始化单连接模式
     */
    async initializeSingleConnection() {
        this.connect();
    }

    /**
     * 确保数据目录存在
     */
    ensureDataDirectory() {
        const dataDir = path.dirname(this.dbPath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
    }

    /**
     * 连接数据库（单连接模式）
     */
    connect() {
        try {
            this.db = new Database(this.dbPath);

            // 配置SQLite优化参数
            this.db.pragma('journal_mode = WAL');
            this.db.pragma('foreign_keys = ON');
            this.db.pragma('synchronous = NORMAL');
            this.db.pragma('cache_size = 10000');
            this.db.pragma('temp_store = memory');
            this.db.pragma('mmap_size = 268435456');

            console.log(`数据库连接成功: ${this.dbPath}`);
        } catch (error) {
            console.error('数据库连接失败:', error);
            throw error;
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

                if (this.options.usePool) {
                    await this.primaryPool.transaction((db) => {
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

                if (this.options.usePool) {
                    await this.primaryPool.transaction((db) => {
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
     * 执行查询（支持读写分离）
     */
    async query(sql, params = [], options = {}) {
        const startTime = Date.now();

        try {
            // 缓存检查
            if (this.options.enableCache && options.cacheKey) {
                const cached = this.cache.get(options.cacheKey);
                if (cached && cached.expires > Date.now()) {
                    this.metrics.cacheHits++;
                    return cached.data;
                }
                this.metrics.cacheMisses++;
            }

            // 判断是否为读操作
            const isReadQuery = /^\s*(SELECT|PRAGMA)/i.test(sql);
            let result;

            if (this.options.usePool) {
                // 使用只读副本（如果有）
                if (isReadQuery && this.readPools.length > 0) {
                    const poolIndex = Math.floor(Math.random() * this.readPools.length);
                    result = await this.readPools[poolIndex].query(sql, params);
                } else {
                    result = await this.primaryPool.query(sql, params);
                }
            } else {
                const stmt = this.db.prepare(sql);
                result = stmt.all(...params);
            }

            // 缓存结果
            if (this.options.enableCache && options.cacheKey && options.cacheTTL) {
                this.cache.set(options.cacheKey, {
                    data: result,
                    expires: Date.now() + options.cacheTTL
                });
            }

            // 记录慢查询
            const duration = Date.now() - startTime;
            if (duration > 1000) {
                this.metrics.slowQueries++;
                console.warn(`慢查询警告: ${duration}ms - ${sql}`);
            }

            this.metrics.queries++;
            return result;
        } catch (error) {
            this.metrics.errors++;

            // 重试机制
            if (options.retry !== false && this.shouldRetry(error)) {
                await this.delay(this.options.retryDelay);
                return this.query(sql, params, { ...options, retry: (options.retry || this.options.retryAttempts) - 1 });
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

            if (this.options.usePool) {
                result = await this.primaryPool.run(sql, params);
            } else {
                const stmt = this.db.prepare(sql);
                result = stmt.run(...params);
            }

            // 清除相关缓存
            if (this.options.enableCache && options.invalidateCache !== false) {
                this.invalidateCache(sql);
            }

            // 记录慢查询
            const duration = Date.now() - startTime;
            if (duration > 1000) {
                this.metrics.slowQueries++;
                console.warn(`慢更新警告: ${duration}ms - ${sql}`);
            }

            this.metrics.queries++;
            return result;
        } catch (error) {
            this.metrics.errors++;

            // 重试机制
            if (options.retry !== false && this.shouldRetry(error)) {
                await this.delay(this.options.retryDelay);
                return this.run(sql, params, { ...options, retry: (options.retry || this.options.retryAttempts) - 1 });
            }

            throw error;
        }
    }

    /**
     * 执行事务
     */
    async transaction(fn, options = {}) {
        if (this.options.usePool) {
            return this.primaryPool.transaction(fn);
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
            dbPath: this.dbPath,
            isInitialized: this.isInitialized,
            metrics: this.options.enableMetrics ? { ...this.metrics } : null,
            pool: this.options.usePool ? await this.primaryPool.healthCheck() : null
        };
    }

    /**
     * 数据库备份
     */
    async backup(backupPath = null) {
        try {
            if (!backupPath) {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const backupDir = process.env.DB_BACKUP_DIR || './backups';
                if (!fs.existsSync(backupDir)) {
                    fs.mkdirSync(backupDir, { recursive: true });
                }
                backupPath = path.join(backupDir, `railway_safety_${timestamp}.db`);
            }

            if (this.options.usePool) {
                // 暂停写入操作
                await this.primaryPool.transaction(() => {
                    fs.copyFileSync(this.dbPath, backupPath);
                });
            } else {
                fs.copyFileSync(this.dbPath, backupPath);
            }

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

            // 关闭连接池
            if (this.options.usePool && this.primaryPool) {
                await this.primaryPool.close();
            } else if (this.db) {
                this.db.close();
            }

            // 恢复数据库
            fs.copyFileSync(backupPath, this.dbPath);

            // 重新初始化
            if (this.options.usePool) {
                await this.initializePrimaryPool();
            } else {
                this.connect();
            }

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
            if (this.options.usePool) {
                await this.primaryPool.transaction((db) => {
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
            cache: 'unknown',
            metrics: this.metrics,
            timestamp: new Date().toISOString()
        };

        try {
            // 检查数据库
            await this.get('SELECT 1');
            results.database = 'ok';

            // 检查连接池
            if (this.options.usePool && this.primaryPool) {
                const poolStats = await this.primaryPool.healthCheck();
                results.pool = poolStats;
            }

            // 检查缓存
            if (this.options.enableCache) {
                results.cache = {
                    size: this.cache.size,
                    hitRate: this.metrics.queries > 0 ?
                        (this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses) * 100).toFixed(2) + '%' : '0%'
                };
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
        this.isShuttingDown = true;

        try {
            // 关闭连接池
            if (this.primaryPool) {
                await this.primaryPool.close();
            }

            // 关闭只读副本连接池
            for (const pool of this.readPools) {
                await pool.close();
            }

            // 关闭单连接
            if (this.db) {
                this.db.close();
            }

            this.emit('closed');
            console.log('数据库管理器已关闭');
        } catch (error) {
            console.error('关闭数据库管理器失败:', error);
            throw error;
        }
    }

    // 私有辅助方法

    shouldRetry(error) {
        // 判断是否需要重试的错误类型
        return error.code === 'SQLITE_BUSY' || error.code === 'SQLITE_LOCKED';
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    invalidateCache(sql) {
        // 简单的缓存失效策略，可以根据需要改进
        if (this.options.enableCache) {
            // 这里可以实现更智能的缓存失效逻辑
            // 目前简单清除所有缓存
            this.cache.clear();
        }
    }

    startHealthCheck() {
        setInterval(async () => {
            try {
                const health = await this.healthCheck();
                if (!health.success) {
                    this.emit('healthCheckFailed', health);
                }
            } catch (error) {
                console.error('健康检查失败:', error);
            }
        }, this.options.healthCheckInterval);
    }

    /**
     * 获取数据库实例（兼容旧代码）
     */
    getDatabase() {
        if (this.options.usePool) {
            throw new Error('连接池模式下不支持直接获取数据库实例');
        }
        if (!this.db) {
            throw new Error('数据库未连接');
        }
        return this.db;
    }
}

module.exports = DatabaseManagerEnhanced;