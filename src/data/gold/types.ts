import type { ErrorCode } from '../vei';

export type GoldType = 'hard-sound' | 'stress' | 'pair';

export interface GoldLesson {
  slug: string;
  type: GoldType;
  focus: string;
  codes: ErrorCode[];
  /** Ghi chú riêng cho từng âm, theo thứ tự âm vị của từ */
  breakdown: { sym: string; label: string; note: string }[];
  vnContrast: string;
  errors: string[];
  drill: string[];
  /** Từ gây nhiễu cho bài nghe đố; bỏ trống khi giọng tổng hợp không tạo được khác biệt */
  listen?: { word: string; ipa: string; meaning: string };
  sentences: { en: string; vi: string }[];
  criteria: string;
}

export const GOLD_TYPE_LABEL: Record<GoldType, string> = {
  'hard-sound': 'Âm khó',
  stress: 'Trọng âm và giảm âm',
  pair: 'Cặp từ dễ nhầm',
};
