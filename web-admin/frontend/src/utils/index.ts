// 格式化日期
export function formatDate(date: string | Date, format = 'YYYY-MM-DD HH:mm:ss'): string {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

// 获取风险等级颜色
export function getRiskLevelColor(level: number): string {
  const colors = {
    1: '#f56c6c', // 重大风险 - 红色
    2: '#e6a23c', // 较大风险 - 橙色
    3: '#409eff', // 一般风险 - 蓝色
    4: '#67c23a'  // 低风险 - 绿色
  }
  return colors[level as keyof typeof colors] || '#909399'
}

// 获取风险等级标签
export function getRiskLevelLabel(level: number): string {
  const labels = {
    1: '重大风险',
    2: '较大风险',
    3: '一般风险',
    4: '低风险'
  }
  return labels[level as keyof typeof labels] || '未知'
}

// 获取隐患等级颜色
export function getDangerLevelColor(level: string): string {
  const colors: Record<string, string> = {
    '重大隐患': '#f56c6c',
    '一般隐患': '#e6a23c'
  }
  return colors[level] || '#909399'
}

// 获取预警级别颜色
export function getWarningLevelColor(level: string): string {
  const colors: Record<string, string> = {
    '红': '#f56c6c',
    '橙': '#e6a23c',
    '黄': '#409eff',
    '蓝': '#67c23a'
  }
  return colors[level] || '#909399'
}

// 获取进度条颜色
export function getProgressColor(percentage: number): string {
  if (percentage >= 100) return '#67c23a'
  if (percentage >= 80) return '#409eff'
  if (percentage >= 60) return '#e6a23c'
  return '#f56c6c'
}

// 计算剩余天数
export function getRemainingDays(deadline: string): number {
  const now = new Date()
  const end = new Date(deadline)
  const diff = end.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// 判断是否超期
export function isOverdue(deadline: string): boolean {
  return getRemainingDays(deadline) < 0
}

// 导出数据为CSV
export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) return

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => row[header]).join(','))
  ].join('\n')

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function (this: any, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      func.apply(this, args)
    }, wait)
  }
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  let previous = 0

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now()
    const remaining = wait - (now - previous)

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      previous = now
      func.apply(this, args)
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now()
        timeout = null
        func.apply(this, args)
      }, remaining)
    }
  }
}