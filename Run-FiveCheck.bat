@echo off
setlocal

REM Wechsel in das Projektverzeichnis (Ort der Batch-Datei)
cd /d "%~dp0"

REM Dev-Server in neuem Fenster starten
start "FiveCheck Dev Server" cmd /c "npm run dev"

REM Kurz warten und dann Browser öffnen
timeout /t 2 /nobreak >nul
start "" http://localhost:3000/

endlocal