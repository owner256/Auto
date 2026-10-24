# Docs / Workflows.md — Authoring & Generation Workflows

**Package:** ZCLE Studio (`26.10.24.00/Standard`)

---

## 1. Course Authoring Workflow

Naya technical lesson add karne ka standard flow:

```mermaid
sequenceDiagram
    autonumber
    actor Author as Technical Author
    participant Spec as specs/course.<name>.json
    participant Tool as tools/build_course.py
    participant TTS as Microsoft Edge-TTS
    participant Player as Dev/Studio_App/app

    Author->>Spec: Write narration text, time cues & visual modes
    Author->>Tool: Execute python build_course.py
    Tool->>TTS: Synthesize natural Hinglish MP3 audio
    TTS-->>Tool: Return stitched audio file
    Tool->>Player: Save assets/audio/narration.mp3
    Author->>Player: Open index.html & verify sync
```

---

## 2. Audio Generation Commands

Python virtual environment ya global environment mein required packages install karein:
```bash
pip install edge-tts pydub
```

Audio build script run karein:
```bash
cd Dev/Studio_App/tools
python build_course.py
```
Output MP3 automatically `Dev/Studio_App/assets/audio/cpu-narration-preview.mp3` aur central `Assets/audio/` mein generate ho jayegi.

---

## 3. Validation Workflow

JSON timeline schema compliance check karne ke liye:
```bash
pip install jsonschema
python Dev/Studio_App/tests/validate.py
```

