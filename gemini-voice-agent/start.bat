@echo off
title Gemini TTS & Voice AI Agent
color 0b
echo ======================================================
echo    Starting Gemini TTS & Voice AI Agent...
echo ======================================================
echo.
cd /d "%~dp0"
node src/server.js
pause

