# Option B / Detailed Scene Production Sheets

**Source**: ZTLE `Hardware/courses/cpu/` approved Part 1/Part 2, GitHub `beta`. These timing values are generated from the actual bundled audio preview. Narration is Roman Hinglish and must be human-reviewed before publication.

Audio is the authoritative clock. Caption sentence timings are approximate in the prototype; production requires aligned final narration and VTT.

## Scene 01 — What is CPU?

- **ZTLE part / mode**: Part 01 / 2.5D (`hero`).
- **Global timeline**: 00:00.000 → 00:23.564; duration 23.6 seconds.
- **Visual frame**: Inside the computer.
- **Assets/rendering**: CSS 2.5D logo-like 3D chip, glowing circuits, no external images.
- **Shot design**: Slow approach into CPU package; avoid jump cuts.
- **Audio**: master MP3 track; speech begins at 00:00.700 and ends at 00:22.564.
- **Caption plan**: narrational sentences as bottom-safe subtitles; validate final word/sentence timings later.
- **Accessibility**: Stylized CPU package with animated concentric circuitry.

### Timeline events

| At (scene-relative) | Instruction | Target |
|---|---|---|
| 00:00.000 | `reveal` | headline |
| 00:05.891 | `highlight` | Execute instructions |
| 00:12.725 | `highlight` | Run applications |
| 00:19.558 | `highlight` | Control tasks |

### Approved-content narration (prototype adaptation)

> Aaj hum CPU ko samjhenge: ye kya hai, instructions kaise process karta hai, aur computer ki performance mein iska role kya hota hai. Ek simple example se shuru karte hain: jab aap browser open karte hain, background mein CPU program instructions execute karta hai.

**Scene transition**: next scene starts exactly at this scene end time; no overlapping timeline segments.

## Scene 02 — CPU ka full form

- **ZTLE part / mode**: Part 01 / 2D (`definition`).
- **Global timeline**: 00:23.564 → 00:45.346; duration 21.8 seconds.
- **Visual frame**: Central Processing Unit.
- **Assets/rendering**: 3 editable DOM word cards, accent typography.
- **Shot design**: Each acronym word gets its own cue highlight.
- **Audio**: master MP3 track; speech begins at 00:24.264 and ends at 00:44.346.
- **Caption plan**: narrational sentences as bottom-safe subtitles; validate final word/sentence timings later.
- **Accessibility**: Animated three-part CPU acronym and explanatory cards.

### Timeline events

| At (scene-relative) | Instruction | Target |
|---|---|---|
| 00:00.000 | `reveal` | headline |
| 00:05.446 | `highlight` | Central |
| 00:11.762 | `highlight` | Processing |
| 00:18.079 | `highlight` | Unit |

### Approved-content narration (prototype adaptation)

> CPU ka full form hai Central Processing Unit. Ye computer ka general purpose processing component hai. Operating system, applications aur calculations ke bahut se instructions CPU par execute hote hain. Lekin CPU akela poora computer nahi hai.

**Scene transition**: next scene starts exactly at this scene end time; no overlapping timeline segments.

## Scene 03 — CPU akela nahi kaam karta

- **ZTLE part / mode**: Part 01 / 2D (`ecosystem`).
- **Global timeline**: 00:45.346 → 01:07.816; duration 22.5 seconds.
- **Visual frame**: One component. One system..
- **Assets/rendering**: SVG directional connectors, CSS CPU / RAM / app cards.
- **Shot design**: Show system relationships without implying strict physical wiring.
- **Audio**: master MP3 track; speech begins at 00:46.046 and ends at 01:06.816.
- **Caption plan**: narrational sentences as bottom-safe subtitles; validate final word/sentence timings later.
- **Accessibility**: CPU at center connected to applications memory and storage.

### Timeline events

| At (scene-relative) | Instruction | Target |
|---|---|---|
| 00:00.000 | `reveal` | headline |
| 00:05.618 | `highlight` | Applications |
| 00:09.962 | `highlight` | CPU |
| 00:14.306 | `highlight` | RAM |
| 00:18.650 | `highlight` | Storage |

### Approved-content narration (prototype adaptation)

> CPU ko computer ka brain kehna popular shortcut hai. Technically, computing mein RAM, storage, input output aur software sab milkar kaam karte hain. CPU instructions execute karta hai, jabki baaki components data aur services available karvate hain.

**Scene transition**: next scene starts exactly at this scene end time; no overlapping timeline segments.

## Scene 04 — Fetch Decode Execute

- **ZTLE part / mode**: Part 01 / 2D (`fde`).
- **Global timeline**: 01:07.816 → 01:31.998; duration 24.2 seconds.
- **Visual frame**: Fetch → Decode → Execute.
- **Assets/rendering**: 3 DOM processing cards.
- **Shot design**: Reveal phase focus Fetch → Decode → Execute, with a footnote about overlap.
- **Audio**: master MP3 track; speech begins at 01:08.516 and ends at 01:30.997.
- **Caption plan**: narrational sentences as bottom-safe subtitles; validate final word/sentence timings later.
- **Accessibility**: Instruction cards travel across three animated processing phases.

### Timeline events

| At (scene-relative) | Instruction | Target |
|---|---|---|
| 00:00.000 | `reveal` | headline |
| 00:06.046 | `highlight` | 01 Fetch |
| 00:13.058 | `highlight` | 02 Decode |
| 00:20.071 | `highlight` | 03 Execute |

### Approved-content narration (prototype adaptation)

> CPU ki basic working samajhne ke liye fetch, decode aur execute model useful hai. Fetch mein instruction li jaati hai. Decode mein operation samjha jaata hai. Execute mein required calculation ya action perform hota hai. Real processors mein pipeline aur overlap bhi hote hain.

**Scene transition**: next scene starts exactly at this scene end time; no overlapping timeline segments.

## Scene 05 — Cores aur threads

- **ZTLE part / mode**: Part 01 / 2D (`cores`).
- **Global timeline**: 01:31.998 → 01:54.898; duration 22.9 seconds.
- **Visual frame**: Cores ≠ Threads.
- **Assets/rendering**: 4 DOM core units with animated task lanes.
- **Shot design**: Use parallel lane animation, not a benchmark simulation.
- **Audio**: master MP3 track; speech begins at 01:32.698 and ends at 01:53.898.
- **Caption plan**: narrational sentences as bottom-safe subtitles; validate final word/sentence timings later.
- **Accessibility**: Animation comparing four physical cores with logical task lanes.

### Timeline events

| At (scene-relative) | Instruction | Target |
|---|---|---|
| 00:00.000 | `reveal` | headline |
| 00:05.725 | `highlight` | Physical cores |
| 00:12.366 | `highlight` | Hardware threads |
| 00:19.007 | `highlight` | Shared resources |

### Approved-content narration (prototype adaptation)

> Core ek independent execution capability wala processing unit hai. Suitable workloads mein multiple cores parallel kaam kar sakte hain. Hardware threads ek core ke resources share kar sakte hain. Isliye do threads ko do complete physical cores ke barabar nahi samajhna chahiye.

**Scene transition**: next scene starts exactly at this scene end time; no overlapping timeline segments.

## Scene 06 — Clock speed ka sach

- **ZTLE part / mode**: Part 01 / 2D (`clock`).
- **Global timeline**: 01:54.898 → 02:18.041; duration 23.1 seconds.
- **Visual frame**: GHz is not the whole story.
- **Assets/rendering**: SVG square waveform and typographic GHz label.
- **Shot design**: Animate cycles at illustrative speed, not literal GHz.
- **Audio**: master MP3 track; speech begins at 01:55.598 and ends at 02:17.041.
- **Caption plan**: narrational sentences as bottom-safe subtitles; validate final word/sentence timings later.
- **Accessibility**: Animated waveform and clock pulses with GHz caveat.

### Timeline events

| At (scene-relative) | Instruction | Target |
|---|---|---|
| 00:00.000 | `reveal` | headline |
| 00:05.786 | `highlight` | Clock cycles |
| 00:12.497 | `highlight` | Architecture |
| 00:19.209 | `highlight` | Thermal limits |

### Approved-content narration (prototype adaptation)

> CPU clock frequency cycles per second dikhati hai. Ek gigahertz ka matlab roughly ek billion clock cycles per second hai. Lekin higher gigahertz se har application mein better performance guaranteed nahi hoti. Architecture, cache, workload aur thermal limits bhi matter karte hain.

**Scene transition**: next scene starts exactly at this scene end time; no overlapping timeline segments.

## Scene 07 — Motherboard par CPU

- **ZTLE part / mode**: Part 02 / 3D (`board3d`).
- **Global timeline**: 02:18.041 → 02:40.282; duration 22.2 seconds.
- **Visual frame**: CPU on the motherboard.
- **Assets/rendering**: Native WebGL conceptual board/CPU/RAM geometry; CSS fallback.
- **Shot design**: Slow rotating viewpoint; zoom relative CPU socket; labels remain legible.
- **Audio**: master MP3 track; speech begins at 02:18.741 and ends at 02:39.282.
- **Caption plan**: narrational sentences as bottom-safe subtitles; validate final word/sentence timings later.
- **Accessibility**: Rotating WebGL conceptual motherboard and CPU placement with labeled overlays.

### Timeline events

| At (scene-relative) | Instruction | Target |
|---|---|---|
| 00:00.000 | `reveal` | headline |
| 00:05.560 | `highlight` | CPU Socket |
| 00:12.010 | `highlight` | Memory |
| 00:18.460 | `highlight` | Mainboard |

### Approved-content narration (prototype adaptation)

> Ye ek conceptual three dimensional motherboard view hai. CPU motherboard ke socket mein fit hota hai. Motherboard memory, expansion devices aur power delivery se connection provide karti hai. Exact layout computer aur motherboard model ke hisaab se alag ho sakta hai.

**Scene transition**: next scene starts exactly at this scene end time; no overlapping timeline segments.

## Scene 08 — Application se output tak

- **ZTLE part / mode**: Part 02 / 2D (`pipeline`).
- **Global timeline**: 02:40.282 → 03:02.513; duration 22.2 seconds.
- **Visual frame**: From click to result.
- **Assets/rendering**: 5 DOM cards with animated flow arrows.
- **Shot design**: Visual ordering explains software steps; actual operations may overlap.
- **Audio**: master MP3 track; speech begins at 02:40.982 and ends at 03:01.513.
- **Caption plan**: narrational sentences as bottom-safe subtitles; validate final word/sentence timings later.
- **Accessibility**: Animated app to scheduler to CPU to memory and output pipeline.

### Timeline events

| At (scene-relative) | Instruction | Target |
|---|---|---|
| 00:00.000 | `reveal` | headline |
| 00:05.558 | `highlight` | App |
| 00:08.781 | `highlight` | OS |
| 00:12.005 | `highlight` | CPU |
| 00:15.228 | `highlight` | Memory |
| 00:18.452 | `highlight` | Output |

### Approved-content narration (prototype adaptation)

> Jab aap application open karte hain, operating system CPU ko runnable work schedule kar sakta hai. CPU instructions execute karta hai aur zaroori data RAM ya storage se mil sakta hai. Result display, network ya kisi doosre output tak pahunch sakta hai.

**Scene transition**: next scene starts exactly at this scene end time; no overlapping timeline segments.

## Scene 09 — Registers aur cache

- **ZTLE part / mode**: Part 02 / 3D (`chip3d`).
- **Global timeline**: 03:02.513 → 03:30.203; duration 27.7 seconds.
- **Visual frame**: Inside the processing model.
- **Assets/rendering**: Native WebGL functional 3D blocks: registers/cache/execution; CSS fallback.
- **Shot design**: Float layers apart gradually; note this is not a floorplan.
- **Audio**: master MP3 track; speech begins at 03:03.213 and ends at 03:29.203.
- **Caption plan**: narrational sentences as bottom-safe subtitles; validate final word/sentence timings later.
- **Accessibility**: WebGL layered conceptual CPU functional blocks; not an actual die floorplan.

### Timeline events

| At (scene-relative) | Instruction | Target |
|---|---|---|
| 00:00.000 | `reveal` | headline |
| 00:06.922 | `highlight` | Registers |
| 00:14.953 | `highlight` | Cache |
| 00:22.983 | `highlight` | Execution |

### Approved-content narration (prototype adaptation)

> CPU ke andar registers bahut fast working values rakhte hain. Cache frequently needed instructions aur data ko processor ke kareeb rakhti hai. CPU instructions execute karta hai aur ismein temporary values aur data access important hote hain. Screen par blocks conceptual map hain, physical layout ki exact representation nahi.

**Scene transition**: next scene starts exactly at this scene end time; no overlapping timeline segments.

## Scene 10 — Registers Cache RAM

- **ZTLE part / mode**: Part 02 / 2D (`memory`).
- **Global timeline**: 03:30.203 → 03:56.587; duration 26.4 seconds.
- **Visual frame**: Memory hierarchy matters.
- **Assets/rendering**: Three layered memory-size relationship cards.
- **Shot design**: Show storage proximity/latency qualitatively, without exact numbers.
- **Audio**: master MP3 track; speech begins at 03:30.903 and ends at 03:55.587.
- **Caption plan**: narrational sentences as bottom-safe subtitles; validate final word/sentence timings later.
- **Accessibility**: Nested memory hierarchy boxes and arrows; schematic, no absolute speed promises.

### Timeline events

| At (scene-relative) | Instruction | Target |
|---|---|---|
| 00:00.000 | `reveal` | headline |
| 00:06.596 | `highlight` | Registers |
| 00:14.247 | `highlight` | Cache |
| 00:21.899 | `highlight` | RAM |

### Approved-content narration (prototype adaptation)

> CPU ko baar baar instructions aur data chahiye hota hai. Registers chhote aur fast hote hain. Cache nearby data access ka wait kam kar sakti hai. RAM ki capacity relatively zyada hoti hai, lekin access characteristics alag hote hain. Data access bottleneck overall speed ko affect kar sakta hai.

**Scene transition**: next scene starts exactly at this scene end time; no overlapping timeline segments.

## Scene 11 — Real applications

- **ZTLE part / mode**: Part 02 / 2D (`workloads`).
- **Global timeline**: 03:56.587 → 04:17.703; duration 21.1 seconds.
- **Visual frame**: Different work. Different needs..
- **Assets/rendering**: CSS resource-use meters with labeled example apps.
- **Shot design**: Bars show illustrative relative differences, NOT measured scores.
- **Audio**: master MP3 track; speech begins at 03:57.287 and ends at 04:16.703.
- **Caption plan**: narrational sentences as bottom-safe subtitles; validate final word/sentence timings later.
- **Accessibility**: Workload cards with differing illustrative CPU resource utilization.

### Timeline events

| At (scene-relative) | Instruction | Target |
|---|---|---|
| 00:00.000 | `reveal` | headline |
| 00:05.279 | `highlight` | Office |
| 00:09.361 | `highlight` | Development |
| 00:13.444 | `highlight` | Gaming |
| 00:17.526 | `highlight` | Rendering |

### Approved-content narration (prototype adaptation)

> Office work, programming, gaming, rendering aur servers ka workload alag hota hai. Kisi task ko fast single core chahiye ho sakta hai, aur kisi ko multiple cores. Isliye ek single benchmark se har use case mein best CPU decide nahi hota.

**Scene transition**: next scene starts exactly at this scene end time; no overlapping timeline segments.

## Scene 12 — CPU choose kaise karein?

- **ZTLE part / mode**: Part 02 / 2D (`buying`).
- **Global timeline**: 04:17.703 → 04:41.631; duration 23.9 seconds.
- **Visual frame**: Choose for your workload.
- **Assets/rendering**: DOM checklist with badges.
- **Shot design**: Highlight one factor at a time, end with total-platform check.
- **Audio**: master MP3 track; speech begins at 04:18.403 and ends at 04:40.631.
- **Caption plan**: narrational sentences as bottom-safe subtitles; validate final word/sentence timings later.
- **Accessibility**: Check-list with animated selection rules.

### Timeline events

| At (scene-relative) | Instruction | Target |
|---|---|---|
| 00:00.000 | `reveal` | headline |
| 00:05.982 | `highlight` | Benchmarks |
| 00:10.608 | `highlight` | Compatibility |
| 00:15.234 | `highlight` | Power + Cooling |
| 00:19.860 | `highlight` | Platform Cost |

### Approved-content narration (prototype adaptation)

> CPU select karte waqt apne applications ke benchmarks, core count, per core performance, memory compatibility, power use aur cooling dekhiye. Motherboard socket, support aur total platform cost bhi verify kijiye. Brand ya gigahertz ke basis par akela decision lena reliable nahi hai.

**Scene transition**: next scene starts exactly at this scene end time; no overlapping timeline segments.

## Scene 13 — CPU recap

- **ZTLE part / mode**: Part 02 / 2.5D (`recap`).
- **Global timeline**: 04:41.631 → 05:07.425; duration 25.8 seconds.
- **Visual frame**: Now you understand CPU..
- **Assets/rendering**: Four animated summary tiles.
- **Shot design**: Short summary and clean end frame.
- **Audio**: master MP3 track; speech begins at 04:42.331 and ends at 05:06.425.
- **Caption plan**: narrational sentences as bottom-safe subtitles; validate final word/sentence timings later.
- **Accessibility**: Four short summary cards and end frame.

### Timeline events

| At (scene-relative) | Instruction | Target |
|---|---|---|
| 00:00.000 | `reveal` | headline |
| 00:06.448 | `highlight` | Instructions |
| 00:11.435 | `highlight` | Cores + Threads |
| 00:16.422 | `highlight` | Memory |
| 00:21.409 | `highlight` | Real Workload |

### Approved-content narration (prototype adaptation)

> Aaj humne samjha ki CPU instructions execute karta hai, fetch decode execute ek helpful basic model hai, aur cores, threads, cache, RAM aur clock frequency sab performance ko influence karte hain. Kisi bhi processor ko compare karne se pehle apne real workload aur compatibility ko evaluate kijiye.

**Scene transition**: next scene starts exactly at this scene end time; no overlapping timeline segments.

