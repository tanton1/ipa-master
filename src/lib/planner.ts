/**
 * Engine 5 – Adaptive Planner: chọn việc tiếp theo dựa trên lịch sử học.
 * Ưu tiên: kiểm tra lại bài chữa lỗi → bài chữa lỗi cho mã yếu nhất → ôn đến hạn → học mới.
 */
import type { AppState } from './store';
import { dueRetests, dueSlugs, learnedSlugs, needsPracticeSlugs, weakErrorCodes, weakPhonemeIds, todayKey } from './store';
import { WORDS, lessonIndexFor, lessonWords } from './curriculum';
import { getVei, type ErrorCode } from '@/data/vei';
import { codeForPhoneme } from './coach';

export type PlanAction =
  | { type: 'diagnostic' }
  | { type: 'retest'; code: ErrorCode; which: 'd1' | 'd3' }
  | { type: 'error-lesson'; code: ErrorCode; reason: string }
  | { type: 'review'; count: number }
  | { type: 'learn'; slug: string; word: string; remaining: number };

export function priorityCodes(s: AppState): { code: ErrorCode; reason: string }[] {
  const out: { code: ErrorCode; reason: string }[] = [];
  for (const e of weakErrorCodes(s, 2)) out.push({ code: e.id as ErrorCode, reason: `Điểm nhóm lỗi ${e.score}/100 sau ${e.n} lượt` });
  for (const p of weakPhonemeIds(s, 4)) {
    const code = codeForPhoneme(p.id);
    if (code && !out.some((x) => x.code === code)) out.push({ code, reason: `Âm liên quan có điểm ${p.score}/100 sau ${p.n} lượt` });
    if (out.length >= 2) break;
  }
  return out.slice(0, 2);
}

export function planToday(s: AppState): PlanAction[] {
  const actions: PlanAction[] = [];
  if (!s.profile.diagnosticAt) actions.push({ type: 'diagnostic' });
  for (const r of dueRetests(s)) actions.push({ type: 'retest', code: r.code as ErrorCode, which: r.which });
  const needs = needsPracticeSlugs(s).length;
  const codes = priorityCodes(s);
  if (codes.length && (needs >= 2 || codes.length)) {
    const c = codes[0];
    if (getVei(c.code) && !s.retests[c.code]) actions.push({ type: 'error-lesson', code: c.code, reason: c.reason });
  }
  const due = dueSlugs(s, todayKey()).length;
  if (due) actions.push({ type: 'review', count: due });
  const learned = learnedSlugs(s).length;
  const today = lessonWords(lessonIndexFor(learned));
  const next = today.find((w) => !s.words[w.slug] || s.words[w.slug].status === 'new') ?? WORDS.find((w) => !s.words[w.slug] || s.words[w.slug].status === 'new');
  const learnedToday = s.log[todayKey()]?.learned ?? 0;
  if (next) actions.push({ type: 'learn', slug: next.slug, word: next.word, remaining: Math.max(0, 10 - learnedToday) });
  return actions;
}
