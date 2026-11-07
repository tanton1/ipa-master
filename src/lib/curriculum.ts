import wordsJson from '@/data/words.json';
import type { WordEntry } from '@/data/types';
import { GROUPS } from '@/data/groups';

export const WORDS: WordEntry[] = wordsJson as WordEntry[];

const BY_SLUG = new Map(WORDS.map((w) => [w.slug, w]));

export function getWord(slug: string): WordEntry | undefined {
  return BY_SLUG.get(slug.toLowerCase());
}

export function wordsOfGroup(groupId: number): WordEntry[] {
  return WORDS.filter((w) => w.group === groupId);
}

export function wordsWithPhoneme(phonemeId: string, limit = 12): WordEntry[] {
  const out: WordEntry[] = [];
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
export const TOTAL_LESSONS = WORDS.length / WORDS_PER_DAY; // 50

/** Bài học hôm nay suy ra từ số từ đã học. */
export function lessonIndexFor(learnedCount: number): number {
  return Math.min(TOTAL_LESSONS - 1, Math.floor(learnedCount / WORDS_PER_DAY));
}

export function lessonWords(index: number): WordEntry[] {
  return WORDS.slice(index * WORDS_PER_DAY, index * WORDS_PER_DAY + WORDS_PER_DAY);
}

export function weekDay(index: number): { week: number; day: number } {
  return { week: Math.floor(index / DAYS_PER_WEEK) + 1, day: (index % DAYS_PER_WEEK) + 1 };
}

export function nextInGroup(w: WordEntry): WordEntry | undefined {
  const list = wordsOfGroup(w.group);
  const i = list.findIndex((x) => x.slug === w.slug);
  return list[i + 1];
}

export function prevInGroup(w: WordEntry): WordEntry | undefined {
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

export const ROADMAP: RoadmapStage[] = [
  { weeks: 'Tuần 1–2', words: 100, pct: 20, focus: 'Âm nền tảng, từ chức năng và động từ', groups: [1, 2] },
  { weeks: 'Tuần 3–4', words: 200, pct: 40, focus: 'Số đếm, trọng âm, con người và cơ thể', groups: [3, 4] },
  { weeks: 'Tuần 5–6', words: 300, pct: 60, focus: 'Đồ vật, âm cuối, địa điểm và di chuyển', groups: [5, 6] },
  { weeks: 'Tuần 7–8', words: 400, pct: 80, focus: 'Sinh hoạt, tính từ, nguyên âm dễ nhầm', groups: [7, 8] },
  { weeks: 'Tuần 9–10', words: 500, pct: 100, focus: 'Từ nhiều âm tiết, giao tiếp và các từ đọc bất quy tắc', groups: [9, 10] },
];

export function groupTitle(id: number): string {
  return GROUPS.find((g) => g.id === id)?.title ?? `Nhóm ${id}`;
}
