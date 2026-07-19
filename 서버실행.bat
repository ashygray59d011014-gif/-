@echo off
chcp 65001 > nul
title 파란 길드 서버 - 이 창을 닫으면 게임이 종료됩니다
cd /d "%~dp0"
call npm run dev -- --host 127.0.0.1 --port 5173 --strictPort

echo.
echo 게임 서버가 종료되었습니다. 위의 오류 내용을 확인해 주세요.
pause
