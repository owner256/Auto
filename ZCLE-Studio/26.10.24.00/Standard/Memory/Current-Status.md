# Memory / Current-Status.md — Project State

**Package:** ZCLE Studio (`26.10.24.00/Standard`)  
**Engine:** ZCLE Manim Engine (`Dev/ZCLE_Engine/`)  
**Server Port:** `http://localhost:8585` (Active daemon process)  
**Last Updated:** 2026-10-24

---

## 1. Executive Summary

ZCLE Studio is executing the **2-File Architecture**:
1. **File 1:** Explanation Text Script (Narration speech).
2. **File 2:** AI Director JSON (Visual primitives, parameters, and cue phrases).

The system replaces legacy generic card templates with a **Modular Visual Primitives Library** (Astrophysics, Computing, Neural/AI, Math) and achieves **100% lockstep audio-visual synchronization (0-second drift)** using Edge-TTS millisecond speech boundaries.

---

## 2. Component Status

| Component | Path | Status | Notes |
|---|---|---|---|
| **AI Director Schema** | `Dev/ZCLE_Engine/specs/zcle_director_schema.json` | ✅ Complete / Active | Standard JSON Schema for ChatGPT / Gemini output |
| **Director Prompt** | `Dev/ZCLE_Engine/specs/AI_DIRECTOR_SYSTEM_PROMPT.md` | ✅ Complete / Active | 1-Click prompt to generate File 2 from any explanation text |
| **Visual Primitives** | `Dev/ZCLE_Engine/core/visual_primitives/` | ✅ Complete / Active | Modular Manim classes: SpacetimeGrid, EventHorizon, SiliconDie, NeuralSlab3D |
| **Audio Sync Engine** | `Dev/ZCLE_Engine/core/audio_sync.py` | ✅ Complete / Active | Edge-TTS with millisecond timestamp extraction |
| **Auto-Sync Compiler** | `Dev/ZCLE_Engine/core/compiler.py` | ✅ Complete / Active | Matches `cue_phrase` to speech -> compiles Manim script -> 1080p MP4 |
| **End-to-End Pilot** | `Dev/ZCLE_Engine/projects/black_hole_2file_pilot/` | ✅ 100% Verified | `final_synced_video.mp4` rendered with exact speech-visual lockstep |
| **Studio Web Server** | `Dev/ZCLE_Engine/server.py` | ✅ Running | Active on `http://localhost:8585` |
| **Studio Web UI** | `Dev/ZCLE_Engine/web/` | 🔄 Updating | 2-File upload/paste interface, timeline viewer, live render player |
| **Legacy CPU Pilot** | `Dev/Studio_App/app/index.html` | ✅ Preserved | Standalone offline WebGL/Canvas player for CPU |

---

## 3. Verified Reference Data
- **Reference Video:** `C:\Users\SunilKori\Downloads\vidssave.com Large Language Models explained briefly 480P.mp4` (Duration: 07:57 / 477.46s).
- **Extracted Reference Frames:** `C:\manim_tmp\ref_video_frames\` (32 keyframes).
- **Key finding:** All animations in Manim are driven by `self.play(..., run_time=...)` and `self.wait(...)` where durations are derived from word-level audio timestamps.
