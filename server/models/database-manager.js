const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

/**
 * 数据库管理器类
 * 负责SQLite数据库的连接、初始化和基础操作
 */
class DatabaseManager {
    constructor(dbPath = null) {
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
        this.db = null;
        this.isInitialized = false;
        
        // 确保数据目录存在
        this.ensureDataDirectory();
        
        // 初始化数据库连接
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
     * 连接数据库
     */
    connect() {
        try {
            this.db = new Database(this.dbPath);
            
            // 配置SQLite优化参数
            this.db.pragma('journal_mode = WAL');           // 提高并发性能
            this.db.pragma('foreign_keys = ON');            // 启用外键约束
            this.db.pragma('synchronous = NORMAL');         // 平衡性能和安全性
            this.db.pragma('cache_size = 10000');           // 设置缓存大小
            this.db.pragma('temp_store = memory');          // 临时表存储在内存
            this.db.pragma('mmap_size = 268435456');        // 启用内存映射(256MB)
            
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
                this.db.exec(schema);
                console.log('数据库架构创建完成');
            }

            // 检查是否需要插入初始数据
            const userCount = this.db.prepare('SELECT COUNT(*) as count FROM users').get();
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
                this.db.exec(seeds);
                console.log('初始数据插入完成');
            }
        } catch (error) {
            console.error('初始数据插入失败:', error);
            throw error;
        }
    }

    /**
     * 执行事务
     * @param {Function} fn - 事务函数
     * @returns {any} - 事务执行结果
     */
    transaction(fn) {
        const tx = this.db.transaction(fn);
        return tx();
    }

    /**
     * 准备SQL语句
     * @param {string} sql - SQL语句
     * @returns {Statement} - 预处理语句对象
     */
    prepare(sql) {
        return this.db.prepare(sql);
    }

    /**
     * 执行SQL语句
     * @param {string} sql - SQL语句
     * @param {Array} params - 参数数组
     * @returns {any} - 执行结果
     */
    exec(sql, params = []) {
        try {
            const stmt = this.db.prepare(sql);
            return stmt.run(...params);
        } catch (error) {
            console.error('SQL执行错误:', error, 'SQL:', sql);
            throw error;
        }
    }

    /**
     * 查询单条记录
     * @param {string} sql - SQL语句
     * @param {Array} params - 参数数组
     * @returns {Object|null} - 查询结果
     */
    get(sql, params = []) {
        try {
            const stmt = this.db.prepare(sql);
            return stmt.get(...params);
        } catch (error) {
            console.error('查询错误:', error, 'SQL:', sql);
            throw error;
        }
    }

    /**
     * 查询多条记录
     * @param {string} sql - SQL语句
     * @param {Array} params - 参数数组
     * @returns {Array} - 查询结果数组
     */
    all(sql, params = []) {
        try {
            const stmt = this.db.prepare(sql);
            return stmt.all(...params);
        } catch (error) {
            console.error('查询错误:', error, 'SQL:', sql);
            throw error;
        }
    }

    /**
     * 插入记录
     * @param {string} table - 表名
     * @param {Object} data - 数据对象
     * @returns {Object} - 插入结果
     */
    insert(table, data) {
        try {
            const columns = Object.keys(data);
            const placeholders = columns.map(() => '?').join(', ');
            const values = Object.values(data);
            
            const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
            const stmt = this.db.prepare(sql);
            const result = stmt.run(...values);
            
            return {
                success: true,
                insertId: result.lastInsertRowid,
                changes: result.changes
            };
        } catch (error) {
            console.error('插入错误:', error, 'Table:', table, 'Data:', data);
            throw error;
        }
    }

    /**
     * 更新记录
     * @param {string} table - 表名
     * @param {Object} data - 更新数据
     * @param {Object} where - WHERE条件
     * @returns {Object} - 更新结果
     */
    update(table, data, where) {
        try {
            const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
            const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
            const values = [...Object.values(data), ...Object.values(where)];
            
            const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
            const stmt = this.db.prepare(sql);
            const result = stmt.run(...values);
            
            return {
                success: true,
                changes: result.changes
            };
        } catch (error) {
            console.error('更新错误:', error, 'Table:', table, 'Data:', data, 'Where:', where);
            throw error;
        }
    }

    /**
     * 删除记录
     * @param {string} table - 表名
     * @param {Object} where - WHERE条件
     * @returns {Object} - 删除结果
     */
    delete(table, where) {
        try {
            const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
            const values = Object.values(where);
            
            const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
            const stmt = this.db.prepare(sql);
            const result = stmt.run(...values);
            
            return {
                success: true,
                changes: result.changes
            };
        } catch (error) {
            console.error('删除错误:', error, 'Table:', table, 'Where:', where);
            throw error;
        }
    }

    /**
     * 分页查询
     * @param {string} sql - SQL语句
     * @param {Array} params - 参数数组
     * @param {number} page - 页码
     * @param {number} limit - 每页记录数
     * @returns {Object} - 分页查询结果
     */
    paginate(sql, params = [], page = 1, limit = 20) {
        try {
            const offset = (page - 1) * limit;
            
            // 查询总记录数
            const countSql = `SELECT COUNT(*) as total FROM (${sql}) as count_query`;
            const countResult = this.get(countSql, params);
            const total = countResult.total;
            
            // 查询分页数据
            const dataSql = `${sql} LIMIT ${limit} OFFSET ${offset}`;
            const data = this.all(dataSql, params);
            
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
        } catch (error) {
            console.error('分页查询错误:', error, 'SQL:', sql);
            throw error;
        }
    }

    /**
     * 获取数据库统计信息
     * @returns {Object} - 统计信息
     */
    getStats() {
        try {
            const tables = [
                'users', 'roles', 'permissions', 'risk_assessments', 
                'incident_reports', 'training_records', 'certificates',
                'inspection_points', 'inspection_records', 'operation_logs'
            ];
            
            const stats = {};
            tables.forEach(table => {
                try {
                    const result = this.get(`SELECT COUNT(*) as count FROM ${table}`);
                    stats[table] = result.count;
                } catch (error) {
                    stats[table] = 0;
                }
            });
            
            return {
                success: true,
                stats,
                dbPath: this.dbPath,
                isInitialized: this.isInitialized
            };
        } catch (error) {
            console.error('获取统计信息错误:', error);
            throw error;
        }
    }

    /**
     * 数据库备份
     * @param {string} backupPath - 备份文件路径
     * @returns {Object} - 备份结果
     */
    backup(backupPath = null) {
        try {
            if (!backupPath) {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const backupDir = process.env.DB_BACKUP_DIR || './backups';
                if (!fs.existsSync(backupDir)) {
                    fs.mkdirSync(backupDir, { recursive: true });
                }
                backupPath = path.join(backupDir, `railway_safety_${timestamp}.db`);
            }
            
            fs.copyFileSync(this.dbPath, backupPath);
            
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
     * @param {string} backupPath - 备份文件路径
     * @returns {Object} - 恢复结果
     */
    restore(backupPath) {
        try {
            if (!fs.existsSync(backupPath)) {
                throw new Error('备份文件不存在');
            }
            
            // 关闭当前连接
            this.close();
            
            // 恢复数据库
            fs.copyFileSync(backupPath, this.dbPath);
            
            // 重新连接
            this.connect();
            
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
    optimize() {
        try {
            this.db.exec('VACUUM');
            this.db.exec('ANALYZE');
            console.log('数据库优化完成');
        } catch (error) {
            console.error('数据库优化失败:', error);
            throw error;
        }
    }

    /**
     * 检查数据库健康状态
     * @returns {Object} - 健康状态
     */
    healthCheck() {
        try {
            // 检查数据库连接
            const result = this.get('SELECT 1 as test');
            
            // 检查外键约束
            const fkCheck = this.get('PRAGMA foreign_key_check');
            
            // 检查数据库完整性
            const integrityCheck = this.get('PRAGMA integrity_check');
            
            return {
                success: true,
                connection: result ? 'ok' : 'failed',
                foreignKeys: fkCheck ? 'issues_found' : 'ok',
                integrity: integrityCheck.integrity_check === 'ok' ? 'ok' : 'issues_found',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('健康检查失败:', error);
            return {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * 关闭数据库连接
     */
    close() {
        try {
            if (this.db) {
                this.db.close();
                this.db = null;
                console.log('数据库连接已关闭');
            }
        } catch (error) {
            console.error('关闭数据库连接失败:', error);
        }
    }

    /**
     * 获取数据库实例
     * @returns {Database} - SQLite数据库实例
     */
    getDatabase() {
        if (!this.db) {
            throw new Error('数据库未连接');
        }
        return this.db;
    }
}

module.exports = DatabaseManager;