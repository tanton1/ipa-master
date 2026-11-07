'use client';

import Link from 'next/link';
import { useAppState, useHydrated, learnedSlugs, dueSlugs, weakPhonemeIds, streakDays, todayKey } from '@/lib/store';
import { lessonIndexFor, lessonWords, weekDay, WORDS, WORDS_PER_DAY, wordsWithPhoneme } from '@/lib/curriculum';
import { getPhoneme } from '@/data/phonemes';
import { ProgressBar } from './ProgressBar';
import { IconGrid, IconCompare, IconBook, IconMic, IconFlame, IconArrowRight, IconRepeat, IconChevronRight } from './icons';

const MODULES = [
  { href: '/ipa', title: 'Bảng IPA', desc: 'Nghe và khám phá các âm', icon: IconGrid, cls: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' },
  { href: '/contrast', title: 'Việt – Anh', desc: 'Đối chiếu khẩu hình', icon: IconCompare, cls: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' },
  { href: '/words', title: '500 từ', desc: 'Học theo chủ đề', icon: IconBook, cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  { href: '/review', title: 'Ghi âm & ôn', desc: 'Tự so sánh với mẫu', icon: IconMic, cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
];

const DEFAULT_WEAK = [
  { id: 'th', tag: 'Ưu tiên cao', cls: 'bg-danger-soft text-danger' },
  { id: 'ih', tag: 'Đang cải thiện', cls: 'bg-warn-soft text-warn' },
  { id: 'z', tag: 'Cần ôn', cls: 'bg-primary-soft text-primary' },
];

export function HomeClient() {
  const hydrated = useHydrated();
  const s = useAppState();
  const learned = learnedSlugs(s).length;
  const idx = lessonIndexFor(learned);
  const { week, day } = weekDay(idx);
  const today = lessonWords(idx);
  const learnedToday = s.log[todayKey()]?.learned ?? 0;
  const doneToday = Math.min(WORDS_PER_DAY, learnedToday);
  const nextWord =
    today.find((w) => !s.words[w.slug] || s.words[w.slug].status === 'new') ??
    WORDS.find((w) => !s.words[w.slug] || s.words[w.slug].status === 'new') ??
    today[0];
  const due = dueSlugs(s).length;
  const streak = streakDays(s);
  const weak = weakPhonemeIds(s, 3);
  const remaining = Math.max(0, WORDS_PER_DAY - doneToday);

  const weakList = weak.length
    ? weak.map((x, i) => ({ id: x.id, tag: i === 0 ? 'Ưu tiên cao' : i === 1 ? 'Đang cải thiện' : 'Cần ôn', cls: DEFAULT_WEAK[i].cls, count: x.count }))
    : DEFAULT_WEAK.map((d) => ({ ...d, count: 0 }));

  return (
    <main className="px-4 pt-4">
      <header className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">IPA Master</p>
          <h1 className="mt-1 text-[28px] font-bold leading-tight">Hôm nay học gì?</h1>
          <p className="mt-1 text-sm text-muted">
            {hydrated ? `Tuần ${week} • Ngày ${day}` : 'Đang tải tiến độ…'}
            {hydrated && learned > 0 ? ` • ${learned}/${WORDS.length} từ` : ''}
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-warn-soft px-3 py-1.5 text-sm font-semibold text-warn" title="Chuỗi ngày học liên tiếp">
          <IconFlame size={16} />
          <span className="tabular-nums">{hydrated ? streak : '–'}</span>
        </div>
      </header>

      <section className="card p-4" aria-labelledby="today-title">
        <div className="flex items-end justify-between">
          <div>
            <h2 id="today-title" className="text-sm font-medium text-muted">Tiến độ hôm nay</h2>
            <p className="text-2xl font-bold tabular-nums">
              {hydrated ? doneToday : '–'}<span className="text-base font-medium text-muted">/{WORDS_PER_DAY} từ</span>
            </p>
          </div>
          <p className="max-w-[12rem] text-right text-xs text-muted">
            {remaining > 0 ? `Hoàn thành ${remaining} từ để kết thúc bài học.` : 'Bạn đã xong bài hôm nay. Tuyệt!'}
          </p>
        </div>
        <ProgressBar value={doneToday} max={WORDS_PER_DAY} color="accent" className="mt-3" label="Tiến độ bài học hôm nay" />
        {nextWord ? (
          <Link
            href={`/words/${String(nextWord.group).padStart(2, '0')}/${nextWord.slug}`}
            className="tap mt-4 flex items-center justify-between rounded-2xl bg-primary px-4 py-3 text-primary-ink"
          >
            <span>
              <span className="block text-xs opacity-80">{remaining > 0 ? 'Tiếp tục bài học' : 'Học trước bài tiếp theo'}</span>
              <span className="text-lg font-semibold">{nextWord.word} <span className="ipa text-sm font-normal opacity-90">/{nextWord.ipa}/</span></span>
            </span>
            <IconArrowRight size={22} />
          </Link>
        ) : null}
      </section>

      <section className="mt-5" aria-label="Các mô-đun">
        <ul className="grid grid-cols-2 gap-3">
          {MODULES.map((m) => {
            const Icon = m.icon;
            return (
              <li key={m.href}>
                <Link href={m.href} className="card tap flex h-full flex-col gap-3 p-4">
                  <span className={`inline-flex size-10 items-center justify-center rounded-xl ${m.cls}`}><Icon size={20} /></span>
                  <span>
                    <span className="block font-semibold">{m.title}</span>
                    <span className="block text-xs text-muted">{m.desc}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-6" aria-labelledby="weak-title">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 id="weak-title" className="font-semibold">Ba âm cần luyện thêm</h2>
          <Link href="/ipa" className="text-xs font-medium text-primary">Xem bảng IPA</Link>
        </div>
        <ul className="flex flex-col gap-2">
          {weakList.map((item) => {
            const p = getPhoneme(item.id);
            if (!p) return null;
            const ex = wordsWithPhoneme(item.id, 1)[0]?.word ?? p.examples[0];
            return (
              <li key={item.id}>
                <Link href={`/ipa/${item.id}`} className="card tap flex items-center gap-3 px-4 py-3">
                  <span className="ipa w-14 text-2xl font-semibold text-primary">/{p.symbol}/</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{ex}</span>
                    <span className="block truncate text-xs text-muted">{p.name}{item.count ? ` • ${item.count} lần đánh dấu chưa ổn` : ''}</span>
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${item.cls}`}>{item.tag}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        {!weak.length && hydrated ? <p className="mt-2 text-xs text-muted">Danh sách sẽ tự cập nhật theo các âm bạn đánh dấu "chưa ổn" khi ghi âm.</p> : null}
      </section>

      <section className="mt-6">
        <Link href="/review" className="card tap flex items-center gap-3 px-4 py-3">
          <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary"><IconRepeat size={20} /></span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold">Ôn tập ngắt quãng</span>
            <span className="block text-xs text-muted">{hydrated && due > 0 ? `${due} từ đến hạn ôn hôm nay` : 'Chưa có từ nào đến hạn'}</span>
          </span>
          <IconChevronRight size={18} className="text-muted" />
        </Link>
      </section>

      <p className="mt-6 text-center text-[11px] leading-relaxed text-muted">
        Chuẩn dạy: Anh-Mỹ phổ thông (General American). Giọng mẫu hiện là giọng tổng hợp của trình duyệt; audio người bản ngữ và video khẩu hình 3D sẽ bổ sung sau khi nội dung được giáo viên ngữ âm đối soát.
      </p>
    </main>
  );
}
