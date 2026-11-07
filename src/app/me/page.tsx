import type { Metadata } from 'next';
import { TopBar } from '@/components/TopBar';
import { ProfileClient } from '@/components/ProfileClient';

export const metadata: Metadata = { title: 'Cá nhân và tiến bộ' };

export default function MePage() {
  return (
    <>
      <TopBar title="Cá nhân" subtitle="Bản đồ phát âm • tiến độ • cài đặt" />
      <main className="px-4 pt-4">
        <ProfileClient />
      </main>
    </>
  );
}
