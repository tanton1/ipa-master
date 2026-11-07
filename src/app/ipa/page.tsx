import type { Metadata } from 'next';
import { TopBar } from '@/components/TopBar';
import { IpaChart } from '@/components/IpaChart';

export const metadata: Metadata = { title: 'Bảng IPA' };

export default function IpaPage() {
  return (
    <>
      <TopBar title="Bảng IPA" subtitle="40 âm tiếng Anh-Mỹ • chạm để xem khẩu hình" />
      <main className="px-4 pt-4">
        <IpaChart />
      </main>
    </>
  );
}
