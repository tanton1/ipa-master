'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useAppState, useHydrated, dueSlugs, needsPracticeSlugs, rateWord, type Rating } from '@/lib/store';
import { getWord } from '@/lib/curriculum';
import { getPhoneme } from '@/data/phonemes';
import { riskyPhonemes } from '@/lib/errors';
import { buildFeedback, selfAssessments, codeForPhoneme, type CoachFeedback } from '@/lib/coach';
import type { AudioQuality } from '@/lib/audio-quality';
import { ProgressBar } from './ProgressBar';
import { PlayButton } from './PlayButton';
import { Recorder } from './Recorder';
import { Ipa } from './Ipa';
import { WordRow } from './WordRow';
import { IconRepeat, IconCheck } from './icons';

export function ReviewClient() {
  const s = useAppState();
  const hydrated = useHydrated();
  const due = useMemo(() => dueSlugs(s).map((slug) => getWord(slug)).filter((w): w is NonNullable<typeof w> => !!w), [s]);
  const needs = needsPracticeSlugs(s).map((slug) => getWord(slug)).filter((w): w is NonNullable<typeof w> => !!w);

  const [session, setSession] = useState<string[] | null>(null);
  const [i, setI] = useState(0);
  const [reveal, setReveal] = useState(false);
  const [quality, setQuality] = useState<AudioQuality | null>(null);
  const [recorded, setRecorded] = useState(false);
  const [ab, setAb] = useState(false);
  const [weakSel, setWeakSel] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<Rating[]>([]);
  const [lastFeedback, setLastFeedback] = useState<{ word: string; fb: CoachFeedback } | null>(null);
  const cur = session ? getWord(session[i] ?? '') : undefined;
  const sessionDone = session !== null && i >= session.length;

  function start() {
    setSession(due.map((w) => w.slug));
    setI(0); setReveal(false); setRecorded(false); setAb(false); setQuality(null); setWeakSel(new Set()); setResults([]); setLastFeedback(null);
  }
  function answer(r: Rating) {
    if (!cur) return;
    const risky = riskyPhonemes(cur);
    const weak = r === 3 ? [] : Array.from(weakSel);
    rateWord({ slug: cur.slug, rating: r, checked: risky, weak, weakCodes: weak.map((id) => codeForPhoneme(id, cur)).filter((c): c is NonNullable<typeof c> => !!c), kind: 'review' });
    setLastFeedback({ word: cur.word, fb: buildFeedback(cur, selfAssessments(risky, weak, ab), recorded ? quality : null) });
    setResults((x) => [...x, r]);
    setI((n) => n + 1); setReveal(false); setRecorded(false); setAb(false); setQuality(null); setWeakSel(new Set());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (session && !sessionDone && cur) {
    const risky = riskyPhonemes(cur);
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>Ôn tập {i + 1}/{session.length}</span>
          <button type="button" onClick={() => setSession(null)} className="font-semibold text-primary">Thoát</button>
        </div>
        <ProgressBar value={i} max={session.length} label="Tiến độ phiên ôn" />
        {lastFeedback && lastFeedback.fb.kind === 'fix' ? (
          <p className="rounded-xl bg-danger-soft/60 p-3 text-xs"><span className="font-semibold">{lastFeedback.word}: </span>{lastFeedback.fb.title}. {lastFeedback.fb.focus[0]?.code ? <Link href={`/errors/${lastFeedback.fb.focus[0].code}`} className="font-semibold text-primary underline">Mở bài sửa {lastFeedback.fb.focus[0].code}</Link> : null}</p>
        ) : null}
        <section className="card p-5 text-center">
          <p className="eyebrow text-muted">Nói từ này trước khi xem đáp án</p>
          <h2 className="mt-1 text-4xl font-bold">{cur.word}</h2>
          <p className="mt-1 text-sm text-muted">{cur.meaning}</p>
          {reveal ? (
            <>
              <Ipa value={cur.ipa} className="mt-3 block text-2xl text-primary" />
              <div className="mt-3 flex items-start justify-center gap-8">
                <PlayButton text={cur.word} size="lg" variant="primary" label="Nghe" />
                <PlayButton text={cur.exampleEn} size="lg" variant="soft" label="Trong câu" />
              </div>
              <p className="mt-2 text-sm text-muted">{cur.exampleEn}</p>
            </>
          ) : (
            <button type="button" onClick={() => setReveal(true)} className="tap mt-4 rounded-2xl bg-primary px-6 py-3 font-semibold text-primary-ink">Nói rồi xem đáp án</button>
          )}
        </section>
        {reveal ? (
          <>
            <section className="card p-4">
              <h3 className="font-bold">Ghi âm và nghe A/B</h3>
              <div className="mt-2"><Recorder modelText={cur.word} onRecorded={(_, q) => { setRecorded(true); setQuality(q); }} onListenedAB={() => setAb(true)} compact /></div>
            </section>
            <section className="card p-4">
              <p className="text-sm font-medium">Âm nào chưa ổn?</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {risky.map((id) => {
                  const p = getPhoneme(id); const on = weakSel.has(id);
                  return p ? <li key={id}><button type="button" onClick={() => setWeakSel((x) => { const n = new Set(x); if (n.has(id)) n.delete(id); else n.add(id); return n; })} aria-pressed={on} className={`tap ipa rounded-xl border px-3 py-2 text-lg font-semibold ${on ? 'border-danger bg-danger-soft text-danger' : 'border-line bg-surface'}`}>/{p.symbol}/</button></li> : null;
                })}
              </ul>
              <p className="mt-4 text-sm font-medium">Bạn đọc từ này thế nào?</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <button type="button" onClick={() => answer(1)} className="tap rounded-xl border-2 border-danger bg-danger-soft py-3 text-sm font-semibold text-danger">Chưa ổn</button>
                <button type="button" onClick={() => answer(2)} className="tap rounded-xl border-2 border-warn bg-warn-soft py-3 text-sm font-semibold text-warn">Tạm được</button>
                <button type="button" onClick={() => answer(3)} className="tap rounded-xl border-2 border-accent bg-accent-soft py-3 text-sm font-semibold text-accent">Tốt</button>
              </div>
            </section>
            <Link href={`/words/${String(cur.group).padStart(2, '0')}/${cur.slug}`} className="text-center text-sm font-semibold text-primary">Mở bài học đầy đủ của từ này</Link>
          </>
        ) : null}
      </div>
    );
  }

  if (sessionDone && session) {
    const good = results.filter((r) => r === 3).length;
    const bad = results.filter((r) => r === 1).length;
    return (
      <section className="card p-5 text-center">
        <p className="inline-flex items-center gap-2 text-lg font-bold text-accent"><IconCheck size={22} /> Xong phiên ôn tập</p>
        <p className="mt-2 text-3xl font-bold tabular-nums">{results.length} từ</p>
        <p className="mt-1 text-sm text-muted">{good} tốt • {results.length - good - bad} tạm được • {bad} cần luyện lại</p>
        <p className="mt-3 text-xs text-muted">Từ "chưa ổn" chuyển sang Cần luyện lại và quay lại ngày mai; từ "tốt" được giãn lịch theo chu kỳ 1 → 3 → 7 → 14 → 30 ngày.</p>
        <button type="button" onClick={() => setSession(null)} className="tap mt-4 rounded-2xl bg-primary px-6 py-3 font-semibold text-primary-ink">Quay lại</button>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <section className="card p-4">
        <h2 className="flex items-center gap-1.5 text-lg font-extrabold"><IconRepeat size={18} className="text-primary" /> Ôn tập ngắt quãng</h2>
        <p className="mt-1 text-sm text-muted">
          {!hydrated ? 'Đang tải…' : due.length ? `${due.length} từ đến hạn hôm nay. Từ cần luyện lại được xếp lên trước.` : 'Hôm nay không có từ nào đến hạn.'}
        </p>
        {due.length ? (
          <>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {due.slice(0, 14).map((w) => <li key={w.slug} className={`rounded-full px-2.5 py-1 text-xs ${s.words[w.slug]?.status === 'needs-practice' ? 'bg-danger-soft text-danger' : 'bg-surface-2'}`}>{w.word}</li>)}
              {due.length > 14 ? <li className="rounded-full px-2 py-1 text-xs text-muted">+{due.length - 14}</li> : null}
            </ul>
            <button type="button" onClick={start} className="tap mt-4 w-full rounded-2xl bg-primary py-3 font-semibold text-primary-ink">Bắt đầu ôn ({due.length} từ)</button>
          </>
        ) : (
          <Link href="/words" className="tap mt-4 block w-full rounded-2xl border border-line bg-surface py-3 text-center text-sm font-semibold">Học từ mới</Link>
        )}
      </section>

      {needs.length ? (
        <section>
          <h2 className="mb-2 text-lg font-extrabold">Cần luyện lại <span className="text-sm font-normal text-muted">({needs.length})</span></h2>
          <ul className="flex flex-col gap-2">{needs.slice(0, 10).map((w) => <WordRow key={w.slug} w={w} showMeta />)}</ul>
        </section>
      ) : null}
    </div>
  );
}
