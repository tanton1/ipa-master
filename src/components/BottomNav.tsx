'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconHome, IconGrid, IconCompare, IconBook, IconRepeat } from './icons';

const ITEMS = [
  { href: '/', label: 'Trang chủ', icon: IconHome, match: (p: string) => p === '/' },
  { href: '/ipa', label: 'Bảng IPA', icon: IconGrid, match: (p: string) => p.startsWith('/ipa') },
  { href: '/contrast', label: 'Việt–Anh', icon: IconCompare, match: (p: string) => p.startsWith('/contrast') },
  { href: '/words', label: '500 từ', icon: IconBook, match: (p: string) => p.startsWith('/words') },
  { href: '/review', label: 'Ôn tập', icon: IconRepeat, match: (p: string) => p.startsWith('/review') },
];

export function BottomNav() {
  const pathname = usePathname() ?? '/';
  const clean = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  return (
    <nav
      aria-label="Điều hướng chính"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2">
        {ITEMS.map((it) => {
          const active = it.match(clean);
          const Icon = it.icon;
          return (
            <li key={it.href} className="flex-1">
              <Link
                href={it.href}
                aria-current={active ? 'page' : undefined}
                className={`tap flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl py-2 text-[11px] font-medium ${
                  active ? 'text-primary' : 'text-muted hover:text-ink'
                }`}
              >
                <span className={`rounded-full px-3 py-0.5 ${active ? 'bg-primary-soft' : ''}`}>
                  <Icon size={22} />
                </span>
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
