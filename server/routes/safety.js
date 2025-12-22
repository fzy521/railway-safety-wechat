const express = require('express');
const { asyncHandler } = require('../middleware/error-handler');

/**
 * 安全监控路由
 */
function createSafetyRoutes(apiService, authMiddleware) {
    const router = express.Router();

    /**
     * 获取安全监控数据
     * GET /api/safety/data
     */
    router.get('/data', authMiddleware.authenticate(), authMiddleware.requirePermission('safety.view'), asyncHandler(async (req, res) => {
        const { date } = req.query;
        const result = apiService.getSafetyData(date);
        res.json(result);
    }));

    /**
     * 更新安全监控数据
     * PUT /api/safety/data
     */
    router.put('/data', authMiddleware.authenticate(), authMiddleware.requirePermission('safety.update'), asyncHandler(async (req, res) => {
        const result = await apiService.updateSafetyData(req.body, req.user.id);
        res.json(result);
    }));

    /**
     * 获取安全统计图表数据
     * GET /api/safety/charts
     */
    router.get('/charts', authMiddleware.authenticate(), authMiddleware.requirePermission('safety.view'), asyncHandler(async (req, res) => {
        const { type, period = '30' } = req.query;
        
        try {
            let data = {};
            
            switch (type) {
                case 'trend':
                    // 获取安全趋势数据
                    data = apiService.dbManager.all(`
                        SELECT 
                            date,
                            daily_events,
                            monthly_incidents,
                            safety_index,
                            risk_level
                        FROM safety_monitoring 
                        WHERE date >= date('now', '-${period} days')
                        ORDER BY date ASC
                    `);
                    break;
                    
                case 'distribution':
                    // 获取风险分布数据
                    data = apiService.dbManager.all(`
                        SELECT 
                            risk_type,
                            COUNT(*) as count,
                            AVG(probability * severity) as avg_score
                        FROM risk_assessments 
                        WHERE created_at >= date('now', '-${period} days')
                        GROUP BY risk_type
                        ORDER BY count DESC
                    `);
                    break;
                    
                case 'incidents':
                    // 获取事故统计数据
                    data = apiService.dbManager.all(`
                        SELECT 
                            DATE(incident_time) as date,
                            COUNT(*) as count,
                            severity
                        FROM incident_reports 
                        WHERE incident_time >= date('now', '-${period} days')
                        GROUP BY DATE(incident_time), severity
                        ORDER BY date ASC
                    `);
                    break;
                    
                case 'inspection':
                    // 获取巡检统计数据
                    data = apiService.dbManager.all(`
                        SELECT 
                            DATE(inspection_time) as date,
                            COUNT(*) as total,
                            SUM(CASE WHEN status = 'normal' THEN 1 ELSE 0 END) as normal,
                            SUM(CASE WHEN status = 'abnormal' THEN 1 ELSE 0 END) as abnormal
                        FROM inspection_records 
                        WHERE inspection_time >= date('now', '-${period} days')
                        GROUP BY DATE(inspection_time)
                        ORDER BY date ASC
                    `);
                    break;
                    
                default:
                    return res.status(400).json({
                        success: false,
                        message: '不支持的图表类型'
                    });
            }
            
            res.json({
                success: true,
                data,
                type,
                period
            });
        } catch (error) {
            console.error('获取图表数据失败:', error);
            res.status(500).json({
                success: false,
                message: '获取图表数据失败'
            });
        }
    }));

    /**
     * 获取安全预警信息
     * GET /api/safety/alerts
     */
    router.get('/alerts', authMiddleware.authenticate(), authMiddleware.requirePermission('safety.view'), asyncHandler(async (req, res) => {
        try {
            const alerts = [];
            
            // 检查高风险项目
            const highRisks = apiService.dbManager.all(`
                SELECT id, location, risk_type, description, created_at
                FROM risk_assessments 
                WHERE risk_level = '高风险' AND status != 'resolved'
                ORDER BY created_at DESC
                LIMIT 5
            `);
            
            highRisks.forEach(risk => {
                alerts.push({
                    id: `risk_${risk.id}`,
                    type: 'risk',
                    level: 'high',
                    title: '高风险预警',
                    message: `${risk.location} - ${risk.risk_type}`,
                    description: risk.description,
                    time: risk.created_at
                });
            });
            
            // 检查待处理事故
            const pendingIncidents = apiService.dbManager.all(`
                SELECT id, location, incident_type, severity, created_at
                FROM incident_reports 
                WHERE status IN ('pending', 'investigating')
                ORDER BY created_at DESC
                LIMIT 5
            `);
            
            pendingIncidents.forEach(incident => {
                alerts.push({
                    id: `incident_${incident.id}`,
                    type: 'incident',
                    level: incident.severity === '重大事故' || incident.severity === '特别重大事故' ? 'high' : 'medium',
                    title: '待处理事故',
                    message: `${incident.location} - ${incident.incident_type}`,
                    description: incident.severity,
                    time: incident.created_at
                });
            });
            
            // 检查即将到期的证书
            const expiringCertificates = apiService.dbManager.all(`
                SELECT id, certificate_name, user_id, expiry_date
                FROM certificates 
                WHERE status = 'expiring' 
                ORDER BY expiry_date ASC
                LIMIT 5
            `);
            
            expiringCertificates.forEach(cert => {
                alerts.push({
                    id: `certificate_${cert.id}`,
                    type: 'certificate',
                    level: 'medium',
                    title: '证书即将到期',
                    message: cert.certificate_name,
                    description: `到期日期: ${cert.expiry_date}`,
                    time: cert.expiry_date
                });
            });
            
            // 检查异常巡检记录
            const abnormalInspections = apiService.dbManager.all(`
                SELECT r.id, p.name as point_name, p.location, r.inspection_time
                FROM inspection_records r
                JOIN inspection_points p ON r.point_id = p.id
                WHERE r.status = 'abnormal' 
                AND r.inspection_time >= date('now', '-7 days')
                ORDER BY r.inspection_time DESC
                LIMIT 5
            `);
            
            abnormalInspections.forEach(inspection => {
                alerts.push({
                    id: `inspection_${inspection.id}`,
                    type: 'inspection',
                    level: 'medium',
                    title: '异常巡检',
                    message: `${inspection.point_name} - ${inspection.location}`,
                    description: `巡检时间: ${inspection.inspection_time}`,
                    time: inspection.inspection_time
                });
            });
            
            // 按时间排序
            alerts.sort((a, b) => new Date(b.time) - new Date(a.time));
            
            res.json({
                success: true,
                data: alerts.slice(0, 20), // 返回最新20条预警
                total: alerts.length
            });
        } catch (error) {
            console.error('获取安全预警失败:', error);
            res.status(500).json({
                success: false,
                message: '获取安全预警失败'
            });
        }
    }));

    /**
     * 获取安全KPI指标
     * GET /api/safety/kpi
     */
    router.get('/kpi', authMiddleware.authenticate(), authMiddleware.requirePermission('safety.view'), asyncHandler(async (req, res) => {
        try {
            const { period = '30' } = req.query;
            
            // 基础指标
            const baseMetrics = apiService.getSafetyData();
            
            // 计算KPI指标
            const kpis = {
                // 安全指数
                safetyIndex: {
                    value: baseMetrics.data?.safetyIndex || 0,
                    unit: '分',
                    status: baseMetrics.data?.safetyIndex >= 80 ? 'good' : 
                           baseMetrics.data?.safetyIndex >= 60 ? 'warning' : 'danger'
                },
                
                // 事故率
                incidentRate: {
                    value: baseMetrics.data?.monthlyIncidents || 0,
                    unit: '起/月',
                    status: baseMetrics.data?.monthlyIncidents === 0 ? 'good' :
                           baseMetrics.data?.monthlyIncidents <= 2 ? 'warning' : 'danger'
                },
                
                // 巡检完成率
                inspectionRate: {
                    value: baseMetrics.data?.inspectionRate || 0,
                    unit: '%',
                    status: baseMetrics.data?.inspectionRate >= 95 ? 'good' :
                           baseMetrics.data?.inspectionRate >= 85 ? 'warning' : 'danger'
                },
                
                // 风险处理率
                riskResolutionRate: {
                    value: 0,
                    unit: '%',
                    status: 'good'
                }
            };
            
            // 计算风险处理率
            const riskStats = apiService.dbManager.get(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved
                FROM risk_assessments 
                WHERE created_at >= date('now', '-${period} days')
            `);
            
            if (riskStats.total > 0) {
                kpis.riskResolutionRate.value = Math.round((riskStats.resolved / riskStats.total) * 100);
                kpis.riskResolutionRate.status = kpis.riskResolutionRate.value >= 80 ? 'good' :
                                                  kpis.riskResolutionRate.value >= 60 ? 'warning' : 'danger';
            }
            
            // 计算趋势
            const trends = {};
            
            // 安全指数趋势
            const safetyTrend = apiService.dbManager.all(`
                SELECT safety_index, date
                FROM safety_monitoring 
                WHERE date >= date('now', '-7 days')
                ORDER BY date ASC
            `);
            
            if (safetyTrend.length >= 2) {
                const recent = safetyTrend[safetyTrend.length - 1].safety_index;
                const previous = safetyTrend[0].safety_index;
                trends.safetyIndex = recent > previous ? 'up' : recent < previous ? 'down' : 'stable';
            }
            
            res.json({
                success: true,
                data: {
                    kpis,
                    trends,
                    lastUpdated: new Date().toISOString()
                }
            });
        } catch (error) {
            console.error('获取安全KPI失败:', error);
            res.status(500).json({
                success: false,
                message: '获取安全KPI失败'
            });
        }
    }));

    /**
     * 导出安全报告
     * GET /api/safety/export
     */
    router.get('/export', authMiddleware.authenticate(), authMiddleware.requirePermission('safety.export'), asyncHandler(async (req, res) => {
        try {
            const { type = 'summary', format = 'json', period = '30' } = req.query;
            
            let data = {};
            
            switch (type) {
                case 'summary':
                    // 摘要报告
                    data = {
                        basic: apiService.getSafetyData(),
                        risks: apiService.dbManager.all(`
                            SELECT risk_type, COUNT(*) as count, risk_level
                            FROM risk_assessments 
                            WHERE created_at >= date('now', '-${period} days')
                            GROUP BY risk_type, risk_level
                        `),
                        incidents: apiService.dbManager.all(`
                            SELECT severity, COUNT(*) as count
                            FROM incident_reports 
                            WHERE incident_time >= date('now', '-${period} days')
                            GROUP BY severity
                        `),
                        inspections: apiService.dbManager.get(`
                            SELECT 
                                COUNT(*) as total,
                                SUM(CASE WHEN status = 'normal' THEN 1 ELSE 0 END) as normal,
                                SUM(CASE WHEN status = 'abnormal' THEN 1 ELSE 0 END) as abnormal
                            FROM inspection_records 
                            WHERE inspection_time >= date('now', '-${period} days')
                        `)
                    };
                    break;
                    
                case 'detailed':
                    // 详细报告
                    data = {
                        safetyData: apiService.dbManager.all(`
                            SELECT * FROM safety_monitoring 
                            WHERE date >= date('now', '-${period} days')
                            ORDER BY date DESC
                        `),
                        risks: apiService.dbManager.all(`
                            SELECT * FROM risk_assessments 
                            WHERE created_at >= date('now', '-${period} days')
                            ORDER BY created_at DESC
                        `),
                        incidents: apiService.dbManager.all(`
                            SELECT * FROM incident_reports 
                            WHERE incident_time >= date('now', '-${period} days')
                            ORDER BY incident_time DESC
                        `),
                        inspections: apiService.dbManager.all(`
                            SELECT r.*, p.name as point_name, p.location
                            FROM inspection_records r
                            JOIN inspection_points p ON r.point_id = p.id
                            WHERE r.inspection_time >= date('now', '-${period} days')
                            ORDER BY r.inspection_time DESC
                        `)
                    };
                    break;
                    
                default:
                    return res.status(400).json({
                        success: false,
                        message: '不支持的报告类型'
                    });
            }
            
            // 记录导出操作
            apiService.authService.logOperation(req.user.id, 'export', 'safety', `导出安全报告: ${type}`);
            
            if (format === 'csv') {
                // CSV格式导出（简化处理）
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename="safety-report-${type}-${Date.now()}.csv"`);
                res.send('CSV格式导出功能待实现');
            } else {
                // JSON格式导出
                res.json({
                    success: true,
                    data,
                    type,
                    period,
                    exportedAt: new Date().toISOString(),
                    exportedBy: req.user.fullName
                });
            }
        } catch (error) {
            console.error('导出安全报告失败:', error);
            res.status(500).json({
                success: false,
                message: '导出安全报告失败'
            });
        }
    }));

    return router;
}

module.exports = createSafetyRoutes;