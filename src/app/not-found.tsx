import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-[60dvh] flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="ipa text-5xl font-semibold text-primary">/ʔ/</p>
      <h1 className="text-xl font-bold">Không tìm thấy trang</h1>
      <p className="text-sm text-muted">Đường dẫn này không có trong IPA Master.</p>
      <Link href="/" className="tap rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-ink">Về trang chủ</Link>
    </main>
  );
}
