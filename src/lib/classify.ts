/**
 * Phân loại ngữ âm tự động cho 500 từ: mã lỗi VEI, đặc trưng độ khó, vị trí âm.
 * Chỉ dùng cú pháp TS xoá được để script Node chạy trực tiếp.
 */
import type { IpaToken } from './ipa.ts';

export const P1 = new Set(['th', 'dh', 'ih', 'ae', 'uh', 'schwa', 'er', 'v', 's', 'z', 'l', 'r']);
export const P2 = new Set(['i', 'eh', 'aa', 'ah', 'ow', 'p', 't', 'd', 'k', 'g', 'f', 'sh', 'ch', 'jh', 'n', 'w', 'y']);
const NASAL = new Set(['m', 'n', 'ng']);
const STOP = new Set(['p', 'b', 't', 'd', 'k', 'g']);
const VOICED_OBSTRUENT = new Set(['b', 'd', 'g', 'v', 'z', 'dh', 'jh', 'zh']);
const INTONATION_WORDS = new Set(['what', 'where', 'when', 'why', 'how', 'who', 'which', 'really', 'okay', 'sure', 'sorry', 'hello', 'please', 'yes', 'no', 'maybe', 'excuse']);

export interface Positions { initial: string[]; nucleus: string; final: string[] }

export function positions(tokens: IpaToken[], stress: number): Positions {
  const first = tokens.findIndex((t) => t.isVowel);
  let last = -1;
  tokens.forEach((t, i) => { if (t.isVowel) last = i; });
  const vowels = tokens.filter((t) => t.isVowel);
  return {
    initial: first < 0 ? tokens.map((t) => t.id) : tokens.slice(0, first).map((t) => t.id),
    nucleus: vowels[stress]?.id ?? vowels[0]?.id ?? '',
    final: last < 0 ? [] : tokens.slice(last + 1).map((t) => t.id),
  };
}

function isNasalStop(cluster: string[]): boolean {
  return cluster.length === 2 && NASAL.has(cluster[0]) && STOP.has(cluster[1]);
}

export interface ClassifyInput {
  word: string;
  pos: string;
  tokens: IpaToken[];
  syllables: number;
  stress: number;
  note?: string;
  /** có cặp tối thiểu khác nhau ở nguyên âm */
  vowelPair: boolean;
  /** có cặp tối thiểu khác nhau ở rung thanh */
  voicingPair: boolean;
}

export function errorCodes(x: ClassifyInput): string[] {
  const ids = x.tokens.map((t) => t.id);
  const has = (...a: string[]) => a.some((id) => ids.includes(id));
  const pos = positions(x.tokens, x.stress);
  const codes = new Set<string>();
  if (has('th', 'dh')) codes.add('E01');
  if (has('ih', 'ae', 'uh') || x.vowelPair) codes.add('E02');
  const fin = pos.final;
  if (fin.length && fin.some((id) => !NASAL.has(id))) codes.add('E03');
  if (has('z', 'v', 'zh', 'jh') || (fin.length && VOICED_OBSTRUENT.has(fin[fin.length - 1])) || x.voicingPair) codes.add('E04');
  if (pos.initial.length >= 2 || (fin.length >= 2 && !isNasalStop(fin))) codes.add('E05');
  if (has('r', 'l', 'er')) codes.add('E06');
  if (has('sh', 'ch', 'jh', 'zh')) codes.add('E07');
  if (x.syllables >= 2) codes.add('E08');
  const unstressedR = x.tokens.some((t) => t.symbol === 'ɚ');
  if (has('schwa') || unstressedR || /dạng yếu|đọc nhẹ/.test(x.note ?? '')) codes.add('E09');
  if (x.pos === 'interj' || INTONATION_WORDS.has(x.word.toLowerCase())) codes.add('E10');
  return Array.from(codes).sort();
}

/** Điểm thô càng cao càng khó; dùng để xếp hạng rồi chia L1–L5 theo hạn ngạch. */
export function difficultyScore(x: ClassifyInput): number {
  const ids = x.tokens.map((t) => t.id);
  const uniq = Array.from(new Set(ids));
  const pos = positions(x.tokens, x.stress);
  let s = 0;
  for (const id of uniq) s += P1.has(id) ? 2 : P2.has(id) ? 0.75 : 0;
  if (pos.initial.length >= 2) s += pos.initial.length === 2 ? 2 : 3.5;
  const fin = pos.final;
  if (fin.length >= 2) s += isNasalStop(fin) ? 1 : fin.length === 2 ? 2.5 : 4;
  if (fin.length && !NASAL.has(fin[fin.length - 1])) s += 1;
  if (fin.length && VOICED_OBSTRUENT.has(fin[fin.length - 1])) s += 1;
  s += (x.syllables - 1) * 1.6;
  if (x.syllables >= 2 && (ids.includes('schwa') || x.tokens.some((t) => t.symbol === 'ɚ'))) s += 1;
  if (/không đọc|câm|đọc thành|đọc \/|gh /.test(x.note ?? '')) s += 1.5;
  return Math.round(s * 100) / 100;
}

export const DIFFICULTY_QUOTA = [100, 125, 125, 100, 50];
export const DIFFICULTY_LABEL = ['L1 – Cơ bản', 'L2 – Dễ', 'L3 – Trung bình', 'L4 – Khó', 'L5 – Rất khó'];

/** Gán L1..L5 theo thứ hạng điểm (ổn định theo id khi bằng điểm). */
export function assignLevels(scores: { id: number; score: number }[]): Map<number, number> {
  const sorted = [...scores].sort((a, b) => a.score - b.score || a.id - b.id);
  const out = new Map<number, number>();
  let i = 0;
  DIFFICULTY_QUOTA.forEach((q, lvl) => {
    for (let k = 0; k < q && i < sorted.length; k++, i++) out.set(sorted[i].id, lvl + 1);
  });
  while (i < sorted.length) { out.set(sorted[i].id, 5); i++; }
  return out;
}
