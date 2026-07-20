@echo off
TITLE YARE Control Panel - Windows Standalone Executable Builder
echo ======================================================================
echo           YARE Control Panel - Windows Standalone (.exe) Builder      
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

echo [1/3] Installing monorepo dependencies...
call npm run setup

echo.
echo [2/3] Building React Frontend SPA and copying static assets...
call npm run build:frontend
node scripts/copy-dist.js

echo.
echo [3/3] Compiling Go backend with embedded Frontend into single yare-panel.exe...
cd apps\backend
set CGO_ENABLED=0
set GOOS=windows
set GOARCH=amd64
go build -ldflags="-s -w" -o ..\..\yare-panel.exe main.go
cd ..\..

echo.
echo ======================================================================
echo  [SUCCESS] YARE Control Panel single executable compiled!
echo  Output File: yare-panel.exe
echo.
echo  You can now run yare-panel.exe on ANY Windows computer without Node.js or Go!
echo ======================================================================
echo.
pause
