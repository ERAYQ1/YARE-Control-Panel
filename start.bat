@echo off
TITLE YARE Control Panel - Developer Launcher
echo ======================================================================
echo           YARE Control Panel - Universal Server Management            
echo ======================================================================
echo.

WHERE node >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js 20+ from https://nodejs.org/
    pause
    exit /b 1
)

WHERE go >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Go is not installed or not in PATH!
    echo Please install Go 1.22+ from https://go.dev/
    pause
    exit /b 1
)

IF NOT EXIST "node_modules" (
    echo [INFO] Installing monorepo dependencies for the first time...
    call npm run setup
)

IF NOT EXIST "apps\frontend\node_modules" (
    echo [INFO] Installing frontend dependencies...
    call npm run setup
)

echo [INFO] Starting YARE Control Panel Frontend (Vite) & Backend (Go)...
echo Dashboard: http://localhost:5173
echo Backend API: http://localhost:8080
echo.
call npm run dev

pause
