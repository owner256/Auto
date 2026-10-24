# Memory / Next-Tasks.md — Actionable Task Roadmap

**Package:** ZCLE Studio (`26.10.24.00/Standard`)  
**Last Updated:** 2026-10-24

---

## Active Tasks (Phase 2: 2-File Architecture Implementation)

### 📌 Task 1: Complete AI Director Schema & System Prompt (Dev/ZCLE_Engine/specs/)
- [x] Create `zcle_director_schema.json` with strict validation for `cue_phrase`, `visual_primitive`, `parameters`, and `action`.
- [x] Create `AI_DIRECTOR_SYSTEM_PROMPT.md` for ChatGPT and Gemini to turn any chapter text into File 2.

### 📌 Task 2: Implement Modular Visual Primitives Library (Dev/ZCLE_Engine/core/visual_primitives/)
- [x] `astrophysics.py`: SpacetimeCurvatureGrid, EventHorizonSphere, GeodesicPhotonBeam.
- [x] `computing.py`: SiliconDie, LogicGateCircuit, ClockSquareWave, DataBusPacket.
- [x] `neural.py`: NeuralSlab3D, TokenVectorColumn, ProbabilityBarChart.
- [x] `math_analysis.py`: CoordPlane, TangentVector, FunctionGraph.

### 📌 Task 3: Implement Audio Sync & Timestamp Extractor (Dev/ZCLE_Engine/core/audio_sync.py)
- [x] Edge-TTS stream processing capturing `SentenceBoundary` millisecond offsets.
- [x] Word-level phonetic interpolator to calculate start/end second of any arbitrary `cue_phrase`.

### 📌 Task 4: Implement Dynamic Scene Compiler (Dev/ZCLE_Engine/core/compiler.py)
- [x] Accept File 1 (`narration.txt`) and File 2 (`director.json`).
- [x] Match each `cue_phrase` to the exact audio second.
- [x] Assemble valid pure Manim Python file (`project_scene.py`).
- [x] Render with `manim -qh` and mux audio cleanly with FFmpeg into 1080p MP4.

### 📌 Task 5: Upgrade Studio Web Interface (Dev/ZCLE_Engine/web/)
- [x] Add 2-File input tabs (Narration Text & Director JSON).
- [x] Add "Copy AI Director Prompt" button.
- [x] Add timeline cue-marker viewer.
- [x] 1-Click render button with real-time MP4 preview player.

### 📌 Task 6: End-to-End Verification Test
- [x] Test Black Hole topic with authentic Spacetime curvature and Event Horizon, verified 100% audio-visual sync.
