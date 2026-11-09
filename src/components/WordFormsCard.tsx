'use client';

import { useState } from 'react';
import type { WordEntry, WordForm, WordForms } from '@/data/types';
import { useTts } from '@/lib/tts';
import { recordListen } from '@/lib/store';
import { PlayButton } from './PlayButton';
import { Recorder } from './Recorder';
import { Ipa } from './Ipa';

interface Props {
  w: WordEntry;
  forms: WordForms;
  /** listen: nghe và đố dạng nào; speak: chọn cụm và ghi âm */
  mode: 'listen' | 'speak';
}

const QUIZ_N = 4;

/** Bảng dạng đọc theo ngữ cảnh: đọc riêng lẻ khác đọc trong câu. */
export function WordFormsCard({ w, forms, mode }: Props) {
  const { say } = useTts();
  const quizForms = forms.forms.filter((f) => !f.emphasis);
  const canQuiz = mode === 'listen' && quizForms.length >= 2;

  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [target, setTarget] = useState<{ form: WordForm; text: string } | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);

  function play() {
    const form = quizForms[Math.floor(Math.random() * quizForms.length)];
    const text = form.examples[Math.floor(Math.random() * form.examples.length)];
    setTarget({ form, text }); setAnswer(null);
    window.setTimeout(() => say(text), 150);
  }
  function choose(ipa: string) {
    if (!target || answer) return;
    setAnswer(ipa);
    const ok = ipa === target.form.ipa;
    if (ok) setScore((x) => x + 1);
    recordListen({ slug: w.slug, correct: ok });
  }
  function next() {
    const r = round + 1;
    setRound(r);
    if (r < QUIZ_N) play(); else setTarget(null);
  }

  const allExamples = forms.forms.flatMap((f) => f.examples.map((text) => ({ text, form: f })));
  const [pick, setPick] = useState(0);
  const chosen = allExamples[pick] ?? allExamples[0];

  return (
    <section className="card p-4" aria-labelledby={`forms-${mode}`}>
      <p className="eyebrow text-primary">Đọc riêng lẻ khác đọc trong câu</p>
      <h3 id={`forms-${mode}`} className="mt-1 font-bold">{mode === 'listen' ? `"${w.word}" có ${forms.forms.length} cách đọc` : 'Nói đúng dạng trong cụm từ'}</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted">{forms.summary}</p>

      {mode === 'listen' ? (
        <ul className="mt-3 flex flex-col gap-2">
          {forms.forms.map((f) => (
            <li key={f.ipa + f.label} className="rounded-2xl bg-surface p-3">
              <div className="flex items-center gap-3">
                <Ipa value={f.ipa} className="text-2xl font-semibold text-primary" />
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${f.emphasis ? 'bg-surface-2 text-muted' : 'bg-accent-soft text-accent'}`}>{f.label}</span>
              </div>
              <p className="mt-1 text-xs text-muted">{f.when}</p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {f.examples.map((ex) => (
                  <li key={ex} className="inline-flex items-center gap-1 rounded-full border border-line bg-surface pl-1 pr-3 text-sm">
                    <PlayButton text={ex} size="sm" variant="ghost" ariaLabel={`Nghe: ${ex}`} />
                    <span>{ex}</span>
                  </li>
                ))}
              </ul>
              {f.sampleIpa ? <p className="mt-1.5 text-xs text-muted">{f.examples[0]}: <Ipa value={f.sampleIpa} className="text-ink" /></p> : null}
            </li>
          ))}
        </ul>
      ) : null}

      {forms.rule ? <p className="mt-3 rounded-xl bg-primary-soft p-3 text-xs leading-relaxed"><span className="font-semibold text-primary">Cần nhớ: </span>{forms.rule}</p> : null}

      {canQuiz ? (
        <div className="mt-4 rounded-2xl border border-line bg-surface p-3">
          <div className="flex items-baseline justify-between">
            <p className="font-semibold">Nghe: dạng nào?</p>
            <span className="text-xs tabular-nums text-muted">{Math.min(round, QUIZ_N)}/{QUIZ_N} • đúng {score}</span>
          </div>
          <p className="mt-0.5 text-xs text-muted">Giọng mẫu là giọng tổng hợp; nếu nghe không rõ, hãy dựa vào từ đứng sau để chọn.</p>
          {round >= QUIZ_N ? (
            <div className="mt-3 text-center">
              <p className="text-sm">{score >= 3 ? 'Bạn nhận ra dạng đọc theo ngữ cảnh tốt.' : 'Còn nhầm. Nghe lại các ví dụ ở trên rồi thử lại.'}</p>
              <button type="button" onClick={() => { setRound(0); setScore(0); setTarget(null); setAnswer(null); }} className="tap mt-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold">Làm lại</button>
            </div>
          ) : !target ? (
            <button type="button" onClick={play} className="tap mt-3 w-full rounded-2xl bg-primary py-3 font-semibold text-primary-ink">Phát một cụm</button>
          ) : (
            <>
              <div className="my-3 flex justify-center"><PlayButton text={target.text} size="md" variant="primary" ariaLabel="Nghe lại" /></div>
              <div className="grid grid-cols-2 gap-2">
                {quizForms.map((f) => {
                  const correct = target.form.ipa === f.ipa;
                  const cls = !answer ? 'border-line bg-surface' : correct ? 'border-accent bg-accent-soft' : answer === f.ipa ? 'border-danger bg-danger-soft' : 'border-line bg-surface opacity-60';
                  return (
                    <button key={f.ipa + f.label} type="button" disabled={!!answer} onClick={() => choose(f.ipa)} className={`tap rounded-2xl border-2 px-3 py-3 text-left ${cls}`}>
                      <Ipa value={f.ipa} className="block text-lg font-semibold" />
                      <span className="block text-[11px] text-muted">{f.label}</span>
                    </button>
                  );
                })}
              </div>
              {answer ? (
                <>
                  <p className="mt-2 text-sm">{answer === target.form.ipa ? 'Đúng.' : 'Chưa đúng.'} Cụm vừa nghe: <span className="font-semibold">{target.text}</span>{target.form.sampleIpa && target.form.examples[0] === target.text ? <> <Ipa value={target.form.sampleIpa} className="text-muted" /></> : null}</p>
                  <button type="button" onClick={next} className="tap mt-2 w-full rounded-2xl bg-primary py-2.5 text-sm font-semibold text-primary-ink">Tiếp</button>
                </>
              ) : null}
            </>
          )}
        </div>
      ) : null}

      {mode === 'speak' && chosen ? (
        <>
          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
            {allExamples.map((ex, i) => (
              <button key={ex.text + i} type="button" onClick={() => setPick(i)} aria-pressed={pick === i} className={`tap shrink-0 rounded-full border px-3 py-1.5 text-sm ${pick === i ? 'border-ink bg-ink font-semibold text-bg' : 'border-line bg-surface'}`}>{ex.text}</button>
            ))}
          </div>
          <p className="mt-3 text-center text-xl font-semibold">{chosen.text}</p>
          <p className="mt-1 text-center text-sm text-muted">"{w.word}" ở đây đọc <Ipa value={chosen.form.ipa} className="font-semibold text-primary" /> · {chosen.form.label}</p>
          <div className="mt-2"><Recorder key={chosen.text} modelText={chosen.text} compact /></div>
        </>
      ) : null}
    </section>
  );
}
