'use client';

import { useState } from 'react';
import type { WordEntry, WordPhrase } from '@/data/types';
import { PlayButton } from './PlayButton';
import { Recorder } from './Recorder';

interface Props {
  w: WordEntry;
  phrases: WordPhrase[];
  /** learn: xem cụm và câu mẫu; apply: chọn câu mẫu rồi nói và ghi âm */
  mode: 'learn' | 'apply';
}

/** Tô đậm cụm từ bên trong câu mẫu (không phân biệt hoa thường). */
function Highlight({ text, part }: { text: string; part: string }) {
  const i = text.toLowerCase().indexOf(part.toLowerCase());
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <strong className="font-bold text-primary">{text.slice(i, i + part.length)}</strong>
      {text.slice(i + part.length)}
    </>
  );
}

/** Cụm từ hay dùng (cụm danh từ, kết hợp từ) kèm câu mẫu ứng dụng. */
export function WordPhrasesCard({ w, phrases, mode }: Props) {
  const [pick, setPick] = useState(0);
  const chosen = phrases[pick] ?? phrases[0];
  if (!chosen) return null;

  if (mode === 'learn') {
    return (
      <section className="card p-4" aria-labelledby="phrases-learn">
        <p className="eyebrow text-primary">Cụm từ hay dùng</p>
        <h3 id="phrases-learn" className="mt-1 font-bold">Dùng &ldquo;{w.word}&rdquo; trong cụm từ và câu</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted">Học từ theo cụm giúp nhớ lâu và nói tự nhiên hơn. Nghe cụm trước, rồi nghe cả câu mẫu.</p>
        <ul className="mt-3 flex flex-col gap-2">
          {phrases.map((p) => (
            <li key={p.text} className="rounded-2xl bg-surface p-3">
              <div className="flex items-center gap-2">
                <PlayButton text={p.text} size="sm" variant="soft" ariaLabel={`Nghe cụm: ${p.text}`} />
                <div className="min-w-0">
                  <p className="font-semibold leading-snug">{p.text}</p>
                  <p className="text-xs text-muted">{p.meaning}</p>
                </div>
              </div>
              <div className="mt-2 flex items-start gap-2 border-t border-line pt-2">
                <PlayButton text={p.exampleEn} size="sm" variant="ghost" ariaLabel={`Nghe câu: ${p.exampleEn}`} />
                <div className="min-w-0 text-sm">
                  <p className="leading-snug"><Highlight text={p.exampleEn} part={p.text} /></p>
                  <p className="mt-0.5 text-xs text-muted">{p.exampleVi}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section className="card p-4" aria-labelledby="phrases-apply">
      <p className="eyebrow text-primary">Câu mẫu ứng dụng</p>
      <h3 id="phrases-apply" className="mt-1 font-bold">Nói cụm từ trong câu</h3>
      {phrases.length > 1 ? (
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Chọn cụm từ">
          {phrases.map((p, i) => (
            <button key={p.text} type="button" role="tab" aria-selected={pick === i} onClick={() => setPick(i)} className={`tap shrink-0 rounded-full border px-3 py-1.5 text-sm ${pick === i ? 'border-ink bg-ink font-semibold text-bg' : 'border-line bg-surface'}`}>{p.text}</button>
          ))}
        </div>
      ) : null}
      <p className="mt-3 text-center text-xl font-semibold leading-snug"><Highlight text={chosen.exampleEn} part={chosen.text} /></p>
      <p className="mt-1 text-center text-sm text-muted">{chosen.exampleVi}</p>
      <div className="mt-3 flex items-start justify-center gap-8">
        <PlayButton text={chosen.exampleEn} size="md" variant="primary" label="Bình thường" />
        <PlayButton text={chosen.exampleEn} mode="slow" size="md" variant="soft" label="Chậm" />
      </div>
      <p className="mt-3 text-xs text-muted">Đọc liền cả cụm <span className="font-semibold text-ink">{chosen.text}</span> như một khối, nối âm cuối với âm đầu của từ sau.</p>
      <div className="mt-2"><Recorder key={chosen.exampleEn} modelText={chosen.exampleEn} compact /></div>
    </section>
  );
}
