-- 梁邹铁路专用线运营安全监控系统 - SQLite数据库架构
-- 创建时间: 2025-12-17
-- 版本: 1.0.0

-- 启用外键约束和WAL模式
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = 10000;
PRAGMA temp_store = memory;

-- =============================================
-- 用户权限管理模块
-- =============================================

-- 用户表
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,                    -- bcrypt加密密码
    email TEXT UNIQUE,
    phone TEXT,
    full_name TEXT NOT NULL,
    department TEXT,
    position TEXT,
    status TEXT CHECK(status IN ('active', 'inactive', 'suspended')) DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    created_by INTEGER,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 角色表
CREATE TABLE roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 权限表
CREATE TABLE permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    module TEXT NOT NULL,                      -- 模块名称
    action TEXT NOT NULL,                      -- 操作名称
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 用户角色关联表
CREATE TABLE user_roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    assigned_by INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE (user_id, role_id)
);

-- 角色权限关联表
CREATE TABLE role_permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role_id INTEGER NOT NULL,
    permission_id INTEGER NOT NULL,
    granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    granted_by INTEGER,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE (role_id, permission_id)
);

-- =============================================
-- 安全监控模块
-- =============================================

-- 安全监控数据表
CREATE TABLE safety_monitoring (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE NOT NULL,
    daily_events INTEGER DEFAULT 0,            -- 今日安全事件数
    monthly_incidents INTEGER DEFAULT 0,       -- 本月事故数
    inspection_rate REAL DEFAULT 0,            -- 巡检完成率
    risk_level TEXT CHECK(risk_level IN ('低', '中', '高')) DEFAULT '中',
    normal_stations INTEGER DEFAULT 0,         -- 正常站点数
    maintenance_stations INTEGER DEFAULT 0,    -- 维护站点数
    fault_stations INTEGER DEFAULT 0,          -- 故障站点数
    safety_index REAL DEFAULT 0,               -- 安全指数
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE (date)
);

-- =============================================
-- 风险评估模块
-- =============================================

-- 风险评估表
CREATE TABLE risk_assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    location TEXT NOT NULL,
    risk_type TEXT CHECK(risk_type IN ('设备故障', '人为因素', '环境因素', '管理缺陷', '其他')),
    description TEXT NOT NULL,
    probability INTEGER CHECK(probability >= 1 AND probability <= 5),  -- 发生概率(1-5)
    severity INTEGER CHECK(severity >= 1 AND severity <= 5),           -- 严重程度(1-5)
    risk_level TEXT CHECK(risk_level IN ('低风险', '中等风险', '高风险')) NOT NULL,
    status TEXT CHECK(status IN ('pending', 'processing', 'resolved')) DEFAULT 'pending',
    reporter_id INTEGER NOT NULL,
    measures TEXT,                            -- 处理措施
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME,
    resolved_by INTEGER,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =============================================
-- 事故报告模块
-- =============================================

-- 事故报告表
CREATE TABLE incident_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    incident_time DATETIME NOT NULL,
    location TEXT NOT NULL,
    incident_type TEXT NOT NULL,
    severity TEXT CHECK(severity IN ('一般事故', '险性事故', '大事故', '重大事故', '特别重大事故')) NOT NULL,
    description TEXT NOT NULL,
    cause_analysis TEXT,                       -- 原因分析
    measures TEXT,                            -- 整改措施
    reporter_id INTEGER NOT NULL,
    status TEXT CHECK(status IN ('pending', 'investigating', 'processing', 'closed')) DEFAULT 'pending',
    process_time REAL DEFAULT 0,              -- 处理时长(小时)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    closed_at DATETIME,
    closed_by INTEGER,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (closed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =============================================
-- 培训管理模块
-- =============================================

-- 培训记录表
CREATE TABLE training_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic TEXT NOT NULL,
    training_type TEXT NOT NULL,
    training_date DATE NOT NULL,
    duration INTEGER NOT NULL,                 -- 培训时长(小时)
    instructor TEXT NOT NULL,
    location TEXT NOT NULL,
    department TEXT NOT NULL,
    participants INTEGER DEFAULT 0,           -- 参与人数
    pass_rate REAL DEFAULT 0,                 -- 通过率
    status TEXT CHECK(status IN ('scheduled', 'completed', 'cancelled')) DEFAULT 'scheduled',
    notes TEXT,                               -- 培训备注
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- =============================================
-- 证书管理模块
-- =============================================

-- 证书管理表
CREATE TABLE certificates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    certificate_name TEXT NOT NULL,
    certificate_number TEXT UNIQUE,
    issuing_authority TEXT,                   -- 发证机构
    issue_date DATE NOT NULL,                 -- 发证日期
    expiry_date DATE NOT NULL,                -- 到期日期
    certificate_type TEXT CHECK(certificate_type IN ('操作证', '安全证', '特种作业证', '管理证', '其他')) DEFAULT '其他',
    status TEXT CHECK(status IN ('valid', 'expiring', 'expired')) DEFAULT 'valid',
    notes TEXT,                               -- 备注
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =============================================
-- 巡检系统模块
-- =============================================

-- 巡检点表
CREATE TABLE inspection_points (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT CHECK(type IN ('设备', '线路', '其他')) DEFAULT '设备',
    location TEXT NOT NULL,
    description TEXT,
    requirements TEXT,                        -- 巡检要求
    inspection_cycle INTEGER DEFAULT 1,       -- 巡检周期(天)
    responsible_department TEXT,              -- 责任部门
    responsible_person TEXT,                 -- 责任人
    status TEXT CHECK(status IN ('active', 'inactive')) DEFAULT 'active',
    qr_code TEXT,                            -- 二维码数据
    qr_token TEXT,                           -- 二维码令牌
    qr_expire_time DATETIME,                 -- 二维码过期时间
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 巡检项目表
CREATE TABLE inspection_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    point_id INTEGER NOT NULL,
    item_name TEXT NOT NULL,
    item_type TEXT CHECK(item_type IN ('checkbox', 'text', 'number', 'photo')) DEFAULT 'checkbox',
    required BOOLEAN DEFAULT 0,               -- 是否必填
    sort_order INTEGER DEFAULT 0,             -- 排序顺序
    options TEXT,                             -- 选项(JSON格式)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (point_id) REFERENCES inspection_points(id) ON DELETE CASCADE
);

-- 巡检记录表
CREATE TABLE inspection_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    point_id INTEGER NOT NULL,
    inspector_id INTEGER NOT NULL,
    inspection_time DATETIME NOT NULL,
    status TEXT CHECK(status IN ('normal', 'abnormal')) DEFAULT 'normal',
    items_checked TEXT,                       -- 已检查项目ID(JSON数组)
    abnormal_items TEXT,                      -- 异常项目ID(JSON数组)
    photos TEXT,                             -- 照片文件名(JSON数组)
    notes TEXT,                              -- 巡检备注
    gps_location TEXT,                       -- GPS坐标
    weather_condition TEXT,                  -- 天气状况
    next_inspection_date DATE,               -- 下次巡检日期
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (point_id) REFERENCES inspection_points(id) ON DELETE CASCADE,
    FOREIGN KEY (inspector_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- 二维码扫描日志表
CREATE TABLE qr_code_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    point_id INTEGER NOT NULL,
    qr_token TEXT NOT NULL,
    scan_time DATETIME NOT NULL,
    scanner_id INTEGER,
    gps_location TEXT,                       -- 扫码时的GPS位置
    device_info TEXT,                        -- 设备信息
    ip_address TEXT,                         -- IP地址
    scan_result TEXT CHECK(scan_result IN ('success', 'fail', 'expired')) DEFAULT 'success',
    fail_reason TEXT,                        -- 失败原因
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (point_id) REFERENCES inspection_points(id) ON DELETE CASCADE,
    FOREIGN KEY (scanner_id) REFERENCES users(id) ON DELETE SET NULL
);

-- =============================================
-- 系统管理模块
-- =============================================

-- 操作日志表
CREATE TABLE operation_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    action TEXT NOT NULL,                    -- 操作类型
    module TEXT NOT NULL,                    -- 模块名称
    description TEXT,                        -- 操作描述
    ip_address TEXT,                         -- IP地址
    user_agent TEXT,                         -- 用户代理
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 系统配置表
CREATE TABLE system_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    config_key TEXT UNIQUE NOT NULL,
    config_value TEXT,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =============================================
-- 索引创建
-- =============================================

-- 用户相关索引
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_department ON users(department);

-- 角色权限索引
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);
CREATE INDEX idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission ON role_permissions(permission_id);

-- 业务数据索引
CREATE INDEX idx_safety_monitoring_date ON safety_monitoring(date);
CREATE INDEX idx_risk_assessments_status ON risk_assessments(status);
CREATE INDEX idx_risk_assessments_reporter ON risk_assessments(reporter_id);
CREATE INDEX idx_risk_assessments_level ON risk_assessments(risk_level);
CREATE INDEX idx_incident_reports_status ON incident_reports(status);
CREATE INDEX idx_incident_reports_reporter ON incident_reports(reporter_id);
CREATE INDEX idx_incident_reports_time ON incident_reports(incident_time);
CREATE INDEX idx_training_records_date ON training_records(training_date);
CREATE INDEX idx_training_records_department ON training_records(department);

-- 证书管理索引
CREATE INDEX idx_certificates_user ON certificates(user_id);
CREATE INDEX idx_certificates_status ON certificates(status);
CREATE INDEX idx_certificates_expiry ON certificates(expiry_date);
CREATE INDEX idx_certificates_type ON certificates(certificate_type);

-- 巡检系统索引
CREATE INDEX idx_inspection_points_status ON inspection_points(status);
CREATE INDEX idx_inspection_points_type ON inspection_points(type);
CREATE INDEX idx_inspection_points_responsible ON inspection_points(responsible_person);
CREATE INDEX idx_inspection_items_point ON inspection_items(point_id);
CREATE INDEX idx_inspection_records_point ON inspection_records(point_id);
CREATE INDEX idx_inspection_records_inspector ON inspection_records(inspector_id);
CREATE INDEX idx_inspection_records_time ON inspection_records(inspection_time);
CREATE INDEX idx_inspection_records_status ON inspection_records(status);
CREATE INDEX idx_qr_code_logs_token ON qr_code_logs(qr_token);
CREATE INDEX idx_qr_code_logs_time ON qr_code_logs(scan_time);
CREATE INDEX idx_qr_code_logs_scanner ON qr_code_logs(scanner_id);

-- 系统管理索引
CREATE INDEX idx_operation_logs_user ON operation_logs(user_id);
CREATE INDEX idx_operation_logs_created ON operation_logs(created_at);
CREATE INDEX idx_operation_logs_module ON operation_logs(module);
CREATE INDEX idx_system_config_key ON system_config(config_key);

-- =============================================
-- 触发器创建
-- =============================================

-- 更新用户表时间戳
CREATE TRIGGER update_users_timestamp 
    AFTER UPDATE ON users
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- 更新角色表时间戳
CREATE TRIGGER update_roles_timestamp 
    AFTER UPDATE ON roles
BEGIN
    UPDATE roles SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- 更新安全监控表时间戳
CREATE TRIGGER update_safety_monitoring_timestamp 
    AFTER UPDATE ON safety_monitoring
BEGIN
    UPDATE safety_monitoring SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- 更新风险评估表时间戳
CREATE TRIGGER update_risk_assessments_timestamp 
    AFTER UPDATE ON risk_assessments
BEGIN
    UPDATE risk_assessments SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- 更新事故报告表时间戳
CREATE TRIGGER update_incident_reports_timestamp 
    AFTER UPDATE ON incident_reports
BEGIN
    UPDATE incident_reports SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- 更新培训记录表时间戳
CREATE TRIGGER update_training_records_timestamp 
    AFTER UPDATE ON training_records
BEGIN
    UPDATE training_records SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- 更新证书表时间戳
CREATE TRIGGER update_certificates_timestamp 
    AFTER UPDATE ON certificates
BEGIN
    UPDATE certificates SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- 更新巡检点表时间戳
CREATE TRIGGER update_inspection_points_timestamp 
    AFTER UPDATE ON inspection_points
BEGIN
    UPDATE inspection_points SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- 更新系统配置表时间戳
CREATE TRIGGER update_system_config_timestamp 
    AFTER UPDATE ON system_config
BEGIN
    UPDATE system_config SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;