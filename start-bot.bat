@echo off
chcp 65001 >nul
REM ============================================
REM webpath-scan auto-delivery bot
REM Usage: double-click, or run .\start-bot.bat
REM ============================================

setlocal

set "SCRIPT_DIR=%~dp0"
set "LOG_DIR=%SCRIPT_DIR%logs"
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set "DATETIME=%%I"
set "LOG_FILE=%LOG_DIR%\bot-%DATETIME:~0,8%.log"

if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

echo.
echo ========================================
echo   webpath-scan auto-delivery bot
echo ========================================
echo   Port: 3030
echo   Log:  %LOG_FILE%
echo ========================================
echo.

REM 检查 node
where %NODE% >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] node.exe not found in PATH
    echo Install Node.js: https://nodejs.org/
    pause
    exit /b 1
)

REM 检查 lanzou-bot.mjs
if not exist "%SCRIPT_DIR%lanzou-bot.mjs" (
    echo [ERROR] lanzou-bot.mjs not found
    pause
    exit /b 1
)

echo [%time%] Starting bot...
cd /d "%SCRIPT_DIR%"

REM 后台启动（关闭窗口不停止）
start /b "" %NODE% lanzou-bot.mjs --port 3030 > "%LOG_FILE%" 2>&1

echo [%time%] Bot started in background. PID:
for /f "tokens=2" %%a in ('tasklist /fi "imagename eq node.exe" /fo list ^| findstr /i "PID"') do echo   %%a

echo.
echo Open in browser:  http://127.0.0.1:3030/dashboard
echo Test:              curl http://127.0.0.1:3030/health
echo.
echo Press any key to close this window (bot keeps running)...
pause >nul
