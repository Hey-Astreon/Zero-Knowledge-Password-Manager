@echo off
title ZK-Pass Launcher

echo ==========================================
echo   Zero Knowledge Password Manager
echo ==========================================
echo.

echo [1/3] Starting MongoDB...
start "MongoDB" cmd /k "mongod --dbpath C:\data\db"
timeout /t 3 /nobreak >nul

echo [2/3] Starting Backend (Express)...
start "ZK-Pass Backend" cmd /k "cd /d "e:\Zero knowledge pass system\backend" && npm run dev"
timeout /t 2 /nobreak >nul

echo [3/3] Starting Frontend (Next.js)...
start "ZK-Pass Frontend" cmd /k "cd /d "e:\Zero knowledge pass system\frontend" && npm run dev"

echo.
echo ==========================================
echo   All services launched!
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5000
echo ==========================================
echo.
echo Press any key to close this launcher...
pause >nul
