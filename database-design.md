# 梁邹铁路专用线安全管理系统 - 数据库设计

## 数据库架构

### 用户相关表

#### 1. 用户表 (users)
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    full_name VARCHAR(100),
    department VARCHAR(50),
    position VARCHAR(50),
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    created_by INT,
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

#### 2. 角色表 (roles)
```sql
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 3. 权限表 (permissions)
```sql
CREATE TABLE permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    module VARCHAR(50),
    action VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. 用户角色关联表 (user_roles)
```sql
CREATE TABLE user_roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by INT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (assigned_by) REFERENCES users(id),
    UNIQUE KEY unique_user_role (user_id, role_id)
);
```

#### 5. 角色权限关联表 (role_permissions)
```sql
CREATE TABLE role_permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (permission_id) REFERENCES permissions(id),
    UNIQUE KEY unique_role_permission (role_id, permission_id)
);
```

### 业务数据表

#### 6. 安全监控数据表 (safety_monitoring)
```sql
CREATE TABLE safety_monitoring (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL,
    daily_events INT DEFAULT 0,
    monthly_incidents INT DEFAULT 0,
    inspection_rate DECIMAL(5,2) DEFAULT 0,
    risk_level ENUM('低', '中', '高') DEFAULT '中',
    normal_stations INT DEFAULT 0,
    maintenance_stations INT DEFAULT 0,
    fault_stations INT DEFAULT 0,
    safety_index DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INT,
    FOREIGN KEY (updated_by) REFERENCES users(id)
);
```

#### 7. 风险评估表 (risk_assessments)
```sql
CREATE TABLE risk_assessments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    location VARCHAR(100) NOT NULL,
    risk_type ENUM('设备故障', '人为因素', '环境因素', '管理缺陷', '其他'),
    description TEXT NOT NULL,
    probability INT CHECK (probability >= 1 AND probability <= 5),
    severity INT CHECK (severity >= 1 AND severity <= 5),
    risk_level ENUM('低风险', '中等风险', '高风险') NOT NULL,
    status ENUM('pending', 'processing', 'resolved') DEFAULT 'pending',
    reporter_id INT NOT NULL,
    measures TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES users(id)
);
```

#### 8. 事故报告表 (incident_reports)
```sql
CREATE TABLE incident_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    incident_time DATETIME NOT NULL,
    location VARCHAR(100) NOT NULL,
    incident_type VARCHAR(50) NOT NULL,
    severity ENUM('一般事故', '险性事故', '大事故', '重大事故', '特别重大事故') NOT NULL,
    description TEXT NOT NULL,
    cause_analysis TEXT,
    measures TEXT,
    reporter_id INT NOT NULL,
    status ENUM('pending', 'investigating', 'processing', 'closed') DEFAULT 'pending',
    process_time DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES users(id)
);
```

#### 9. 培训记录表 (training_records)
```sql
CREATE TABLE training_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    topic VARCHAR(200) NOT NULL,
    training_type VARCHAR(50) NOT NULL,
    training_date DATE NOT NULL,
    duration INT NOT NULL,
    instructor VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    department VARCHAR(50) NOT NULL,
    participants INT DEFAULT 0,
    pass_rate DECIMAL(5,2) DEFAULT 0,
    status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

#### 10. 证书管理表 (certificates)
```sql
CREATE TABLE certificates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    certificate_name VARCHAR(200) NOT NULL,
    certificate_number VARCHAR(100) UNIQUE,
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    issuing_authority VARCHAR(100),
    status ENUM('valid', 'expiring', 'expired') DEFAULT 'valid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### 11. 操作日志表 (operation_logs)
```sql
CREATE TABLE operation_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    module VARCHAR(50) NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 初始数据

### 默认角色
```sql
INSERT INTO roles (name, description) VALUES 
('超级管理员', '系统最高权限管理员'),
('安全管理员', '负责安全监控和风险管理'),
('培训管理员', '负责培训计划和证书管理'),
('普通用户', '一般系统用户'),
('访客', '只读权限用户');
```

### 默认权限
```sql
INSERT INTO permissions (name, description, module, action) VALUES 
('系统管理', '系统配置和管理权限', 'system', 'manage'),
('用户管理', '用户增删改查权限', 'user', 'manage'),
('角色管理', '角色管理权限', 'role', 'manage'),
('安全监控', '查看安全监控数据', 'safety', 'view'),
('风险评估', '风险评估管理权限', 'risk', 'manage'),
('事故报告', '事故报告管理权限', 'incident', 'manage'),
('培训管理', '培训管理权限', 'training', 'manage'),
('证书管理', '证书管理权限', 'certificate', 'manage');
```

### 超级管理员用户
```sql
INSERT INTO users (username, password, email, full_name, department, position, status) VALUES 
('admin', '$2y$10$YourHashedPasswordHere', 'admin@example.com', '超级管理员', '信息部', '管理员', 'active');
```

## 数据库连接配置

### PHP数据库连接示例
```php
<?php
class Database {
    private $host = 'localhost';
    private $db_name = 'railway_safety';
    private $username = 'root';
    private $password = '';
    private $connection;
    
    public function connect() {
        $this->connection = null;
        
        try {
            $this->connection = new PDO(
                'mysql:host=' . $this->host . ';dbname=' . $this->db_name,
                $this->username,
                $this->password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]
            );
        } catch(PDOException $e) {
            echo 'Connection Error: ' . $e->getMessage();
        }
        
        return $this->connection;
    }
}
?>
```

### Node.js数据库连接示例
```javascript
const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'railway_safety',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

module.exports = pool;
```

## 安全考虑

1. **密码安全**: 使用 bcrypt 或 Argon2 进行密码哈希
2. **SQL注入防护**: 使用预处理语句
3. **权限控制**: 基于角色的访问控制(RBAC)
4. **审计日志**: 记录所有重要操作
5. **数据备份**: 定期备份数据库
6. **连接加密**: 使用SSL/TLS加密数据库连接