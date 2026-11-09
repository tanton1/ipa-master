import indexJson from '@/data/words-index.json';
import type { WordLite } from '@/data/types';
import { GROUPS } from '@/data/groups';
import { STAGES } from '@/data/stages';
import { analyzeIpa } from '@/lib/ipa';
import { positions } from '@/lib/classify';

/** Một dòng của words-index.json: [word, ipa, pos, meaning, exampleEn, group, difficulty, "E01 E05", gold] */
type IndexRow = [string, string, string, string, string, number, number, string, number];

function hydrate(rows: IndexRow[]): WordLite[] {
  const perGroup = new Map<number, number>();
  return rows.map(([word, ipa, pos, meaning, exampleEn, group, difficulty, codes, gold], i) => {
    const k = perGroup.get(group) ?? 0;
    perGroup.set(group, k + 1);
    const day = Math.floor(k / 10) + 1;
    return {
      id: i + 1, word, slug: word.toLowerCase(), ipa, pos, meaning, exampleEn, group,
      unit: `G${String(group).padStart(2, '0')}-U${day}`, week: group, day, difficulty,
      errorCodes: codes ? codes.split(' ') : [], phonemes: analyzeIpa(ipa).phonemeIds, gold: gold === 1,
    };
  });
}

/** Danh sách từ dạng gọn, dùng được ở cả server và trình duyệt. Bản đầy đủ: src/lib/words-full.ts (chỉ server). */
export const WORDS: WordLite[] = hydrate(indexJson as IndexRow[]);

const BY_SLUG = new Map(WORDS.map((w) => [w.slug, w]));

/** Bổ sung phụ âm đầu/cuối (tính lại từ IPA) để dùng cho phản hồi phát âm. */
export function withPositions(w: WordLite): WordLite & { initial: string[]; final: string[]; nucleus: string } {
  const a = analyzeIpa(w.ipa);
  const p = positions(a.tokens, a.stress);
  return { ...w, initial: p.initial, final: p.final, nucleus: p.nucleus };
}

export function getWord(slug: string): WordLite | undefined {
  return BY_SLUG.get(slug.toLowerCase());
}

export function wordsOfGroup(groupId: number): WordLite[] {
  return WORDS.filter((w) => w.group === groupId);
}

export function wordsWithPhoneme(phonemeId: string, limit = 12): WordLite[] {
  const out: WordLite[] = [];
  for (const w of WORDS) {
    if (w.phonemes.includes(phonemeId)) out.push(w);
    if (out.length >= limit) break;
  }
  return out;
}

export function countWordsWithPhoneme(phonemeId: string): number {
  return WORDS.reduce((n, w) => (w.phonemes.includes(phonemeId) ? n + 1 : n), 0);
}

export const WORDS_PER_DAY = 10;
export const DAYS_PER_WEEK = 5;
export const TOTAL_LESSONS = WORDS.length / WORDS_PER_DAY; // 300 với 3000 từ

/** Bài học hôm nay suy ra từ số từ đã học. */
export function lessonIndexFor(learnedCount: number): number {
  return Math.min(TOTAL_LESSONS - 1, Math.floor(learnedCount / WORDS_PER_DAY));
}

export function lessonWords(index: number): WordLite[] {
  return WORDS.slice(index * WORDS_PER_DAY, index * WORDS_PER_DAY + WORDS_PER_DAY);
}

export function weekDay(index: number): { week: number; day: number } {
  return { week: Math.floor(index / DAYS_PER_WEEK) + 1, day: (index % DAYS_PER_WEEK) + 1 };
}

export function nextInGroup(w: { slug: string; group: number }): WordLite | undefined {
  const list = wordsOfGroup(w.group);
  const i = list.findIndex((x) => x.slug === w.slug);
  return list[i + 1];
}

export function prevInGroup(w: { slug: string; group: number }): WordLite | undefined {
  const list = wordsOfGroup(w.group);
  const i = list.findIndex((x) => x.slug === w.slug);
  return i > 0 ? list[i - 1] : undefined;
}

export interface RoadmapStage {
  weeks: string;
  words: number;
  pct: number;
  focus: string;
  groups: number[];
}

const groupWords = (from: number, to: number) => WORDS.filter((w) => w.group >= from && w.group <= to).length;
const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
const upTo = (to: number) => WORDS.filter((w) => w.group <= to).length;

/** Lộ trình: giai đoạn 1 chia 5 chặng hai tuần, giai đoạn 2–3 chia chặng năm tuần. pct tính trên toàn bộ từ. */
const CORE_STEPS: [number, number, string][] = [
  [1, 2, 'Âm nền tảng, từ chức năng và động từ'],
  [3, 4, 'Số đếm, trọng âm, con người và cơ thể'],
  [5, 6, 'Đồ vật, âm cuối, địa điểm và di chuyển'],
  [7, 8, 'Sinh hoạt, tính từ, nguyên âm dễ nhầm'],
  [9, 10, 'Từ nhiều âm tiết, giao tiếp và các từ đọc bất quy tắc'],
];
export const ROADMAP: RoadmapStage[] = [
  ...CORE_STEPS,
  ...STAGES.filter((st) => st.id > 1).flatMap((st) => {
    const out: [number, number, string][] = [];
    for (let g = st.from; g <= st.to; g += 5) {
      const to = Math.min(st.to, g + 4);
      out.push([g, to, GROUPS.filter((x) => x.id >= g && x.id <= to).map((x) => x.short).join(', ')]);
    }
    return out;
  }),
]
  .filter(([from]) => groupWords(from, from) > 0)
  .map(([from, to, focus]) => ({ weeks: `Tuần ${from}–${to}`, words: upTo(to), pct: Math.round((upTo(to) / WORDS.length) * 100), focus, groups: range(from, to) }));

export function groupTitle(id: number): string {
  return GROUPS.find((g) => g.id === id)?.title ?? `Nhóm ${id}`;
}
