import json
from pathlib import Path
r=Path(__file__).resolve().parents[1]
docs_dir = r.parent.parent / 'Docs' if (r.parent.parent / 'Docs').exists() else (r / 'docs')
docs_dir.mkdir(parents=True, exist_ok=True)
c=json.loads((r/'specs/course.cpu.json').read_text(encoding='utf-8'))
shots={
'hero':('CSS 2.5D logo-like 3D chip, glowing circuits, no external images','Slow approach into CPU package; avoid jump cuts'),
'definition':('3 editable DOM word cards, accent typography','Each acronym word gets its own cue highlight'),
'ecosystem':('SVG directional connectors, CSS CPU / RAM / app cards','Show system relationships without implying strict physical wiring'),
'fde':('3 DOM processing cards','Reveal phase focus Fetch → Decode → Execute, with a footnote about overlap'),
'cores':('4 DOM core units with animated task lanes','Use parallel lane animation, not a benchmark simulation'),
'clock':('SVG square waveform and typographic GHz label','Animate cycles at illustrative speed, not literal GHz'),
'board3d':('Native WebGL conceptual board/CPU/RAM geometry; CSS fallback','Slow rotating viewpoint; zoom relative CPU socket; labels remain legible'),
'pipeline':('5 DOM cards with animated flow arrows','Visual ordering explains software steps; actual operations may overlap'),
'chip3d':('Native WebGL functional 3D blocks: registers/cache/execution; CSS fallback','Float layers apart gradually; note this is not a floorplan'),
'memory':('Three layered memory-size relationship cards','Show storage proximity/latency qualitatively, without exact numbers'),
'workloads':('CSS resource-use meters with labeled example apps','Bars show illustrative relative differences, NOT measured scores'),
'buying':('DOM checklist with badges','Highlight one factor at a time, end with total-platform check'),
'recap':('Four animated summary tiles','Short summary and clean end frame')
}
def t(ms): return f'{ms//60000:02d}:{(ms%60000)//1000:02d}.{ms%1000:03d}'
lines=['# Option B / Detailed Scene Production Sheets','',
'**Source**: ZTLE `Hardware/courses/cpu/` approved Part 1/Part 2, GitHub `beta`. These timing values are generated from the actual bundled audio preview. Narration is Roman Hinglish and must be human-reviewed before publication.','',
'Audio is the authoritative clock. Caption sentence timings are approximate in the prototype; production requires aligned final narration and VTT.','']
for s in c['scenes']:
 asset,camera=shots[s['visualTemplate']]
 lines.extend([f"## Scene {s['order']:02d} — {s['title']}", '',
 f"- **ZTLE part / mode**: Part {s['part']} / {s['mode']} (`{s['visualTemplate']}`).",
 f"- **Global timeline**: {t(s['startMs'])} → {t(s['endMs'])}; duration {round(s['durationMs']/1000,1)} seconds.",
 f"- **Visual frame**: {s['headline']}.",f"- **Assets/rendering**: {asset}.",f"- **Shot design**: {camera}.",
 f"- **Audio**: master MP3 track; speech begins at {t(s['narration']['startMs'])} and ends at {t(s['narration']['endMs'])}.",
 f"- **Caption plan**: narrational sentences as bottom-safe subtitles; validate final word/sentence timings later.",
 f"- **Accessibility**: {s['accessibility']['visualDescription']}",'',
 '### Timeline events','', '| At (scene-relative) | Instruction | Target |','|---|---|---|'])
 for cue in s['cues']:
  lines.append(f"| {t(cue['atMs'])} | `{cue['action']}` | {cue['target']} |")
 lines.extend(['','### Approved-content narration (prototype adaptation)','',f"> {s['narration']['text']}",'','**Scene transition**: next scene starts exactly at this scene end time; no overlapping timeline segments.',''])
(docs_dir/'SCENE_PRODUCTION_SHEETS.md').write_text('\n'.join(lines)+'\n', encoding='utf-8')
print('Wrote 13 detailed sheets')
