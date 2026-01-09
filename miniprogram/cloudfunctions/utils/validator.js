// 数据验证和Sanitization工具类
class Validator {
  constructor() {
    this.errors = [];
  }

  // 重置错误信息
  reset() {
    this.errors = [];
  }

  // 获取错误信息
  getErrors() {
    return this.errors;
  }

  // 检查是否有错误
  hasErrors() {
    return this.errors.length > 0;
  }

  // 验证必填字段
  required(value, fieldName) {
    if (value === undefined || value === null || value === '') {
      this.errors.push(`${fieldName}是必填字段`);
      return false;
    }
    return true;
  }

  // 验证字符串长度
  stringLength(value, fieldName, min = 0, max = Infinity) {
    if (typeof value !== 'string') {
      this.errors.push(`${fieldName}必须是字符串类型`);
      return false;
    }
    if (value.length < min) {
      this.errors.push(`${fieldName}长度不能小于${min}个字符`);
      return false;
    }
    if (value.length > max) {
      this.errors.push(`${fieldName}长度不能超过${max}个字符`);
      return false;
    }
    return true;
  }

  // 验证数字范围
  numberRange(value, fieldName, min = -Infinity, max = Infinity) {
    const num = Number(value);
    if (isNaN(num)) {
      this.errors.push(`${fieldName}必须是数字类型`);
      return false;
    }
    if (num < min) {
      this.errors.push(`${fieldName}不能小于${min}`);
      return false;
    }
    if (num > max) {
      this.errors.push(`${fieldName}不能大于${max}`);
      return false;
    }
    return true;
  }

  // 验证日期格式
  dateFormat(value, fieldName) {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      this.errors.push(`${fieldName}必须是有效的日期格式`);
      return false;
    }
    return true;
  }

  // 验证数组
  array(value, fieldName) {
    if (!Array.isArray(value)) {
      this.errors.push(`${fieldName}必须是数组类型`);
      return false;
    }
    return true;
  }

  // 验证对象
  object(value, fieldName) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      this.errors.push(`${fieldName}必须是对象类型`);
      return false;
    }
    return true;
  }

  // 验证枚举值
  enum(value, fieldName, allowedValues) {
    if (!allowedValues.includes(value)) {
      this.errors.push(`${fieldName}必须是以下值之一: ${allowedValues.join(', ')}`);
      return false;
    }
    return true;
  }

  // Sanitize: 清理字符串，防止XSS攻击
  sanitizeString(str) {
    if (typeof str !== 'string') return str;
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // Sanitize: 清理HTML
  sanitizeHTML(html) {
    if (typeof html !== 'string') return html;
    // 移除所有脚本标签
    return html.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
      // 移除所有事件属性
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      // 移除所有危险的HTML标签
      .replace(/<(iframe|frame|object|embed)[^>]*>([\s\S]*?)<\/\1>/gi, '');
  }

  // Sanitize: 清理数字
  sanitizeNumber(num) {
    return Number(num) || 0;
  }

  // Sanitize: 清理日期
  sanitizeDate(date) {
    const d = new Date(date);
    return isNaN(d.getTime()) ? new Date() : d;
  }

  // Sanitize: 清理对象，递归清理所有属性
  sanitizeObject(obj) {
    if (typeof obj !== 'object' || obj === null) return obj;
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }
    const sanitized = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        if (typeof value === 'string') {
          sanitized[key] = this.sanitizeString(value);
        } else if (typeof value === 'number') {
          sanitized[key] = this.sanitizeNumber(value);
        } else if (value instanceof Date) {
          sanitized[key] = this.sanitizeDate(value);
        } else if (typeof value === 'object' && value !== null) {
          sanitized[key] = this.sanitizeObject(value);
        } else {
          sanitized[key] = value;
        }
      }
    }
    return sanitized;
  }

  // 防止SQL注入攻击
  preventSQLInjection(value) {
    if (typeof value !== 'string') return value;
    // 移除SQL注入相关的特殊字符
    return value.replace(/[;'"\-\s]/g, '');
  }

  // 验证并清理证书数据
  validateCertificateData(data) {
    this.reset();

    // 验证必填字段
    this.required(data.name, '证书名称');
    this.required(data.type, '证书类型');
    this.required(data.certificateNumber, '证书编号');
    this.required(data.issueDate, '颁发日期');
    this.required(data.expiryDate, '到期日期');
    this.required(data.issuingAuthority, '颁发机构');
    this.required(data.holder, '持证人');

    // 验证字符串长度
    this.stringLength(data.name, '证书名称', 1, 100);
    this.stringLength(data.type, '证书类型', 1, 50);
    this.stringLength(data.certificateNumber, '证书编号', 1, 50);
    this.stringLength(data.issuingAuthority, '颁发机构', 1, 100);
    this.stringLength(data.holder, '持证人', 1, 50);

    // 验证日期格式
    if (this.required(data.issueDate, '颁发日期')) {
      this.dateFormat(data.issueDate, '颁发日期');
    }
    if (this.required(data.expiryDate, '到期日期')) {
      this.dateFormat(data.expiryDate, '到期日期');
    }

    // 验证到期日期不能早于颁发日期
    if (data.issueDate && data.expiryDate) {
      const issueDate = new Date(data.issueDate);
      const expiryDate = new Date(data.expiryDate);
      if (expiryDate < issueDate) {
        this.errors.push('到期日期不能早于颁发日期');
      }
    }

    // 验证附件数组
    if (data.attachments) {
      this.array(data.attachments, '附件');
    }

    // 清理数据
    const sanitizedData = this.sanitizeObject(data);

    // 防止SQL注入攻击
    sanitizedData.certificateNumber = this.preventSQLInjection(sanitizedData.certificateNumber);

    return { valid: !this.hasErrors(), errors: this.getErrors(), data: sanitizedData };
  }

  // 验证并清理检查表数据
  validateChecklistData(data) {
    this.reset();

    // 验证必填字段
    this.required(data.checkType, '检查类型');
    this.required(data.dept, '检查部门');
    this.required(data.location, '检查地点');

    // 验证字符串长度
    this.stringLength(data.checkType, '检查类型', 1, 50);
    this.stringLength(data.dept, '检查部门', 1, 50);
    this.stringLength(data.location, '检查地点', 1, 100);

    // 清理数据
    const sanitizedData = this.sanitizeObject(data);

    return { valid: !this.hasErrors(), errors: this.getErrors(), data: sanitizedData };
  }

  // 验证并清理检查记录数据
  validateCheckRecordData(data) {
    this.reset();

    // 验证必填字段
    this.required(data.checkItems, '检查项目');
    this.required(data.checkType, '检查类型');
    this.required(data.checkDept, '检查部门');
    this.required(data.checkPerson, '检查人');
    this.required(data.checkScope, '检查范围');

    // 验证检查项目数组
    if (this.required(data.checkItems, '检查项目')) {
      this.array(data.checkItems, '检查项目');
    }

    // 验证字符串长度
    this.stringLength(data.checkType, '检查类型', 1, 50);
    this.stringLength(data.checkDept, '检查部门', 1, 50);
    this.stringLength(data.checkPerson, '检查人', 1, 50);
    this.stringLength(data.checkScope, '检查范围', 1, 200);

    // 清理数据
    const sanitizedData = this.sanitizeObject(data);

    return { valid: !this.hasErrors(), errors: this.getErrors(), data: sanitizedData };
  }
}

// 导出单例实例
module.exports = new Validator();
