# ZCLE Scene Schema (Option C)

## Core idea

`course.cpu.json` is timeline data, **not** prerecorded video. Each scene declares its own renderer and narration; the reusable player owns play/pause/seek/captions.

## Fields

- `courseId`, `lessonId`: stable identity, no duplicate course IDs.
- `sourceOfTruth`: approved ZTLE repo, revision and lesson document paths.
- `durationMs`: entire master timeline length.
- `audio.src`: one master MP3; `role = master-clock`. Replace only together with revised timing metadata.
- `scenes[].startMs`, `.endMs`: absolute timeline boundaries, contiguous, no gaps/overlap.
- `scenes[].mode`: 2D / 2.5D / 3D.
- `scenes[].visualTemplate`: renderer scene template key.
- `scenes[].narration.startMs/endMs`: absolute positioning of spoken text within scene.
- `scenes[].cues[].atMs`: relative timestamp from scene start; future implementation may support tween endpoints, easing curves and asset references.
- `scenes[].accessibility.visualDescription`: plain description for screen reader metadata and editorial review.
- `qualityGates`: explicitly declared pass/fail approvals; false values are expected for this demo.

## Example scene fragment

```json
{
  "id": "scene-04",
  "order": 4,
  "part": "01",
  "mode": "2D",
  "visualTemplate": "fde",
  "headline": "Fetch → Decode → Execute",
  "cues": [
    { "id": "enter", "atMs": 0, "action": "reveal", "target": "headline" }
  ]
}
```

The fragment above is illustrative; the real file additionally includes exact timing, narration, accessibility and all required fields.

## Validation

From the project directory: `python tests/validate.py` (requires `jsonschema`). The validator checks structural JSON schema, scene order, contiguous timing, narration bounds and cue bounds.

## Reuse for 30-minute courses

Use multiple modules with several small scenes rather than one giant animation. Compose consecutive parts in the editor, keep narration and scene IDs stable, generate a new master timeline/audio for each export chunk. Reusing scene IDs within different lesson IDs is allowed, but per-lesson IDs must be unique.
