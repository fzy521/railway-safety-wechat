#!/bin/bash

echo "=========================================="
echo "Node.js版本管理器安装脚本（macOS/Linux）"
echo "=========================================="
echo ""

# 检查是否已安装nvm
if command -v nvm > /dev/null 2>&1; then
    echo "nvm 已安装！"
    nvm --version
    echo ""
else
    echo "正在安装 nvm..."
    echo ""

    # 安装nvm
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

    echo ""
    echo "nvm 安装完成！请重新加载shell配置："
    echo "source ~/.bashrc  # 或 source ~/.zshrc"
    echo ""
fi

# 安装Node.js 20
echo "正在安装 Node.js 20..."
nvm install 20
nvm use 20

echo ""
echo "=========================================="
echo "Node.js 版本信息："
node --version
npm --version
echo "=========================================="

echo ""
echo "降级完成！现在可以使用 Node.js 20 了。"
echo "如果需要永久使用 Node.js 20，请运行："
echo "nvm alias default 20"