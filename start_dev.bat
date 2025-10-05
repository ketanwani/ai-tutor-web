@echo off
echo Starting AI Tutor SG Development Environment...

echo.
echo Starting Django Backend...
start "Django Backend" cmd /k "cd backend && .\venv\Scripts\Activate.ps1 && python manage.py runserver"

echo.
echo Starting React Frontend...
start "React Frontend" cmd /k "cd frontend && npm start"

echo.
echo Development servers starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause > nul
