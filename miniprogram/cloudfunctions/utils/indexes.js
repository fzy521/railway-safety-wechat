// 数据库索引优化建议
// 该文件包含项目中建议创建的数据库索引，以优化查询性能

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

// 建议创建的索引配置
const indexes = [
  // certificates集合索引
  {
    collection: 'certificates',
    indexes: [
      {
        name: 'idx_status_expiryDate',
        keys: [{ status: 1 }, { expiryDate: 1 }],
        description: '优化按状态和到期日期查询证书列表',
        unique: false
      },
      {
        name: 'idx_type_status',
        keys: [{ type: 1 }, { status: 1 }],
        description: '优化按类型和状态筛选证书',
        unique: false
      },
      {
        name: 'idx_expiryDate',
        keys: [{ expiryDate: 1 }],
        description: '优化查询即将到期的证书',
        unique: false
      }
    ]
  },
  
  // check_records集合索引
  {
    collection: 'check_records',
    indexes: [
      {
        name: 'idx_status_checkDate',
        keys: [{ status: 1 }, { checkDate: -1 }],
        description: '优化按状态查询检查记录列表',
        unique: false
      },
      {
        name: 'idx_checkDate',
        keys: [{ checkDate: -1 }],
        description: '优化按日期排序查询检查记录',
        unique: false
      }
    ]
  },
  
  // risk_library集合索引
  {
    collection: 'risk_library',
    indexes: [
      {
        name: 'idx_status_dept_location',
        keys: [{ status: 1 }, { manage_dept: 1 }, { location: 1 }],
        description: '优化生成检查表时的风险项查询',
        unique: false
      },
      {
        name: 'idx_status',
        keys: [{ status: 1 }],
        description: '优化查询有效风险项',
        unique: false
      }
    ]
  },
  
  // hidden_danger_library集合索引
  {
    collection: 'hidden_danger_library',
    indexes: [
      {
        name: 'idx_status_relatedRiskId',
        keys: [{ status: 1 }, { relatedRiskId: 1 }],
        description: '优化检查重复隐患的查询',
        unique: false
      },
      {
        name: 'idx_status_discoveryDate',
        keys: [{ status: 1 }, { discoveryDate: -1 }],
        description: '优化按状态和发现日期查询隐患',
        unique: false
      }
    ]
  }
];

/**
 * 创建所有建议的索引
 * 注意：该函数需要在具有数据库管理权限的云函数中运行
 */
async function createAllIndexes() {
  const db = cloud.database();
  const createPromises = [];
  
  for (const collectionConfig of indexes) {
    const { collection, indexes: collectionIndexes } = collectionConfig;
    
    for (const index of collectionIndexes) {
      const promise = db.collection(collection).createIndex({
        keys: index.keys,
        name: index.name,
        unique: index.unique
      })
      .then(res => {
        console.log(`成功为${collection}集合创建索引${index.name}:`, res);
        return res;
      })
      .catch(err => {
        console.error(`为${collection}集合创建索引${index.name}失败:`, err);
        return err;
      });
      
      createPromises.push(promise);
    }
  }
  
  return await Promise.all(createPromises);
}

/**
 * 列出所有建议的索引配置
 */
function listSuggestedIndexes() {
  return indexes;
}

// 导出函数
module.exports = {
  createAllIndexes,
  listSuggestedIndexes,
  indexes
};

// 如果直接运行该文件，则创建所有索引
if (require.main === module) {
  createAllIndexes()
    .then(results => {
      console.log('索引创建操作完成');
      console.log('结果:', results);
      process.exit(0);
    })
    .catch(error => {
      console.error('索引创建过程中发生错误:', error);
      process.exit(1);
    });
}