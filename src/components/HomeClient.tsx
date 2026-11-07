'use client';

import { IpaText } from './IpaText';
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
  { href: '/ipa', title: 'Bảng IPA', desc: 'Âm theo nhóm và khẩu hình', icon: IconGrid, cls: 'bg-primary-soft text-primary' },
  { href: '/contrast', title: 'Việt – Anh', desc: 'Vì sao đọc sai, sửa thế nào', icon: IconCompare, cls: 'bg-danger-soft text-danger' },
  { href: '/errors', title: 'Chữa lỗi E01–E10', desc: 'Bài sửa theo nhóm lỗi', icon: IconWrench, cls: 'bg-warn-soft text-warn' },
  { href: '/diagnostic', title: 'Kiểm tra đầu vào', desc: '5–8 phút, tìm điểm yếu', icon: IconClipboard, cls: 'bg-accent-soft text-accent' },
];

function ActionCard({ a }: { a: PlanAction }) {
  let href = '/';
  let title = '';
  let desc = '';
  let tone = 'bg-primary-soft text-primary';
  let Icon = IconArrowRight;
  if (a.type === 'diagnostic') { href = '/diagnostic'; title = 'Làm bài kiểm tra đầu vào'; desc = 'Xây hồ sơ âm ban đầu để lộ trình ưu tiên đúng lỗi của bạn.'; Icon = IconClipboard; tone = 'bg-accent-soft text-accent'; }
  if (a.type === 'retest') { const e = getVei(a.code); href = `/errors/${a.code}?retest=${a.which}`; title = `Kiểm tra lại ${a.code}: ${e?.title}`; desc = a.which === 'd1' ? 'Đã đến hạn kiểm tra sau 1 ngày.' : 'Đã đến hạn kiểm tra sau 3 ngày.'; Icon = IconRepeat; tone = 'bg-warn-soft text-warn'; }
  if (a.type === 'error-lesson') { const e = getVei(a.code); href = `/errors/${a.code}`; title = `Chữa lỗi ${a.code}: ${e?.title}`; desc = a.reason; Icon = IconWrench; tone = 'bg-danger-soft text-danger'; }
  if (a.type === 'review') { href = '/review'; title = `Ôn ${a.count} từ đến hạn`; desc = 'Từ cần luyện lại được đưa lên trước.'; Icon = IconRepeat; }
  if (a.type === 'learn') { const w = WORDS.find((x) => x.slug === a.slug); href = w ? `/words/${String(w.group).padStart(2, '0')}/${w.slug}` : '/words'; title = `Học từ mới: ${a.word}`; desc = a.remaining > 0 ? `Còn ${a.remaining} từ để xong bài hôm nay.` : 'Đã đủ 10 từ hôm nay; có thể học trước.'; Icon = IconBook; }
  return (
    <li>
      <Link href={href} className="card tap flex items-center gap-3 px-4 py-3.5">
        <span className={`inline-flex size-11 shrink-0 items-center justify-center rounded-2xl ${tone}`}><Icon size={20} /></span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold leading-snug"><IpaText text={title} /></span>
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
      <header className="mb-5 flex items-start justify-between gap-3 pt-2">
        <div>
          <p className="eyebrow text-primary">IPA Master • Phát âm thực chiến</p>
          <h1 className="mt-2 text-[34px] font-extrabold leading-[1.08] tracking-tight">Hôm nay<br />học gì?</h1>
          <p className="mt-2 text-sm text-muted">
            {hydrated ? `Tuần ${week} • Ngày ${day}` : 'Đang tải tiến độ…'}
            {hydrated && learned > 0 ? ` • ${learned}/${WORDS.length} từ` : ''}
          </p>
        </div>
        <div className="sticker mt-2 flex shrink-0 flex-col items-center rounded-2xl bg-warn-soft px-3 py-2 text-ink" title="Chuỗi ngày học liên tiếp">
          <span className="flex items-center gap-1 font-display text-xl font-extrabold tabular-nums"><IconFlame size={18} className="text-primary" />{hydrated ? streak : '–'}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider">ngày liền</span>
        </div>
      </header>

      {hydrated && !s.profile.onboarded ? (
        <Link href="/onboarding" className="tap mb-4 block rounded-3xl border border-primary/25 bg-primary-soft p-5">
          <p className="eyebrow text-primary">Bắt đầu</p>
          <p className="mt-1 font-display text-lg font-extrabold text-ink">Thiết lập lộ trình của bạn</p>
          <p className="mt-0.5 text-sm text-muted">Chọn mục tiêu, vùng miền và kiểu phiên âm. Mất khoảng 1 phút.</p>
        </Link>
      ) : null}

      <section className="card p-5" aria-labelledby="today-title">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 id="today-title" className="eyebrow whitespace-nowrap text-muted">Tiến độ hôm nay</h2>
            <p className="mt-1 font-display text-4xl font-extrabold tabular-nums">{hydrated ? doneToday : '–'}<span className="text-base font-medium text-muted">/{WORDS_PER_DAY} từ</span></p>
          </div>
          <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-bold text-accent">{hydrated ? Math.round((doneToday / WORDS_PER_DAY) * 100) : 0}%</span>
        </div>
        <ProgressBar value={doneToday} max={WORDS_PER_DAY} color="accent" className="mt-3" label="Tiến độ bài học hôm nay" />
        {unit ? (
          <p className="mt-3 text-xs text-muted">
            <span className="font-semibold text-ink">{unit.title}</span> • {WEEKDAY_ACTIVITY[day - 1]}
          </p>
        ) : null}
        {learnAction && learnAction.type === 'learn' ? (
          <Link
            href={(() => { const w = WORDS.find((x) => x.slug === learnAction.slug); return w ? `/words/${String(w.group).padStart(2, '0')}/${w.slug}` : '/words'; })()}
            className="tap mt-5 flex items-center justify-between gap-3 rounded-2xl bg-ink py-3 pl-5 pr-3 text-bg"
          >
            <span>
              <span className="block text-xs font-medium opacity-75">{doneToday < WORDS_PER_DAY ? 'Tiếp tục bài học' : 'Học trước bài tiếp theo'}</span>
              <span className="font-display text-xl font-extrabold">{learnAction.word}</span>
            </span>
            <span className="inline-flex size-11 items-center justify-center rounded-full bg-primary text-primary-ink"><IconArrowRight size={22} /></span>
          </Link>
        ) : null}
      </section>

      {others.length ? (
        <section className="mt-7" aria-labelledby="plan-title">
          <p className="eyebrow text-primary">Việc cần làm</p>
          <h2 id="plan-title" className="mb-3 mt-1 text-xl font-extrabold">Kế hoạch được đề xuất</h2>
          <ul className="flex flex-col gap-2">
            {others.slice(0, 4).map((a, i) => <ActionCard key={i} a={a} />)}
          </ul>
        </section>
      ) : null}

      <section className="mt-7" aria-labelledby="modules-title">
        <p className="eyebrow text-primary">Khám phá</p>
        <h2 id="modules-title" className="mb-3 mt-1 text-xl font-extrabold">Học theo chủ đề</h2>
        <ul className="grid grid-cols-2 gap-3">
          {MODULES.map((m) => {
            const Icon = m.icon;
            return (
              <li key={m.href}>
                <Link href={m.href} className="card tap flex h-full flex-col gap-3 p-4">
                  <span className={`inline-flex size-11 items-center justify-center rounded-2xl ${m.cls}`}><Icon size={20} /></span>
                  <span>
                    <span className="block font-display font-bold">{m.title}</span>
                    <span className="block text-xs text-muted">{m.desc}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-7" aria-labelledby="weak-title">
        <p className="eyebrow text-primary">Điểm yếu của bạn</p>
        <div className="mb-3 mt-1 flex items-baseline justify-between gap-3">
          <h2 id="weak-title" className="text-xl font-extrabold">Âm cần luyện thêm</h2>
          <Link href="/me" className="shrink-0 text-sm font-semibold text-primary underline decoration-primary/30 underline-offset-4">Bản đồ âm</Link>
        </div>
        {weak.length ? (
          <ul className="flex flex-col gap-2">
            {weak.map((x) => {
              const p = getPhoneme(x.id);
              if (!p) return null;
              const tag = x.score < 55 ? ['Ưu tiên cao', 'bg-danger-soft text-danger'] : x.score < 75 ? ['Đang luyện', 'bg-warn-soft text-warn'] : ['Cần ôn', 'bg-primary-soft text-primary'];
              return (
                <li key={x.id}>
                  <Link href={p.contrastId ? `/contrast/${p.contrastId}` : `/ipa/${p.id}`} className="card tap flex items-center gap-3 px-4 py-3">
                    <span className="ipa w-14 shrink-0 text-2xl font-semibold text-primary">/{p.symbol}/</span>
                    <span className="min-w-0 flex-1">
                      <span className={`mb-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${tag[1]}`}>{tag[0]}</span>
                      <span className="block text-sm font-semibold leading-snug">{p.name}</span>
                      <span className="mt-0.5 block text-xs text-muted">như trong <span className="font-medium text-ink">{p.examples[0]}</span> • {x.score}/100 sau {x.n} lượt</span>
                    </span>
                    <IconChevronRight size={18} className="shrink-0 text-muted" />
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

      <p className="mt-8 text-center text-xs leading-relaxed text-muted">
        Chuẩn dạy: Anh-Mỹ phổ thông. Nội dung đang ở trạng thái nháp, chưa qua kiểm duyệt ngữ âm. Giọng mẫu là giọng tổng hợp của trình duyệt.
      </p>
    </main>
  );
}
