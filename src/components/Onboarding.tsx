'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAppState, updateProfile, type Profile } from '@/lib/store';
import { IconCheck } from './icons';

type Opt<T> = { v: T; label: string; desc: string };

const GOALS: Opt<NonNullable<Profile['goal']>>[] = [
  { v: 'giao-tiep', label: 'Giao tiếp', desc: 'Nói dễ hiểu, nghe phân biệt tốt' },
  { v: 'mat-goc', label: 'Mất gốc phát âm', desc: 'Học lại từ âm cơ bản' },
  { v: 'thi-cu', label: 'Thi cử', desc: 'IELTS, TOEIC, phần nói' },
  { v: 'cong-viec', label: 'Công việc', desc: 'Họp, thuyết trình, gọi điện' },
];
const LEVELS: Opt<NonNullable<Profile['level']>>[] = [
  { v: 'moi', label: 'Mới bắt đầu', desc: 'Chưa quen IPA' },
  { v: 'co-ban', label: 'Cơ bản', desc: 'Biết từ nhưng ngại nói' },
  { v: 'kha', label: 'Khá', desc: 'Muốn sửa lỗi cụ thể' },
];
const REGIONS: Opt<NonNullable<Profile['region']>>[] = [
  { v: 'bac', label: 'Miền Bắc', desc: 'Hay gặp: r → /z/, lẫn l/n, /ʃ/ → /s/' },
  { v: 'trung', label: 'Miền Trung', desc: 'Thanh điệu ảnh hưởng ngữ điệu' },
  { v: 'nam', label: 'Miền Nam', desc: 'Hay gặp: v → /j/, /n/ cuối → /ŋ/' },
  { v: 'khac', label: 'Khác / không chắc', desc: 'Dùng lộ trình chung' },
];

function Choice<T extends string>({ title, opts, value, onChange }: { title: string; opts: Opt<T>[]; value?: T; onChange: (v: T) => void }) {
  return (
    <fieldset>
      <legend className="mb-2 font-semibold">{title}</legend>
      <div className="grid grid-cols-1 gap-2">
        {opts.map((o) => (
          <label key={o.v} className={`tap flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-3 ${value === o.v ? 'border-primary bg-primary-soft' : 'border-line bg-surface'}`}>
            <input type="radio" className="sr-only" checked={value === o.v} onChange={() => onChange(o.v)} />
            <span className="min-w-0 flex-1"><span className="block font-semibold">{o.label}</span><span className="block text-xs text-muted">{o.desc}</span></span>
            {value === o.v ? <IconCheck size={18} className="text-primary" /> : null}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function Onboarding() {
  const { profile } = useAppState();
  const [goal, setGoal] = useState(profile.goal);
  const [level, setLevel] = useState(profile.level);
  const [region, setRegion] = useState(profile.region);
  const [ipaStyle, setIpaStyle] = useState(profile.ipaStyle);
  const [saved, setSaved] = useState(false);

  if (saved) {
    return (
      <section className="card p-5 text-center">
        <p className="inline-flex items-center gap-2 text-lg font-bold text-accent"><IconCheck size={22} /> Đã lưu lộ trình</p>
        <p className="mt-2 text-sm text-muted">Bước tiếp theo: bài kiểm tra đầu vào 5–8 phút để biết bạn nghe tốt âm nào, dễ nhầm âm nào và nên luyện gì trước.</p>
        <div className="mt-4 flex flex-col gap-2">
          <Link href="/diagnostic" className="tap rounded-2xl bg-primary py-3 font-semibold text-primary-ink">Làm bài kiểm tra đầu vào</Link>
          <Link href="/" className="tap py-2 text-sm font-semibold text-primary">Để sau, về trang Hôm nay</Link>
        </div>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Choice title="Mục tiêu học" opts={GOALS} value={goal} onChange={setGoal} />
      <Choice title="Trình độ hiện tại" opts={LEVELS} value={level} onChange={setLevel} />
      <Choice title="Bạn nói tiếng Việt giọng vùng nào?" opts={REGIONS} value={region} onChange={setRegion} />
      <p className="-mt-4 text-xs text-muted">Vùng miền chỉ dùng để gợi ý lỗi có thể gặp; bài kiểm tra mới quyết định lộ trình.</p>
      <fieldset>
        <legend className="mb-2 font-semibold">Kiểu phiên âm</legend>
        <div className="grid grid-cols-2 gap-2">
          {([['phonemic', 'Âm vị Anh-Mỹ', '/ʃip/'], ['dictionary', 'Kiểu từ điển', '/ʃiːp/']] as const).map(([k, label, ex]) => (
            <label key={k} className={`tap cursor-pointer rounded-2xl border-2 p-3 ${ipaStyle === k ? 'border-primary bg-primary-soft' : 'border-line bg-surface'}`}>
              <input type="radio" className="sr-only" checked={ipaStyle === k} onChange={() => setIpaStyle(k)} />
              <span className="block font-semibold">{label}</span><span className="ipa block text-sm text-muted">{ex}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <p className="rounded-xl bg-surface-2 p-3 text-xs text-muted">Giọng chuẩn của lộ trình là Anh-Mỹ phổ thông. Mục tiêu là nói dễ hiểu và nghe phân biệt tốt, không phải xoá bỏ hoàn toàn giọng Việt.</p>
      <button
        type="button"
        disabled={!goal || !region}
        onClick={() => { updateProfile({ goal, level, region, ipaStyle, onboarded: true }); setSaved(true); window.scrollTo({ top: 0 }); }}
        className="tap rounded-2xl bg-primary py-3.5 font-semibold text-primary-ink disabled:opacity-50"
      >
        Lưu lộ trình
      </button>
    </div>
  );
}
