'use client';

import Link from 'next/link';
import type { WordLite } from '@/data/types';
import { useAppState, STATUS_LABEL } from '@/lib/store';
import { PlayButton } from './PlayButton';
import { Ipa } from './Ipa';
import { IconChevronRight, IconStar } from './icons';

const STATUS_PILL: Record<string, string> = {
  learning: 'bg-warn-soft text-warn',
  review: 'bg-primary-soft text-primary',
  'needs-practice': 'bg-danger-soft text-danger',
  mastered: 'bg-accent-soft text-accent',
};

export function WordRow({ w, index, showMeta = false }: { w: WordLite; index?: number; showMeta?: boolean }) {
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
            <Ipa value={w.ipa} className="truncate text-sm text-muted" />
            {w.gold ? <IconStar size={12} className="shrink-0 text-warn" aria-label="Bài chuẩn" /> : null}
          </div>
          <p className="truncate text-xs text-muted">
            {showMeta ? <span className="font-semibold text-ink">L{w.difficulty} • {w.errorCodes.join(' ')} • </span> : null}
            {w.meaning}
          </p>
        </div>
        {st !== 'new' ? (
          <span className={`shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_PILL[st]}`}>{STATUS_LABEL[st as keyof typeof STATUS_LABEL]}</span>
        ) : null}
        <IconChevronRight size={18} className="shrink-0 text-muted" />
      </Link>
    </li>
  );
}
