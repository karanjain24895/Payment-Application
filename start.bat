@echo off
title PayFlow Wallet Starter
echo ========================================================
echo   Launching PayFlow Payment Wallet Application...
echo ========================================================
echo.

echo Starting Backend Server on http://localhost:5000 ...
start "PayFlow Backend Server (:5000)" cmd /k "cd backend && npm start"

timeout /t 3 /nobreak >nul

echo Starting Frontend Vite Client on http://localhost:3000 ...
start "PayFlow Frontend Client (:3000)" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo   Both services started!
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5000
echo ========================================================
pause

