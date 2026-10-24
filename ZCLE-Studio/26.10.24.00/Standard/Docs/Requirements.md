# Docs / Requirements.md — System & Functional Specifications

**Package:** ZCLE Studio (`26.10.24.00/Standard`)

---

## 1. Functional Requirements

1. **Deterministic Seekable Playback:**
   - User kisi bhi timestamp par scrubber drag kare ya scene pills click kare, video usi frame par instantly render hona chahiye.
2. **Audio-Synchronous Narration:**
   - Audio master timeline frame accurate honi chahiye. Audio pause hone par visuals pause honge; audio resume hone par visuals sync mein chalenge.
3. **Multi-Mode Scene Support:**
   - **2D Scenes:** Dynamic charts, flow arrows, text breakdown cards.
   - **2.5D Scenes:** Parallax depth illusion, card rotation, and glowing accents.
   - **3D Scenes:** Real-time WebGL geometry (procedural motherboard, multi-core CPU die, rotating camera).
4. **Playback Speed Controls:**
   - 0.75x, 1.0x, 1.25x, 1.5x speed options jo audio pitch aur animation runtimes ko uniformly scale karein.
5. **Interactive Controls & Accessibility:**
   - Keyboard shortcuts: `Space` (Play/Pause), `Left Arrow` (-5s), `Right Arrow` (+5s), `F` (Fullscreen), `M` (Mute).
   - High-contrast subtitles and clean typography.

---

## 2. Non-Functional Requirements

1. **Zero Runtime Dependencies:**
   - Pure HTML, CSS, JavaScript (Vanilla ES6+). No npm build step required for end-user playback.
2. **Offline Resilience:**
   - Must run locally under `file:///` protocol without throwing CORS security exceptions.
3. **Performance Target:**
   - Sustained 60 FPS on standard modern integrated GPUs (Intel Iris Xe, Apple Silicon, AMD Radeon Vega).

