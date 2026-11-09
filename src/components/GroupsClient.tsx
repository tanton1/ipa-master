'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { GROUPS } from '@/data/groups';
import { STAGES } from '@/data/stages';
import { VEI } from '@/data/vei';
import { PHONEMES } from '@/data/phonemes';
import { useAppState, useHydrated, learnedSlugs, todayKey, STATUS_LABEL, type WordStatus } from '@/lib/store';
import { WORDS, wordsOfGroup } from '@/lib/curriculum';
import { DIFFICULTY_LABEL } from '@/lib/classify';
import { ProgressBar } from './ProgressBar';
import { WordRow } from './WordRow';
import { IconChevronRight, IconSearch } from './icons';

type View = 'topics' | 'library';

const SELECT = 'min-h-10 w-full rounded-xl border border-line bg-surface px-3 text-sm';

export function GroupsClient() {
  const s = useAppState();
  const hydrated = useHydrated();
  const learnedTotal = learnedSlugs(s).length;
  const [view, setView] = useState<View>('topics');
  const [q, setQ] = useState('');
  const [group, setGroup] = useState('');
  const [level, setLevel] = useState('');
  const [code, setCode] = useState('');
  const [phoneme, setPhoneme] = useState('');
  const [status, setStatus] = useState('');
  const [gold, setGold] = useState(false);
  const [due, setDue] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const c = p.get('code'); const ph = p.get('phoneme'); const lv = p.get('level'); const st = p.get('status'); const d = p.get('due'); const sv = p.get('saved');
    if (c || ph || lv || st || d || sv) { setView('library'); if (c) setCode(c); if (ph) setPhoneme(ph); if (lv) setLevel(lv); if (st) setStatus(st); if (d) setDue(true); if (sv) setSaved(true); }
  }, []);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    return WORDS.filter((w) => {
      if (term && !w.word.toLowerCase().includes(term) && !w.meaning.toLowerCase().includes(term) && !w.ipa.includes(term)) return false;
      if (group && w.group !== Number(group)) return false;
      if (level && w.difficulty !== Number(level)) return false;
      if (code && !w.errorCodes.includes(code)) return false;
      if (phoneme && !w.phonemes.includes(phoneme)) return false;
      if (gold && !w.gold) return false;
      if (saved && !s.saved.includes(w.slug)) return false;
      if (due) { const p = s.words[w.slug]; if (!p || p.status === 'new' || p.due > todayKey()) return false; }
      if (status) {
        const st = s.words[w.slug]?.status ?? 'new';
        if (st !== status) return false;
      }
      return true;
    });
  }, [q, group, level, code, phoneme, status, gold, due, saved, s.words, s.saved]);

  const anyFilter = q || group || level || code || phoneme || status || gold || due || saved;

  return (
    <div className="flex flex-col gap-4">
      <section className="card p-4">
        <div className="flex items-end justify-between">
          <p className="text-sm text-muted">Đã học</p>
          <p className="font-display text-2xl font-extrabold tabular-nums">{hydrated ? learnedTotal : '–'}<span className="text-base font-medium text-muted">/{WORDS.length}</span></p>
        </div>
        <ProgressBar value={learnedTotal} max={WORDS.length} className="mt-2" label={`Tổng tiến độ ${WORDS.length} từ`} />
      </section>

      <div role="tablist" className="grid grid-cols-2 rounded-xl bg-surface-2 p-1 text-sm font-semibold">
        {([['topics', 'Theo chủ đề'], ['library', 'Thư viện & bộ lọc']] as [View, string][]).map(([k, label]) => (
          <button key={k} role="tab" aria-selected={view === k} type="button" onClick={() => setView(k)} className={`tap rounded-lg py-2 ${view === k ? 'bg-surface text-ink shadow-sm' : 'text-muted'}`}>{label}</button>
        ))}
      </div>

      {view === 'topics' ? (
        <>
          {STAGES.map((st) => {
            const stageGroups = GROUPS.filter((g) => g.id >= st.from && g.id <= st.to);
            if (!stageGroups.length) return null;
            const stageWords = WORDS.filter((w) => w.group >= st.from && w.group <= st.to);
            const stageLearned = stageWords.filter((w) => s.words[w.slug] && s.words[w.slug].status !== 'new').length;
            return (
          <section key={st.id} aria-labelledby={`stage-${st.id}`} className="flex flex-col gap-3">
            <div className="px-1">
              <p className="eyebrow text-primary">Tuần {st.from}–{st.to} • {stageWords.length} từ</p>
              <h2 id={`stage-${st.id}`} className="mt-0.5 text-xl font-extrabold">{st.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted">{st.description}</p>
              <ProgressBar value={stageLearned} max={stageWords.length} className="mt-2 h-1.5" color="accent" label={`Tiến độ ${st.title}`} />
            </div>
          <ul className="flex flex-col gap-3">
            {stageGroups.map((g) => {
              const words = wordsOfGroup(g.id);
              const learned = words.filter((w) => s.words[w.slug] && s.words[w.slug].status !== 'new').length;
              return (
                <li key={g.id}>
                  <Link href={`/words/${g.slug}`} className="card tap flex items-center gap-3 p-4">
                    <span className="flex size-13 shrink-0 flex-col items-center justify-center rounded-2xl border border-line bg-surface">
                      <span className="eyebrow text-[9px] text-primary">Tuần</span><span className="font-display text-xl font-extrabold leading-none tabular-nums">{g.id}</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display font-bold leading-snug">{g.title}</span>
                      <span className="block truncate text-xs text-muted">{g.examples.join(', ')} • 5 cụm × 10 từ</span>
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
          </section>
            );
          })}
          <p className="text-xs leading-relaxed text-muted">
            Giai đoạn 1 gồm 500 từ tuyển chọn theo mục đích sư phạm. Giai đoạn 2 và 3 bổ sung 2500 từ thông dụng xếp theo chủ đề, ước lượng theo mức độ phổ biến, chưa đối chiếu với danh sách tần suất NGSL-Spoken. Mỗi từ có cụm từ hay dùng kèm câu mẫu. Toàn bộ phiên âm, cụm từ và câu mẫu đang ở trạng thái nháp, cần giáo viên đối soát trước khi phát hành.
          </p>
        </>
      ) : (
        <>
          <label className="relative block">
            <span className="sr-only">Tìm từ</span>
            <IconSearch size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input value={q} onChange={(e) => setQ(e.target.value)} type="search" placeholder="Tìm từ, nghĩa hoặc IPA" className="min-h-11 w-full rounded-xl border border-line bg-surface pl-10 pr-3 text-base" />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs text-muted">Chủ đề
              <select value={group} onChange={(e) => setGroup(e.target.value)} className={SELECT}><option value="">Tất cả</option>{GROUPS.map((g) => <option key={g.id} value={g.id}>Tuần {g.id}: {g.short}</option>)}</select>
            </label>
            <label className="text-xs text-muted">Độ khó
              <select value={level} onChange={(e) => setLevel(e.target.value)} className={SELECT}><option value="">Tất cả</option>{DIFFICULTY_LABEL.map((l, i) => <option key={l} value={i + 1}>{l}</option>)}</select>
            </label>
            <label className="text-xs text-muted">Mã lỗi
              <select value={code} onChange={(e) => setCode(e.target.value)} className={SELECT}><option value="">Tất cả</option>{VEI.map((e) => <option key={e.code} value={e.code}>{e.code} {e.short}</option>)}</select>
            </label>
            <label className="text-xs text-muted">Chứa âm
              <select value={phoneme} onChange={(e) => setPhoneme(e.target.value)} className={`${SELECT} ipa`}><option value="">Tất cả</option>{PHONEMES.map((p) => <option key={p.id} value={p.id}>/{p.symbol}/ {p.examples[0]}</option>)}</select>
            </label>
            <label className="text-xs text-muted">Trạng thái
              <select value={status} onChange={(e) => setStatus(e.target.value)} className={SELECT}><option value="">Tất cả</option>{(Object.keys(STATUS_LABEL) as WordStatus[]).map((k) => <option key={k} value={k}>{STATUS_LABEL[k]}</option>)}</select>
            </label>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={gold} onChange={(e) => setGold(e.target.checked)} className="size-5 accent-[var(--c-primary)]" /> 30 bài chuẩn</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={due} onChange={(e) => setDue(e.target.checked)} className="size-5 accent-[var(--c-primary)]" /> Đến hạn ôn</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} className="size-5 accent-[var(--c-primary)]" /> Đã lưu</label>
          </div>
          <div className="flex items-center justify-between text-sm">
            <p className="text-muted"><span className="font-semibold text-ink tabular-nums">{results.length}</span> từ</p>
            {anyFilter ? <button type="button" onClick={() => { setQ(''); setGroup(''); setLevel(''); setCode(''); setPhoneme(''); setStatus(''); setGold(false); setDue(false); setSaved(false); }} className="font-semibold text-primary">Xoá bộ lọc</button> : null}
          </div>
          <ul className="flex flex-col gap-2">
            {results.slice(0, 120).map((w) => <WordRow key={w.slug} w={w} index={w.id} showMeta />)}
          </ul>
          {results.length > 120 ? <p className="text-center text-xs text-muted">Hiển thị 120 từ đầu. Thu hẹp bộ lọc để xem thêm.</p> : null}
        </>
      )}
    </div>
  );
}
