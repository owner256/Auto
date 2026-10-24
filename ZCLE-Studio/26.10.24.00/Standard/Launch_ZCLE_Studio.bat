@echo off
title ZCLE Studio - Programmatic Video Generator (Manim Engine)
cd /d "%~dp0Dev\ZCLE_Engine"
echo ========================================================
echo   Launching ZCLE Studio (Data-Driven Video Generator) ...
echo   Engine: Manim Community + Neural Edge-TTS + FFmpeg
echo   Opening Studio Dashboard at http://localhost:8585
echo ========================================================
python server.py
pause
