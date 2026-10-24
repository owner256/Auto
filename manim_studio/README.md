# 🎬 Manim Studio (v1.0)

> **Data-Driven Programmatic Video Generation Engine**  
> Create high-production mathematical explainer videos (3Blue1Brown style) purely from structured JSON data, neural voiceover, and procedural animation templates.

---

## 🌟 Overview

**Manim Studio** is an automated video production system that decouples content creation from manual animation code. Instead of handcrafting keyframes in video editors or writing hundreds of lines of Python for each scene, you simply supply a JSON descriptor containing the script, data points, and scene types.

The engine takes care of:
1. **Neural Voiceover Generation**: Microsoft Edge Neural TTS synthesizes natural-sounding narration in Hindi, Indian English, or Hinglish.
2. **Audio-Visual Duration Sync**: Visual scenes dynamically calculate audio duration and hold elements synchronously with the narration.
3. **Procedural Manim Scenes**: Builds 3Blue1Brown-quality geometric animations, probability distributions, vector field representations, and architectural flowcharts.
4. **Algorithmic Background Score**: Synthesizes custom ambient background music (SciPy + NumPy) with frequency modulation.
5. **Lossless Video Muxing**: Combines animation stems, voice stems, and ducked background audio into a crisp 1080p 60fps MP4 using FFmpeg.

---

## 🚀 Quick Start

### 1. Prerequisites
Ensure you have the following installed on your system:
- **Python 3.10+** (Python 3.12 / 3.14 compatible)
- **FFmpeg** (added to system PATH)
- **Manim Community Edition** & dependencies (Cairo, Pango)

Install required Python packages:
```bash
pip install -r requirements.txt
```

---

### 2. Launching the Studio Web Dashboard

#### Windows (One-Click)
Double-click `Launch_Manim_Studio.bat` from project root or run:
```bash
python manim_studio/server.py
```
Open your browser and navigate to:
```
http://localhost:8585
```

Features of the Web Dashboard:
- Preset selector (GPU Architecture, Black Holes, Large Language Models, Quantum Computing).
- Visual scene configurator and script editor.
- Live streaming build logs via WebSocket.
- In-browser video player with direct MP4 download link.

---

### 3. Headless CLI Mode

Render any video directly from terminal without launching the browser UI:

```bash
# Render GPU Architecture video
python manim_studio/cli.py --preset gpu

# Render Black Hole video
python manim_studio/cli.py --preset black_hole

# Render Large Language Models explainer
python manim_studio/cli.py --preset llm

# Render Quantum Computing explainer
python manim_studio/cli.py --preset quantum

# Render from custom JSON file
python manim_studio/cli.py --file path/to/my_video.json
```

---

## 📦 Built-in Presets

| Preset | File | Topic Covered |
| :--- | :--- | :--- |
| **GPU Architecture** | `preset_gpu.json` | CPU vs GPU, SIMD, Tensor Cores, Matrix Multiply |
| **Black Holes** | `preset_black_hole.json` | Gravitational collapse, Event Horizon, Singularity |
| **Large Language Models** | `preset_llm.json` | Next-token prediction, High-dimensional embeddings, Attention |
| **Quantum Computing** | `preset_quantum.json` | Qubits, Superposition, Entanglement, Quantum Supremacy |

---

## 🛠️ Data-Driven JSON Schema

Create your own explainer video in minutes by defining a JSON file:

```json
{
  "id": "project_my_topic",
  "title": "My Awesome Video",
  "ratio": "16:9",
  "voice": "hinglish_male",
  "theme": {
    "background": "#080e18"
  },
  "scenes": [
    {
      "type": "title_intro",
      "title": "Introduction Title",
      "subtitle": "A compelling subtitle",
      "prompt": "What is the core question being answered?",
      "tag": "Key Category",
      "voice": "Voiceover text in Hindi or English to be spoken during this scene."
    },
    {
      "type": "prob_distribution",
      "header": "Comparative Metrics",
      "tokens": ["Step A", "->", "Step B"],
      "items": [
        {"word": "Metric 1", "prob": 0.85},
        {"word": "Metric 2", "prob": 0.15}
      ],
      "sampled": "Metric 1",
      "voice": "Narration explaining the metrics and probabilities."
    },
    {
      "type": "vector_embeddings",
      "header": "Multi-Dimensional Space",
      "context": "Feature Vector Clustering",
      "main_word": "Concept A",
      "attractor": "Concept B",
      "voice": "Narration describing spatial relationships and representations."
    },
    {
      "type": "feedback_loop",
      "header": "Architecture & Optimization",
      "step": "Input -> Hidden States -> Dense Layers",
      "scale": "Petascale Performance",
      "voice": "Explaining how iterative cycles and transformations work."
    },
    {
      "type": "quote_conclusion",
      "title": "Final Summary Statement",
      "quote": "A memorable concluding quote.",
      "tag": "Manim Studio Production",
      "voice": "Closing takeaway and sign-off."
    }
  ]
}
```

---

## 📂 Architecture

```
manim_studio/
├── cli.py                      # Headless command-line interface
├── server.py                   # Async HTTP & API server
├── requirements.txt            # Python dependencies
├── core/
│   ├── audio.py                # Neural TTS and procedural BGM generator
│   ├── pipeline.py             # Orchestrator (TTS -> Manim -> FFmpeg Mux)
│   └── templates.py            # Manim procedural scene definitions
├── presets/
│   ├── preset_gpu.json         # GPU architecture preset
│   ├── preset_black_hole.json  # Black hole astrophysics preset
│   ├── preset_llm.json         # Large language models preset
│   └── preset_quantum.json     # Quantum computing preset
└── web/
    ├── index.html              # Studio dashboard UI
    ├── style.css               # Dark modern theme styling
    └── app.js                  # Frontend state & realtime renderer logs
```

---

## 🧭 Roadmap

- [x] **v1.0 (Current)**: Data-Driven Engine (JSON specification, Neural TTS voice sync, SciPy ambient score, local web dashboard & CLI).
- [ ] **v2.0 (Planned)**: Autonomous AI Mode (Topic prompt -> LLM scene script planner -> Automatic JSON generation -> Zero-touch 4K video rendering).
