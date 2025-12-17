# 二维码巡检系统设计方案

## 系统架构

### 总体设计
系统采用前后端分离架构，支持Web端管理和移动端巡检：
- **Web管理端**: 二维码生成、巡检点管理、数据统计分析
- **移动端**: 微信小程序扫码巡检、记录上传、离线同步
- **后端API**: 数据存储、权限验证、业务逻辑处理

### 核心功能模块

#### 1. 巡检点管理
- 巡检点基本信息管理（位置、设备、要求等）
- 二维码生成与绑定
- 巡检路线规划
- 巡检周期设置

#### 2. 二维码系统
- 动态二维码生成
- 二维码内容加密
- 扫码记录追踪
- 二维码失效管理

#### 3. 巡检执行
- 扫码识别巡检点
- 巡检项目逐项确认
- 异常拍照上传
- GPS位置记录
- 离线数据缓存

#### 4. 数据管理
- 巡检记录存储
- 数据统计分析
- 异常报警处理
- 巡检报告生成

## 数据库设计

### 巡检点表 (inspection_points)
```sql
CREATE TABLE inspection_points (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(200),
    point_type ENUM('设备', '区域', '线路') NOT NULL,
    qr_code VARCHAR(500) UNIQUE,
    qr_token VARCHAR(255) UNIQUE,
    description TEXT,
    requirements TEXT,
    inspection_cycle INT DEFAULT 1, -- 巡检周期(天)
    responsible_department VARCHAR(50),
    responsible_person VARCHAR(50),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### 巡检记录表 (inspection_records)
```sql
CREATE TABLE inspection_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    point_id INT NOT NULL,
    inspector_id INT NOT NULL,
    inspection_time TIMESTAMP NOT NULL,
    status ENUM('normal', 'abnormal', 'pending') DEFAULT 'normal',
    items_checked JSON,
    abnormal_items JSON,
    photos JSON,
    notes TEXT,
    gps_location VARCHAR(50),
    weather_condition VARCHAR(20),
    next_inspection_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (point_id) REFERENCES inspection_points(id),
    FOREIGN KEY (inspector_id) REFERENCES users(id)
);
```

### 巡检项目表 (inspection_items)
```sql
CREATE TABLE inspection_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    point_id INT NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    item_type ENUM('checkbox', 'radio', 'text', 'photo') NOT NULL,
    options JSON,
    required BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (point_id) REFERENCES inspection_points(id)
);
```

### 二维码日志表 (qr_code_logs)
```sql
CREATE TABLE qr_code_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    point_id INT NOT NULL,
    qr_token VARCHAR(255) NOT NULL,
    scan_time TIMESTAMP NOT NULL,
    scanner_id INT,
    gps_location VARCHAR(50),
    device_info TEXT,
    ip_address VARCHAR(45),
    scan_result ENUM('success', 'fail', 'expired') DEFAULT 'success',
    fail_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (point_id) REFERENCES inspection_points(id),
    FOREIGN KEY (scanner_id) REFERENCES users(id)
);
```

## API接口设计

### 巡检点管理接口
```javascript
// 获取巡检点列表
GET /api/inspection-points
{
    page: 1,
    limit: 20,
    status: 'active',
    search: '关键词'
}

// 创建巡检点
POST /api/inspection-points
{
    name: 'A站信号设备',
    location: 'A站控制室',
    point_type: '设备',
    description: '信号设备状态检查',
    requirements: '检查设备运行状态',
    inspection_cycle: 1,
    responsible_department: '维护部',
    responsible_person: '张三'
}

// 生成二维码
POST /api/inspection-points/{id}/qrcode
{
    expire_time: 86400, // 24小时
    size: 300
}

// 获取巡检点详情
GET /api/inspection-points/{id}

// 更新巡检点
PUT /api/inspection-points/{id}

// 删除巡检点
DELETE /api/inspection-points/{id}
```

### 巡检记录接口
```javascript
// 获取巡检记录
GET /api/inspection-records
{
    point_id: 1,
    inspector_id: 2,
    start_date: '2025-01-01',
    end_date: '2025-12-31',
    status: 'normal'
}

// 创建巡检记录
POST /api/inspection-records
{
    point_id: 1,
    inspection_time: '2025-12-17T14:30:00Z',
    status: 'normal',
    items_checked: [1, 2, 3],
    abnormal_items: [],
    photos: ['photo1.jpg', 'photo2.jpg'],
    notes: '一切正常',
    gps_location: '116.3974,39.9093',
    weather_condition: '晴朗'
}

// 获取巡检统计
GET /api/inspection-records/statistics
{
    type: 'daily', // daily, weekly, monthly
    start_date: '2025-12-01',
    end_date: '2025-12-31'
}
```

### 扫码验证接口
```javascript
// 扫码验证
POST /api/scan-verify
{
    qr_token: 'qr_token_string',
    gps_location: '116.3974,39.9093',
    device_info: 'WeChat MiniProgram'
}

// 响应
{
    success: true,
    data: {
        point_id: 1,
        point_name: 'A站信号设备',
        location: 'A站控制室',
        description: '信号设备状态检查',
        last_inspection: '2025-12-16T10:30:00Z',
        next_inspection: '2025-12-17T10:30:00Z',
        inspection_items: [
            {
                id: 1,
                item_name: '设备外观检查',
                item_type: 'checkbox',
                required: true
            }
        ]
    }
}
```

## 微信小程序设计

### 页面结构
```
小程序/
├── pages/
│   ├── index/              # 首页
│   │   ├── index.js
│   │   ├── index.json
│   │   ├── index.wxml
│   │   └── index.wxss
│   ├── scan/               # 扫码页面
│   │   ├── scan.js
│   │   ├── scan.json
│   │   ├── scan.wxml
│   │   └── scan.wxss
│   ├── inspection/         # 巡检页面
│   │   ├── inspection.js
│   │   ├── inspection.json
│   │   ├── inspection.wxml
│   │   └── inspection.wxss
│   ├── records/            # 记录页面
│   │   ├── records.js
│   │   ├── records.json
│   │   ├── records.wxml
│   │   └── records.wxss
│   └── profile/            # 个人中心
│       ├── profile.js
│       ├── profile.json
│       ├── profile.wxml
│       └── profile.wxss
├── utils/
│   ├── api.js              # API封装
│   ├── auth.js             # 认证工具
│   └── utils.js            # 通用工具
├── app.js                  # 应用入口
├── app.json                # 全局配置
└── app.wxss                # 全局样式
```

### 核心功能实现

#### 1. 扫码功能
```javascript
// scan.js
Page({
    data: {
        scanResult: null,
        isScanning: false
    },
    
    onLoad: function(options) {
        this.scanQRCode();
    },
    
    scanQRCode: function() {
        const that = this;
        wx.scanCode({
            onlyFromCamera: true,
            scanType: ['qrCode'],
            success: function(res) {
                that.verifyQRCode(res.result);
            },
            fail: function(err) {
                wx.showToast({
                    title: '扫码失败',
                    icon: 'none'
                });
            }
        });
    },
    
    verifyQRCode: function(qrToken) {
        const that = this;
        wx.getLocation({
            type: 'wgs84',
            success: function(location) {
                wx.request({
                    url: `${app.globalData.apiBase}/api/scan-verify`,
                    method: 'POST',
                    data: {
                        qr_token: qrToken,
                        gps_location: `${location.latitude},${location.longitude}`,
                        device_info: `WeChat/${wx.getSystemInfoSync().version}`
                    },
                    header: {
                        'Authorization': `Bearer ${wx.getStorageSync('token')}`
                    },
                    success: function(res) {
                        if (res.data.success) {
                            wx.navigateTo({
                                url: `/pages/inspection/inspection?point_id=${res.data.data.point_id}`
                            });
                        } else {
                            wx.showToast({
                                title: res.data.message || '验证失败',
                                icon: 'none'
                            });
                        }
                    },
                    fail: function() {
                        wx.showToast({
                            title: '网络错误',
                            icon: 'none'
                        });
                    }
                });
            },
            fail: function() {
                wx.showToast({
                    title: '无法获取位置信息',
                    icon: 'none'
                });
            }
        });
    }
});
```

#### 2. 巡检表单
```javascript
// inspection.js
Page({
    data: {
        pointId: null,
        pointInfo: null,
        inspectionItems: [],
        formData: {},
        photos: [],
        isSubmitting: false
    },
    
    onLoad: function(options) {
        this.setData({
            pointId: options.point_id
        });
        this.loadInspectionPoint();
    },
    
    loadInspectionPoint: function() {
        const that = this;
        wx.request({
            url: `${app.globalData.apiBase}/api/inspection-points/${this.data.pointId}`,
            header: {
                'Authorization': `Bearer ${wx.getStorageSync('token')}`
            },
            success: function(res) {
                if (res.data.success) {
                    that.setData({
                        pointInfo: res.data.data,
                        inspectionItems: res.data.data.inspection_items || []
                    });
                }
            }
        });
    },
    
    onItemChange: function(e) {
        const { itemId, value } = e.detail;
        this.setData({
            [`formData.${itemId}`]: value
        });
    },
    
    takePhoto: function() {
        const that = this;
        wx.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['camera'],
            success: function(res) {
                that.uploadPhoto(res.tempFilePaths[0]);
            }
        });
    },
    
    uploadPhoto: function(filePath) {
        const that = this;
        wx.uploadFile({
            url: `${app.globalData.apiBase}/api/upload`,
            filePath: filePath,
            name: 'photo',
            header: {
                'Authorization': `Bearer ${wx.getStorageSync('token')}`
            },
            success: function(res) {
                const data = JSON.parse(res.data);
                if (data.success) {
                    that.setData({
                        photos: [...that.data.photos, data.url]
                    });
                }
            }
        });
    },
    
    submitInspection: function() {
        if (this.data.isSubmitting) return;
        
        this.setData({ isSubmitting: true });
        
        // 验证必填项
        const requiredItems = this.data.inspectionItems.filter(item => item.required);
        for (let item of requiredItems) {
            if (!this.data.formData[item.id]) {
                wx.showToast({
                    title: `请完成必填项: ${item.item_name}`,
                    icon: 'none'
                });
                this.setData({ isSubmitting: false });
                return;
            }
        }
        
        // 提交数据
        const inspectionData = {
            point_id: this.data.pointId,
            inspection_time: new Date().toISOString(),
            status: this.data.formData.abnormal ? 'abnormal' : 'normal',
            items_checked: Object.keys(this.data.formData),
            abnormal_items: this.data.formData.abnormal ? [this.data.formData.abnormal] : [],
            photos: this.data.photos,
            notes: this.data.formData.notes || '',
            gps_location: `${this.data.location?.latitude || 0},${this.data.location?.longitude || 0}`,
            weather_condition: this.data.weather || '未知'
        };
        
        wx.request({
            url: `${app.globalData.apiBase}/api/inspection-records`,
            method: 'POST',
            data: inspectionData,
            header: {
                'Authorization': `Bearer ${wx.getStorageSync('token')}`
            },
            success: function(res) {
                if (res.data.success) {
                    wx.showToast({
                        title: '巡检提交成功',
                        icon: 'success',
                        duration: 2000
                    });
                    setTimeout(() => {
                        wx.navigateBack();
                    }, 2000);
                } else {
                    wx.showToast({
                        title: res.data.message || '提交失败',
                        icon: 'none'
                    });
                }
            },
            fail: function() {
                wx.showToast({
                    title: '网络错误',
                    icon: 'none'
                });
            },
            complete: () => {
                this.setData({ isSubmitting: false });
            }
        });
    }
});
```

## Web端功能实现

### 二维码生成器
```javascript
class QRCodeGenerator {
    constructor() {
        this.qrSize = 300;
        this.expireTime = 86400; // 24小时
    }
    
    async generateQRCode(pointId) {
        try {
            // 生成唯一的token
            const token = this.generateToken();
            
            // 创建二维码内容
            const qrContent = {
                type: 'inspection_point',
                point_id: pointId,
                token: token,
                timestamp: Date.now(),
                expire_time: this.expireTime
            };
            
            // 加密内容
            const encryptedContent = this.encryptContent(qrContent);
            
            // 生成二维码
            const qrCodeDataURL = await this.createQRCode(encryptedContent);
            
            // 保存到数据库
            await this.saveQRCode(pointId, token, encryptedContent);
            
            return {
                success: true,
                qr_code: qrCodeDataURL,
                token: token,
                expire_time: this.expireTime
            };
        } catch (error) {
            console.error('QR Code generation failed:', error);
            return {
                success: false,
                message: '二维码生成失败'
            };
        }
    }
    
    generateToken() {
        return 'qr_' + Math.random().toString(36).substr(2, 15) + '_' + Date.now();
    }
    
    encryptContent(content) {
        // 简单的加密，实际应用中应使用更安全的加密算法
        return btoa(JSON.stringify(content));
    }
    
    async createQRCode(content) {
        // 使用二维码生成库生成二维码
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            // 这里使用实际的二维码生成库
            resolve(canvas.toDataURL());
        });
    }
    
    async saveQRCode(pointId, token, content) {
        // 保存到数据库
        return apiService.createQRCode({
            point_id: pointId,
            qr_token: token,
            qr_content: content,
            expire_time: this.expireTime
        });
    }
}
```

## 系统集成

### 与现有系统的集成
1. **用户系统集成**: 复用现有的用户认证和权限管理
2. **数据同步**: 巡检数据与安全监控数据关联
3. **消息通知**: 异常巡检结果自动触发报警
4. **报表集成**: 巡检统计纳入整体安全报表

### 部署方案
1. **Web端**: 部署到现有Web服务器
2. **API服务**: 集成到现有后端服务
3. **微信小程序**: 独立部署，通过API与后端通信
4. **数据库**: 使用现有数据库，新增巡检相关表

## 安全考虑

1. **二维码安全**: 
   - 使用一次性token
   - 设置有效期限制
   - 内容加密传输

2. **数据安全**:
   - 巡检数据加密存储
   - 敏感信息脱敏处理
   - 操作日志完整记录

3. **权限控制**:
   - 基于角色的权限管理
   - 巡检点访问控制
   - 数据查看权限限制

4. **传输安全**:
   - HTTPS加密传输
   - API访问Token验证
   - 请求频率限制

## 性能优化

1. **二维码生成**: 缓存常用二维码，批量生成
2. **数据查询**: 索引优化，分页查询
3. **图片处理**: 压缩上传，CDN加速
4. **离线支持**: 本地缓存，网络恢复同步

这个二维码巡检系统将大大提升铁路专用线的巡检效率和准确性，实现巡检工作的数字化和智能化管理。