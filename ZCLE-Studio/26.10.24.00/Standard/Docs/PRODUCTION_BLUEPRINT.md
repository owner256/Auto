# ZCLE / What is CPU? — Production Blueprint (Option B)

## 1. Vision / Objective

ZTLE ke approved CPU course ko **scene-based, audio-synchronized, code-driven cinematic learning** mein convert karna. Student core concept samjhe; unnecessary dramatic suspense ya text clutter nahi.

**Source of truth**: `ALONE-616/ZTLE` / `beta` / `Hardware/courses/cpu/COURSE_MAP.md`, `part-01-fundamentals.md`, `part-02-working-and-use.md`. 23 October 2026 ko read kiya. Original content Roman Hinglish hai; new technical claims add karne se pehle ZTLE update + source-check karo.

## 2. Approved production mode

- 2D: diagrams, text, flow, numbers, performance comparison.
- 2.5D: hero/title/recap par depth-illusion aur camera-feel.
- 3D: motherboard placement aur CPU functional blocks ko conceptual WebGL structures se samjhana.
- 4D/5D: is project mein separate technical render mode nahi. Audio, depth, interactions collectively immersive feel dete hain.

## 3. Duration

Source text ko artificial filler se stretch nahi karna. Working pilot ka exact duration generated narration ke hisaab se **~5:07** hai. Production final duration professional narration, pauses, visuals aur comprehension tests ke baad decide hogi. 30-minute chapter assembly ko reusable scene composition support karega; 30 minutes abhi implement/export test nahi kiya.

## 4. Design system

- Format 16:9 (1920×1080 master composition target; actual export untested).
- Font: system sans, Inter fallback if installed. Body Roman Hinglish, technical terms exact English.
- Navy / deep blue background, cyan instructional highlights, purple supplementary effects, high-contrast titles.
- Teaching hierarchy: narrate the idea, reveal the relevant part, then summarize one takeaway.
- Audio: -16 LUFS integrated loudness target for future studio mix (not measured/achieved in placeholder preview). Avoid music under dense explanations.
- Accessible UI: captions, keyboard seek/play, readable cards, reduced-motion CSS; caption timing and accessibility require later review.

## 5. Shot list + 13-scene director notes

| Scene | Part | Mode | Animation/camera direction | Narration focus | QA guardrail |
|---|---|---|---|---|---|
| 01 Hook | 01 | 2.5D | Slow animated stylized CPU package; no jump cuts | What CPU does | No fictional story |
| 02 Definition | 01 | 2D | Three acronym cards highlight sequentially | Central Processing Unit | Not sole computer component |
| 03 Computer ecosystem | 01 | 2D | CPU center, applications/RAM/storage/I-O connectors | CPU works with memory/software | Brain analogy labeled simplification |
| 04 Instruction cycle | 01 | 2D | Fetch/Decode/Execute focus cards | Conceptual model | Modern CPU overlaps/pipelines |
| 05 Cores & threads | 01 | 2D | Parallel 4-core cards, threads as shared lanes | Physical vs hardware logical threads | Threads ≠ independent cores |
| 06 Clock speed | 01 | 2D | Running clock waveform | GHz and limitations | Higher GHz ≠ guaranteed faster |
| 07 Motherboard | 02 | 3D | WebGL orbit of procedural board and labeled CPU/RAM | Location and system connections | Schematic, not literal model |
| 08 Application flow | 02 | 2D | Five-step app–OS–CPU–memory–output pipeline | General work scheduling & execution | Not literal sequential timing |
| 09 CPU internal concepts | 02 | 3D | Exploded conceptual 3D blocks: registers/cache/execution | Temporary storage, computation | Not a physical die floorplan |
| 10 Memory hierarchy | 02 | 2D | Register/cache/RAM boxes pulse in sequence | Data access bottlenecks | No fabricated absolute latency |
| 11 Workloads | 02 | 2D | Office/dev/gaming/render cards | Varying single-/multi-core needs | Illustration not benchmark |
| 12 CPU buying | 02 | 2D | Verification checklist reveals | Benchmarks, compatibility, cooling | Do not claim universal winner |
| 13 Recap | 02 | 2.5D | Four recap tiles and clean fade | Learner summary | Short and focused |

**Ordering note**: All ZTLE Part 01 scenes appear before Part 02 scenes. Part 02 starts at scene 07, maintaining clean chapter boundaries.

## 6. Asset contract

- `app/index.html`: responsive player and structural UI.
- `app/styles.css`: 2D/2.5D design system, CSS keyframes.
- `app/scenes.js`: scene render templates, deterministic at `localMs`.
- `app/webgl.js`: real WebGL geometry for scenes 07/09. No third-party dependency.
- `assets/audio/cpu-narration-preview.mp3`: full-length stitched audio master, **robotic TTS placeholder**.
- `specs/course.cpu.json`: course timeline, exact millisecond segments, scene cues, narration, visual modes.
- `specs/zcle.scene.schema.json`: machine-readable data contract.
- `app/course-data.js`: offline embedded copy of course JSON to avoid `file://` fetch blocking.

## 7. Timeline and audio protocol

`audio.currentTime` is master clock → current scene resolved using contiguous `startMs/endMs` → scene renderer samples relative time → SVG/CSS/WebGL updated. Seeking to 02:17 resets scene and animation deterministically. Audio playback rate controls tempo. Frame rendering uses `requestAnimationFrame` but **never adds time itself**. Browser may slightly drift in animations during underpowered frames; the next frame re-samples audio time.

Cue timestamps are relative to scene start. Narration in source JSON is text with start/end absolute ms. Prototype captions split text into approximate sentence segments; **not human-approved precise captions**.

## 8. Production QA gates (NOT passed yet)

- Professional Hinglish recording/TTS pronunciation review; remove synthetic preview voice.
- Word-/sentence-timed VTT captions aligned to approved voice track.
- Review CPU physical visuals for educational accuracy. The 3D prototype is a functional abstraction.
- Verify all facts against ZTLE and approved references.
- Mobile/low-end GPU benchmarks, accessiblity and browser testing.
- Test full 1920×1080/30FPS export, audio loudness, font rendering and no dropped frames.
- Run comprehension testing with actual students before publishing.
- Revalidate intellectual-property and asset licences before external distribution.

## 9. Next production improvement

Replace placeholder MP3 with a polished 5-minute Roman Hinglish narration, rerun alignment so `startMs/endMs` and cues match new audio, adjust chapter ordering by ZTLE part, render a pilot MP4 using a reproducible capture pipeline, then expand other ZTLE hardware/software courses.
