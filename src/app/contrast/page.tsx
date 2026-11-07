import type { Metadata } from 'next';
import Link from 'next/link';
import { TopBar } from '@/components/TopBar';
import { CONTRAST_TOPICS } from '@/data/contrast-topics';
import { CONTRAST_LESSONS } from '@/data/contrast';
import { IconChevronRight } from '@/components/icons';

export const metadata: Metadata = { title: 'Đối chiếu Việt – Anh' };

export default function ContrastPage() {
  return (
    <>
      <TopBar eyebrow="Gốc rễ lỗi sai" title="Việt – Anh" subtitle="Vì sao người Việt đọc sai và sửa thế nào" />
      <main className="flex flex-col gap-6 px-4 pt-4">
        <p className="text-sm leading-relaxed text-muted">
          Thay vì học vẹt cách đọc, bạn sẽ hiểu hai ngôn ngữ khác nhau ở đâu: thanh điệu, nguyên âm, âm cuối, cụm phụ âm, trọng âm, giảm âm và chính tả. Mỗi khác biệt đi kèm lỗi điển hình và cách sửa.
        </p>

        <section aria-labelledby="topics-title">
          <h2 id="topics-title" className="mb-2 text-lg font-extrabold">Bảy khác biệt cần biết trước</h2>
          <ul className="flex flex-col gap-2">
            {CONTRAST_TOPICS.map((t, i) => (
              <li key={t.id}>
                <details className="card group px-4 py-3">
                  <summary className="flex cursor-pointer list-none items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary">{i + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{t.topic}</span>
                      <span className="block truncate text-xs text-muted">Lỗi: {t.error}</span>
                    </span>
                    <IconChevronRight size={18} className="shrink-0 text-muted transition-transform group-open:rotate-90" />
                  </summary>
                  <dl className="mt-3 grid gap-2 text-sm">
                    <div className="rounded-xl bg-surface-2 p-3"><dt className="eyebrow text-muted">Tiếng Việt</dt><dd>{t.vietnamese}</dd></div>
                    <div className="rounded-xl bg-surface-2 p-3"><dt className="eyebrow text-muted">Tiếng Anh</dt><dd>{t.english}</dd></div>
                    <div className="rounded-xl bg-danger-soft p-3"><dt className="eyebrow text-danger">Lỗi cần khắc phục</dt><dd>{t.error}</dd></div>
                    <div className="rounded-xl bg-accent-soft p-3"><dt className="eyebrow text-accent">Cách sửa</dt><dd>{t.fix}</dd></div>
                  </dl>
                </details>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="sounds-title">
          <h2 id="sounds-title" className="mb-1 text-lg font-extrabold">Các nhóm âm cần ưu tiên</h2>
          <p className="mb-3 text-xs text-muted">Mỗi bài có sơ đồ khẩu hình, hướng dẫn cảm nhận rung thanh hoặc luồng hơi, bài nghe phân biệt và tối thiểu 5 cặp từ dễ nhầm.</p>
          <ul className="grid grid-cols-1 gap-3">
            {CONTRAST_LESSONS.map((c) => (
              <li key={c.id}>
                <Link href={`/contrast/${c.id}`} className="card tap flex items-center gap-4 p-4">
                  <span className="ipa min-w-[4.5rem] text-2xl font-semibold text-primary">{c.label}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{c.sample}</span>
                    <span className="block text-sm text-muted">{c.subtitle}</span>
                    <span className="mt-1 block text-xs text-muted">{c.pairs.length} cặp từ • nghe phân biệt • ghi âm</span>
                  </span>
                  <IconChevronRight size={18} className="shrink-0 text-muted" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}
