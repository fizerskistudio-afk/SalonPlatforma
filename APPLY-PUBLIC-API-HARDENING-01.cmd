@echo off
setlocal
node scripts\apply-public-api-hardening.mjs
if errorlevel 1 (
  echo.
  echo Patch nije primenjen. Procitaj gresku iznad.
  exit /b 1
)
echo.
echo Patch je uspesno primenjen.
endlocal
