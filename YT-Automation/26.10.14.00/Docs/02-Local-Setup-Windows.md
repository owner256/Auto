# 💻 02. Local Setup Guide (Windows PC / Laptop)

Is guide me bataya gaya hai ki apne local Windows computer par project ko kaise install aur run karna hai.

---

## 📋 Prerequisites (Jaruri Cheezein)

1. **Node.js (v18 ya v20+):** Check karne ke liye terminal me run karein:
   ```powershell
   node -v
   ```
2. **Project Directory:**
   ```powershell
   cd "C:\Users\SunilKori\OneDrive - Aliens Company\Documents\Meta_Mask\YT-Automation\YT-Automation\26.10.14.00"
   ```

---

## 🛠️ Step 1: Dependencies Install Karna

Agar pehli baar setup kar rahe hain:
```powershell
npm install
```

---

## 🚀 Step 2: Project Run Karne Ke 3 Tarike

### Method A: One-Click Windows Launcher (`start-turbo.bat`) — [Sabse Aasan]
Aap seedha `start-turbo.bat` file par double click kar sakte hain ya PowerShell me likhein:
```powershell
.\start-turbo.bat
```
**Kya hoga:**
- Node.js ke thread pool (`UV_THREADPOOL_SIZE=32`) aur 4GB memory boost ke sath server start hoga.
- Default browser me **`http://localhost:5000`** dashboard automatically khul jayega.

---

### Method B: Web Dashboard Mode (`npm start`)
```powershell
npm start
```
Browser me open karein:
👉 **`http://localhost:5000`**

**Dashboard Features:**
1. **YouTube Video URL:** Kisi bhi YouTube video ka link paste karein (`watch`, `live`, ya `shorts`).
2. **Preset Buttons:** 5, 25, 100, 500, 1000 Browsers ke 1-click pills.
3. **Watch Time:** Kitne seconds tak video chalani hai (e.g. `60` ya `300`).
4. **Max Parallel Pool:** Ek sath kitne browsers chalane hain (default `48`).
5. **Real-time Live Telemetry:** CPU %, RAM Usage, Active Browsers, Queue aur avg spawn time live dikhta hai.
6. **Stop All Button:** Ek click me sabhi chalte huye browsers ko instant band karne ke liye.

---

### Method C: Direct CLI Mode (PowerShell / Command Prompt se Bina Web UI ke)
Agar aapko web interface nahi kholna hai aur direct command line se chalana hai:

```powershell
node cli.js "YAHAN_YOUTUBE_LINK" 5 60
```
- Pehla argument: YouTube Video URL (Hamesha double quotes `"..."` me rakhein).
- Doosra argument: Total Browsers (e.g., `5` ya `100`).
- Teesra argument: Watch Time in seconds (e.g., `60`).
- Chautha argument (Optional): Max parallel speed (default `48`).

#### Agar Desktop par 5 Windows Khulte Hue Dekhna Ho:
Aakhir me `--visible` flag lagayein:
```powershell
node cli.js "https://www.youtube.com/watch?v=VIDEO_ID" 5 60 48 --visible
```

