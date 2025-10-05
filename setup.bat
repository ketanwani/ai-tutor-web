@echo off
echo Setting up AI Tutor SG...

echo.
echo Setting up Django Backend...
cd backend
.\venv\Scripts\Activate.ps1
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python setup_database.py

echo.
echo Setting up React Frontend...
cd ..\frontend
npm install

echo.
echo Setup complete!
echo Run start_dev.bat to start the development servers
pause
