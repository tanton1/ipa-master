'use client';

import Link from 'next/link';
import { GROUPS } from '@/data/groups';
import { useAppState, useHydrated, learnedSlugs } from '@/lib/store';
import { WORDS, wordsOfGroup } from '@/lib/curriculum';
import { tone } from '@/lib/tones';
import { ProgressBar } from './ProgressBar';
import { IconChevronRight } from './icons';

export function GroupsClient() {
  const s = useAppState();
  const hydrated = useHydrated();
  const learnedTotal = learnedSlugs(s).length;

  return (
    <div className="flex flex-col gap-4">
      <section className="card p-4">
        <div className="flex items-end justify-between">
          <p className="text-sm text-muted">Đã học</p>
          <p className="text-2xl font-bold tabular-nums">{hydrated ? learnedTotal : '–'}<span className="text-base font-medium text-muted">/{WORDS.length}</span></p>
        </div>
        <ProgressBar value={learnedTotal} max={WORDS.length} className="mt-2" label="Tổng tiến độ 500 từ" />
        <p className="mt-2 text-xs text-muted">Mỗi từ có phiên âm Anh-Mỹ, nghĩa, trọng âm, hướng dẫn tạo âm, lỗi dễ gặp và câu ứng dụng. Học theo thứ tự nhóm hoặc chọn chủ đề bạn cần.</p>
      </section>

      <ul className="flex flex-col gap-3">
        {GROUPS.map((g) => {
          const words = wordsOfGroup(g.id);
          const learned = words.filter((w) => s.words[w.slug] && s.words[w.slug].status !== 'new').length;
          const t = tone(g.tone);
          return (
            <li key={g.id}>
              <Link href={`/words/${g.slug}`} className="card tap flex items-center gap-3 p-4">
                <span className={`flex size-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold ${t.soft} ${t.text}`}>{g.slug}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{g.title}</span>
                  <span className="block truncate text-xs text-muted">{g.examples.join(', ')}</span>
                  <span className="mt-2 flex items-center gap-2">
                    <ProgressBar value={learned} max={words.length} className="h-1.5" label={`Tiến độ ${g.title}`} />
                    <span className="shrink-0 text-[11px] tabular-nums text-muted">{hydrated ? learned : '–'}/{words.length}</span>
                  </span>
                </span>
                <IconChevronRight size={18} className="shrink-0 text-muted" />
              </Link>
            </li>
          );
        })}
      </ul>

      <p className="text-xs leading-relaxed text-muted">
        Bộ 500 từ được tuyển chọn theo mục đích sư phạm, chưa phải 500 từ tần suất cao nhất theo bảng xếp hạng chính thức. Phiên âm cần giáo viên ngữ âm đối soát với Cambridge hoặc Oxford trước khi phát hành.
      </p>
    </div>
  );
}
