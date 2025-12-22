# Node.js 版本使用指南

## 概述

由于 better-sqlite3 依赖需要预编译的二进制包，本项目推荐使用 Node.js 16-20 版本，以确保能够直接使用预编译包，避免本地编译。

## 推荐版本

### 最佳选择：Node.js 20 LTS
- ✅ 长期支持版本
- ✅ better-sqlite3 8.7.0 提供预编译包
- ✅ 性能优异
- ✅ 安全性高

### 其他可选版本：
- Node.js 18 LTS
- Node.js 16 LTS

## 版本检查

### 查看当前版本
```bash
node --version
```

### 查看npm版本
```bash
npm --version
```

## 版本管理

### 使用 nvm（推荐）

#### Windows
1. 下载并安装 [nvm-windows](https://github.com/coreybutler/nvm-windows)
2. 安装 Node.js 20：
```bash
nvm install 20.11.0
nvm use 20.11.0
```

#### macOS/Linux
1. 安装 nvm：
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```
2. 安装 Node.js 20：
```bash
nvm install 20
nvm use 20
```

### 使用 n（macOS/Linux）
```bash
npm install -g n
n 20
```

## 项目配置

### package.json 设置
```json
{
  "engines": {
    "node": ">=16.0.0 <=20.x"
  },
  "engineStrict": false
}
```

### 部署平台配置

#### Render
已在 `render.yaml` 中指定：
```yaml
nodeVersion: "20"
```

#### Docker
Dockerfile 已使用 Node.js 20：
```dockerfile
FROM node:20-alpine
```

## 常见问题

### 问题：安装 better-sqlite3 时出现编译错误
**原因**：Node.js 版本太新，没有预编译包
**解决**：降级到 Node.js 20 或更低版本

### 问题：提示 "Could not locate the bindings file"
**原因**：缺少预编译的二进制文件
**解决**：
1. 确保 Node.js 版本在支持范围内
2. 清除 npm 缓存：
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 问题：Windows 系统安装失败
**解决**：
1. 安装 [windows-build-tools](https://github.com/felixrieseberg/windows-build-tools)
2. 或使用 WSL (Windows Subsystem for Linux)

## 性能对比

| Node.js 版本 | 启动时间 | 内存占用 | 预编译包支持 |
|-------------|----------|----------|--------------|
| 16.x        | ⭐⭐⭐⭐    | ⭐⭐⭐⭐    | ✅ 支持       |
| 18.x        | ⭐⭐⭐⭐    | ⭐⭐⭐      | ✅ 支持       |
| 20.x        | ⭐⭐⭐⭐⭐   | ⭐⭐⭐      | ✅ 支持       |
| 22.x        | ⭐⭐⭐⭐⭐   | ⭐⭐       | ❌ 不支持     |

## 升级建议

### 从 Node.js 22 降级到 20
1. 安装 Node.js 20：
```bash
# 使用 nvm
nvm install 20
nvm use 20

# 验证版本
node --version  # 应显示 v20.x.x
```

2. 重新安装依赖：
```bash
rm -rf node_modules package-lock.json
npm install
```

3. 测试运行：
```bash
npm start
```

## 最佳实践

1. **锁定版本**：使用 `.nvmrc` 文件锁定 Node.js 版本
2. **CI/CD**：在部署流程中指定 Node.js 版本
3. **文档**：在 README 中注明支持的 Node.js 版本
4. **测试**：在不同版本上测试应用兼容性

## 相关链接

- [Node.js 官方网站](https://nodejs.org/)
- [better-sqlite3 GitHub](https://github.com/WiseLibs/better-sqlite3)
- [nvm 文档](https://github.com/nvm-sh/nvm)
- [Render Node.js 支持](https://render.com/docs/node-js)

## 总结

为确保 better-sqlite3 能够正常使用预编译包，避免编译问题，强烈推荐使用 Node.js 16-20 版本。这不仅能简化部署流程，还能提高应用的稳定性和性能。