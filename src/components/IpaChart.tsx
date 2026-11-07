'use client';

import Link from 'next/link';
import { useState } from 'react';
import { getPhoneme } from '@/data/phonemes';
import type { Phoneme } from '@/data/types';
import { PRIORITY_LABEL } from '@/lib/tones';
import { useAppState } from '@/lib/store';
import { displayIpa } from './Ipa';
import { IconLayers, IconCompare, IconChevronRight } from './icons';

type Filter = 'all' | 'hard' | 'voiced';

const ids = (s: string) => s.split(' ').map((id) => getPhoneme(id)).filter((p): p is Phoneme => !!p);

const SECTIONS: { title: string; hint: string; items: Phoneme[]; kind: 'vowel' | 'consonant' }[] = [
  { kind: 'vowel', title: 'Nguyên âm trước', hint: 'Lưỡi đưa ra trước; độ mở hàm tăng dần từ /i/ đến /æ/', items: ids('i ih eh ae') },
  { kind: 'vowel', title: 'Nguyên âm giữa', hint: 'Lưỡi ở giữa, thả lỏng; /ə/ chỉ xuất hiện ở âm tiết không nhấn', items: ids('schwa ah') },
  { kind: 'vowel', title: 'Nguyên âm sau', hint: 'Lưỡi lùi về sau; /u/, /ʊ/, /ɔ/ có tròn môi', items: ids('u uh ao aa') },
  { kind: 'vowel', title: 'Nguyên âm đôi', hint: 'Lướt từ vị trí này sang vị trí khác', items: ids('ey ay oy aw ow') },
  { kind: 'vowel', title: 'Âm có tính chất r', hint: '/ɝ/ khi nhấn (bird), /ɚ/ khi không nhấn (teacher, water)', items: ids('er') },
  { kind: 'consonant', title: 'Âm tắc', hint: 'Chặn hơi rồi bật; phân biệt bật hơi, hữu thanh – vô thanh', items: ids('p b t d k g') },
  { kind: 'consonant', title: 'Âm xát', hint: 'Tạo khe hẹp, điều khiển luồng hơi liên tục', items: ids('f v th dh s z sh zh h') },
  { kind: 'consonant', title: 'Âm tắc-xát', hint: 'Chặn hơi rồi giải phóng thành âm xát', items: ids('ch jh') },
  { kind: 'consonant', title: 'Âm mũi', hint: 'Luồng hơi đi qua khoang mũi', items: ids('m n ng') },
  { kind: 'consonant', title: 'Âm bên và âm tiếp cận', hint: 'Vị trí và hình dạng lưỡi quyết định', items: ids('l r') },
  { kind: 'consonant', title: 'Bán nguyên âm', hint: 'Chuyển động môi và lưỡi khi ghép với nguyên âm', items: ids('w y') },
];

export function IpaChart() {
  const [filter, setFilter] = useState<Filter>('all');
  const style = useAppState().profile.ipaStyle;

  const keep = (p: Phoneme) =>
    filter === 'all' ? true : filter === 'hard' ? p.priority === 1 : p.type === 'consonant' && p.voiced === true;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-2">
        <Link href="/levels" className="card tap flex items-center gap-2 p-3">
          <IconLayers size={18} className="text-primary" />
          <span className="min-w-0 flex-1 text-sm font-semibold">6 cấp độ</span>
          <IconChevronRight size={16} className="text-muted" />
        </Link>
        <Link href="/contrast" className="card tap flex items-center gap-2 p-3">
          <IconCompare size={18} className="text-rose-600" />
          <span className="min-w-0 flex-1 text-sm font-semibold">Việt – Anh</span>
          <IconChevronRight size={16} className="text-muted" />
        </Link>
      </div>

      <div role="tablist" aria-label="Lọc âm" className="no-scrollbar flex gap-2 overflow-x-auto">
        {([
          ['all', 'Tất cả'],
          ['hard', 'Khó với người Việt'],
          ['voiced', 'Hữu thanh'],
        ] as [Filter, string][]).map(([k, label]) => (
          <button
            key={k}
            role="tab"
            aria-selected={filter === k}
            onClick={() => setFilter(k)}
            className={`tap shrink-0 rounded-full px-4 py-2 text-sm font-medium ${filter === k ? 'bg-primary text-primary-ink' : 'border border-line bg-surface text-ink'}`}
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

      {(['vowel', 'consonant'] as const).map((kind) => (
        <div key={kind} className="flex flex-col gap-5">
          <h2 className="border-b border-line pb-1 text-lg font-bold">{kind === 'vowel' ? 'Nguyên âm' : 'Phụ âm (24 âm, 6 nhóm)'}</h2>
          {SECTIONS.filter((s) => s.kind === kind).map((sec) => {
            const items = sec.items.filter(keep);
            if (!items.length) return null;
            return (
              <section key={sec.title} aria-labelledby={`sec-${sec.title}`}>
                <h3 id={`sec-${sec.title}`} className="font-semibold">{sec.title}</h3>
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
                        <span className="ipa text-2xl font-semibold leading-none">{displayIpa(p.symbol, style)}{p.alt ? <span className="text-base text-muted"> {p.alt}</span> : null}</span>
                        <span className="truncate text-[11px] text-muted">{p.examples[0]}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      ))}

      <div className="card p-4 text-xs leading-relaxed text-muted">
        <p className="font-semibold text-ink">Về số lượng âm</p>
        <p className="mt-1">
          Không có một con số âm vị duy nhất cho mọi giọng tiếng Anh; cách đếm "44 âm" phụ thuộc phương ngữ và phương pháp phân tích. IPA Master dùng một hệ ký hiệu nội bộ nhất quán cho Anh-Mỹ phổ thông. Ví dụ sheep được ghi /ʃip/ trong hệ này và /ʃiːp/ trong Cambridge: đó là cùng một nguyên âm. Bạn chọn kiểu hiển thị trong mục Cá nhân. Âm vỗ /ɾ/ (water) là biến thể của /t/ nên không liệt kê riêng.
        </p>
      </div>
    </div>
  );
}
