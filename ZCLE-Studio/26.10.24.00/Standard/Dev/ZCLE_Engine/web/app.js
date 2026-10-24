let currentProject = {};
let presetsList = [];
let voicesList = {};
let ws = null;
let currentTab = "2file";

const DEFAULT_NARRATION = 
`Imagine space as a flat elastic fabric. When a massive star collapses into a black hole, spacetime itself curves infinitely downward. Around this point of no return lies the event horizon. Even light rays of photons are pulled into the singularity.`;

const DEFAULT_DIRECTOR_JSON = {
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
      "parameters": {
        "funnel_depth": -3.5
      }
    },
    {
      "scene_id": 3,
      "cue_phrase": "lies the event horizon",
      "visual_primitive": "event_horizon_sphere",
      "action": "SPAWN_BLACK_SPHERE",
      "parameters": {
        "radius": 1.4,
        "glow_color": "#FF8C00"
      }
    },
    {
      "scene_id": 4,
      "cue_phrase": "Even light rays of photons are pulled",
      "visual_primitive": "geodesic_photon_beam",
      "action": "BEND_LIGHT",
      "parameters": {
        "ray_color": "#00FFFF"
      }
    }
  ]
};

const DIRECTOR_SYSTEM_PROMPT = 
`You are the Executive Animation Director for ZCLE Studio (a 3Blue1Brown-style programmatic video engine powered by Manim).
Given the narration text, output a strict JSON conforming to ZCLE Director Schema.
Rules:
1. Every scene must have a 'cue_phrase' matching the narration text verbatim.
2. Visual primitives available:
   - Space: spacetime_grid, event_horizon_sphere, geodesic_photon_beam
   - Silicon: silicon_die, logic_gate_circuit, clock_square_wave
   - AI/Data: neural_slab_3d, token_vector_column, probability_bar_chart
3. Output ONLY valid JSON:
{
  "topic": "<TOPIC_NAME>",
  "category": "astrophysics | computing | neural_ai | math_analysis",
  "voice": "en-US-ChristopherNeural",
  "scenes": [
    {
      "scene_id": 1,
      "cue_phrase": "<EXACT_PHRASE>",
      "visual_primitive": "<PRIMITIVE>",
      "action": "<ACTION>",
      "parameters": {}
    }
  ]
}`;

document.addEventListener("DOMContentLoaded", async () => {
    connectWebSocket();
    await loadPresetsAndVoices();
    init2FileDefaults();
    setupEventListeners();
});

function init2FileDefaults() {
    const f1 = document.getElementById("file1-narration");
    const f2 = document.getElementById("file2-director");
    if (f1 && !f1.value) f1.value = DEFAULT_NARRATION;
    if (f2 && !f2.value) f2.value = JSON.stringify(DEFAULT_DIRECTOR_JSON, null, 2);
}

function connectWebSocket() {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

    ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.message) {
            logTerminal(msg.message);
        }
        if (msg.percent !== undefined && msg.percent !== null) {
            document.getElementById("progress-fill").style.width = `${msg.percent}%`;
            document.getElementById("status-text").innerText = `${msg.percent}% - ${msg.message}`;
        }
    };

    ws.onclose = () => {
        setTimeout(connectWebSocket, 2000);
    };
}

async function loadPresetsAndVoices() {
    try {
        const res = await fetch("/api/presets");
        const data = await res.json();
        presetsList = data.presets || [];
        voicesList = data.voices || {};

        const presetSelect = document.getElementById("preset-select");
        presetSelect.innerHTML = '<option value="">-- Choose a Preset --</option>';
        presetsList.forEach((p, idx) => {
            const opt = document.createElement("option");
            opt.value = idx;
            opt.innerText = p.title;
            presetSelect.appendChild(opt);
        });

        const voiceSelect = document.getElementById("voice-select");
        voiceSelect.innerHTML = "";
        for (const [key, val] of Object.entries(voicesList)) {
            const opt = document.createElement("option");
            opt.value = key;
            opt.innerText = val.name;
            voiceSelect.appendChild(opt);
        }

        if (presetsList.length > 0) {
            presetSelect.value = 0;
            loadPreset(0);
        }
    } catch (e) {
        logTerminal("Error loading presets: " + e.message);
    }
}

function loadPreset(idx) {
    if (presetsList[idx]) {
        currentProject = JSON.parse(JSON.stringify(presetsList[idx].data));
        syncFormToProject();
    }
}

function syncFormToProject() {
    document.getElementById("proj-title").value = currentProject.title || "";
    document.getElementById("ratio-select").value = currentProject.ratio || "16:9";
    document.getElementById("voice-select").value = currentProject.voice || "hinglish_male";
    document.getElementById("json-editor").value = JSON.stringify(currentProject, null, 2);
    renderSceneCards();
}

function syncProjectFromForm() {
    if (currentTab === "json") {
        try {
            currentProject = JSON.parse(document.getElementById("json-editor").value);
        } catch (e) {
            alert("Invalid JSON format!");
            return false;
        }
    } else if (currentTab === "cards") {
        currentProject.title = document.getElementById("proj-title").value;
        currentProject.ratio = document.getElementById("ratio-select").value;
        currentProject.voice = document.getElementById("voice-select").value;
        document.getElementById("json-editor").value = JSON.stringify(currentProject, null, 2);
    }
    return true;
}

function renderSceneCards() {
    const list = document.getElementById("scenes-list");
    list.innerHTML = "";
    const scenes = currentProject.scenes || [];

    scenes.forEach((sc, idx) => {
        const card = document.createElement("div");
        card.className = "scene-card";
        card.innerHTML = `
            <div class="scene-card-header">
                <span>Scene ${idx + 1}: ${sc.type}</span>
                <button class="del-btn" onclick="removeScene(${idx})">×</button>
            </div>
            <div class="field">
                <label>Header / Title</label>
                <input type="text" value="${sc.title || sc.header || ''}" onchange="updateScene(${idx}, 'title', this.value)">
            </div>
            <div class="field">
                <label>Voiceover Script (Speech)</label>
                <textarea rows="2" onchange="updateScene(${idx}, 'voice', this.value)">${sc.voice || ''}</textarea>
            </div>
        `;
        list.appendChild(card);
    });
}

window.updateScene = (idx, key, val) => {
    if (currentProject.scenes && currentProject.scenes[idx]) {
        currentProject.scenes[idx][key] = val;
        document.getElementById("json-editor").value = JSON.stringify(currentProject, null, 2);
    }
};

window.removeScene = (idx) => {
    if (currentProject.scenes) {
        currentProject.scenes.splice(idx, 1);
        renderSceneCards();
        document.getElementById("json-editor").value = JSON.stringify(currentProject, null, 2);
    }
};

function setupEventListeners() {
    document.getElementById("preset-select").addEventListener("change", (e) => {
        if (e.target.value !== "") {
            loadPreset(parseInt(e.target.value));
        }
    });

    const tab2file = document.getElementById("tab-2file");
    const tabCards = document.getElementById("tab-cards");
    const tabJson = document.getElementById("tab-json");

    const v2file = document.getElementById("view-2file");
    const vCards = document.getElementById("scenes-list");
    const vJson = document.getElementById("json-editor");
    const btnGenLegacy = document.getElementById("btn-generate");

    if (tab2file) {
        tab2file.addEventListener("click", () => {
            currentTab = "2file";
            tab2file.classList.add("active");
            tabCards.classList.remove("active");
            tabJson.classList.remove("active");

            v2file.style.display = "block";
            vCards.style.display = "none";
            vJson.style.display = "none";
            btnGenLegacy.style.display = "none";
        });
    }

    tabCards.addEventListener("click", () => {
        syncProjectFromForm();
        currentTab = "cards";
        tabCards.classList.add("active");
        if (tab2file) tab2file.classList.remove("active");
        tabJson.classList.remove("active");

        if (v2file) v2file.style.display = "none";
        vCards.style.display = "flex";
        vJson.style.display = "none";
        btnGenLegacy.style.display = "block";
        renderSceneCards();
    });

    tabJson.addEventListener("click", () => {
        syncProjectFromForm();
        currentTab = "json";
        tabJson.classList.add("active");
        if (tab2file) tab2file.classList.remove("active");
        tabCards.classList.remove("active");

        if (v2file) v2file.style.display = "none";
        vCards.style.display = "none";
        vJson.style.display = "block";
        btnGenLegacy.style.display = "block";
    });

    const btnCopyPrompt = document.getElementById("btn-copy-prompt");
    if (btnCopyPrompt) {
        btnCopyPrompt.addEventListener("click", () => {
            navigator.clipboard.writeText(DIRECTOR_SYSTEM_PROMPT);
            btnCopyPrompt.innerText = "✅ Prompt Copied!";
            setTimeout(() => { btnCopyPrompt.innerText = "📋 Copy ChatGPT / Gemini Prompt"; }, 2500);
        });
    }

    const btnRender2File = document.getElementById("btn-render-2file");
    if (btnRender2File) {
        btnRender2File.addEventListener("click", async () => {
            const narration = document.getElementById("file1-narration").value.trim();
            const directorStr = document.getElementById("file2-director").value.trim();

            if (!narration) {
                alert("Please enter narration text in File 1!");
                return;
            }

            let directorJson;
            try {
                directorJson = JSON.parse(directorStr);
            } catch (err) {
                alert("Invalid JSON in File 2 (Director Data)!");
                return;
            }

            btnRender2File.disabled = true;
            btnRender2File.innerText = "⏳ Synthesizing Audio & Rendering Manim...";
            logTerminal("\n🚀 Starting 2-File Synchronization Pipeline...");
            logTerminal(`[Speech] Synthesizing narration text with Edge-TTS...`);
            logTerminal(`[Director] Matching ${directorJson.scenes ? directorJson.scenes.length : 0} visual cue anchors to speech timestamps...`);

            try {
                const res = await fetch("/api/render-2file", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        narration_text: narration,
                        director_json: directorJson
                    })
                });

                const data = await res.json();
                if (data.success) {
                    logTerminal("✅ Render Succeeded! Video + Audio 100% Locked.");
                    if (data.timestamps) {
                        logTerminal("🎯 Calibrated Speech Timestamps:");
                        data.timestamps.forEach(ts => {
                            logTerminal(`   • [${ts.start}s -> ${ts.end}s] ${ts.sentence}`);
                        });
                    }

                    const player = document.getElementById("main-player");
                    player.src = data.video_url;
                    player.style.display = "block";
                    player.play();

                    document.getElementById("player-placeholder").style.display = "none";
                    document.getElementById("player-actions").style.display = "flex";
                    window.lastRenderedPath = data.video_url;
                } else {
                    logTerminal("❌ Render Failed: " + (data.error || "Unknown error"));
                    alert("Rendering Error: " + data.error);
                }
            } catch (e) {
                logTerminal("❌ Server Communication Error: " + e.message);
            } finally {
                btnRender2File.disabled = false;
                btnRender2File.innerText = "⚡ RENDER 2-FILE SYNCHRONIZED VIDEO";
            }
        });
    }

    document.getElementById("btn-generate").addEventListener("click", async () => {
        if (!syncProjectFromForm()) return;
        const btn = document.getElementById("btn-generate");
        btn.disabled = true;
        btn.innerText = "⏳ Rendering Video...";
        logTerminal("\n🎬 Starting new render job in Manim Studio...");

        try {
            const res = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(currentProject)
            });
            const result = await res.json();

            if (result.status === "success") {
                logTerminal("✅ Video Rendered Successfully!");
                const player = document.getElementById("main-player");
                player.src = result.video_url;
                player.style.display = "block";
                player.play();

                document.getElementById("player-placeholder").style.display = "none";
                document.getElementById("player-actions").style.display = "flex";
                window.lastRenderedPath = result.absolute_path;
            } else {
                logTerminal("❌ Error: " + result.message);
                alert("Rendering failed: " + result.message);
            }
        } catch (e) {
            logTerminal("❌ Network/Server Error: " + e.message);
        } finally {
            btn.disabled = false;
            btn.innerText = "🎬 GENERATE VIDEO";
        }
    });

    document.getElementById("btn-explorer").addEventListener("click", async () => {
        if (window.lastRenderedPath) {
            await fetch("/api/open_explorer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ path: window.lastRenderedPath })
            });
        }
    });

    document.getElementById("btn-download").addEventListener("click", () => {
        const player = document.getElementById("main-player");
        if (player.src) {
            const a = document.createElement("a");
            a.href = player.src;
            a.download = "ZCLE_Synced_Video.mp4";
            a.click();
        }
    });
}

function logTerminal(text) {
    const term = document.getElementById("terminal");
    if (term) {
        term.innerText += text + "\n";
        term.scrollTop = term.scrollHeight;
    }
}
