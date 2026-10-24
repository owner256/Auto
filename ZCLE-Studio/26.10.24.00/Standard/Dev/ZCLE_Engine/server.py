import asyncio
import os
import sys
import json
import webbrowser
from aiohttp import web

# Add root and module paths
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from core.pipeline import ManimStudioPipeline
    from core.audio import VOICE_OPTIONS
except ImportError:
    from manim_studio.core.pipeline import ManimStudioPipeline
    from manim_studio.core.audio import VOICE_OPTIONS

STUDIO_DIR = os.path.dirname(os.path.abspath(__file__))
WEB_DIR = os.path.join(STUDIO_DIR, "web")
PRESETS_DIR = os.path.join(STUDIO_DIR, "presets")
PROJECTS_DIR = os.path.join(STUDIO_DIR, "projects")
os.makedirs(PROJECTS_DIR, exist_ok=True)
os.makedirs(PRESETS_DIR, exist_ok=True)

ws_clients = set()

async def ws_handler(request):
    ws = web.WebSocketResponse()
    await ws.prepare(request)
    ws_clients.add(ws)
    try:
        async for msg in ws:
            pass
    finally:
        ws_clients.remove(ws)
    return ws

async def broadcast_progress(data):
    for ws in list(ws_clients):
        try:
            await ws.send_json(data)
        except Exception:
            pass

async def api_presets(request):
    presets = []
    if os.path.exists(PRESETS_DIR):
        for f in os.listdir(PRESETS_DIR):
            if f.endswith(".json"):
                with open(os.path.join(PRESETS_DIR, f), "r", encoding="utf-8") as fp:
                    data = json.load(fp)
                    presets.append({"filename": f, "title": data.get("title", f), "data": data})
    return web.json_response({"presets": presets, "voices": VOICE_OPTIONS})

async def api_generate(request):
    try:
        data = await request.json()
        pipeline = ManimStudioPipeline(PROJECTS_DIR)

        def on_progress(p_data):
            asyncio.run_coroutine_threadsafe(broadcast_progress(p_data), loop)

        # Run pipeline in background executor
        loop = asyncio.get_running_loop()
        final_video_path = await loop.run_in_executor(None, pipeline.run, data, on_progress)

        proj_id = data.get("id", os.path.basename(os.path.dirname(final_video_path)))
        video_filename = os.path.basename(final_video_path)

        return web.json_response({
            "status": "success",
            "video_url": f"/projects/{proj_id}/{video_filename}",
            "absolute_path": final_video_path
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return web.json_response({"status": "error", "message": str(e)}, status=500)

async def api_render_2file(request):
    try:
        body = await request.json()
        narration_text = body.get("narration_text", "")
        director_json = body.get("director_json", {})
        project_id = body.get("project_id", f"project_{int(asyncio.get_event_loop().time() * 1000)}")
        
        loop = asyncio.get_event_loop()
        from core.compiler import execute_full_pipeline
        res = await loop.run_in_executor(None, execute_full_pipeline, narration_text, director_json, project_id, STUDIO_DIR)
        
        if res.get("success"):
            video_rel_url = f"/projects/{project_id}/final_synced_video.mp4"
            return web.json_response({
                "success": True,
                "video_url": video_rel_url,
                "project_id": project_id,
                "timestamps": res.get("timestamps", [])
            })
        else:
            return web.json_response({
                "success": False,
                "error": res.get("manim_stderr") or res.get("manim_stdout") or "Render failed"
            }, status=500)
    except Exception as e:
        return web.json_response({"success": False, "error": str(e)}, status=500)

async def api_open_explorer(request):
    data = await request.json()
    path = data.get("path")
    if path and os.path.exists(path):
        os.system(f'explorer.exe /select,"{path}"')
        return web.json_response({"status": "opened"})
    return web.json_response({"status": "failed"}, status=400)

async def index_handler(request):
    return web.FileResponse(os.path.join(WEB_DIR, "index.html"))

async def on_app_started(app):
    await asyncio.sleep(1.0)
    webbrowser.open("http://localhost:8585")

def create_app():
    app = web.Application()
    app.router.add_get("/", index_handler)
    app.router.add_get("/ws", ws_handler)
    app.router.add_get("/api/presets", api_presets)
    app.router.add_post("/api/generate", api_generate)
    app.router.add_post("/api/render-2file", api_render_2file)
    app.router.add_post("/api/open_explorer", api_open_explorer)
    
    # Static files for web assets and generated projects
    app.router.add_static("/static", WEB_DIR)
    app.router.add_static("/projects", PROJECTS_DIR)
    app.on_startup.append(on_app_started)
    return app

if __name__ == "__main__":
    if hasattr(sys.stdout, 'reconfigure'):
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except Exception:
            pass
    port = 8585
    print("\n=======================================================")
    print("MANIM STUDIO v1.0 is starting...")
    print(f"Dashboard URL: http://localhost:{port}")
    print("=======================================================\n")
    
    app = create_app()
    web.run_app(app, host="localhost", port=port)
