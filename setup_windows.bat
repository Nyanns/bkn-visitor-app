@echo off
setlocal enabledelayedexpansion
title BKN Visitor System - Easy Setup

echo ===================================================
echo     BKN Visitor Management System - Setup
echo ===================================================
echo.

:: 1. Check Prerequisites
echo [1/4] Checking System Requirements...

python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH.
    echo Please install Python 3.11+ and try again.
    pause
    exit /b 1
) else (
    echo [OK] Python found.
)

node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Please install Node.js 20+ and try again.
    pause
    exit /b 1
) else (
    echo [OK] Node.js found.
)
echo.

:: 2. Backend Setup
echo [2/4] Setting up Backend...
cd backend

if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)
call venv\Scripts\activate

echo Installing Python dependencies...
pip install -r requirements.txt >nul 2>&1

if not exist .env (
    echo Creating configuration file...
    python -c "import secrets; key=secrets.token_urlsafe(32); print(f'SECRET_KEY={key}\nDATABASE_URL=sqlite:///./database.db\nALLOWED_ORIGINS=http://localhost:5173\nALLOW_SETUP_ADMIN=true')" > .env
    echo [.env] Created with secure SECRET_KEY.
) else (
    echo [.env] Already exists. Skipping creation.
)

echo.
echo [Backend Setup Complete]
echo.

set /p create_admin="Do you want to create an Admin account now? (y/n): "
if /i "%create_admin%"=="y" (
    echo Running Admin Creation Wizard...
    python scripts/create_admin.py
)

echo.
:: 3. Frontend Setup
cd ..\frontend
echo [3/4] Setting up Frontend...

if not exist .env (
    echo VITE_API_URL=http://localhost:8000> .env
    echo [.env] Created pointing to localhost:8000.
)

if not exist node_modules (
    echo Installing Node dependencies (this may take a while)...
    call npm install
) else (
    echo [node_modules] Already exists. Skipping install.
)

cd ..
echo.

:: 4. Final Instructions
echo ===================================================
echo             SETUP COMPLETED SUCCESSFULLY!          
echo ===================================================
echo.
echo Next Steps:
echo 1. Run 'start_app.bat' to launch the application.
echo 2. Setup your first admin account when asked.
echo.
pause
