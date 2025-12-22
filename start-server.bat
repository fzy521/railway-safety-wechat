@echo off
chcp 65001 >nul
echo ========================================
echo 铁路安全监控系统启动脚本
echo ========================================
echo.

REM 检查并关闭8000-8010端口的进程
echo 检查端口占用...
for /L %%p in (8000,1,8010) do (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%%p.*LISTENING"') do (
        echo 发现端口 %%p 被占用，进程ID: %%a
        taskkill /F /PID %%a >nul 2>&1
        echo 已强制关闭进程 %%a
    )
)

echo.
echo 正在启动HTTP服务器 port=8000...
cd /d "%~dp0"
python -m http.server 8000

pause
