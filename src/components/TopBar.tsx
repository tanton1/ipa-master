import Link from 'next/link';
import type { ReactNode } from 'react';
import { IconChevronLeft } from './icons';

interface Props {
  title: string;
  subtitle?: string;
  back?: string;
  right?: ReactNode;
  eyebrow?: string;
}

export function TopBar({ title, subtitle, back, right, eyebrow }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur supports-[backdrop-filter]:bg-bg/75">
      <div className="flex min-h-14 items-center gap-2 px-3 py-2">
        {back ? (
          <Link href={back} aria-label="Quay lại" className="tap -ml-1 flex size-10 items-center justify-center rounded-full text-ink hover:bg-surface-2">
            <IconChevronLeft size={22} />
          </Link>
        ) : null}
        <div className="min-w-0 flex-1">
          {eyebrow ? <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-primary">{eyebrow}</p> : null}
          <h1 className="truncate text-base font-semibold leading-tight">{title}</h1>
          {subtitle ? <p className="truncate text-xs text-muted">{subtitle}</p> : null}
        </div>
        {right}
      </div>
    </header>
  );
}
