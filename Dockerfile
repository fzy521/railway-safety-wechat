# 使用Node.js 20 LTS版本，确保better-sqlite3有预编译包支持
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 安装必要的构建工具（备用，如果预编译包不可用）
RUN apk add --no-cache python3 make g++

# 复制package文件
COPY package*.json ./

# 设置npm镜像源（加速下载）
RUN npm config set registry https://registry.npmmirror.com

# 安装依赖
RUN npm ci --only=production

# 复制项目文件
COPY . .

# 创建数据库目录
RUN mkdir -p database

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 启动命令
CMD ["npm", "start"]