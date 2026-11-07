'use client';

import Link from 'next/link';
import type { WordEntry } from '@/data/types';
import { useAppState } from '@/lib/store';
import { PlayButton } from './PlayButton';
import { IconChevronRight } from './icons';

const STATUS_DOT: Record<string, string> = {
  new: 'bg-line',
  learning: 'bg-warn',
  review: 'bg-primary',
  mastered: 'bg-accent',
};

export function WordRow({ w, index }: { w: WordEntry; index?: number }) {
  const { words } = useAppState();
  const st = words[w.slug]?.status ?? 'new';
  const group = String(w.group).padStart(2, '0');
  return (
    <li className="card flex items-center gap-2 px-3 py-2">
      <PlayButton text={w.word} size="sm" variant="soft" />
      <Link href={`/words/${group}/${w.slug}`} className="tap flex min-w-0 flex-1 items-center gap-3 py-1">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            {index !== undefined ? <span className="text-[11px] tabular-nums text-muted">{String(index).padStart(3, '0')}</span> : null}
            <span className="truncate font-semibold">{w.word}</span>
            <span className="ipa truncate text-sm text-muted">/{w.ipa}/</span>
          </div>
          <p className="truncate text-xs text-muted">{w.meaning}</p>
        </div>
        <span className={`size-2 shrink-0 rounded-full ${STATUS_DOT[st]}`} aria-label={`Trạng thái: ${st}`} />
        <IconChevronRight size={18} className="shrink-0 text-muted" />
      </Link>
    </li>
  );
}
