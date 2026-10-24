import sys
import os
import json

# Run strictly from within ZCLE_Engine
engine_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if engine_dir not in sys.path:
    sys.path.insert(0, engine_dir)

from core.compiler import execute_full_pipeline

narration_text = (
    "Imagine space as a flat elastic fabric. "
    "When a massive star collapses into a black hole, spacetime itself curves infinitely downward. "
    "Around this point of no return lies the event horizon. "
    "Even light rays of photons are pulled into the singularity."
)

director_json = {
    "topic": "Black Hole Spacetime Curvature",
    "category": "astrophysics",
    "voice": "en-US-ChristopherNeural",
    "scenes": [
        {
            "scene_id": 1,
            "cue_phrase": "flat elastic fabric",
            "visual_primitive": "spacetime_grid",
            "action": "CREATE_FLAT_GRID",
            "parameters": {}
        },
        {
            "scene_id": 2,
            "cue_phrase": "spacetime itself curves infinitely downward",
            "visual_primitive": "spacetime_grid",
            "action": "WARP_CURVATURE",
            "parameters": {"funnel_depth": -3.5}
        },
        {
            "scene_id": 3,
            "cue_phrase": "lies the event horizon",
            "visual_primitive": "event_horizon_sphere",
            "action": "SPAWN_BLACK_SPHERE",
            "parameters": {"radius": 1.4, "glow_color": "#FF8C00"}
        },
        {
            "scene_id": 4,
            "cue_phrase": "Even light rays of photons are pulled",
            "visual_primitive": "geodesic_photon_beam",
            "action": "BEND_LIGHT",
            "parameters": {"ray_color": "#00FFFF"}
        }
    ]
}

print("Running test strictly inside ZCLE_Engine...")
res = execute_full_pipeline(narration_text, director_json, "black_hole_2file_pilot", engine_dir)
print("Pipeline Result:")
print("Success:", res["success"])
print("Final Video:", res["final_video"])
print("Timestamps:")
for ts in res["timestamps"]:
    print(f"  [{ts['start']}s -> {ts['end']}s] {ts['sentence']}")

if not res["success"]:
    print("Manim Stderr:\n", res["manim_stderr"])
    print("Manim Stdout:\n", res["manim_stdout"])

