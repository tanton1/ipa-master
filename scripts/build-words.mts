/**
 * Đọc content/words/*.txt → kiểm tra → sinh src/data/words.json
 * Chạy: node scripts/build-words.mts
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyzeIpa, normalizeIpa, type IpaToken } from '../src/lib/ipa.ts';
import { errorCodes, difficultyScore, assignLevels, positions, DIFFICULTY_QUOTA, type ClassifyInput } from '../src/lib/classify.ts';
import type { WordEntry, MinimalPair } from '../src/data/types.ts';
import { GOLD_A } from '../src/data/gold/set-a.ts';
import { GOLD_B } from '../src/data/gold/set-b.ts';

const VOICING: [string, string][] = [['s', 'z'], ['f', 'v'], ['t', 'd'], ['k', 'g'], ['p', 'b'], ['th', 'dh'], ['ch', 'jh'], ['sh', 'zh']];
const CONFUSABLE_VOWELS: [string, string][] = [['ih', 'i'], ['ae', 'eh'], ['uh', 'u'], ['ae', 'ah'], ['ah', 'aa'], ['aa', 'ao'], ['ao', 'ow'], ['eh', 'ey'], ['ih', 'eh']];
const isVowelPair = (a: string, b: string) => CONFUSABLE_VOWELS.some(([x, y]) => (a === x && b === y) || (a === y && b === x));
const isVoicingPair = (a: string, b: string) => VOICING.some(([x, y]) => (a === x && b === y) || (a === y && b === x));

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC_DIR = join(ROOT, 'content', 'words');
const OUT = join(ROOT, 'src', 'data', 'words.json');

const POS_OK = new Set(['n', 'v', 'adj', 'adv', 'pron', 'det', 'prep', 'conj', 'num', 'interj', 'modal']);

interface Raw {
  group: number; word: string; ipa: string; pos: string; meaning: string;
  exampleEn: string; exampleVi: string; pair?: string; note?: string; line: number; file: string;
}

const errors: string[] = [];
const raws: Raw[] = [];

for (const file of readdirSync(SRC_DIR).filter((f) => f.endsWith('.txt')).sort()) {
  const group = Number(file.replace('.txt', ''));
  const lines = readFileSync(join(SRC_DIR, file), 'utf8').split(/\r?\n/);
  let count = 0;
  lines.forEach((line, i) => {
    const t = line.trim();
    if (!t || t.startsWith('#')) return;
    const cols = t.split('|');
    if (cols.length < 6) { errors.push(`${file}:${i + 1} thiếu cột (${cols.length})`); return; }
    const [word, ipa, pos, meaning, exampleEn, exampleVi, pair, note] = cols.map((c) => c.trim());
    if (!POS_OK.has(pos)) errors.push(`${file}:${i + 1} loại từ lạ "${pos}" (${word})`);
    raws.push({ group, word, ipa, pos, meaning, exampleEn, exampleVi, pair: pair || undefined, note: note || undefined, line: i + 1, file });
    count++;
  });
  if (count !== 50) errors.push(`${file}: có ${count} từ, cần đúng 50`);
}

const seen = new Map<string, string>();
for (const r of raws) {
  const key = r.word.toLowerCase();
  if (seen.has(key)) errors.push(`Từ trùng "${r.word}" ở ${r.file}:${r.line} và ${seen.get(key)}`);
  seen.set(key, `${r.file}:${r.line}`);
}

const entries: WordEntry[] = [];
const tokensById = new Map<number, IpaToken[]>();
raws.forEach((r, idx) => {
  try {
    const a = analyzeIpa(r.ipa);
    const hasPrimary = a.tokens.some((t) => t.stress === 1);
    if (a.syllables > 1 && !hasPrimary) errors.push(`${r.file}:${r.line} "${r.word}" nhiều âm tiết nhưng thiếu dấu trọng âm ˈ`);
    entries.push({
      id: idx + 1,
      word: r.word,
      slug: r.word.toLowerCase(),
      ipa: normalizeIpa(r.ipa),
      phonemes: a.phonemeIds,
      syllables: a.syllables,
      stress: a.stress,
      pos: r.pos,
      meaning: r.meaning,
      exampleEn: r.exampleEn,
      exampleVi: r.exampleVi,
      group: r.group,
      homophones: [],
      minimalPairs: [],
      note: r.note,
      unit: '', week: 0, day: 0, difficulty: 0, difficultyScore: 0, errorCodes: [],
      initial: [], nucleus: '', final: [], gold: false, status: 'draft', frequencyRank: null,
    });
    tokensById.set(idx + 1, a.tokens);
  } catch (e) {
    errors.push(`${r.file}:${r.line} ${(e as Error).message}`);
  }
});

const bySlug = new Map(entries.map((e) => [e.slug, e]));

// Cặp từ do người soạn chỉ định
raws.forEach((r, idx) => {
  if (!r.pair) return;
  const e = entries[idx];
  if (!e) return;
  const [w, ipa] = r.pair.split(';').map((s) => s.trim());
  const target = bySlug.get(w.toLowerCase());
  if (target) e.pair = { word: target.word, ipa: target.ipa, slug: target.slug };
  else if (ipa) {
    try { analyzeIpa(ipa); e.pair = { word: w, ipa: normalizeIpa(ipa) }; }
    catch (err) { errors.push(`${r.file}:${r.line} IPA của cặp từ "${w}" lỗi: ${(err as Error).message}`); }
  } else errors.push(`${r.file}:${r.line} cặp từ "${w}" không có trong 500 từ và thiếu IPA`);
});

// Đồng âm và cặp tối thiểu tự động (khác đúng một âm vị, cùng độ dài)
for (const e of entries) {
  for (const o of entries) {
    if (o.id === e.id) continue;
    if (o.phonemes.length !== e.phonemes.length) continue;
    let diffs = 0; let pos = -1;
    for (let i = 0; i < e.phonemes.length; i++) {
      if (e.phonemes[i] !== o.phonemes[i]) { diffs++; pos = i; if (diffs > 1) break; }
    }
    if (diffs === 0) e.homophones.push(o.slug);
    else if (diffs === 1) {
      const mp: MinimalPair = { word: o.word, ipa: o.ipa, slug: o.slug, diff: [e.phonemes[pos], o.phonemes[pos]] };
      e.minimalPairs.push(mp);
    }
  }
  e.minimalPairs.sort((x, y) => x.word.localeCompare(y.word));
}

// Cụm học, tuần/ngày, phân loại ngữ âm, độ khó, Gold Set
const GOLD = new Map([...GOLD_A, ...GOLD_B].map((g) => [g.slug, g]));
for (const g of GOLD.keys()) if (!bySlug.has(g)) errors.push(`Gold Set: "${g}" không có trong 500 từ`);
const perGroup = new Map<number, number>();
const scores: { id: number; score: number }[] = [];
for (const e of entries) {
  const k = perGroup.get(e.group) ?? 0;
  perGroup.set(e.group, k + 1);
  const unitIndex = Math.floor(k / 10) + 1;
  e.unit = `G${String(e.group).padStart(2, '0')}-U${unitIndex}`;
  e.week = e.group;
  e.day = unitIndex;
  const tokens = tokensById.get(e.id) ?? [];
  const pairs = [...e.minimalPairs.map((m) => m.diff)];
  if (e.pair) {
    try {
      const other = analyzeIpa(e.pair.ipa).phonemeIds;
      if (other.length === e.phonemes.length) {
        const d = e.phonemes.map((p, i) => [p, other[i]] as [string, string]).filter(([a, b]) => a !== b);
        if (d.length === 1) pairs.push(d[0]);
      }
    } catch { /* đã kiểm ở trên */ }
  }
  const input: ClassifyInput = {
    word: e.word, pos: e.pos, tokens, syllables: e.syllables, stress: e.stress, note: e.note,
    vowelPair: pairs.some(([a, b]) => isVowelPair(a, b)),
    voicingPair: pairs.some(([a, b]) => isVoicingPair(a, b)),
  };
  const gold = GOLD.get(e.slug);
  e.errorCodes = gold ? [...gold.codes].sort() : errorCodes(input);
  e.difficultyScore = difficultyScore(input);
  scores.push({ id: e.id, score: e.difficultyScore });
  const p = positions(tokens, e.stress);
  e.initial = p.initial; e.nucleus = p.nucleus; e.final = p.final;
  e.gold = !!gold;
}
const levels = assignLevels(scores);
for (const e of entries) e.difficulty = levels.get(e.id) ?? 3;
const levelCount = [1, 2, 3, 4, 5].map((l) => entries.filter((e) => e.difficulty === l).length);
if (levelCount.join() !== DIFFICULTY_QUOTA.join()) errors.push(`Phân bổ độ khó ${levelCount.join('/')} khác hạn ngạch ${DIFFICULTY_QUOTA.join('/')}`);

if (errors.length) {
  console.error(`\n✗ ${errors.length} lỗi dữ liệu:`);
  for (const er of errors) console.error('  - ' + er);
  process.exit(1);
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(entries, null, 0) + '\n', 'utf8');

const phonemeCount: Record<string, number> = {};
for (const e of entries) for (const p of e.phonemes) phonemeCount[p] = (phonemeCount[p] ?? 0) + 1;
const pairs = entries.reduce((n, e) => n + e.minimalPairs.length, 0) / 2;
console.log(`✓ ${entries.length} từ, ${Object.keys(phonemeCount).length} âm vị dùng, ${pairs} cặp tối thiểu tự động, ${entries.filter((e) => e.homophones.length).length} từ có đồng âm`);
const codeCount: Record<string, number> = {};
for (const e of entries) for (const c of e.errorCodes) codeCount[c] = (codeCount[c] ?? 0) + 1;
console.log(`  Độ khó L1–L5: ${levelCount.join('/')} • Gold Set: ${entries.filter((e) => e.gold).length} từ`);
console.log('  Mã lỗi:', Object.entries(codeCount).sort().map(([k, v]) => `${k}:${v}`).join(' '));
console.log('  Âm vị theo số lần xuất hiện:', Object.entries(phonemeCount).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${v}`).join(' '));
