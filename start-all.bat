@echo off
echo Starting Healthcare Platform...
echo.
echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && venv\Scripts\activate.bat && python manage.py runserver"
timeout /t 3 /nobreak >nul
echo.
echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm start"
echo.
echo Both servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit this window (servers will continue running)...
pause >nul

