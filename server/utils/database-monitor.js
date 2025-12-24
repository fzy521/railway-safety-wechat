const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

/**
 * 数据库监控和诊断工具
 * 提供实时监控、性能分析、查询优化建议等功能
 */
class DatabaseMonitor extends EventEmitter {
    constructor(dbManager, options = {}) {
        super();

        this.dbManager = dbManager;
        this.options = {
            enableLogging: true,
            logSlowQueries: true,
            slowQueryThreshold: 1000, // 1秒
            enableProfiling: true,
            profileInterval: 60000, // 1分钟
            maxProfileHistory: 1000,
            enableHealthCheck: true,
            healthCheckInterval: 30000, // 30秒
            enableMetrics: true,
            metricsInterval: 5000, // 5秒
            ...options
        };

        this.isMonitoring = false;
        this.queryHistory = [];
        this.slowQueries = [];
        this.performanceMetrics = {
            queries: [],
            connections: [],
            errors: [],
            locks: []
        };
        this.currentMetrics = {
            activeQueries: 0,
            totalQueries: 0,
            slowQueries: 0,
            errors: 0,
            avgQueryTime: 0,
            maxQueryTime: 0,
            minQueryTime: Infinity
        };
        this.intervals = {};
    }

    /**
     * 开始监控
     */
    start() {
        if (this.isMonitoring) {
            console.warn('监控已在运行中');
            return;
        }

        this.isMonitoring = true;
        console.log('数据库监控已启动');

        // 启动各种监控任务
        if (this.options.enableProfiling) {
            this.startProfiling();
        }

        if (this.options.enableHealthCheck) {
            this.startHealthCheck();
        }

        if (this.options.enableMetrics) {
            this.startMetricsCollection();
        }

        // 监听数据库事件
        this.setupEventListeners();

        this.emit('started');
    }

    /**
     * 停止监控
     */
    stop() {
        if (!this.isMonitoring) {
            return;
        }

        this.isMonitoring = false;

        // 清除所有定时器
        Object.values(this.intervals).forEach(interval => {
            clearInterval(interval);
        });
        this.intervals = {};

        // 移除事件监听器
        this.removeAllListeners();

        console.log('数据库监控已停止');
        this.emit('stopped');
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 监听查询事件
        this.dbManager.on('query', (queryInfo) => {
            this.recordQuery(queryInfo);
        });

        // 监听错误事件
        this.dbManager.on('error', (error) => {
            this.recordError(error);
        });

        // 监听连接池事件
        if (this.dbManager.primaryPool) {
            this.dbManager.primaryPool.on('acquire', (connection) => {
                this.recordConnectionEvent('acquire', connection);
            });

            this.dbManager.primaryPool.on('release', (connection) => {
                this.recordConnectionEvent('release', connection);
            });

            this.dbManager.primaryPool.on('error', (error) => {
                this.recordConnectionError(error);
            });
        }
    }

    /**
     * 开始性能分析
     */
    startProfiling() {
        this.intervals.profiling = setInterval(async () => {
            try {
                await this.collectPerformanceData();
                await this.analyzeQueryPatterns();
                this.generateOptimizationSuggestions();
            } catch (error) {
                console.error('性能分析失败:', error);
            }
        }, this.options.profileInterval);
    }

    /**
     * 开始健康检查
     */
    startHealthCheck() {
        this.intervals.healthCheck = setInterval(async () => {
            try {
                const health = await this.performHealthCheck();
                if (!health.healthy) {
                    this.emit('healthAlert', health);
                }
            } catch (error) {
                console.error('健康检查失败:', error);
            }
        }, this.options.healthCheckInterval);
    }

    /**
     * 开始指标收集
     */
    startMetricsCollection() {
        this.intervals.metrics = setInterval(async () => {
            try {
                await this.collectMetrics();
                this.emit('metrics', this.getCurrentMetrics());
            } catch (error) {
                console.error('指标收集失败:', error);
            }
        }, this.options.metricsInterval);
    }

    /**
     * 记录查询信息
     */
    recordQuery(queryInfo) {
        const timestamp = Date.now();
        const queryRecord = {
            ...queryInfo,
            timestamp,
            id: `query_${timestamp}_${Math.random().toString(36).substr(2, 9)}`
        };

        this.queryHistory.push(queryRecord);
        this.currentMetrics.totalQueries++;
        this.currentMetrics.activeQueries++;

        // 记录慢查询
        if (queryInfo.duration > this.options.slowQueryThreshold) {
            this.recordSlowQuery(queryRecord);
        }

        // 更新性能指标
        this.updateQueryMetrics(queryInfo.duration);

        // 清理历史记录
        if (this.queryHistory.length > this.options.maxProfileHistory) {
            this.queryHistory = this.queryHistory.slice(-this.options.maxProfileHistory);
        }

        // 记录日志
        if (this.options.enableLogging) {
            this.logQuery(queryRecord);
        }
    }

    /**
     * 记录慢查询
     */
    recordSlowQuery(queryRecord) {
        this.slowQueries.push(queryRecord);
        this.currentMetrics.slowQueries++;

        if (this.options.logSlowQueries) {
            console.warn(`[慢查询警告] ${queryRecord.duration}ms - ${queryRecord.sql}`);
        }

        this.emit('slowQuery', queryRecord);
    }

    /**
     * 更新查询性能指标
     */
    updateQueryMetrics(duration) {
        this.currentMetrics.avgQueryTime = (
            (this.currentMetrics.avgQueryTime * (this.currentMetrics.totalQueries - 1) + duration) /
            this.currentMetrics.totalQueries
        );

        if (duration > this.currentMetrics.maxQueryTime) {
            this.currentMetrics.maxQueryTime = duration;
        }

        if (duration < this.currentMetrics.minQueryTime) {
            this.currentMetrics.minQueryTime = duration;
        }
    }

    /**
     * 记录错误
     */
    recordError(error) {
        this.currentMetrics.errors++;
        this.performanceMetrics.errors.push({
            timestamp: Date.now(),
            error: error.message,
            stack: error.stack
        });

        console.error(`[数据库错误] ${error.message}`);
        this.emit('error', error);
    }

    /**
     * 记录连接事件
     */
    recordConnectionEvent(event, connection) {
        this.performanceMetrics.connections.push({
            timestamp: Date.now(),
            event,
            connectionId: connection.id,
            useCount: connection.useCount
        });

        if (event === 'release') {
            this.currentMetrics.activeQueries--;
        }
    }

    /**
     * 记录连接错误
     */
    recordConnectionError(error) {
        this.currentMetrics.errors++;
        console.error(`[连接池错误] ${error.message}`);
        this.emit('connectionError', error);
    }

    /**
     * 收集性能数据
     */
    async collectPerformanceData() {
        try {
            // 获取数据库统计信息
            const stats = await this.dbManager.getStats();

            // 获取连接池状态
            let poolStats = null;
            if (this.dbManager.primaryPool) {
                poolStats = await this.dbManager.primaryPool.healthCheck();
            }

            // 获取数据库文件信息
            const dbFileStats = this.getDatabaseFileStats();

            this.performanceMetrics.lastStats = {
                timestamp: Date.now(),
                stats,
                poolStats,
                dbFileStats
            };
        } catch (error) {
            console.error('收集性能数据失败:', error);
        }
    }

    /**
     * 获取数据库文件统计
     */
    getDatabaseFileStats() {
        try {
            const dbPath = this.dbManager.dbPath;
            const stats = fs.statSync(dbPath);

            return {
                size: stats.size,
                sizeMB: (stats.size / 1024 / 1024).toFixed(2),
                created: stats.birthtime,
                modified: stats.mtime,
                accessed: stats.atime
            };
        } catch (error) {
            console.error('获取数据库文件统计失败:', error);
            return null;
        }
    }

    /**
     * 分析查询模式
     */
    analyzeQueryPatterns() {
        if (this.queryHistory.length === 0) {
            return;
        }

        // 分析查询频率
        const queryFrequency = {};
        this.queryHistory.forEach(query => {
            const normalized = this.normalizeQuery(query.sql);
            queryFrequency[normalized] = (queryFrequency[normalized] || 0) + 1;
        });

        // 找出最频繁的查询
        const frequentQueries = Object.entries(queryFrequency)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([sql, count]) => ({ sql, count }));

        this.performanceMetrics.queryPatterns = {
            timestamp: Date.now(),
            frequentQueries,
            totalUniqueQueries: Object.keys(queryFrequency).length
        };
    }

    /**
     * 标准化查询（移除参数值）
     */
    normalizeQuery(sql) {
        return sql
            .replace(/\$\d+|\?/g, '?')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();
    }

    /**
     * 生成优化建议
     */
    generateOptimizationSuggestions() {
        const suggestions = [];

        // 检查慢查询
        if (this.slowQueries.length > 0) {
            const slowQueryPatterns = this.analyzeSlowQueryPatterns();
            suggestions.push({
                type: 'slow_query',
                severity: 'high',
                message: `发现 ${this.slowQueries.length} 个慢查询`,
                details: slowQueryPatterns
            });
        }

        // 检查连接池使用率
        if (this.performanceMetrics.lastStats?.poolStats) {
            const poolUsage = this.performanceMetrics.lastStats.poolStats;
            if (poolUsage.inUse / poolUsage.total > 0.8) {
                suggestions.push({
                    type: 'connection_pool',
                    severity: 'medium',
                    message: '连接池使用率过高',
                    details: {
                        usage: `${poolUsage.inUse}/${poolUsage.total}`,
                        recommendation: '考虑增加连接池大小'
                    }
                });
            }
        }

        // 检查错误率
        const errorRate = this.currentMetrics.errors / this.currentMetrics.totalQueries;
        if (errorRate > 0.01) { // 1%错误率
            suggestions.push({
                type: 'error_rate',
                severity: 'high',
                message: `错误率过高: ${(errorRate * 100).toFixed(2)}%`,
                details: {
                    totalErrors: this.currentMetrics.errors,
                    totalQueries: this.currentMetrics.totalQueries
                }
            });
        }

        // 检查数据库文件大小
        if (this.performanceMetrics.lastStats?.dbFileStats) {
            const fileSizeMB = parseFloat(this.performanceMetrics.lastStats.dbFileStats.sizeMB);
            if (fileSizeMB > 1000) { // 1GB
                suggestions.push({
                    type: 'database_size',
                    severity: 'low',
                    message: `数据库文件较大: ${fileSizeMB}MB`,
                    details: {
                        recommendation: '考虑清理历史数据或归档'
                    }
                });
            }
        }

        this.performanceMetrics.optimizationSuggestions = {
            timestamp: Date.now(),
            suggestions
        };

        if (suggestions.length > 0) {
            this.emit('optimizationSuggestions', suggestions);
        }
    }

    /**
     * 分析慢查询模式
     */
    analyzeSlowQueryPatterns() {
        const patterns = {};

        this.slowQueries.forEach(query => {
            const normalized = this.normalizeQuery(query.sql);
            if (!patterns[normalized]) {
                patterns[normalized] = {
                    count: 0,
                    avgDuration: 0,
                    maxDuration: 0,
                    minDuration: Infinity,
                    tables: this.extractTables(query.sql)
                };
            }

            const pattern = patterns[normalized];
            pattern.count++;
            pattern.avgDuration = (pattern.avgDuration * (pattern.count - 1) + query.duration) / pattern.count;
            pattern.maxDuration = Math.max(pattern.maxDuration, query.duration);
            pattern.minDuration = Math.min(pattern.minDuration, query.duration);
        });

        return Object.entries(patterns)
            .sort(([,a], [,b]) => b.avgDuration - a.avgDuration)
            .slice(0, 5)
            .map(([sql, stats]) => ({ sql, stats }));
    }

    /**
     * 提取查询中的表名
     */
    extractTables(sql) {
        const tables = [];
        const regex = /(?:FROM|JOIN|UPDATE|INTO)\s+(\w+)/gi;
        let match;

        while ((match = regex.exec(sql)) !== null) {
            tables.push(match[1]);
        }

        return [...new Set(tables)];
    }

    /**
     * 执行健康检查
     */
    async performHealthCheck() {
        const health = {
            healthy: true,
            checks: {},
            timestamp: Date.now()
        };

        try {
            // 检查数据库连接
            const dbHealth = await this.dbManager.healthCheck();
            health.checks.database = dbHealth;

            if (!dbHealth.success) {
                health.healthy = false;
                health.checks.database.status = 'unhealthy';
            } else {
                health.checks.database.status = 'healthy';
            }

            // 检查连接池
            if (this.dbManager.primaryPool) {
                const poolStats = await this.dbManager.primaryPool.healthCheck();
                health.checks.connectionPool = {
                    status: poolStats.healthy ? 'healthy' : 'unhealthy',
                    stats: poolStats
                };

                if (!poolStats.healthy) {
                    health.healthy = false;
                }
            }

            // 检查查询性能
            const avgQueryTime = this.currentMetrics.avgQueryTime;
            health.checks.queryPerformance = {
                status: avgQueryTime < 500 ? 'healthy' : 'warning',
                avgQueryTime,
                slowQueries: this.currentMetrics.slowQueries
            };

            if (avgQueryTime > 2000) {
                health.healthy = false;
                health.checks.queryPerformance.status = 'unhealthy';
            }

            // 检查错误率
            const errorRate = this.currentMetrics.errors / Math.max(this.currentMetrics.totalQueries, 1);
            health.checks.errorRate = {
                status: errorRate < 0.01 ? 'healthy' : 'warning',
                rate: errorRate,
                errors: this.currentMetrics.errors,
                queries: this.currentMetrics.totalQueries
            };

            if (errorRate > 0.05) {
                health.healthy = false;
                health.checks.errorRate.status = 'unhealthy';
            }

        } catch (error) {
            health.healthy = false;
            health.error = error.message;
        }

        return health;
    }

    /**
     * 收集指标
     */
    async collectMetrics() {
        try {
            // 获取数据库统计
            const dbStats = await this.dbManager.getStats();

            // 获取连接池统计
            let poolStats = null;
            if (this.dbManager.primaryPool) {
                poolStats = this.dbManager.primaryPool.getStats();
            }

            this.currentMetrics = {
                ...this.currentMetrics,
                timestamp: Date.now(),
                dbStats,
                poolStats
            };
        } catch (error) {
            console.error('收集指标失败:', error);
        }
    }

    /**
     * 获取当前指标
     */
    getCurrentMetrics() {
        return {
            ...this.currentMetrics,
            uptime: Date.now() - this.dbManager.metrics.startTime
        };
    }

    /**
     * 获取性能报告
     */
    getPerformanceReport() {
        return {
            timestamp: Date.now(),
            metrics: this.getCurrentMetrics(),
            queryHistory: this.queryHistory.slice(-100),
            slowQueries: this.slowQueries,
            performanceMetrics: this.performanceMetrics,
            optimizationSuggestions: this.performanceMetrics.optimizationSuggestions || null
        };
    }

    /**
     * 记录查询日志
     */
    logQuery(queryRecord) {
        if (queryRecord.duration > this.options.slowQueryThreshold) {
            console.log(`[${new Date(queryRecord.timestamp).toISOString()}] 慢查询 ${queryRecord.duration}ms: ${queryRecord.sql}`);
        }
    }

    /**
     * 导出监控数据
     */
    exportMonitoringData() {
        return {
            timestamp: Date.now(),
            queryHistory: this.queryHistory,
            slowQueries: this.slowQueries,
            performanceMetrics: this.performanceMetrics,
            currentMetrics: this.getCurrentMetrics(),
            options: this.options
        };
    }

    /**
     * 清理历史数据
     */
    cleanup() {
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24小时

        // 清理查询历史
        this.queryHistory = this.queryHistory.filter(
            query => now - query.timestamp < maxAge
        );

        // 清理慢查询记录
        this.slowQueries = this.slowQueries.filter(
            query => now - query.timestamp < maxAge
        );

        // 清理性能指标
        Object.keys(this.performanceMetrics).forEach(key => {
            if (Array.isArray(this.performanceMetrics[key])) {
                this.performanceMetrics[key] = this.performanceMetrics[key].filter(
                    item => now - item.timestamp < maxAge
                );
            }
        });

        console.log('监控历史数据清理完成');
    }
}

module.exports = DatabaseMonitor;