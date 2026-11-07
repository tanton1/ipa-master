'use client';

import Link from 'next/link';
import { getPhoneme } from '@/data/phonemes';
import { PRIORITY_LABEL } from '@/lib/tones';

interface Props {
  ids: string[];
  size?: 'sm' | 'lg';
  selected?: string | null;
  onSelect?: (id: string) => void;
  /** hiện nhãn ngắn dưới ký hiệu */
  withLabel?: boolean;
  linkTo?: boolean;
}

export function shortLabel(id: string): string {
  const p = getPhoneme(id);
  if (!p) return id;
  if (p.type === 'diphthong') return 'Nguyên âm đôi';
  if (p.type === 'vowel') return 'Nguyên âm';
  return p.place ?? 'Phụ âm';
}

export function IpaChips({ ids, size = 'sm', selected, onSelect, withLabel = false, linkTo = true }: Props) {
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Các âm trong từ">
      {ids.map((id, i) => {
        const p = getPhoneme(id);
        if (!p) return null;
        const active = selected === id;
        const pr = PRIORITY_LABEL[p.priority];
        const inner = (
          <>
            <span className={`ipa font-semibold leading-none ${size === 'lg' ? 'text-2xl' : 'text-base'}`}>{p.symbol}</span>
            {withLabel ? <span className="mt-1 text-[10px] leading-tight text-muted">{shortLabel(id)}</span> : null}
            <span className={`absolute right-1.5 top-1.5 size-1.5 rounded-full ${pr.dot}`} aria-hidden />
          </>
        );
        const cls = `tap relative flex flex-col items-center justify-center rounded-xl border px-3 ${size === 'lg' ? 'min-w-16 py-3' : 'min-w-11 py-2'} ${
          active ? 'border-ink bg-ink text-bg' : 'border-line bg-surface text-ink'
        }`;
        return (
          <li key={`${id}-${i}`}>
            {onSelect ? (
              <button type="button" onClick={() => onSelect(id)} aria-pressed={active} aria-label={`Âm ${p.symbol}, ${p.name}`} className={cls}>{inner}</button>
            ) : linkTo ? (
              <Link href={`/ipa/${id}`} aria-label={`Âm ${p.symbol}, ${p.name}`} className={cls}>{inner}</Link>
            ) : (
              <span className={cls}>{inner}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
