import type { GoldLesson } from './types';
import { GOLD_A } from './set-a';
import { GOLD_B } from './set-b';

export type { GoldLesson, GoldType } from './types';
export { GOLD_TYPE_LABEL } from './types';

/** Gold Set: 30 bài chuẩn để làm khuôn mẫu sản xuất 470 bài còn lại. */
export const GOLD: GoldLesson[] = [...GOLD_A, ...GOLD_B];

const BY_SLUG = new Map(GOLD.map((g) => [g.slug, g]));

export function getGold(slug: string): GoldLesson | undefined {
  return BY_SLUG.get(slug);
}

export const GOLD_SLUGS = new Set(GOLD.map((g) => g.slug));
