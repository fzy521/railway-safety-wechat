@echo off
echo ========================================
echo Node.js环境设置和验证脚本
echo ========================================
echo.

REM 尝试加载nvm（如果已安装）
if exist "%NVM_HOME%\nvm.exe" (
    echo 检测到nvm，正在加载...
    call "%NVM_HOME%\nvm.exe" use 20.19.0
) else if exist "%USERPROFILE%\.nvm\nvm.exe" (
    echo 检测到nvm，正在加载...
    set "NVM_HOME=%USERPROFILE%\.nvm"
    set "PATH=%NVM_HOME%;%PATH%"
    call "%NVM_HOME%\nvm.exe" use 20.19.0
)

echo.
echo 当前Node.js环境：
where node 2>nul
node --version 2>nul || echo Node.js未找到
npm --version 2>nul || echo npm未找到

echo.
echo ========================================
echo 依赖清理和重装
echo ========================================

echo 正在清理node_modules和package-lock.json...
if exist "node_modules" (
    rmdir /s /q node_modules
    echo ✓ node_modules已删除
) else (
    echo node_modules不存在
)

if exist "package-lock.json" (
    del package-lock.json
    echo ✓ package-lock.json已删除
) else (
    echo package-lock.json不存在
)

echo.
echo 正在重新安装依赖...
npm install

if %errorlevel% equ 0 (
    echo.
    echo ✓ 依赖安装成功！
) else (
    echo.
    echo ✗ 依赖安装失败！
    echo 请检查错误信息
    pause
    exit /b 1
)

echo.
echo ========================================
echo 验证better-sqlite3安装
echo ========================================

node -e "try { require('better-sqlite3'); console.log('✓ better-sqlite3加载成功'); } catch(e) { console.log('✗ better-sqlite3加载失败:', e.message); }"

echo.
echo ========================================
echo 环境设置完成！
echo ========================================
echo.
echo 当前环境：
node --version
npm --version
echo.
echo 可以运行以下命令启动项目：
echo   node start.js --demo    # 演示模式
echo   node start.js           # 完整模式
echo.
pause