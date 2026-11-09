'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { getPhoneme } from '@/data/phonemes';
import { getVei, type ErrorCode } from '@/data/vei';
import { getWord } from '@/lib/curriculum';
import { useTts } from '@/lib/tts';
import { useAppState, recordListen, recordSpeak, updateProfile, todayKey, type Region } from '@/lib/store';
import { PlayButton } from './PlayButton';
import { Recorder } from './Recorder';
import { Ipa } from './Ipa';
import { ProgressBar } from './ProgressBar';
import { IconCheck, IconEar, IconMic, IconChat, IconClipboard } from './icons';

const LISTEN: { a: string; aIpa: string; b: string; bIpa: string; ph: [string, string]; code: ErrorCode }[] = [
  { a: 'think', aIpa: 'θɪŋk', b: 'sink', bIpa: 'sɪŋk', ph: ['th', 's'], code: 'E01' },
  { a: 'then', aIpa: 'ðɛn', b: 'den', bIpa: 'dɛn', ph: ['dh', 'd'], code: 'E01' },
  { a: 'ship', aIpa: 'ʃɪp', b: 'sheep', bIpa: 'ʃip', ph: ['ih', 'i'], code: 'E02' },
  { a: 'bad', aIpa: 'bæd', b: 'bed', bIpa: 'bɛd', ph: ['ae', 'eh'], code: 'E02' },
  { a: 'rice', aIpa: 'ɹaɪs', b: 'rise', bIpa: 'ɹaɪz', ph: ['s', 'z'], code: 'E04' },
  { a: 'right', aIpa: 'ɹaɪt', b: 'light', bIpa: 'laɪt', ph: ['r', 'l'], code: 'E06' },
  { a: 'she', aIpa: 'ʃi', b: 'see', bIpa: 'si', ph: ['sh', 's'], code: 'E07' },
  { a: 'pull', aIpa: 'pʊl', b: 'pool', bIpa: 'pul', ph: ['uh', 'u'], code: 'E02' },
];

const READ: { slug: string; focus: string[]; codes: ErrorCode[] }[] = [
  { slug: 'three', focus: ['th', 'r'], codes: ['E01', 'E05'] },
  { slug: 'this', focus: ['dh', 's'], codes: ['E01', 'E03'] },
  { slug: 'ship', focus: ['sh', 'ih'], codes: ['E02', 'E07'] },
  { slug: 'bad', focus: ['ae', 'd'], codes: ['E02', 'E04'] },
  { slug: 'five', focus: ['v'], codes: ['E03', 'E04'] },
  { slug: 'nice', focus: ['s'], codes: ['E03'] },
  { slug: 'rise', focus: ['z'], codes: ['E04'] },
  { slug: 'street', focus: ['s', 't', 'r'], codes: ['E05'] },
  { slug: 'world', focus: ['er', 'l', 'd'], codes: ['E03', 'E06'] },
  { slug: 'she', focus: ['sh'], codes: ['E07'] },
  { slug: 'banana', focus: ['schwa'], codes: ['E08', 'E09'] },
  { slug: 'about', focus: ['schwa'], codes: ['E09'] },
];

const SENTENCES: { en: string; vi: string; focus: string; codes: ErrorCode[] }[] = [
  { en: 'I think this is better.', vi: 'Tôi nghĩ cái này tốt hơn.', focus: '/θ/, /ð/ và nhịp câu', codes: ['E01', 'E10'] },
  { en: 'Tell me about your day.', vi: 'Kể tôi nghe về ngày của bạn.', focus: 'Schwa và trọng âm câu', codes: ['E09', 'E08'] },
  { en: 'Where are you from?', vi: 'Bạn đến từ đâu?', focus: 'Ngữ điệu câu hỏi Wh-', codes: ['E10'] },
];

type Part = 'intro' | 'listen' | 'read' | 'sentence' | 'self' | 'result';

interface Result { listen: Record<string, { c: number; t: number }>; speak: Record<string, { c: number; t: number }>; weakSounds: Record<string, number>; skippedSpeaking: boolean }

export function Diagnostic() {
  const { profile } = useAppState();
  const { say } = useTts();
  const [part, setPart] = useState<Part>('intro');
  const [i, setI] = useState(0);
  const [res, setRes] = useState<Result>({ listen: {}, speak: {}, weakSounds: {}, skippedSpeaking: false });

  // Phần 1
  const order = useMemo(() => LISTEN.map(() => (Math.random() < 0.5 ? 'a' : 'b') as 'a' | 'b'), []);
  const [answer, setAnswer] = useState<'a' | 'b' | null>(null);
  // Phần 2–3
  const [marks, setMarks] = useState<Set<string>>(new Set());
  const [sentenceOk, setSentenceOk] = useState<boolean | null>(null);
  // Phần 4
  const [region, setRegion] = useState<Region | undefined>(profile.region);
  const [confSpeak, setConfSpeak] = useState(3);
  const [confListen, setConfListen] = useState(3);

  const tally = (m: Record<string, { c: number; t: number }>, k: string, ok: boolean) => ({ ...m, [k]: { c: (m[k]?.c ?? 0) + (ok ? 1 : 0), t: (m[k]?.t ?? 0) + 1 } });

  function listenPlay(idx: number) {
    const it = LISTEN[idx];
    window.setTimeout(() => say(order[idx] === 'a' ? it.a : it.b), 200);
  }
  function listenChoose(side: 'a' | 'b') {
    if (answer) return;
    setAnswer(side);
    const it = LISTEN[i];
    const ok = side === order[i];
    recordListen({ correct: ok, phonemes: [...it.ph], codes: [it.code] });
    setRes((r) => ({ ...r, listen: tally(r.listen, it.code, ok) }));
  }
  function listenNext() {
    setAnswer(null);
    if (i + 1 < LISTEN.length) { setI(i + 1); listenPlay(i + 1); } else { setI(0); setPart('read'); setMarks(new Set()); }
  }

  function readNext(skip = false) {
    const it = READ[i];
    if (!skip) {
      for (const ph of it.focus) recordSpeak([ph], !marks.has(ph));
      const anyBad = it.focus.some((ph) => marks.has(ph));
      for (const c of it.codes) recordSpeak([], !anyBad, [c]);
      setRes((r) => {
        let speak = r.speak;
        for (const c of it.codes) speak = tally(speak, c, !anyBad);
        const weakSounds = { ...r.weakSounds };
        for (const ph of marks) weakSounds[ph] = (weakSounds[ph] ?? 0) + 1;
        return { ...r, speak, weakSounds };
      });
    }
    setMarks(new Set());
    if (i + 1 < READ.length) setI(i + 1); else { setI(0); setPart('sentence'); setSentenceOk(null); }
    window.scrollTo({ top: 0 });
  }

  function sentenceNext() {
    const st = SENTENCES[i];
    if (sentenceOk !== null) {
      recordSpeak([], sentenceOk, st.codes);
      setRes((r) => { let speak = r.speak; for (const c of st.codes) speak = tally(speak, c, sentenceOk); return { ...r, speak }; });
    }
    setSentenceOk(null);
    if (i + 1 < SENTENCES.length) setI(i + 1); else { setI(0); setPart('self'); }
    window.scrollTo({ top: 0 });
  }

  function finish() {
    updateProfile({ region, confidence: { speak: confSpeak, listen: confListen }, diagnosticAt: todayKey() });
    setPart('result');
    window.scrollTo({ top: 0 });
  }

  const totalSteps = LISTEN.length + READ.length + SENTENCES.length + 1;
  const doneSteps = part === 'listen' ? i : part === 'read' ? LISTEN.length + i : part === 'sentence' ? LISTEN.length + READ.length + i : part === 'self' ? totalSteps - 1 : part === 'result' ? totalSteps : 0;

  if (part === 'intro') {
    return (
      <section className="card p-5">
        <IconClipboard size={28} className="text-primary" />
        <h2 className="mt-2 text-xl font-bold">Bài kiểm tra 5–8 phút</h2>
        <ul className="mt-3 space-y-2 text-sm">
          <li className="flex gap-2"><IconEar size={18} className="shrink-0 text-primary" /> Nghe phân biệt: 8 câu</li>
          <li className="flex gap-2"><IconMic size={18} className="shrink-0 text-primary" /> Đọc từ: 12 từ, ghi âm và tự đối chiếu</li>
          <li className="flex gap-2"><IconChat size={18} className="shrink-0 text-primary" /> Đọc câu: 3 câu</li>
          <li className="flex gap-2"><IconCheck size={18} className="shrink-0 text-primary" /> Tự đánh giá: 4 câu hỏi</li>
        </ul>
        <p className="mt-3 text-xs text-muted">Kết quả không phải một con số tổng: bạn sẽ thấy nghe tốt âm nào, dễ nhầm âm nào, khi nói còn thiếu âm nào và nên luyện bài gì trước. Có thể bỏ qua phần ghi âm nếu chưa cấp quyền micro.</p>
        <button type="button" onClick={() => { setPart('listen'); setI(0); listenPlay(0); }} className="tap mt-4 w-full rounded-2xl bg-primary py-3 font-semibold text-primary-ink">Bắt đầu</button>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {part !== 'result' ? <ProgressBar value={doneSteps} max={totalSteps} label="Tiến độ bài kiểm tra" /> : null}

      {part === 'listen' ? (
        <section className="card p-4">
          <p className="eyebrow text-muted">Phần 1 • Nghe phân biệt • {i + 1}/{LISTEN.length}</p>
          <h2 className="mt-1 font-bold">Bạn nghe thấy từ nào?</h2>
          <div className="my-4 flex justify-center"><PlayButton text={order[i] === 'a' ? LISTEN[i].a : LISTEN[i].b} size="lg" variant="primary" ariaLabel="Nghe lại" /></div>
          <div className="grid grid-cols-2 gap-2">
            {(['a', 'b'] as const).map((side) => {
              const it = LISTEN[i];
              const correct = order[i] === side;
              const cls = !answer ? 'border-line bg-surface' : correct ? 'border-accent bg-accent-soft' : answer === side ? 'border-danger bg-danger-soft' : 'border-line bg-surface opacity-60';
              return (
                <button key={side} type="button" disabled={!!answer} onClick={() => listenChoose(side)} className={`tap rounded-2xl border-2 px-3 py-4 text-left ${cls}`}>
                  <span className="block text-lg font-semibold">{side === 'a' ? it.a : it.b}</span>
                  <Ipa value={side === 'a' ? it.aIpa : it.bIpa} className="text-sm text-muted" />
                </button>
              );
            })}
          </div>
          {answer ? <button type="button" onClick={listenNext} className="tap mt-3 w-full rounded-2xl bg-primary py-3 font-semibold text-primary-ink">Tiếp</button> : null}
        </section>
      ) : null}

      {part === 'read' ? (() => {
        const it = READ[i];
        const w = getWord(it.slug);
        return (
          <section className="card p-4">
            <p className="eyebrow text-muted">Phần 2 • Đọc từ • {i + 1}/{READ.length}</p>
            <p className="mt-2 text-center text-4xl font-bold">{w?.word ?? it.slug}</p>
            {w ? <p className="text-center text-sm text-muted">{w.meaning}</p> : null}
            <p className="mt-3 text-xs text-muted">Đọc to trước, rồi mới nghe mẫu. Ghi âm và nghe A/B để tự đối chiếu.</p>
            <div className="mt-2"><Recorder key={it.slug} modelText={w?.word ?? it.slug} compact /></div>
            <p className="mt-3 text-sm font-medium">Âm nào nghe khác mẫu?</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {it.focus.map((ph) => {
                const p = getPhoneme(ph); const on = marks.has(ph);
                return <li key={ph}><button type="button" aria-pressed={on} onClick={() => setMarks((m) => { const n = new Set(m); if (n.has(ph)) n.delete(ph); else n.add(ph); return n; })} className={`tap ipa rounded-xl border px-3 py-2 text-lg font-semibold ${on ? 'border-danger bg-danger-soft text-danger' : 'border-line bg-surface'}`}>/{p?.symbol}/</button></li>;
              })}
            </ul>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => { setRes((r) => ({ ...r, skippedSpeaking: true })); setI(0); setPart('self'); }} className="tap rounded-2xl border border-line bg-surface py-3 text-sm font-semibold">Bỏ qua phần nói</button>
              <button type="button" onClick={() => readNext()} className="tap rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-ink">{marks.size ? 'Ghi nhận và tiếp' : 'Đều ổn, tiếp'}</button>
            </div>
          </section>
        );
      })() : null}

      {part === 'sentence' ? (() => {
        const st = SENTENCES[i];
        return (
          <section className="card p-4">
            <p className="eyebrow text-muted">Phần 3 • Đọc câu • {i + 1}/{SENTENCES.length}</p>
            <p className="mt-2 text-center text-2xl font-semibold">{st.en}</p>
            <p className="text-center text-sm text-muted">{st.vi} • Chú ý: {st.focus}</p>
            <div className="mt-2"><Recorder key={st.en} modelText={st.en} compact /></div>
            <p className="mt-3 text-sm font-medium">So với mẫu, câu của bạn thế nào?</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setSentenceOk(false)} className={`tap rounded-xl border-2 py-2.5 text-sm font-semibold ${sentenceOk === false ? 'border-danger bg-danger-soft text-danger' : 'border-line bg-surface'}`}>Khác mẫu rõ</button>
              <button type="button" onClick={() => setSentenceOk(true)} className={`tap rounded-xl border-2 py-2.5 text-sm font-semibold ${sentenceOk === true ? 'border-accent bg-accent-soft text-accent' : 'border-line bg-surface'}`}>Gần giống mẫu</button>
            </div>
            <button type="button" onClick={sentenceNext} className="tap mt-3 w-full rounded-2xl bg-primary py-3 font-semibold text-primary-ink">{sentenceOk === null ? 'Bỏ qua câu này' : 'Tiếp'}</button>
          </section>
        );
      })() : null}

      {part === 'self' ? (
        <section className="card flex flex-col gap-4 p-4">
          <p className="eyebrow text-muted">Phần 4 • Tự đánh giá</p>
          <fieldset>
            <legend className="text-sm font-medium">Giọng vùng miền của bạn</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {([['bac', 'Miền Bắc'], ['trung', 'Miền Trung'], ['nam', 'Miền Nam'], ['khac', 'Khác']] as [Region, string][]).map(([k, l]) => (
                <button key={k} type="button" aria-pressed={region === k} onClick={() => setRegion(k)} className={`tap rounded-xl border-2 py-2 text-sm font-semibold ${region === k ? 'border-accent bg-accent-soft text-accent' : 'border-line bg-surface'}`}>{l}</button>
              ))}
            </div>
          </fieldset>
          <label className="text-sm">Mức tự tin khi nói tiếng Anh: <span className="font-semibold">{confSpeak}/5</span>
            <input type="range" min={1} max={5} value={confSpeak} onChange={(e) => setConfSpeak(Number(e.target.value))} className="mt-1 w-full accent-[var(--c-primary)]" />
          </label>
          <label className="text-sm">Mức tự tin khi nghe người bản ngữ: <span className="font-semibold">{confListen}/5</span>
            <input type="range" min={1} max={5} value={confListen} onChange={(e) => setConfListen(Number(e.target.value))} className="mt-1 w-full accent-[var(--c-primary)]" />
          </label>
          <p className="text-xs text-muted">Câu hỏi thứ tư (mục tiêu học) lấy từ phần thiết lập lộ trình{profile.goal ? '' : '; bạn có thể đặt ở mục Cá nhân'}.</p>
          <button type="button" onClick={finish} className="tap rounded-2xl bg-primary py-3 font-semibold text-primary-ink">Xem kết quả</button>
        </section>
      ) : null}

      {part === 'result' ? <DiagnosticResult res={res} region={region} /> : null}
    </div>
  );
}

function DiagnosticResult({ res, region }: { res: Result; region?: Region }) {
  const listenGood: string[] = [];
  const listenBad: string[] = [];
  for (const [code, t] of Object.entries(res.listen)) (t.c === t.t ? listenGood : listenBad).push(code);
  const speakBad = Object.entries(res.speak).filter(([, t]) => t.c < t.t).sort((a, b) => (a[1].c / a[1].t) - (b[1].c / b[1].t)).map(([c]) => c);
  const weakSounds = Object.entries(res.weakSounds).sort((a, b) => b[1] - a[1]).map(([id]) => id);
  const finalSounds = weakSounds.filter((id) => ['s', 'z', 'v', 'd', 'l'].includes(id));
  const priority = Array.from(new Set([...listenBad, ...speakBad])).slice(0, 2) as ErrorCode[];
  const regionHint = region === 'bac' ? 'Với giọng miền Bắc, hãy chú ý thêm /ɹ/ (không đọc thành /z/), /ʃ/ và cặp l/n.' : region === 'nam' ? 'Với giọng miền Nam, hãy chú ý thêm /v/ (không đọc thành /j/) và /n/ cuối từ.' : null;

  return (
    <div className="flex flex-col gap-4">
      <section className="card p-5">
        <p className="inline-flex items-center gap-2 font-bold text-accent"><IconCheck size={20} /> Đã xong bài kiểm tra</p>
        <dl className="mt-3 space-y-3 text-sm">
          <div><dt className="font-semibold">Nghe phân biệt tốt</dt><dd className="text-muted">{listenGood.length ? listenGood.map((c) => `${c} ${getVei(c)?.short}`).join(', ') : 'Chưa có nhóm nào đúng hết.'}</dd></div>
          <div><dt className="font-semibold">Dễ nhầm khi nghe</dt><dd className="text-muted">{listenBad.length ? listenBad.map((c) => `${c} ${getVei(c)?.short}`).join(', ') : 'Không nhầm câu nào.'}</dd></div>
          <div><dt className="font-semibold">Khi nói, các âm bạn thấy khác mẫu</dt><dd className="ipa text-muted">{res.skippedSpeaking ? 'Đã bỏ qua phần nói.' : weakSounds.length ? weakSounds.map((id) => `/${getPhoneme(id)?.symbol}/`).join(', ') : 'Không đánh dấu âm nào.'}</dd></div>
          {finalSounds.length ? <div><dt className="font-semibold">Âm cuối còn thiếu</dt><dd className="ipa text-muted">{finalSounds.map((id) => `/${getPhoneme(id)?.symbol}/`).join(', ')}</dd></div> : null}
        </dl>
        {regionHint ? <p className="mt-3 rounded-xl bg-surface-2 p-3 text-xs">{regionHint}</p> : null}
      </section>
      <section>
        <h2 className="mb-2 text-lg font-extrabold">Nên luyện trước</h2>
        {priority.length ? (
          <ul className="flex flex-col gap-2">
            {priority.map((c) => (
              <li key={c}><Link href={`/errors/${c}`} className="card tap flex items-center gap-3 px-4 py-3"><span className="flex size-10 items-center justify-center rounded-2xl bg-danger-soft text-xs font-bold text-danger">{c}</span><span className="flex-1"><span className="block font-semibold">{getVei(c)?.title}</span><span className="block text-xs text-muted">Bài chữa lỗi 6 bước</span></span></Link></li>
            ))}
          </ul>
        ) : <p className="card p-4 text-sm text-muted">Chưa thấy nhóm lỗi nổi bật. Bắt đầu lộ trình 3000 từ; hệ thống sẽ tiếp tục cập nhật theo kết quả luyện.</p>}
      </section>
      <p className="text-xs text-muted">Kết quả dựa trên bài nghe và tự đánh giá của bạn, chưa có AI chấm. Bản đồ âm sẽ chính xác dần qua nhiều lần học.</p>
      <div className="flex flex-col gap-2">
        <Link href="/me" className="tap rounded-2xl border border-line bg-surface py-3 text-center text-sm font-semibold">Xem bản đồ phát âm</Link>
        <Link href="/" className="tap rounded-2xl bg-primary py-3 text-center font-semibold text-primary-ink">Về trang Hôm nay</Link>
      </div>
    </div>
  );
}
