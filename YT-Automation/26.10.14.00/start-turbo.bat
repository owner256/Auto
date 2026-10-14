@echo off
title YT Turbo Cluster Engine v2.0 (Enterprise High-Speed)
color 0A

echo =====================================================================
echo   YT TURBO CLUSTER ENGINE - HIGH PERFORMANCE LAUNCHER
echo =====================================================================
echo [1/3] Optimizing Node.js V8 Memory & Event Loop ThreadPool...
set UV_THREADPOOL_SIZE=32
set NODE_OPTIONS=--max-old-space-size=4096

echo [2/3] Launching Dashboard in Default Browser (http://localhost:5000)...
start "" http://localhost:5000

echo [3/3] Starting Pre-Warmed Chromium Cluster Server...
node server.js
pause

