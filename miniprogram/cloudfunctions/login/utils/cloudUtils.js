// 通用云函数工具库
// 提供缓存、加密、输入验证等核心功能
const cloud = require('wx-server-sdk');
const crypto = require('crypto');

// 初始化云环境
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

class CloudFunctionUtils {
  constructor() {
    this.cacheCollection = db.collection('function_cache');
    this.cacheExpiration = 5 * 60 * 1000; // 默认缓存5分钟
  }

  /**
   * 参数类型定义
   */
  paramTypes = {
    string: {
      type: 'string',
      required: true,
      optional: () => ({ type: 'string', required: false })
    },
    number: {
      type: 'number',
      required: true,
      optional: () => ({ type: 'number', required: false })
    },
    boolean: {
      type: 'boolean',
      required: true,
      optional: () => ({ type: 'boolean', required: false })
    },
    object: {
      type: 'object',
      required: true,
      optional: () => ({ type: 'object', required: false })
    },
    array: {
      type: 'array',
      required: true,
      optional: () => ({ type: 'array', required: false })
    }
  };

  // 参数验证（兼容validateInput方法）
  validateParams = (input, rules) => {
    const errors = [];
    
    for (const paramName in rules) {
      const rule = rules[paramName];
      const value = input[paramName];

      // 检查是否为必填参数
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`${paramName} 是必需参数`);
        continue;
      }
      
      // 如果参数不需要验证或值为空且不是必需的，跳过
      if (!rule.required && (value === undefined || value === null || value === '')) {
        continue;
      }
      
      // 类型验证
      if (rule.type) {
        const expectedType = rule.type;
        let actualType;
        
        if (Array.isArray(value)) {
          actualType = 'array';
        } else if (value !== null && typeof value === 'object') {
          actualType = 'object';
        } else {
          actualType = typeof value;
        }
        
        if (actualType !== expectedType) {
          errors.push(`${paramName} 类型错误，期望 ${expectedType}，实际 ${actualType}`);
        }
      }
      
      // 范围验证（仅对数字类型）
      if (typeof value === 'number' && rule.range) {
        const [min, max] = rule.range;
        if (value < min || value > max) {
          errors.push(`${paramName} 值必须在 ${min} - ${max} 之间`);
        }
      }
      
      // 长度验证（仅对字符串类型）
      if (typeof value === 'string' && rule.length) {
        const [min, max] = rule.length;
        if (value.length < min || value.length > max) {
          errors.push(`${paramName} 长度必须在 ${min} - ${max} 之间`);
        }
      }
    }
    
    return {
      success: errors.length === 0,
      error: errors.length > 0 ? errors.join('; ') : null
    };
  };
  
  // 兼容旧的validateInput方法
  validateInput = (input, rules) => {
    const result = this.validateParams(input, rules);
    return {
      valid: result.success,
      errors: result.error ? [result.error] : []
    };
  };

  /**
   * 生成缓存键
   * @param {String} functionName 云函数名称
   * @param {Object} params 函数参数
   * @returns {String} 缓存键
   */
  generateCacheKey(functionName, params) {
    const keyString = `${functionName}:${JSON.stringify(params)}`;
    return crypto.createHash('md5').update(keyString).digest('hex');
  }

  /**
   * 从缓存获取数据
   * @param {String} key 缓存键
   * @returns {any} 缓存数据或null
   */
  async getCache(key) {
    try {
      const result = await this.cacheCollection.doc(key).get();
      const { data, timestamp, expiration } = result.data;
      
      // 检查缓存是否过期
      if (Date.now() - timestamp < (expiration || this.cacheExpiration)) {
        return data;
      } else {
        // 清理过期缓存
        await this.cacheCollection.doc(key).remove();
        return null;
      }
    } catch (err) {
      // 缓存不存在
      return null;
    }
  }

  /**
   * 设置缓存
   * @param {String} key 缓存键
   * @param {any} data 要缓存的数据
   * @param {Number} expirationMinutes 过期时间(分钟，可选)
   * @returns {Boolean} 设置结果
   */
  async setCache(key, data, expirationMinutes = 5) {
    try {
      await this.cacheCollection.doc(key).set({
        data: {
          data,
          timestamp: Date.now(),
          expiration: expirationMinutes * 60 * 1000
        }
      });
      return true;
    } catch (err) {
      console.error('设置缓存失败:', err);
      return false;
    }
  }

  /**
   * 清除指定前缀的缓存
   * @param {String} prefix 缓存键前缀
   * @returns {Boolean} 清除结果
   */
  async clearCacheByPrefix(prefix) {
    try {
      // 由于云开发数据库不支持模糊查询，我们需要先获取所有缓存，然后筛选出符合条件的进行删除
      const result = await this.cacheCollection.get();
      const prefixHash = crypto.createHash('md5').update(prefix).digest('hex');
      
      for (const record of result.data) {
        // 检查缓存键是否以指定前缀开头
        if (record._id.startsWith(prefixHash.substring(0, 8))) {
          await this.cacheCollection.doc(record._id).remove();
        }
      }
      return true;
    } catch (err) {
      console.error('按前缀清除缓存失败:', err);
      return false;
    }
  }

  /**
   * 清理过期缓存
   * @returns {Promise} 清理结果
   */
  async cleanupExpiredCache() {
    try {
      const now = Date.now();
      const result = await this.cacheCollection.get();
      
      for (const record of result.data) {
        const { _id, timestamp, expiration } = record;
        if (now - timestamp >= (expiration || this.cacheExpiration)) {
          await this.cacheCollection.doc(_id).remove();
        }
      }
      return { success: true };
    } catch (err) {
      console.error('清理过期缓存失败:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * 数据加密
   * @param {String} data 要加密的数据
   * @param {String} key 加密密钥
   * @returns {String} 加密后的数据
   */
  encryptData(data, key = 'railway_safety_secret_key_2026') {
    const cipher = crypto.createCipher('aes-256-cbc', key);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  /**
   * 数据解密
   * @param {String} encryptedData 加密的数据
   * @param {String} key 解密密钥
   * @returns {String} 解密后的数据
   */
  decryptData(encryptedData, key = 'railway_safety_secret_key_2026') {
    try {
      const decipher = crypto.createDecipher('aes-256-cbc', key);
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (err) {
      console.error('数据解密失败:', err);
      return null;
    }
  }

  /**
   * 标准化响应格式
   * @param {Boolean} success 操作是否成功
   * @param {any} data 返回数据
   * @param {String} error 错误信息
   * @param {Number} code 状态码
   * @returns {Object} 标准化响应
   */
  standardResponse(success, data = null, error = null, code = 200) {
    const response = { success, code };
    if (data) response.data = data;
    if (error) response.error = error;
    return response;
  }
}

module.exports = CloudFunctionUtils;