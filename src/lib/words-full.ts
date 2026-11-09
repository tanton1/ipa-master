/**
 * Bản dữ liệu từ đầy đủ (cặp tối thiểu, đồng âm, ghi chú, cụm từ hay dùng…).
 * CHỈ import ở server component, route handler hoặc script: tệp JSON này vài MB,
 * không được lọt vào bundle trình duyệt. Phía trình duyệt dùng WORDS trong curriculum.ts.
 */
import wordsJson from '@/data/words.json';
import type { WordEntry } from '@/data/types';

export const FULL_WORDS: WordEntry[] = wordsJson as WordEntry[];

const BY_SLUG = new Map(FULL_WORDS.map((w) => [w.slug, w]));

export function getFullWord(slug: string): WordEntry | undefined {
  return BY_SLUG.get(slug.toLowerCase());
}
