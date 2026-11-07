import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CONTRAST_LESSONS, getContrast } from '@/data/contrast';
import { TopBar } from '@/components/TopBar';
import { ContrastLesson } from '@/components/ContrastLesson';

export function generateStaticParams() {
  return CONTRAST_LESSONS.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const c = getContrast(id);
  return { title: c ? `${c.label} – ${c.sample}` : 'Đối chiếu' };
}

export default async function ContrastDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = getContrast(id);
  if (!lesson) notFound();
  return (
    <>
      <TopBar back="/contrast" eyebrow="Việt – Anh Contrast" title={`${lesson.label} · ${lesson.sample}`} subtitle={lesson.subtitle} />
      <ContrastLesson lesson={lesson} />
    </>
  );
}
