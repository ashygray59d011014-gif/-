@echo off
chcp 65001 > nul
title 파란 길드 관리 게임
cd /d "%~dp0"

where npm >nul 2>nul
if errorlevel 1 (
  echo Node.js가 설치되어 있지 않습니다.
  echo https://nodejs.org 에서 LTS 버전을 설치한 뒤 다시 실행해 주세요.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo 게임 실행에 필요한 파일을 처음 한 번 설치합니다...
  call npm install
  if errorlevel 1 (
    echo 설치 중 오류가 발생했습니다. 인터넷 연결을 확인해 주세요.
    pause
    exit /b 1
  )
)

echo 게임 서버를 시작합니다...
echo 새로 열리는 검은 창은 게임을 하는 동안 닫지 마세요.
start "파란 길드 서버 - 게임 종료 시 닫기" "%ComSpec%" /k call "%~dp0서버실행.bat"

echo 서버가 준비될 때까지 잠시 기다립니다...
powershell -NoProfile -Command "$ready=$false; for ($i=0; $i -lt 30; $i++) { try { $response=Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:5173' -TimeoutSec 1; if ($response.StatusCode -eq 200) { $ready=$true; break } } catch {}; Start-Sleep -Milliseconds 500 }; if (-not $ready) { exit 1 }"

if errorlevel 1 (
  echo 게임 서버를 열지 못했습니다.
  echo 새로 열린 검은 창의 오류 내용을 확인해 주세요.
  pause
  exit /b 1
)

echo 준비 완료! 브라우저에서 게임을 엽니다.
start "" http://127.0.0.1:5173
exit /b 0
