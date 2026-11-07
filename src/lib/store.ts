'use client';

import { useSyncExternalStore } from 'react';

export type WordStatus = 'new' | 'learning' | 'review' | 'mastered';
export type Rating = 1 | 2 | 3;

export interface WordProgress {
  status: WordStatus;
  reps: number;
  lapses: number;
  ease: number;
  /** khoảng cách ôn (ngày) */
  interval: number;
  /** ngày đến hạn YYYY-MM-DD */
  due: string;
  last: string;
  rating?: Rating;
}

export interface DayLog { learned: number; reviewed: number }

export interface AppState {
  version: 1;
  startedAt: string;
  words: Record<string, WordProgress>;
  /** số lần người học tự đánh dấu "chưa ổn" cho từng âm vị */
  phonemeIssues: Record<string, number>;
  log: Record<string, DayLog>;
  settings: { rate: number; voiceURI?: string };
}

const KEY = 'ipa-master:v1';

export const DEFAULT_STATE: AppState = {
  version: 1,
  startedAt: '',
  words: {},
  phonemeIssues: {},
  log: {},
  settings: { rate: 1 },
};

let state: AppState = DEFAULT_STATE;
let loaded = false;
const listeners = new Set<() => void>();

export function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(key: string, n: number): string {
  const [y, m, d] = key.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + n);
  return todayKey(dt);
}

function load(): void {
  if (loaded || typeof window === 'undefined') return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppState>;
      state = { ...DEFAULT_STATE, ...parsed, settings: { ...DEFAULT_STATE.settings, ...(parsed.settings ?? {}) } };
    } else {
      state = { ...DEFAULT_STATE, startedAt: todayKey() };
    }
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

/* ---------------- Ôn tập ngắt quãng (SM-2 rút gọn) ---------------- */

function bump(log: Record<string, DayLog>, field: keyof DayLog): Record<string, DayLog> {
  const k = todayKey();
  const cur = log[k] ?? { learned: 0, reviewed: 0 };
  return { ...log, [k]: { ...cur, [field]: cur[field] + 1 } };
}

export function rateWord(slug: string, rating: Rating, weakPhonemes: string[] = []): void {
  setState((s) => {
    const prev = s.words[slug];
    const isNew = !prev || prev.status === 'new';
    let ease = prev?.ease ?? 2.3;
    let interval = prev?.interval ?? 0;
    let lapses = prev?.lapses ?? 0;
    const reps = (prev?.reps ?? 0) + 1;

    if (rating === 1) {
      interval = 0;
      lapses += 1;
      ease = Math.max(1.3, ease - 0.2);
    } else if (rating === 2) {
      interval = Math.max(1, Math.round(interval * 1.2));
      ease = Math.max(1.3, ease - 0.05);
    } else {
      if (reps <= 1 || interval === 0) interval = 1;
      else if (interval === 1) interval = 3;
      else interval = Math.round(interval * ease);
      ease = Math.min(3, ease + 0.1);
    }

    const status: WordStatus = rating === 1 ? 'learning' : interval >= 21 ? 'mastered' : interval >= 3 ? 'review' : 'learning';
    const today = todayKey();
    const words = {
      ...s.words,
      [slug]: { status, reps, lapses, ease, interval, due: addDays(today, interval), last: today, rating },
    };
    const phonemeIssues = { ...s.phonemeIssues };
    for (const p of weakPhonemes) phonemeIssues[p] = (phonemeIssues[p] ?? 0) + 1;
    const log = bump(s.log, isNew ? 'learned' : 'reviewed');
    return { ...s, words, phonemeIssues, log };
  });
}

/** Đánh dấu đã học (dùng khi hoàn thành bài mà không chấm). */
export function markLearned(slug: string): void {
  setState((s) => {
    if (s.words[slug] && s.words[slug].status !== 'new') return s;
    const today = todayKey();
    return {
      ...s,
      words: { ...s.words, [slug]: { status: 'learning', reps: 1, lapses: 0, ease: 2.3, interval: 1, due: addDays(today, 1), last: today } },
      log: bump(s.log, 'learned'),
    };
  });
}

export function setRate(rate: number): void {
  setState((s) => ({ ...s, settings: { ...s.settings, rate } }));
}

export function resetProgress(): void {
  setState(() => ({ ...DEFAULT_STATE, startedAt: todayKey() }));
}

/* ---------------- Truy vấn ---------------- */

export function learnedSlugs(s: AppState): string[] {
  return Object.keys(s.words).filter((k) => s.words[k].status !== 'new');
}

export function dueSlugs(s: AppState, today = todayKey()): string[] {
  return Object.keys(s.words).filter((k) => s.words[k].status !== 'new' && s.words[k].due <= today);
}

export function weakPhonemeIds(s: AppState, limit = 3): { id: string; count: number }[] {
  return Object.entries(s.phonemeIssues)
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count)
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
