'use client';

import { useSyncExternalStore } from 'react';

/* ============================== Kiểu dữ liệu ============================== */

export type WordStatus = 'new' | 'learning' | 'review' | 'needs-practice' | 'mastered';
export type Rating = 1 | 2 | 3;
export type { IpaStyle } from './ipa-display';
import type { IpaStyle } from './ipa-display';
export type Region = 'bac' | 'trung' | 'nam' | 'khac';

export interface Tally { c: number; t: number }

/** Tiến độ của MỘT học viên với MỘT từ (tách khỏi dữ liệu nội dung từ). */
export interface WordProgress {
  status: WordStatus;
  /** vị trí trong lịch INTERVALS */
  step: number;
  interval: number;
  due: string;
  last: string;
  reps: number;
  lapses: number;
  listen: Tally;
  /** 0–100, trung bình trượt của các lần tự đánh giá phát âm */
  pron: number | null;
  /** 0–100, kết quả phát âm lại khi ôn sau giãn cách */
  retention: number | null;
  /** 0–100, đọc từ trong câu */
  sentence: number | null;
  /** các ngày ôn đạt (≥ "Tạm được") khác nhau */
  goodDays: string[];
  rating?: Rating;
}

export interface Retest { started: string; d1: string; d3: string; results: Partial<Record<'d1' | 'd3', Rating>> }

export interface Profile {
  onboarded: boolean;
  goal?: 'giao-tiep' | 'mat-goc' | 'thi-cu' | 'cong-viec';
  level?: 'moi' | 'co-ban' | 'kha';
  region?: Region;
  ipaStyle: IpaStyle;
  diagnosticAt?: string;
  confidence?: { speak: number; listen: number };
}

export interface DayLog { learned: number; reviewed: number }

export interface AppState {
  version: 2;
  startedAt: string;
  words: Record<string, WordProgress>;
  /** nghe: lc/lt, nói: sg/st theo từng âm vị */
  phonemeStats: Record<string, { lc: number; lt: number; sg: number; st: number }>;
  errorStats: Record<string, Tally>;
  retests: Record<string, Retest>;
  log: Record<string, DayLog>;
  settings: { rate: number; voiceURI?: string };
  profile: Profile;
}

const KEY = 'ipa-master:v1';

export const INTERVALS = [1, 3, 7, 14, 30, 60];
export const RATING_SCORE: Record<Rating, number> = { 1: 35, 2: 65, 3: 90 };
export const MASTERY_WEIGHTS = { listen: 0.25, pron: 0.4, retention: 0.25, sentence: 0.1 };
export const MASTERY_THRESHOLD = 80;

export const DEFAULT_STATE: AppState = {
  version: 2,
  startedAt: '',
  words: {},
  phonemeStats: {},
  errorStats: {},
  retests: {},
  log: {},
  settings: { rate: 1 },
  profile: { onboarded: false, ipaStyle: 'phonemic' },
};

/* ============================== Ngày tháng ============================== */

export function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDays(key: string, n: number): string {
  const [y, m, d] = key.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + n);
  return todayKey(dt);
}

/* ============================== Lưu trữ ============================== */

let state: AppState = DEFAULT_STATE;
let loaded = false;
const listeners = new Set<() => void>();

function blankWord(today: string): WordProgress {
  return { status: 'new', step: 0, interval: 0, due: today, last: today, reps: 0, lapses: 0, listen: { c: 0, t: 0 }, pron: null, retention: null, sentence: null, goodDays: [] };
}

/** Chuyển dữ liệu phiên bản 1 sang 2. */
function migrate(raw: Record<string, unknown>): AppState {
  if (raw.version === 2) {
    const r = raw as unknown as AppState;
    return { ...DEFAULT_STATE, ...r, settings: { ...DEFAULT_STATE.settings, ...r.settings }, profile: { ...DEFAULT_STATE.profile, ...r.profile } };
  }
  const v1 = raw as { startedAt?: string; words?: Record<string, { status: string; reps: number; lapses: number; interval: number; due: string; last: string; rating?: Rating }>; phonemeIssues?: Record<string, number>; log?: Record<string, DayLog>; settings?: { rate: number } };
  const words: Record<string, WordProgress> = {};
  for (const [slug, w] of Object.entries(v1.words ?? {})) {
    const step = Math.max(0, INTERVALS.findIndex((x) => x >= (w.interval || 1)));
    words[slug] = {
      ...blankWord(w.last),
      status: w.status === 'new' ? 'new' : w.rating === 1 ? 'needs-practice' : 'learning',
      step, interval: w.interval, due: w.due, last: w.last, reps: w.reps, lapses: w.lapses,
      pron: w.rating ? RATING_SCORE[w.rating] : null, rating: w.rating,
    };
  }
  const phonemeStats: AppState['phonemeStats'] = {};
  for (const [id, n] of Object.entries(v1.phonemeIssues ?? {})) phonemeStats[id] = { lc: 0, lt: 0, sg: 0, st: n };
  return { ...DEFAULT_STATE, startedAt: v1.startedAt || todayKey(), words, phonemeStats, log: v1.log ?? {}, settings: { ...DEFAULT_STATE.settings, ...(v1.settings ?? {}) } };
}

function load(): void {
  if (loaded || typeof window === 'undefined') return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    state = raw ? migrate(JSON.parse(raw)) : { ...DEFAULT_STATE, startedAt: todayKey() };
  } catch {
    state = { ...DEFAULT_STATE, startedAt: todayKey() };
  }
}

function persist(): void {
  try { window.localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* bộ nhớ đầy hoặc bị chặn */ }
}

function emit(): void { listeners.forEach((l) => l()); }

export function getState(): AppState { load(); return state; }

export function setState(updater: (s: AppState) => AppState): void {
  load();
  state = updater(state);
  persist();
  emit();
}

function subscribe(l: () => void): () => void {
  listeners.add(l);
  return () => { listeners.delete(l); };
}

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, getState, () => DEFAULT_STATE);
}

/** true khi đã đọc localStorage (tránh nhấp nháy số liệu lúc hydrate). */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, () => { load(); return loaded; }, () => false);
}

/* ============================== Điểm Word Mastery ============================== */

export interface MasteryBreakdown { listen: number | null; pron: number | null; retention: number | null; sentence: number | null; total: number }

export function mastery(p: WordProgress | undefined): MasteryBreakdown {
  if (!p) return { listen: null, pron: null, retention: null, sentence: null, total: 0 };
  const listen = p.listen.t ? Math.round((100 * p.listen.c) / p.listen.t) : null;
  const total = Math.round(
    MASTERY_WEIGHTS.listen * (listen ?? 0) +
    MASTERY_WEIGHTS.pron * (p.pron ?? 0) +
    MASTERY_WEIGHTS.retention * (p.retention ?? 0) +
    MASTERY_WEIGHTS.sentence * (p.sentence ?? 0),
  );
  return { listen, pron: p.pron, retention: p.retention, sentence: p.sentence, total };
}

function isMastered(p: WordProgress): boolean {
  return mastery(p).total >= MASTERY_THRESHOLD && p.goodDays.length >= 3 && p.step >= 3;
}

const ema = (prev: number | null, x: number) => (prev === null ? x : Math.round(prev * 0.6 + x * 0.4));

function bump(log: Record<string, DayLog>, field: keyof DayLog): Record<string, DayLog> {
  const k = todayKey();
  const cur = log[k] ?? { learned: 0, reviewed: 0 };
  return { ...log, [k]: { ...cur, [field]: cur[field] + 1 } };
}

function tallyPhonemes(stats: AppState['phonemeStats'], checked: string[], weak: string[], kind: 'listen' | 'speak', ok?: boolean): AppState['phonemeStats'] {
  const out = { ...stats };
  for (const id of new Set(checked)) {
    const cur = out[id] ?? { lc: 0, lt: 0, sg: 0, st: 0 };
    const good = ok ?? !weak.includes(id);
    out[id] = kind === 'listen'
      ? { ...cur, lc: cur.lc + (good ? 1 : 0), lt: cur.lt + 1 }
      : { ...cur, sg: cur.sg + (good ? 1 : 0), st: cur.st + 1 };
  }
  return out;
}

function tallyCodes(stats: Record<string, Tally>, codes: string[], ok: boolean): Record<string, Tally> {
  const out = { ...stats };
  for (const c of new Set(codes)) {
    const cur = out[c] ?? { c: 0, t: 0 };
    out[c] = { c: cur.c + (ok ? 1 : 0), t: cur.t + 1 };
  }
  return out;
}

export interface RateInput {
  slug: string;
  rating: Rating;
  /** các âm được đem ra kiểm (hiện cho người học tự đánh dấu) */
  checked?: string[];
  /** các âm người học đánh dấu chưa ổn */
  weak?: string[];
  /** mã lỗi liên quan tới các âm chưa ổn */
  weakCodes?: string[];
  /** 'learn' khi học lần đầu, 'review' khi ôn sau giãn cách */
  kind?: 'learn' | 'review';
}

/** Ghi nhận một lần tự đánh giá phát âm từ và cập nhật lịch ôn tập. */
export function rateWord({ slug, rating, checked = [], weak = [], weakCodes = [], kind }: RateInput): void {
  setState((s) => {
    const today = todayKey();
    const prev = s.words[slug];
    const isNew = !prev || prev.status === 'new';
    // Chỉ tính là "ôn sau giãn cách" khi lần trước ở một ngày khác.
    const mode = kind ?? (isNew || prev.last === today ? 'learn' : 'review');
    const p: WordProgress = { ...(prev ?? blankWord(today)) };
    p.reps += 1;
    p.rating = rating;
    p.last = today;
    const score = RATING_SCORE[rating];
    p.pron = ema(p.pron, score);
    if (mode === 'review') {
      p.retention = ema(p.retention, score);
      if (rating >= 2 && !p.goodDays.includes(today)) p.goodDays = [...p.goodDays, today].slice(-6);
    }
    if (rating === 1) {
      p.step = 0;
      p.lapses += 1;
    } else if (rating === 3 && !isNew) {
      p.step = Math.min(INTERVALS.length - 1, p.step + 1);
    }
    p.interval = INTERVALS[p.step];
    p.due = addDays(today, p.interval);
    p.status = rating === 1 ? 'needs-practice' : isMastered(p) ? 'mastered' : p.step >= 2 ? 'review' : 'learning';

    const phonemeStats = tallyPhonemes(s.phonemeStats, checked.length ? checked : weak, weak, 'speak');
    let errorStats = s.errorStats;
    if (weakCodes.length) errorStats = tallyCodes(errorStats, weakCodes, false);
    return { ...s, words: { ...s.words, [slug]: p }, phonemeStats, errorStats, log: bump(s.log, isNew ? 'learned' : 'reviewed') };
  });
}

/** Đánh dấu đã học xong bài mà không tự đánh giá. */
export function markLearned(slug: string): void {
  setState((s) => {
    if (s.words[slug] && s.words[slug].status !== 'new') return s;
    const today = todayKey();
    return {
      ...s,
      words: { ...s.words, [slug]: { ...blankWord(today), status: 'learning', reps: 1, interval: 1, due: addDays(today, 1) } },
      log: bump(s.log, 'learned'),
    };
  });
}

/** Ghi nhận một câu nghe phân biệt (cho từ, âm và mã lỗi liên quan). */
export function recordListen(opts: { slug?: string; correct: boolean; phonemes?: string[]; codes?: string[] }): void {
  setState((s) => {
    let words = s.words;
    if (opts.slug) {
      const today = todayKey();
      const p = { ...(s.words[opts.slug] ?? blankWord(today)) };
      p.listen = { c: p.listen.c + (opts.correct ? 1 : 0), t: p.listen.t + 1 };
      words = { ...words, [opts.slug]: p };
    }
    return {
      ...s,
      words,
      phonemeStats: tallyPhonemes(s.phonemeStats, opts.phonemes ?? [], [], 'listen', opts.correct),
      errorStats: tallyCodes(s.errorStats, opts.codes ?? [], opts.correct),
    };
  });
}

/** Ghi nhận tự đánh giá cho âm (không gắn với một từ cụ thể). */
export function recordSpeak(phonemes: string[], ok: boolean, codes: string[] = []): void {
  setState((s) => ({
    ...s,
    phonemeStats: tallyPhonemes(s.phonemeStats, phonemes, [], 'speak', ok),
    errorStats: codes.length ? tallyCodes(s.errorStats, codes, ok) : s.errorStats,
  }));
}

export function recordSentence(slug: string, rating: Rating): void {
  setState((s) => {
    const p = s.words[slug];
    if (!p) return s;
    return { ...s, words: { ...s.words, [slug]: { ...p, sentence: ema(p.sentence, RATING_SCORE[rating]) } } };
  });
}

/* ============================== Bài chữa lỗi: kiểm tra lại ============================== */

export function startRetest(code: string): void {
  setState((s) => {
    const today = todayKey();
    return { ...s, retests: { ...s.retests, [code]: { started: today, d1: addDays(today, 1), d3: addDays(today, 3), results: {} } } };
  });
}

export function completeRetest(code: string, which: 'd1' | 'd3', rating: Rating): void {
  setState((s) => {
    const r = s.retests[code];
    if (!r) return s;
    return {
      ...s,
      retests: { ...s.retests, [code]: { ...r, results: { ...r.results, [which]: rating } } },
      errorStats: tallyCodes(s.errorStats, [code], rating >= 2),
    };
  });
}

/** Các lượt kiểm tra lại đã đến hạn. */
export function dueRetests(s: AppState, today = todayKey()): { code: string; which: 'd1' | 'd3' }[] {
  const out: { code: string; which: 'd1' | 'd3' }[] = [];
  for (const [code, r] of Object.entries(s.retests)) {
    if (!r.results.d1 && r.d1 <= today) out.push({ code, which: 'd1' });
    else if (r.results.d1 && !r.results.d3 && r.d3 <= today) out.push({ code, which: 'd3' });
  }
  return out;
}

/* ============================== Hồ sơ và cài đặt ============================== */

export function setRate(rate: number): void {
  setState((s) => ({ ...s, settings: { ...s.settings, rate } }));
}

export function updateProfile(patch: Partial<Profile>): void {
  setState((s) => ({ ...s, profile: { ...s.profile, ...patch } }));
}

export function resetProgress(): void {
  setState(() => ({ ...DEFAULT_STATE, startedAt: todayKey() }));
}

/* ============================== Truy vấn ============================== */

export function learnedSlugs(s: AppState): string[] {
  return Object.keys(s.words).filter((k) => s.words[k].status !== 'new');
}

export function dueSlugs(s: AppState, today = todayKey()): string[] {
  return Object.keys(s.words)
    .filter((k) => s.words[k].status !== 'new' && s.words[k].due <= today)
    .sort((a, b) => (s.words[a].status === 'needs-practice' ? -1 : 0) - (s.words[b].status === 'needs-practice' ? -1 : 0));
}

export function needsPracticeSlugs(s: AppState): string[] {
  return Object.keys(s.words).filter((k) => s.words[k].status === 'needs-practice');
}

export interface SkillScore { id: string; score: number; n: number }

/** Điểm 0–100 của một âm, làm mượt bằng tiên nghiệm Beta(1,1) để một lần thử không quyết định tất cả. */
export function phonemeScore(st: { lc: number; lt: number; sg: number; st: number } | undefined): SkillScore | null {
  if (!st) return null;
  const n = st.lt + st.st;
  if (!n) return null;
  return { id: '', score: Math.round((100 * (st.lc + st.sg + 1)) / (n + 2)), n };
}

export function errorScore(t: Tally | undefined): SkillScore | null {
  if (!t || !t.t) return null;
  return { id: '', score: Math.round((100 * (t.c + 1)) / (t.t + 2)), n: t.t };
}

/** Các âm yếu nhất (ưu tiên âm có đủ dữ liệu). */
export function weakPhonemeIds(s: AppState, limit = 3): SkillScore[] {
  return Object.entries(s.phonemeStats)
    .map(([id, st]) => { const sc = phonemeScore(st); return sc ? { ...sc, id } : null; })
    .filter((x): x is SkillScore => !!x && x.score < 75)
    .sort((a, b) => a.score - b.score || b.n - a.n)
    .slice(0, limit);
}

export function weakErrorCodes(s: AppState, limit = 2): SkillScore[] {
  return Object.entries(s.errorStats)
    .map(([id, t]) => { const sc = errorScore(t); return sc ? { ...sc, id } : null; })
    .filter((x): x is SkillScore => !!x && x.score < 70)
    .sort((a, b) => a.score - b.score || b.n - a.n)
    .slice(0, limit);
}

/** Số ngày học liên tiếp tính đến hôm nay (hoặc hôm qua). */
export function streakDays(s: AppState): number {
  let n = 0;
  let k = todayKey();
  if (!s.log[k]) k = addDays(k, -1);
  while (s.log[k] && (s.log[k].learned > 0 || s.log[k].reviewed > 0)) {
    n += 1;
    k = addDays(k, -1);
  }
  return n;
}

export const STATUS_LABEL: Record<WordStatus, string> = {
  new: 'Chưa học',
  learning: 'Đang học',
  review: 'Đang củng cố',
  'needs-practice': 'Cần luyện lại',
  mastered: 'Thành thạo',
};
