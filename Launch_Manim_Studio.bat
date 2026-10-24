@echo off
title Manim Studio v1.0
cd /d "%~dp0"
echo ========================================================
echo   Launching Manim Studio v1.0 ...
echo   Opening Dashboard at http://localhost:8585
echo ========================================================
python manim_studio/server.py
pause

