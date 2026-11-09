'use client';

import Link from 'next/link';
import { useAppState, useHydrated, learnedSlugs, dueSlugs, phonemeScore, errorScore, evidenceOf, streakDays, setRate, updateProfile, resetProgress, mastery, STATUS_LABEL, MASTERY_WEIGHTS, MASTERY_THRESHOLD, MASTERY_MIN_COVERAGE, EVIDENCE_MIN_N, INTERVALS, type WordStatus } from '@/lib/store';
import { EvidencePill } from './EvidencePill';
import { CONTENT_VERSION, CONTENT_STATUS_LABEL } from '@/data/content-version';
import { PHONEMES } from '@/data/phonemes';
import { VEI } from '@/data/vei';
import { WORDS, ROADMAP, wordsOfGroup } from '@/lib/curriculum';
import { GROUPS } from '@/data/groups';
import { UNITS } from '@/data/units';
import { ProgressBar } from './ProgressBar';
import { displayIpa, Ipa } from './Ipa';
import { IconFlame } from './icons';

const BAND = (score: number) => (score >= 75 ? 'bg-accent-soft text-accent border-accent/30' : score >= 55 ? 'bg-warn-soft text-warn border-warn/30' : 'bg-danger-soft text-danger border-danger/30');

const GOALS: Record<string, string> = { 'giao-tiep': 'Giao tiếp', 'mat-goc': 'Mất gốc', 'thi-cu': 'Thi cử', 'cong-viec': 'Công việc' };
const REGIONS: Record<string, string> = { bac: 'Miền Bắc', trung: 'Miền Trung', nam: 'Miền Nam', khac: 'Khác' };

export function ProfileClient() {
  const s = useAppState();
  const hydrated = useHydrated();
  const learned = learnedSlugs(s).length;
  const scored = PHONEMES.map((p) => ({ p, sc: phonemeScore(s.phonemeStats[p.id]) }));
  const withData = scored.filter((x) => x.sc && x.sc.n >= 2);
  const good = withData.filter((x) => x.sc!.score >= 75).sort((a, b) => b.sc!.score - a.sc!.score).slice(0, 2);
  const bad = withData.filter((x) => x.sc!.score < 55).sort((a, b) => a.sc!.score - b.sc!.score).slice(0, 3);
  const counts = (Object.keys(STATUS_LABEL) as WordStatus[]).map((k) => ({ k, n: k === 'new' ? WORDS.length - Object.values(s.words).filter((w) => w.status !== 'new').length : Object.values(s.words).filter((w) => w.status === k).length }));
  const avgMastery = learned ? Math.round(learnedSlugs(s).reduce((n, slug) => n + mastery(s.words[slug]).total, 0) / learned) : 0;
  const results = PHONEMES.map((p) => ({ p, st: s.phonemeStats[p.id] })).filter((x) => x.st && (x.st.lt > 0 || x.st.st > 0)).sort((a, b) => (b.st!.lt + b.st!.st) - (a.st!.lt + a.st!.st)).slice(0, 8);
  const dueCount = dueSlugs(s).length;

  return (
    <div className="flex flex-col gap-5">
      <section className="grid grid-cols-3 gap-2">
        <div className="card p-3 text-center"><p className="font-display text-2xl font-extrabold tabular-nums">{hydrated ? learned : '–'}</p><p className="text-[11px] text-muted">Từ đã học</p></div>
        <div className="card p-3 text-center"><p className="inline-flex items-center gap-1 font-display text-2xl font-extrabold tabular-nums text-warn"><IconFlame size={18} />{hydrated ? streakDays(s) : '–'}</p><p className="text-[11px] text-muted">Ngày liên tiếp</p></div>
        <div className="card p-3 text-center"><p className="font-display text-2xl font-extrabold tabular-nums text-primary">{hydrated ? avgMastery : '–'}</p><p className="text-[11px] text-muted">Thành thạo TB (tự chấm)</p></div>
      </section>

      <section className="card p-4" aria-labelledby="map-title">
        <p className="eyebrow text-muted">Theo từng âm</p>
        <h2 id="map-title" className="font-bold">Bản đồ luyện âm</h2>
        <p className="mt-1 text-xs text-muted">Điểm gộp từ bài nghe phân biệt và các lần tự đánh giá, làm mượt để một lần ghi âm (có thể bị ồn) không quyết định tất cả. Ô xám là chưa kiểm tra; ô viền đứt là mới có dưới {EVIDENCE_MIN_N} lượt, chưa kết luận.</p>
        <ul className="mt-3 grid grid-cols-5 gap-1.5">
          {scored.map(({ p, sc }) => (
            <li key={p.id}>
              <Link href={`/ipa/${p.id}`} title={sc ? `${sc.score}/100 sau ${sc.n} lượt` : 'Chưa có dữ liệu'} className={`tap flex flex-col items-center rounded-xl border py-1.5 ${!sc ? 'border-line bg-surface-2 text-muted' : sc.n < EVIDENCE_MIN_N ? 'border-dashed border-line bg-surface text-muted' : BAND(sc.score)}`}>
                <span className="ipa text-lg font-semibold leading-tight">{displayIpa(p.symbol, s.profile.ipaStyle)}</span>
                <span className="text-[10px] tabular-nums">{sc ? `${sc.score}%` : '–'}</span>
              </Link>
            </li>
          ))}
        </ul>
        <ul className="mt-3 flex flex-wrap gap-3 text-[11px] text-muted">
          <li className="flex items-center gap-1"><span className="size-2 rounded-full bg-accent" /> Tương đối tốt (≥75)</li>
          <li className="flex items-center gap-1"><span className="size-2 rounded-full bg-warn" /> Đang luyện</li>
          <li className="flex items-center gap-1"><span className="size-2 rounded-full bg-danger" /> Lỗi đã quan sát (&lt;55)</li>
          <li className="flex items-center gap-1"><span className="size-2 rounded-full border border-dashed border-muted" /> Đang đánh giá</li>
          <li className="flex items-center gap-1"><span className="size-2 rounded-full bg-surface-2 ring-1 ring-line" /> Chưa kiểm tra</li>
        </ul>
        {hydrated ? (
          <p className="mt-3 rounded-xl bg-surface-2 p-3 text-sm">
            {withData.length < 3
              ? 'Chưa đủ dữ liệu để gợi ý. Làm bài kiểm tra đầu vào hoặc luyện thêm vài từ.'
              : <>
                  {good.length ? <>Bạn đang làm khá tốt {good.map((x) => `/${x.p.symbol}/`).join(', ')}. </> : null}
                  {bad.length ? <>Bài tiếp theo nên ưu tiên {bad.map((x) => `/${x.p.symbol}/`).join(', ')} trong từ đơn trước khi chuyển sang câu.</> : 'Chưa có âm nào ở mức ưu tiên.'}
                </>}
          </p>
        ) : null}
      </section>

      <section className="card p-4" aria-labelledby="results-title">
        <p className="eyebrow text-muted">Kết quả có bằng chứng</p>
        <h2 id="results-title" className="font-bold">Bạn đã làm được gì</h2>
        {!hydrated ? null : results.length ? (
          <ul className="mt-3 flex flex-col gap-2">
            {results.map(({ p, st }) => {
              const sc = phonemeScore(st);
              return (
                <li key={p.id} className="flex items-center gap-3 rounded-xl bg-surface-2 px-3 py-2">
                  <Ipa value={p.symbol} className="w-12 shrink-0 text-xl font-semibold text-primary" />
                  <span className="min-w-0 flex-1 text-sm leading-snug">
                    {st!.lt ? <span>Nghe đúng <span className="font-semibold tabular-nums">{st!.lc}/{st!.lt}</span></span> : null}
                    {st!.lt && st!.st ? <span className="text-muted"> · </span> : null}
                    {st!.st ? <span className="text-muted">tự chấm đạt <span className="font-semibold tabular-nums text-ink">{st!.sg}/{st!.st}</span></span> : null}
                  </span>
                  <EvidencePill level={evidenceOf(sc)} />
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted">Chưa có kết quả kiểm tra nào. Làm bài kiểm tra đầu vào hoặc bài nghe phân biệt để có bằng chứng đầu tiên.</p>
        )}
        <p className="mt-3 text-[11px] text-muted">Kết quả nghe là đo được. Kết quả nói là bạn tự chấm sau khi nghe A/B; chưa có chấm phát âm tự động.</p>
      </section>

      <section className="card p-4">
        <h2 className="text-lg font-extrabold">Bản đồ nhóm lỗi</h2>
        <p className="mt-1 text-xs text-muted">Thanh màu chỉ hiện khi đã có từ {EVIDENCE_MIN_N} lượt. Trước đó là đang đánh giá, không phải đang yếu.</p>
        <ul className="mt-3 flex flex-col gap-2">
          {VEI.map((e) => {
            const sc = errorScore(s.errorStats[e.code]);
            return (
              <li key={e.code}>
                <Link href={`/errors/${e.code}`} className="flex items-center gap-2 text-sm">
                  <span className="w-9 shrink-0 text-xs font-bold text-primary">{e.code}</span>
                  <span className="w-28 shrink-0 truncate text-xs">{e.short}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2"><span className={`block h-full rounded-full ${sc && sc.n >= EVIDENCE_MIN_N ? (sc.score >= 75 ? 'bg-accent' : sc.score >= 55 ? 'bg-warn' : 'bg-danger') : ''}`} style={{ width: `${sc && sc.n >= EVIDENCE_MIN_N ? sc.score : 0}%` }} /></span>
                  <EvidencePill level={evidenceOf(sc)} detail={sc ? String(sc.score) : undefined} />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="card p-4">
        <h2 className="text-lg font-extrabold">Trạng thái {WORDS.length} từ</h2>
        <ul className="mt-2 grid grid-cols-2 gap-2 text-sm">
          {counts.map(({ k, n }) => (
            <li key={k}><Link href={`/words?status=${k}`} className="flex justify-between rounded-xl bg-surface-2 px-3 py-2"><span>{STATUS_LABEL[k]}</span><span className="font-semibold tabular-nums">{hydrated ? n : '–'}</span></Link></li>
          ))}
          <li><Link href="/words?due=1" className="flex justify-between rounded-xl bg-primary-soft px-3 py-2 text-primary"><span>Đến hạn ôn</span><span className="font-semibold tabular-nums">{hydrated ? dueCount : '–'}</span></Link></li>
          <li><Link href="/words?saved=1" className="flex justify-between rounded-xl bg-surface-2 px-3 py-2"><span>Đã lưu</span><span className="font-semibold tabular-nums">{hydrated ? s.saved.length : '–'}</span></Link></li>
        </ul>
        <details className="mt-3 text-xs text-muted">
          <summary className="cursor-pointer font-semibold text-ink">Cách tính điểm thành thạo</summary>
          <p className="mt-2">Điểm = Nghe phân biệt × {MASTERY_WEIGHTS.listen * 100}% + Phát âm từ × {MASTERY_WEIGHTS.pron * 100}% + Ghi nhớ sau ôn tập × {MASTERY_WEIGHTS.retention * 100}% + Dùng trong câu × {MASTERY_WEIGHTS.sentence * 100}%. Thành phần chưa kiểm tra không tính vào điểm: điểm chỉ dựa trên phần đã có dữ liệu, và được xem là đủ tin cậy khi các phần đó chiếm ít nhất {Math.round(MASTERY_MIN_COVERAGE * 100)}% trọng số. Phát âm từ và dùng trong câu là tự đánh giá của bạn, chưa phải điểm đo khách quan.</p>
          <p className="mt-1">Một từ chỉ chuyển sang Thành thạo khi đạt {MASTERY_THRESHOLD}/100, đã qua bước ôn {INTERVALS[3]} ngày và ôn đạt ở ít nhất 3 ngày khác nhau. Lịch ôn: {INTERVALS.join(' → ')} ngày. Đây là công thức đề xuất cho tiến độ học, cần kiểm nghiệm với người học thật.</p>
        </details>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-extrabold">Lộ trình {GROUPS.length} tuần</h2>
        <p className="mb-3 text-xs text-muted">Mỗi tuần 5 ngày học mới (10 từ/ngày), thứ 7 kiểm tra 50 từ, Chủ nhật ôn cá nhân hoá hoặc nghỉ. Học hết danh sách chưa có nghĩa là đã thành thạo.</p>
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
        <h2 className="text-lg font-extrabold">Hồ sơ và cài đặt</h2>
        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          <dt className="text-muted">Mục tiêu</dt><dd>{s.profile.goal ? GOALS[s.profile.goal] : '—'}</dd>
          <dt className="text-muted">Vùng miền</dt><dd>{s.profile.region ? REGIONS[s.profile.region] : '—'}</dd>
          <dt className="text-muted">Giọng chuẩn</dt><dd>Anh-Mỹ phổ thông (General American)</dd>
        </dl>
        <Link href="/onboarding" className="mt-2 inline-block text-sm font-semibold text-primary">Thay đổi mục tiêu và vùng miền</Link>

        <fieldset className="mt-4">
          <legend className="text-sm font-medium">Kiểu hiển thị phiên âm</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {([['phonemic', 'Âm vị Anh-Mỹ', '/ʃip/, /θɹi/'], ['dictionary', 'Kiểu từ điển', '/ʃiːp/, /θriː/']] as const).map(([k, label, ex]) => (
              <label key={k} className={`tap cursor-pointer rounded-xl border-2 p-3 text-sm ${s.profile.ipaStyle === k ? 'border-accent bg-accent-soft' : 'border-line bg-surface'}`}>
                <input type="radio" name="ipaStyle" className="sr-only" checked={s.profile.ipaStyle === k} onChange={() => updateProfile({ ipaStyle: k })} />
                <span className="block font-semibold">{label}</span>
                <span className="ipa block text-xs text-muted">{ex}</span>
              </label>
            ))}
          </div>
          <p className="mt-1 text-xs text-muted">Hai kiểu ghi chỉ cùng một âm; chỉ khác quy ước ký hiệu.</p>
        </fieldset>

        <label className="mt-4 block text-sm">
          <span className="flex justify-between"><span>Tốc độ giọng mẫu</span><span className="tabular-nums text-muted">{s.settings.rate.toFixed(2)}x</span></span>
          <input type="range" min={0.7} max={1.2} step={0.05} value={s.settings.rate} onChange={(e) => setRate(Number(e.target.value))} className="mt-2 w-full accent-[var(--c-primary)]" aria-label="Tốc độ giọng mẫu" />
        </label>

        <div className="mt-4 rounded-xl bg-surface-2 p-3 text-xs text-muted">
          <p className="font-semibold text-ink">Dữ liệu và quyền riêng tư</p>
          <p className="mt-1">Tiến độ chỉ lưu trên thiết bị này (chưa có đăng nhập đồng bộ). Bản ghi âm chỉ nằm trong bộ nhớ tạm của trang, không được tải lên máy chủ và mất khi rời trang. Khi có tính năng chấm AI, app sẽ xin đồng ý riêng trước khi gửi bản ghi.</p>
        </div>
        <button type="button" onClick={() => { if (window.confirm('Xoá toàn bộ tiến độ học trên thiết bị này? Không thể khôi phục.')) resetProgress(); }} className="tap mt-3 text-sm font-semibold text-danger">Xoá toàn bộ tiến độ</button>
      </section>

      <p className="text-center text-[11px] text-muted">{WORDS.length} từ • {UNITS.length} cụm học • {PHONEMES.length} âm • 10 nhóm lỗi • 30 bài chuẩn • nội dung bản {CONTENT_VERSION} • {CONTENT_STATUS_LABEL.toLowerCase()}</p>
    </div>
  );
}
