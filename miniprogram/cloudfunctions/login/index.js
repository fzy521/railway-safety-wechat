// 云函数入口文件
const cloud = require('wx-server-sdk');
const CloudFunctionUtils = require('./utils/cloudUtils');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const utils = new CloudFunctionUtils();
  const wxContext = cloud.getWXContext();

  try {
    // 输入验证
    const validation = utils.validateInput(event, {
      userInfo: { type: 'object', required: true }
    });

    if (!validation.valid) {
      return utils.standardResponse(false, null, validation.errors.join(';'));
    }

    const { userInfo } = event;
    const openid = wxContext.OPENID;
    const userCollection = db.collection('users');

    // 查询用户是否已存在
    let user = null;
    const userResult = await userCollection.where({ openid: openid }).get();
    if (userResult.data.length > 0) {
      user = userResult.data[0];
    }

    if (user) {
      // 更新用户信息
      const updateData = {
        lastLoginTime: db.serverDate(),
        totalLoginTimes: db.command.inc(1)
      };

      // 更新用户头像和昵称
      if (userInfo.nickName || userInfo.avatarUrl) {
        updateData['profile.name'] = userInfo.nickName || user.profile.name;
        updateData['profile.avatar'] = userInfo.avatarUrl || user.profile.avatar;
      }

      await userCollection.doc(user._id).update({ data: updateData });

      // 更新openIds数组
      if (!user.openIds || !user.openIds.includes(openid)) {
        await userCollection.doc(user._id).update({
          data: {
            openIds: db.command.addToSet(openid)
          }
        });
      }

      const responseUser = {
        _id: user._id,
        openid: user.openid,
        nickName: user.profile.name,
        avatarUrl: user.profile.avatar,
        gender: userInfo.gender || 0,
        role: user.role || 'visitor',
        permissions: user.permissions || ['read'],
        department: user.profile.department || '',
        lastLoginTime: new Date().toLocaleString('zh-CN')
      };

      return utils.standardResponse(true, responseUser);
    } else {
      // 创建新用户
      const newUser = {
        openid: openid,
        openIds: [openid],
        unionId: wxContext.UNIONID || '',
        createdAt: db.serverDate(),
        lastLoginTime: db.serverDate(),
        totalLoginTimes: 1,
        role: 'visitor',
        permissions: ['read'],
        status: 'active',
        profile: {
          name: userInfo.nickName || '用户' + openid.substr(-6),
          avatar: userInfo.avatarUrl || '',
          phone: '',
          department: '',
          position: ''
        }
      };

      const addResult = await userCollection.add({ data: newUser });

      const responseUser = {
        _id: addResult._id,
        openid: openid,
        nickName: userInfo.nickName || '用户' + openid.substr(-6),
        avatarUrl: userInfo.avatarUrl || '',
        gender: userInfo.gender || 0,
        role: 'visitor',
        permissions: ['read'],
        department: '',
        lastLoginTime: new Date().toLocaleString('zh-CN')
      };

      return utils.standardResponse(true, responseUser);
    }

  } catch (err) {
    console.error('登录失败:', err);
    return utils.standardResponse(false, null, err.message);
  }
};