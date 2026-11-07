'use client';

import { IpaText } from './IpaText';
import Link from 'next/link';
import { useState } from 'react';
import { useAppState, useHydrated, dueSlugs, needsPracticeSlugs, dueRetests, todayKey } from '@/lib/store';
import { priorityCodes } from '@/lib/planner';
import { getVei } from '@/data/vei';
import { CONTRAST_LESSONS } from '@/data/contrast';
import { GOLD } from '@/data/gold';
import { getWord } from '@/lib/curriculum';
import { formatDay } from '@/lib/format-day';
import { Recorder } from './Recorder';
import { IconRepeat, IconWrench, IconClipboard, IconChevronRight, IconStar } from './icons';

const FREE_TEXTS = ['I think this is better.', 'Tell me about your day.', 'Where are you from?', 'Turn right at the light.', 'Have a nice day.'];

export function PracticeHub() {
  const s = useAppState();
  const hydrated = useHydrated();
  const due = dueSlugs(s).length;
  const needs = needsPracticeSlugs(s).length;
  const retests = dueRetests(s);
  const codes = hydrated ? priorityCodes(s) : [];
  const [free, setFree] = useState(FREE_TEXTS[0]);

  return (
    <div className="flex flex-col gap-5">
      <section className="grid grid-cols-3 gap-2">
        <Link href="/review" className="card tap p-3 text-center"><p className="text-2xl font-bold tabular-nums text-primary">{hydrated ? due : '–'}</p><p className="text-[11px] text-muted">Đến hạn ôn</p></Link>
        <Link href="/review" className="card tap p-3 text-center"><p className="text-2xl font-bold tabular-nums text-danger">{hydrated ? needs : '–'}</p><p className="text-[11px] text-muted">Cần luyện lại</p></Link>
        <Link href="/errors" className="card tap p-3 text-center"><p className="text-2xl font-bold tabular-nums text-warn">{hydrated ? retests.length : '–'}</p><p className="text-[11px] text-muted">Kiểm tra lại</p></Link>
      </section>

      <Link href="/review" className="card tap flex items-center gap-3 px-4 py-3">
        <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary"><IconRepeat size={20} /></span>
        <span className="min-w-0 flex-1"><span className="block font-semibold">Trung tâm ôn tập</span><span className="block text-xs text-muted">Nói từ, nghe A/B, tự chấm, giãn lịch ôn</span></span>
        <IconChevronRight size={18} className="text-muted" />
      </Link>

      {codes.length || retests.length ? (
        <section>
          <h2 className="mb-2 font-semibold">Bài chữa lỗi cá nhân</h2>
          <ul className="flex flex-col gap-2">
            {retests.map((r) => (
              <li key={r.code + r.which}>
                <Link href={`/errors/${r.code}?retest=${r.which}`} className="card tap flex items-center gap-3 px-4 py-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-warn-soft text-xs font-bold text-warn">{r.code}</span>
                  <span className="min-w-0 flex-1"><span className="block font-semibold">Kiểm tra lại {r.which === 'd1' ? 'ngày 1' : 'ngày 3'}</span><span className="block text-xs text-muted">{getVei(r.code)?.title}</span></span>
                  <IconChevronRight size={18} className="text-muted" />
                </Link>
              </li>
            ))}
            {codes.map((c) => (
              <li key={c.code}>
                <Link href={`/errors/${c.code}`} className="card tap flex items-center gap-3 px-4 py-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-danger-soft text-xs font-bold text-danger">{c.code}</span>
                  <span className="min-w-0 flex-1"><span className="block font-semibold"><IpaText text={getVei(c.code)?.title ?? c.code} /></span><span className="block text-xs text-muted">{c.reason}</span></span>
                  <IconChevronRight size={18} className="text-muted" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="grid grid-cols-2 gap-2">
        <Link href="/errors" className="card tap flex flex-col gap-2 p-4">
          <IconWrench size={20} className="text-warn" />
          <span className="font-semibold">Thư viện lỗi</span>
          <span className="text-xs text-muted">E01–E10 và quy trình sửa 6 bước</span>
        </Link>
        <Link href="/diagnostic" className="card tap flex flex-col gap-2 p-4">
          <IconClipboard size={20} className="text-accent" />
          <span className="font-semibold">Kiểm tra đầu vào</span>
          <span className="text-xs text-muted">{s.profile.diagnosticAt ? `Lần gần nhất: ${formatDay(s.profile.diagnosticAt, todayKey())}` : 'Chưa làm'}</span>
        </Link>
      </section>

      <section className="card p-4">
        <h2 className="font-semibold">Phòng luyện nói</h2>
        <p className="mt-1 text-xs text-muted">Chọn một câu, nghe mẫu, ghi âm, kiểm tra chất lượng bản ghi và nghe A/B.</p>
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          {FREE_TEXTS.map((t) => (
            <button key={t} type="button" onClick={() => setFree(t)} aria-pressed={free === t} className={`tap shrink-0 rounded-full border px-3 py-1.5 text-sm ${free === t ? 'border-primary bg-primary-soft text-primary' : 'border-line bg-surface'}`}>{t}</button>
          ))}
        </div>
        <p className="mt-3 text-center text-xl font-semibold">{free}</p>
        <div className="mt-2"><Recorder key={free} modelText={free} /></div>
      </section>

      <section>
        <h2 className="mb-2 font-semibold">Bài đối chiếu Việt – Anh</h2>
        <ul className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {CONTRAST_LESSONS.map((c) => (
            <li key={c.id} className="shrink-0">
              <Link href={`/contrast/${c.id}`} className="card tap flex w-36 flex-col gap-1 p-3">
                <span className="ipa text-xl font-semibold text-primary">{c.label}</span>
                <span className="truncate text-xs text-muted">{c.sample}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 flex items-center gap-1.5 font-semibold"><IconStar size={16} className="text-warn" /> 30 bài chuẩn</h2>
        <ul className="flex flex-wrap gap-1.5">
          {GOLD.map((g) => {
            const w = getWord(g.slug);
            if (!w) return null;
            const st = s.words[w.slug]?.status;
            return (
              <li key={g.slug}>
                <Link href={`/words/${String(w.group).padStart(2, '0')}/${w.slug}`} className={`tap inline-block rounded-full border px-3 py-1.5 text-sm ${st && st !== 'new' ? 'border-accent/50 bg-accent-soft' : 'border-line bg-surface'}`}>{w.word}</Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
