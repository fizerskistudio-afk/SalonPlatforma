@echo off
setlocal
node scripts\apply-public-api-hardening.mjs
if errorlevel 1 (
  echo.
  echo FIX-01 nije primenjen. Procitaj gresku iznad.
  exit /b 1
)
echo.
echo PUBLIC-API-HARDENING-01 FIX-01 je uspesno primenjen.
endlocal
