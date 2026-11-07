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
  if (!back) {
    // Trang gốc của tab: tiêu đề lớn kiểu báo chí, không dính đầu trang.
    return (
      <header className="px-4 pb-1 pt-7">
        {eyebrow ? <p className="eyebrow text-primary">{eyebrow}</p> : null}
        <div className="mt-2 flex items-end gap-3">
          <h1 className="min-w-0 flex-1 text-[32px] font-extrabold leading-[1.08] tracking-tight">{title}</h1>
          {right}
        </div>
        {subtitle ? <p className="mt-2 text-sm text-muted">{subtitle}</p> : null}
      </header>
    );
  }
  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-bg/90 backdrop-blur supports-[backdrop-filter]:bg-bg/80 dark:border-white/5">
      <div className="flex min-h-15 items-center gap-2 px-3 py-2.5">
        {back ? (
          <Link href={back} aria-label="Quay lại" className="tap -ml-1 flex size-10 items-center justify-center rounded-full border border-line bg-surface text-ink hover:bg-surface-2">
            <IconChevronLeft size={22} />
          </Link>
        ) : null}
        <div className="min-w-0 flex-1">
          {eyebrow ? <p className="eyebrow truncate text-primary">{eyebrow}</p> : null}
          <h1 className="truncate text-[17px] font-extrabold leading-tight">{title}</h1>
          {subtitle ? <p className="truncate text-xs text-muted">{subtitle}</p> : null}
        </div>
        {right}
      </div>
    </header>
  );
}
