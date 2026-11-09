import type { Metadata } from 'next';
import { TopBar } from '@/components/TopBar';
import { GroupsClient } from '@/components/GroupsClient';

export const metadata: Metadata = { title: '3000 từ thông dụng' };

export default function WordsPage() {
  return (
    <>
      <TopBar eyebrow="Thư viện từ" title="3000 từ thông dụng" subtitle="3 giai đoạn • 60 chủ đề • cụm từ và câu mẫu cho mỗi từ" />
      <main className="px-4 pt-4">
        <GroupsClient />
      </main>
    </>
  );
}
