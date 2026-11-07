import type { Metadata } from 'next';
import { TopBar } from '@/components/TopBar';
import { Diagnostic } from '@/components/Diagnostic';

export const metadata: Metadata = { title: 'Kiểm tra đầu vào' };

export default function DiagnosticPage() {
  return (
    <>
      <TopBar back="/" title="Kiểm tra đầu vào" subtitle="Nghe • đọc từ • đọc câu • tự đánh giá" />
      <main className="px-4 pt-4"><Diagnostic /></main>
    </>
  );
}
