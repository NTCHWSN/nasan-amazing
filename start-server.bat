@echo off
title นาสารอเมซิ่ง! - Local Server
chcp 65001 >nul
cls
echo.
echo ╔═══════════════════════════════════════════════╗
echo ║   🎮 นาสารอเมซิ่ง! — เปิดเล่นจากมือถือ        ║
echo ╚═══════════════════════════════════════════════╝
echo.

REM ติดตั้ง qrcode ถ้ายังไม่มี (เงียบๆ)
echo 🔍 เช็คไลบรารี qrcode...
where python >nul 2>nul
if %ERRORLEVEL%==0 (
  python -c "import qrcode" 2>nul
  if errorlevel 1 (
    echo    กำลังติดตั้ง qrcode (ครั้งเดียว)...
    python -m pip install --quiet qrcode 2>nul
  )
  echo ✅ qrcode พร้อม
) else (
  where py >nul 2>nul
  if %ERRORLEVEL%==0 (
    py -c "import qrcode" 2>nul
    if errorlevel 1 (
      echo    กำลังติดตั้ง qrcode...
      py -m pip install --quiet qrcode 2>nul
    )
  )
)

REM ขอ Firewall (ครั้งแรกเท่านั้น — UAC จะถาม)
netsh advfirewall firewall show rule name="NaSanAmazingMobile" >nul 2>nul
if errorlevel 1 (
  echo.
  echo 🛡  ขอเพิ่มกฎ Firewall เพื่อให้มือถือเข้าได้...
  powershell -Command "Start-Process cmd -Verb RunAs -ArgumentList '/c netsh advfirewall firewall add rule name=\"NaSanAmazingMobile\" dir=in action=allow protocol=TCP localport=5500,8080,8000,3000,8888 & exit'" 2>nul
  timeout /t 1 >nul
)

echo.
where python >nul 2>nul
if %ERRORLEVEL%==0 (
  python start-server.py
  goto :end
)
where py >nul 2>nul
if %ERRORLEVEL%==0 (
  py start-server.py
  goto :end
)

echo ❌ ไม่พบ Python — กรุณาติดตั้ง:
echo    https://www.python.org/downloads/
echo    (เลือก "Add Python to PATH" ตอนติดตั้ง)
pause

:end
