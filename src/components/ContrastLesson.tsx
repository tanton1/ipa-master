'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { ContrastLesson as Lesson, ContrastPair } from '@/data/contrast';
import { getPhoneme } from '@/data/phonemes';
import { MouthDiagram } from './MouthDiagram';
import { PlayButton } from './PlayButton';
import { Recorder } from './Recorder';
import { useTts } from '@/lib/tts';
import { recordListen, recordSpeak } from '@/lib/store';
import { VEI } from '@/data/vei';
import { IconCheck, IconAlert, IconSparkle, IconEar } from './icons';

const SUBSTITUTES: Record<string, string[]> = { th: ['t', 's'], dh: ['d', 'z'] };

interface Q { pair: ContrastPair; side: 'a' | 'b' }

function makeQuiz(pairs: ContrastPair[], n = 8): Q[] {
  const out: Q[] = [];
  for (let i = 0; i < n; i++) {
    const pair = pairs[Math.floor(Math.random() * pairs.length)];
    out.push({ pair, side: Math.random() < 0.5 ? 'a' : 'b' });
  }
  return out;
}

export function ContrastLesson({ lesson }: { lesson: Lesson }) {
  const sounds = lesson.sounds.map((id) => getPhoneme(id)).filter(Boolean);
  // Nguyên âm luôn hữu thanh; chỉ phụ âm mới có cờ voiced riêng.
  const voicedFlags = lesson.sounds.map((id) => { const p = getPhoneme(id); return p ? (p.type === 'consonant' ? !!p.voiced : true) : undefined; });
  const voicingPair = voicedFlags.length === 2 && voicedFlags[0] !== voicedFlags[1];
  const subs = lesson.sounds.length === 1 ? (SUBSTITUTES[lesson.sounds[0]] ?? []) : [];
  const { say } = useTts();

  // Bài nghe phân biệt
  const [quiz, setQuiz] = useState<Q[] | null>(null);
  const [qi, setQi] = useState(0);
  const [answer, setAnswer] = useState<'a' | 'b' | null>(null);
  const [score, setScore] = useState(0);
  const current = quiz?.[qi];
  const finished = quiz !== null && qi >= quiz.length;

  function startQuiz() {
    const q = makeQuiz(lesson.pairs);
    setQuiz(q); setQi(0); setAnswer(null); setScore(0);
    window.setTimeout(() => say(q[0].pair[q[0].side].word), 250);
  }
  function choose(side: 'a' | 'b') {
    if (!current || answer) return;
    setAnswer(side);
    if (side === current.side) setScore((s) => s + 1);
    recordListen({ correct: side === current.side, phonemes: lesson.sounds, codes });
  }
  function next() {
    if (!quiz) return;
    const n = qi + 1;
    setQi(n); setAnswer(null);
    if (n < quiz.length) window.setTimeout(() => say(quiz[n].pair[quiz[n].side].word), 200);
  }

  // Luyện nói
  const [pairIdx, setPairIdx] = useState(0);
  const [recorded, setRecorded] = useState(false);
  const [selfRated, setSelfRated] = useState<'ok' | 'bad' | null>(null);
  const practicePair = lesson.pairs[pairIdx];
  const modelText = useMemo(() => `${practicePair.a.word}. ${practicePair.b.word}.`, [practicePair]);

  const codes = VEI.filter((e) => e.contrastId === lesson.id || lesson.sounds.some((id) => e.phonemes.includes(id))).map((e) => e.code).slice(0, 1);

  function rate(ok: boolean) {
    setSelfRated(ok ? 'ok' : 'bad');
    recordSpeak(lesson.sounds, ok, codes);
  }

  return (
    <main className="flex flex-col gap-6 px-4 pt-4">
      <section className="card p-4">
        <p className="text-sm leading-relaxed">{lesson.summary}</p>
        <h2 className="mt-4 flex items-center gap-1.5 text-lg font-extrabold"><IconAlert size={16} className="text-danger" /> Vì sao người Việt hay sai</h2>
        <p className="mt-1 text-sm leading-relaxed">{lesson.whyHard}</p>
      </section>

      <section aria-labelledby="diagram-title">
        <h2 id="diagram-title" className="mb-2 text-lg font-extrabold">Khẩu hình</h2>
        <div className={`grid gap-3 ${sounds.length + subs.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : ''}`}>
          {sounds.map((p) => p && (
            <div key={p.id}>
              <p className="mb-1 text-sm"><Link href={`/ipa/${p.id}`} className="ipa font-semibold text-primary">/{p.symbol}/</Link> <span className="text-muted">{p.name}</span></p>
              <MouthDiagram phonemeId={p.id} />
            </div>
          ))}
          {subs.map((id) => {
            const p = getPhoneme(id);
            return p ? (
              <div key={id}>
                <p className="mb-1 text-sm"><span className="ipa font-semibold text-danger">/{p.symbol}/</span> <span className="text-muted">âm người Việt hay dùng thay</span></p>
                <MouthDiagram phonemeId={id} showLabels={false} />
              </div>
            ) : null;
          })}
        </div>
      </section>

      <section className="card p-4">
        <h2 className="text-lg font-extrabold">Cách sửa từng bước</h2>
        <ol className="mt-2 space-y-3">
          {lesson.steps.map((st, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-ink">{i + 1}</span>
              <span>{st}</span>
            </li>
          ))}
        </ol>
        <div className="mt-4 flex gap-2 rounded-xl bg-accent-soft p-3 text-sm">
          <IconSparkle size={18} className="mt-0.5 shrink-0 text-accent" />
          <p><span className="font-semibold">Cảm nhận: </span>{lesson.feel}</p>
        </div>
      </section>

      <section aria-labelledby="pairs-title">
        <h2 id="pairs-title" className="mb-2 text-lg font-extrabold">Cặp từ dễ nhầm</h2>
        <ul className="card divide-y divide-line">
          {lesson.pairs.map((pr, i) => (
            <li key={i} className="grid grid-cols-2 gap-2 px-3 py-2">
              {(['a', 'b'] as const).map((side) => (
                <div key={side} className="flex items-center gap-2">
                  <PlayButton text={pr[side].word} size="sm" />
                  <div className="min-w-0">
                    <span className="block truncate font-semibold">{pr[side].word}</span>
                    <span className="ipa block truncate text-xs text-muted">/{pr[side].ipa}/</span>
                  </div>
                </div>
              ))}
            </li>
          ))}
        </ul>
      </section>

      <section className="card p-4" aria-labelledby="quiz-title">
        <h2 id="quiz-title" className="flex items-center gap-1.5 font-bold"><IconEar size={18} className="text-primary" /> Bài nghe phân biệt</h2>
        <p className="mt-1 text-xs text-muted">Nghe một từ rồi chọn bạn nghe thấy từ nào. 8 câu, có thể nghe lại.</p>
        {!quiz ? (
          <button type="button" onClick={startQuiz} className="tap mt-3 w-full rounded-2xl bg-primary py-3 font-semibold text-primary-ink">Bắt đầu</button>
        ) : finished ? (
          <div className="mt-3 text-center">
            <p className="text-3xl font-bold tabular-nums">{score}/{quiz.length}</p>
            <p className="mt-1 text-sm text-muted">{score >= 7 ? 'Tai bạn đã phân biệt tốt. Chuyển sang luyện nói.' : score >= 5 ? 'Khá ổn. Nghe lại các cặp từ rồi thử lần nữa.' : 'Chưa ổn. Hãy nghe từng cặp từ bên trên vài lần rồi làm lại.'}</p>
            <button type="button" onClick={startQuiz} className="tap mt-3 rounded-full border border-line bg-surface px-5 py-2 text-sm font-semibold">Làm lại</button>
          </div>
        ) : current ? (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-muted">
              <span>Câu {qi + 1}/{quiz.length}</span>
              <span className="tabular-nums">Đúng: {score}</span>
            </div>
            <div className="my-3 flex justify-center">
              <PlayButton text={current.pair[current.side].word} size="lg" variant="primary" ariaLabel="Nghe lại từ" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(['a', 'b'] as const).map((side) => {
                const w = current.pair[side];
                const isAnswer = answer === side;
                const correct = current.side === side;
                const cls = !answer
                  ? 'border-line bg-surface'
                  : correct
                    ? 'border-accent bg-accent-soft'
                    : isAnswer
                      ? 'border-danger bg-danger-soft'
                      : 'border-line bg-surface opacity-60';
                return (
                  <button key={side} type="button" disabled={!!answer} onClick={() => choose(side)} className={`tap rounded-2xl border-2 px-3 py-4 text-left ${cls}`}>
                    <span className="block text-lg font-semibold">{w.word}</span>
                    <span className="ipa block text-sm text-muted">/{w.ipa}/</span>
                    {answer && correct ? <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-accent"><IconCheck size={14} /> Đáp án</span> : null}
                  </button>
                );
              })}
            </div>
            {answer ? (
              <button type="button" onClick={next} className="tap mt-3 w-full rounded-2xl bg-primary py-3 font-semibold text-primary-ink">
                {answer === current.side ? 'Chính xác! Câu tiếp' : 'Chưa đúng. Câu tiếp'}
              </button>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="card p-4" aria-labelledby="speak-title">
        <h2 id="speak-title" className="font-bold">Luyện nói và tự kiểm tra</h2>
        <p className="mt-1 text-xs text-muted">Chọn một cặp từ, nghe mẫu, ghi âm cả hai từ rồi nghe lại. {voicingPair ? 'Để tay lên cổ để kiểm tra rung thanh: một âm rung, một âm không.' : voicedFlags.length === 2 ? `Cả hai âm đều ${voicedFlags[0] ? 'rung' : 'không rung'} dây thanh nên tay trên cổ không giúp phân biệt. Hãy để ý: ${lesson.feel}` : `Hãy để ý: ${lesson.feel}`}</p>
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          {lesson.pairs.map((pr, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { setPairIdx(i); setRecorded(false); setSelfRated(null); }}
              aria-pressed={pairIdx === i}
              className={`tap shrink-0 rounded-full border px-3 py-1.5 text-sm ${pairIdx === i ? 'border-ink bg-ink font-semibold text-bg' : 'border-line bg-surface'}`}
            >
              {pr.a.word} – {pr.b.word}
            </button>
          ))}
        </div>
        <div className="mt-3">
          <Recorder modelText={modelText} onRecorded={() => { setRecorded(true); setSelfRated(null); }} />
        </div>
        {recorded ? (
          <div className="mt-3 rounded-xl bg-surface-2 p-3">
            <p className="text-sm font-medium">Nghe lại: hai từ của bạn có khác nhau rõ như mẫu không?</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => rate(false)} className={`tap rounded-xl border-2 px-3 py-2 text-sm font-semibold ${selfRated === 'bad' ? 'border-danger bg-danger-soft text-danger' : 'border-line bg-surface'}`}>Chưa rõ, cần luyện</button>
              <button type="button" onClick={() => rate(true)} className={`tap rounded-xl border-2 px-3 py-2 text-sm font-semibold ${selfRated === 'ok' ? 'border-accent bg-accent-soft text-accent' : 'border-line bg-surface'}`}>Đã phân biệt được</button>
            </div>
            {selfRated === 'bad' ? <p className="mt-2 text-xs text-muted">Đã ghi nhận vào bản đồ âm. Âm này sẽ được ưu tiên trong kế hoạch hôm nay.</p> : null}
            {selfRated === 'ok' ? <p className="mt-2 text-xs text-muted">Tốt. Thử cặp khác hoặc đọc các từ này trong câu ở mục Từ vựng.</p> : null}
          </div>
        ) : null}
      </section>

      <p className="text-xs leading-relaxed text-muted">
        App chưa chấm điểm phát âm tự động. Âm thanh ghi lại không đủ để biết chính xác vị trí lưỡi, nên phần này hướng dẫn bạn tự đối chiếu. Tính năng chấm bằng AI sẽ có ở giai đoạn sau, kèm mức độ tin cậy cho từng kết quả.
      </p>
    </main>
  );
}
