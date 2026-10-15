# 💡 04. Usage Guide & Troubleshooting (FAQs)

Is document me project ke alag-alag features ka sahi use aur common sawalon ke answers diye gaye hain.

---

## 🔗 Supported YouTube URL Types

Engine me har type ke YouTube link ka automatic converter laga hua hai:

| Link Type | Example | Support Status |
| :--- | :--- | :--- |
| **Direct Watch URL** | `https://www.youtube.com/watch?v=vFhWScusuSg` | ✅ Full Support |
| **Share Short Link** | `https://youtu.be/vFhWScusuSg?si=xxx` | ✅ Auto-converted to direct watch URL (0ms redirect lag) |
| **YouTube Live Streams** | `https://www.youtube.com/live/Ne6q9PumPbM` | ✅ Auto-converted to watch URL + Anti-Idle Heartbeat active |
| **YouTube Shorts** | `https://www.youtube.com/shorts/xxxxxx` | ✅ Auto-converted to standard player format |

> **Tip:** CLI me link pass karte waqt link ke dono taraf **Double Quotes `"..."`** lagana zaroori hai taaki PowerShell ya CMD me `?` aur `&` characters command ko disturb na karein.

---

## ⚙️ Concurrency & Parallel Speed Ka Matlab Kya Hai?

Jab aap `node cli.js "URL" 100 60 48` likhte hain:
- **`100`** = Total kitne browser sessions execute karne hain.
- **`60`** = Har session me video kitne second tak chalegi.
- **`48`** = **Max Parallel Concurrency (Traffic Lanes)**.
  - Iska matlab ek waqt par ek sath computer/server par 48 browsers chalenge.
  - Jaise hi koi 1 session apna 60 second poora karega, agla session line (queue) se 1ms me andar aa jayega.
  - Isse computer ka RAM aur CPU kabhi 100% par overheat nahi hota.

---

## 🎯 Multi-Video Campaign Feature (v26.10.14.01)

Ab aap ek hi waqt par multiple alag-alag videos par alag-alag view targets run kar sakte hain (e.g. Video 1: 1,000 views, Video 2: 2,500 views, Video 3: 500 views)!

### 1. Web Dashboard Se Chalana:
1. Dashboard kholen: `http://localhost:5000`
2. **"Multi-Video Campaign"** tab par click karein.
3. Har video ka URL, Views target, aur Watch duration set karein.
4. **"➕ Add Another Video Row"** par click karke chahe 5 ya 10 videos jod dein.
5. **"🚀 Launch Multi-Video Campaign"** dabayein.
6. Right side me har video ka **Live Progress Bar, Completed count aur Active browsers** real-time update hoga!

### 2. CLI (Terminal) Se Chalana:
- **Tarika A: JSON File Se (Sabse Best):**
  `campaign.example.json` file me apni videos daalein:
  ```json
  [
    { "title": "Video 1", "url": "https://www.youtube.com/watch?v=ID1", "count": 1000, "duration": 60 },
    { "title": "Video 2", "url": "https://www.youtube.com/watch?v=ID2", "count": 2500, "duration": 45 },
    { "title": "Video 3", "url": "https://www.youtube.com/watch?v=ID3", "count": 500, "duration": 90 }
  ]
  ```
  Aur run karein:
  ```powershell
  node cli.js --campaign=campaign.example.json
  ```
- **Tarika B: Inline Multi-Video Argument:**
  ```powershell
  node cli.js --multi "https://youtu.be/ID1:1000:60,https://youtu.be/ID2:2500:45,https://youtu.be/ID3:500:90"
  ```

---

## ❓ Frequently Asked Questions (FAQs)

### Q1: Video sach me play ho rahi hai ya nahi, kaise pata chalega?
Jab aap terminal me dekhte hain:
```text
▶️ [Browser #2] PLAYING "चार दोस्तों का चंद्रयान..." | Player Pos: 6.7s | Spawn: 1ms -> Watching for 300s
```
- **Player Pos: 6.7s:** Iska matlab video player start ho chuka hai aur 6.7 seconds aage badh chuka hai.
- Agar aap apni aankhon se dekhna chahte hain, to command ke aakhir me **`--visible`** laga dein:
  ```powershell
  node cli.js "https://www.youtube.com/watch?v=VIDEO_ID" 5 60 48 --visible
  ```
  Aapke desktop par 5 browsers khul kar video chalte huye dikhegi!

---

### Q2: YouTube Live Streams par kya video pause hoti hai?
Nahi. Long video aur Live streams ke liye `ResourceOptimizer.js` me **15-Second Anti-Idle Heartbeat** laga hua hai:
- YouTube ke *"Video paused. Continue watching?"* pop-up ko automatic click kar deta hai.
- Video stream ko continuous live state me play rakhta hai chahe aap 1 ghante (3600 seconds) ke liye run karein.

---

### Q3: Server par audio kyun nahi aati?
By design, sabhi browser instances ko `--mute-audio` flag ke sath launch kiya jata hai taaki 5 ya 1,000 browsers ka sound ek sath chal kar system noise aur audio driver buffer crash na kare. Video visual aur view counting normally hoti hai.

---

### Q4: Emergency Stop kaise karein?
- **Web UI me:** Red color ke **"🛑 Stop All"** button par click karein.
- **CLI me:** Terminal me `Ctrl + C` dabayein. Engine sabhi active contexts aur pending queue ko `<100ms` me cleanly recycle kar deta hai.

---

### Q5: Agar 1,000 me se kuch browsers fail ho jayein, to kya Fallback feature hai?
**Haan, bilkul! Isme 2-Layer Auto-Recovery Engine laga hai:**

1. **Auto-Retry (Up to 3 Attempts per session):**
   - Agar kisi browser me temporary network drop ya YouTube delay hota hai, to engine use fail nahi maanta.
   - Wo us browser ko `retryCount` ke sath dubara rolling queue me re-enqueue kar deta hai taaki wo nayi clean context ke sath try kare.
2. **Guaranteed 100% Target Completion (Auto-Replacement):**
   - Agar 3 retries ke baad bhi koi session kisi permanent issue se fail ho jata hai, to scheduler automatically **ek naya replacement session** spawn kar deta hai!
   - Iska matlab: **Agar aapne 1,000 views/browsers ka order diya hai, to engine poore 1,000 completed sessions (`1,000 / 1,000`) poore hone par hi finish hoga!** Koi bhi session drop nahi hota.

