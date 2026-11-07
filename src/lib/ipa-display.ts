export type IpaStyle = 'phonemic' | 'dictionary';

/**
 * Hệ nội bộ là âm vị Anh-Mỹ (/i/, /ɹ/). Kiểu từ điển (Cambridge) thêm dấu dài và dùng /r/:
 * sheep /ʃip/ → /ʃiːp/. Hai cách ghi chỉ cùng một nguyên âm.
 */
export function displayIpa(ipa: string, style: IpaStyle): string {
  if (style === 'phonemic' || !ipa) return ipa;
  return ipa
    .replace(/ɔɪ/g, '\u0001')
    .replace(/ɝ/g, 'ɝː')
    .replace(/i(?!ː)/g, 'iː')
    .replace(/u(?!ː)/g, 'uː')
    .replace(/ɑ(?!ː)/g, 'ɑː')
    .replace(/ɔ(?!ː)/g, 'ɔː')
    .replace(/\u0001/g, 'ɔɪ')
    .replace(/ɹ/g, 'r');
}
