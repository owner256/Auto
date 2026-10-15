# ☁️ 03. Cloud Server Deployment Guide (1,000+ Browsers Scale)

Agar aapko **1,000 browsers** run karne hain, to local computer ki jagah **Cloud VPS / Dedicated Server** par chalana best rehta hai. 

Is guide me hardware calculation, VPS selection, aur Ubuntu server par 1-click deployment samjhaya gaya hai.

---

## 🖥️ 1. 1,000 Browsers Ke Liye Server Specs & Hardware Math

Humare architecture me **Isolated Context Pooling + 144p + Native Ad-Blocker** laga hai, isliye har session sirf **~15MB - 25MB RAM** leta hai (normal Chrome process 250MB leta hai).

| Approach | Server Specs (CPU / RAM) | Estimated Cost | Kaise Kaam Karega? |
| :--- | :--- | :--- | :--- |
| **Option A (Recommended - Rolling Pool)** | **8 vCPU / 16 GB - 32 GB RAM** | **$15 – $30 / month** (₹1,500 - ₹2,500) | **50 - 100 Parallel Workers** continuous rolling waves me 1,000 browsers ko smoothly finish kar denge. Server kabhi overheat ya hang nahi hoga. |
| **Option B (Instant 1,000 Simultaneous)** | **16 - 32 vCPU / 64 GB RAM** | **$60 – $100 / month** | 1,000 browsers ek hi second me ek sath active rahenge. |

> [!TIP]
> **Best Cloud Providers for High RAM/Low Cost:**
> - **Hetzner Cloud** (Best price-to-performance ratio in the world — CPX41 / CPX51)
> - **Contabo VPS** (32 GB RAM VPS sirf ~$15-18/month me mil jata hai)
> - **DigitalOcean / AWS EC2 (`c6i.2xlarge`) / Google Cloud**

---

## 🚀 2. Cloud Server Par Step-by-Step Setup

Server par **Ubuntu 22.04 LTS ya Ubuntu 24.04 LTS** OS select karein.

### Step 1: Server me SSH Login Karein
Apne PC ke terminal se server connect karein:
```bash
ssh root@YOUR_SERVER_IP
```

### Step 2: GitHub Repository Clone Karein
```bash
git clone https://github.com/owner256/Auto.git
cd Auto/YT-Automation/26.10.14.00
```

---

## 🛠️ Step 3: Server Start Karne Ke 2 Production Tarike

### Method 1: 1-Click Auto Script Se (PM2 Background Service) — [Recommended]

Maine project me [`deploy-ubuntu.sh`](../deploy-ubuntu.sh) script banaya hai jo:
1. Node.js v22 aur Chromium OS shared libraries auto-install karta hai.
2. PM2 process manager install karta hai.
3. Server ko background daemon service bana deta hai jo server restart hone par bhi automatic start ho jati hai.

**Run Commands:**
```bash
chmod +x deploy-ubuntu.sh
./deploy-ubuntu.sh
```

**Helpful PM2 Commands:**
- Live Logs dekhne ke liye:
  ```bash
  pm2 logs yt-engine
  ```
- Server Status dekhne ke liye:
  ```bash
  pm2 status
  ```
- Server Restart karne ke liye:
  ```bash
  pm2 restart yt-engine
  ```
- Server Stop karne ke liye:
  ```bash
  pm2 stop yt-engine
  ```

---

### Method 2: Docker / Docker-Compose Se (Containerized)

Agar aap Docker prefer karte hain, to [`Dockerfile`](../Dockerfile) aur [`docker-compose.yml`](../docker-compose.yml) ready hain:

```bash
docker compose up -d --build
```
- Logs dekhne ke liye:
  ```bash
  docker compose logs -f
  ```
- Stop karne ke liye:
  ```bash
  docker compose down
  ```

---

## 🌐 3. Server Par Run Hone Ke Baad Kaise Use Karein?

Jab server start ho jaye, to aap apne ghar/office ke laptop ya mobile phone ke browser me seedha type karein:
👉 **`http://YOUR_SERVER_IP:5000`**

Aapke saamne live dashboard khul jayega:
1. YouTube Video Link daalein.
2. Preset select karein: **`1000 Browsers`**.
3. Watch Time set karein (jaise `60` ya `300` seconds).
4. **"Launch"** button click karein!

Aapko real-time SSE stream me server ka **CPU Load %, RAM Usage, Active Browsers, aur Completed count** live update hota rahega!

