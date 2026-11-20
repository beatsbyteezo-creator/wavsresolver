@echo off
setlocal
cd /d "%~dp0"
title WavsResolver

where npm >nul 2>nul
if errorlevel 1 (
  echo Node.js and npm were not found. Install the Node.js LTS version, then run this file again.
  pause
  exit /b 1
)

if not exist "node_modules\electron\package.json" (
  echo Installing app dependencies...
  if not exist "package-lock.json" (
    echo The dependency lockfile is missing. Restore package-lock.json before installing.
    pause
    exit /b 1
  )
  call npm ci
  if errorlevel 1 (
    echo Dependency installation failed.
    pause
    exit /b 1
  )
)

call npm start
set "APP_EXIT=%ERRORLEVEL%"
if not "%APP_EXIT%"=="0" (
  echo The app could not start. The message above may explain why.
  pause
)
exit /b %APP_EXIT%
