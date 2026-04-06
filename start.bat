@echo off
title Alyra Lock Launcher

echo ==========================================
echo   Alyra Lock Launcher
echo ==========================================
echo.

echo [1/2] Starting Backend (Express)...
start "Alyra Lock Backend" cmd /k "cd /d "%~dp0backend" && npm.cmd run dev"
timeout /t 2 /nobreak >nul

echo [2/2] Starting Frontend (Next.js)...
start "Alyra Lock Frontend" cmd /k "cd /d "%~dp0frontend" && npm.cmd run dev"

echo.
echo ==========================================
echo   All services launched!
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5000
echo.
echo   Note: If the frontend has styling issues, 
echo   please ensure your terminal is running in 
echo   the project root and not a subfolder.
echo ==========================================
echo.
echo Press any key to close this launcher...
pause >nul
