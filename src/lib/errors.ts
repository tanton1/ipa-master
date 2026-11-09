/**
 * Thư viện lỗi phát âm của người Việt (Vietnamese Pronunciation Error Library).
 * Áp dụng quy tắc theo âm vị + vị trí trong từ để sinh ra:
 *  - hướng dẫn tạo âm từng bước cho một từ
 *  - danh sách lỗi điển hình cần phát hiện
 */
import type { WordEntry } from '@/data/types';
import { getPhoneme } from '@/data/phonemes';
import { VOWEL_IDS } from '@/lib/ipa';
import { codeForPhoneme } from '@/lib/coach';

export type Severity = 'high' | 'medium' | 'low';

export interface Issue {
  id: string;
  title: string;
  detail: string;
  phoneme?: string;
  severity: Severity;
  code?: string;
}

export interface Step {
  n: number;
  phonemeId: string;
  symbol: string;
  text: string;
  stressed: boolean;
}

const VOICED_FINALS = new Set(['b', 'd', 'g', 'v', 'z', 'dh', 'jh', 'zh']);
const HARD_FINALS: Record<string, string> = {
  s: 'Âm cuối /s/ là dấu hiệu số nhiều, sở hữu và ngôi thứ ba. Người Việt hay bỏ hẳn.',
  z: 'Âm cuối /z/ phải rung dây thanh. Đọc thành /s/ hoặc bỏ sẽ đổi nghĩa (rise → rice).',
  v: 'Tiếng Việt không có /v/ cuối. Răng trên chạm môi dưới, rung, không đọc thành /f/ hay bỏ.',
  f: 'Tiếng Việt không có /f/ cuối. Răng chạm môi dưới và thổi hơi ra rõ.',
  th: 'Âm cuối /θ/: đầu lưỡi ra mép răng và thổi hơi. Không đọc thành /t/, /s/ hay /f/.',
  dh: 'Âm cuối /ð/: lưỡi ra mép răng, có rung. Không đọc thành /d/ hay /z/.',
  l: '/l/ cuối ("l tối"): đầu lưỡi vẫn phải chạm lợi trên. Không bỏ, không đổi thành "u".',
  g: 'Giữ /g/ cuối rung dây thanh. Người Việt hay đọc thành /k/ (bag → back).',
  d: 'Giữ /d/ cuối rung dây thanh. Không đọc thành /t/ hay bỏ.',
  b: 'Khép môi tạo /b/ cuối rồi thả nhẹ. Tiếng Việt không có /b/ cuối.',
  k: 'Có điểm chặn /k/ rõ ở cuối từ rồi thả nhẹ. Không thêm nguyên âm.',
  t: 'Có điểm chặn /t/ ở cuối từ. Người Việt hay bỏ hẳn (it → "i").',
  p: 'Khép môi tạo /p/ cuối rồi thả nhẹ, không thêm "ờ".',
  ch: '/tʃ/ cuối: chặn rồi xả hơi. Không đọc thành /ʃ/ hay bỏ.',
  jh: '/dʒ/ cuối: chặn rồi xả hơi, có rung. Không đọc thành /tʃ/.',
  sh: '/ʃ/ cuối: giữ tiếng "sh" đến hết từ.',
  n: '/n/ cuối: đầu lưỡi chạm lợi trên. Người miền Nam hay đổi thành /ŋ/.',
};

const DIFFICULT: Record<string, { title: string; detail: string }> = {
  th: { title: 'Đọc /θ/ thành /t/ hoặc /s/', detail: 'Đầu lưỡi phải ra mép răng và thổi hơi. "th" tiếng Việt là âm /t/ bật hơi, không phải /θ/.' },
  dh: { title: 'Đọc /ð/ thành /d/ hoặc /z/', detail: 'Lưỡi ra mép răng như /θ/ nhưng có rung. Không chặn hơi như "đ".' },
  ih: { title: 'Kéo dài /ɪ/ thành /i/', detail: '/ɪ/ ngắn, hàm và môi thả lỏng. Kéo dài sẽ thành từ khác (ship → sheep).' },
  ae: { title: 'Đọc /æ/ thành /ɛ/', detail: 'Hạ hàm rộng hơn, lưỡi vẫn ở phía trước. Đọc như "e" tiếng Việt sẽ thành từ khác (bad → bed).' },
  uh: { title: 'Đọc /ʊ/ thành /u/ dài', detail: '/ʊ/ ngắn và lỏng, môi tròn nhẹ (pull khác pool).' },
  r: { title: 'Rung lưỡi hoặc đọc /ɹ/ thành /l/, /z/', detail: 'Lưỡi cong lên nhưng không chạm vòm, môi hơi tròn. Không rung lưỡi kiểu Việt.' },
  er: { title: 'Bỏ "màu r" của /ɝ/, /ɚ/', detail: 'Nói "ơ" rồi cong nhẹ đầu lưỡi lên hoặc gồ thân lưỡi về sau (hai cách đều đúng), không chạm vòm. Không đọc thành "ơ" thuần.' },
  v: { title: 'Đọc /v/ thành /j/, /w/ hoặc /b/', detail: 'Răng trên chạm môi dưới và rung. Người miền Nam hay đọc "v" thành "d/j".' },
  z: { title: 'Đọc /z/ thành /s/', detail: 'Cùng khẩu hình /s/ nhưng dây thanh rung như tiếng ong.' },
  sh: { title: 'Đọc /ʃ/ thành /s/', detail: 'Lưỡi lùi hơn /s/, môi hơi tròn. Người miền Bắc hay đọc "sh" thành "x".' },
  jh: { title: 'Đọc /dʒ/ thành /z/ hoặc /tʃ/', detail: 'Chặn như /d/ rồi xả thành /ʒ/, có rung.' },
  zh: { title: 'Đọc /ʒ/ thành /z/', detail: 'Khẩu hình /ʃ/ nhưng rung dây thanh.' },
  y: { title: 'Đọc /j/ thành /z/', detail: 'Bắt đầu từ "i" rồi lướt sang nguyên âm; người miền Bắc hay đọc thành "d/z".' },
  w: { title: 'Nhầm /w/ với /v/', detail: 'Môi tròn chặt như huýt sáo rồi mở nhanh; răng không chạm môi.' },
  schwa: { title: 'Đọc rõ nguyên âm ở âm tiết không nhấn', detail: 'Âm tiết không nhấn phải ngắn, nhẹ, thành /ə/ ("ơ" rất ngắn).' },
  ow: { title: 'Đọc /oʊ/ thành "o/ô" đơn', detail: 'Phải lướt từ /o/ sang /ʊ/, kết thúc bằng môi tròn; không dừng ở một nguyên âm đơn.' },
  aa: { title: 'Thấy chữ o đọc thành "ô"', detail: 'Chữ o trong hot, not, box là /ɑ/: miệng mở rộng, lưỡi lùi, không tròn môi.' },
  ah: { title: 'Thấy chữ u đọc thành "u"', detail: 'Chữ u trong cup, bus là /ʌ/, gần "ă" tiếng Việt.' },
};

function isVowel(id: string): boolean { return VOWEL_IDS.has(id); }

function capitalize(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }

/** Hướng dẫn cách đọc từng âm cho một từ. */
export function articulationSteps(w: WordEntry): Step[] {
  const ids = w.phonemes;
  const vowelIdx = ids.map((id, i) => (isVowel(id) ? i : -1)).filter((i) => i >= 0);
  const stressedTokenIdx = vowelIdx[w.stress] ?? -1;
  const steps: Step[] = [];

  ids.forEach((id, i) => {
    const p = getPhoneme(id);
    if (!p) return;
    const prev = ids[i - 1];
    const next = ids[i + 1];
    const isLast = i === ids.length - 1;
    const stressed = i === stressedTokenIdx;
    let text = capitalize(p.step) + '.';

    if (isVowel(id)) {
      if (w.syllables > 1) {
        if (stressed) text = 'Nhấn mạnh ở đây: ' + p.step + '. Âm tiết này to, dài và cao hơn các âm tiết còn lại.';
        else if (id === 'schwa') text = 'Âm tiết không nhấn: ' + p.step + '.';
        else text = capitalize(p.step) + ' (không nhấn, đọc nhẹ hơn).';
      }
    } else {
      if (isLast) {
        text += ' Kết thúc từ ở đây, không thêm nguyên âm "ờ" phía sau.';
      } else if (i === 0 && next && !isVowel(next)) {
        text += ' Nối thẳng sang âm kế tiếp, không chèn nguyên âm vào giữa cụm.';
      }
      if (id === 't' && prev && next && isVowel(prev) && isVowel(next)) {
        const nextVowelPos = vowelIdx.indexOf(i + 1);
        if (nextVowelPos !== w.stress) text += ' Trong giọng Mỹ, /t/ giữa hai nguyên âm thường thành âm vỗ /ɾ/, nghe như "d" rất nhẹ.';
      }
    }

    steps.push({ n: steps.length + 1, phonemeId: id, symbol: p.symbol, text, stressed });
  });
  return steps;
}

/** Lỗi điển hình cần phát hiện cho một từ. */
export function wordIssues(w: WordEntry): Issue[] {
  const ids = w.phonemes;
  const issues: Issue[] = [];
  const seen = new Set<string>();
  const push = (iss: Issue) => { if (!seen.has(iss.id)) { seen.add(iss.id); issues.push(iss); } };

  // Âm cuối
  const last = ids[ids.length - 1];
  if (last && !isVowel(last)) {
    const p = getPhoneme(last);
    const detail = HARD_FINALS[last];
    if (detail && p) {
      push({
        id: 'final-' + last,
        title: `Bỏ hoặc nuốt âm cuối /${p.symbol}/`,
        detail,
        phoneme: last,
        severity: VOICED_FINALS.has(last) || ['s', 'th', 'l'].includes(last) ? 'high' : 'medium',
        code: VOICED_FINALS.has(last) && w.errorCodes.includes('E04') ? 'E04' : 'E03',
      });
    }
  }

  // Cụm phụ âm cuối
  let tail = 0;
  for (let i = ids.length - 1; i >= 0 && !isVowel(ids[i]); i--) tail++;
  if (tail >= 2) {
    const cluster = ids.slice(ids.length - tail).map((id) => getPhoneme(id)?.symbol ?? id).join('');
    push({ id: 'final-cluster', title: `Bỏ âm trong cụm cuối /${cluster}/`, detail: 'Đọc đủ từng phụ âm trong cụm, âm cuối cùng nhẹ nhưng phải có. Tiếng Việt không có cụm phụ âm cuối nên người Việt thường chỉ giữ một âm.', severity: 'high', code: 'E05' });
  }

  // Cụm phụ âm đầu
  let head = 0;
  for (let i = 0; i < ids.length && !isVowel(ids[i]); i++) head++;
  if (head >= 2) {
    const cluster = ids.slice(0, head).map((id) => getPhoneme(id)?.symbol ?? id).join('');
    push({ id: 'initial-cluster', title: `Chèn nguyên âm vào cụm đầu /${cluster}/`, detail: 'Không đọc "sờ", "tờ" giữa các phụ âm. Luyện từ âm cuối cụm lùi dần về đầu rồi nối liền.', severity: 'high', code: 'E05' });
  }

  // Âm khó theo vị trí bất kỳ
  for (const id of ids) {
    const d = DIFFICULT[id];
    if (!d) continue;
    if (id === 'schwa' && w.syllables === 1) continue;
    const p = getPhoneme(id);
    push({ id: 'sound-' + id, title: d.title, detail: d.detail, phoneme: id, severity: p?.priority === 1 ? 'high' : 'medium', code: codeForPhoneme(id, w) });
  }

  // Trọng âm
  if (w.syllables >= 2) {
    push({ id: 'stress', title: `Đọc đều các âm tiết, không nhấn âm tiết ${w.stress + 1}`, detail: `Từ có ${w.syllables} âm tiết, trọng âm rơi vào âm tiết thứ ${w.stress + 1}. Âm tiết đó to, dài, cao hơn; các âm tiết khác thu nhỏ.`, severity: w.syllables >= 3 ? 'high' : 'medium', code: 'E08' });
  }

  // Cặp từ dễ nhầm
  if (w.pair) {
    push({ id: 'pair', title: `Luyện phân biệt ${w.word} và ${w.pair.word}`, detail: `/${w.ipa}/ khác /${w.pair.ipa}/. Nghe và nói cả hai từ cạnh nhau cho đến khi tự tin phân biệt.`, severity: 'medium' });
  }

  // Ghi chú riêng của từ (chữ câm, ngoại lệ chính tả)
  if (w.note) {
    push({ id: 'note', title: 'Chính tả đánh lừa', detail: w.note, severity: 'low' });
  }

  const order: Record<Severity, number> = { high: 0, medium: 1, low: 2 };
  return issues.sort((a, b) => order[a.severity] - order[b.severity]).slice(0, 6);
}

/** Các âm vị "rủi ro" của một từ (để gợi ý người học tự đánh dấu). */
export function riskyPhonemes(w: Pick<WordEntry, 'phonemes'>): string[] {
  const out: string[] = [];
  const last = w.phonemes[w.phonemes.length - 1];
  for (const id of w.phonemes) {
    const p = getPhoneme(id);
    if (!p) continue;
    if (p.priority === 1 || id === last || DIFFICULT[id]) {
      if (!out.includes(id)) out.push(id);
    }
  }
  return out;
}
