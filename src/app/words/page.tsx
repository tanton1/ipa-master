import type { Metadata } from 'next';
import { TopBar } from '@/components/TopBar';
import { GroupsClient } from '@/components/GroupsClient';

export const metadata: Metadata = { title: '500 từ cốt lõi' };

export default function WordsPage() {
  return (
    <>
      <TopBar title="500 từ cốt lõi" subtitle="10 chủ đề • 50 từ mỗi chủ đề • 5 bước mỗi từ" />
      <main className="px-4 pt-4">
        <GroupsClient />
      </main>
    </>
  );
}
