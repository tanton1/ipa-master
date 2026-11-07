import type { Metadata } from 'next';
import { TopBar } from '@/components/TopBar';
import { Onboarding } from '@/components/Onboarding';

export const metadata: Metadata = { title: 'Thiết lập lộ trình' };

export default function OnboardingPage() {
  return (
    <>
      <TopBar back="/" title="Thiết lập lộ trình" subtitle="Khoảng 1 phút" />
      <main className="px-4 pt-4"><Onboarding /></main>
    </>
  );
}
