import type { Metadata } from 'next';
import { TopBar } from '@/components/TopBar';
import { ReviewClient } from '@/components/ReviewClient';

export const metadata: Metadata = { title: 'Trung tâm ôn tập' };

export default function ReviewPage() {
  return (
    <>
      <TopBar back="/practice" title="Ôn tập" subtitle="Lịch 1 → 3 → 7 → 14 → 30 ngày" />
      <main className="px-4 pt-4">
        <ReviewClient />
      </main>
    </>
  );
}
