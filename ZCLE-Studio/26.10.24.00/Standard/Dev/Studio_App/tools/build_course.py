# tools/build_course.py — Full 13-Scene Neural TTS Narration Generator
import asyncio
import json
import os
import sys
from pathlib import Path
import shutil
import edge_tts

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

ROOT = Path(__file__).resolve().parents[1]
COURSE_JSON = ROOT / "specs" / "course.cpu.json"
OUTPUT_MP3 = ROOT / "assets" / "audio" / "cpu-narration-preview.mp3"
CENTRAL_MP3 = Path(__file__).resolve().parents[3] / "Assets" / "audio" / "cpu-narration-preview.mp3"

VOICE = "hi-IN-MadhurNeural"

async def generate_scene_speech(text, out_path):
    communicate = edge_tts.Communicate(text.strip(), VOICE, rate="+2%", pitch="-1Hz")
    await communicate.save(str(out_path))

async def build_all_scenes():
    OUTPUT_MP3.parent.mkdir(parents=True, exist_ok=True)
    with open(COURSE_JSON, "r", encoding="utf-8") as f:
        course = json.load(f)

    scenes = course.get("scenes", [])
    print(f"Loaded {len(scenes)} scenes from {COURSE_JSON.name}")

    full_script = []
    for s in scenes:
        narration = s.get("narration", {}).get("text", "")
        if narration:
            full_script.append(narration)

    combined_text = "\n\n".join(full_script)
    print("Synthesizing Neural Audio using Microsoft Edge-TTS (Voice: " + VOICE + ")...")
    communicate = edge_tts.Communicate(combined_text, VOICE, rate="+1%", pitch="-1Hz")
    await communicate.save(str(OUTPUT_MP3))
    print(f"Audio saved to: {OUTPUT_MP3} (Size: {OUTPUT_MP3.stat().st_size} bytes)")

    if CENTRAL_MP3.parent.parent.exists():
        CENTRAL_MP3.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(OUTPUT_MP3, CENTRAL_MP3)
        print(f"Mirrored to central Assets: {CENTRAL_MP3}")

if __name__ == "__main__":
    asyncio.run(build_all_scenes())
