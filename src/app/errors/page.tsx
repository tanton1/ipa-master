import type { Metadata } from 'next';
import { TopBar } from '@/components/TopBar';
import { ErrorList } from '@/components/ErrorList';

export const metadata: Metadata = { title: 'Thư viện lỗi phát âm E01–E10' };

export default function ErrorsPage() {
  return (
    <>
      <TopBar back="/practice" title="Chữa lỗi E01–E10" subtitle="Vietnamese Error Intelligence" />
      <main className="px-4 pt-4">
        <ErrorList />
      </main>
    </>
  );
}
