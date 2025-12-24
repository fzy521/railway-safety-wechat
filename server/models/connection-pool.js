const Database = require('better-sqlite3');
const EventEmitter = require('events');

/**
 * SQLite连接池管理器
 * 提供连接池功能，支持多连接管理和负载均衡
 */
class ConnectionPool extends EventEmitter {
    constructor(options = {}) {
        super();

        this.dbPath = options.dbPath;
        this.minConnections = options.minConnections || 1;
        this.maxConnections = options.maxConnections || 5;
        this.idleTimeout = options.idleTimeout || 30000; // 30秒
        this.connectionTimeout = options.connectionTimeout || 5000; // 5秒
        this.acquireTimeout = options.acquireTimeout || 10000; // 10秒

        this.connections = [];
        this.available = [];
        this.inUse = new Set();
        this.waiting = [];
        this.isClosing = false;
        this.stats = {
            created: 0,
            destroyed: 0,
            acquired: 0,
            released: 0,
            timeouts: 0,
            errors: 0
        };

        // 初始化连接池
        this.initialize();
    }

    /**
     * 初始化连接池
     */
    async initialize() {
        try {
            // 创建最小连接数
            for (let i = 0; i < this.minConnections; i++) {
                await this.createConnection();
            }

            this.emit('ready');
            console.log(`连接池初始化完成: ${this.connections.length}/${this.maxConnections}`);
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * 创建新连接
     */
    async createConnection() {
        const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        try {
            const db = new Database(this.dbPath);

            // 配置连接参数
            db.pragma('journal_mode = WAL');
            db.pragma('foreign_keys = ON');
            db.pragma('synchronous = NORMAL');
            db.pragma('cache_size = 10000');
            db.pragma('temp_store = memory');
            db.pragma('mmap_size = 268435456');

            const connection = {
                id: connectionId,
                db: db,
                createdAt: Date.now(),
                lastUsed: Date.now(),
                useCount: 0,
                inTransaction: false,
                isHealthy: true
            };

            // 监听连接错误
            db.on('error', (error) => {
                console.error(`连接错误 [${connectionId}]:`, error);
                connection.isHealthy = false;
                this.stats.errors++;
                this.destroyConnection(connection);
            });

            this.connections.push(connection);
            this.available.push(connection);
            this.stats.created++;

            return connection;
        } catch (error) {
            console.error('创建连接失败:', error);
            throw error;
        }
    }

    /**
     * 获取连接
     */
    async acquire() {
        if (this.isClosing) {
            throw new Error('连接池正在关闭');
        }

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.stats.timeouts++;
                reject(new Error('获取连接超时'));
            }, this.acquireTimeout);

            const tryAcquire = async () => {
                try {
                    // 优先使用可用连接
                    if (this.available.length > 0) {
                        const connection = this.available.shift();

                        if (!connection.isHealthy) {
                            this.destroyConnection(connection);
                            tryAcquire();
                            return;
                        }

                        this.inUse.add(connection);
                        connection.lastUsed = Date.now();
                        connection.useCount++;
                        this.stats.acquired++;

                        clearTimeout(timeout);
                        resolve(connection);
                        return;
                    }

                    // 创建新连接（如果未达到最大连接数）
                    if (this.connections.length < this.maxConnections) {
                        const connection = await this.createConnection();
                        this.inUse.add(connection);
                        connection.useCount++;
                        this.stats.acquired++;

                        clearTimeout(timeout);
                        resolve(connection);
                        return;
                    }

                    // 等待可用连接
                    this.waiting.push({ resolve, reject, timeout, tryAcquire });
                } catch (error) {
                    clearTimeout(timeout);
                    reject(error);
                }
            };

            tryAcquire();
        });
    }

    /**
     * 释放连接
     */
    release(connection) {
        if (!this.inUse.has(connection)) {
            console.warn('尝试释放未使用的连接');
            return;
        }

        this.inUse.delete(connection);

        // 如果连接不健康，销毁它
        if (!connection.isHealthy || connection.db.open === false) {
            this.destroyConnection(connection);
        } else {
            // 重置连接状态
            if (connection.inTransaction) {
                try {
                    connection.db.exec('ROLLBACK');
                    connection.inTransaction = false;
                } catch (error) {
                    console.error('回滚事务失败:', error);
                    connection.isHealthy = false;
                }
            }

            // 如果有等待的请求，立即分配
            if (this.waiting.length > 0) {
                const waiter = this.waiting.shift();
                clearTimeout(waiter.timeout);
                this.inUse.add(connection);
                connection.lastUsed = Date.now();
                connection.useCount++;
                waiter.resolve(connection);
            } else {
                this.available.push(connection);
            }
        }

        this.stats.released++;
    }

    /**
     * 销毁连接
     */
    destroyConnection(connection) {
        try {
            if (connection.db && connection.db.open) {
                connection.db.close();
            }

            // 从数组中移除
            this.connections = this.connections.filter(c => c.id !== connection.id);
            this.available = this.available.filter(c => c.id !== connection.id);
            this.inUse.delete(connection);

            this.stats.destroyed++;
            this.emit('connectionDestroyed', connection.id);
        } catch (error) {
            console.error('销毁连接失败:', error);
        }
    }

    /**
     * 执行查询（自动管理连接）
     */
    async query(sql, params = []) {
        const connection = await this.acquire();

        try {
            const stmt = connection.db.prepare(sql);
            const result = stmt.all(...params);
            return result;
        } finally {
            this.release(connection);
        }
    }

    /**
     * 执行更新（自动管理连接）
     */
    async run(sql, params = []) {
        const connection = await this.acquire();

        try {
            const stmt = connection.db.prepare(sql);
            const result = stmt.run(...params);
            return result;
        } finally {
            this.release(connection);
        }
    }

    /**
     * 执行事务（自动管理连接）
     */
    async transaction(fn) {
        const connection = await this.acquire();

        try {
            connection.inTransaction = true;
            const result = connection.db.transaction(fn)();
            connection.inTransaction = false;
            return result;
        } catch (error) {
            if (connection.inTransaction) {
                try {
                    connection.db.exec('ROLLBACK');
                } catch (rollbackError) {
                    console.error('回滚失败:', rollbackError);
                }
                connection.inTransaction = false;
            }
            throw error;
        } finally {
            this.release(connection);
        }
    }

    /**
     * 健康检查
     */
    async healthCheck() {
        const results = {
            total: this.connections.length,
            available: this.available.length,
            inUse: this.inUse.size,
            waiting: this.waiting.length,
            healthy: 0,
            stats: { ...this.stats }
        };

        // 检查每个连接的健康状态
        for (const connection of this.connections) {
            if (connection.isHealthy) {
                try {
                    connection.db.prepare('SELECT 1').get();
                    results.healthy++;
                } catch (error) {
                    connection.isHealthy = false;
                }
            }
        }

        return results;
    }

    /**
     * 清理空闲连接
     */
    cleanup() {
        const now = Date.now();
        const toRemove = [];

        for (const connection of this.available) {
            if (this.connections.length > this.minConnections &&
                (now - connection.lastUsed) > this.idleTimeout) {
                toRemove.push(connection);
            }
        }

        toRemove.forEach(connection => {
            this.destroyConnection(connection);
        });

        return toRemove.length;
    }

    /**
     * 关闭连接池
     */
    async close() {
        this.isClosing = true;

        // 拒绝新的获取请求
        for (const waiter of this.waiting) {
            clearTimeout(waiter.timeout);
            waiter.reject(new Error('连接池正在关闭'));
        }
        this.waiting = [];

        // 等待所有连接释放
        let attempts = 0;
        while (this.inUse.size > 0 && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        if (this.inUse.size > 0) {
            console.warn(`强制关闭 ${this.inUse.size} 个正在使用的连接`);
        }

        // 关闭所有连接
        for (const connection of this.connections) {
            this.destroyConnection(connection);
        }

        this.emit('closed');
        console.log('连接池已关闭');
    }

    /**
     * 获取统计信息
     */
    getStats() {
        return {
            connections: {
                total: this.connections.length,
                available: this.available.length,
                inUse: this.inUse.size,
                waiting: this.waiting.length
            },
            config: {
                min: this.minConnections,
                max: this.maxConnections,
                idleTimeout: this.idleTimeout,
                connectionTimeout: this.connectionTimeout,
                acquireTimeout: this.acquireTimeout
            },
            stats: { ...this.stats }
        };
    }
}

module.exports = ConnectionPool;