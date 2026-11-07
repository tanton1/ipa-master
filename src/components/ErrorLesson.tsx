'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getVei, REMEDIATION_STEPS, type ErrorCode, type PairItem } from '@/data/vei';
import { getPhoneme } from '@/data/phonemes';
import { getContrast } from '@/data/contrast';
import { WORDS } from '@/lib/curriculum';
import { useTts } from '@/lib/tts';
import { useAppState, recordListen, recordSpeak, startRetest, completeRetest, errorScore, todayKey, type Rating } from '@/lib/store';
import { MouthDiagram } from './MouthDiagram';
import { PlayButton } from './PlayButton';
import { Recorder } from './Recorder';
import { WordRow } from './WordRow';
import { Ipa } from './Ipa';
import { IconCheck, IconAlert, IconChevronLeft, IconChevronRight, IconEar } from './icons';

interface Q { item: PairItem; side: 'a' | 'b' }

function sayText(item: PairItem, side: 'a' | 'b'): string {
  return side === 'a' ? item.aSay ?? item.a : item.bSay ?? item.b;
}

export function ErrorLesson({ code }: { code: ErrorCode }) {
  const e = getVei(code)!;
  const s = useAppState();
  const { say } = useTts();
  const [step, setStep] = useState(0);
  const [retestWhich, setRetestWhich] = useState<'d1' | 'd3' | null>(null);

  const words = useMemo(() => WORDS.filter((w) => w.errorCodes.includes(code)), [code]);
  const contrast = e.contrastId ? getContrast(e.contrastId) : undefined;
  const sc = errorScore(s.errorStats[code]);
  const retest = s.retests[code];

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('retest');
    if (q === 'd1' || q === 'd3') { setRetestWhich(q); setStep(5); }
  }, []);

  // Bước 1: nghe nhận diện
  const quizMode = (e.identifyMode ?? 'quiz') === 'quiz';
  const [quiz, setQuiz] = useState<Q[] | null>(null);
  const [qi, setQi] = useState(0);
  const [answer, setAnswer] = useState<'a' | 'b' | null>(null);
  const [score, setScore] = useState(0);
  const cur = quiz?.[qi];
  function startQuiz() {
    const q: Q[] = Array.from({ length: 6 }, () => ({ item: e.identify[Math.floor(Math.random() * e.identify.length)], side: Math.random() < 0.5 ? 'a' : 'b' }));
    setQuiz(q); setQi(0); setAnswer(null); setScore(0);
    window.setTimeout(() => say(sayText(q[0].item, q[0].side)), 250);
  }
  function choose(side: 'a' | 'b') {
    if (!cur || answer) return;
    setAnswer(side);
    const ok = side === cur.side;
    if (ok) setScore((x) => x + 1);
    recordListen({ correct: ok, codes: [code], phonemes: e.phonemes.slice(0, 2) });
  }
  function nextQ() {
    if (!quiz) return;
    const n = qi + 1;
    setQi(n); setAnswer(null);
    if (n < quiz.length) window.setTimeout(() => say(sayText(quiz[n].item, quiz[n].side)), 200);
  }

  // Bước 4: so sánh A/B và tự đánh giá
  const [abDone, setAbDone] = useState(false);
  const [selfOk, setSelfOk] = useState<boolean | null>(null);
  function rateSelf(ok: boolean) {
    setSelfOk(ok);
    recordSpeak(e.phonemes.slice(0, 2), ok, [code]);
  }

  // Bước 6: kiểm tra lại
  const [retestDone, setRetestDone] = useState<Rating | null>(null);
  const testWord = e.blend.word;

  const go = (n: number) => { setStep(Math.max(0, Math.min(REMEDIATION_STEPS.length - 1, n))); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <main className="flex flex-col gap-5 px-4 pt-4">
      <section className="card p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm leading-relaxed"><span className="font-semibold">Vì sao hay sai: </span>{e.why}</p>
          {sc ? <span className="shrink-0 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold tabular-nums">{sc.score}/100</span> : null}
        </div>
        <p className="mt-3 text-sm leading-relaxed"><span className="font-semibold">Cách sửa: </span>{e.fix}</p>
        {e.region ? <p className="mt-3 rounded-xl bg-surface-2 p-3 text-xs text-muted"><span className="font-semibold text-ink">Theo vùng miền: </span>{e.region}</p> : null}
      </section>

      <nav aria-label="Các bước chữa lỗi" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {REMEDIATION_STEPS.map((st, i) => (
          <button key={st.key} type="button" onClick={() => go(i)} aria-current={i === step ? 'step' : undefined}
            className={`tap shrink-0 rounded-full px-3 py-2 text-xs font-semibold ${i === step ? 'bg-primary text-primary-ink' : 'border border-line bg-surface text-muted'}`}>
            {i + 1}. {st.title}
          </button>
        ))}
      </nav>
      <p className="-mt-2 text-xs text-muted">{REMEDIATION_STEPS[step].desc}</p>

      {step === 0 ? (
        <section className="card p-4">
          <h2 className="flex items-center gap-1.5 text-lg font-extrabold"><IconEar size={18} className="text-primary" /> Nghe và nhận diện</h2>
          {quizMode ? (
            !quiz ? (
              <>
                <p className="mt-1 text-xs text-muted">Nghe một mẫu rồi chọn bạn nghe thấy bên nào. 6 câu.</p>
                <ul className="mt-3 divide-y divide-line rounded-xl border border-line">
                  {e.identify.map((it, i) => (
                    <li key={i} className="grid grid-cols-2 gap-2 px-3 py-2 text-sm">
                      {(['a', 'b'] as const).map((side) => (
                        <div key={side} className="flex items-center gap-2">
                          <PlayButton text={sayText(it, side)} size="sm" />
                          <div className="min-w-0"><span className="block font-semibold leading-tight">{side === 'a' ? it.a : it.b}</span>{(side === 'a' ? it.aIpa : it.bIpa) ? <Ipa value={side === 'a' ? it.aIpa : it.bIpa} className="text-xs text-muted" /> : null}</div>
                        </div>
                      ))}
                    </li>
                  ))}
                </ul>
                <button type="button" onClick={startQuiz} className="tap mt-3 w-full rounded-2xl bg-primary py-3 font-semibold text-primary-ink">Bắt đầu nghe đố</button>
              </>
            ) : qi >= quiz.length ? (
              <div className="mt-3 text-center">
                <p className="text-3xl font-bold tabular-nums">{score}/{quiz.length}</p>
                <p className="mt-1 text-sm text-muted">{score >= 5 ? 'Tai bạn đã nhận ra khác biệt. Chuyển sang luyện âm riêng lẻ.' : 'Nghe lại các cặp vài lần rồi làm lại trước khi luyện nói.'}</p>
                <div className="mt-3 flex justify-center gap-2">
                  <button type="button" onClick={startQuiz} className="tap rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold">Làm lại</button>
                  <button type="button" onClick={() => go(1)} className="tap rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-ink">Bước tiếp</button>
                </div>
              </div>
            ) : cur ? (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-muted"><span>Câu {qi + 1}/{quiz.length}</span><span>Đúng: {score}</span></div>
                <div className="my-3 flex justify-center"><PlayButton text={sayText(cur.item, cur.side)} size="lg" variant="primary" ariaLabel="Nghe lại" /></div>
                <div className="grid grid-cols-2 gap-2">
                  {(['a', 'b'] as const).map((side) => {
                    const correct = cur.side === side;
                    const cls = !answer ? 'border-line bg-surface' : correct ? 'border-accent bg-accent-soft' : answer === side ? 'border-danger bg-danger-soft' : 'border-line bg-surface opacity-60';
                    return (
                      <button key={side} type="button" disabled={!!answer} onClick={() => choose(side)} className={`tap rounded-2xl border-2 px-3 py-3 text-left ${cls}`}>
                        <span className="block font-semibold">{side === 'a' ? cur.item.a : cur.item.b}</span>
                        {(side === 'a' ? cur.item.aIpa : cur.item.bIpa) ? <Ipa value={side === 'a' ? cur.item.aIpa : cur.item.bIpa} className="text-xs text-muted" /> : null}
                      </button>
                    );
                  })}
                </div>
                {answer ? <button type="button" onClick={nextQ} className="tap mt-3 w-full rounded-2xl bg-primary py-3 font-semibold text-primary-ink">{answer === cur.side ? 'Chính xác! Câu tiếp' : 'Chưa đúng. Câu tiếp'}</button> : null}
              </div>
            ) : null
          ) : (
            <>
              <p className="mt-1 text-xs text-muted">Giọng tổng hợp chỉ đọc được bản đúng, nên ở đây bạn nghe mẫu và đối chiếu với mô tả lỗi.</p>
              <ul className="mt-3 flex flex-col gap-2">
                {e.identify.map((it, i) => (
                  <li key={i} className="rounded-xl border border-line p-3 text-sm">
                    <div className="flex items-center gap-2"><PlayButton text={sayText(it, 'a')} size="sm" /><span className="font-semibold">{it.a}</span><Ipa value={it.aIpa} className="text-xs text-muted" /></div>
                    <p className="mt-1 flex items-center gap-1 text-xs text-danger"><IconAlert size={12} /> Lỗi: {it.b} <Ipa value={it.bIpa} /></p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      ) : null}

      {step === 1 ? (
        <>
          <section className="card p-4">
            <h2 className="text-lg font-extrabold">Luyện {e.isolate.focus}</h2>
            <p className="mt-1 text-sm leading-relaxed">{e.isolate.howTo}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {e.isolate.words.map((w) => <li key={w} className="flex items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-3 text-sm"><PlayButton text={w} size="sm" />{w}</li>)}
            </ul>
          </section>
          {e.phonemes.length ? (
            <div className="grid grid-cols-1 gap-3">
              {e.phonemes.slice(0, 2).map((id) => (
                <div key={id}>
                  <p className="mb-1 text-sm"><Link href={`/ipa/${id}`} className="ipa font-semibold text-primary">/{getPhoneme(id)?.symbol}/</Link> <span className="text-muted">{getPhoneme(id)?.name}</span></p>
                  <MouthDiagram phonemeId={id} />
                </div>
              ))}
            </div>
          ) : null}
          {contrast ? <Link href={`/contrast/${contrast.id}`} className="card tap flex items-center gap-3 p-4 text-sm"><span className="ipa text-xl font-semibold text-primary">{contrast.label}</span><span className="flex-1">Bài đối chiếu Việt – Anh đầy đủ</span><IconChevronRight size={16} className="text-muted" /></Link> : null}
        </>
      ) : null}

      {step === 2 ? (
        <section className="card p-4">
          <h2 className="text-lg font-extrabold">Ghép vào từ: {e.blend.word}</h2>
          <ol className="mt-2 space-y-2">
            {e.blend.steps.map((st, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-ink">{i + 1}</span>
                <span>{st}</span>
              </li>
            ))}
          </ol>
          <div className="mt-4 flex justify-center gap-6">
            <PlayButton text={e.blend.word} size="lg" variant="primary" label="Bình thường" />
            <PlayButton text={e.blend.word} mode="slow" size="lg" label="Chậm" />
          </div>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="card p-4">
          <h2 className="text-lg font-extrabold">Ghi âm và nghe A/B</h2>
          <p className="mt-1 text-xs text-muted">Nói "{e.blend.word}" 2–3 lần, rồi bấm Nghe A/B để nghe mẫu và bản ghi của bạn liên tiếp.</p>
          <div className="mt-3"><Recorder modelText={e.blend.word} onListenedAB={() => setAbDone(true)} /></div>
          <div className="mt-3 rounded-xl bg-surface-2 p-3">
            <p className="text-sm font-medium">Bản của bạn có giữ được điểm đang sửa không?</p>
            {!abDone ? <p className="mt-1 text-xs text-muted">Nên nghe A/B trước khi trả lời.</p> : null}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => rateSelf(false)} className={`tap rounded-xl border-2 px-3 py-2 text-sm font-semibold ${selfOk === false ? 'border-danger bg-danger-soft text-danger' : 'border-line bg-surface'}`}>Chưa giữ được</button>
              <button type="button" onClick={() => rateSelf(true)} className={`tap rounded-xl border-2 px-3 py-2 text-sm font-semibold ${selfOk === true ? 'border-accent bg-accent-soft text-accent' : 'border-line bg-surface'}`}>Đã giữ được</button>
            </div>
            {selfOk !== null ? <p className="mt-2 text-xs text-muted">Đã ghi vào thống kê nhóm lỗi {code}.</p> : null}
          </div>
        </section>
      ) : null}

      {step === 4 ? (
        <>
          <section className="card p-4">
            <h2 className="text-lg font-extrabold">Cụm từ</h2>
            <ul className="mt-2 flex flex-wrap gap-2">
              {e.phrases.map((p) => <li key={p} className="flex items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-3 text-sm"><PlayButton text={p} size="sm" />{p}</li>)}
            </ul>
          </section>
          {e.sentences.map((st) => (
            <section key={st.en} className="card p-4">
              <p className="text-lg font-semibold">{st.en}</p>
              <p className="text-sm text-muted">{st.vi}</p>
              <div className="mt-3"><Recorder modelText={st.en} compact /></div>
            </section>
          ))}
        </>
      ) : null}

      {step === 5 ? (
        <section className="card p-4">
          <h2 className="text-lg font-extrabold">Kiểm tra duy trì sau 1 và 3 ngày</h2>
          {retestWhich && retest ? (
            <>
              <p className="mt-1 text-sm">Lượt kiểm tra {retestWhich === 'd1' ? 'ngày 1' : 'ngày 3'}: nói "{testWord}" mà không nghe mẫu trước, rồi nghe A/B để tự chấm.</p>
              <div className="mt-3"><Recorder modelText={testWord} /></div>
              {retestDone ? (
                <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-accent"><IconCheck size={16} /> Đã ghi nhận kết quả.</p>
              ) : (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {([[1, 'Chưa giữ'], [2, 'Tạm được'], [3, 'Giữ tốt']] as [Rating, string][]).map(([r, label]) => (
                    <button key={r} type="button" onClick={() => { completeRetest(code, retestWhich, r); setRetestDone(r); }} className="tap rounded-xl border-2 border-line bg-surface py-3 text-sm font-semibold">{label}</button>
                  ))}
                </div>
              )}
            </>
          ) : retest ? (
            <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-xl bg-surface-2 p-3"><dt className="text-xs text-muted">Ngày 1 ({retest.d1})</dt><dd className="font-semibold">{retest.results.d1 ? ['', 'Chưa giữ', 'Tạm được', 'Giữ tốt'][retest.results.d1] : retest.d1 <= todayKey() ? <button type="button" onClick={() => setRetestWhich('d1')} className="text-primary underline">Làm ngay</button> : 'Chưa đến hạn'}</dd></div>
              <div className="rounded-xl bg-surface-2 p-3"><dt className="text-xs text-muted">Ngày 3 ({retest.d3})</dt><dd className="font-semibold">{retest.results.d3 ? ['', 'Chưa giữ', 'Tạm được', 'Giữ tốt'][retest.results.d3] : retest.results.d1 && retest.d3 <= todayKey() ? <button type="button" onClick={() => setRetestWhich('d3')} className="text-primary underline">Làm ngay</button> : 'Chưa đến hạn'}</dd></div>
            </dl>
          ) : (
            <>
              <p className="mt-1 text-sm text-muted">Sửa được trong một buổi chưa có nghĩa là đã nhớ. Đặt lịch để app nhắc bạn kiểm tra lại "{testWord}" sau 1 ngày và 3 ngày.</p>
              <button type="button" onClick={() => startRetest(code)} className="tap mt-3 w-full rounded-2xl bg-primary py-3 font-semibold text-primary-ink">Đặt lịch kiểm tra lại</button>
            </>
          )}
        </section>
      ) : null}

      <div className="flex items-center justify-between">
        {step > 0 ? <button type="button" onClick={() => go(step - 1)} className="tap inline-flex items-center gap-1 rounded-full border border-line bg-surface px-4 py-2.5 text-sm font-semibold"><IconChevronLeft size={16} /> Bước trước</button> : <span />}
        {step < REMEDIATION_STEPS.length - 1 ? <button type="button" onClick={() => go(step + 1)} className="tap inline-flex items-center gap-1 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-ink">Bước tiếp <IconChevronRight size={16} /></button> : <span />}
      </div>

      <section>
        <h2 className="mb-2 text-lg font-extrabold">Từ trong 500 từ có nguy cơ {code} <span className="text-sm font-normal text-muted">({words.length})</span></h2>
        <ul className="flex flex-col gap-2">{words.slice(0, 8).map((w) => <WordRow key={w.slug} w={w} />)}</ul>
        <Link href={`/words?code=${code}`} className="mt-2 block text-center text-sm font-semibold text-primary">Xem tất cả {words.length} từ</Link>
      </section>
    </main>
  );
}
