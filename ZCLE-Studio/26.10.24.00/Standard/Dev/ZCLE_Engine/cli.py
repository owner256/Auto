import argparse
import json
import os
import sys

# Ensure UTF-8 output on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Add module paths
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from core.pipeline import ManimStudioPipeline
except ImportError:
    from manim_studio.core.pipeline import ManimStudioPipeline

def main():
    parser = argparse.ArgumentParser(description="Manim Studio CLI: Generate programmatic videos from JSON data")
    parser.add_argument("--input", "-i", "--file", "-f", dest="input", type=str, help="Path to input JSON file")
    parser.add_argument("--preset", "-p", type=str, help="Built-in preset name (e.g. gpu, black_hole, llm, quantum)")
    args = parser.parse_args()

    input_file = args.input
    if args.preset:
        preset_clean = args.preset.replace("preset_", "").replace(".json", "")
        preset_path = os.path.join(os.path.dirname(__file__), "presets", f"preset_{preset_clean}.json")
        if os.path.exists(preset_path):
            input_file = preset_path
        else:
            print(f"[Error] Preset '{args.preset}' not found in {os.path.dirname(__file__)}/presets")
            sys.exit(1)

    if not input_file or not os.path.exists(input_file):
        print("Usage: python cli.py --preset <gpu|black_hole|llm|quantum>  OR  python cli.py --input <path_to_json>")
        sys.exit(1)

    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    print(f"\n==========================================")
    print(f"[MANIM STUDIO] CLI Engine")
    print(f"Project: {data.get('title', 'Untitled')}")
    print(f"Scenes: {len(data.get('scenes', []))}")
    print(f"==========================================\n")

    pipeline = ManimStudioPipeline()
    output_video = pipeline.run(data)

    print(f"\nVideo Render Complete!")
    print(f"Output: {output_video}\n")

if __name__ == "__main__":
    main()
