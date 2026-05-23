@echo off
setlocal
cd /d "%~dp0"

echo Starting Na San Amazing local server...
echo.

where py >nul 2>nul
if %ERRORLEVEL%==0 (
  start "" http://localhost:5500
  py start-server.py
  goto :end
)

where python >nul 2>nul
if %ERRORLEVEL%==0 (
  start "" http://localhost:5500
  python start-server.py
  goto :end
)

echo Python was not found.
echo Install Python for free from https://www.python.org/downloads/
echo Then run this file again.
pause

:end
endlocal
