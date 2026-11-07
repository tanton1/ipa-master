import type { Metadata, Viewport } from 'next';
import { Be_Vietnam_Pro, Noto_Sans, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { BottomNav } from '@/components/BottomNav';
import { SwRegister } from '@/components/SwRegister';

const beVietnam = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-be-vietnam',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin', 'vietnamese'],
  weight: ['600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

const noto = Noto_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600'],
  variable: '--font-noto',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'IPA Master – Học phát âm tiếng Anh cho người Việt', template: '%s · IPA Master' },
  description:
    'Học phát âm tiếng Anh từ gốc: nhận diện âm IPA, so sánh với tiếng Việt, quan sát khẩu hình, ghi âm và luyện 500 từ cốt lõi.',
  applicationName: 'IPA Master',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'IPA Master', statusBarStyle: 'default' },
  icons: { icon: '/icons/icon.svg', apple: '/icons/icon.svg' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fffdfa' },
    { media: '(prefers-color-scheme: dark)', color: '#12110f' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${beVietnam.variable} ${jakarta.variable} ${noto.variable}`}>
      <body className="antialiased">
        <div className="mx-auto w-full max-w-md min-h-dvh safe-bottom">{children}</div>
        <BottomNav />
        <SwRegister />
      </body>
    </html>
  );
}
