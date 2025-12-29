@echo off
echo ========================================
echo   Healthcare Platform - Starting...
echo ========================================
echo.

echo [1/2] Starting Backend Server...
start "Backend Server" cmd /k "cd /d %~dp0backend && if exist venv\Scripts\activate.bat (call venv\Scripts\activate.bat && python manage.py runserver) else (python manage.py runserver)"
timeout /t 5 /nobreak >nul

echo [2/2] Starting Frontend Server...
start "Frontend Server" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo ========================================
echo   Servers Starting...
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Both servers are starting in separate windows.
echo Wait for "Compiled successfully!" message in frontend window.
echo.
echo Press any key to close this window (servers will keep running)...
pause >nul

