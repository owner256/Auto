"""
Dynamic Scene Graph Compiler for ZCLE Studio
Takes File 1 (Narration Text) and File 2 (Director Data JSON),
binds animations to exact speech millisecond timestamps, and compiles into 1080p MP4.
"""
import os
import json
import subprocess
import shutil
from .audio_sync import generate_audio_sync, find_cue_start_time

def compile_director_to_manim(director_data: dict, timestamps: list, total_audio_dur: float, output_py_path: str, base_dir: str = None):
    """
    Generates a pure, executable Manim script where each visual action
    is tied to the speech timestamp of its cue_phrase.
    """
    topic = director_data.get("topic", "Explainer")
    scenes = director_data.get("scenes", [])
    category = director_data.get("category", "astrophysics")

    code_lines = [
        "import sys",
        "import os",
    ]
    if base_dir:
        clean_base = os.path.abspath(base_dir).replace("\\", "/")
        code_lines.append(f'if "{clean_base}" not in sys.path: sys.path.insert(0, "{clean_base}")')

    code_lines.extend([
        "from manim import *",
        "import numpy as np",
        "from core.visual_primitives.astrophysics import SpacetimeGrid, EventHorizonSphere, GeodesicPhotonBeam",
        "from core.visual_primitives.computing import SiliconDie, ClockSquareWave, LogicGateCircuit",
        "from core.visual_primitives.neural import NeuralSlab3D, TokenVectorColumn, ProbabilityBarChart",
        "from core.visual_primitives.math_analysis import DynamicCoordinatePlane, TangentSlopeVector",
        "",
        'config.background_color = "#0B0E14"',
        "",
        "class MasterSyncedScene(Scene):",
        "    def construct(self):",
        f'        # Topic: {topic}',
        "        current_t = 0.0",
        ""
    ])

    current_sim_time = 0.0

    for idx, sc in enumerate(scenes):
        cue = sc.get("cue_phrase", "")
        primitive = sc.get("visual_primitive", "spacetime_grid")
        action = sc.get("action", "CREATE")
        params = sc.get("parameters", {})

        target_t = find_cue_start_time(cue, timestamps, default_time=current_sim_time)
        wait_dur = max(0.1, target_t - current_sim_time)
        current_sim_time += wait_dur

        code_lines.append(f"        # --- Scene {idx+1}: Cue '{cue}' (Target: {target_t:.2f}s) ---")
        code_lines.append(f"        self.wait({wait_dur:.2f})")

        # Dynamic primitive generation based on visual_primitive & action
        if primitive == "spacetime_grid":
            if action in ["CREATE", "CREATE_FLAT_GRID"]:
                run_t = 1.8
                code_lines.extend([
                    "        self.grid = SpacetimeGrid()",
                    f"        self.play(Create(self.grid.lines), run_time={run_t})",
                ])
                current_sim_time += run_t
            elif action in ["WARP_CURVATURE", "WARP_GRID"]:
                run_t = 2.4
                depth = params.get("funnel_depth", -3.5)
                code_lines.extend([
                    "        if hasattr(self, 'grid'):",
                    f"            warped = self.grid.warp_towards_center(strength=2.5, radius=3.8)",
                    f"            self.play(Transform(self.grid.lines, warped), run_time={run_t})",
                ])
                current_sim_time += run_t

        elif primitive in ["event_horizon_sphere", "event_horizon"]:
            run_t = 2.0
            r = params.get("radius", 1.4)
            glow = params.get("glow_color", "#FF8C00")
            code_lines.extend([
                f'        self.black_hole = EventHorizonSphere(radius={r}, glow_color="{glow}")',
                f"        self.play(FadeIn(self.black_hole, scale=0.4), run_time={run_t})",
            ])
            current_sim_time += run_t

        elif primitive in ["geodesic_photon_beam", "photon_beam"]:
            run_t = 2.2
            col = params.get("ray_color", "#00FFFF")
            code_lines.extend([
                f'        beam1 = GeodesicPhotonBeam(start_pos=LEFT*6+UP*2.5, ray_color="{col}")',
                f'        beam2 = GeodesicPhotonBeam(start_pos=LEFT*6+DOWN*2.5, ray_color="{col}")',
                f"        self.play(Create(beam1), Create(beam2), run_time={run_t})",
            ])
            current_sim_time += run_t

        elif primitive == "silicon_die":
            run_t = 2.0
            code_lines.extend([
                "        self.die = SiliconDie()",
                f"        self.play(Create(self.die.substrate), FadeIn(self.die.blocks), run_time={run_t})",
            ])
            current_sim_time += run_t

        elif primitive == "clock_square_wave":
            run_t = 2.0
            code_lines.extend([
                "        self.clock = ClockSquareWave().shift(DOWN*2.2)",
                f"        self.play(Create(self.clock.wave), run_time={run_t})",
            ])
            current_sim_time += run_t

        elif primitive == "neural_slab_3d":
            run_t = 2.2
            code_lines.extend([
                "        self.slabs = NeuralSlab3D()",
                f"        self.play(FadeIn(self.slabs, shift=IN*2), run_time={run_t})",
            ])
            current_sim_time += run_t

        elif primitive == "token_vector_column":
            run_t = 1.8
            tok = params.get("token", "word")
            code_lines.extend([
                f'        self.vec = TokenVectorColumn(token="{tok}")',
                f"        self.play(FadeIn(self.vec, shift=UP*0.5), run_time={run_t})",
            ])
            current_sim_time += run_t

        elif primitive == "probability_bar_chart":
            run_t = 2.0
            code_lines.extend([
                "        self.chart = ProbabilityBarChart().to_edge(RIGHT, buff=1.0)",
                f"        self.play(FadeIn(self.chart, shift=LEFT*0.5), run_time={run_t})",
            ])
            current_sim_time += run_t

        else:
            # Fallback custom mathematical element
            run_t = 1.5
            title_text = params.get("title", cue)
            code_lines.extend([
                f'        banner = Text("{title_text}", font_size=32, color=BLUE_B).to_edge(UP)',
                f"        self.play(Write(banner), run_time={run_t})",
            ])
            current_sim_time += run_t

        code_lines.append("")

    # Align remainder of audio timeline
    remaining_wait = max(0.5, total_audio_dur - current_sim_time)
    code_lines.append(f"        # --- Pad to end of audio ({total_audio_dur:.2f}s total) ---")
    code_lines.append(f"        self.wait({remaining_wait:.2f})")

    with open(output_py_path, "w", encoding="utf-8") as f:
        f.write("\n".join(code_lines))


def execute_full_pipeline(narration_text: str, director_json: dict, project_id: str, base_dir: str) -> dict:
    """
    Executes the complete 2-file compilation pipeline:
    1. Edge-TTS synthesis & timestamp extraction
    2. Dynamic Manim Python script compilation
    3. Manim video rendering
    4. FFmpeg muxing into final 1080p MP4
    """
    project_dir = os.path.join(base_dir, "projects", project_id)
    os.makedirs(project_dir, exist_ok=True)

    audio_path = os.path.join(project_dir, "narration.mp3")
    voice = director_json.get("voice", "en-US-ChristopherNeural")

    # Step 1: Voice Narration & Timestamps
    timestamps = generate_audio_sync(narration_text, audio_path, voice)
    total_audio_dur = timestamps[-1]["end"] if timestamps else 10.0

    # Step 2: Compile Manim Script
    scene_py_path = os.path.join(project_dir, "scene.py")
    compile_director_to_manim(director_json, timestamps, total_audio_dur, scene_py_path, base_dir=base_dir)

    # Save inputs
    with open(os.path.join(project_dir, "narration.txt"), "w", encoding="utf-8") as f:
        f.write(narration_text)
    with open(os.path.join(project_dir, "director.json"), "w", encoding="utf-8") as f:
        json.dump(director_json, f, indent=2)
    with open(os.path.join(project_dir, "timestamps.json"), "w", encoding="utf-8") as f:
        json.dump(timestamps, f, indent=2)

    # Step 3: Run Manim Render
    # Run manim inside base_dir so it finds core.visual_primitives
    manim_cmd = [
        "manim", "-ql", scene_py_path, "MasterSyncedScene",
        "--media_dir", os.path.join(project_dir, "manim_media")
    ]
    env = os.environ.copy()
    env["PYTHONPATH"] = base_dir + os.pathsep + env.get("PYTHONPATH", "")
    render_proc = subprocess.run(manim_cmd, cwd=base_dir, env=env, capture_output=True, text=True)

    # Locate rendered MP4
    media_dir = os.path.join(project_dir, "manim_media", "videos", "scene", "480p15")
    raw_video = os.path.join(media_dir, "MasterSyncedScene.mp4")

    final_video_path = os.path.join(project_dir, "final_synced_video.mp4")

    if os.path.exists(raw_video):
        # Step 4: Mux Video + Audio with FFmpeg
        mux_cmd = [
            "ffmpeg", "-y", "-i", raw_video, "-i", audio_path,
            "-c:v", "copy", "-c:a", "aac", "-shortest", final_video_path
        ]
        subprocess.run(mux_cmd, capture_output=True)

    success = os.path.exists(final_video_path)
    return {
        "success": success,
        "project_id": project_id,
        "project_dir": project_dir,
        "final_video": final_video_path if success else None,
        "audio_path": audio_path,
        "timestamps": timestamps,
        "manim_stdout": render_proc.stdout[-500:] if render_proc.stdout else "",
        "manim_stderr": render_proc.stderr[-500:] if render_proc.stderr else ""
    }
