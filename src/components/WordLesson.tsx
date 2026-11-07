'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { WordEntry } from '@/data/types';
import { POS_LABEL } from '@/data/types';
import { getPhoneme } from '@/data/phonemes';
import { getContrast } from '@/data/contrast';
import { analyzeIpa, syllableText } from '@/lib/ipa';
import { articulationSteps, wordIssues, riskyPhonemes } from '@/lib/errors';
import { rateWord, markLearned, useAppState, type Rating } from '@/lib/store';
import { PlayButton } from './PlayButton';
import { Recorder } from './Recorder';
import { IpaChips } from './IpaChips';
import { MouthDiagram } from './MouthDiagram';
import { IconEar, IconBulb, IconMouth, IconMic, IconChat, IconCheck, IconChevronLeft, IconChevronRight, IconAlert, IconArrowRight } from './icons';

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

export function WordLesson({ w, groupSlug, next, prev }: Props) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState<boolean[]>([false, false, false, false, false]);
  const [selected, setSelected] = useState<string>(w.phonemes[0]);
  const [weak, setWeak] = useState<Set<string>>(new Set());
  const [recorded, setRecorded] = useState(false);
  const [rated, setRated] = useState<Rating | null>(null);
  const [finished, setFinished] = useState(false);
  const state = useAppState();
  const progress = state.words[w.slug];

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
      } catch { /* IPA cặp từ không phân tích được: bỏ qua */ }
      list.push({ ...w.pair, diff });
    }
    for (const mp of w.minimalPairs) {
      if (list.length >= 4) break;
      if (w.pair && mp.slug === w.pair.slug) continue;
      list.push(mp);
    }
    return list;
  }, [w]);

  function go(n: number) {
    setDone((d) => { const c = [...d]; c[step] = true; return c; });
    setStep(Math.max(0, Math.min(STEPS.length - 1, n)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function toggleWeak(id: string) {
    setWeak((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }
  function doRate(r: Rating) {
    rateWord(w.slug, r, r === 3 ? [] : Array.from(weak));
    setRated(r);
    setDone((d) => { const c = [...d]; c[3] = true; return c; });
  }
  function finish() {
    if (!rated) markLearned(w.slug);
    setDone([true, true, true, true, true]);
    setFinished(true);
  }

  const groupPath = `/words/${groupSlug}`;
  const StepIcon = STEPS[step].icon;

  return (
    <main className="flex flex-col gap-5 px-4 pt-4">
      {/* Đầu trang: từ, IPA, nghĩa */}
      <section className="card p-5 text-center">
        <h2 className="text-4xl font-bold tracking-tight">{w.word}</h2>
        <p className="ipa mt-1 text-2xl text-primary">
          /{analysis.syllableGroups.map((g, i) => {
            const v = g.find((t) => t.isVowel);
            const stressed = v?.stress === 1;
            return (
              <span key={i} className={stressed && w.syllables > 1 ? 'font-semibold underline decoration-2 underline-offset-4' : ''}>
                {stressed && w.syllables > 1 ? 'ˈ' : v?.stress === 2 ? 'ˌ' : ''}{syllableText(g)}{i < analysis.syllableGroups.length - 1 ? '·' : ''}
              </span>
            );
          })}/
        </p>
        <p className="mt-2 text-sm text-muted">{POS_LABEL[w.pos] ?? w.pos} • {w.meaning}</p>
        {progress && progress.status !== 'new' ? (
          <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-semibold text-accent"><IconCheck size={12} /> Đã học • ôn lại ngày {progress.due}</p>
        ) : null}
      </section>

      {/* Thanh 5 bước */}
      <nav aria-label="Các bước luyện" className="card flex items-stretch p-1">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const active = i === step;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => go(i)}
              aria-current={active ? 'step' : undefined}
              className={`tap relative flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 text-[11px] font-medium ${active ? 'bg-primary text-primary-ink' : done[i] ? 'text-accent' : 'text-muted'}`}
            >
              <Icon size={18} />
              {s.label}
              {done[i] && !active ? <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-accent" /> : null}
            </button>
          );
        })}
      </nav>

      <p className="-mt-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary"><StepIcon size={14} /> Bước {step + 1}/5 · {STEPS[step].label}</p>

      {/* BƯỚC 1: NGHE */}
      {step === 0 ? (
        <>
          <section className="card flex flex-col items-center gap-4 p-5">
            <div className="flex items-start gap-8">
              <PlayButton text={w.word} size="lg" variant="primary" label="Bình thường" />
              <PlayButton text={w.word} mode="slow" size="lg" variant="soft" label="Chậm" />
            </div>
            <p className="text-center text-sm text-muted">
              Nghe ít nhất 3 lần. Chú ý {risky.slice(0, 3).map((id, i) => <span key={id}><span className="ipa font-semibold text-ink">/{getPhoneme(id)?.symbol}/</span>{i < Math.min(3, risky.length) - 1 ? ', ' : ''}</span>)}
              {w.syllables > 1 ? <> và trọng âm ở âm tiết thứ {w.stress + 1}</> : null}.
            </p>
          </section>
          {compare.length ? (
            <section>
              <h3 className="mb-2 font-semibold">Phân biệt với từ dễ nhầm</h3>
              <ul className="card divide-y divide-line">
                {compare.map((c) => {
                  const diff = c.diff;
                  return (
                    <li key={c.word} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <PlayButton text={w.word} size="sm" />
                        <div className="min-w-0"><span className="block truncate font-semibold">{w.word}</span><span className="ipa block text-xs text-muted">/{w.ipa}/</span></div>
                      </div>
                      <span className="ipa text-center text-xs text-muted">{diff ? `${getPhoneme(diff[0])?.symbol} ↔ ${getPhoneme(diff[1])?.symbol}` : '↔'}</span>
                      <div className="flex items-center justify-end gap-2 text-right">
                        <div className="min-w-0">
                          {c.slug ? <Link href={`/words/${String(w.group).padStart(2, '0')}/${c.slug}`} className="block truncate font-semibold text-primary">{c.word}</Link> : <span className="block truncate font-semibold">{c.word}</span>}
                          <span className="ipa block text-xs text-muted">/{c.ipa}/</span>
                        </div>
                        <PlayButton text={c.word} size="sm" />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}
          {w.homophones.length ? <p className="text-sm text-muted">Đồng âm với: <span className="font-semibold text-ink">{w.homophones.join(', ')}</span></p> : null}
        </>
      ) : null}

      {/* BƯỚC 2: HIỂU */}
      {step === 1 ? (
        <>
          <section className="card p-4">
            <h3 className="font-semibold">Âm tiết và trọng âm</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {analysis.syllableGroups.map((g, i) => {
                const stressed = g.find((t) => t.isVowel)?.stress === 1 && w.syllables > 1;
                return (
                  <span key={i} className={`ipa rounded-xl px-3 py-2 text-xl ${stressed ? 'bg-primary font-semibold text-primary-ink' : 'bg-surface-2'}`}>
                    {syllableText(g)}
                    {stressed ? <span className="ml-1 text-[10px] font-sans font-semibold uppercase opacity-80">nhấn</span> : null}
                  </span>
                );
              })}
            </div>
            <p className="mt-2 text-sm text-muted">
              {w.syllables === 1 ? 'Từ một âm tiết: nói chắc, đủ âm đầu và âm cuối.' : `${w.syllables} âm tiết, trọng âm ở âm tiết thứ ${w.stress + 1}. Âm tiết nhấn to, dài và cao hơn; các âm tiết còn lại đọc nhẹ.`}
            </p>
          </section>
          <section>
            <h3 className="mb-2 font-semibold">Phân tích từng âm <span className="text-xs font-normal text-muted">(chạm để xem chi tiết)</span></h3>
            <IpaChips ids={w.phonemes} size="lg" withLabel />
          </section>
          <section className="card p-4">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted">Loại từ</dt><dd className="font-medium">{POS_LABEL[w.pos] ?? w.pos}</dd>
              <dt className="text-muted">Nghĩa</dt><dd className="font-medium">{w.meaning}</dd>
              <dt className="text-muted">Ví dụ</dt><dd>{w.exampleEn} <span className="text-muted">— {w.exampleVi}</span></dd>
            </dl>
            {w.note ? (
              <div className="mt-3 flex gap-2 rounded-xl bg-warn-soft p-3 text-sm">
                <IconAlert size={18} className="mt-0.5 shrink-0 text-warn" />
                <p><span className="font-semibold">Chính tả đánh lừa: </span>{w.note}</p>
              </div>
            ) : null}
          </section>
        </>
      ) : null}

      {/* BƯỚC 3: TẠO ÂM */}
      {step === 2 ? (
        <>
          <section>
            <h3 className="mb-2 font-semibold">Khẩu hình <span className="text-xs font-normal text-muted">(chọn âm để xem)</span></h3>
            <IpaChips ids={uniquePhonemes} selected={selected} onSelect={setSelected} />
            <div className="mt-3">
              <MouthDiagram phonemeId={selected} />
            </div>
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
          <section className="card p-4">
            <h3 className="flex items-center gap-1.5 font-semibold"><IconAlert size={16} className="text-danger" /> Lỗi điển hình cần phát hiện</h3>
            <ul className="mt-2 space-y-2">
              {issues.map((iss) => (
                <li key={iss.id} className="rounded-xl bg-surface-2 p-3 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold">{iss.title}</p>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${SEVERITY[iss.severity]}`}>{iss.severity === 'high' ? 'Hay sai' : iss.severity === 'medium' ? 'Chú ý' : 'Ghi chú'}</span>
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

      {/* BƯỚC 4: GHI ÂM */}
      {step === 3 ? (
        <>
          <section className="card p-4">
            <h3 className="font-semibold">Nghe mẫu, nói theo, ghi âm</h3>
            <p className="mt-1 text-xs text-muted">Nói từ 2–3 lần trong một lần ghi. Sau đó nghe mẫu và bản ghi của bạn liên tiếp để so sánh.</p>
            <div className="mt-3"><Recorder modelText={w.word} onRecorded={() => setRecorded(true)} /></div>
          </section>
          <section className="card p-4">
            <h3 className="font-semibold">Tự đánh giá</h3>
            <p className="mt-1 text-xs text-muted">{recorded ? 'Âm nào bạn thấy chưa giống mẫu? Chạm để đánh dấu (có thể bỏ trống).' : 'Nên ghi âm và nghe lại trước khi đánh giá. Nếu không có micro, hãy nói to và tự đối chiếu với mẫu.'}</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {risky.map((id) => {
                const p = getPhoneme(id);
                const on = weak.has(id);
                return p ? (
                  <li key={id}>
                    <button type="button" onClick={() => toggleWeak(id)} aria-pressed={on} className={`tap ipa rounded-xl border px-3 py-2 text-lg font-semibold ${on ? 'border-danger bg-danger-soft text-danger' : 'border-line bg-surface'}`}>/{p.symbol}/</button>
                  </li>
                ) : null;
              })}
            </ul>
            <p className="mt-4 text-sm font-medium">So với mẫu, bạn đọc từ này thế nào?</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {([
                [1, 'Chưa ổn', 'border-danger bg-danger-soft text-danger'],
                [2, 'Tạm được', 'border-warn bg-warn-soft text-warn'],
                [3, 'Tốt', 'border-accent bg-accent-soft text-accent'],
              ] as [Rating, string, string][]).map(([r, label, cls]) => (
                <button key={r} type="button" onClick={() => doRate(r)} className={`tap rounded-xl border-2 px-2 py-3 text-sm font-semibold ${rated === r ? cls : 'border-line bg-surface'}`}>{label}</button>
              ))}
            </div>
            {rated ? (
              <p className="mt-3 text-xs text-muted">
                Đã ghi nhận. {rated === 1 ? 'Từ này sẽ quay lại sớm trong phần ôn tập.' : rated === 2 ? 'Từ này sẽ được ôn lại trong vài ngày tới.' : 'Khoảng cách ôn tập sẽ dài hơn.'}
                {weak.size ? ' Các âm bạn đánh dấu được cộng vào "Ba âm cần luyện thêm".' : ''}
              </p>
            ) : null}
          </section>
          <p className="text-xs leading-relaxed text-muted">Giai đoạn này chưa có AI chấm điểm. Hãy tin vào tai và cảm giác tay trên cổ (rung / không rung); AI Coach sẽ bổ sung ở giai đoạn 2.</p>
        </>
      ) : null}

      {/* BƯỚC 5: ÁP DỤNG */}
      {step === 4 ? (
        <>
          <section className="card p-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Câu ứng dụng</p>
            <p className="mt-2 text-2xl font-semibold leading-snug">{w.exampleEn}</p>
            <p className="mt-1 text-sm text-muted">{w.exampleVi}</p>
            <div className="mt-4 flex items-start justify-center gap-8">
              <PlayButton text={w.exampleEn} size="lg" variant="primary" label="Bình thường" />
              <PlayButton text={w.exampleEn} mode="slow" size="lg" variant="soft" label="Chậm" />
            </div>
          </section>
          <section className="card p-4">
            <h3 className="font-semibold">Nói cả câu và ghi âm</h3>
            <p className="mt-1 text-xs text-muted">Giữ nhịp: từ mang nghĩa nói rõ, từ chức năng (a, the, to, of) nói nhẹ.</p>
            <div className="mt-3"><Recorder modelText={w.exampleEn} compact /></div>
          </section>
          {finished ? (
            <section className="card border-accent/40 bg-accent-soft/60 p-5 text-center">
              <p className="inline-flex items-center gap-2 text-lg font-bold text-accent"><IconCheck size={22} /> Đã hoàn thành "{w.word}"</p>
              <p className="mt-1 text-sm text-muted">Từ này đã vào lịch ôn tập ngắt quãng.</p>
              <div className="mt-4 flex flex-col gap-2">
                {next ? (
                  <Link href={`${groupPath}/${next.slug}`} className="tap flex items-center justify-center gap-2 rounded-2xl bg-primary py-3 font-semibold text-primary-ink">Từ tiếp theo: {next.word} <IconArrowRight size={18} /></Link>
                ) : null}
                <Link href={groupPath} className="tap rounded-2xl border border-line bg-surface py-3 text-sm font-semibold">Về danh sách nhóm</Link>
                <Link href="/" className="tap py-2 text-sm font-semibold text-primary">Về trang chủ</Link>
              </div>
            </section>
          ) : (
            <button type="button" onClick={finish} className="tap flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-3.5 font-semibold text-white"><IconCheck size={20} /> Hoàn thành từ này</button>
          )}
        </>
      ) : null}

      {/* Điều hướng bước */}
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
