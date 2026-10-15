# 📚 YT-Automation — Official Documentation (Hinglish)

Ye documentation **YT-Automation (Version: 26.10.14.01)** ke setup, architecture, cloud server deployment aur usage ko aasan Hinglish me step-by-step explain karti hai.

---

## 📑 Documentation Index (Index & Guides)

| File Name | Topic | Description |
| :--- | :--- | :--- |
| [**`01-Overview-Architecture.md`**](./01-Overview-Architecture.md) | **Architecture & Speed Math** | Ye system 1ms me kaise start hota hai aur 1,000 browsers bina PC hang kiye kaise handle karta hai. |
| [**`02-Local-Setup-Windows.md`**](./02-Local-Setup-Windows.md) | **Local PC Setup (Windows)** | Apne laptop/desktop par Web UI aur CLI mode run karne ka step-by-step tarika. |
| [**`03-Cloud-Server-Deployment.md`**](./03-Cloud-Server-Deployment.md) | **Cloud VPS & Server Guide** | 1,000 browsers ke liye Cloud Server specs, Ubuntu PM2 setup aur Docker 1-click deploy guide. |
| [**`04-Usage-And-Troubleshooting.md`**](./04-Usage-And-Troubleshooting.md) | **Usage & FAQs** | Normal videos, Live streams, Shorts links, concurrency control aur common questions ke solutions. |
| [**`05-Scaling-To-10000-And-Proxy-Guide.md`**](./05-Scaling-To-10000-And-Proxy-Guide.md) | **10K Scale, Headless & Proxies** | Linux Headless Mode kaise kaam karta hai, Docker ka role, aur VPN vs Rotating Proxies ka exact solution. |
| [**`06-Enterprise-Features-And-Rotating-Proxy.md`**](./06-Enterprise-Features-And-Rotating-Proxy.md) | **Enterprise Features & Proxies** | Rotating Residential Proxies, Watch Time Jitter, Organic Search, Drip-Feed, Webhooks, aur CSV Export. |


---

## ⚡ Quick Summary (Short Overview)

- **Tech Stack:** Node.js, Puppeteer, Express, Server-Sent Events (SSE), Chromium Turbo Contexts.
- **Hardware Requirement:** 
  - Local PC: 4 Cores, 8-32GB RAM (5 se 50 parallel browsers ke liye).
  - Cloud Server: 8 vCPU, 16-32GB RAM (500 se 1,000+ browsers ke rolling batches ke liye).
- **Core Feature:** Isolated BrowserContext Pooling jisse har session sirf ~15MB RAM leta hai aur video 144p + muted me auto-play hoti hai.

