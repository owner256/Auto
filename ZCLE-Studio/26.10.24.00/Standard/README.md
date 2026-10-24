# ZCLE Studio — Standard Package

**Product:** ZCLE Studio (Cinematic Learning Engine Studio)  
**Version:** `26.10.24.00`  
**Package:** `Standard`  
**Status:** Active Development (Working Pilot)  
**Language:** Roman Hinglish (Documentation) / English (Code & Specs)  
**Parent Workspace:** ZOE Product Ecosystem  

---

## 1. Overview & Objective

**ZCLE Studio** (Zero-Friction Cinematic Learning Engine Studio) ek programmatic, code-driven visual education software hai. Iska main objective theoretical technical concepts (jaise CPU architecture, hardware, memory flow, algorithms) ko **high-end 2D/2.5D/3D synchronized cinematic animations** ke zariye explain karna hai.

Yeh traditional static slides ya screen recordings se alag hai:
- Pure code-based interactive timeline (HTML5 + CSS3 + Canvas + Native WebGL).
- Audio master clock synchronization (Microsecond precision seek, pause, reverse, speed change).
- Natural Neural Hinglish TTS narration.
- Zero external runtime dependency (No mandatory server, no heavyweight frameworks for playback, runs directly in browser).

---

## 2. Directory Structure (ZOE Standard)

Yeh project **ZOE Standard File & Folder Architecture** ko follow karta hai:

```text
ZCLE-Studio/26.10.24.00/Standard/
├── README.md                          # Project overview & navigation (This file)
├── AGENTS.md                          # AI & developer operational rules & SSOT guidelines
│
├── Memory/                            # Project ki AI-readable SSOT (Context & State)
│   ├── README.md                      # Reading sequence & memory index
│   ├── Vision.md                      # Long-term purpose & core philosophy
│   ├── Decisions.md                   # Approved architectural & technical decisions
│   ├── Current-Status.md              # Live status (Completed, In-progress, Blockers)
│   ├── Next-Tasks.md                  # Prioritized next actionable roadmap
│   └── Handoff.md                     # Context transfer & model resume guide
│
├── Research/                          # Background study, benchmarks & sources
│   ├── README.md                      # Research overview
│   └── Sources.md                     # ZTLE references & rendering benchmarks
│
├── Planning/                          # Vision → Goals → Missions → Stages → Tasks
│   ├── README.md                      # Planning hierarchy
│   ├── Vision.md                      # Educational impact & scope
│   ├── Goals.md                       # High-level objectives
│   ├── Missions.md                    # Core technical missions
│   ├── Stages.md                      # Iteration stages (Pilot -> Engine -> Studio)
│   └── Tasks.md                       # Granular task tracking
│
├── Docs/                              # Detailed technical documentation & blueprints
│   ├── README.md                      # Docs directory index
│   ├── Requirements.md                # System & functional requirements
│   ├── Architecture.md                # Component & audio-visual synchronization design
│   ├── Workflows.md                   # Authoring & generation pipelines
│   ├── PRODUCTION_BLUEPRINT.md        # Shot-by-shot production plan
│   ├── SCENE_PRODUCTION_SHEETS.md     # 13 scene director sheets
│   └── SCHEMA_GUIDE.md                # Scene JSON schema specification
│
├── Dev/                               # ACTUAL SOURCE CODE & TOOLS
│   ├── README.md                      # Developer setup guide
│   └── Studio_App/                    # Primary application package
│       ├── app/                       # Browser playback engine (HTML, CSS, JS, WebGL)
│       ├── assets/                    # Local playback audio & assets
│       ├── specs/                     # JSON timeline data & validation schemas
│       ├── tools/                     # Build tools (Edge-TTS, cue generators)
│       └── tests/                     # Validation scripts & regression visual tests
│
├── Assets/                            # Central project audio & media assets
│   ├── README.md                      # Asset registry & licensing
│   └── audio/                         # Stitched master narration files
│
└── Releases/                          # Version tracking & deployment notes
    └── CHANGELOG.md                   # Chronological release log
```

---

## 3. Quick Start (Run in 5 Seconds)

1. Navigate to the application folder:
   ```text
   Dev/Studio_App/app/index.html
   ```
2. Double-click **`index.html`** in any modern web browser (Chrome, Edge, Firefox, Brave).
   - *No Node.js, Python server, or API keys required.*
3. Click **"Start lesson with audio"** or press **Spacebar** to begin playback.
4. Use the timeline slider, scene pills, or keyboard controls to seek smoothly across all 13 scenes.

---

## 4. Source of Truth (SSOT)

- **Curriculum / Content:** ZTLE hardware repository (`ALONE-616/ZTLE`, branch `beta`).
- **Project Context & Decisions:** `Memory/` folder.
- **Rules of Engagement:** `AGENTS.md`.
- **Authoritative Code:** `Dev/Studio_App/`.

