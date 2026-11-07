import type { Metadata } from 'next';
import { TopBar } from '@/components/TopBar';
import { PracticeHub } from '@/components/PracticeHub';

export const metadata: Metadata = { title: 'Luyện nói' };

export default function PracticePage() {
  return (
    <>
      <TopBar eyebrow="Phòng tập" title="Luyện nói" subtitle="Luyện câu • chữa lỗi • ôn tập" />
      <main className="px-4 pt-4">
        <PracticeHub />
      </main>
    </>
  );
}
