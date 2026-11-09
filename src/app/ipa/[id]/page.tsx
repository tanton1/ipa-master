import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PHONEMES, getPhoneme } from '@/data/phonemes';
import { getContrast } from '@/data/contrast';
import { TopBar } from '@/components/TopBar';
import { MouthDiagram } from '@/components/MouthDiagram';
import { PlayButton } from '@/components/PlayButton';
import { WordRow } from '@/components/WordRow';
import { PRIORITY_LABEL } from '@/lib/tones';
import { WORDS, wordsWithPhoneme, countWordsWithPhoneme, getWord } from '@/lib/curriculum';
import { IconAlert, IconCompare, IconSparkle } from '@/components/icons';

export function generateStaticParams() {
  return PHONEMES.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = getPhoneme(id);
  return { title: p ? `Âm /${p.symbol}/ – ${p.name}` : 'Âm' };
}

export default async function PhonemePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = getPhoneme(id);
  if (!p) notFound();
  const index = PHONEMES.findIndex((x) => x.id === p.id) + 1;
  const pr = PRIORITY_LABEL[p.priority];
  const contrast = p.contrastId ? getContrast(p.contrastId) : undefined;
  const inCorpus = wordsWithPhoneme(p.id, 10);
  const total = countWordsWithPhoneme(p.id);
  const typeLabel = p.type === 'consonant' ? 'Phụ âm' : p.type === 'diphthong' ? 'Nguyên âm đôi' : 'Nguyên âm đơn';

  return (
    <>
      <TopBar back="/ipa" eyebrow={`Âm ${index} / ${PHONEMES.length}`} title={`/${p.symbol}${p.alt ? ` ${p.alt}` : ''}/ · ${p.name}`} subtitle={typeLabel} />
      <main className="flex flex-col gap-5 px-4 pt-4">
        <section className="card flex items-center gap-4 p-4">
          <span className="ipa text-6xl font-semibold leading-none text-primary">{p.symbol}</span>
          <div className="min-w-0 flex-1">
            <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${pr.cls}`}>{pr.label}</span>
            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs text-muted">
              {p.type === 'consonant' ? (
                <>
                  <dt>Dây thanh</dt><dd className="text-ink">{p.voiced ? 'Rung (hữu thanh)' : 'Không rung (vô thanh)'}</dd>
                  <dt>Vị trí</dt><dd className="text-ink">{p.place}</dd>
                  <dt>Cách tạo</dt><dd className="text-ink">{p.manner}</dd>
                </>
              ) : (
                <>
                  <dt>Loại</dt><dd className="text-ink">{typeLabel}</dd>
                  <dt>Trong {WORDS.length} từ</dt><dd className="text-ink">{total} từ</dd>
                </>
              )}
            </dl>
          </div>
        </section>

        <MouthDiagram phonemeId={p.id} />

        <section aria-labelledby="ex-title">
          <h2 id="ex-title" className="mb-2 text-lg font-extrabold">Nghe ví dụ</h2>
          <ul className="grid grid-cols-2 gap-2">
            {p.examples.map((ex) => {
              const w = getWord(ex);
              return (
                <li key={ex} className="card flex items-center gap-2 px-3 py-2">
                  <PlayButton text={ex} size="sm" />
                  <div className="min-w-0">
                    {w ? (
                      <Link href={`/words/${String(w.group).padStart(2, '0')}/${w.slug}`} className="block truncate font-semibold">{w.word}</Link>
                    ) : (
                      <span className="block truncate font-semibold">{ex}</span>
                    )}
                    {w ? <span className="ipa block truncate text-xs text-muted">/{w.ipa}/</span> : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="card p-4">
          <h2 className="text-lg font-extrabold">Cách tạo âm</h2>
          <p className="mt-1 text-sm leading-relaxed">{p.how}</p>
          <h3 className="mt-4 flex items-center gap-1.5 font-bold"><IconCompare size={16} className="text-primary" /> So với tiếng Việt</h3>
          <p className="mt-1 text-sm leading-relaxed">{p.vnCompare}</p>
          <h3 className="mt-4 flex items-center gap-1.5 font-bold"><IconAlert size={16} className="text-danger" /> Lỗi thường gặp</h3>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
            {p.errors.map((e) => <li key={e}>{e}</li>)}
          </ul>
          <div className="mt-4 flex gap-2 rounded-xl bg-accent-soft p-3 text-sm text-ink">
            <IconSparkle size={18} className="mt-0.5 shrink-0 text-accent" />
            <p><span className="font-semibold">Mẹo cảm nhận: </span>{p.tip}</p>
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-extrabold">Chữ viết thường gặp</h2>
          <ul className="flex flex-wrap gap-2">
            {p.spellings.map((s) => <li key={s} className="rounded-full border border-line bg-surface px-3 py-1 text-sm">{s}</li>)}
          </ul>
        </section>

        {contrast ? (
          <Link href={`/contrast/${contrast.id}`} className="card tap flex items-center gap-3 border-primary/30 bg-primary-soft/60 p-4">
            <span className="ipa text-2xl font-semibold text-primary">{contrast.label}</span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">Bài đối chiếu Việt – Anh</span>
              <span className="block truncate text-xs text-muted">{contrast.subtitle} • {contrast.pairs.length} cặp từ dễ nhầm</span>
            </span>
          </Link>
        ) : null}

        {inCorpus.length ? (
          <section>
            <h2 className="mb-2 text-lg font-extrabold">Trong bộ {WORDS.length} từ <span className="text-sm font-normal text-muted">({total} từ có âm này)</span></h2>
            <ul className="flex flex-col gap-2">
              {inCorpus.map((w) => <WordRow key={w.slug} w={w} />)}
            </ul>
          </section>
        ) : null}
      </main>
    </>
  );
}
