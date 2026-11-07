/**
 * Bộ phân tích phiên âm IPA (General American) dùng chung cho app và script build.
 * Chỉ dùng cú pháp TypeScript "xoá được" (erasable) để Node có thể chạy trực tiếp.
 */

export const MULTI_SYMBOLS = ['tʃ', 'dʒ', 'eɪ', 'aɪ', 'oʊ', 'aʊ', 'ɔɪ'];

/** Ký hiệu IPA -> id âm vị trong thư viện âm. */
export const SYMBOL_TO_ID: Record<string, string> = {
  'tʃ': 'ch', 'dʒ': 'jh', 'eɪ': 'ey', 'aɪ': 'ay', 'oʊ': 'ow', 'aʊ': 'aw', 'ɔɪ': 'oy',
  'i': 'i', 'ɪ': 'ih', 'ɛ': 'eh', 'æ': 'ae', 'ɑ': 'aa', 'ɔ': 'ao', 'ʊ': 'uh', 'u': 'u',
  'ʌ': 'ah', 'ə': 'schwa', 'ɝ': 'er', 'ɚ': 'er',
  'p': 'p', 'b': 'b', 't': 't', 'd': 'd', 'k': 'k', 'g': 'g', 'ɡ': 'g',
  'f': 'f', 'v': 'v', 'θ': 'th', 'ð': 'dh', 's': 's', 'z': 'z', 'ʃ': 'sh', 'ʒ': 'zh', 'h': 'h',
  'm': 'm', 'n': 'n', 'ŋ': 'ng', 'l': 'l', 'ɹ': 'r', 'r': 'r', 'w': 'w', 'j': 'y',
};

export const VOWEL_IDS = new Set([
  'i', 'ih', 'eh', 'ae', 'aa', 'ao', 'uh', 'u', 'ah', 'schwa', 'er',
  'ey', 'ay', 'ow', 'aw', 'oy',
]);

export const DIPHTHONG_IDS = new Set(['ey', 'ay', 'ow', 'aw', 'oy']);

/** 0 = không nhấn, 1 = trọng âm chính, 2 = trọng âm phụ (chỉ gắn vào nguyên âm). */
export type Stress = 0 | 1 | 2;

export interface IpaToken {
  symbol: string;
  id: string;
  isVowel: boolean;
  stress: Stress;
}

export function normalizeIpa(ipa: string): string {
  return ipa
    .normalize('NFC')
    .replace(/[/\[\]\s]/g, '')
    .replace(/ː/g, '')
    .replace(/ɡ/g, 'g')
    .replace(/'/g, 'ˈ');
}

export function tokenizeIpa(ipa: string): IpaToken[] {
  const s = normalizeIpa(ipa);
  const tokens: IpaToken[] = [];
  let pending: Stress = 0;
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (ch === 'ˈ') { pending = 1; i++; continue; }
    if (ch === 'ˌ') { pending = 2; i++; continue; }
    if (ch === '.' || ch === '-') { i++; continue; }
    const two = s.slice(i, i + 2);
    let sym: string | undefined;
    if (MULTI_SYMBOLS.includes(two)) sym = two;
    else if (SYMBOL_TO_ID[ch] !== undefined) sym = ch;
    if (sym === undefined) {
      throw new Error(`Ký hiệu IPA không hợp lệ "${ch}" (U+${ch.charCodeAt(0).toString(16)}) trong /${ipa}/`);
    }
    const id = SYMBOL_TO_ID[sym];
    const isVowel = VOWEL_IDS.has(id);
    tokens.push({ symbol: sym, id, isVowel, stress: isVowel ? pending : 0 });
    if (isVowel) pending = 0;
    i += sym.length;
  }
  return tokens;
}

/** Chia token thành âm tiết (mỗi âm tiết đúng một nguyên âm). Quy tắc đơn giản hoá:
 *  một phụ âm giữa hai nguyên âm đi với âm tiết sau; từ hai phụ âm trở lên thì
 *  phụ âm đầu ở lại âm tiết trước, phần còn lại mở đầu âm tiết sau. */
export function syllabify(tokens: IpaToken[]): IpaToken[][] {
  const vowelIdx: number[] = [];
  tokens.forEach((t, i) => { if (t.isVowel) vowelIdx.push(i); });
  if (vowelIdx.length === 0) return [tokens];
  const groups: IpaToken[][] = [];
  let start = 0;
  for (let v = 0; v < vowelIdx.length; v++) {
    const cur = vowelIdx[v];
    const next = vowelIdx[v + 1];
    let end: number;
    if (next === undefined) end = tokens.length;
    else {
      const between = next - cur - 1;
      end = between <= 1 ? cur + 1 : cur + 2;
    }
    groups.push(tokens.slice(start, end));
    start = end;
  }
  return groups;
}

export interface IpaAnalysis {
  tokens: IpaToken[];
  phonemeIds: string[];
  syllables: number;
  /** chỉ số âm tiết mang trọng âm chính (0-based) */
  stress: number;
  syllableGroups: IpaToken[][];
}

export function analyzeIpa(ipa: string): IpaAnalysis {
  const tokens = tokenizeIpa(ipa);
  const vowels = tokens.filter((t) => t.isVowel);
  let stress = 0;
  vowels.forEach((v, i) => { if (v.stress === 1) stress = i; });
  return {
    tokens,
    phonemeIds: tokens.map((t) => t.id),
    syllables: Math.max(1, vowels.length),
    stress,
    syllableGroups: syllabify(tokens),
  };
}

/** Chuỗi hiển thị cho một âm tiết, ví dụ "wɔ" hoặc "tɚ". */
export function syllableText(group: IpaToken[]): string {
  return group.map((t) => t.symbol).join('');
}

/** Phiên âm có dấu chấm ngăn âm tiết: ˈwɔ·tɚ */
export function ipaWithSyllables(ipa: string): string {
  const { syllableGroups } = analyzeIpa(ipa);
  return syllableGroups
    .map((g) => {
      const v = g.find((t) => t.isVowel);
      const mark = v?.stress === 1 ? 'ˈ' : v?.stress === 2 ? 'ˌ' : '';
      return mark + syllableText(g);
    })
    .join('·');
}
