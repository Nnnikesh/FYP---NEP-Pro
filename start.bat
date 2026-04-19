@echo off
title NEP-Pro Local Server

echo Starting NEP-Pro...
echo.

:: Start backend in a new window
start "NEP-Pro Backend" cmd /k "cd /d "%~dp0backend" && npm run dev"

:: Small delay so backend starts first
timeout /t 2 /nobreak >nul

:: Start frontend in a new window
start "NEP-Pro Frontend" cmd /k "cd /d "%~dp0" && npm run dev"

echo.
echo Both servers are starting:
echo   Backend  ^>  http://localhost:5001
echo   Frontend ^>  http://localhost:5173
echo.
echo Close the two terminal windows to stop the servers.
pause
