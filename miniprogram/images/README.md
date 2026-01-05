# TabBar 图标说明

## 图标配置更新（2024-12-25）

✅ **TabBar已简化为纯文本模式**
- 已删除所有TabBar图标配置
- 当前使用纯文本标签：监控、风险、应急、巡检、我的
- 优势：更简洁，加载更快，无需设计图标

## 已删除的图标文件（保留但未使用）

当前 images/ 目录下保留的图标文件（可作参考或后续使用）：
- `icon-dashboard.png` / `icon-dashboard-active.png`
- `icon-risk.png` / `icon-risk-active.png`
- `icon-emergency.png` / `icon-emergency-active.png`
- `icon-inspection.png` / `icon-inspection-active.png`
- `icon-profile.png` / `icon-profile-active.png`

## 其他功能图标

项目仍然需要补充以下图标（详见 ICONS-REQUIRED.md）：

### 个人中心菜单图标（6个）
- `avatar-default.png` - 默认头像 ✅ 已生成
- `icon-setting.png` - 设置图标
- `icon-certificate.png` - 证书图标
- `icon-notification.png` - 通知图标
- `icon-help.png` - 帮助图标
- `icon-info.png` - 信息图标

### 状态和功能图标（按需添加）
- 风险等级标识图标（红/橙/黄/蓝）
- 隐患状态图标
- 应急物资图标
- 设备设施图标
- 其他操作图标（编辑、删除、添加等）

## 图标设计建议

### 如需添加TabBar图标
如需恢复TabBar图标功能，可在app.json中添加相应配置，例如：
```json
{
  "pagePath": "pages/dashboard/dashboard",
  "iconPath": "images/icon-dashboard.png",
  "selectedIconPath": "images/icon-dashboard-active.png",
  "text": "监控"
}
```

### 图标规范
- 尺寸：81px × 81px（2x）或 54px × 54px（2x）
- 格式：PNG，支持透明背景
- 风格：线性图标，保持简洁统一
- 颜色：未选中 #7A7E83，选中 #1989fa

## TabBar 页面映射

当前TabBar结构（纯文本模式）：

1. **监控** (dashboard) - 数据监控首页
2. **风险** (risk) - 风险管理页面
3. **应急** (emergency) - 应急管理页面
4. **巡检** (inspection) - 隐患巡检页面
5. **我的** (profile) - 个人中心

其他页面通过菜单或链接访问：
- 事故管理 (incident) - 从监控或菜单进入
- 管理评审 (review) - 从菜单进入

## 优势说明

**纯文本TabBar的优点：**
1. ✅ 无需设计图标，降低设计成本
2. ✅ 加载更快，提升性能
3. ✅ 更简洁清晰，易于理解
4. ✅ 符合GBT 33000-2025的简洁实用原则
5. ✅ 便于后期维护和修改

> 当前使用的dashboard图标仅为占位符，建议尽快替换为符合各页面功能的实际图标。
