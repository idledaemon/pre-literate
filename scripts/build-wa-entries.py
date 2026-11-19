#!/usr/bin/env python3
"""Merge all word-atlas entries/*.json into one compact wa-entries.json for frontend."""
import json, glob, os

src_dir = os.path.join(os.path.dirname(__file__), '..', 'public', 'wa-entries')
out_path = os.path.join(os.path.dirname(__file__), '..', 'public', 'wa-entries.json')

entries = {}
for f in sorted(glob.glob(os.path.join(src_dir, '*.json'))):
    batch = json.load(open(f))
    for item in batch:
        w = item['w']
        # 精简：只保留前端需要的字段
        entries[w] = {
            'ipa_us': item.get('us', ''),
            'ipa_uk': item.get('uk', ''),
            'senses': [
                {'pos': s['pos'], 'zh': s['zh']}
                for s in item.get('senses', [])
            ],
            'examples': [
                {'en': e['en'], 'zh': e['zh']}
                for e in item.get('ex', [])
            ],
            'collocations': item.get('col', []),
        }

with open(out_path, 'w', encoding='utf-8') as out:
    json.dump(entries, out, ensure_ascii=False)

print(f'✅ {len(entries)} words → {out_path} ({os.path.getsize(out_path)//1024} KB)')
