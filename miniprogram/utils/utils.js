const app = getApp()

// 通用工具函数

/**
 * 格式化日期
 * @param {Date} date - 日期对象
 * @param {string} format - 格式模板
 * @returns {string} 格式化后的日期字符串
 */
function formatDate(date, format = 'YYYY-MM-DD') {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  const second = String(date.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second)
}

/**
 * 时间戳转日期字符串
 * @param {number} timestamp - 时间戳
 * @returns {string} 日期字符串
 */
function timestampToDate(timestamp) {
  const date = new Date(timestamp)
  return formatDate(date)
}

/**
 * 获取相对时间描述
 * @param {Date} date - 日期对象
 * @returns {string} 相对时间描述
 */
function getRelativeTime(date) {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minute = 1000 * 60
  const hour = minute * 60
  const day = hour * 24
  const month = day * 30
  const year = day * 365

  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return Math.floor(diff / minute) + '分钟前'
  } else if (diff < day) {
    return Math.floor(diff / hour) + '小时前'
  } else if (diff < month) {
    return Math.floor(diff / day) + '天前'
  } else if (diff < year) {
    return Math.floor(diff / month) + '个月前'
  } else {
    return Math.floor(diff / year) + '年前'
  }
}

/**
 * 防抖函数
 * @param {Function} func - 要执行的函数
 * @param {number} wait - 等待时间(ms)
 * @returns {Function} 防抖后的函数
 */
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * 节流函数
 * @param {Function} func - 要执行的函数
 * @param {number} limit - 时间间隔(ms)
 * @returns {Function} 节流后的函数
 */
function throttle(func, limit) {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * 深拷贝对象
 * @param {*} obj - 要拷贝的对象
 * @returns {*} 拷贝后的对象
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (obj instanceof Object) {
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

/**
 * 检验手机号格式
 * @param {string} phone - 手机号
 * @returns {boolean} 是否合法
 */
function validatePhone(phone) {
  return /^1[3-9]\d{9}$/.test(phone)
}

/**
 * 检验邮箱格式
 * @param {string} email - 邮箱地址
 * @returns {boolean} 是否合法
 */
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * 检验身份证号
 * @param {string} idCard - 身份证号
 * @returns {boolean} 是否合法
 */
function validateIdCard(idCard) {
  return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(idCard)
}

/**
 * 生成随机数
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {number} 随机数
 */
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * 获取文件扩展名
 * @param {string} filename - 文件名
 * @returns {string} 扩展名
 */
function getFileExtension(filename) {
  return filename.split('.').pop().toLowerCase()
}

/**
 * 文件大小格式化
 * @param {number} bytes - 字节数
 * @param {number} decimals - 小数位数
 * @returns {string} 格式化后的文件大小
 */
function formatFileSize(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * 判断是否为空对象
 * @param {*} obj - 要检查的对象
 * @returns {boolean} 是否为空
 */
function isEmpty(obj) {
  if (obj == null) return true
  if (typeof obj === 'undefined') return true
  if (typeof obj === 'string') return obj.length === 0
  if (Array.isArray(obj)) return obj.length === 0
  if (typeof obj === 'object') return Object.keys(obj).length === 0
  return false
}

/**
 * 数组分组
 * @param {Array} array - 要分组的数组
 * @param {Function} keySelector - 分组键选择函数
 * @returns {Object} 分组后的对象
 */
function groupBy(array, keySelector) {
  return array.reduce((groups, item) => {
    const key = keySelector(item)
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(item)
    return groups
  }, {})
}

/**
 * 数组去重
 * @param {Array} array - 要去重的数组
 * @param {Function} keySelector - 去重键选择函数
 * @returns {Array} 去重后的数组
 */
function uniqueBy(array, keySelector) {
  const seen = new Set()
  return array.filter(item => {
    const key = keySelector(item)
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

/**
 * 异步延迟
 * @param {number} ms - 延迟时间(ms)
 * @returns {Promise} 延迟Promise
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 页面间通信
 */
const eventBus = {
  events: {},

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
  },

  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => {
        callback(data)
      })
    }
  },

  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback)
    }
  },

  once(event, callback) {
    const onceCallback = (data) => {
      callback(data)
      this.off(event, onceCallback)
    }
    this.on(event, onceCallback)
  }
}

// 导出所有工具函数
module.exports = {
  formatDate,
  timestampToDate,
  getRelativeTime,
  debounce,
  throttle,
  deepClone,
  validatePhone,
  validateEmail,
  validateIdCard,
  random,
  getFileExtension,
  formatFileSize,
  isEmpty,
  groupBy,
  uniqueBy,
  sleep,
  eventBus
}