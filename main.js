// 梁邹铁路专用线运营安全监控系统 - 主要JavaScript逻辑

// 数据存储
const safetyData = {
    dailyEvents: 3,
    monthlyIncidents: 1,
    inspectionRate: 98.5,
    riskLevel: '中等',
    stations: {
        normal: 6,
        maintenance: 2,
        fault: 0
    },
    safetyTrend: [
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
    ],
    riskTypes: [
        { name: '设备故障', value: 35, color: '#ef4444' },
        { name: '人为因素', value: 25, color: '#f97316' },
        { name: '环境因素', value: 20, color: '#eab308' },
        { name: '管理缺陷', value: 15, color: '#3b82f6' },
        { name: '其他', value: 5, color: '#6b7280' }
    ]
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    checkUserLogin();
    initializeCharts();
    startRealTimeUpdates();
    addInteractiveEffects();
});

// 检查用户登录状态
function checkUserLogin() {
    const userInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
    
    if (!userInfo) {
        // 未登录，跳转到登录页
        window.location.href = 'login.html';
        return;
    }
    
    const user = JSON.parse(userInfo);
    
    // 显示用户信息
    document.getElementById('user-info').style.display = 'flex';
    document.getElementById('logout-btn').style.display = 'block';
    document.getElementById('user-name').textContent = user.fullName;
    document.getElementById('user-role').textContent = user.role;
    document.getElementById('user-avatar').textContent = user.fullName.charAt(0);
    
    // 检查是否有后台管理权限
    if (user.permissions && user.permissions.includes('user.manage')) {
        document.getElementById('admin-link').style.display = 'block';
    }
}

// 退出登录
function logout() {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('token');
    sessionStorage.removeItem('userInfo');
    sessionStorage.removeItem('token');
    window.location.href = 'login.html';
}

// 初始化所有图表
function initializeCharts() {
    initSafetyGauge();
    initSafetyTrend();
    initRiskDistribution();
}

// 安全状态仪表盘
function initSafetyGauge() {
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
                value: 85,
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
function initSafetyTrend() {
    const trendChart = echarts.init(document.getElementById('safety-trend'));
    
    const dates = safetyData.safetyTrend.map(item => item.date);
    const incidents = safetyData.safetyTrend.map(item => item.incidents);
    const events = safetyData.safetyTrend.map(item => item.events);
    
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
    const riskChart = echarts.init(document.getElementById('risk-distribution'));
    
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
                data: safetyData.riskTypes.map(item => ({
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
    setInterval(() => {
        updateSafetyData();
        updateCharts();
    }, 30000); // 每30秒更新一次
}

// 更新安全数据
function updateSafetyData() {
    // 模拟数据变化
    const variations = {
        dailyEvents: Math.floor(Math.random() * 3) - 1, // -1, 0, 1
        inspectionRate: (Math.random() - 0.5) * 2, // ±1%
        stations: {
            normal: Math.floor(Math.random() * 2) - 1,
            maintenance: Math.floor(Math.random() * 2),
            fault: Math.random() > 0.95 ? 1 : 0 // 5%概率出现故障
        }
    };
    
    // 更新数据（带边界检查）
    safetyData.dailyEvents = Math.max(0, safetyData.dailyEvents + variations.dailyEvents);
    safetyData.inspectionRate = Math.max(90, Math.min(100, safetyData.inspectionRate + variations.inspectionRate));
    
    // 更新显示
    document.getElementById('daily-events').textContent = safetyData.dailyEvents;
    document.getElementById('inspection-rate').textContent = safetyData.inspectionRate.toFixed(1) + '%';
    
    // 动画更新数字
    anime({
        targets: '#daily-events',
        scale: [1.2, 1],
        duration: 300,
        easing: 'easeOutQuad'
    });
}

// 更新图表数据
function updateCharts() {
    // 这里可以添加图表数据更新逻辑
    console.log('图表数据已更新');
}

// 添加交互效果
function addInteractiveEffects() {
    // 卡片悬停效果
    const cards = document.querySelectorAll('.card-hover');
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
    
    // 状态指示器动画
    const statusIndicators = document.querySelectorAll('.status-indicator');
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

// 导航菜单交互
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // 移除所有活动状态
            navLinks.forEach(l => {
                l.classList.remove('text-blue-800', 'border-b-2', 'border-blue-800');
                l.classList.add('text-gray-600');
            });
            
            // 添加当前活动状态
            this.classList.remove('text-gray-600');
            this.classList.add('text-blue-800', 'border-b-2', 'border-blue-800');
        });
    });
});

// 页面加载动画
window.addEventListener('load', function() {
    // 页面元素进入动画
    anime({
        targets: '.card-hover',
        translateY: [50, 0],
        opacity: [0, 1],
        delay: anime.stagger(100),
        duration: 800,
        easing: 'easeOutQuad'
    });
    
    // 标题动画
    anime({
        targets: '.hero-title',
        scale: [0.8, 1],
        opacity: [0, 1],
        duration: 1000,
        easing: 'easeOutElastic(1, .8)'
    });
});

// 错误处理
window.addEventListener('error', function(e) {
    console.error('JavaScript错误:', e.error);
});

// 导出数据功能（用于调试）
function exportData() {
    return {
        safetyData: safetyData,
        timestamp: new Date().toISOString()
    };
}