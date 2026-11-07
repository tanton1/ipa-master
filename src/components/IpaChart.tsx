'use client';

import Link from 'next/link';
import { useState } from 'react';
import { MONOPHTHONGS, DIPHTHONGS, CONSONANTS } from '@/data/phonemes';
import type { Phoneme } from '@/data/types';
import { PRIORITY_LABEL } from '@/lib/tones';

type Filter = 'all' | 'hard' | 'voiced';

const SECTIONS: { title: string; hint: string; items: Phoneme[] }[] = [
  { title: 'Nguyên âm đơn', hint: '11 âm • lưỡi và độ mở hàm quyết định', items: MONOPHTHONGS },
  { title: 'Nguyên âm đôi', hint: '5 âm • lướt từ âm này sang âm kia', items: DIPHTHONGS },
  { title: 'Phụ âm', hint: '24 âm • chú ý rung dây thanh và âm cuối', items: CONSONANTS },
];

export function IpaChart() {
  const [filter, setFilter] = useState<Filter>('all');

  const keep = (p: Phoneme) =>
    filter === 'all' ? true : filter === 'hard' ? p.priority === 1 : p.type === 'consonant' && p.voiced === true;

  return (
    <div className="flex flex-col gap-6">
      <div role="tablist" aria-label="Lọc âm" className="no-scrollbar flex gap-2 overflow-x-auto">
        {([
          ['all', 'Tất cả'],
          ['hard', 'Khó với người Việt'],
          ['voiced', 'Phụ âm hữu thanh'],
        ] as [Filter, string][]).map(([k, label]) => (
          <button
            key={k}
            role="tab"
            aria-selected={filter === k}
            onClick={() => setFilter(k)}
            className={`tap shrink-0 rounded-full px-4 py-2 text-sm font-medium ${filter === k ? 'bg-primary text-primary-ink' : 'bg-surface text-ink border border-line'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted" aria-label="Chú giải">
        {[1, 2, 3].map((n) => (
          <li key={n} className="flex items-center gap-1.5"><span className={`size-2 rounded-full ${PRIORITY_LABEL[n].dot}`} />{PRIORITY_LABEL[n].label}</li>
        ))}
      </ul>

      {SECTIONS.map((sec) => {
        const items = sec.items.filter(keep);
        if (!items.length) return null;
        return (
          <section key={sec.title} aria-labelledby={`sec-${sec.title}`}>
            <h2 id={`sec-${sec.title}`} className="font-semibold">{sec.title}</h2>
            <p className="mb-3 text-xs text-muted">{sec.hint}</p>
            <ul className="grid grid-cols-4 gap-2">
              {items.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/ipa/${p.id}`}
                    className="card tap relative flex min-h-20 flex-col items-center justify-center gap-1 px-1 py-3"
                    aria-label={`Âm ${p.symbol}, ${p.name}, ví dụ ${p.examples[0]}`}
                  >
                    <span className={`absolute right-2 top-2 size-1.5 rounded-full ${PRIORITY_LABEL[p.priority].dot}`} aria-hidden />
                    <span className="ipa text-2xl font-semibold leading-none">{p.symbol}{p.alt ? <span className="text-base text-muted"> {p.alt}</span> : null}</span>
                    <span className="truncate text-[11px] text-muted">{p.examples[0]}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <p className="text-xs leading-relaxed text-muted">
        Ký hiệu theo chuẩn Anh-Mỹ phổ thông (General American). Âm /ɾ/ (âm vỗ trong water, bottle) là biến thể của /t/ nên không liệt kê riêng.
      </p>
    </div>
  );
}
