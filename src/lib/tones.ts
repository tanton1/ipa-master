/** Màu sắc cho nhóm từ. Viết đầy đủ tên lớp để Tailwind nhận diện. */
export interface Tone { soft: string; text: string; strong: string; ring: string }

export const TONES: Record<string, Tone> = {
  indigo: { soft: 'bg-indigo-100 dark:bg-indigo-900/40', text: 'text-indigo-700 dark:text-indigo-300', strong: 'bg-indigo-600', ring: 'ring-indigo-300' },
  violet: { soft: 'bg-violet-100 dark:bg-violet-900/40', text: 'text-violet-700 dark:text-violet-300', strong: 'bg-violet-600', ring: 'ring-violet-300' },
  sky: { soft: 'bg-sky-100 dark:bg-sky-900/40', text: 'text-sky-700 dark:text-sky-300', strong: 'bg-sky-600', ring: 'ring-sky-300' },
  rose: { soft: 'bg-rose-100 dark:bg-rose-900/40', text: 'text-rose-700 dark:text-rose-300', strong: 'bg-rose-600', ring: 'ring-rose-300' },
  amber: { soft: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-700 dark:text-amber-300', strong: 'bg-amber-600', ring: 'ring-amber-300' },
  teal: { soft: 'bg-teal-100 dark:bg-teal-900/40', text: 'text-teal-700 dark:text-teal-300', strong: 'bg-teal-600', ring: 'ring-teal-300' },
  lime: { soft: 'bg-lime-100 dark:bg-lime-900/40', text: 'text-lime-700 dark:text-lime-300', strong: 'bg-lime-600', ring: 'ring-lime-300' },
  orange: { soft: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-700 dark:text-orange-300', strong: 'bg-orange-600', ring: 'ring-orange-300' },
  cyan: { soft: 'bg-cyan-100 dark:bg-cyan-900/40', text: 'text-cyan-700 dark:text-cyan-300', strong: 'bg-cyan-600', ring: 'ring-cyan-300' },
  fuchsia: { soft: 'bg-fuchsia-100 dark:bg-fuchsia-900/40', text: 'text-fuchsia-700 dark:text-fuchsia-300', strong: 'bg-fuchsia-600', ring: 'ring-fuchsia-300' },
};

export function tone(name: string): Tone {
  return TONES[name] ?? TONES.indigo;
}

export const PRIORITY_LABEL: Record<number, { label: string; cls: string; dot: string }> = {
  1: { label: 'Khó với người Việt', cls: 'bg-danger-soft text-danger', dot: 'bg-danger' },
  2: { label: 'Cần chú ý', cls: 'bg-warn-soft text-warn', dot: 'bg-warn' },
  3: { label: 'Gần tiếng Việt', cls: 'bg-accent-soft text-accent', dot: 'bg-accent' },
};
