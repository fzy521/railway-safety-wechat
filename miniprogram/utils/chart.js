// 微信小程序简易图表绘制工具

/**
 * 绘制柱状图
 * @param {Object} options - 配置选项
 * @param {number} options.canvasId - canvas ID
 * @param {Object[]} options.data - 数据格式: [{label: '标签', value: 100}]
 * @param {number} options.width - 画布宽度
 * @param {number} options.height - 画布高度
 */
function drawBarChart(options) {
  const { canvasId, data, width, height } = options

  const query = wx.createSelectorQuery()
  query.select(`#${canvasId}`)
    .fields({ node: true, size: true })
    .exec((res) => {
      if (!res[0]) return

      const canvas = res[0].node
      const ctx = canvas.getContext('2d')
      const pixelRatio = wx.getSystemInfoSync().pixelRatio

      // 设置实际渲染大小
      canvas.width = width * pixelRatio
      canvas.height = height * pixelRatio
      ctx.scale(pixelRatio, pixelRatio)

      // 清空画布
      ctx.clearRect(0, 0, width, height)

      // 获取最大值
      const maxValue = Math.max(...data.map(d => d.value), 10)

      // 边距
      const margin = 20
      const barWidth = (width - margin * 2) / data.length - margin

      // 绘制网格线
      ctx.strokeStyle = '#f0f0f0'
      ctx.lineWidth = 1
      for (let i = 0; i <= 4; i++) {
        const y = margin + (height - margin * 2) / 4 * i
        ctx.beginPath()
        ctx.moveTo(margin, y)
        ctx.lineTo(width - margin, y)
        ctx.stroke()
      }

      // 绘制柱状图
      data.forEach((item, index) => {
        const x = margin + index * (barWidth + margin)
        const barHeight = (item.value / maxValue) * (height - margin * 2)
        const y = height - margin - barHeight

        // 根据值大小设置颜色
        const getColor = (value) => {
          if (value === 0) return '#07c160'
          if (value <= 1) return '#ffbe00'
          return '#ee0a24'
        }

        // 绘制柱子
        ctx.fillStyle = getColor(item.value)
        ctx.fillRect(x, y, barWidth, barHeight)

        // 绘制标签
        ctx.fillStyle = '#666'
        ctx.font = '12px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(item.label, x + barWidth / 2, height - 10)

        // 绘制数值
        if (item.value > 0) {
          ctx.fillStyle = '#333'
          ctx.font = '12px sans-serif'
          ctx.fillText(item.value, x + barWidth / 2, y - 5)
        }
      })
    })
}

/**
 * 绘制折线图
 * @param {Object} options - 配置选项
 * @param {string} options.canvasId - canvas ID
 * @param {Object[]} options.data - 数据格式: [{label: '标签', value: 100}]
 * @param {number} options.width - 画布宽度
 * @param {number} options.height - 画布高度
 */
function drawLineChart(options) {
  const { canvasId, data, width, height } = options

  const query = wx.createSelectorQuery()
  query.select(`#${canvasId}`)
    .fields({ node: true, size: true })
    .exec((res) => {
      if (!res[0]) return

      const canvas = res[0].node
      const ctx = canvas.getContext('2d')
      const pixelRatio = wx.getSystemInfoSync().pixelRatio

      // 设置实际渲染大小
      canvas.width = width * pixelRatio
      canvas.height = height * pixelRatio
      ctx.scale(pixelRatio, pixelRatio)

      // 清空画布
      ctx.clearRect(0, 0, width, height)

      // 获取最大最小值
      const maxValue = Math.max(...data.map(d => d.value), 10)
      const minValue = Math.min(...data.map(d => d.value), 0)

      // 边距
      const margin = 20
      const chartWidth = width - margin * 2
      const chartHeight = height - margin * 2

      // 绘制网格线
      ctx.strokeStyle = '#f0f0f0'
      ctx.lineWidth = 1
      for (let i = 0; i <= 4; i++) {
        const y = margin + chartHeight / 4 * i
        ctx.beginPath()
        ctx.moveTo(margin, y)
        ctx.lineTo(width - margin, y)
        ctx.stroke()
      }

      // 计算坐标点
      const points = data.map((item, index) => ({
        x: margin + (index / (data.length - 1)) * chartWidth,
        y: margin + (1 - (item.value - minValue) / (maxValue - minValue)) * chartHeight,
        value: item.value,
        label: item.label
      }))

      // 绘制折线
      ctx.strokeStyle = '#1989fa'
      ctx.lineWidth = 2
      ctx.beginPath()
      points.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y)
        } else {
          ctx.lineTo(point.x, point.y)
        }
      })
      ctx.stroke()

      // 绘制数据点
      points.forEach(point => {
        ctx.fillStyle = '#1989fa'
        ctx.beginPath()
        ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI)
        ctx.fill()

        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.stroke()
      })

      // 绘制标签
      ctx.fillStyle = '#666'
      ctx.font = '12px sans-serif'
      ctx.textAlign = 'center'
      points.forEach(point => {
        ctx.fillText(point.label, point.x, height - 10)
      })
    })
}

/**
 * 绘制饼图
 * @param {Object} options - 配置选项
 * @param {string} options.canvasId - canvas ID
 * @param {Object[]} options.data - 数据格式: [{label: '标签', value: 100, color: '#1989fa'}]
 * @param {number} options.width - 画布宽度
 * @param {number} options.height - 画布高度
 */
function drawPieChart(options) {
  const { canvasId, data, width, height } = options

  const query = wx.createSelectorQuery()
  query.select(`#${canvasId}`)
    .fields({ node: true, size: true })
    .exec((res) => {
      if (!res[0]) return

      const canvas = res[0].node
      const ctx = canvas.getContext('2d')
      const pixelRatio = wx.getSystemInfoSync().pixelRatio

      // 设置实际渲染大小
      canvas.width = width * pixelRatio
      canvas.height = height * pixelRatio
      ctx.scale(pixelRatio, pixelRatio)

      // 清空画布
      ctx.clearRect(0, 0, width, height)

      // 默认颜色
      const defaultColors = ['#1989fa', '#07c160', '#ffbe00', '#ee0a24', '#8b5cf6', '#f59e0b']

      // 计算总值
      const total = data.reduce((sum, item) => sum + item.value, 0)

      // 绘制饼图
      const centerX = width / 2
      const centerY = height / 2
      const radius = Math.min(width, height) / 2 - 40

      let currentAngle = -Math.PI / 2 // 从顶部开始

      data.forEach((item, index) => {
        const angle = (item.value / total) * 2 * Math.PI

        // 绘制扇形
        ctx.fillStyle = item.color || defaultColors[index % defaultColors.length]
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + angle)
        ctx.closePath()
        ctx.fill()

        // 绘制标签
        const labelAngle = currentAngle + angle / 2
        const labelX = centerX + Math.cos(labelAngle) * (radius + 20)
        const labelY = centerY + Math.sin(labelAngle) * (radius + 20)

        ctx.fillStyle = '#333'
        ctx.font = '12px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(item.label, labelX, labelY)

        const percentText = `${Math.round(item.value / total * 100)}%`
        ctx.fillText(percentText, labelX, labelY + 15)

        currentAngle += angle
      })

      // 绘制图例
      const legendStartY = height - 60
      const legendItemHeight = 20
      const legendItemWidth = 60
      const itemsPerRow = Math.floor(width / (legendItemWidth + 10))

      data.forEach((item, index) => {
        const row = Math.floor(index / itemsPerRow)
        const col = index % itemsPerRow
        const x = 10 + col * (legendItemWidth + 10)
        const y = legendStartY + row * legendItemHeight

        ctx.fillStyle = item.color || defaultColors[index % defaultColors.length]
        ctx.fillRect(x, y, 10, 10)

        ctx.fillStyle = '#666'
        ctx.font = '10px sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText(item.label, x + 15, y + 8)
      })
    })
}

// 导出图表函数
module.exports = {
  drawBarChart,
  drawLineChart,
  drawPieChart
}