#!/bin/bash
# 1-Click Auto Setup Script for Ubuntu 22.04 / 24.04 LTS
set -e

echo "=== [1/5] Updating OS Packages & Installing Dependencies ==="
sudo apt-get update -y
sudo apt-get install -y curl git chromium-browser dumb-init \
  fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 \
  libcairo2 libcups2 libdrm2 libgbm1 libgtk-3-0 libnspr4 libnss3 \
  libpango-1.0-0 libx11-xcb1 libxcomposite1 libxdamage1 libxrandr2

echo "=== [2/5] Installing Node.js v22 ==="
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "=== [3/5] Installing PM2 Process Manager ==="
sudo npm install -g pm2

echo "=== [4/5] Installing Project Dependencies ==="
npm install --production

echo "=== [5/5] Starting YT Turbo Cluster with PM2 ==="
pm2 delete yt-engine 2>/dev/null || true
NODE_OPTIONS="--max-old-space-size=4096" UV_THREADPOOL_SIZE=32 pm2 start server.js --name "yt-engine"
pm2 save
pm2 startup | tail -n 1 | sudo bash || true

echo ""
echo "============================================================="
echo "✅ YT TURBO ENGINE IS LIVE ON THIS SERVER!"
echo "👉 Open http://YOUR_SERVER_IP:5000 in your browser"
echo "👉 View live logs anytime: pm2 logs yt-engine"
echo "👉 View server status: pm2 status"
echo "============================================================="
