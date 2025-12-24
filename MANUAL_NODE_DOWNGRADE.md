# 手动Node.js降级指南

## 当前情况
- ✅ 你已安装nvm并切换到Node.js 20.19.0
- ⚠️ 但系统PATH可能未正确更新

## 解决步骤

### 步骤1：重新加载终端
1. 完全关闭当前终端/命令行窗口
2. 重新打开新的终端窗口
3. 运行以下命令验证：

```bash
node --version
# 期望输出：v20.19.0
```

### 步骤2：如果nvm未生效

#### 方案A：手动设置PATH（临时）
```bash
# Windows PowerShell
$env:Path = "$env:USERPROFILE\.nvm\versions\node\v20.19.0;$env:Path"

# Windows CMD
set PATH=%USERPROFILE%\.nvm\versions\node\v20.19.0;%PATH%

# Git Bash
export PATH="$HOME/.nvm/versions/node/v20.19.0/bin:$PATH"
```

#### 方案B：重新安装Node.js 20（推荐）
1. 访问 [Node.js官网](https://nodejs.org/)
2. 下载 **Node.js 20.19.0 LTS**
3. 运行安装程序
4. 选择"添加到PATH"选项

### 步骤3：验证安装
```bash
# 检查版本
node --version  # 应该显示 v20.19.0
npm --version   # 应该显示 10.x.x

# 检查nvm
nvm list        # 应该显示已安装的版本
nvm current     # 应该显示 v20.19.0
```

### 步骤4：清理项目依赖
```bash
# 删除旧的依赖
rm -rf node_modules package-lock.json

# 重新安装依赖
npm install
```

### 步骤5：测试better-sqlite3
```bash
node test-node-version.js
```

### 步骤6：启动项目
```bash
# 演示模式（无数据库）
node start.js --demo

# 完整模式（需要数据库）
node start.js
```

## 常见问题

### 问题1：nvm use 20.19.0 后仍显示旧版本
**解决**：
1. 确保运行了 `nvm use 20.19.0`
2. 检查是否有其他Node.js安装冲突
3. 重启终端

### 问题2：npm命令找不到
**解决**：
1. 运行 `nvm use 20.19.0` 会自动配置npm
2. 确保nvm正确安装

### 问题3：better-sqlite3仍编译失败
**解决**：
1. 确保Node.js版本正确（v20.19.0）
2. 清除npm缓存：`npm cache clean --force`
3. 重新安装依赖

## 验证成功标准

✅ Node.js版本显示为 v20.19.0
✅ better-sqlite3能正常加载
✅ 项目能正常启动
✅ 所有功能正常工作

## 备用方案

如果nvm仍有问题，可以：

1. **直接安装Node.js 20**：从官网下载安装包
2. **使用Node.js安装器**：https://nodejs.org/dist/v20.19.0/
3. **使用n**：`npm install -g n`
4. **使用Docker**：我们已提供Dockerfile

## 需要帮助？

- 查看 [NODE_VERSION_GUIDE.md](NODE_VERSION_GUIDE.md)
- 检查 [test-node-version.js](test-node-version.js)
- 在GitHub提交Issue