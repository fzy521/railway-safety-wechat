// 梁邹铁路专用线运营安全监控系统 - 主要JavaScript逻辑

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async function() {
    await checkUserLogin();
    await initializeCharts();
    startRealTimeUpdates();
    addInteractiveEffects();
    updateNavigation();
});

// 检查用户登录状态
async function checkUserLogin() {
    // 恢复认证状态
    apiClient.restoreAuth();
    
    if (!apiClient.token || !apiClient.user) {
        // 未登录，跳转到登录页
        window.location.href = 'login.html';
        return;
    }
    
    const user = apiClient.user;
    
    // 显示用户信息
    if (document.getElementById('user-info')) {
        document.getElementById('user-info').style.display = 'flex';
        document.getElementById('logout-btn').style.display = 'block';
        document.getElementById('user-name').textContent = user.fullName || user.username;
        document.getElementById('user-role').textContent = user.roleName || user.role;
        document.getElementById('user-avatar').textContent = (user.fullName || user.username).charAt(0);
    }
    
    // 检查是否有后台管理权限
    if (user.permissions && user.permissions.includes('user.manage')) {
        if (document.getElementById('admin-link')) {
            document.getElementById('admin-link').style.display = 'block';
        }
    }
    
    // 检查是否有证书管理权限
    if (user.permissions && user.permissions.includes('certificate.view')) {
        if (document.getElementById('certificate-link')) {
            document.getElementById('certificate-link').style.display = 'block';
        }
    }
    
    // 检查是否有巡检管理权限
    if (user.permissions && user.permissions.includes('inspection.view')) {
        if (document.getElementById('inspection-link')) {
            document.getElementById('inspection-link').style.display = 'block';
        }
    }
}

// 退出登录
async function logout() {
    try {
        await apiClient.logout();
    } catch (error) {
        console.error('退出登录失败:', error);
    } finally {
        window.location.href = 'login.html';
    }
}

// 初始化所有图表
async function initializeCharts() {
    try {
        // 获取安全数据
        const response = await apiService.getSafetyData();
        if (response.success) {
            updateSafetyMetrics(response.data);
            initSafetyGauge(response.data.safetyIndex || 85);
            initSafetyTrend(response.data);
            initRiskDistribution();
        } else {
            console.error('获取安全数据失败:', response.message);
            // 使用默认数据
            updateSafetyMetrics({});
            initSafetyGauge(85);
            initSafetyTrend({});
            initRiskDistribution();
        }
    } catch (error) {
        console.error('初始化图表失败:', error);
        // 使用默认数据
        updateSafetyMetrics({});
        initSafetyGauge(85);
        initSafetyTrend({});
        initRiskDistribution();
    }
}

// 更新安全指标显示
function updateSafetyMetrics(data) {
    const dailyEvents = data.dailyEvents || 3;
    const monthlyIncidents = data.monthlyIncidents || 1;
    const inspectionRate = data.inspectionRate || 98.5;
    const riskLevel = data.riskLevel || '中等';
    const stations = data.stations || { normal: 6, maintenance: 2, fault: 0 };

    if (document.getElementById('daily-events')) {
        document.getElementById('daily-events').textContent = dailyEvents;
    }
    if (document.getElementById('monthly-incidents')) {
        document.getElementById('monthly-incidents').textContent = monthlyIncidents;
    }
    if (document.getElementById('inspection-rate')) {
        document.getElementById('inspection-rate').textContent = inspectionRate.toFixed(1) + '%';
    }
    if (document.getElementById('risk-level')) {
        document.getElementById('risk-level').textContent = riskLevel;
    }

    // 更新站点状态
    if (document.getElementById('total-stations')) {
        document.getElementById('total-stations').textContent = stations.normal + stations.maintenance + stations.fault;
    }
    if (document.getElementById('normal-stations')) {
        document.getElementById('normal-stations').textContent = stations.normal;
    }
    if (document.getElementById('maintenance-stations')) {
        document.getElementById('maintenance-stations').textContent = stations.maintenance;
    }
    if (document.getElementById('fault-stations')) {
        document.getElementById('fault-stations').textContent = stations.fault;
    }
}

// 安全状态仪表盘
function initSafetyGauge(value = 85) {
    if (!document.getElementById('safety-gauge')) return;
    
    const gaugeChart = echarts.init(document.getElementById('safety-gauge'));
    
    const option = {
        series: [{
            name: '安全状态',
            type: 'gauge',
            min: 0,
            max: 100,
            splitNumber: 10,
            radius: '90%',
            axisLine: {
                lineStyle: {
                    width: 15,
                    color: [
                        [0.3, '#ef4444'],
                        [0.7, '#f97316'],
                        [1, '#10b981']
                    ]
                }
            },
            pointer: {
                itemStyle: {
                    color: '#1e3a8a'
                }
            },
            axisTick: {
                distance: -15,
                length: 8,
                lineStyle: {
                    color: '#fff',
                    width: 2
                }
            },
            splitLine: {
                distance: -15,
                length: 15,
                lineStyle: {
                    color: '#fff',
                    width: 4
                }
            },
            axisLabel: {
                color: '#64748b',
                distance: 25,
                fontSize: 12
            },
            detail: {
                valueAnimation: true,
                formatter: '{value}',
                color: '#1e3a8a',
                fontSize: 24,
                fontWeight: 'bold'
            },
            data: [{
                value: value,
                name: '安全指数'
            }]
        }]
    };
    
    gaugeChart.setOption(option);
    
    // 响应式调整
    window.addEventListener('resize', () => {
        gaugeChart.resize();
    });
}

// 安全趋势分析图表
function initSafetyTrend(data = {}) {
    if (!document.getElementById('safety-trend')) return;
    
    const trendChart = echarts.init(document.getElementById('safety-trend'));
    
    // 使用默认数据或从API获取的数据
    const safetyTrend = data.safetyTrend || [
        { date: '2025-01', incidents: 2, events: 15 },
        { date: '2025-02', incidents: 1, events: 12 },
        { date: '2025-03', incidents: 0, events: 8 },
        { date: '2025-04', incidents: 1, events: 10 },
        { date: '2025-05', incidents: 2, events: 14 },
        { date: '2025-06', incidents: 1, events: 9 },
        { date: '2025-07', incidents: 0, events: 7 },
        { date: '2025-08', incidents: 1, events: 11 },
        { date: '2025-09', incidents: 0, events: 6 },
        { date: '2025-10', incidents: 2, events: 13 },
        { date: '2025-11', incidents: 1, events: 9 },
        { date: '2025-12', incidents: 1, events: 10 }
    ];
    
    const dates = safetyTrend.map(item => item.date);
    const incidents = safetyTrend.map(item => item.incidents);
    const events = safetyTrend.map(item => item.events);
    
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross'
            }
        },
        legend: {
            data: ['事故数', '安全事件数'],
            top: 10
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: dates,
            axisLabel: {
                color: '#64748b'
            }
        },
        yAxis: [
            {
                type: 'value',
                name: '事故数',
                position: 'left',
                axisLabel: {
                    color: '#64748b'
                }
            },
            {
                type: 'value',
                name: '事件数',
                position: 'right',
                axisLabel: {
                    color: '#64748b'
                }
            }
        ],
        series: [
            {
                name: '事故数',
                type: 'line',
                yAxisIndex: 0,
                data: incidents,
                smooth: true,
                lineStyle: {
                    color: '#ef4444',
                    width: 3
                },
                itemStyle: {
                    color: '#ef4444'
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(239, 68, 68, 0.3)' },
                            { offset: 1, color: 'rgba(239, 68, 68, 0.05)' }
                        ]
                    }
                }
            },
            {
                name: '安全事件数',
                type: 'line',
                yAxisIndex: 1,
                data: events,
                smooth: true,
                lineStyle: {
                    color: '#3b82f6',
                    width: 3
                },
                itemStyle: {
                    color: '#3b82f6'
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
                            { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }
                        ]
                    }
                }
            }
        ]
    };
    
    trendChart.setOption(option);
    
    // 响应式调整
    window.addEventListener('resize', () => {
        trendChart.resize();
    });
}

// 风险分布统计图表
function initRiskDistribution() {
    if (!document.getElementById('risk-distribution')) return;
    
    const riskChart = echarts.init(document.getElementById('risk-distribution'));
    
    // 风险类型数据
    const riskTypes = [
        { name: '设备故障', value: 35, color: '#ef4444' },
        { name: '人为因素', value: 25, color: '#f97316' },
        { name: '环境因素', value: 20, color: '#eab308' },
        { name: '管理缺陷', value: 15, color: '#3b82f6' },
        { name: '其他', value: 5, color: '#6b7280' }
    ];
    
    const option = {
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            textStyle: {
                color: '#64748b'
            }
        },
        series: [
            {
                name: '风险类型',
                type: 'pie',
                radius: ['40%', '70%'],
                center: ['60%', '50%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 20,
                        fontWeight: 'bold'
                    }
                },
                labelLine: {
                    show: false
                },
                data: riskTypes.map(item => ({
                    value: item.value,
                    name: item.name,
                    itemStyle: {
                        color: item.color
                    }
                }))
            }
        ]
    };
    
    riskChart.setOption(option);
    
    // 响应式调整
    window.addEventListener('resize', () => {
        riskChart.resize();
    });
}

// 实时数据更新
function startRealTimeUpdates() {
    setInterval(async () => {
        await updateSafetyData();
        // 不需要手动更新图表，因为ECharts会自动响应数据变化
    }, 30000); // 每30秒更新一次
}

// 更新安全数据
async function updateSafetyData() {
    try {
        const response = await apiService.getSafetyData();
        if (response.success) {
            updateSafetyMetrics(response.data);
            
            // 动画更新数字
            if (document.getElementById('daily-events')) {
                anime({
                    targets: '#daily-events',
                    scale: [1.2, 1],
                    duration: 300,
                    easing: 'easeOutQuad'
                });
            }
        }
    } catch (error) {
        console.error('更新安全数据失败:', error);
    }
}

// 添加交互效果
function addInteractiveEffects() {
    // 卡片悬停效果
    const cards = document.querySelectorAll('.card-hover');
    if (cards) {
        cards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                anime({
                    targets: this,
                    scale: 1.02,
                    duration: 200,
                    easing: 'easeOutQuad'
                });
            });
            
            card.addEventListener('mouseleave', function() {
                anime({
                    targets: this,
                    scale: 1,
                    duration: 200,
                    easing: 'easeOutQuad'
                });
            });
        });
    }
    
    // 状态指示器动画
    const statusIndicators = document.querySelectorAll('.status-indicator');
    if (statusIndicators) {
        statusIndicators.forEach(indicator => {
            anime({
                targets: indicator,
                scale: [1, 1.2, 1],
                duration: 2000,
                loop: true,
                easing: 'easeInOutQuad'
            });
        });
    }
}

// 更新导航菜单
function updateNavigation() {
    const currentPath = window.location.pathname.split('/').pop();
    
    // 定义页面映射
    const pageMap = {
        'index.html': '安全监控',
        'risk-assessment.html': '风险评估',
        'incident-report.html': '事故报告',
        'training-management.html': '培训管理',
        'certificate-management.html': '证书管理',
        'inspection-management.html': '巡检管理',
        'admin.html': '后台管理'
    };
    
    // 更新导航链接状态
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && pageMap[currentPath] && link.textContent.includes(pageMap[currentPath])) {
            link.classList.remove('text-gray-600');
            link.classList.add('text-blue-800', 'font-medium', 'border-b-2', 'border-blue-800');
        } else {
            link.classList.remove('text-blue-800', 'font-medium', 'border-b-2', 'border-blue-800');
            link.classList.add('text-gray-600');
        }
    });
}

// 页面加载动画
window.addEventListener('load', function() {
    // 页面元素进入动画
    const cardElements = document.querySelectorAll('.card-hover');
    if (cardElements.length > 0) {
        anime({
            targets: '.card-hover',
            translateY: [50, 0],
            opacity: [0, 1],
            delay: anime.stagger(100),
            duration: 800,
            easing: 'easeOutQuad'
        });
    }
    
    // 标题动画
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        anime({
            targets: '.hero-title',
            scale: [0.8, 1],
            opacity: [0, 1],
            duration: 1000,
            easing: 'easeOutElastic(1, .8)'
        });
    }
});

// 错误处理
window.addEventListener('error', function(e) {
    console.error('JavaScript错误:', e.error);
});

// 导出数据功能（用于调试）
function exportData() {
    return {
        timestamp: new Date().toISOString()
    };
}