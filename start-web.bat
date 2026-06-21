@echo off
setlocal EnableExtensions EnableDelayedExpansion

cd /d "%~dp0"

echo Starting Lottery System (Web Browser)...
echo.

echo Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 goto no_nodejs

echo Node.js installed, version:
node --version
echo.
goto install_deps

:no_nodejs
echo Error: Node.js not detected
echo.
echo Looking for installer...
set nodejs_found=0
for %%f in (node-*.msi) do (
    echo Found Node.js installer: %%f
    set nodejs_found=1
    set nodejs_installer=%%f
)

if !nodejs_found!==0 (
    echo Node.js installer not found
    echo Please download from https://nodejs.org/ and place in this directory
    pause
    exit /b 1
)

echo.
echo Install Node.js?
echo [Y] Yes, install now
echo [N] No, manual install
echo.
set /p choice=Choose (Y/N):

if /i "!choice!"=="Y" (
    echo.
    echo Starting Node.js installer...
    echo Follow the installation wizard
    echo Restart this script after installation
    echo.
    start /wait "!nodejs_installer!"
    echo.
    echo Installation complete! Please restart start-web.bat
    pause
    exit /b 0
) else (
    echo.
    echo Please install Node.js manually and restart this script
    pause
    exit /b 1
)

:install_deps
if exist "node_modules\.bin\tailwindcss.cmd" goto start_web

echo.
echo Dependencies not found, installing dependencies...

set "npm_config_registry=https://registry.npmmirror.com"
set "ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/"

if not defined HTTP_PROXY if not defined HTTPS_PROXY (
    if defined PROXY_URL (
        set "HTTP_PROXY=!PROXY_URL!"
        set "HTTPS_PROXY=!PROXY_URL!"
    ) else if defined PROXY_PORT (
        set "HTTP_PROXY=http://127.0.0.1:!PROXY_PORT!"
        set "HTTPS_PROXY=http://127.0.0.1:!PROXY_PORT!"
    )
)

echo Using npm registry: !npm_config_registry!
echo Using Electron mirror: !ELECTRON_MIRROR!
if defined HTTP_PROXY echo Using HTTP_PROXY: !HTTP_PROXY!
if defined HTTPS_PROXY echo Using HTTPS_PROXY: !HTTPS_PROXY!
echo.

call npm install --no-audit --no-fund
if errorlevel 1 (
    echo.
    echo npm install failed
    echo Tip: you can set proxy by:
    echo - set PROXY_URL=http://127.0.0.1:7890
    echo - or set PROXY_PORT=7890
    echo Then run start-web.bat again
    pause
    exit /b 1
)

:start_web
echo.
echo Building Tailwind CSS...
call npm run build:tailwind
if errorlevel 1 (
    echo.
    echo Tailwind build failed
    pause
    exit /b 1
)
echo.

echo Generating sound manifest...
node scripts\generate-sound-manifest.cjs
if errorlevel 1 (
    echo.
    echo Sound manifest generation failed
    pause
    exit /b 1
)
echo.

echo Starting Web Server...
echo.

node scripts\start-web-server.cjs

exit /b 0
