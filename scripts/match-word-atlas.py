#!/usr/bin/env python3
"""Match our kids vocab against word-atlas, copy illustrations + audio."""
import json, os, re, shutil

WA_ROOT = '/tmp/word-atlas'
OUR_ROOT = '/Users/jiandai/work/solo/happy-kids'

# 1. Load word-atlas index
with open(f'{WA_ROOT}/public/atlas/index.json') as f:
    wa = json.load(f)
wa_words = {w[0]: dict(zip(wa['fields'], w)) for w in wa['words']}
print(f"word-atlas 有 {len(wa_words)} 个词")

# 2. Parse our theme files (JS → regex)
def extract_themes(filepath):
    with open(filepath) as f:
        content = f.read()
    themes = []
    theme_pat = re.compile(
        r"id:\s*['\"]([^'\"]+)['\"].*?name:\s*['\"]([^'\"]+)['\"].*?emoji:\s*['\"]([^'\"]+)['\"].*?color:\s*['\"]([^'\"]+)['\"].*?words:\s*\[(.*?)\]",
        re.DOTALL
    )
    for m in theme_pat.finditer(content):
        tid, name, emoji, color, words_block = m.groups()
        words = [wm.group(1) for wm in re.finditer(r"word:\s*['\"]([^'\"]+)['\"]", words_block)]
        themes.append({'id': tid, 'name': name, 'emoji': emoji, 'color': color, 'words': words})
    return themes

all_themes = []
for f in ['themes-basic.js', 'themes-homeschool.js', 'themes-concepts.js']:
    all_themes.extend(extract_themes(f'{OUR_ROOT}/src/data/{f}'))

print(f"我们的主题: {len(all_themes)}")
our_words = set()
for theme in all_themes:
    our_words.update(theme['words'])
print(f"我们的词总数: {len(our_words)}")

# 3. Match
matched = []
unmatched = []
for w in our_words:
    (matched if w in wa_words else unmatched).append(w)

print(f"\n✅ word-atlas 里能找到的: {len(matched)}")
print(f"❌ 找不到的: {len(unmatched)}")
if unmatched:
    print("  找不到的前 30 个:", unmatched[:30])

# 4. Copy assets
dst_thumb = f'{OUR_ROOT}/public/wa-thumb'
dst_us = f'{OUR_ROOT}/public/wa-audio-us'
dst_uk = f'{OUR_ROOT}/public/wa-audio-uk'
os.makedirs(dst_thumb, exist_ok=True)
os.makedirs(dst_us, exist_ok=True)
os.makedirs(dst_uk, exist_ok=True)

thumb_ok = us_ok = uk_ok = 0
for w in matched:
    st = f'{WA_ROOT}/public/atlas/thumb/{w}.webp'
    if os.path.exists(st):
        shutil.copy2(st, f'{dst_thumb}/{w}.webp'); thumb_ok += 1
    su = f'{WA_ROOT}/public/atlas/audio/us/{w}.mp3'
    if os.path.exists(su):
        shutil.copy2(su, f'{dst_us}/{w}.mp3'); us_ok += 1
    sk = f'{WA_ROOT}/public/atlas/audio/uk/{w}.mp3'
    if os.path.exists(sk):
        shutil.copy2(sk, f'{dst_uk}/{w}.mp3'); uk_ok += 1

print(f"\n复制完成: {thumb_ok} 插画, {us_ok} 美音, {uk_ok} 英音")

# 5. Save manifest
manifest = {
    'illustrated': matched,
    'unillustrated': unmatched,
    'thumb_dir': '/wa-thumb',
    'audio_us_dir': '/wa-audio-us',
    'audio_uk_dir': '/wa-audio-uk',
    'thumb_ext': '.webp',
    'audio_ext': '.mp3',
}
with open(f'{OUR_ROOT}/src/data/wa-manifest.json', 'w') as f:
    json.dump(manifest, f, indent=2)
print(f"manifest → src/data/wa-manifest.json")
print("thumb files:", len(os.listdir(dst_thumb)))
print("us audio files:", len(os.listdir(dst_us)))
