'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { WordEntry } from '@/data/types';
import { POS_LABEL } from '@/data/types';
import { getPhoneme } from '@/data/phonemes';
import { getContrast } from '@/data/contrast';
import { getVei } from '@/data/vei';
import { getUnit, WEEKDAYS } from '@/data/units';
import { getGold, GOLD_TYPE_LABEL } from '@/data/gold';
import { analyzeIpa, syllableText } from '@/lib/ipa';
import { articulationSteps, wordIssues, riskyPhonemes } from '@/lib/errors';
import { buildFeedback, selfAssessments, codeForPhoneme, type CoachFeedback } from '@/lib/coach';
import { DIFFICULTY_LABEL } from '@/lib/classify';
import type { AudioQuality } from '@/lib/audio-quality';
import { useTts } from '@/lib/tts';
import { rateWord, markLearned, recordListen, recordSentence, mastery, useAppState, STATUS_LABEL, MASTERY_WEIGHTS, MASTERY_THRESHOLD, type Rating } from '@/lib/store';
import { PlayButton } from './PlayButton';
import { Recorder } from './Recorder';
import { IpaChips } from './IpaChips';
import { MouthDiagram } from './MouthDiagram';
import { Ipa, displayIpa, useIpaStyle } from './Ipa';
import { IconEar, IconBulb, IconMouth, IconMic, IconChat, IconCheck, IconChevronLeft, IconChevronRight, IconAlert, IconArrowRight, IconStar, IconWrench } from './icons';

interface Nav { slug: string; word: string }
interface Props { w: WordEntry; groupSlug: string; next?: Nav; prev?: Nav }

const STEPS = [
  { key: 'listen', label: 'Nghe', icon: IconEar },
  { key: 'understand', label: 'Hiểu', icon: IconBulb },
  { key: 'articulate', label: 'Tạo âm', icon: IconMouth },
  { key: 'record', label: 'Ghi âm', icon: IconMic },
  { key: 'apply', label: 'Áp dụng', icon: IconChat },
] as const;

const SEVERITY = { high: 'bg-danger-soft text-danger', medium: 'bg-warn-soft text-warn', low: 'bg-surface-2 text-muted' };
const FEEDBACK_TONE: Record<CoachFeedback['kind'], string> = {
  retry: 'border-warn/40 bg-warn-soft',
  uncertain: 'border-line bg-surface-2',
  fix: 'border-danger/30 bg-danger-soft/60',
  pass: 'border-accent/40 bg-accent-soft/60',
};

function Meter({ label, value, weight }: { label: string; value: number | null; weight: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs"><span className="text-muted">{label} <span className="opacity-70">({Math.round(weight * 100)}%)</span></span><span className="font-semibold tabular-nums">{value === null ? 'chưa có' : value}</span></div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-primary" style={{ width: `${value ?? 0}%` }} /></div>
    </div>
  );
}

export function WordLesson({ w, groupSlug, next, prev }: Props) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState<boolean[]>([false, false, false, false, false]);
  const [selected, setSelected] = useState<string>(w.phonemes[0]);
  const [weak, setWeak] = useState<Set<string>>(new Set());
  const [recorded, setRecorded] = useState(false);
  const [quality, setQuality] = useState<AudioQuality | null>(null);
  const [abDone, setAbDone] = useState(false);
  const [rated, setRated] = useState<Rating | null>(null);
  const [feedback, setFeedback] = useState<CoachFeedback | null>(null);
  const [sentenceRated, setSentenceRated] = useState<Rating | null>(null);
  const [finished, setFinished] = useState(false);
  const state = useAppState();
  const progress = state.words[w.slug];
  const m = mastery(progress);
  const ipaStyle = useIpaStyle();
  const { say } = useTts();

  const gold = getGold(w.slug);
  const unit = getUnit(w.unit);
  const analysis = useMemo(() => analyzeIpa(w.ipa), [w.ipa]);
  const steps = useMemo(() => articulationSteps(w), [w]);
  const issues = useMemo(() => wordIssues(w), [w]);
  const risky = useMemo(() => riskyPhonemes(w), [w]);
  const uniquePhonemes = useMemo(() => Array.from(new Set(w.phonemes)), [w.phonemes]);
  const contrastLinks = useMemo(() => {
    const ids = new Set<string>();
    for (const id of w.phonemes) { const c = getPhoneme(id)?.contrastId; if (c) ids.add(c); }
    return Array.from(ids).map((id) => getContrast(id)).filter(Boolean);
  }, [w.phonemes]);
  const compare = useMemo(() => {
    const list: { word: string; ipa: string; slug?: string; diff?: [string, string] }[] = [];
    if (w.pair) {
      let diff: [string, string] | undefined;
      try {
        const other = analyzeIpa(w.pair.ipa).phonemeIds;
        if (other.length === w.phonemes.length) {
          const idx = w.phonemes.findIndex((id, i) => id !== other[i]);
          if (idx >= 0 && w.phonemes.filter((id, i) => id !== other[i]).length === 1) diff = [w.phonemes[idx], other[idx]];
        }
      } catch { /* bỏ qua */ }
      list.push({ ...w.pair, diff });
    }
    for (const mp of w.minimalPairs) {
      if (list.length >= 4) break;
      if (w.pair && mp.slug === w.pair.slug) continue;
      list.push(mp);
    }
    return list;
  }, [w]);

  // Bài nghe đố: từ đúng và một từ gây nhiễu
  const distractor = gold?.listen ?? (compare[0] ? { word: compare[0].word, ipa: compare[0].ipa, meaning: '' } : undefined);
  const diffPhonemes = compare[0]?.diff ?? [];
  const [quizRound, setQuizRound] = useState(0);
  const [quizTarget, setQuizTarget] = useState<'a' | 'b' | null>(null);
  const [quizAnswer, setQuizAnswer] = useState<'a' | 'b' | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const QUIZ_N = 4;
  function quizPlay() {
    if (!distractor) return;
    const t = Math.random() < 0.5 ? 'a' : 'b';
    setQuizTarget(t); setQuizAnswer(null);
    window.setTimeout(() => say(t === 'a' ? w.word : distractor.word), 150);
  }
  function quizChoose(side: 'a' | 'b') {
    if (!quizTarget || quizAnswer) return;
    setQuizAnswer(side);
    const ok = side === quizTarget;
    if (ok) setQuizScore((x) => x + 1);
    recordListen({ slug: w.slug, correct: ok, phonemes: diffPhonemes.length ? [diffPhonemes[0]] : risky.slice(0, 1), codes: w.errorCodes.slice(0, 2) });
  }

  function go(n: number) {
    setDone((d) => { const c = [...d]; c[step] = true; return c; });
    setStep(Math.max(0, Math.min(STEPS.length - 1, n)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function toggleWeak(id: string) {
    setWeak((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }
  function doRate(r: Rating) {
    const weakList = r === 3 ? [] : Array.from(weak);
    const weakCodes = weakList.map((id) => codeForPhoneme(id, w)).filter((c): c is NonNullable<typeof c> => !!c);
    rateWord({ slug: w.slug, rating: r, checked: risky, weak: weakList, weakCodes });
    setRated(r);
    setFeedback(buildFeedback(w, selfAssessments(risky, weakList, abDone), recorded ? quality : null));
    setDone((d) => { const c = [...d]; c[3] = true; return c; });
  }
  function finish() {
    if (!rated && (!progress || progress.status === 'new')) markLearned(w.slug);
    setDone([true, true, true, true, true]);
    setFinished(true);
  }

  const groupPath = `/words/${groupSlug}`;
  const StepIcon = STEPS[step].icon;
  const sentences = gold?.sentences ?? [{ en: w.exampleEn, vi: w.exampleVi }];

  return (
    <main className="flex flex-col gap-5 px-4 pt-4">
      {/* Word Identity */}
      <section className="card p-5 text-center">
        <div className="mb-2 flex flex-wrap items-center justify-center gap-1.5 text-[11px] font-semibold">
          <span className="rounded-full bg-surface-2 px-2 py-0.5">{DIFFICULTY_LABEL[w.difficulty - 1]}</span>
          {gold ? <span className="inline-flex items-center gap-1 rounded-full bg-warn-soft px-2 py-0.5 text-warn"><IconStar size={11} /> Gold Set • {GOLD_TYPE_LABEL[gold.type]}</span> : null}
          <span className="rounded-full bg-surface-2 px-2 py-0.5 text-muted">Nháp</span>
        </div>
        <h2 className="text-4xl font-bold tracking-tight">{w.word}</h2>
        <p className="ipa mt-1 text-2xl text-primary">
          /{analysis.syllableGroups.map((g, i) => {
            const v = g.find((t) => t.isVowel);
            const stressed = v?.stress === 1;
            return (
              <span key={i} className={stressed && w.syllables > 1 ? 'font-semibold underline decoration-2 underline-offset-4' : ''}>
                {stressed && w.syllables > 1 ? 'ˈ' : v?.stress === 2 ? 'ˌ' : ''}{displayIpa(syllableText(g), ipaStyle)}{i < analysis.syllableGroups.length - 1 ? '·' : ''}
              </span>
            );
          })}/
        </p>
        <p className="mt-2 text-sm text-muted">{POS_LABEL[w.pos] ?? w.pos} • {w.meaning}</p>
        {gold ? <p className="mt-2 text-xs font-medium text-primary">Trọng tâm: {gold.focus}</p> : null}
        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          {w.errorCodes.map((c) => (
            <Link key={c} href={`/errors/${c}`} className="tap rounded-full border border-line bg-surface px-2 py-0.5 text-[11px] font-semibold" title={getVei(c)?.title}>{c} {getVei(c)?.short}</Link>
          ))}
        </div>
        {unit ? <p className="mt-2 text-[11px] text-muted">Tuần {w.week} • {WEEKDAYS[w.day - 1]} • Cụm {unit.index}: {unit.title}</p> : null}
      </section>

      {/* Thanh 5 bước */}
      <nav aria-label="Các bước luyện" className="card flex items-stretch p-1">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const active = i === step;
          return (
            <button key={s.key} type="button" onClick={() => go(i)} aria-current={active ? 'step' : undefined}
              className={`tap relative flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 text-[11px] font-medium ${active ? 'bg-primary text-primary-ink' : done[i] ? 'text-accent' : 'text-muted'}`}>
              <Icon size={18} />
              {s.label}
              {done[i] && !active ? <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-accent" /> : null}
            </button>
          );
        })}
      </nav>

      <p className="-mt-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary"><StepIcon size={14} /> Bước {step + 1}/5 · {STEPS[step].label}</p>

      {/* BƯỚC 1: NGHE (Native Audio + Contrast Practice) */}
      {step === 0 ? (
        <>
          <section className="card flex flex-col items-center gap-4 p-5">
            <div className="flex items-start gap-8">
              <PlayButton text={w.word} size="lg" variant="primary" label="Bình thường" />
              <PlayButton text={w.word} mode="slow" size="lg" variant="soft" label="Chậm" />
            </div>
            <p className="text-center text-sm text-muted">
              Nghe ít nhất 3 lần. Chú ý {risky.slice(0, 3).map((id, i) => <span key={id}><span className="ipa font-semibold text-ink">/{displayIpa(getPhoneme(id)?.symbol ?? '', ipaStyle)}/</span>{i < Math.min(3, risky.length) - 1 ? ', ' : ''}</span>)}
              {w.syllables > 1 ? <> và trọng âm ở âm tiết thứ {w.stress + 1}</> : null}.
            </p>
          </section>

          {distractor ? (
            <section className="card p-4" aria-labelledby="quiz-title">
              <div className="flex items-baseline justify-between">
                <h3 id="quiz-title" className="font-semibold">Bạn nghe thấy từ nào?</h3>
                <span className="text-xs tabular-nums text-muted">{Math.min(quizRound, QUIZ_N)}/{QUIZ_N} • đúng {quizScore}</span>
              </div>
              {quizRound >= QUIZ_N ? (
                <div className="mt-3 text-center">
                  <p className="text-sm">{quizScore >= 3 ? 'Bạn phân biệt tốt hai từ này.' : 'Còn nhầm. Nghe lại hai từ bên dưới vài lần.'}</p>
                  <button type="button" onClick={() => { setQuizRound(0); setQuizScore(0); setQuizTarget(null); setQuizAnswer(null); }} className="tap mt-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold">Làm lại</button>
                </div>
              ) : !quizTarget ? (
                <button type="button" onClick={quizPlay} className="tap mt-3 w-full rounded-2xl bg-primary py-3 font-semibold text-primary-ink">Phát âm thanh</button>
              ) : (
                <>
                  <div className="my-3 flex justify-center"><PlayButton text={quizTarget === 'a' ? w.word : distractor.word} size="md" variant="primary" ariaLabel="Nghe lại" /></div>
                  <div className="grid grid-cols-2 gap-2">
                    {(['a', 'b'] as const).map((side) => {
                      const label = side === 'a' ? w.word : distractor.word;
                      const ipa = side === 'a' ? w.ipa : distractor.ipa;
                      const correct = quizTarget === side;
                      const cls = !quizAnswer ? 'border-line bg-surface' : correct ? 'border-accent bg-accent-soft' : quizAnswer === side ? 'border-danger bg-danger-soft' : 'border-line bg-surface opacity-60';
                      return (
                        <button key={side} type="button" disabled={!!quizAnswer} onClick={() => quizChoose(side)} className={`tap rounded-2xl border-2 px-3 py-3 text-left ${cls}`}>
                          <span className="block font-semibold">{label}</span>
                          <Ipa value={ipa} className="text-xs text-muted" />
                          {side === 'b' && distractor.meaning ? <span className="block text-[11px] text-muted">{distractor.meaning}</span> : null}
                        </button>
                      );
                    })}
                  </div>
                  {quizAnswer ? <button type="button" onClick={() => { setQuizRound((r) => r + 1); if (quizRound + 1 < QUIZ_N) quizPlay(); else setQuizTarget(null); }} className="tap mt-3 w-full rounded-2xl bg-primary py-2.5 text-sm font-semibold text-primary-ink">{quizAnswer === quizTarget ? 'Đúng. Tiếp' : 'Chưa đúng. Tiếp'}</button> : null}
                </>
              )}
            </section>
          ) : null}

          {compare.length ? (
            <section>
              <h3 className="mb-2 font-semibold">Phân biệt với từ dễ nhầm</h3>
              <ul className="card divide-y divide-line">
                {compare.map((c) => (
                  <li key={c.word} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <PlayButton text={w.word} size="sm" />
                      <div className="min-w-0"><span className="block truncate font-semibold">{w.word}</span><Ipa value={w.ipa} className="block text-xs text-muted" /></div>
                    </div>
                    <span className="ipa text-center text-xs text-muted">{c.diff ? `${getPhoneme(c.diff[0])?.symbol} ↔ ${getPhoneme(c.diff[1])?.symbol}` : '↔'}</span>
                    <div className="flex items-center justify-end gap-2 text-right">
                      <div className="min-w-0">
                        {c.slug ? <Link href={`/words/${String(w.group).padStart(2, '0')}/${c.slug}`} className="block truncate font-semibold text-primary">{c.word}</Link> : <span className="block truncate font-semibold">{c.word}</span>}
                        <Ipa value={c.ipa} className="block text-xs text-muted" />
                      </div>
                      <PlayButton text={c.word} size="sm" />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {w.homophones.length ? <p className="text-sm text-muted">Đồng âm với: <span className="font-semibold text-ink">{w.homophones.join(', ')}</span></p> : null}
        </>
      ) : null}

      {/* BƯỚC 2: HIỂU (IPA Breakdown) */}
      {step === 1 ? (
        <>
          <section className="card p-4">
            <h3 className="font-semibold">Âm tiết và trọng âm</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {analysis.syllableGroups.map((g, i) => {
                const stressed = g.find((t) => t.isVowel)?.stress === 1 && w.syllables > 1;
                return (
                  <span key={i} className={`ipa rounded-xl px-3 py-2 text-xl ${stressed ? 'bg-primary font-semibold text-primary-ink' : 'bg-surface-2'}`}>
                    {displayIpa(syllableText(g), ipaStyle)}
                    {stressed ? <span className="ml-1 font-sans text-[10px] font-semibold uppercase opacity-80">nhấn</span> : null}
                  </span>
                );
              })}
            </div>
            <p className="mt-2 text-sm text-muted">
              {w.syllables === 1 ? 'Từ một âm tiết: nói chắc, đủ âm đầu và âm cuối.' : `${w.syllables} âm tiết, trọng âm ở âm tiết thứ ${w.stress + 1}. Âm tiết nhấn to, dài và cao hơn; các âm tiết còn lại đọc nhẹ.`}
            </p>
          </section>
          {gold ? (
            <section className="card p-4">
              <h3 className="font-semibold">Giải mã phát âm</h3>
              <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {gold.breakdown.map((b, i) => (
                  <li key={i} className="rounded-xl bg-surface-2 p-3">
                    <p className="ipa text-2xl font-semibold text-primary">/{displayIpa(b.sym, ipaStyle)}/</p>
                    <p className="text-sm font-semibold">{b.label}</p>
                    <p className="text-xs text-muted">{b.note}</p>
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <section>
              <h3 className="mb-2 font-semibold">Phân tích từng âm <span className="text-xs font-normal text-muted">(chạm để xem chi tiết)</span></h3>
              <IpaChips ids={w.phonemes} size="lg" withLabel />
            </section>
          )}
          <section className="card p-4">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted">Loại từ</dt><dd className="font-medium">{POS_LABEL[w.pos] ?? w.pos}</dd>
              <dt className="text-muted">Nghĩa</dt><dd className="font-medium">{w.meaning}</dd>
              <dt className="text-muted">Âm đầu</dt><dd className="ipa">{w.initial.length ? w.initial.map((id) => getPhoneme(id)?.symbol).join('') : '—'}</dd>
              <dt className="text-muted">Nguyên âm chính</dt><dd className="ipa">{getPhoneme(w.nucleus)?.symbol ?? '—'}</dd>
              <dt className="text-muted">Âm cuối</dt><dd className="ipa">{w.final.length ? w.final.map((id) => getPhoneme(id)?.symbol).join('') : '—'}</dd>
              <dt className="text-muted">Ví dụ</dt><dd>{w.exampleEn} <span className="text-muted">— {w.exampleVi}</span></dd>
            </dl>
            {w.note ? (
              <div className="mt-3 flex gap-2 rounded-xl bg-warn-soft p-3 text-sm">
                <IconAlert size={18} className="mt-0.5 shrink-0 text-warn" />
                <p><span className="font-semibold">Lưu ý: </span>{w.note}</p>
              </div>
            ) : null}
          </section>
        </>
      ) : null}

      {/* BƯỚC 3: TẠO ÂM (Mouth Guide + Vietnamese Contrast) */}
      {step === 2 ? (
        <>
          <section>
            <h3 className="mb-2 font-semibold">Khẩu hình <span className="text-xs font-normal text-muted">(chọn âm để xem)</span></h3>
            <IpaChips ids={uniquePhonemes} selected={selected} onSelect={setSelected} />
            <div className="mt-3"><MouthDiagram phonemeId={selected} /></div>
            {(() => {
              const p = getPhoneme(selected);
              return p ? (
                <div className="card mt-3 p-4 text-sm">
                  <p className="leading-relaxed">{p.how}</p>
                  <p className="mt-2 leading-relaxed text-muted"><span className="font-semibold text-ink">So với tiếng Việt: </span>{p.vnCompare}</p>
                  <Link href={`/ipa/${p.id}`} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary">Xem chi tiết âm /{p.symbol}/ <IconArrowRight size={14} /></Link>
                </div>
              ) : null;
            })()}
          </section>
          {gold ? (
            <section className="card p-4">
              <h3 className="font-semibold">So sánh với tiếng Việt</h3>
              <p className="mt-1 text-sm leading-relaxed">{gold.vnContrast}</p>
              <h3 className="mt-4 font-semibold">Bài tập ghép âm</h3>
              <ol className="mt-2 space-y-2">
                {gold.drill.map((d, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed"><span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-ink">{i + 1}</span><span>{d}</span></li>
                ))}
              </ol>
            </section>
          ) : (
            <section className="card p-4">
              <h3 className="font-semibold">Hướng dẫn cách đọc</h3>
              <ol className="mt-2 space-y-3">
                {steps.map((st) => (
                  <li key={st.n} className={`flex gap-3 rounded-xl p-2 text-sm leading-relaxed ${st.phonemeId === selected ? 'bg-primary-soft' : ''}`}>
                    <button type="button" onClick={() => setSelected(st.phonemeId)} className="ipa flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-2 text-base font-semibold" aria-label={`Xem khẩu hình âm ${st.symbol}`}>{st.symbol}</button>
                    <span><span className="font-semibold">Bước {st.n}: </span>{st.text}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}
          <section className="card p-4">
            <h3 className="flex items-center gap-1.5 font-semibold"><IconAlert size={16} className="text-danger" /> {gold ? `${gold.errors.length} lỗi học viên cần tránh` : 'Lỗi điển hình cần phát hiện'}</h3>
            <ul className="mt-2 space-y-2">
              {gold
                ? gold.errors.map((e, i) => <li key={i} className="rounded-xl bg-surface-2 p-3 text-sm">{e}</li>)
                : issues.map((iss) => (
                  <li key={iss.id} className="rounded-xl bg-surface-2 p-3 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold">{iss.title}</p>
                      <span className="flex shrink-0 gap-1">
                        {iss.code ? <Link href={`/errors/${iss.code}`} className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-semibold">{iss.code}</Link> : null}
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${SEVERITY[iss.severity]}`}>{iss.severity === 'high' ? 'Hay sai' : iss.severity === 'medium' ? 'Chú ý' : 'Ghi chú'}</span>
                      </span>
                    </div>
                    <p className="mt-1 text-muted">{iss.detail}</p>
                  </li>
                ))}
            </ul>
          </section>
          {contrastLinks.length ? (
            <section className="flex flex-col gap-2">
              {contrastLinks.map((c) => c && (
                <Link key={c.id} href={`/contrast/${c.id}`} className="card tap flex items-center gap-3 border-primary/30 bg-primary-soft/60 px-4 py-3">
                  <span className="ipa text-xl font-semibold text-primary">{c.label}</span>
                  <span className="min-w-0 flex-1 text-sm"><span className="block font-semibold">Bài đối chiếu Việt – Anh</span><span className="block truncate text-xs text-muted">{c.subtitle}</span></span>
                  <IconChevronRight size={18} className="text-muted" />
                </Link>
              ))}
            </section>
          ) : null}
        </>
      ) : null}

      {/* BƯỚC 4: GHI ÂM (Recording + AI Feedback) */}
      {step === 3 ? (
        <>
          <section className="card p-4">
            <h3 className="font-semibold">Nghe mẫu, nói theo, ghi âm</h3>
            <p className="mt-1 text-xs text-muted">Nói từ 2–3 lần trong một lần ghi. App kiểm tra bản ghi có đủ rõ không; sau đó bấm Nghe A/B để so với mẫu.</p>
            <div className="mt-3"><Recorder modelText={w.word} onRecorded={(_, q) => { setRecorded(true); setQuality(q); setFeedback(null); setRated(null); }} onListenedAB={() => setAbDone(true)} /></div>
          </section>
          <section className="card p-4">
            <h3 className="font-semibold">Tự đánh giá</h3>
            <p className="mt-1 text-xs text-muted">{recorded ? (abDone ? 'Âm nào nghe khác mẫu? Chạm để đánh dấu (có thể bỏ trống).' : 'Nên nghe A/B trước khi đánh dấu.') : 'Nên ghi âm và nghe lại trước. Nếu không có micro, hãy nói to và tự đối chiếu với mẫu.'}</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {risky.map((id) => {
                const p = getPhoneme(id);
                const on = weak.has(id);
                return p ? (
                  <li key={id}>
                    <button type="button" onClick={() => toggleWeak(id)} aria-pressed={on} className={`tap ipa rounded-xl border px-3 py-2 text-lg font-semibold ${on ? 'border-danger bg-danger-soft text-danger' : 'border-line bg-surface'}`}>/{displayIpa(p.symbol, ipaStyle)}/</button>
                  </li>
                ) : null;
              })}
            </ul>
            <p className="mt-4 text-sm font-medium">So với mẫu, bạn đọc từ này thế nào?</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {([[1, 'Chưa ổn', 'border-danger bg-danger-soft text-danger'], [2, 'Tạm được', 'border-warn bg-warn-soft text-warn'], [3, 'Tốt', 'border-accent bg-accent-soft text-accent']] as [Rating, string, string][]).map(([r, label, cls]) => (
                <button key={r} type="button" onClick={() => doRate(r)} className={`tap rounded-xl border-2 px-2 py-3 text-sm font-semibold ${rated === r ? cls : 'border-line bg-surface'}`}>{label}</button>
              ))}
            </div>
          </section>
          {feedback ? (
            <section className={`rounded-2xl border p-4 ${FEEDBACK_TONE[feedback.kind]}`} aria-live="polite">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Phản hồi • dựa trên tự đánh giá{recorded && quality ? ' và kiểm tra bản ghi' : ''}</p>
              <h3 className="mt-1 font-semibold">{feedback.title}</h3>
              <p className="mt-1 text-sm leading-relaxed">{feedback.message}</p>
              {feedback.focus.length ? (
                <ul className="mt-3 flex flex-col gap-2">
                  {feedback.focus.map((f) => (
                    <li key={f.phonemeId} className="flex items-center gap-3 rounded-xl bg-surface p-3 text-sm">
                      <span className="ipa text-xl font-semibold text-danger">/{displayIpa(f.symbol, ipaStyle)}/</span>
                      <span className="min-w-0 flex-1 text-xs text-muted">{f.code ? `${f.code} · ${f.codeTitle}` : ''}</span>
                      {f.code ? <Link href={`/errors/${f.code}`} className="tap inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-ink"><IconWrench size={12} /> Bài sửa</Link> : null}
                    </li>
                  ))}
                </ul>
              ) : null}
              <p className="mt-3 text-sm font-semibold">Bài sửa được đề xuất</p>
              <ol className="mt-1 list-decimal space-y-0.5 pl-5 text-sm">{feedback.next.map((n) => <li key={n}>{n}</li>)}</ol>
              {rated ? <p className="mt-3 text-xs text-muted">Đã lưu. {rated === 1 ? 'Từ chuyển sang "Cần luyện lại" và quay lại vào ngày mai.' : `Ôn lại sau ${progress?.interval ?? 1} ngày.`}</p> : null}
            </section>
          ) : null}
          <p className="text-xs leading-relaxed text-muted">Chưa có AI chấm điểm tự động. Phản hồi dựa trên kiểm tra chất lượng bản ghi và đánh dấu của bạn; app không khẳng định điều không quan sát được.</p>
        </>
      ) : null}

      {/* BƯỚC 5: ÁP DỤNG (Sentence Practice + Mastery Review) */}
      {step === 4 ? (
        <>
          {sentences.map((st, i) => (
            <section key={st.en} className="card p-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Apply in context {sentences.length > 1 ? i + 1 : ''}</p>
              <p className="mt-2 text-2xl font-semibold leading-snug">{st.en}</p>
              <p className="mt-1 text-sm text-muted">{st.vi}</p>
              <div className="mt-4 flex items-start justify-center gap-8">
                <PlayButton text={st.en} size="lg" variant="primary" label="Bình thường" />
                <PlayButton text={st.en} mode="slow" size="lg" variant="soft" label="Chậm" />
              </div>
            </section>
          ))}
          <section className="card p-4">
            <h3 className="font-semibold">Nói cả câu và ghi âm</h3>
            <p className="mt-1 text-xs text-muted">Giữ đúng âm đã luyện khi nói liền. Từ mang nghĩa nói rõ, từ chức năng (a, the, to, of) nói nhẹ.</p>
            <div className="mt-3"><Recorder modelText={sentences[0].en} compact /></div>
            <p className="mt-3 text-sm font-medium">Trong câu, "{w.word}" có còn đúng không?</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {([[1, 'Bị mất'], [2, 'Tạm được'], [3, 'Giữ tốt']] as [Rating, string][]).map(([r, label]) => (
                <button key={r} type="button" disabled={!progress || progress.status === 'new'} onClick={() => { recordSentence(w.slug, r); setSentenceRated(r); }} className={`tap rounded-xl border-2 px-2 py-2.5 text-sm font-semibold disabled:opacity-50 ${sentenceRated === r ? 'border-primary bg-primary-soft text-primary' : 'border-line bg-surface'}`}>{label}</button>
              ))}
            </div>
            {!progress || progress.status === 'new' ? <p className="mt-2 text-xs text-muted">Tự đánh giá ở bước Ghi âm trước để lưu điểm câu.</p> : null}
            {gold ? <p className="mt-3 rounded-xl bg-surface-2 p-3 text-xs"><span className="font-semibold">Tiêu chí đạt: </span>{gold.criteria}</p> : null}
          </section>

          {finished ? (
            <section className="card border-accent/40 bg-accent-soft/60 p-5 text-center">
              <p className="inline-flex items-center gap-2 text-lg font-bold text-accent"><IconCheck size={22} /> Đã hoàn thành "{w.word}"</p>
              <p className="mt-1 text-sm text-muted">Từ đã vào lịch ôn 1 → 3 → 7 → 14 → 30 ngày.</p>
              <div className="mt-4 flex flex-col gap-2">
                {next ? <Link href={`${groupPath}/${next.slug}`} className="tap flex items-center justify-center gap-2 rounded-2xl bg-primary py-3 font-semibold text-primary-ink">Từ tiếp theo: {next.word} <IconArrowRight size={18} /></Link> : null}
                <Link href={groupPath} className="tap rounded-2xl border border-line bg-surface py-3 text-sm font-semibold">Về danh sách nhóm</Link>
                <Link href="/" className="tap py-2 text-sm font-semibold text-primary">Về trang Hôm nay</Link>
              </div>
            </section>
          ) : (
            <button type="button" onClick={finish} className="tap flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-3.5 font-semibold text-white"><IconCheck size={20} /> Hoàn thành từ này</button>
          )}
        </>
      ) : null}

      {/* Mastery */}
      {progress && progress.status !== 'new' ? (
        <section className="card p-4">
          <div className="flex items-baseline justify-between">
            <h3 className="font-semibold">Word Mastery</h3>
            <p className="text-2xl font-bold tabular-nums">{m.total}<span className="text-sm font-medium text-muted">/100</span></p>
          </div>
          <p className="text-xs text-muted">{STATUS_LABEL[progress.status]} • ôn lại {progress.due} • {progress.goodDays.length}/3 ngày ôn đạt</p>
          <div className="mt-3 grid gap-2">
            <Meter label="Nghe phân biệt" value={m.listen} weight={MASTERY_WEIGHTS.listen} />
            <Meter label="Phát âm từ" value={m.pron} weight={MASTERY_WEIGHTS.pron} />
            <Meter label="Ghi nhớ sau ôn tập" value={m.retention} weight={MASTERY_WEIGHTS.retention} />
            <Meter label="Dùng trong câu" value={m.sentence} weight={MASTERY_WEIGHTS.sentence} />
          </div>
          <p className="mt-2 text-[11px] text-muted">Thành thạo khi đạt {MASTERY_THRESHOLD}/100 và ôn đạt ở ít nhất 3 ngày khác nhau. Công thức đề xuất, cần kiểm nghiệm với người học.</p>
        </section>
      ) : null}

      <div className="flex items-center justify-between gap-2 pt-1">
        {step > 0 ? (
          <button type="button" onClick={() => go(step - 1)} className="tap inline-flex items-center gap-1 rounded-full border border-line bg-surface px-4 py-2.5 text-sm font-semibold"><IconChevronLeft size={16} /> Bước trước</button>
        ) : prev ? (
          <Link href={`${groupPath}/${prev.slug}`} className="tap inline-flex items-center gap-1 rounded-full border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-muted"><IconChevronLeft size={16} /> {prev.word}</Link>
        ) : <span />}
        {step < STEPS.length - 1 ? (
          <button type="button" onClick={() => go(step + 1)} className="tap inline-flex items-center gap-1 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-ink">Bước tiếp <IconChevronRight size={16} /></button>
        ) : next ? (
          <Link href={`${groupPath}/${next.slug}`} className="tap inline-flex items-center gap-1 rounded-full border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-muted">{next.word} <IconChevronRight size={16} /></Link>
        ) : <span />}
      </div>
    </main>
  );
}
