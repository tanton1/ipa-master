'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useAppState, useHydrated, learnedSlugs, dueSlugs, weakPhonemeIds, streakDays, rateWord, setRate, resetProgress, type Rating } from '@/lib/store';
import { WORDS, getWord, ROADMAP, wordsOfGroup } from '@/lib/curriculum';
import { getPhoneme } from '@/data/phonemes';
import { riskyPhonemes } from '@/lib/errors';
import { ProgressBar } from './ProgressBar';
import { PlayButton } from './PlayButton';
import { Recorder } from './Recorder';
import { IconFlame, IconRepeat, IconCheck, IconChevronRight, IconTarget } from './icons';

export function ReviewClient() {
  const s = useAppState();
  const hydrated = useHydrated();
  const learned = learnedSlugs(s).length;
  const due = useMemo(() => dueSlugs(s).map((slug) => getWord(slug)).filter(Boolean), [s]);
  const weak = weakPhonemeIds(s, 3);
  const streak = streakDays(s);

  // Phiên ôn tập
  const [session, setSession] = useState<string[] | null>(null);
  const [i, setI] = useState(0);
  const [reveal, setReveal] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [weakSel, setWeakSel] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<Rating[]>([]);
  const cur = session ? getWord(session[i] ?? '') : undefined;
  const sessionDone = session !== null && i >= session.length;

  function start() {
    setSession(due.map((w) => w!.slug));
    setI(0); setReveal(false); setRecorded(false); setWeakSel(new Set()); setResults([]);
  }
  function answer(r: Rating) {
    if (!cur) return;
    rateWord(cur.slug, r, r === 3 ? [] : Array.from(weakSel));
    setResults((x) => [...x, r]);
    setI((n) => n + 1); setReveal(false); setRecorded(false); setWeakSel(new Set());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (session && !sessionDone && cur) {
    const risky = riskyPhonemes(cur);
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>Ôn tập {i + 1}/{session.length}</span>
          <button type="button" onClick={() => setSession(null)} className="font-semibold text-primary">Thoát</button>
        </div>
        <ProgressBar value={i} max={session.length} label="Tiến độ phiên ôn" />
        <section className="card p-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Nhớ cách đọc không?</p>
          <h2 className="mt-1 text-4xl font-bold">{cur.word}</h2>
          <p className="mt-1 text-sm text-muted">{cur.meaning}</p>
          {reveal ? (
            <>
              <p className="ipa mt-3 text-2xl text-primary">/{cur.ipa}/</p>
              <div className="mt-3 flex items-start justify-center gap-8">
                <PlayButton text={cur.word} size="lg" variant="primary" label="Nghe" />
                <PlayButton text={cur.exampleEn} size="lg" variant="soft" label="Trong câu" />
              </div>
              <p className="mt-2 text-sm text-muted">{cur.exampleEn}</p>
            </>
          ) : (
            <button type="button" onClick={() => setReveal(true)} className="tap mt-4 rounded-2xl bg-primary px-6 py-3 font-semibold text-primary-ink">Nói rồi xem đáp án</button>
          )}
        </section>
        {reveal ? (
          <>
            <section className="card p-4">
              <h3 className="font-semibold">Ghi âm và so sánh</h3>
              <div className="mt-2"><Recorder modelText={cur.word} onRecorded={() => setRecorded(true)} compact /></div>
            </section>
            <section className="card p-4">
              <p className="text-sm font-medium">Âm nào chưa ổn?</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {risky.map((id) => {
                  const p = getPhoneme(id); const on = weakSel.has(id);
                  return p ? <li key={id}><button type="button" onClick={() => setWeakSel((x) => { const n = new Set(x); if (n.has(id)) n.delete(id); else n.add(id); return n; })} aria-pressed={on} className={`tap ipa rounded-xl border px-3 py-2 text-lg font-semibold ${on ? 'border-danger bg-danger-soft text-danger' : 'border-line bg-surface'}`}>/{p.symbol}/</button></li> : null;
                })}
              </ul>
              <p className="mt-4 text-sm font-medium">Bạn đọc từ này thế nào?{!recorded ? <span className="text-muted"> (nên ghi âm trước)</span> : null}</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <button type="button" onClick={() => answer(1)} className="tap rounded-xl border-2 border-danger bg-danger-soft py-3 text-sm font-semibold text-danger">Chưa ổn</button>
                <button type="button" onClick={() => answer(2)} className="tap rounded-xl border-2 border-warn bg-warn-soft py-3 text-sm font-semibold text-warn">Tạm được</button>
                <button type="button" onClick={() => answer(3)} className="tap rounded-xl border-2 border-accent bg-accent-soft py-3 text-sm font-semibold text-accent">Tốt</button>
              </div>
            </section>
            <Link href={`/words/${String(cur.group).padStart(2, '0')}/${cur.slug}`} className="text-center text-sm font-semibold text-primary">Mở bài học đầy đủ của từ này</Link>
          </>
        ) : null}
      </div>
    );
  }

  if (sessionDone && session) {
    const good = results.filter((r) => r === 3).length;
    const bad = results.filter((r) => r === 1).length;
    return (
      <div className="flex flex-col gap-4">
        <section className="card p-5 text-center">
          <p className="inline-flex items-center gap-2 text-lg font-bold text-accent"><IconCheck size={22} /> Xong phiên ôn tập</p>
          <p className="mt-2 text-3xl font-bold tabular-nums">{results.length} từ</p>
          <p className="mt-1 text-sm text-muted">{good} tốt • {results.length - good - bad} tạm được • {bad} cần luyện lại</p>
          <p className="mt-3 text-xs text-muted">Từ "chưa ổn" sẽ quay lại ngày mai; từ "tốt" được giãn khoảng cách ôn.</p>
          <button type="button" onClick={() => setSession(null)} className="tap mt-4 rounded-2xl bg-primary px-6 py-3 font-semibold text-primary-ink">Quay lại</button>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <section className="grid grid-cols-3 gap-2">
        <div className="card p-3 text-center"><p className="text-2xl font-bold tabular-nums">{hydrated ? learned : '–'}</p><p className="text-[11px] text-muted">Từ đã học</p></div>
        <div className="card p-3 text-center"><p className="inline-flex items-center gap-1 text-2xl font-bold tabular-nums text-warn"><IconFlame size={18} />{hydrated ? streak : '–'}</p><p className="text-[11px] text-muted">Ngày liên tiếp</p></div>
        <div className="card p-3 text-center"><p className="text-2xl font-bold tabular-nums text-primary">{hydrated ? due.length : '–'}</p><p className="text-[11px] text-muted">Đến hạn ôn</p></div>
      </section>

      <section className="card p-4">
        <h2 className="flex items-center gap-1.5 font-semibold"><IconRepeat size={18} className="text-primary" /> Ôn tập ngắt quãng</h2>
        <p className="mt-1 text-sm text-muted">
          {due.length ? `${due.length} từ đến hạn hôm nay. Từ nào bạn nghe nhầm hoặc phát âm chưa ổn sẽ được đưa trở lại sớm hơn.` : learned ? 'Hôm nay không có từ nào đến hạn. Học từ mới hoặc luyện bài Việt – Anh.' : 'Chưa có từ nào trong lịch ôn. Hãy học vài từ trước.'}
        </p>
        {due.length ? (
          <>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {due.slice(0, 12).map((w) => <li key={w!.slug} className="rounded-full bg-surface-2 px-2.5 py-1 text-xs">{w!.word}</li>)}
              {due.length > 12 ? <li className="rounded-full px-2 py-1 text-xs text-muted">+{due.length - 12}</li> : null}
            </ul>
            <button type="button" onClick={start} className="tap mt-4 w-full rounded-2xl bg-primary py-3 font-semibold text-primary-ink">Bắt đầu ôn ({due.length} từ)</button>
          </>
        ) : (
          <Link href="/words" className="tap mt-4 block w-full rounded-2xl border border-line bg-surface py-3 text-center text-sm font-semibold">Học từ mới</Link>
        )}
      </section>

      <section>
        <h2 className="mb-2 flex items-center gap-1.5 font-semibold"><IconTarget size={18} className="text-danger" /> Âm cần luyện thêm</h2>
        {weak.length ? (
          <ul className="flex flex-col gap-2">
            {weak.map((x) => {
              const p = getPhoneme(x.id);
              return p ? (
                <li key={x.id}>
                  <Link href={p.contrastId ? `/contrast/${p.contrastId}` : `/ipa/${p.id}`} className="card tap flex items-center gap-3 px-4 py-3">
                    <span className="ipa w-14 text-2xl font-semibold text-primary">/{p.symbol}/</span>
                    <span className="min-w-0 flex-1"><span className="block font-medium">{p.name}</span><span className="block text-xs text-muted">{x.count} lần đánh dấu chưa ổn • {p.contrastId ? 'mở bài đối chiếu' : 'xem khẩu hình'}</span></span>
                    <IconChevronRight size={18} className="text-muted" />
                  </Link>
                </li>
              ) : null;
            })}
          </ul>
        ) : (
          <p className="card p-4 text-sm text-muted">Khi ghi âm, hãy đánh dấu âm bạn thấy chưa ổn. Danh sách sẽ xuất hiện ở đây và trên trang chủ.</p>
        )}
      </section>

      <section>
        <h2 className="mb-2 font-semibold">Lộ trình 10 tuần</h2>
        <p className="mb-3 text-xs text-muted">Mỗi tuần 5 ngày học từ mới (10 từ/ngày), ngày thứ sáu ôn tập, ngày thứ bảy tự đánh giá. Đây là lộ trình nội dung đề xuất, không phải cam kết thành thạo sau 10 tuần.</p>
        <ol className="flex flex-col gap-2">
          {ROADMAP.map((st) => {
            const total = st.groups.reduce((n, g) => n + wordsOfGroup(g).length, 0);
            const got = st.groups.reduce((n, g) => n + wordsOfGroup(g).filter((w) => s.words[w.slug] && s.words[w.slug].status !== 'new').length, 0);
            return (
              <li key={st.weeks} className="card p-4">
                <div className="flex items-baseline justify-between">
                  <p className="font-semibold">{st.weeks} <span className="text-sm font-normal text-muted">• {st.words} từ • {st.pct}%</span></p>
                  <span className="text-xs tabular-nums text-muted">{hydrated ? got : '–'}/{total}</span>
                </div>
                <p className="mt-0.5 text-sm text-muted">{st.focus}</p>
                <ProgressBar value={got} max={total} className="mt-2 h-1.5" color="accent" label={st.weeks} />
              </li>
            );
          })}
        </ol>
      </section>

      <section className="card p-4">
        <h2 className="font-semibold">Cài đặt</h2>
        <label className="mt-3 block text-sm">
          <span className="flex justify-between"><span>Tốc độ giọng mẫu</span><span className="tabular-nums text-muted">{s.settings.rate.toFixed(2)}x</span></span>
          <input type="range" min={0.7} max={1.2} step={0.05} value={s.settings.rate} onChange={(e) => setRate(Number(e.target.value))} className="mt-2 w-full accent-[var(--c-primary)]" aria-label="Tốc độ giọng mẫu" />
        </label>
        <p className="mt-3 text-xs text-muted">Tiến độ và bản ghi tạm chỉ lưu trên thiết bị này. Bản ghi âm không được gửi lên máy chủ.</p>
        <button
          type="button"
          onClick={() => { if (window.confirm('Xoá toàn bộ tiến độ học trên thiết bị này? Không thể khôi phục.')) resetProgress(); }}
          className="tap mt-3 text-sm font-semibold text-danger"
        >
          Xoá tiến độ
        </button>
      </section>

      <p className="text-center text-[11px] text-muted">{WORDS.length} từ • 40 âm • 6 bài đối chiếu • 7 khác biệt hệ thống</p>
    </div>
  );
}
