import type { Metadata } from 'next';
import Link from 'next/link';
import { TopBar } from '@/components/TopBar';
import { IconChevronRight } from '@/components/icons';

export const metadata: Metadata = { title: 'Lộ trình 6 cấp độ' };

const LEVELS = [
  {
    n: '01', title: 'Sound Awareness', vi: 'Nhận biết âm', desc: 'Nhận ra sự khác nhau giữa nghe âm và nhìn chữ. Cùng chữ có thể là âm khác, chữ khác có thể là cùng âm.',
    examples: 'ship / sheep, bat / bad', links: [{ href: '/contrast/ih-i', label: 'Bài nghe /ɪ/ – /i/' }, { href: '/contrast', label: '7 khác biệt Việt – Anh' }],
  },
  {
    n: '02', title: 'Mouth Mechanics', vi: 'Cơ chế tạo âm', desc: 'Hiểu hoạt động của môi, lưỡi, răng, hàm, dây thanh và luồng hơi. Học cách tự cảm nhận rung thanh bằng tay trên cổ.',
    examples: '/f/, /v/, /θ/, /ð/', links: [{ href: '/ipa/th', label: 'Khẩu hình /θ/' }, { href: '/ipa/v', label: 'Khẩu hình /v/' }],
  },
  {
    n: '03', title: 'Phoneme Mastery', vi: 'Làm chủ âm vị', desc: 'Học phụ âm, nguyên âm và nguyên âm đôi theo từng nhóm cách tạo âm, ưu tiên các âm khó với người Việt.',
    examples: '/ɪ/, /i/, /æ/, /ɛ/', links: [{ href: '/ipa', label: 'Bảng IPA theo nhóm' }, { href: '/errors/E02', label: 'Chữa lỗi nguyên âm E02' }],
  },
  {
    n: '04', title: 'Syllable & Stress', vi: 'Âm tiết và trọng âm', desc: 'Ghép âm thành từ, phân âm tiết, xác định trọng âm và đọc âm tiết yếu thành /ə/.',
    examples: 'PREsent / preSENT', links: [{ href: '/errors/E08', label: 'Chữa lỗi trọng âm E08' }, { href: '/errors/E09', label: 'Schwa E09' }],
  },
  {
    n: '05', title: 'Connected Speech', vi: 'Lời nói liền mạch', desc: 'Dạng yếu, nối âm, giảm âm và nhịp điệu. Sẽ mở rộng ở giai đoạn 3; hiện có bài schwa và dạng yếu của từ chức năng.',
    examples: 'want to, did you', links: [{ href: '/words/01', label: 'Từ chức năng (G01)' }],
  },
  {
    n: '06', title: 'Real-life Speaking', vi: 'Nói trong thực tế', desc: 'Áp dụng vào câu, hội thoại và tình huống. Mỗi từ trong 500 từ đều có câu ứng dụng; ngữ điệu câu ở E10.',
    examples: 'I think this is better.', links: [{ href: '/errors/E10', label: 'Ngữ điệu E10' }, { href: '/words', label: '500 từ' }],
  },
];

export default function LevelsPage() {
  return (
    <>
      <TopBar back="/ipa" title="Lộ trình 6 cấp độ" subtitle="Từ nhận biết âm đến nói trong thực tế" />
      <main className="flex flex-col gap-3 px-4 pt-4">
        <p className="text-sm leading-relaxed text-muted">IPA là công cụ để hiểu cách tạo âm, không phải mục tiêu cuối cùng. Mỗi cấp độ dựa trên cấp độ trước.</p>
        <ol className="flex flex-col gap-3">
          {LEVELS.map((l) => (
            <li key={l.n} className="card p-4">
              <div className="flex items-baseline gap-3">
                <span className="font-display text-2xl font-extrabold tabular-nums text-primary">{l.n}</span>
                <div className="min-w-0">
                  <p className="font-semibold">{l.title}</p>
                  <p className="text-xs text-muted">{l.vi}</p>
                </div>
              </div>
              <p className="mt-2 text-sm leading-relaxed">{l.desc}</p>
              <p className="ipa mt-2 text-sm text-muted">{l.examples}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {l.links.map((k) => (
                  <li key={k.href}>
                    <Link href={k.href} className="tap inline-flex items-center gap-1 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-primary">
                      {k.label} <IconChevronRight size={12} />
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </main>
    </>
  );
}
