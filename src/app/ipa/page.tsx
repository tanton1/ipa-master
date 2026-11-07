import type { Metadata } from 'next';
import { TopBar } from '@/components/TopBar';
import { IpaChart } from '@/components/IpaChart';

export const metadata: Metadata = { title: 'Bảng IPA' };

export default function IpaPage() {
  return (
    <>
      <TopBar title="Bảng IPA" subtitle="16 nguyên âm • 24 phụ âm • chạm để xem khẩu hình" />
      <main className="px-4 pt-4">
        <IpaChart />
      </main>
    </>
  );
}
