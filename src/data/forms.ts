import formsJson from './forms.json';
import type { WordForms } from './types';

/** Dạng đọc theo ngữ cảnh của từ chức năng, sinh từ content/forms.txt. */
export const WORD_FORMS: WordForms[] = formsJson as WordForms[];

const BY_SLUG = new Map(WORD_FORMS.map((f) => [f.slug, f]));

export function getForms(slug: string): WordForms | undefined {
  return BY_SLUG.get(slug);
}
