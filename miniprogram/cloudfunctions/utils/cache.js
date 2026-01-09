// 云函数缓存工具类 - 使用云数据库实现分布式缓存
class CloudCache {
  constructor() {
    this.defaultExpireTime = 300000; // 默认缓存时间5分钟
    this.cloud = require('wx-server-sdk');
    // 确保云开发已初始化
    if (!this.cloud.database) {
      this.cloud.init({ env: this.cloud.DYNAMIC_CURRENT_ENV });
    }
    this.db = this.cloud.database();
    this._ = this.db.command;
    this.cacheCollection = 'cloud_cache';
  }

  // 设置缓存
  async set(key, value, expireTime = this.defaultExpireTime) {
    const expireAt = Date.now() + expireTime;
    const cacheData = {
      _id: key,
      value,
      expireAt,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      // 尝试更新现有缓存，如果不存在则创建
      await this.db.collection(this.cacheCollection).doc(key).set({
        data: cacheData
      });
    } catch (error) {
      console.error('设置缓存失败:', error);
    }

    return value;
  }

  // 获取缓存
  async get(key) {
    try {
      const result = await this.db.collection(this.cacheCollection).doc(key).get();
      const item = result.data;

      if (!item) return null;
      
      // 检查是否过期
      if (Date.now() > item.expireAt) {
        // 删除过期缓存
        await this.delete(key);
        return null;
      }
      
      return item.value;
    } catch (error) {
      console.error('获取缓存失败:', error);
      return null;
    }
  }

  // 删除缓存
  async delete(key) {
    try {
      await this.db.collection(this.cacheCollection).doc(key).remove();
      return true;
    } catch (error) {
      console.error('删除缓存失败:', error);
      return false;
    }
  }

  // 清除所有缓存
  async clear() {
    try {
      // 获取所有缓存记录
      const result = await this.db.collection(this.cacheCollection).get();
      const deletePromises = result.data.map(item => 
        this.db.collection(this.cacheCollection).doc(item._id).remove()
      );
      await Promise.all(deletePromises);
      return true;
    } catch (error) {
      console.error('清除所有缓存失败:', error);
      return false;
    }
  }

  // 清除过期缓存
  async clearExpired() {
    try {
      await this.db.collection(this.cacheCollection)
        .where({
          expireAt: this._.lt(Date.now())
        })
        .remove();
      return true;
    } catch (error) {
      console.error('清除过期缓存失败:', error);
      return false;
    }
  }

  // 生成缓存键
  generateKey(action, params) {
    return `${action}_${JSON.stringify(params)}`;
  }
}

// 导出单例实例
module.exports = new CloudCache();
