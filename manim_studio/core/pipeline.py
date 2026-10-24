import os
import sys
import json
import shutil
import subprocess
import time
from .audio import generate_audio_sync, generate_ambient_music
from .templates import generate_python_scene_file

class ManimStudioPipeline:
    def __init__(self, projects_root: str = "manim_studio/projects"):
        self.projects_root = os.path.abspath(projects_root)
        os.makedirs(self.projects_root, exist_ok=True)

    def run(self, project_data: dict, progress_callback=None) -> str:
        """
        Executes the full Manim Studio generation pipeline:
        Project JSON -> TTS Audios -> Python Manim Scenes -> Video Render -> FFmpeg Assembly
        """
        def log(msg, step=None, pct=None):
            print(f"[ManimStudio] {msg}")
            if progress_callback:
                progress_callback({"message": msg, "step": step, "percent": pct})

        project_id = project_data.get("id", f"proj_{int(time.time())}")
        proj_dir = os.path.join(self.projects_root, project_id)
        os.makedirs(proj_dir, exist_ok=True)

        log("Starting Manim Studio Pipeline...", step=1, pct=5)

        voice_key = project_data.get("voice", "hinglish_male")
        ratio = project_data.get("ratio", "16:9")
        resolution = "1920,1080" if ratio == "16:9" else "1080,1920"
        scenes = project_data.get("scenes", [])

        # Step 1: Generate Voiceover per scene
        log(f"Step 1/4: Generating Neural Voiceover for {len(scenes)} scenes...", step=1, pct=10)
        scene_durations = {}
        audio_files = []
        total_audio_time = 0.0

        for i, sc in enumerate(scenes):
            voice_text = sc.get("voice", "")
            if not voice_text:
                voice_text = sc.get("title", f"Scene {i+1}")
            
            aud_path = os.path.join(proj_dir, f"audio_scene_{i}.mp3")
            dur = generate_audio_sync(voice_text, voice_key, aud_path)
            scene_durations[i] = dur
            total_audio_time += dur
            audio_files.append(aud_path)
            log(f"  - Scene {i+1} audio ready: {dur:.2f}s", step=1, pct=10 + int((i+1)/len(scenes) * 15))

        # Generate ambient background score
        bgm_path = os.path.join(proj_dir, "ambient_bgm.wav")
        log("Generating ambient background score...", step=1, pct=28)
        generate_ambient_music(total_audio_time + 4.0, bgm_path)

        # Step 2: Generate Manim Python Scenes
        log("Step 2/4: Generating dynamic Manim visual scenes...", step=2, pct=32)
        scene_py_file = os.path.join(proj_dir, "generated_scenes.py")
        scene_classes = generate_python_scene_file(project_data, scene_durations, scene_py_file)

        # Step 3: Render each Scene using Manim CLI
        log("Step 3/4: Rendering Manim animations (1080p)...", step=3, pct=40)
        rendered_videos = []
        # Use short temp path to avoid Windows 260 MAX_PATH limit on nested partial_movie_files
        media_dir = "C:\\manim_tmp"
        os.makedirs(media_dir, exist_ok=True)

        for idx, sc_cls in enumerate(scene_classes):
            log(f"  Rendering Scene {idx+1}/{len(scene_classes)}: {sc_cls}...", step=3, pct=40 + int((idx+1)/len(scene_classes) * 40))
            cmd = [
                sys.executable, "-m", "manim",
                "-r", resolution,
                "--fps", "30",
                scene_py_file,
                sc_cls,
                "--media_dir", media_dir
            ]
            res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
            if res.returncode != 0:
                print(f"Manim error in {sc_cls}:\n", res.stderr)
                raise RuntimeError(f"Manim failed to render {sc_cls}: {res.stderr[:300]}")

            # Find the rendered mp4 in media_dir
            found_path = None
            for root, _, files in os.walk(media_dir):
                for f in files:
                    if f == f"{sc_cls}.mp4" and "partial_movie_files" not in root:
                        found_path = os.path.join(root, f)
                        break
                if found_path:
                    break

            if not found_path or not os.path.exists(found_path):
                raise RuntimeError(f"Could not find rendered video for {sc_cls}")

            # Copy rendered scene mp4 into project dir for permanence
            dest_scene_mp4 = os.path.join(proj_dir, f"{sc_cls}.mp4")
            shutil.copy2(found_path, dest_scene_mp4)
            rendered_videos.append(dest_scene_mp4)

        # Step 4: Final Assembly & Audio Mixing
        log("Step 4/4: Mixing Audio, BGM, and assembling final MP4...", step=4, pct=85)

        # Write video concat list
        v_list_path = os.path.join(proj_dir, "video_list.txt")
        with open(v_list_path, "w", encoding="utf-8") as f:
            for v in rendered_videos:
                f.write(f"file '{os.path.abspath(v).replace(chr(92), '/')}'\n")

        # Concat videos
        comb_video = os.path.join(proj_dir, "combined_visual.mp4")
        subprocess.run([
            "ffmpeg", "-y", "-f", "concat", "-safe", "0",
            "-i", v_list_path, "-c", "copy", comb_video
        ], check=True, capture_output=True)

        # Write audio concat list
        a_list_path = os.path.join(proj_dir, "audio_list.txt")
        with open(a_list_path, "w", encoding="utf-8") as f:
            for a in audio_files:
                f.write(f"file '{os.path.abspath(a).replace(chr(92), '/')}'\n")

        # Concat voiceover
        comb_voice = os.path.join(proj_dir, "combined_voice.mp3")
        subprocess.run([
            "ffmpeg", "-y", "-f", "concat", "-safe", "0",
            "-i", a_list_path, "-c", "copy", comb_voice
        ], check=True, capture_output=True)

        # Final Mux with BGM
        final_mp4 = os.path.join(proj_dir, f"{project_id}_final.mp4")
        subprocess.run([
            "ffmpeg", "-y",
            "-i", comb_video,
            "-i", comb_voice,
            "-i", bgm_path,
            "-filter_complex", "[1:a]volume=1.0[v_voice];[2:a]volume=0.22[v_bgm];[v_voice][v_bgm]amix=inputs=2:duration=first:dropout_transition=2[a_out]",
            "-map", "0:v",
            "-map", "[a_out]",
            "-c:v", "copy",
            "-c:a", "aac",
            "-b:a", "192k",
            "-shortest",
            final_mp4
        ], check=True, capture_output=True)

        log("SUCCESS! Video creation complete!", step=4, pct=100)
        return final_mp4

