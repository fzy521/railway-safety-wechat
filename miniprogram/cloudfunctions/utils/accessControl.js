// 访问控制管理工具类
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

// 定义用户角色
const ROLES = {
  ADMIN: 'admin',        // 管理员角色，拥有所有权限
  MANAGER: 'manager',    // 部门管理员角色
  USER: 'user',          // 普通用户角色
  GUEST: 'guest'         // 访客角色，权限最低
};

// 定义权限规则
const PERMISSIONS = {
  // 证书管理权限
  CERTIFICATE: {
    CREATE: 'certificate:create',
    READ: 'certificate:read',
    UPDATE: 'certificate:update',
    DELETE: 'certificate:delete',
    LIST: 'certificate:list'
  },
  
  // 检查表管理权限
  CHECKLIST: {
    CREATE: 'checklist:create',
    READ: 'checklist:read',
    UPDATE: 'checklist:update',
    DELETE: 'checklist:delete',
    LIST: 'checklist:list'
  },
  
  // 隐患管理权限
  DANGER: {
    CREATE: 'danger:create',
    READ: 'danger:read',
    UPDATE: 'danger:update',
    DELETE: 'danger:delete',
    LIST: 'danger:list'
  }
};

// 角色权限映射
const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.CERTIFICATE.CREATE,
    PERMISSIONS.CERTIFICATE.READ,
    PERMISSIONS.CERTIFICATE.UPDATE,
    PERMISSIONS.CERTIFICATE.DELETE,
    PERMISSIONS.CERTIFICATE.LIST,
    PERMISSIONS.CHECKLIST.CREATE,
    PERMISSIONS.CHECKLIST.READ,
    PERMISSIONS.CHECKLIST.UPDATE,
    PERMISSIONS.CHECKLIST.DELETE,
    PERMISSIONS.CHECKLIST.LIST,
    PERMISSIONS.DANGER.CREATE,
    PERMISSIONS.DANGER.READ,
    PERMISSIONS.DANGER.UPDATE,
    PERMISSIONS.DANGER.DELETE,
    PERMISSIONS.DANGER.LIST
  ],
  
  [ROLES.MANAGER]: [
    PERMISSIONS.CERTIFICATE.CREATE,
    PERMISSIONS.CERTIFICATE.READ,
    PERMISSIONS.CERTIFICATE.UPDATE,
    PERMISSIONS.CERTIFICATE.LIST,
    PERMISSIONS.CHECKLIST.CREATE,
    PERMISSIONS.CHECKLIST.READ,
    PERMISSIONS.CHECKLIST.UPDATE,
    PERMISSIONS.CHECKLIST.LIST,
    PERMISSIONS.DANGER.CREATE,
    PERMISSIONS.DANGER.READ,
    PERMISSIONS.DANGER.UPDATE,
    PERMISSIONS.DANGER.LIST
  ],
  
  [ROLES.USER]: [
    PERMISSIONS.CERTIFICATE.READ,
    PERMISSIONS.CERTIFICATE.LIST,
    PERMISSIONS.CHECKLIST.READ,
    PERMISSIONS.CHECKLIST.LIST,
    PERMISSIONS.DANGER.READ,
    PERMISSIONS.DANGER.LIST
  ],
  
  [ROLES.GUEST]: [
    PERMISSIONS.CERTIFICATE.READ,
    PERMISSIONS.CHECKLIST.READ,
    PERMISSIONS.DANGER.READ
  ]
};

class AccessControl {
  constructor() {
    this.db = cloud.database();
  }

  // 获取用户信息和角色
  async getUserInfo(openid) {
    try {
      const result = await this.db.collection('users').where({
        openid: openid
      }).get();
      
      if (result.data.length === 0) {
        // 用户不存在，默认角色为访客
        return {
          openid,
          role: ROLES.GUEST,
          hasPermission: (permission) => permission === PERMISSIONS.CERTIFICATE.READ || 
                                         permission === PERMISSIONS.CHECKLIST.READ || 
                                         permission === PERMISSIONS.DANGER.READ
        };
      }
      
      const user = result.data[0];
      return {
        ...user,
        openid,
        hasPermission: (permission) => this.hasPermission(user.role, permission)
      };
    } catch (error) {
      console.error('获取用户信息失败:', error);
      // 发生错误时，默认角色为访客
      return {
        openid,
        role: ROLES.GUEST,
        hasPermission: (permission) => permission === PERMISSIONS.CERTIFICATE.READ || 
                                       permission === PERMISSIONS.CHECKLIST.READ || 
                                       permission === PERMISSIONS.DANGER.READ
      };
    }
  }

  // 检查角色是否有特定权限
  hasPermission(role, permission) {
    if (!role || !ROLE_PERMISSIONS[role]) {
      role = ROLES.GUEST;
    }
    
    return ROLE_PERMISSIONS[role].includes(permission);
  }

  // 验证用户是否有特定权限
  async verifyPermission(openid, permission) {
    const user = await this.getUserInfo(openid);
    return user.hasPermission(permission);
  }

  // 验证管理员权限
  async verifyAdmin(openid) {
    const user = await this.getUserInfo(openid);
    return user.role === ROLES.ADMIN;
  }

  // 验证部门管理员权限
  async verifyManager(openid, department) {
    const user = await this.getUserInfo(openid);
    
    // 管理员自动拥有部门管理员权限
    if (user.role === ROLES.ADMIN) {
      return true;
    }
    
    // 部门管理员需要验证部门匹配
    return user.role === ROLES.MANAGER && user.department === department;
  }

  // 获取用户可访问的数据范围
  async getDataAccessScope(openid) {
    const user = await this.getUserInfo(openid);
    
    // 管理员可以访问所有数据
    if (user.role === ROLES.ADMIN) {
      return { all: true };
    }
    
    // 部门管理员可以访问自己部门的数据
    if (user.role === ROLES.MANAGER) {
      return { department: user.department };
    }
    
    // 普通用户只能访问自己的数据
    if (user.role === ROLES.USER) {
      return { createdBy: openid };
    }
    
    // 访客只能访问公开数据
    return { public: true };
  }

  // 应用数据访问过滤
  applyDataFilter(query, accessScope, collectionName) {
    if (accessScope.all) {
      // 管理员可以访问所有数据，不需要过滤
      return query;
    }
    
    if (accessScope.department) {
      // 部门管理员只能访问自己部门的数据
      switch (collectionName) {
        case 'certificates':
          return query.where({ department: accessScope.department });
        case 'check_records':
          return query.where({ checkDept: accessScope.department });
        case 'hidden_danger_library':
          return query.where({ responsibleDept: accessScope.department });
        default:
          return query;
      }
    }
    
    if (accessScope.createdBy) {
      // 普通用户只能访问自己创建的数据
      return query.where({ createdBy: accessScope.createdBy });
    }
    
    if (accessScope.public) {
      // 访客只能访问公开数据
      return query.where({ isPublic: true });
    }
    
    // 默认不返回任何数据
    return query.where({ _id: cloud.database().command.in([]) });
  }
}

// 导出常量和单例实例
module.exports = {
  ROLES,
  PERMISSIONS,
  accessControl: new AccessControl()
};
