/**
 * Engine 3 – Error Mapper và Engine 4 – Pedagogical Feedback.
 * Nhận kết quả theo âm vị (từ người học tự đánh giá hoặc từ một dịch vụ chấm ở giai đoạn sau),
 * ghép vào hệ lỗi E01–E10 và tạo phản hồi tiếng Việt theo quy tắc mục 17.4.
 */
import type { WordEntry } from '@/data/types';

/** Các trường cần cho phản hồi: có ở bản đầy đủ, hoặc tính từ bản gọn bằng withPositions(). */
export type CoachWord = Pick<WordEntry, 'word' | 'exampleEn' | 'errorCodes' | 'initial' | 'final'>;
import { getPhoneme } from '@/data/phonemes';
import { VEI, getVei, type ErrorCode } from '@/data/vei';
import { QUALITY_MESSAGE, type AudioQuality } from './audio-quality';

export interface PhonemeAssessment {
  phonemeId: string;
  /** 0–100, null nếu không chấm được */
  score: number | null;
  /** 0–1 */
  confidence: number;
  source: 'self' | 'provider';
}

export type FeedbackKind = 'retry' | 'uncertain' | 'fix' | 'pass';

export interface FeedbackFocus { phonemeId: string; symbol: string; code?: ErrorCode; codeTitle?: string; tip: string }

export interface CoachFeedback {
  kind: FeedbackKind;
  title: string;
  message: string;
  focus: FeedbackFocus[];
  next: string[];
}

export const MIN_CONFIDENCE = 0.6;
export const WEAK_SCORE = 60;
export const MAX_FOCUS = 2;

/** Mã lỗi phù hợp nhất cho một âm trong một từ. */
export function codeForPhoneme(id: string, word?: CoachWord): ErrorCode | undefined {
  const candidates = VEI.filter((e) => e.phonemes.includes(id)).map((e) => e.code);
  if (word) {
    if (word.final.includes(id) && word.errorCodes.includes('E03') && ['s', 'z', 'v', 'f', 'l', 'd', 'g', 'k', 't'].includes(id)) {
      if (['z', 'v', 'd', 'g'].includes(id) && word.errorCodes.includes('E04')) return 'E04';
      return 'E03';
    }
    if ((word.initial.length >= 2 && word.initial.includes(id)) || (word.final.length >= 2 && word.final.includes(id))) {
      const c = candidates.find((x) => word.errorCodes.includes(x));
      if (c) return c;
      if (word.errorCodes.includes('E05')) return 'E05';
    }
    const inWord = candidates.find((c) => word.errorCodes.includes(c));
    if (inWord) return inWord;
  }
  return candidates[0];
}

function priorityOf(id: string): number {
  return getPhoneme(id)?.priority ?? 3;
}

export function buildFeedback(word: CoachWord, assessments: PhonemeAssessment[], quality?: AudioQuality | null): CoachFeedback {
  // Quy tắc 1: bản ghi không đủ rõ → yêu cầu ghi lại, không chấm.
  if (quality && !quality.ok) {
    return {
      kind: 'retry',
      title: 'Hãy ghi âm lại',
      message: quality.blocking.map((i) => QUALITY_MESSAGE[i]).join(' '),
      focus: [],
      next: ['Ghi âm lại ở nơi yên tĩnh, nói rõ từ 2–3 lần.'],
    };
  }

  // Quy tắc 2: chỉ dùng kết quả đủ tin cậy.
  const reliable = assessments.filter((a) => a.score !== null && a.confidence >= MIN_CONFIDENCE);
  if (!reliable.length) {
    return {
      kind: 'uncertain',
      title: 'Chưa xác định rõ',
      message: 'Chưa đủ thông tin đáng tin cậy để kết luận âm nào chưa đúng. Hãy nghe A/B (mẫu rồi bản ghi của bạn) và đánh dấu âm bạn thấy khác.',
      focus: [],
      next: ['Nghe mẫu và bản ghi xen kẽ 2 lần.', 'Đánh dấu âm nghe khác mẫu, nếu có.'],
    };
  }

  // Quy tắc 3: tối đa 2 lỗi ưu tiên.
  const weak = reliable
    .filter((a) => (a.score as number) < WEAK_SCORE)
    .sort((a, b) => priorityOf(a.phonemeId) - priorityOf(b.phonemeId) || (a.score as number) - (b.score as number));
  const seen = new Set<string>();
  const focus: FeedbackFocus[] = [];
  for (const a of weak) {
    if (seen.has(a.phonemeId)) continue;
    seen.add(a.phonemeId);
    const p = getPhoneme(a.phonemeId);
    const code = codeForPhoneme(a.phonemeId, word);
    focus.push({ phonemeId: a.phonemeId, symbol: p?.symbol ?? a.phonemeId, code, codeTitle: code ? getVei(code)?.title : undefined, tip: p ? `${p.step.charAt(0).toUpperCase()}${p.step.slice(1)}.` : '' });
    if (focus.length >= MAX_FOCUS) break;
  }
  const extra = weak.length - focus.length;

  if (!focus.length) {
    // Quy tắc 6: không khen chung chung; chỉ nêu những gì đã kiểm và chuyển sang câu.
    const checked = Array.from(new Set(reliable.map((a) => getPhoneme(a.phonemeId)?.symbol ?? a.phonemeId)));
    return {
      kind: 'pass',
      title: 'Các âm đã kiểm đều đạt',
      message: `Âm được kiểm: ${checked.map((s) => `/${s}/`).join(', ')}. Bước tiếp theo là giữ đúng các âm này khi nói cả câu.`,
      focus: [],
      next: ['Chuyển sang luyện từ trong câu.', 'Ôn lại theo lịch để kiểm tra khả năng duy trì.'],
    };
  }

  const main = focus[0];
  return {
    kind: 'fix',
    title: `Âm cần ưu tiên: /${focus.map((f) => f.symbol).join('/, /')}/`,
    message: `${main.tip}${extra > 0 ? ` Còn ${extra} âm khác cần chú ý, sẽ luyện ở lượt sau để không quá tải.` : ''}`,
    focus,
    next: [
      `Nghe /${main.symbol}/ trong từ mẫu.`,
      `Luyện /${main.symbol}/ riêng lẻ.`,
      `Nói "${word.word}" thêm hai lần.`,
      `Thử câu: ${word.exampleEn}`,
    ],
  };
}

/** Chuyển kết quả tự đánh giá của người học thành dạng đánh giá âm vị. */
export function selfAssessments(checked: string[], weak: string[], listenedAB: boolean): PhonemeAssessment[] {
  return checked.map((id) => ({
    phonemeId: id,
    score: weak.includes(id) ? 30 : 80,
    // Người học tự nhận thấy lỗi: tin cậy cao. Không đánh dấu nhưng chưa nghe A/B: tin cậy thấp.
    confidence: weak.includes(id) ? 0.9 : listenedAB ? 0.7 : 0.5,
    source: 'self' as const,
  }));
}
