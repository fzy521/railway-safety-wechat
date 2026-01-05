# 需要补充的图标清单

以下是项目中需要补充的图标，建议使用专业的图标库或设计工具生成。

## 一、功能菜单图标（位于 images/ 目录）

### 1. 用户相关
- **avatar-default.png** - 默认用户头像
  - 尺寸: 200x200px
  - 风格: 简洁的卡通头像或符号化头像
  - 颜色: 彩色或灰色

### 2. 菜单功能图标（用于个人中心）
以下图标用于 pages/profile/profile.js 中的 menuItems：

- **icon-setting.png** - 设置图标
  - 尺寸: 64x64px
  - 风格: 线条图标
  - 描述: 齿轮或工具图标

- **icon-certificate.png** - 证书图标
  - 尺寸: 64x64px
  - 风格: 线条图标
  - 描述: 证书或奖章形状

- **icon-notification.png** - 通知图标
  - 尺寸: 64x64px
  - 风格: 线条图标
  - 描述: 铃铛或消息图标

- **icon-help.png** - 帮助图标
  - 尺寸: 64x64px
  - 风格: 线条图标
  - 描述: 问号或帮助符号

- **icon-info.png** - 信息图标
  - 尺寸: 64x64px
  - 风格: 线条图标
  - 描述: 信息符号（i）

## 二、页面功能图标

### 1. 应急页面 (emergency)
- icon-plan.svg/png - 应急预案图标
- icon-drill.svg/png - 演练记录图标
- icon-supplies.svg/png - 物资清单图标

### 2. 评审页面 (review)
- icon-planning.svg/png - 评审计划图标
- icon-report.svg/png - 评审报告图标
- icon-improvement.svg/png - 改进措施图标

### 3. 风险页面 (risk)
- risk-level-red.svg/png - 红色风险等级标识
- risk-level-orange.svg/png - 橙色风险等级标识
- risk-level-yellow.svg/png - 黄色风险等级标识
- risk-level-blue.svg/png - 蓝色风险等级标识

### 4. 隐患页面 (inspection)
- hazard-equipment.svg/png - 设备类隐患图标
- hazard-behavior.svg/png - 行为类隐患图标
- hazard-environment.svg/png - 环境类隐患图标
- status-identified.svg/png - 已发现状态图标
- status-treating.svg/png - 整改中状态图标
- status-completed.svg/png - 已完成状态图标
- status-verified.svg/png - 已验证状态图标

## 三、图标设计建议

### 风格统一
- 使用一致的线条粗细（建议 2px）
- 统一的圆角半径
- 一致的配色方案（主色调：#1989fa）

### 文件格式
- 推荐使用 PNG 格式，支持透明背景
- 提供标准尺寸：64x64px, 128x128px
- 确保在不同分辨率屏幕下清晰显示

### 推荐图标库
1. **Iconfont (阿里巴巴)** - 可免费使用
2. **Remix Icon** - 开源图标库
3. **Feather Icons** - 简洁线条图标
4. **自定义设计** - 根据企业VI设计

## 四、使用方式

### PNG图标
```xml
<image src="/images/icon-setting.png" mode="aspectFit" class="menu-icon" />
```

### SVG图标
```xml
<image src="/images/icon-setting.svg" mode="aspectFit" class="menu-icon" />
```

### CSS背景图
```css
.menu-icon {
  width: 64rpx;
  height: 64rpx;
  background-image: url('/images/icon-setting.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}
```

## 五、图标管理

建议按功能模块组织图标：
```
images/
├── common/              # 通用图标
│   ├── avatar-default.png
│   └── logo.png
├── menu/                # 菜单图标
│   ├── icon-setting.png
│   ├── icon-certificate.png
│   └── ...
├── emergency/           # 应急模块图标
│   ├── icon-plan.png
│   └── ...
├── risk/                # 风险模块图标
│   ├── level-red.png
│   └── ...
└── inspection/          # 隐患模块图标
    ├── type-equipment.png
    └── ...
```

## 六、生图工具推荐

如果您有AI生图工具，可以使用以下提示词生成图标：

### 设置图标
```
Simple line icon of a gear, minimalist style, 64x64px, black lines on white background, 2px stroke width
```

### 证书图标
```
Simple line icon of a certificate or diploma, minimalist style, 64x64px, black lines on white background
```

### 通知图标
```
Simple line icon of a bell, minimalist style, 64x64px, black lines on white background
```

### 帮助图标
```
Simple line icon of a question mark in a circle, minimalist style, 64x64px, black lines on white background
```

### 信息图标
```
Simple line icon of the letter 'i' in a circle, minimalist style, 64x64px, black lines on white background
```

## 七、当前状态

✅ **已创建占位文件：**
- images/avatar-default.png (SVG格式)

📋 **待创建图标：**
- icon-*.png (功能菜单图标)
- 各模块专用图标

请根据以上清单和设计建议，使用专业设计工具或AI生图工具创建所需图标。
