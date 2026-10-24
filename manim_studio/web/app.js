let currentProject = {};
let presetsList = [];
let voicesList = {};
let ws = null;
let currentTab = "cards";

document.addEventListener("DOMContentLoaded", async () => {
    connectWebSocket();
    await loadPresetsAndVoices();
    setupEventListeners();
});

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

        // Populate presets dropdown
        const presetSelect = document.getElementById("preset-select");
        presetSelect.innerHTML = '<option value="">-- Choose a Preset --</option>';
        presetsList.forEach((p, idx) => {
            const opt = document.createElement("option");
            opt.value = idx;
            opt.innerText = p.title;
            presetSelect.appendChild(opt);
        });

        // Populate voice dropdown
        const voiceSelect = document.getElementById("voice-select");
        voiceSelect.innerHTML = "";
        for (const [key, val] of Object.entries(voicesList)) {
            const opt = document.createElement("option");
            opt.value = key;
            opt.innerText = val.name;
            voiceSelect.appendChild(opt);
        }

        // Load first preset by default
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
    } else {
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

    document.getElementById("tab-cards").addEventListener("click", () => {
        syncProjectFromForm();
        currentTab = "cards";
        document.getElementById("tab-cards").classList.add("active");
        document.getElementById("tab-json").classList.remove("active");
        document.getElementById("scenes-list").style.display = "flex";
        document.getElementById("json-editor").style.display = "none";
        renderSceneCards();
    });

    document.getElementById("tab-json").addEventListener("click", () => {
        syncProjectFromForm();
        currentTab = "json";
        document.getElementById("tab-json").classList.add("active");
        document.getElementById("tab-cards").classList.remove("active");
        document.getElementById("scenes-list").style.display = "none";
        document.getElementById("json-editor").style.display = "block";
    });

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
            a.download = "ManimStudio_Video.mp4";
            a.click();
        }
    });
}

function logTerminal(text) {
    const term = document.getElementById("terminal");
    term.innerText += text + "\n";
    term.scrollTop = term.scrollHeight;
}

