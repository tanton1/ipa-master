import type { Metadata } from 'next';
import { TopBar } from '@/components/TopBar';
import { ReviewClient } from '@/components/ReviewClient';

export const metadata: Metadata = { title: 'Ôn tập và tiến độ' };

export default function ReviewPage() {
  return (
    <>
      <TopBar title="Ôn tập" subtitle="Ôn ngắt quãng • lộ trình 10 tuần • tiến độ" />
      <main className="px-4 pt-4">
        <ReviewClient />
      </main>
    </>
  );
}
