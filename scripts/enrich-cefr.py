#!/usr/bin/env python3
"""Annotate our kids vocab with CEFR level + Chinese meaning from word-atlas."""
import json, os, re

WA_ROOT = '/tmp/word-atlas'
OUR_ROOT = '/Users/jiandai/work/solo/happy-kids'

# word-atlas: {word: {cefr, zh}}
with open(f'{WA_ROOT}/public/atlas/index.json') as f:
    wa = json.load(f)
wa_map = {w[0]: {'cefr': ['A1','A2','B1','B2','C1','C2'][w[4]], 'zh': w[2]} for w in wa['words']}

def cefr_bucket(level):
    if level in ('A1', 'A2'): return 'easy'
    if level in ('B1',): return 'medium'
    return 'hard'

def cefr_color(level):
    return {'A1':'from-green-400 to-emerald-500',
            'A2':'from-lime-400 to-green-500',
            'B1':'from-yellow-400 to-orange-500',
            'B2':'from-orange-400 to-red-500',
            'C1':'from-red-400 to-rose-600',
            'C2':'from-rose-500 to-pink-700'}.get(level, 'from-gray-400 to-gray-500')

def clean_zh(zh):
    """word-atlas zh is like 'n. 图书馆；藏书室' — strip POS marker, return first meaning."""
    if not zh: return ''
    # Strip leading POS like "n. ", "v. ", "adj. " etc.
    import re
    # POS markers we want to strip
    clean = re.sub(r'^(n\.|v\.|adj\.|adv\.|prep\.|pron\.|conj\.|interj\.|art\.|num\.|vt\.|vi\.|aux\.|modal\.|det\.|abbr\.)\s*', '', zh)
    # Take first meaning before ； or ;
    clean = re.split(r'[；;]', clean)[0].strip()
    return clean

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
        raw_words = re.findall(r"word:\s*['\"]([^'\"]+)['\"],\s*emoji:\s*['\"]([^'\"]+)['\"]", words_block)
        enriched = []
        for word, em in raw_words:
            info = wa_map.get(word, {})
            level = info.get('cefr', 'A2')
            zh = clean_zh(info.get('zh', ''))
            enriched.append({
                'word': word,
                'emoji': em,
                'cefr': level,
                'difficulty': cefr_bucket(level),
                'cefrColor': cefr_color(level),
                'zh': zh,
                'hasIllustration': word in wa_map,
            })
        themes.append({
            'id': tid, 'name': name, 'emoji': emoji, 'color': color,
            'words': enriched,
            'wordCount': len(enriched),
            'easyCount': sum(1 for w in enriched if w['difficulty']=='easy'),
            'mediumCount': sum(1 for w in enriched if w['difficulty']=='medium'),
            'hardCount': sum(1 for w in enriched if w['difficulty']=='hard'),
            'illustratedCount': sum(1 for w in enriched if w['hasIllustration']),
        })
    return themes

all_themes = []
for f in ['themes-basic.js', 'themes-homeschool.js', 'themes-concepts.js']:
    all_themes.extend(extract_themes(f'{OUR_ROOT}/src/data/{f}'))

out = {
    'themes': all_themes,
    'totalWords': sum(t['wordCount'] for t in all_themes),
    'totalEasy': sum(t['easyCount'] for t in all_themes),
    'totalMedium': sum(t['mediumCount'] for t in all_themes),
    'totalHard': sum(t['hardCount'] for t in all_themes),
    'totalIllustrated': sum(t['illustratedCount'] for t in all_themes),
}
with open(f'{OUR_ROOT}/src/data/themes-enriched.json', 'w') as f:
    json.dump(out, f, indent=2, ensure_ascii=False)

# Stats
zh_has = sum(1 for t in all_themes for w in t['words'] if w['zh'])
print(f"主题: {len(all_themes)}")
print(f"总词数: {out['totalWords']}")
print(f"有中文释义: {zh_has}")
print(f"有插画: {out['totalIllustrated']}")
print(f"  Easy: {out['totalEasy']}  Medium: {out['totalMedium']}  Hard: {out['totalHard']}")
print()
# 示例
for t in all_themes[:2]:
    for w in t['words'][:3]:
        print(f"  {w['word']:12s} → zh: {w['zh']:10s}  cefr: {w['cefr']}  {'🖼️' if w['hasIllustration'] else '📝'}")
