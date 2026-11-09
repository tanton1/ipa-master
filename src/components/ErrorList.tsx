'use client';

import { IpaText } from './IpaText';
import Link from 'next/link';
import { VEI } from '@/data/vei';
import { WORDS } from '@/lib/curriculum';
import { useAppState, errorScore, evidenceOf, useHydrated } from '@/lib/store';
import { EvidencePill } from './EvidencePill';
import { IconChevronRight } from './icons';

export function ErrorList() {
  const s = useAppState();
  const hydrated = useHydrated();
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed text-muted">
        Mười nhóm lỗi phổ biến của người Việt, dựa trên các dạng lỗi được ghi nhận trong nghiên cứu: bỏ âm cuối, sai cụm phụ âm, thay thế âm và sai nguyên âm. Số từ "có nguy cơ" là dự đoán theo cấu trúc từ, không phải lỗi đã quan sát ở bạn. Nhãn bên phải mới là kết quả thật: chưa kiểm tra, đang đánh giá, hoặc đã có bằng chứng.
      </p>
      <ul className="flex flex-col gap-2">
        {VEI.map((e) => {
          const count = WORDS.filter((w) => w.errorCodes.includes(e.code)).length;
          const sc = hydrated ? errorScore(s.errorStats[e.code]) : null;
          const retest = s.retests[e.code];
          return (
            <li key={e.code}>
              <Link href={`/errors/${e.code}`} className="card tap flex items-center gap-3 px-4 py-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-sm font-bold text-primary">{e.code}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold"><IpaText text={e.title} /></span>
                  <span className="block truncate text-xs text-muted">{e.examples.join(', ')} • {count} từ {e.code === 'E10' ? 'để luyện' : 'có nguy cơ'}</span>
                  {retest ? <span className="mt-0.5 block text-[11px] text-warn">Đang theo dõi duy trì: {retest.results.d3 ? 'đã xong' : retest.results.d1 ? 'chờ ngày 3' : 'chờ ngày 1'}</span> : null}
                </span>
                {hydrated ? <EvidencePill level={evidenceOf(sc)} detail={sc ? String(sc.score) : undefined} /> : null}
                <IconChevronRight size={18} className="shrink-0 text-muted" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
