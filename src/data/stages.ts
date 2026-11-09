/**
 * Ba giai đoạn của lộ trình 3000 từ. Mỗi nhóm 50 từ = 1 tuần (5 ngày × 10 từ).
 * Chỉ dùng cú pháp TypeScript "xoá được" để script build chạy trực tiếp bằng Node.
 */
export interface Stage {
  id: number;
  title: string;
  short: string;
  /** nhóm đầu và nhóm cuối (bao gồm) */
  from: number;
  to: number;
  description: string;
}

export const STAGES: Stage[] = [
  { id: 1, title: 'Giai đoạn 1 · Nền tảng', short: 'Nền tảng', from: 1, to: 10, description: '500 từ cốt lõi: đủ toàn bộ âm Anh-Mỹ, các lỗi người Việt hay gặp và 30 bài chuẩn.' },
  { id: 2, title: 'Giai đoạn 2 · Mở rộng', short: 'Mở rộng', from: 11, to: 30, description: '1000 từ thông dụng tiếp theo: từ chức năng, động từ quá khứ bất quy tắc, tính từ, đời sống hằng ngày.' },
  { id: 3, title: 'Giai đoạn 3 · Thành thạo', short: 'Thành thạo', from: 31, to: 60, description: '1500 từ cho công việc, học tập, tin tức; trọng âm theo hậu tố, chữ câm và cặp từ dễ nhầm.' },
];

export function stageOf(group: number): number {
  return STAGES.find((s) => group >= s.from && group <= s.to)?.id ?? STAGES[STAGES.length - 1].id;
}

export function getStage(id: number): Stage | undefined {
  return STAGES.find((s) => s.id === id);
}
