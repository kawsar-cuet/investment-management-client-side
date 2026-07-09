@echo off
REM ============================================================
REM Investment Management Platform - Backend Starter (Windows .bat)
REM ============================================================
REM Usage:
REM   app.bat           -> start backend (Spring Boot on :8080)
REM   app.bat stop      -> stop the running backend
REM   app.bat status    -> show whether backend is up
REM   app.bat logs      -> tail backend log
REM   app.bat restart   -> stop + start
REM
REM Frontend (separate):
REM   cd "d:\Family mart project\investment-management-client-side\investment-web"
REM   npx ng serve --host 0.0.0.0 --port 4200
REM ============================================================

setlocal enableextensions enabledelayedexpansion

set "BACKEND_DIR=d:\Family mart project\investment-management-platform"
set "API_DIR=%BACKEND_DIR%\investment-api"
set "JAR=%API_DIR%\target\investment-api-1.0.0-SNAPSHOT.jar"
set "PID_FILE=%API_DIR%\.app.pid"
set "LOG_FILE=%API_DIR%\app.log"
set "PORT=8080"

goto :%1 2>nul
if errorlevel 1 goto :start

:start
echo ============================================================
echo   Starting Investment Management Platform Backend
echo ============================================================

where java >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Java not found. Install JDK 17 and ensure 'java' is on PATH.
    exit /b 1
)

REM locate Maven (PATH, then IntelliJ bundled copy)
set "MVN=mvn"
where mvn >nul 2>nul
if errorlevel 1 (
    if exist "C:\Program Files\JetBrains\IntelliJ IDEA Community Edition 2023.1.4\plugins\maven\lib\maven3\bin\mvn.cmd" (
        set "MVN=C:\Program Files\JetBrains\IntelliJ IDEA Community Edition 2023.1.4\plugins\maven\lib\maven3\bin\mvn.cmd"
    ) else (
        echo [ERROR] Maven not found on PATH and no IntelliJ Maven detected.
        echo         Install Maven or add it to PATH.
        exit /b 1
    )
)

REM stop any previous instance
call :stop_quiet

cd /d "%API_DIR%" || (
    echo [ERROR] Cannot cd to %API_DIR%
    exit /b 1
)

echo [INFO]  Building backend using: %MVN%
call "%MVN%" clean package -DskipTests -q
if errorlevel 1 (
    echo [ERROR] Maven build failed.
    exit /b 1
)
echo [OK]    Build complete: %JAR%

REM truncate log
echo. > "%LOG_FILE%"

REM launch in background using start /B
start "investment-api" /B java -jar "%JAR%" > "%LOG_FILE%" 2>&1
echo [INFO]  Backend starting... log: %LOG_FILE%

REM wait for /api/ping to respond (max 90s)
set /a TRIES=0
:wait_loop
set /a TRIES+=1
powershell -NoProfile -Command "try { (Invoke-WebRequest -Uri http://localhost:%PORT%/api/ping -UseBasicParsing -TimeoutSec 2).StatusCode } catch { exit 1 }" >nul 2>nul
if not errorlevel 1 goto :up
if %TRIES% GEQ 90 goto :timeout
timeout /t 1 /nobreak >nul
goto :wait_loop

:up
echo [OK]    Backend is UP on :%PORT%
echo         Health: http://localhost:%PORT%/actuator/health
echo         API:    http://localhost:%PORT%/api/ping
echo         Logs:   app.bat logs
exit /b 0

:timeout
echo [ERROR] Backend did not start within 90s. Last 80 lines of log:
powershell -NoProfile -Command "Get-Content '%LOG_FILE%' -Tail 80"
exit /b 1

:stop
call :stop_quiet
exit /b 0

:stop_quiet
for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":%PORT% " ^| findstr LISTENING') do (
    echo [INFO]  Killing pid %%P on port %PORT%
    taskkill /PID %%P /F >nul 2>nul
)
if exist "%PID_FILE%" del /q "%PID_FILE%" >nul 2>nul
exit /b 0

:status
powershell -NoProfile -Command ^
    "$p = Get-NetTCPConnection -LocalPort %PORT% -State Listen -ErrorAction SilentlyContinue; ^
     if ($p) { Write-Host ('Backend RUNNING on :%PORT% (pid=' + $p.OwningProcess + ')') -ForegroundColor Green } ^
     else { Write-Host 'Backend NOT running' -ForegroundColor Yellow }"
exit /b 0

:logs
if not exist "%LOG_FILE%" (
    echo [WARN] No log file yet at %LOG_FILE%
    exit /b 0
)
powershell -NoProfile -Command "Get-Content '%LOG_FILE%' -Wait -Tail 50"
exit /b 0

:restart
call :stop_quiet
timeout /t 1 /nobreak >nul
call :start
exit /b %errorlevel%

:default
echo Usage: %~nx0 {start^|stop^|status^|logs^|restart}
exit /b 2