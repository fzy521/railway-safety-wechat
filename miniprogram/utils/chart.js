// 图表工具类
// 用于小程序数据可视化图表绘制

class Chart {
  constructor() {
    try {
      this.ctxCache = {};
    } catch (error) {
      console.error('Chart构造函数初始化失败:', error);
      this.ctxCache = {};
    }
  }

  // 获取canvas上下文
  getContext(canvasId) {
    try {
      if (!canvasId) {
        throw new Error('canvasId不能为空');
      }
      if (!this.ctxCache[canvasId]) {
        this.ctxCache[canvasId] = wx.createCanvasContext(canvasId);
      }
      return this.ctxCache[canvasId];
    } catch (error) {
      console.error('获取canvas上下文失败:', error);
      return null;
    }
  }

  // 绘制折线图
  drawLineChart(options) {
    try {
      if (!options || !options.canvasId) {
        throw new Error('缺少必要的图表参数');
      }
      const { canvasId, data, width = 750, height = 300 } = options;
      const ctx = this.getContext(canvasId);
      
      if (!ctx) {
        throw new Error('获取canvas上下文失败');
      }
      
      // 清空画布
      ctx.clearRect(0, 0, width, height);
      
      // 配置参数
      const padding = 40;
      const chartWidth = width - padding * 2;
      const chartHeight = height - padding * 2;
      
      // 处理数据格式
      let datasets = [];
      let maxValue = 0;
      let labels = [];
      
      if (Array.isArray(data)) {
        // 直接接受数组格式
        datasets = [{ data: data, color: '#409eff' }];
        maxValue = Math.max(...data.map(item => item.value));
        labels = data.map(item => item.label);
      } else {
        // 接受对象格式
        maxValue = Math.max(...data.datasets.flatMap(ds => ds.data));
        labels = data.labels;
        datasets = data.datasets;
      }
    
    const pointCount = labels.length;
    
    // 绘制背景（使用渐变）
    const bgGradient = ctx.createLinearGradient(padding, padding, padding, padding + chartHeight);
    bgGradient.addColorStop(0, '#ffffff');
    bgGradient.addColorStop(1, '#f8f9ff');
    ctx.setFillStyle(bgGradient);
    ctx.fillRect(padding, padding, chartWidth, chartHeight);
    
    // 添加圆角边框
    ctx.setStrokeStyle('#e8eaed');
    ctx.setLineWidth(1);
    ctx.setLineJoin('round');
    ctx.beginPath();
    ctx.roundRect(padding, padding, chartWidth, chartHeight, 8);
    ctx.stroke();
    
    // 绘制网格线（使用虚线效果）
    ctx.setStrokeStyle('#e0e0e0');
    ctx.setLineWidth(1);
    ctx.setLineDash([5, 5]);
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + chartWidth, y);
      ctx.stroke();
      
      // Y轴标签（增强样式）
      ctx.setFillStyle('#909399');
      ctx.setFontSize(11);
      ctx.setTextAlign('right');
      ctx.fillText(Math.round((maxValue / 5) * (5 - i)), padding - 10, y + 4);
    }
    // 重置虚线样式
    ctx.setLineDash([]);
    
    // 绘制所有数据集
    datasets.forEach(dataset => {
      const dataPoints = Array.isArray(dataset) ? dataset : dataset.data;
      const lineColor = dataset.color || '#409eff';
      
      // 绘制线条（增强样式）
      ctx.setStrokeStyle(lineColor);
      ctx.setLineWidth(3);
      ctx.setLineCap('round');
      ctx.setLineJoin('round');
      ctx.beginPath();
      
      // 记录所有点的位置，用于绘制填充区域
      const points = [];
      dataPoints.forEach((value, pointIndex) => {
        const pointValue = typeof value === 'number' ? value : value.value;
        const x = padding + (chartWidth / (pointCount - 1)) * pointIndex;
        const y = padding + chartHeight - (pointValue / maxValue) * chartHeight;
        points.push({ x, y, value: pointValue });
        
        if (pointIndex === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
      
      // 绘制填充区域（渐变效果）
      if (points.length > 0) {
        const gradient = ctx.createLinearGradient(
          0, padding,
          0, padding + chartHeight
        );
        gradient.addColorStop(0, lineColor + '30'); // 30% opacity
        gradient.addColorStop(1, lineColor + '05'); // 5% opacity
        ctx.setFillStyle(gradient);
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.lineTo(points[points.length - 1].x, padding + chartHeight);
        ctx.lineTo(points[0].x, padding + chartHeight);
        ctx.closePath();
        ctx.fill();
      }
      
      // 绘制数据点（增强样式）
      dataPoints.forEach((value, pointIndex) => {
        const pointValue = typeof value === 'number' ? value : value.value;
        const x = padding + (chartWidth / (pointCount - 1)) * pointIndex;
        const y = padding + chartHeight - (pointValue / maxValue) * chartHeight;
        
        // 绘制外圈
        ctx.setFillStyle('#ffffff');
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();
        
        // 绘制内圈
        ctx.setFillStyle(lineColor);
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
        
        // 添加轻微阴影效果
        ctx.setShadowColor('rgba(0, 0, 0, 0.1)');
        ctx.setShadowBlur(3);
        ctx.setShadowOffsetX(0);
        ctx.setShadowOffsetY(2);
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.setShadowBlur(0);
      });
    });
    
    // 绘制X轴标签（增强样式）
    ctx.setFillStyle('#606266');
    ctx.setFontSize(12);
    ctx.setTextAlign('center');
    labels.forEach((label, index) => {
      const x = padding + (chartWidth / (pointCount - 1)) * index;
      ctx.fillText(label, x, padding + chartHeight + 20);
    });
    
    ctx.draw();
    return true;
  } catch (error) {
    console.error('绘制折线图失败:', error);
    return false;
  }
  }

  // 绘制饼图
  drawPieChart(options) {
    try {
      if (!options || !options.canvasId) {
        throw new Error('缺少必要的图表参数');
      }
      const { canvasId, data, width = 750, height = 300 } = options;
      const ctx = this.getContext(canvasId);
      
      if (!ctx) {
        throw new Error('获取canvas上下文失败');
      }
      
      // 清空画布
      ctx.clearRect(0, 0, width, height);
      
      // 配置参数
      const centerX = 150;
      const centerY = 150;
      const radius = 100;
      const innerRadius = radius * 0.6; // 环形图的内半径
      
      // 处理数据格式
      let pieData = [];
      let labels = [];
      let colors = [];
      
      if (Array.isArray(data)) {
        // 直接接受数组格式
        pieData = data.map(item => item.value);
        labels = data.map(item => item.name);
        colors = data.map(item => item.color);
      } else {
        // 接受对象格式
        pieData = data.datasets[0]?.data || [];
        labels = data.labels;
        colors = data.datasets[0]?.colors || [];
      }
      
      const total = pieData.reduce((sum, val) => sum + val, 0);
      let startAngle = -Math.PI / 2;
      
      // 计算每个扇形的中心角度和位置，用于绘制标签
      const labelPositions = [];
      
      // 绘制饼图各部分（使用环形图样式）
      pieData.forEach((value, index) => {
        if (value <= 0) return;
        
        const endAngle = startAngle + (value / total) * 2 * Math.PI;
        const midAngle = (startAngle + endAngle) / 2;
        
        // 创建扇形的渐变填充
        const gradient = ctx.createRadialGradient(
          centerX, centerY, innerRadius,
          centerX, centerY, radius
        );
        const color = colors[index] || '#909399';
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, this.darkenColor(color, 0.2));
        
        ctx.setFillStyle(gradient);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fill();
        
        // 计算并存储标签位置
        const labelRadius = radius + 15;
        labelPositions.push({
          label: labels[index],
          value: value,
          x: centerX + Math.cos(midAngle) * labelRadius,
          y: centerY + Math.sin(midAngle) * labelRadius,
          color: color
        });
        
        startAngle = endAngle;
      });
      
      // 绘制环形图的内圆（只绘制一次）
      ctx.setFillStyle('#ffffff');
      ctx.beginPath();
      ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
      ctx.fill();
      
      // 添加中心文本
      ctx.setFillStyle('#303133');
      ctx.setFontSize(18);
      ctx.setTextAlign('center');
      ctx.setTextBaseline('middle');
      ctx.fillText('风险分布', centerX, centerY);
      
      // 绘制图例（增强样式）
      const legendX = Math.max(centerX + radius + 50, 300);
      const legendY = 60;
      labels.forEach((label, index) => {
        if (pieData[index] <= 0) return;
        
        const y = legendY + index * 35;
        const color = colors[index] || '#909399';
        const percentage = total > 0 ? Math.round((pieData[index] / total) * 100) : 0;
        
        // 图例颜色块（带阴影）
        ctx.setShadowColor('rgba(0, 0, 0, 0.15)');
        ctx.setShadowBlur(4);
        ctx.setShadowOffsetX(1);
        ctx.setShadowOffsetY(2);
        ctx.setFillStyle(color);
        ctx.fillRect(legendX, y, 24, 24);
        ctx.setShadowBlur(0);
        
        // 图例文字（增强样式）
        ctx.setFillStyle('#606266');
        ctx.setFontSize(13);
        ctx.setTextAlign('left');
        ctx.setTextBaseline('middle');
        ctx.fillText(label, legendX + 34, y + 12);
        
        // 百分比显示
        ctx.setFillStyle('#909399');
        ctx.setFontSize(12);
        ctx.fillText(`(${percentage}%)`, legendX + 34 + ctx.measureText(label).width + 8, y + 12);
      });
      
      ctx.draw();
      return true;
    } catch (error) {
      console.error('绘制饼图失败:', error);
      return false;
    }
  }

  // 绘制柱状图
  drawBarChart(options) {
    try {
      if (!options || !options.canvasId) {
        throw new Error('缺少必要的图表参数');
      }
      const { canvasId, data, width = 750, height = 300 } = options;
      const ctx = this.getContext(canvasId);
      
      if (!ctx) {
        throw new Error('获取canvas上下文失败');
      }
      
      // 清空画布
      ctx.clearRect(0, 0, width, height);
      
      // 配置参数
      const padding = 40;
      const chartWidth = width - padding * 2;
      const chartHeight = height - padding * 2;
      
      // 检查数据完整性
      if (!data.datasets || !data.datasets[0] || !data.datasets[0].data) {
        throw new Error('柱状图数据不完整');
      }
      
      const maxValue = Math.max(...data.datasets[0].data);
      const barCount = data.labels.length;
      const barWidth = chartWidth / (barCount * 1.5);
      
      // 绘制背景
      ctx.setFillStyle('#fafafa');
      ctx.fillRect(padding, padding, chartWidth, chartHeight);
      
      // 绘制网格线
      ctx.setStrokeStyle('#e0e0e0');
      ctx.setLineWidth(1);
      for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(padding + chartWidth, y);
        ctx.stroke();
      }
      
      // 绘制柱子
      data.datasets[0].data.forEach((value, index) => {
        const x = padding + barWidth * 1.5 * index + barWidth * 0.25;
        const barHeight = (value / maxValue) * chartHeight;
        const y = padding + chartHeight - barHeight;
        
        ctx.setFillStyle(data.datasets[0].colors[index]);
        ctx.fillRect(x, y, barWidth, barHeight);
      });
      
      // 绘制X轴标签
      ctx.setFillStyle('#666');
      ctx.setFontSize(12);
      data.labels.forEach((label, index) => {
        const x = padding + barWidth * 1.5 * index + barWidth * 0.5;
        ctx.fillText(label, x - 15, padding + chartHeight + 20);
      });
      
      ctx.draw();
      return true;
    } catch (error) {
      console.error('绘制柱状图失败:', error);
      return false;
    }
  }

  // 清除指定画布
  clearChart(canvasId) {
    try {
      const ctx = this.getContext(canvasId);
      if (!ctx) {
        throw new Error('获取canvas上下文失败');
      }
      ctx.clearRect(0, 0, 750, 300);
      ctx.draw();
      return true;
    } catch (error) {
      console.error('清除画布失败:', error);
      return false;
    }
  }
  
  // 辅助方法：深色化颜色
  darkenColor(color, amount) {
    // 移除#号
    color = color.replace('#', '');
    // 转换为RGB
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    
    // 深色化
    const newR = Math.max(0, Math.round(r - (255 * amount)));
    const newG = Math.max(0, Math.round(g - (255 * amount)));
    const newB = Math.max(0, Math.round(b - (255 * amount)));
    
    // 转换回十六进制
    const newColor = '#' + 
      (newR.toString(16).padStart(2, '0')) + 
      (newG.toString(16).padStart(2, '0')) + 
      (newB.toString(16).padStart(2, '0'));
    
    return newColor;
  }
}

// 创建Chart实例
const chart = new Chart();

// 导出工具函数
module.exports = {
  drawLineChart: chart.drawLineChart.bind(chart),
  drawPieChart: chart.drawPieChart.bind(chart),
  drawBarChart: chart.drawBarChart.bind(chart),
  clearChart: chart.clearChart.bind(chart)
};