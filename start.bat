@echo off
TITLE YARE Control Panel Launcher
echo ======================================================================
echo           YARE Control Panel - Universal Server Management            
echo ======================================================================
echo.

IF EXIST "yare-panel.exe" (
    echo [INFO] Pre-compiled YARE Panel standalone binary found (yare-panel.exe)!
    echo [INFO] Starting panel instantly on http://localhost:8080 ...
    echo.
    start http://localhost:8080
    .\yare-panel.exe
    goto END
)

WHERE node >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js 20+ from https://nodejs.org/
    echo TIP: Or download pre-compiled yare-panel.exe from GitHub Releases for 0-dependency launch!
    pause
    exit /b 1
)

WHERE go >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Go is not installed or not in PATH!
    echo Please install Go 1.22+ from https://go.dev/
    echo TIP: Or download pre-compiled yare-panel.exe from GitHub Releases for 0-dependency launch!
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

:END
pause

