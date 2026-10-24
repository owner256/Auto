import json, sys
from pathlib import Path
from jsonschema import Draft202012Validator
r=Path(__file__).resolve().parents[1]
c=json.loads((r/'specs/course.cpu.json').read_text(encoding='utf-8'))
s=json.loads((r/'specs/zcle.scene.schema.json').read_text(encoding='utf-8'))
errors=sorted(Draft202012Validator(s).iter_errors(c), key=str)
if errors:
    for e in errors: print('SCHEMA FAIL:',e.message, 'at', list(e.absolute_path))
    sys.exit(1)
assert c['scenes'][0]['startMs']==0
assert c['scenes'][-1]['endMs']==c['durationMs']
assert (r/'assets/audio/cpu-narration-preview.mp3').exists()
for i,scene in enumerate(c['scenes']):
    assert scene['endMs']-scene['startMs']==scene['durationMs'], scene['id']
    assert scene['order']==i+1
    if i: assert scene['startMs']==c['scenes'][i-1]['endMs'], scene['id']
    assert scene['startMs']<=scene['narration']['startMs']<scene['narration']['endMs']<=scene['endMs']
    for cue in scene['cues']:
        assert 0<=cue['atMs']<=scene['durationMs']
        assert cue['action']!='highlight' or cue['target'] in scene['labels']
print(f'PASS: JSON Schema + continuity + narration bounds + cues for {len(c["scenes"])} scenes ({c["durationMs"]/1000:.1f}s)')
