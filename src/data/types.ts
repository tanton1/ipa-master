export type PhonemeType = 'vowel' | 'diphthong' | 'consonant';
/** 1 = rất khó với người Việt, 2 = cần chú ý, 3 = gần với tiếng Việt */
export type Priority = 1 | 2 | 3;

export interface Phoneme {
  id: string;
  symbol: string;
  alt?: string;
  type: PhonemeType;
  name: string;
  examples: string[];
  spellings: string[];
  voiced?: boolean;
  place?: string;
  manner?: string;
  /** Hướng dẫn tạo âm đầy đủ */
  how: string;
  /** Câu ngắn dùng trong hướng dẫn từng bước của một từ */
  step: string;
  vnCompare: string;
  errors: string[];
  tip: string;
  priority: Priority;
  contrastId?: string;
}

export interface WordRef {
  word: string;
  ipa: string;
  slug?: string;
}

export interface MinimalPair extends WordRef {
  slug: string;
  /** [âm trong từ này, âm trong từ kia] – id âm vị */
  diff: [string, string];
}

export interface WordEntry {
  id: number;
  word: string;
  slug: string;
  ipa: string;
  phonemes: string[];
  syllables: number;
  stress: number;
  pos: string;
  meaning: string;
  exampleEn: string;
  exampleVi: string;
  group: number;
  pair?: WordRef;
  homophones: string[];
  minimalPairs: MinimalPair[];
  note?: string;
  /** Cụm học G01-U1 … G10-U5 */
  unit: string;
  /** Tuần 1–10, ngày 1–5 (Thứ 2 → Thứ 6) */
  week: number;
  day: number;
  /** L1–L5 theo hạn ngạch 100/125/125/100/50 */
  difficulty: number;
  difficultyScore: number;
  /** Mã lỗi VEI có thể gặp (E01–E10) */
  errorCodes: string[];
  initial: string[];
  nucleus: string;
  final: string[];
  /** Thuộc Gold Set 30 bài chuẩn */
  gold: boolean;
  /** Mọi nội dung hiện là bản nháp chưa qua kiểm duyệt ngữ âm */
  status: 'draft' | 'phonetics_review' | 'audio_review' | 'pedagogy_review' | 'published';
  /** Tần suất NGSL-Spoken: chưa có nguồn nên để null */
  frequencyRank: number | null;
}

export interface WordGroup {
  id: number;
  slug: string;
  title: string;
  short: string;
  description: string;
  examples: string[];
  focus: string;
  tone: string;
}

export const POS_LABEL: Record<string, string> = {
  n: 'Danh từ',
  v: 'Động từ',
  adj: 'Tính từ',
  adv: 'Trạng từ',
  pron: 'Đại từ',
  det: 'Từ hạn định',
  prep: 'Giới từ',
  conj: 'Liên từ',
  num: 'Số từ',
  interj: 'Thán từ',
  modal: 'Động từ khuyết thiếu',
};
