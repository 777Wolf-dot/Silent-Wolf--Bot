@echo off
echo ========================================
echo    SILENT WOLF - AUTO RESTART
echo ========================================
echo.
echo 🚀 Restarting bot...
echo 📅 %date% %time%
echo.
timeout /t 3 /nobreak >nul

:: Clean up any leftover session issues
if exist "session\app-state-sync-version.json" del /f /q "session\app-state-sync-version.json"
if exist "session\message-history.json" del /f /q "session\message-history.json"
if exist "session\creds.json" del /f /q "session\creds.json"

:: Check for auto-login file
if not exist "session\auth_info.json" (
    echo ⚠️ No saved login found
    echo 📱 You may need to scan QR code
) else (
    echo ✅ Auto-login available
)

:: Start the bot
echo.
echo 🐺 Starting Silent Wolf Bot...
echo ========================================
echo.

:: Use node to start (will show login prompt if needed)
node index.js

:: If bot exits, show message
echo.
echo ========================================
echo    BOT STOPPED
echo ========================================
echo.
pause
