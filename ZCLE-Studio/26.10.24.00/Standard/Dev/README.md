# Dev — Developer Environment & Source Code

**Package:** ZCLE Studio (`26.10.24.00/Standard`)

---

## Developer Directory Organization

```text
Dev/
├── README.md                  # This file
└── Studio_App/                # Primary application package
    ├── app/                   # Playback engine runtime
    │   ├── index.html         # Main application entry point
    │   ├── styles.css         # UI & 2D layout styling
    │   ├── player.js          # Audio master clock & UI controller
    │   ├── scenes.js          # Deterministic 2D/2.5D procedural scene renderers
    │   ├── webgl.js           # Native 3D WebGL shader engine
    │   └── course-data.js     # Embedded course timeline data
    │
    ├── assets/                # Local runtime assets (audio, icons)
    │   └── audio/             # cpu-narration-preview.mp3
    │
    ├── specs/                 # Data schemas & course descriptors
    │   ├── course.cpu.json    # "What is CPU?" full timeline specification
    │   └── zcle.scene.schema.json # JSON schema specification
    │
    ├── tools/                 # Build & generation scripts
    │   ├── build_course.py    # Edge-TTS Hinglish narration builder
    │   └── build_scene_sheets.py # Markdown scene sheet generator
    │
    └── tests/                 # QA validation & visual regression tests
        ├── validate.py        # JSON schema validator script
        └── *.png              # Scene reference render snapshots
```

---

## How to Run & Develop

1. **Direct Browser Execution:**
   Double-click `Dev/Studio_App/app/index.html` to open in your browser.
2. **Local HTTP Server (Optional):**
   Agar local HTTP server se serve karna ho:
   ```bash
   cd Dev/Studio_App
   python -m http.server 8000
   ```
   Open `http://localhost:8000/app/`.

