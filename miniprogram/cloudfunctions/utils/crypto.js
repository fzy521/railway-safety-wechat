// 敏感数据加密工具类
const crypto = require('crypto');

// 加密配置 - 建议从环境变量获取密钥
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-secret-key-change-this-in-production';
const IV_LENGTH = 16; // AES 初始化向量长度

class CryptoUtil {
  constructor() {
    this.algorithm = 'aes-256-cbc';
    this.key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32); // 生成32字节密钥
  }

  // 加密数据
  encrypt(text) {
    if (typeof text !== 'string') {
      text = JSON.stringify(text);
    }
    
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  // 解密数据
  decrypt(encryptedText) {
    try {
      const textParts = encryptedText.split(':');
      const iv = Buffer.from(textParts.shift(), 'hex');
      const encrypted = textParts.join(':');
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      // 尝试解析为JSON，如果失败则返回字符串
      try {
        return JSON.parse(decrypted);
      } catch {
        return decrypted;
      }
    } catch (error) {
      console.error('解密失败:', error);
      return encryptedText; // 解密失败时返回原始文本
    }
  }

  // 加密对象中的敏感字段
  encryptSensitiveFields(obj, sensitiveFields) {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    const result = { ...obj };
    
    sensitiveFields.forEach(field => {
      if (result[field] !== undefined && result[field] !== null) {
        result[field] = this.encrypt(result[field]);
      }
    });
    
    return result;
  }

  // 解密对象中的敏感字段
  decryptSensitiveFields(obj, sensitiveFields) {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    const result = { ...obj };
    
    sensitiveFields.forEach(field => {
      if (result[field] !== undefined && result[field] !== null) {
        result[field] = this.decrypt(result[field]);
      }
    });
    
    return result;
  }

  // 加密数组中的对象的敏感字段
  encryptArraySensitiveFields(arr, sensitiveFields) {
    if (!Array.isArray(arr)) return arr;
    
    return arr.map(item => this.encryptSensitiveFields(item, sensitiveFields));
  }

  // 解密数组中的对象的敏感字段
  decryptArraySensitiveFields(arr, sensitiveFields) {
    if (!Array.isArray(arr)) return arr;
    
    return arr.map(item => this.decryptSensitiveFields(item, sensitiveFields));
  }
}

// 导出单例实例
module.exports = new CryptoUtil();
