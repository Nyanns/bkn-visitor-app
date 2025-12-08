@echo off
title BKN Visitor System - Launcher

echo ===================================================
echo     Starting BKN Visitor System...
echo ===================================================
echo.

:: Start Backend
echo Starting Backend Server...
start "BKN Backend" cmd /k "cd backend && call venv\Scripts\activate && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

:: Start Frontend
echo Starting Frontend Client...
start "BKN Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo [SUCCESS] Application is starting in background windows.
echo.
echo Access the App at: http://localhost:5173
echo API Documentation: http://localhost:8000/api/docs
echo.
pause
