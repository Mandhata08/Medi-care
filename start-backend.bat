@echo off
echo Starting Django Backend Server...
cd backend
call venv\Scripts\activate.bat
python manage.py runserver
pause

