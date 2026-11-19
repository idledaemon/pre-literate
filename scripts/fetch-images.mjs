#!/usr/bin/env node
// Batch download illustration images to public/images/.
// Deterministic naming: vocab/{themeId}-{slug}.png, dialog/{sceneId}-{slug}.png, speakers/{key}.png
// Skips existing files → re-run safe.
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PUBLIC = join(ROOT, 'public', 'images');

const API = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image';
const BASE_STYLE =
  'cute flat illustration, hand-drawn children book style, clean white background, ' +
  'bold outlines, warm happy colors, no text, no letters, no caption';

const MAX_CONCURRENT = 6;
const RETRY = 2;
const TIMEOUT_MS = 15000;

function slug(s) {
  return String(s)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'item';
}

function ensureDir(p) {
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
}

function buildUrl(nounPhrase, size, extraStyle = '') {
  const prompt = `${nounPhrase}. ${BASE_STYLE} ${extraStyle}`.trim();
  return `${API}?prompt=${encodeURIComponent(prompt)}&image_size=${size}`;
}

async function fetchImage(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const ct = res.headers.get('content-type') || '';
    const ext = ct.includes('jpeg') ? 'jpg' : ct.includes('webp') ? 'webp' : 'png';
    return { buf, ext };
  } finally {
    clearTimeout(timer);
  }
}

async function downloadOne({ url, destPath, noun }) {
  if (existsSync(destPath)) return { ok: true, skipped: true, path: destPath };
  for (let i = 0; i <= RETRY; i++) {
    try {
      const { buf } = await fetchImage(url);
      ensureDir(dirname(destPath));
      writeFileSync(destPath, buf);
      return { ok: true, path: destPath };
    } catch (e) {
      if (i === RETRY) return { ok: false, error: String(e), noun };
      await new Promise((r) => setTimeout(r, 400 + i * 200));
    }
  }
}

async function worker(jobQueue, results) {
  while (true) {
    const job = jobQueue.shift();
    if (!job) return;
    results.push(await downloadOne(job));
    if (jobQueue.length % 20 === 0) {
      const done = results.length;
      console.log(`  ... ${done} done, ${jobQueue.length} left`);
    }
  }
}

async function runAll(jobs) {
  const results = [];
  const queue = [...jobs];
  const workers = Array.from({ length: MAX_CONCURRENT }, () => worker(queue, results));
  await Promise.all(workers);
  return results;
}

// ---------- build job list ----------
function buildVocabJobs() {
  const { basicThemes } = JSON.parse(
    readFileSync(join(ROOT, 'src/data/themes-basic.js'), 'utf8').replace(/^export const /gm, '// ')
  );
  // can't parse JS modules easily with plain JSON — use dynamic import instead
  return [];
}

// Use dynamic ESM imports since the source is .js with export
const { basicThemes } = await import(join(ROOT, 'src/data/themes-basic.js'));
const { homeSchoolThemes } = await import(join(ROOT, 'src/data/themes-homeschool.js'));
const { conceptThemes } = await import(join(ROOT, 'src/data/themes-concepts.js'));
const { conversations } = await import(join(ROOT, 'src/data/conversations.js'));

const vocabJobs = [];
const allThemes = [...basicThemes, ...homeSchoolThemes, ...conceptThemes];

for (const theme of allThemes) {
  for (const w of theme.words) {
    const file = `vocab/${theme.id}-${slug(w.word)}.png`;
    const dest = join(PUBLIC, file);
    const url = buildUrl(`children drawing of a ${w.word}`, 'square_hd');
    vocabJobs.push({ url, destPath: dest, noun: w.word, rel: `/images/${file}` });
  }
}

// Conversation scene hero images
const dialogJobs = [];
for (const scene of conversations) {
  const file = `dialog/${scene.id}.png`;
  const dest = join(PUBLIC, file);
  const prompt = `kids scene — ${scene.name}, ${scene.dialogues[0]?.en || ''}, colorful, hand-drawn children book style`;
  const url = buildUrl(prompt, 'landscape_4_3');
  dialogJobs.push({ url, destPath: dest, noun: scene.name, rel: `/images/${file}` });
}

// Speaker portraits (unique per key, NOT per dialogue — 4 unique chars)
const speakerJobs = [];
const speakerDefs = [
  { key: 'boy', prompt: 'cute cartoon little boy age 4-5, short brown hair, blue t-shirt, happy smile, front view, shoulder up portrait' },
  { key: 'girl', prompt: 'cute cartoon little girl age 4-5, pigtails with pink ribbons, pink dress, happy smile, front view, shoulder up portrait' },
  { key: 'mom', prompt: 'cute cartoon young mom, long brown hair, cozy home clothes, gentle smile, front view, shoulder up portrait' },
  { key: 'dad', prompt: 'cute cartoon young dad, short black hair, casual shirt, friendly smile, front view, shoulder up portrait' },
];
for (const s of speakerDefs) {
  const file = `speakers/${s.key}.png`;
  const dest = join(PUBLIC, file);
  const url = buildUrl(s.prompt, 'portrait_4_3', 'character portrait facing camera');
  speakerJobs.push({ url, destPath: dest, noun: s.key, rel: `/images/${file}` });
}

const allJobs = [...vocabJobs, ...dialogJobs, ...speakerJobs];
console.log(`📥 Total jobs: ${allJobs.length} (vocab: ${vocabJobs.length}, dialog: ${dialogJobs.length}, speakers: ${speakerJobs.length})`);
console.log(`📍 Dest dir : ${PUBLIC}`);

const results = await runAll(allJobs);

const ok = results.filter((r) => r.ok).length;
const skipped = results.filter((r) => r.ok && r.skipped).length;
const failed = results.filter((r) => !r.ok);

console.log(`\n✅ Success: ${ok} (${skipped} skipped)`);
if (failed.length) {
  console.log(`❌ Failed: ${failed.length}`);
  failed.slice(0, 10).forEach((f) => console.log(`   - ${f.noun}: ${f.error}`));
}

// Emit manifest.json so data files don't have to re-compute paths
const manifest = {
  speakers: Object.fromEntries(speakerJobs.map((j) => [j.noun, j.rel])),
};
const vocabMap = {};
for (const theme of allThemes) {
  vocabMap[theme.id] = {};
  for (const w of theme.words) {
    const rel = `/images/vocab/${theme.id}-${slug(w.word)}.png`;
    vocabMap[theme.id][w.word] = rel;
  }
}
manifest.vocab = vocabMap;

const dialogMap = {};
for (const scene of conversations) {
  dialogMap[scene.id] = `/images/dialog/${scene.id}.png`;
}
manifest.dialog = dialogMap;

manifest.themeCount = allThemes.length;
manifest.wordCount = vocabJobs.length;
manifest.dialogSceneCount = dialogJobs.length;
manifest.generatedAt = new Date().toISOString();

ensureDir(join(ROOT, 'src/data'));
writeFileSync(join(ROOT, 'src/data/image-manifest.json'), JSON.stringify(manifest, null, 2));

console.log(`\n📦 Manifest written → src/data/image-manifest.json`);
console.log(`   themes: ${manifest.themeCount}, words: ${manifest.wordCount}, dialog scenes: ${manifest.dialogSceneCount}`);
