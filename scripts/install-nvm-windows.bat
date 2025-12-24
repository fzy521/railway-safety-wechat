@echo off
echo ========================================
echo Node.js版本管理器安装脚本（Windows）
echo ========================================
echo.

REM 检查管理员权限
net session > nul 2>>1
if %errorLevel% neq 0 (
    echo 错误：需要以管理员身份运行此脚本
    echo 请右键点击此脚本，选择"以管理员身份运行"
    pause
    exit /b 1
)

echo 正在下载nvm-windows...
echo.

REM 下载nvm-windows
echo 1. 访问 https://github.com/coreybutler/nvm-windows/releases/
echo 2. 下载最新版本的nvm-setup.exe
echo 3. 运行安装程序
echo.

REM 提供直接下载链接（可选）
set NVM_URL=https://github.com/coreybutler/nvm-windows/releases/download/1.1.12/nvm-setup.exe
echo 下载地址：%NVM_URL%
echo.

echo 安装步骤：
echo 1. 运行下载的nvm-setup.exe
echo 2. 接受许可协议
echo 3. 选择安装路径（建议使用默认路径）
echo 4. 完成安装
echo.

echo 安装完成后，请重新打开命令提示符或PowerShell
echo 然后运行：nvm install 20.11.0
echo           nvm use 20.11.0
echo.

REM 可选：直接下载
echo 是否现在下载nvm-setup.exe？(Y/N)
set /p download=
if /i "%download%"=="Y" (
    echo 正在下载...
    powershell -Command "Invoke-WebRequest -Uri '%NVM_URL%' -OutFile 'nvm-setup.exe'"
    echo 下载完成！请运行 nvm-setup.exe 进行安装
)

echo.
echo ========================================
echo 安装完成！请重新打开终端并运行：
echo   nvm install 20.11.0
echo   nvm use 20.11.0
echo ========================================
pause