@echo off
REM Environment Configuration Script for Personal Website (Windows)
REM This script helps switch between different environment configurations

setlocal enabledelayedexpansion

if "%1"=="" goto :usage
if "%1"=="-h" goto :usage
if "%1"=="--help" goto :usage

set ENV=%1

if "%ENV%"=="development" goto :development
if "%ENV%"=="production" goto :production
if "%ENV%"=="local" goto :local

echo Error: Unknown environment '%ENV%'
goto :usage

:development
echo Setting up development environment...
copy .env.development .env > nul
copy server\.env.development server\.env > nul
echo ✓ Development environment configured
echo Frontend: http://localhost:5173
echo API: http://localhost:3001/api
goto :complete

:production
echo Setting up production environment...
copy .env.production .env > nul
copy server\.env.production server\.env > nul
echo ✓ Production environment configured
echo Frontend: https://www.colemanlai.com
echo API: https://api.colemanlai.com/api
echo ⚠️  Remember to change the admin password in server\.env!
goto :complete

:local
echo Setting up local network environment...

REM Try to detect IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set "ip=%%a"
    set "ip=!ip: =!"
    set "LOCAL_IP=!ip!"
    goto :ip_found
)
set LOCAL_IP=YOUR_IP

:ip_found
if not "%LOCAL_IP%"=="YOUR_IP" (
    powershell -Command "(Get-Content .env.local) -replace 'YOUR_IP', '%LOCAL_IP%' | Set-Content .env"
    echo ✓ Detected IP: %LOCAL_IP%
) else (
    copy .env.local .env > nul
    echo ⚠️  Could not detect IP address. Please manually replace YOUR_IP in .env
)

copy server\.env.local server\.env > nul
echo ✓ Local network environment configured
echo Frontend: http://%LOCAL_IP%:5173
echo API: http://%LOCAL_IP%:3001/api
goto :complete

:complete
echo.
echo Environment setup complete!
echo.
echo Next steps:
echo   1. Install server dependencies: cd server ^&^& npm install
echo   2. Install frontend dependencies: npm install
echo   3. Start the server: cd server ^&^& npm start
echo   4. Start the frontend: npm run dev
goto :end

:usage
echo Usage: %0 [environment]
echo.
echo Available environments:
echo   development  - Local development (localhost)
echo   production   - Production deployment (colemanlai.com)
echo   local        - Local network access
echo.
echo Example:
echo   %0 development
echo   %0 production

:end
