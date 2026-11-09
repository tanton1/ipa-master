import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { GROUPS, getGroup } from '@/data/groups';
import { wordsOfGroup } from '@/lib/curriculum';
import { TopBar } from '@/components/TopBar';
import { WordRow } from '@/components/WordRow';
import { UNITS, WEEKDAYS, WEEKDAY_ACTIVITY } from '@/data/units';

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

  return (
    <>
      <TopBar back="/words" eyebrow={`Tuần ${g.id} / ${GROUPS.length}`} title={g.title} subtitle={`${words.length} từ • ${g.focus}`} />
      <main className="flex flex-col gap-4 px-4 pt-4">
        <section className="rounded-3xl border border-primary/15 bg-primary-soft p-5">
          <p className="eyebrow text-primary">Trọng tâm tuần {g.id}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink">{g.description}</p>
        </section>
        {UNITS.filter((u) => u.group === g.id).map((u) => {
          const uw = words.filter((w) => w.unit === u.id);
          return (
            <section key={u.id} aria-labelledby={u.id}>
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <h2 id={u.id} className="text-lg font-extrabold">Cụm {u.index} · {u.title}</h2>
                <span className="shrink-0 text-[11px] font-medium text-muted">{WEEKDAYS[u.index - 1]}</span>
              </div>
              <p className="ipa -mt-1 mb-2 text-xs text-muted">{u.focus} • {WEEKDAY_ACTIVITY[u.index - 1]}</p>
              <ul className="flex flex-col gap-2">
                {uw.map((w) => <WordRow key={w.slug} w={w} index={w.id} />)}
              </ul>
            </section>
          );
        })}
        <p className="text-xs text-muted">Thứ 7: kiểm tra 50 từ và các âm trọng tâm của tuần {g.id}. Chủ nhật: ôn cá nhân hoá hoặc nghỉ.</p>
      </main>
    </>
  );
}
