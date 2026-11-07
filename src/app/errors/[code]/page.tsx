import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { VEI, getVei } from '@/data/vei';
import { TopBar } from '@/components/TopBar';
import { ErrorLesson } from '@/components/ErrorLesson';

export function generateStaticParams() {
  return VEI.map((e) => ({ code: e.code }));
}

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params;
  const e = getVei(code);
  return { title: e ? `${e.code} – ${e.title}` : 'Lỗi phát âm' };
}

export default async function ErrorPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const e = getVei(code);
  if (!e) notFound();
  return (
    <>
      <TopBar back="/errors" eyebrow={`Lesson • VEI-${e.code}`} title={e.title} subtitle={e.examples.join(', ')} />
      <ErrorLesson code={e.code} />
    </>
  );
}
