'use client';

import Link from 'next/link';
import { VEI } from '@/data/vei';
import { WORDS } from '@/lib/curriculum';
import { useAppState, errorScore, useHydrated } from '@/lib/store';
import { IconChevronRight } from './icons';

export function ErrorList() {
  const s = useAppState();
  const hydrated = useHydrated();
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed text-muted">
        Mười nhóm lỗi phổ biến của người Việt, dựa trên các dạng lỗi được ghi nhận trong nghiên cứu: bỏ âm cuối, sai cụm phụ âm, thay thế âm và sai nguyên âm. Đây là giả thuyết học tập; không phải ai cũng mắc mọi lỗi. Kết quả của bạn sẽ hiện bên phải sau khi luyện.
      </p>
      <ul className="flex flex-col gap-2">
        {VEI.map((e) => {
          const count = WORDS.filter((w) => w.errorCodes.includes(e.code)).length;
          const sc = hydrated ? errorScore(s.errorStats[e.code]) : null;
          const retest = s.retests[e.code];
          return (
            <li key={e.code}>
              <Link href={`/errors/${e.code}`} className="card tap flex items-center gap-3 px-4 py-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-sm font-bold text-primary">{e.code}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{e.title}</span>
                  <span className="block truncate text-xs text-muted">{e.examples.join(', ')} • {count} từ trong 500 từ</span>
                  {retest ? <span className="mt-0.5 block text-[11px] text-warn">Đang theo dõi duy trì: {retest.results.d3 ? 'đã xong' : retest.results.d1 ? 'chờ ngày 3' : 'chờ ngày 1'}</span> : null}
                </span>
                {sc ? (
                  <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold tabular-nums ${sc.score >= 75 ? 'bg-accent-soft text-accent' : sc.score >= 55 ? 'bg-warn-soft text-warn' : 'bg-danger-soft text-danger'}`}>{sc.score}</span>
                ) : null}
                <IconChevronRight size={18} className="shrink-0 text-muted" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
