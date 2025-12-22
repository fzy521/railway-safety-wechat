-- 梁邹铁路专用线运营安全监控系统 - 初始数据
-- 创建时间: 2025-12-17
-- 版本: 1.0.0

-- =============================================
-- 角色和权限初始数据
-- =============================================

-- 插入角色
INSERT INTO roles (name, description) VALUES 
('超级管理员', '拥有系统所有权限'),
('安全管理员', '负责安全监控、风险评估、事故报告管理'),
('培训管理员', '负责培训管理和证书管理'),
('巡检员', '负责执行巡检任务'),
('普通用户', '只能查看基本信息');

-- 插入权限
INSERT INTO permissions (name, description, module, action) VALUES 
-- 用户管理权限
('user.view', '查看用户信息', 'user', 'view'),
('user.create', '创建用户', 'user', 'create'),
('user.update', '更新用户信息', 'user', 'update'),
('user.delete', '删除用户', 'user', 'delete'),
('user.manage', '管理用户权限', 'user', 'manage'),

-- 安全监控权限
('safety.view', '查看安全监控数据', 'safety', 'view'),
('safety.update', '更新安全监控数据', 'safety', 'update'),
('safety.export', '导出安全报告', 'safety', 'export'),

-- 风险评估权限
('risk.view', '查看风险评估', 'risk', 'view'),
('risk.create', '创建风险评估', 'risk', 'create'),
('risk.update', '更新风险评估', 'risk', 'update'),
('risk.delete', '删除风险评估', 'risk', 'delete'),
('risk.resolve', '处理风险', 'risk', 'resolve'),

-- 事故报告权限
('incident.view', '查看事故报告', 'incident', 'view'),
('incident.create', '创建事故报告', 'incident', 'create'),
('incident.update', '更新事故报告', 'incident', 'update'),
('incident.delete', '删除事故报告', 'incident', 'delete'),
('incident.investigate', '调查事故', 'incident', 'investigate'),
('incident.close', '关闭事故', 'incident', 'close'),

-- 培训管理权限
('training.view', '查看培训记录', 'training', 'view'),
('training.create', '创建培训记录', 'training', 'create'),
('training.update', '更新培训记录', 'training', 'update'),
('training.delete', '删除培训记录', 'training', 'delete'),

-- 证书管理权限
('certificate.view', '查看证书信息', 'certificate', 'view'),
('certificate.create', '创建证书记录', 'certificate', 'create'),
('certificate.update', '更新证书记录', 'certificate', 'update'),
('certificate.delete', '删除证书记录', 'certificate', 'delete'),

-- 巡检管理权限
('inspection.view', '查看巡检信息', 'inspection', 'view'),
('inspection.create', '创建巡检点', 'inspection', 'create'),
('inspection.update', '更新巡检信息', 'inspection', 'update'),
('inspection.delete', '删除巡检点', 'inspection', 'delete'),
('inspection.execute', '执行巡检', 'inspection', 'execute'),
('inspection.qr', '生成二维码', 'inspection', 'qr'),

-- 系统管理权限
('system.config', '系统配置管理', 'system', 'config'),
('system.logs', '查看系统日志', 'system', 'logs'),
('system.backup', '数据备份', 'system', 'backup');

-- 为角色分配权限
-- 超级管理员拥有所有权限
INSERT INTO role_permissions (role_id, permission_id, granted_by)
SELECT 1, id, 1 FROM permissions;

-- 安全管理员权限
INSERT INTO role_permissions (role_id, permission_id, granted_by)
SELECT 2, id, 1 FROM permissions 
WHERE module IN ('safety', 'risk', 'incident') OR name IN ('user.view', 'system.logs');

-- 培训管理员权限
INSERT INTO role_permissions (role_id, permission_id, granted_by)
SELECT 3, id, 1 FROM permissions 
WHERE module IN ('training', 'certificate') OR name IN ('user.view');

-- 巡检员权限
INSERT INTO role_permissions (role_id, permission_id, granted_by)
SELECT 4, id, 1 FROM permissions 
WHERE module = 'inspection' OR name IN ('user.view');

-- 普通用户权限
INSERT INTO role_permissions (role_id, permission_id, granted_by)
SELECT 5, id, 1 FROM permissions 
WHERE name LIKE '%.view' AND module IN ('safety', 'risk', 'incident', 'training', 'certificate');

-- =============================================
-- 初始用户数据
-- =============================================

-- 注意: 这里使用明文密码仅用于演示，实际应用中会通过bcrypt加密
-- 超级管理员 (admin/admin123)
INSERT INTO users (username, password, email, full_name, department, position, status, created_by) VALUES 
('admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6QJw/2Ej7W', 'admin@railway.com', '系统管理员', '信息技术部', '系统管理员', 'active', NULL);

-- 安全管理员 (safety/safety123)
INSERT INTO users (username, password, email, full_name, department, position, status, created_by) VALUES 
('safety', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6QJw/2Ej7W', 'safety@railway.com', '张安全', '安全部', '安全管理员', 'active', 1);

-- 培训管理员 (training/training123)
INSERT INTO users (username, password, email, full_name, department, position, status, created_by) VALUES 
('training', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6QJw/2Ej7W', 'training@railway.com', '李培训', '培训部', '培训管理员', 'active', 1);

-- 巡检员 (inspector/inspector123)
INSERT INTO users (username, password, email, full_name, department, position, status, created_by) VALUES 
('inspector', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6QJw/2Ej7W', 'inspector@railway.com', '王巡检', '运营部', '巡检员', 'active', 1);

-- 普通用户 (user/user123)
INSERT INTO users (username, password, email, full_name, department, position, status, created_by) VALUES 
('user', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6QJw/2Ej7W', 'user@railway.com', '赵用户', '运营部', '操作员', 'active', 1);

-- 为用户分配角色
INSERT INTO user_roles (user_id, role_id, assigned_by) VALUES 
(1, 1, 1),  -- admin -> 超级管理员
(2, 2, 1),  -- safety -> 安全管理员
(3, 3, 1),  -- training -> 培训管理员
(4, 4, 1),  -- inspector -> 巡检员
(5, 5, 1);  -- user -> 普通用户

-- =============================================
-- 初始业务数据
-- =============================================

-- 安全监控初始数据
INSERT INTO safety_monitoring (date, daily_events, monthly_incidents, inspection_rate, risk_level, normal_stations, maintenance_stations, fault_stations, safety_index, updated_by) VALUES 
(CURRENT_DATE, 3, 1, 98.5, '中', 6, 2, 0, 85.0, 1);

-- 风险评估示例数据
INSERT INTO risk_assessments (location, risk_type, description, probability, severity, risk_level, status, reporter_id, measures) VALUES 
('A站信号设备', '设备故障', '信号机老化，存在故障风险', 3, 4, '高风险', 'processing', 2, '计划下月更换设备'),
('B站轨道', '环境因素', '雨季轨道湿滑，影响制动', 2, 3, '中等风险', 'pending', 2, '加强巡检，安装防滑装置'),
('C站调度室', '人为因素', '调度员培训不足，操作不规范', 2, 2, '低风险', 'resolved', 2, '已完成培训考核');

-- 事故报告示例数据
INSERT INTO incident_reports (incident_time, location, incident_type, severity, description, cause_analysis, measures, reporter_id, status) VALUES 
('2025-12-15 14:30:00', 'A站站台', '设备故障', '一般事故', '售票机故障导致旅客滞留', '设备老化，维护不及时', '已更换故障部件，加强日常维护', 2, 'closed'),
('2025-12-10 09:15:00', 'B站道岔', '线路故障', '险性事故', '道岔转换异常，影响列车通行', '机械部件磨损', '已更换磨损部件，调整维护周期', 2, 'processing');

-- 培训记录示例数据
INSERT INTO training_records (topic, training_type, training_date, duration, instructor, location, department, participants, pass_rate, status, created_by) VALUES 
('安全生产培训', '安全培训', '2025-12-01', 8, '李培训', '培训中心', '运营部', 25, 96.0, 'completed', 3),
('设备操作规程', '技能培训', '2025-12-10', 4, '王技术', 'A站会议室', '技术部', 15, 100.0, 'completed', 3),
('应急处置演练', '应急培训', '2025-12-20', 6, '张应急', 'B站现场', '运营部', 30, 0, 'scheduled', 3);

-- 证书管理示例数据
INSERT INTO certificates (user_id, certificate_name, certificate_number, issuing_authority, issue_date, expiry_date, certificate_type, status) VALUES 
(2, '安全管理员证', 'SAFE2024001', '铁路安全监督管理局', '2024-01-15', '2026-01-15', '安全证', 'valid'),
(3, '培训师资格证', 'TRAIN2024002', '铁路培训中心', '2024-03-20', '2025-03-20', '管理证', 'expiring'),
(4, '巡检操作证', 'INSP2024003', '铁路运营管理局', '2024-06-10', '2026-06-10', '操作证', 'valid'),
(5, '特种作业证', 'SPECIAL2024004', '特种设备安全中心', '2023-12-01', '2025-12-01', '特种作业证', 'valid');

-- 巡检点示例数据
INSERT INTO inspection_points (name, type, location, description, requirements, inspection_cycle, responsible_department, responsible_person, status, created_by) VALUES 
('A站信号设备', '设备', 'A站信号机室', '铁路信号设备状态检查', '检查设备运行状态、指示灯、连接线路', 1, '技术部', '张技术', 'active', 1),
('B站轨道', '线路', 'B站1-3号轨道', '轨道线路检查', '检查轨道平整度、连接件、道床状态', 1, '工务部', '李工务', 'active', 1),
('C站调度设备', '设备', 'C站调度室', '调度通信设备检查', '检查调度台、通信设备、监控系统', 1, '通信部', '王通信', 'active', 1);

-- 巡检项目示例数据
INSERT INTO inspection_items (point_id, item_name, item_type, required, sort_order) VALUES 
(1, '信号机外观检查', 'checkbox', 1, 1),
(1, '指示灯状态', 'checkbox', 1, 2),
(1, '连接线路检查', 'checkbox', 1, 3),
(1, '设备运行声音', 'text', 0, 4),
(1, '设备温度检测', 'number', 1, 5),

(2, '轨道平整度', 'checkbox', 1, 1),
(2, '连接件紧固', 'checkbox', 1, 2),
(2, '道床状态', 'checkbox', 1, 3),
(2, '轨道间距测量', 'number', 1, 4),

(3, '调度台功能', 'checkbox', 1, 1),
(3, '通信设备连接', 'checkbox', 1, 2),
(3, '监控系统显示', 'checkbox', 1, 3),
(3, '设备清洁状态', 'checkbox', 0, 4);

-- 巡检记录示例数据
INSERT INTO inspection_records (point_id, inspector_id, inspection_time, status, items_checked, abnormal_items, notes, gps_location, weather_condition, next_inspection_date) VALUES 
(1, 4, '2025-12-16 10:30:00', 'normal', '[1,2,3,5]', '[]', '设备运行正常', '116.3974,39.9093', '晴朗', '2025-12-17'),
(2, 4, '2025-12-16 14:15:00', 'abnormal', '[1,2]', '[3]', '道床有积水，需要处理', '116.3975,39.9094', '多云', '2025-12-17'),
(3, 4, '2025-12-15 09:00:00', 'normal', '[1,2,3]', '[]', '所有设备正常', '116.3976,39.9095', '晴朗', '2025-12-16');

-- =============================================
-- 系统配置初始数据
-- =============================================

INSERT INTO system_config (config_key, config_value, description, updated_by) VALUES 
('system.name', '梁邹铁路专用线运营安全监控系统', '系统名称', 1),
('system.version', '1.0.0', '系统版本', 1),
('inspection.default_cycle', '1', '默认巡检周期(天)', 1),
('certificate.expire_warning_days', '30', '证书到期预警天数', 1),
('risk.high_threshold', '12', '高风险阈值', 1),
('risk.medium_threshold', '6', '中等风险阈值', 1),
('backup.retention_days', '30', '备份保留天数', 1),
('session.timeout', '24', '会话超时时间(小时)', 1);