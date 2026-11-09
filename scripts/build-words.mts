/**
 * Đọc nội dung → kiểm tra → sinh dữ liệu cho app:
 *  - content/words/NN.txt     50 từ mỗi nhóm (nhóm 11+ khai báo @group và 5 dòng "= cụm")
 *  - content/phrases/NN.txt   cụm từ hay dùng kèm câu mẫu
 *  - content/forms.txt        dạng đọc theo ngữ cảnh của từ chức năng
 * Kết quả:
 *  - src/data/words.json        bản đầy đủ, chỉ dùng phía server (trang từ, xuất tài liệu)
 *  - src/data/words-index.json  bản gọn cho trình duyệt (danh sách, bộ lọc, ôn tập)
 *  - src/data/groups-extra.json nhóm và cụm học khai báo trong tệp nội dung
 *  - src/data/forms.json
 * Chạy: node scripts/build-words.mts
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyzeIpa, normalizeIpa, type IpaToken } from '../src/lib/ipa.ts';
import { errorCodes, difficultyScore, assignLevels, levelQuota, positions, type ClassifyInput } from '../src/lib/classify.ts';
import type { WordEntry, MinimalPair, WordPhrase } from '../src/data/types.ts';
import { STAGES, stageOf } from '../src/data/stages.ts';
import { GOLD_A } from '../src/data/gold/set-a.ts';
import { GOLD_B } from '../src/data/gold/set-b.ts';

const VOICING: [string, string][] = [['s', 'z'], ['f', 'v'], ['t', 'd'], ['k', 'g'], ['p', 'b'], ['th', 'dh'], ['ch', 'jh'], ['sh', 'zh']];
const CONFUSABLE_VOWELS: [string, string][] = [['ih', 'i'], ['ae', 'eh'], ['uh', 'u'], ['ae', 'ah'], ['ah', 'aa'], ['aa', 'ao'], ['ao', 'ow'], ['eh', 'ey'], ['ih', 'eh']];
const isVowelPair = (a: string, b: string) => CONFUSABLE_VOWELS.some(([x, y]) => (a === x && b === y) || (a === y && b === x));
const isVoicingPair = (a: string, b: string) => VOICING.some(([x, y]) => (a === x && b === y) || (a === y && b === x));

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC_DIR = join(ROOT, 'content', 'words');
const PHRASES_DIR = join(ROOT, 'content', 'phrases');
const FORMS_SRC = join(ROOT, 'content', 'forms.txt');
const DATA = join(ROOT, 'src', 'data');
const OUT = join(DATA, 'words.json');
const INDEX_OUT = join(DATA, 'words-index.json');
const GROUPS_OUT = join(DATA, 'groups-extra.json');
const FORMS_OUT = join(DATA, 'forms.json');

const POS_OK = new Set(['n', 'v', 'adj', 'adv', 'pron', 'det', 'prep', 'conj', 'num', 'interj', 'modal']);
const WORDS_PER_GROUP = 50;
const UNITS_PER_GROUP = 5;
const MAX_PHRASES = 3;

interface Raw {
  group: number; word: string; ipa: string; pos: string; meaning: string;
  exampleEn: string; exampleVi: string; pair?: string; note?: string; line: number; file: string;
}
interface UnitMeta { index: number; title: string; focus: string }
interface GroupMeta {
  id: number; slug: string; title: string; short: string; focus: string; description: string;
  examples: string[]; tone: string; stage: number; units: UnitMeta[];
}

const errors: string[] = [];
const raws: Raw[] = [];
const groupsExtra: GroupMeta[] = [];

for (const file of readdirSync(SRC_DIR).filter((f) => f.endsWith('.txt')).sort()) {
  const group = Number(file.replace('.txt', ''));
  const lines = readFileSync(join(SRC_DIR, file), 'utf8').split(/\r?\n/);
  let meta: GroupMeta | undefined;
  let count = 0;
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    const where = `${file}:${i + 1}`;
    if (!t || t.startsWith('#')) continue;
    if (t.startsWith('@group')) {
      const [, title, short, focus, description, ex] = t.split('|').map((c) => c.trim());
      if (!title || !short || !focus || !description) errors.push(`${where} dòng @group cần đủ: tên|tên ngắn|trọng tâm|mô tả|ví dụ`);
      meta = {
        id: group, slug: String(group).padStart(2, '0'), title, short, focus, description,
        examples: (ex ?? '').split(',').map((s) => s.trim()).filter(Boolean), tone: 'neutral', stage: stageOf(group), units: [],
      };
      groupsExtra.push(meta);
      continue;
    }
    if (t.startsWith('=')) {
      if (!meta) { errors.push(`${where} dòng cụm "=" đứng trước dòng @group`); continue; }
      const [title, focus] = t.slice(1).split('|').map((c) => c.trim());
      const expect = meta.units.length * 10;
      if (count !== expect) errors.push(`${where} cụm "${title}" phải bắt đầu sau đúng ${expect} từ (đang sau ${count})`);
      if (!title) errors.push(`${where} cụm thiếu tên`);
      meta.units.push({ index: meta.units.length + 1, title, focus: focus ?? '' });
      continue;
    }
    const cols = t.split('|');
    if (cols.length < 6) { errors.push(`${where} thiếu cột (${cols.length})`); continue; }
    const [word, ipa, pos, meaning, exampleEn, exampleVi, pair, note] = cols.map((c) => c.trim());
    if (!POS_OK.has(pos)) errors.push(`${where} loại từ lạ "${pos}" (${word})`);
    if (!meaning || !exampleEn || !exampleVi) errors.push(`${where} "${word}" thiếu nghĩa hoặc câu ví dụ`);
    raws.push({ group, word, ipa, pos, meaning, exampleEn, exampleVi, pair: pair || undefined, note: note || undefined, line: i + 1, file });
    count++;
  }
  if (count !== WORDS_PER_GROUP) errors.push(`${file}: có ${count} từ, cần đúng ${WORDS_PER_GROUP}`);
  if (group > 10 && !meta) errors.push(`${file}: nhóm ${group} cần dòng @group`);
  if (meta && meta.units.length !== UNITS_PER_GROUP) errors.push(`${file}: có ${meta.units.length} cụm, cần đúng ${UNITS_PER_GROUP}`);
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
    if (a.tokens.filter((t) => t.stress === 1).length > 1) errors.push(`${r.file}:${r.line} "${r.word}" có hơn một trọng âm chính`);
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
for (const g of groupsExtra) for (const ex of g.examples) if (!bySlug.has(ex.toLowerCase())) errors.push(`Nhóm ${g.slug}: từ ví dụ "${ex}" không có trong nhóm`);

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
  } else errors.push(`${r.file}:${r.line} cặp từ "${w}" không có trong danh sách từ và thiếu IPA`);
});

// Đồng âm và cặp tối thiểu tự động (khác đúng một âm vị, cùng độ dài)
const byLength = new Map<number, WordEntry[]>();
for (const e of entries) {
  const list = byLength.get(e.phonemes.length) ?? [];
  list.push(e);
  byLength.set(e.phonemes.length, list);
}
for (const e of entries) {
  for (const o of byLength.get(e.phonemes.length) ?? []) {
    if (o.id === e.id) continue;
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
for (const g of GOLD.keys()) if (!bySlug.has(g)) errors.push(`Gold Set: "${g}" không có trong danh sách từ`);
const perGroup = new Map<number, number>();
const scores: { id: number; score: number; stage: number }[] = [];
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
  scores.push({ id: e.id, score: e.difficultyScore, stage: stageOf(e.group) });
  const p = positions(tokens, e.stress);
  e.initial = p.initial; e.nucleus = p.nucleus; e.final = p.final;
  e.gold = !!gold;
}

// Độ khó L1–L5 xếp hạng trong từng giai đoạn, cùng tỉ lệ 20/25/25/20/10 %
const levelReport: string[] = [];
for (const st of STAGES) {
  const sc = scores.filter((s) => s.stage === st.id);
  if (!sc.length) continue;
  const quota = levelQuota(sc.length);
  const levels = assignLevels(sc, quota);
  for (const s of sc) bySlugId(s.id).difficulty = levels.get(s.id) ?? 3;
  const got = [1, 2, 3, 4, 5].map((l) => sc.filter((s) => bySlugId(s.id).difficulty === l).length);
  if (got.join() !== quota.join()) errors.push(`Giai đoạn ${st.id}: phân bổ độ khó ${got.join('/')} khác hạn ngạch ${quota.join('/')}`);
  levelReport.push(`GĐ${st.id} ${sc.length} từ: ${got.join('/')}`);
}
function bySlugId(id: number): WordEntry { return entries[id - 1]; }

// Cụm từ hay dùng kèm câu mẫu (content/phrases/NN.txt)
function hasHead(text: string, word: string): boolean {
  const w = word.toLowerCase();
  const stem = w.length >= 4 && /[ey]$/.test(w) ? w.slice(0, -1) : w;
  return text.toLowerCase().split(/[^a-z']+/).some((t) => t === w || t.startsWith(stem));
}
let phraseTotal = 0;
if (existsSync(PHRASES_DIR)) {
  for (const file of readdirSync(PHRASES_DIR).filter((f) => f.endsWith('.txt')).sort()) {
    const group = Number(file.replace('.txt', ''));
    const lines = readFileSync(join(PHRASES_DIR, file), 'utf8').split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const t = lines[i].trim();
      if (!t || t.startsWith('#')) continue;
      const where = `phrases/${file}:${i + 1}`;
      const cols = t.split('|').map((c) => c.trim());
      if (cols.length < 5) { errors.push(`${where} thiếu cột (${cols.length}/5)`); continue; }
      const [word, text, meaning, exampleEn, exampleVi] = cols;
      const e = bySlug.get(word.toLowerCase());
      if (!e) { errors.push(`${where} "${word}" không có trong danh sách từ`); continue; }
      if (e.group !== group) errors.push(`${where} "${word}" thuộc nhóm ${e.group}, không phải nhóm ${group}`);
      if (!text || !meaning || !exampleEn || !exampleVi) errors.push(`${where} "${word}" thiếu cụm, nghĩa hoặc câu mẫu`);
      if (!hasHead(text, e.word)) errors.push(`${where} cụm "${text}" không chứa từ "${e.word}"`);
      if (!exampleEn.toLowerCase().includes(text.toLowerCase())) errors.push(`${where} câu mẫu "${exampleEn}" không chứa nguyên cụm "${text}"`);
      const list: WordPhrase[] = e.phrases ?? [];
      if (list.some((p) => p.text.toLowerCase() === text.toLowerCase())) errors.push(`${where} cụm "${text}" bị lặp`);
      if (list.length >= MAX_PHRASES) errors.push(`${where} "${word}" có quá ${MAX_PHRASES} cụm`);
      list.push({ text, meaning, exampleEn, exampleVi });
      e.phrases = list;
      phraseTotal++;
    }
  }
}

// Dạng đọc theo ngữ cảnh (content/forms.txt) → src/data/forms.json
interface FormRaw { ipa: string; label: string; when: string; examples: string[]; sampleIpa?: string; emphasis?: boolean }
interface FormsRaw { slug: string; summary: string; rule?: string; forms: FormRaw[] }
const formsOut: FormsRaw[] = [];
{
  const lines = readFileSync(FORMS_SRC, 'utf8').split(/\r?\n/);
  let cur: FormsRaw | null = null;
  lines.forEach((line, i) => {
    const t = line.trim();
    if (!t || t.startsWith('#')) return;
    const where = `forms.txt:${i + 1}`;
    if (t.startsWith('@')) {
      const [slug, summary, rule] = t.slice(1).split('|').map((c) => c.trim());
      if (!bySlug.has(slug)) errors.push(`${where} "${slug}" không có trong danh sách từ`);
      if (formsOut.some((f) => f.slug === slug)) errors.push(`${where} "${slug}" khai báo hai lần`);
      if (!summary) errors.push(`${where} "${slug}" thiếu tóm tắt`);
      cur = { slug, summary, rule: rule || undefined, forms: [] };
      formsOut.push(cur);
      return;
    }
    if (!cur) { errors.push(`${where} dòng dạng đọc đứng trước dòng @slug`); return; }
    const cols = t.split('|').map((c) => c.trim());
    if (cols.length < 4) { errors.push(`${where} thiếu cột (${cols.length}/4)`); return; }
    const [ipa, label, when, ex, sampleIpa, flag] = cols;
    const examples = ex.split(';').map((x) => x.trim()).filter(Boolean);
    const word = cur.slug;
    const re = new RegExp(`(^|[^a-z])${word}([^a-z]|$)`, 'i');
    for (const e of examples) {
      if (!re.test(e) && !(word === 'not' && /n't/i.test(e))) errors.push(`${where} ví dụ "${e}" không chứa từ "${word}"`);
    }
    for (const x of [ipa, sampleIpa]) {
      if (!x) continue;
      try { for (const part of x.split(/\s+/)) analyzeIpa(part); } catch (e) { errors.push(`${where} ${(e as Error).message}`); }
    }
    if (cur.forms.some((f) => f.ipa === ipa && f.label === label)) errors.push(`${where} dạng /${ipa}/ "${label}" bị lặp`);
    cur.forms.push({ ipa: normalizeIpa(ipa), label, when, examples, sampleIpa: sampleIpa ? sampleIpa.trim() : undefined, emphasis: flag === 'E' || undefined });
  });
  for (const f of formsOut) {
    if (f.forms.length < 2) errors.push(`forms.txt "${f.slug}" cần ít nhất 2 dạng đọc`);
    if (!f.forms.some((x) => !x.emphasis)) errors.push(`forms.txt "${f.slug}" cần ít nhất 1 dạng không nhấn mạnh`);
    const main = bySlug.get(f.slug);
    if (main && !f.forms.some((x) => x.ipa === main.ipa)) errors.push(`forms.txt "${f.slug}" không có dạng nào trùng phiên âm chính /${main.ipa}/`);
  }
}

if (errors.length) {
  console.error(`\n✗ ${errors.length} lỗi dữ liệu:`);
  for (const er of errors.slice(0, 200)) console.error('  - ' + er);
  if (errors.length > 200) console.error(`  … và ${errors.length - 200} lỗi khác`);
  process.exit(1);
}

mkdirSync(DATA, { recursive: true });
const NL = String.fromCharCode(10);
writeFileSync(OUT, JSON.stringify(entries) + NL, 'utf8');
// Bản gọn: [word, ipa, pos, meaning, exampleEn, group, difficulty, "E01 E05", gold?1:0]
const index = entries.map((e) => [e.word, e.ipa, e.pos, e.meaning, e.exampleEn, e.group, e.difficulty, e.errorCodes.join(' '), e.gold ? 1 : 0]);
writeFileSync(INDEX_OUT, JSON.stringify(index) + NL, 'utf8');
writeFileSync(GROUPS_OUT, JSON.stringify(groupsExtra) + NL, 'utf8');
writeFileSync(FORMS_OUT, JSON.stringify(formsOut) + NL, 'utf8');

const phonemeCount: Record<string, number> = {};
for (const e of entries) for (const p of e.phonemes) phonemeCount[p] = (phonemeCount[p] ?? 0) + 1;
const pairs = entries.reduce((n, e) => n + e.minimalPairs.length, 0) / 2;
console.log(`✓ ${entries.length} từ (${perGroup.size} nhóm), ${Object.keys(phonemeCount).length} âm vị dùng, ${pairs} cặp tối thiểu tự động, ${entries.filter((e) => e.homophones.length).length} từ có đồng âm`);
const codeCount: Record<string, number> = {};
for (const e of entries) for (const c of e.errorCodes) codeCount[c] = (codeCount[c] ?? 0) + 1;
console.log(`  Cụm từ hay dùng: ${phraseTotal} cụm cho ${entries.filter((e) => e.phrases?.length).length} từ`);
console.log(`  Dạng đọc theo ngữ cảnh: ${formsOut.length} từ, ${formsOut.reduce((n, f) => n + f.forms.length, 0)} dạng`);
console.log(`  Độ khó L1–L5: ${levelReport.join(' • ')} • Gold Set: ${entries.filter((e) => e.gold).length} từ`);
console.log('  Mã lỗi:', Object.entries(codeCount).sort().map(([k, v]) => `${k}:${v}`).join(' '));
console.log(`  Bản gọn cho trình duyệt: ${Math.round(Buffer.byteLength(JSON.stringify(index)) / 1024)} KB • bản đầy đủ: ${Math.round(Buffer.byteLength(JSON.stringify(entries)) / 1024)} KB`);
