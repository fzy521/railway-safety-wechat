/**
 * API客户端
 * 用于与后端API服务器通信
 */
class ApiClient {
    constructor(baseUrl = 'http://localhost:3000/api') {
        this.baseUrl = baseUrl;
        this.token = null;
        this.user = null;
    }

    /**
     * 设置认证令牌
     */
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }

    /**
     * 设置用户信息
     */
    setUser(user) {
        this.user = user;
        if (user) {
            localStorage.setItem('userInfo', JSON.stringify(user));
        } else {
            localStorage.removeItem('userInfo');
        }
    }

    /**
     * 从本地存储恢复认证状态
     */
    restoreAuth() {
        const token = localStorage.getItem('token');
        const userInfo = localStorage.getItem('userInfo');
        
        if (token) {
            this.token = token;
        }
        
        if (userInfo) {
            try {
                this.user = JSON.parse(userInfo);
            } catch (error) {
                console.error('解析用户信息失败:', error);
                localStorage.removeItem('userInfo');
            }
        }
    }

    /**
     * 发送HTTP请求
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // 添加认证头
        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                // 如果是401错误，清除本地认证信息
                if (response.status === 401) {
                    this.setToken(null);
                    this.setUser(null);
                    // 可以在这里触发重新登录逻辑
                }
                throw new Error(data.message || `HTTP ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API请求失败:', error);
            throw error;
        }
    }

    /**
     * GET请求
     */
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return await this.request(url, { method: 'GET' });
    }

    /**
     * POST请求
     */
    async post(endpoint, data = {}) {
        return await this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * PUT请求
     */
    async put(endpoint, data = {}) {
        return await this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * DELETE请求
     */
    async delete(endpoint) {
        return await this.request(endpoint, { method: 'DELETE' });
    }

    // =============================================
    // 认证相关API
    // =============================================

    /**
     * 用户登录
     */
    async login(username, password) {
        try {
            const response = await this.post('/auth/login', { username, password });
            
            if (response.success) {
                this.setToken(response.token);
                this.setUser(response.user);
            }
            
            return response;
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    /**
     * 用户登出
     */
    async logout() {
        try {
            const response = await this.post('/auth/logout');
            this.setToken(null);
            this.setUser(null);
            return response;
        } catch (error) {
            // 即使API调用失败，也要清除本地认证信息
            this.setToken(null);
            this.setUser(null);
            return { success: false, message: error.message };
        }
    }

    /**
     * 获取当前用户信息
     */
    async getCurrentUser() {
        try {
            const response = await this.get('/auth/me');
            if (response.success) {
                this.setUser(response.data);
            }
            return response;
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    /**
     * 修改密码
     */
    async changePassword(oldPassword, newPassword) {
        try {
            return await this.post('/auth/change-password', {
                oldPassword,
                newPassword
            });
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // =============================================
    // 安全监控API
    // =============================================

    /**
     * 获取安全监控数据
     */
    async getSafetyData(date = null) {
        try {
            const params = date ? { date } : {};
            return await this.get('/safety/data', params);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    /**
     * 更新安全监控数据
     */
    async updateSafetyData(data) {
        try {
            return await this.put('/safety/data', data);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    /**
     * 获取安全图表数据
     */
    async getSafetyCharts(type, period = '30') {
        try {
            return await this.get('/safety/charts', { type, period });
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    /**
     * 获取安全预警信息
     */
    async getSafetyAlerts() {
        try {
            return await this.get('/safety/alerts');
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    /**
     * 获取安全KPI指标
     */
    async getSafetyKpi(period = '30') {
        try {
            return await this.get('/safety/kpi', { period });
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    /**
     * 导出安全报告
     */
    async exportSafetyReport(type = 'summary', format = 'json', period = '30') {
        try {
            return await this.get('/safety/export', { type, format, period });
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // =============================================
    // 风险评估API
    // =============================================

    /**
     * 获取风险评估列表
     */
    async getRisks(params = {}) {
        try {
            return await this.get('/risks', params);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    /**
     * 创建风险评估
     */
    async createRisk(riskData) {
        try {
            return await this.post('/risks', riskData);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    /**
     * 更新风险评估
     */
    async updateRisk(id, riskData) {
        try {
            return await this.put(`/risks/${id}`, riskData);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    /**
     * 删除风险评估
     */
    async deleteRisk(id) {
        try {
            return await this.delete(`/risks/${id}`);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // =============================================
    // 事故报告API
    // =============================================

    /**
     * 获取事故报告列表
     */
    async getIncidents(params = {}) {
        try {
            return await this.get('/incidents', params);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    /**
     * 创建事故报告
     */
    async createIncident(incidentData) {
        try {
            return await this.post('/incidents', incidentData);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    /**
     * 更新事故报告
     */
    async updateIncident(id, incidentData) {
        try {
            return await this.put(`/incidents/${id}`, incidentData);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    /**
     * 删除事故报告
     */
    async deleteIncident(id) {
        try {
            return await this.delete(`/incidents/${id}`);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // =============================================
    // 培训管理API
    // =============================================

    /**
     * 获取培训记录列表
     */
    async getTrainings(params = {}) {
        try {
            return await this.get('/training', params);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    /**
     * 创建培训记录
     */
    async createTraining(trainingData) {
        try {
            return await this.post('/training', trainingData);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    /**
     * 更新培训记录
     */
    async updateTraining(id, trainingData) {
        try {
            return await this.put(`/training/${id}`, trainingData);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    /**
     * 删除培训记录
     */
    async deleteTraining(id) {
        try {
            return await this.delete(`/training/${id}`);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // =============================================
    // 证书管理API
    // =============================================

    /**
     * 获取证书列表
     */
    async getCertificates(params = {}) {
        try {
            return await this.get('/certificates', params);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    /**
     * 创建证书记录
     */
    async createCertificate(certificateData) {
        try {
            return await this.post('/certificates', certificateData);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    /**
     * 更新证书记录
     */
    async updateCertificate(id, certificateData) {
        try {
            return await this.put(`/certificates/${id}`, certificateData);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    /**
     * 删除证书记录
     */
    async deleteCertificate(id) {
        try {
            return await this.delete(`/certificates/${id}`);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // =============================================
    // 巡检管理API
    // =============================================

    /**
     * 获取巡检点列表
     */
    async getInspectionPoints(params = {}) {
        try {
            return await this.get('/inspection/points', params);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    /**
     * 创建巡检点
     */
    async createInspectionPoint(pointData) {
        try {
            return await this.post('/inspection/points', pointData);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    /**
     * 更新巡检点
     */
    async updateInspectionPoint(id, pointData) {
        try {
            return await this.put(`/inspection/points/${id}`, pointData);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    /**
     * 删除巡检点
     */
    async deleteInspectionPoint(id) {
        try {
            return await this.delete(`/inspection/points/${id}`);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    /**
     * 获取巡检记录列表
     */
    async getInspectionRecords(params = {}) {
        try {
            return await this.get('/inspection/records', params);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    /**
     * 创建巡检记录
     */
    async createInspectionRecord(recordData) {
        try {
            return await this.post('/inspection/records', recordData);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    /**
     * 生成二维码
     */
    async generateQRCode(pointId) {
        try {
            return await this.post(`/inspection/points/${pointId}/qr`);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    /**
     * 验证二维码
     */
    async verifyQRCode(token, scanInfo = {}) {
        try {
            return await this.post('/inspection/verify-qr', { token, ...scanInfo });
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // =============================================
    // 系统管理API
    // =============================================

    /**
     * 获取系统统计信息
     */
    async getSystemStats() {
        try {
            return await this.get('/system/stats');
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    /**
     * 获取操作日志
     */
    async getOperationLogs(params = {}) {
        try {
            return await this.get('/system/logs', params);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    /**
     * 数据库备份
     */
    async backupDatabase() {
        try {
            return await this.post('/system/backup');
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    /**
     * 健康检查
     */
    async healthCheck() {
        try {
            return await this.get('/health');
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
}

// 创建全局API客户端实例
const apiClient = new ApiClient();

// 页面加载时恢复认证状态
document.addEventListener('DOMContentLoaded', () => {
    apiClient.restoreAuth();
});

// 向后兼容的apiService对象
const apiService = {
    // 登录相关
    login: (username, password) => apiClient.login(username, password),
    logout: () => apiClient.logout(),
    getCurrentUser: () => apiClient.getCurrentUser(),
    
    // 安全监控
    getSafetyData: (date) => apiClient.getSafetyData(date),
    updateSafetyData: (data) => apiClient.updateSafetyData(data),
    
    // 风险评估
    getRisks: (params) => apiClient.getRisks(params),
    createRisk: (riskData) => apiClient.createRisk(riskData),
    
    // 事故报告
    getIncidents: (params) => apiClient.getIncidents(params),
    createIncident: (incidentData) => apiClient.createIncident(incidentData),
    
    // 培训管理
    getTrainings: (params) => apiClient.getTrainings(params),
    createTraining: (trainingData) => apiClient.createTraining(trainingData),
    
    // 证书管理
    getCertificates: (params) => apiClient.getCertificates(params),
    createCertificate: (certificateData) => apiClient.createCertificate(certificateData),
    
    // 巡检管理
    getInspectionPoints: (params) => apiClient.getInspectionPoints(params),
    createInspectionPoint: (pointData) => apiClient.createInspectionPoint(pointData),
    getInspectionRecords: (params) => apiClient.getInspectionRecords(params),
    createInspectionRecord: (recordData) => apiClient.createInspectionRecord(recordData),
    generateQRCode: (pointId) => apiClient.generateQRCode(pointId),
    
    // 认证状态
    token: () => apiClient.token,
    user: () => apiClient.user
};

// 导出到全局作用域
window.apiClient = apiClient;
window.apiService = apiService;