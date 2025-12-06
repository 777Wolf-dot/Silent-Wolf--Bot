@echo off
chcp 65001 >nul
echo ========================================
echo    WOLF BOT AUTO-RESTART SYSTEM
echo ========================================
echo.

:start
echo [%time%] Starting Wolf Bot...
call npm start

echo.
echo [%time%] Bot exited. Auto-restarting in 3 seconds...
timeout /t 3 /nobreak >nul

goto start