'use client';

import Link from 'next/link';
import { useAppState, useHydrated, learnedSlugs, weakPhonemeIds, streakDays, todayKey } from '@/lib/store';
import { lessonIndexFor, weekDay, WORDS, WORDS_PER_DAY } from '@/lib/curriculum';
import { planToday, type PlanAction } from '@/lib/planner';
import { getPhoneme } from '@/data/phonemes';
import { getVei } from '@/data/vei';
import { getUnit, WEEKDAY_ACTIVITY } from '@/data/units';
import { ProgressBar } from './ProgressBar';
import { IconGrid, IconCompare, IconWrench, IconClipboard, IconFlame, IconArrowRight, IconRepeat, IconChevronRight, IconBook } from './icons';

const MODULES = [
  { href: '/ipa', title: 'Bảng IPA', desc: 'Âm theo nhóm và khẩu hình', icon: IconGrid, cls: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' },
  { href: '/contrast', title: 'Việt – Anh', desc: 'Vì sao đọc sai, sửa thế nào', icon: IconCompare, cls: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' },
  { href: '/errors', title: 'Chữa lỗi E01–E10', desc: 'Bài sửa theo nhóm lỗi', icon: IconWrench, cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  { href: '/diagnostic', title: 'Kiểm tra đầu vào', desc: '5–8 phút, tìm điểm yếu', icon: IconClipboard, cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
];

function ActionCard({ a }: { a: PlanAction }) {
  let href = '/';
  let title = '';
  let desc = '';
  let tone = 'bg-primary-soft text-primary';
  let Icon = IconArrowRight;
  if (a.type === 'diagnostic') { href = '/diagnostic'; title = 'Làm bài kiểm tra đầu vào'; desc = 'Xây hồ sơ âm ban đầu để lộ trình ưu tiên đúng lỗi của bạn.'; Icon = IconClipboard; tone = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'; }
  if (a.type === 'retest') { const e = getVei(a.code); href = `/errors/${a.code}?retest=${a.which}`; title = `Kiểm tra lại ${a.code}: ${e?.title}`; desc = a.which === 'd1' ? 'Đã đến hạn kiểm tra sau 1 ngày.' : 'Đã đến hạn kiểm tra sau 3 ngày.'; Icon = IconRepeat; tone = 'bg-warn-soft text-warn'; }
  if (a.type === 'error-lesson') { const e = getVei(a.code); href = `/errors/${a.code}`; title = `Chữa lỗi ${a.code}: ${e?.title}`; desc = a.reason; Icon = IconWrench; tone = 'bg-danger-soft text-danger'; }
  if (a.type === 'review') { href = '/review'; title = `Ôn ${a.count} từ đến hạn`; desc = 'Từ cần luyện lại được đưa lên trước.'; Icon = IconRepeat; }
  if (a.type === 'learn') { const w = WORDS.find((x) => x.slug === a.slug); href = w ? `/words/${String(w.group).padStart(2, '0')}/${w.slug}` : '/words'; title = `Học từ mới: ${a.word}`; desc = a.remaining > 0 ? `Còn ${a.remaining} từ để xong bài hôm nay.` : 'Đã đủ 10 từ hôm nay; có thể học trước.'; Icon = IconBook; }
  return (
    <li>
      <Link href={href} className="card tap flex items-center gap-3 px-4 py-3">
        <span className={`inline-flex size-10 shrink-0 items-center justify-center rounded-xl ${tone}`}><Icon size={20} /></span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold leading-snug">{title}</span>
          <span className="block text-xs text-muted">{desc}</span>
        </span>
        <IconChevronRight size={18} className="shrink-0 text-muted" />
      </Link>
    </li>
  );
}

export function HomeClient() {
  const hydrated = useHydrated();
  const s = useAppState();
  const learned = learnedSlugs(s).length;
  const idx = lessonIndexFor(learned);
  const { week, day } = weekDay(idx);
  const unit = getUnit(`G${String(week).padStart(2, '0')}-U${day}`);
  const doneToday = Math.min(WORDS_PER_DAY, s.log[todayKey()]?.learned ?? 0);
  const streak = streakDays(s);
  const weak = weakPhonemeIds(s, 3);
  const plan = hydrated ? planToday(s) : [];
  const learnAction = plan.find((a) => a.type === 'learn');
  const others = plan.filter((a) => a.type !== 'learn');

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

      {hydrated && !s.profile.onboarded ? (
        <Link href="/onboarding" className="tap mb-4 block rounded-2xl border border-primary/30 bg-primary-soft p-4">
          <p className="font-semibold text-primary">Thiết lập lộ trình của bạn</p>
          <p className="mt-0.5 text-sm text-muted">Chọn mục tiêu, vùng miền và kiểu phiên âm. Mất khoảng 1 phút.</p>
        </Link>
      ) : null}

      <section className="card p-4" aria-labelledby="today-title">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 id="today-title" className="text-sm font-medium text-muted">Tiến độ hôm nay</h2>
            <p className="text-2xl font-bold tabular-nums">{hydrated ? doneToday : '–'}<span className="text-base font-medium text-muted">/{WORDS_PER_DAY} từ</span></p>
          </div>
          {unit ? (
            <p className="max-w-[13rem] text-right text-xs text-muted">
              <span className="block font-semibold text-ink">{unit.title}</span>
              {WEEKDAY_ACTIVITY[day - 1]}
            </p>
          ) : null}
        </div>
        <ProgressBar value={doneToday} max={WORDS_PER_DAY} color="accent" className="mt-3" label="Tiến độ bài học hôm nay" />
        {learnAction && learnAction.type === 'learn' ? (
          <Link
            href={(() => { const w = WORDS.find((x) => x.slug === learnAction.slug); return w ? `/words/${String(w.group).padStart(2, '0')}/${w.slug}` : '/words'; })()}
            className="tap mt-4 flex items-center justify-between rounded-2xl bg-primary px-4 py-3 text-primary-ink"
          >
            <span>
              <span className="block text-xs opacity-80">{doneToday < WORDS_PER_DAY ? 'Tiếp tục bài học' : 'Học trước bài tiếp theo'}</span>
              <span className="text-lg font-semibold">{learnAction.word}</span>
            </span>
            <IconArrowRight size={22} />
          </Link>
        ) : null}
      </section>

      {others.length ? (
        <section className="mt-5" aria-labelledby="plan-title">
          <h2 id="plan-title" className="mb-2 font-semibold">Kế hoạch được đề xuất</h2>
          <ul className="flex flex-col gap-2">
            {others.slice(0, 4).map((a, i) => <ActionCard key={i} a={a} />)}
          </ul>
        </section>
      ) : null}

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
          <h2 id="weak-title" className="font-semibold">Âm cần luyện thêm</h2>
          <Link href="/me" className="text-xs font-medium text-primary">Bản đồ âm</Link>
        </div>
        {weak.length ? (
          <ul className="flex flex-col gap-2">
            {weak.map((x, i) => {
              const p = getPhoneme(x.id);
              if (!p) return null;
              const tag = i === 0 ? ['Ưu tiên cao', 'bg-danger-soft text-danger'] : i === 1 ? ['Đang luyện', 'bg-warn-soft text-warn'] : ['Cần ôn', 'bg-primary-soft text-primary'];
              return (
                <li key={x.id}>
                  <Link href={p.contrastId ? `/contrast/${p.contrastId}` : `/ipa/${p.id}`} className="card tap flex items-center gap-3 px-4 py-3">
                    <span className="ipa w-14 text-2xl font-semibold text-primary">/{p.symbol}/</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{p.examples[0]}</span>
                      <span className="block truncate text-xs text-muted">{x.score}/100 • {x.n} lượt</span>
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${tag[1]}`}>{tag[0]}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="card p-4 text-sm text-muted">
            {hydrated ? 'Chưa có đủ dữ liệu. Làm bài kiểm tra đầu vào hoặc luyện vài từ, danh sách sẽ tự cập nhật từ kết quả nghe và tự đánh giá của bạn.' : 'Đang tải…'}
          </p>
        )}
      </section>

      <p className="mt-6 text-center text-[11px] leading-relaxed text-muted">
        Chuẩn dạy: Anh-Mỹ phổ thông. Nội dung đang ở trạng thái nháp, chưa qua kiểm duyệt ngữ âm. Giọng mẫu là giọng tổng hợp của trình duyệt.
      </p>
    </main>
  );
}
