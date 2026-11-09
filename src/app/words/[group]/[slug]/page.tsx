import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getGroup } from '@/data/groups';
import { WORDS, nextInGroup, prevInGroup } from '@/lib/curriculum';
import { getFullWord } from '@/lib/words-full';
import { TopBar } from '@/components/TopBar';
import { WordLesson } from '@/components/WordLesson';

export function generateStaticParams() {
  return WORDS.map((w) => ({ group: String(w.group).padStart(2, '0'), slug: w.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ group: string; slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const w = getFullWord(slug);
  return { title: w ? `${w.word} /${w.ipa}/` : 'Từ' };
}

export default async function WordPage({ params }: { params: Promise<{ group: string; slug: string }> }) {
  const { group, slug } = await params;
  const w = getFullWord(slug);
  const g = getGroup(group);
  if (!w || !g || w.group !== g.id) notFound();
  const next = nextInGroup(w);
  const prev = prevInGroup(w);

  return (
    <>
      <TopBar back={`/words/${g.slug}`} eyebrow={`Từ ${w.id} / ${WORDS.length} • Tuần ${w.week}`} title={w.word} subtitle={g.title} />
      <WordLesson
        w={w}
        groupSlug={g.slug}
        next={next ? { slug: next.slug, word: next.word } : undefined}
        prev={prev ? { slug: prev.slug, word: prev.word } : undefined}
      />
    </>
  );
}
