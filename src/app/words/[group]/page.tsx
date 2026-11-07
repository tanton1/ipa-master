import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { GROUPS, getGroup } from '@/data/groups';
import { wordsOfGroup } from '@/lib/curriculum';
import { TopBar } from '@/components/TopBar';
import { WordRow } from '@/components/WordRow';
import { tone } from '@/lib/tones';

export function generateStaticParams() {
  return GROUPS.map((g) => ({ group: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ group: string }> }): Promise<Metadata> {
  const { group } = await params;
  const g = getGroup(group);
  return { title: g ? `Nhóm ${g.slug} – ${g.title}` : 'Nhóm từ' };
}

export default async function GroupPage({ params }: { params: Promise<{ group: string }> }) {
  const { group } = await params;
  const g = getGroup(group);
  if (!g) notFound();
  const words = wordsOfGroup(g.id);
  const t = tone(g.tone);
  const firstId = words[0]?.id ?? 0;

  return (
    <>
      <TopBar back="/words" eyebrow={`Nhóm ${g.slug} / 10`} title={g.title} subtitle={`${words.length} từ • ${g.focus}`} />
      <main className="flex flex-col gap-4 px-4 pt-4">
        <section className={`rounded-2xl p-4 ${t.soft}`}>
          <p className={`text-sm leading-relaxed ${t.text}`}>{g.description}</p>
        </section>
        <ul className="flex flex-col gap-2">
          {words.map((w, i) => <WordRow key={w.slug} w={w} index={firstId + i} />)}
        </ul>
      </main>
    </>
  );
}
