/**
 * Sinh bộ tài liệu bàn giao trong docs/ từ out/data/*.json (chạy sau `next build`):
 *  - docs/IPA-Master-Curriculum.xlsx  (workbook nhiều sheet cho đội biên soạn)
 *  - docs/curriculum-blueprint.md     (đặc tả giáo trình dạng Markdown)
 *  - docs/curriculum.v2.json, docs/word.schema.json (bản sao để import backend)
 * Chạy: npm run docs
 */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import ExcelJS from 'exceljs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'out', 'data');
const DOCS = join(ROOT, 'docs');
mkdirSync(DOCS, { recursive: true });

const data = JSON.parse(readFileSync(join(OUT, 'curriculum.v2.json'), 'utf8'));
copyFileSync(join(OUT, 'curriculum.v2.json'), join(DOCS, 'curriculum.v2.json'));
copyFileSync(join(OUT, 'word.schema.json'), join(DOCS, 'word.schema.json'));
const schema = JSON.parse(readFileSync(join(OUT, 'word.schema.json'), 'utf8'));

const j = (v) => (Array.isArray(v) ? v.map((x) => (typeof x === 'object' ? JSON.stringify(x) : x)).join(' | ') : v ?? '');
const WEEKDAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6'];
const ACTIVITY = ['Học mới + nghe phân biệt', 'Học mới + luyện khẩu hình', 'Học mới + đọc trong câu', 'Học mới + luyện sửa lỗi', 'Học mới + ôn tập'];

/* ------------------------------ Excel ------------------------------ */
const wb = new ExcelJS.Workbook();
wb.creator = 'IPA Master';
wb.created = new Date();

function sheet(name, columns, rows, widths = {}) {
  const ws = wb.addWorksheet(name, { views: [{ state: 'frozen', ySplit: 1 }] });
  ws.columns = columns.map((c) => ({ header: c.h, key: c.k, width: widths[c.k] ?? c.w ?? 18 }));
  rows.forEach((r) => ws.addRow(r));
  const head = ws.getRow(1);
  head.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  head.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
  head.alignment = { vertical: 'middle', wrapText: true };
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: columns.length } };
  ws.eachRow((row, i) => { if (i > 1) row.alignment = { vertical: 'top', wrapText: true }; });
  return ws;
}

const m = data.meta;
sheet('00 README', [{ h: 'Mục', k: 'a', w: 30 }, { h: 'Nội dung', k: 'b', w: 110 }], [
  { a: 'Tên', b: m.name },
  { a: 'Phiên bản schema', b: m.schema_version },
  { a: 'Giọng chuẩn', b: m.accent },
  { a: 'Trạng thái', b: m.status_note },
  ...Object.entries(m.counts).map(([k, v]) => ({ a: `Số lượng: ${k}`, b: v })),
  { a: 'Nguyên tắc', b: 'Bản ghi từ là dữ liệu nội dung dùng chung; tiến độ học viên lưu ở bảng riêng (user_word_progress). Trường *_draft phải qua kiểm duyệt trước khi xuất bản.' },
  { a: 'Quy trình xuất bản', b: 'draft → phonetics_review → audio_review → pedagogy_review → published. Hệ thống phải chặn publish khi thiếu audio từ, audio câu hoặc tiêu chí đánh giá.' },
]);

const wordCols = Object.keys(data.words[0]).map((k) => ({ h: k, k, w: ['mouth_guide_vi_draft', 'vietnamese_error_hint_draft', 'blend_drill_vi', 'minimal_pairs'].includes(k) ? 60 : k.length > 16 ? 22 : 16 }));
sheet('01 Words (500)', wordCols, data.words.map((w) => Object.fromEntries(Object.entries(w).map(([k, v]) => [k, j(v)]))));

sheet('02 Units (50)', [{ h: 'unit_id', k: 'unit_id' }, { h: 'chapter_id', k: 'chapter_id', w: 10 }, { h: 'Tuần', k: 'week_number', w: 8 }, { h: 'Ngày', k: 'day', w: 10 }, { h: 'Tên cụm', k: 'title', w: 32 }, { h: 'Trọng tâm', k: 'focus', w: 50 }, { h: 'Hoạt động', k: 'act', w: 28 }, { h: '10 từ', k: 'words', w: 70 }],
  data.units.map((u) => ({ ...u, day: WEEKDAYS[u.learning_day - 1], act: ACTIVITY[u.learning_day - 1], words: u.word_ids.map((id) => data.words.find((w) => w.word_id === id)?.word).join(', ') })));

const plan = [];
for (let wk = 1; wk <= 10; wk++) {
  for (let d = 1; d <= 5; d++) { const u = data.units.find((x) => x.week_number === wk && x.learning_day === d); plan.push({ week: wk, day: WEEKDAYS[d - 1], n: 10, unit: `${u.unit_id} ${u.title}`, act: ACTIVITY[d - 1] }); }
  plan.push({ week: wk, day: 'Thứ 7', n: 0, unit: '—', act: 'Kiểm tra 50 từ và các âm trọng tâm' });
  plan.push({ week: wk, day: 'Chủ nhật', n: 0, unit: '—', act: 'Ôn cá nhân hoá / nghỉ' });
}
sheet('03 Weekly plan', [{ h: 'Tuần', k: 'week', w: 8 }, { h: 'Ngày', k: 'day', w: 10 }, { h: 'Số từ mới', k: 'n', w: 10 }, { h: 'Cụm học', k: 'unit', w: 40 }, { h: 'Hoạt động', k: 'act', w: 40 }], plan);

sheet('04 Phonemes', ['id', 'ipa', 'type', 'name_vi', 'voiced', 'place', 'manner', 'priority_for_vietnamese', 'examples', 'spellings', 'articulation_vi', 'vietnamese_comparison_vi', 'common_errors_vi', 'tip_vi'].map((k) => ({ h: k, k, w: k.endsWith('_vi') ? 50 : 14 })),
  data.phonemes.map((p) => Object.fromEntries(Object.entries(p).map(([k, v]) => [k, j(v)]))));

sheet('05 Error codes', [{ h: 'Mã', k: 'code', w: 8 }, { h: 'Nhóm', k: 'title', w: 30 }, { h: 'Ví dụ', k: 'ex', w: 26 }, { h: 'Vì sao', k: 'why_vi', w: 60 }, { h: 'Cách sửa', k: 'fix_vi', w: 60 }, { h: 'Vùng miền', k: 'region_note_vi', w: 40 }, { h: 'Số từ', k: 'n', w: 8 }],
  data.error_patterns.map((e) => ({ ...e, ex: e.examples.join(', '), n: e.word_ids.length })));

const rem = [];
for (const e of data.error_patterns) {
  const r = e.remediation;
  rem.push({ code: e.code, step: '1. Nghe và nhận diện', content: r.identify.map((x) => `${x.a} /${x.aIpa}/ ↔ ${x.b} /${x.bIpa}/`).join(' | ') });
  rem.push({ code: e.code, step: '2. Luyện âm riêng lẻ', content: `${r.isolate.focus}: ${r.isolate.howTo} (${r.isolate.words.join(', ')})` });
  rem.push({ code: e.code, step: '3. Ghép vào từ', content: `${r.blend.word}: ${r.blend.steps.join(' → ')}` });
  rem.push({ code: e.code, step: '4. So sánh A/B', content: 'Ghi âm, nghe mẫu rồi bản ghi, tự đánh giá' });
  rem.push({ code: e.code, step: '5. Cụm từ và câu', content: `${r.phrases.join(', ')} | ${r.sentences.map((s) => s.en).join(' | ')}` });
  rem.push({ code: e.code, step: '6. Kiểm tra lại', content: `Sau ${r.retest_days.join(' và ')} ngày` });
}
sheet('06 Remediation', [{ h: 'Mã', k: 'code', w: 8 }, { h: 'Bước', k: 'step', w: 24 }, { h: 'Nội dung', k: 'content', w: 110 }], rem);

sheet('07 Gold Set (30)', [{ h: 'Từ', k: 'slug', w: 12 }, { h: 'Khuôn mẫu', k: 'type', w: 12 }, { h: 'Trọng tâm', k: 'focus', w: 30 }, { h: 'Mã lỗi', k: 'codes', w: 16 }, { h: 'Giải mã', k: 'bd', w: 50 }, { h: 'So với tiếng Việt', k: 'vnContrast', w: 60 }, { h: 'Lỗi cần tránh', k: 'err', w: 60 }, { h: 'Bài ghép âm', k: 'drill', w: 60 }, { h: 'Từ gây nhiễu', k: 'listen', w: 20 }, { h: 'Câu', k: 'sent', w: 60 }, { h: 'Tiêu chí đạt', k: 'criteria', w: 50 }],
  data.gold_set.map((g) => ({ ...g, codes: g.codes.join(', '), bd: g.breakdown.map((b) => `/${b.sym}/ ${b.label}: ${b.note}`).join(' | '), err: g.errors.join(' | '), drill: g.drill.join(' → '), listen: g.listen ? `${g.listen.word} /${g.listen.ipa}/` : '', sent: g.sentences.map((s) => `${s.en} — ${s.vi}`).join(' | ') })));

const pairs = [];
for (const w of data.words) for (const p of w.minimal_pairs) pairs.push({ word: w.word, ipa: w.ipa_primary_draft, pair: p.word, pipa: p.ipa, source: p.source, diff: (p.diff ?? []).join(' ↔ ') });
sheet('08 Minimal pairs', [{ h: 'Từ', k: 'word' }, { h: 'IPA', k: 'ipa' }, { h: 'Cặp', k: 'pair' }, { h: 'IPA cặp', k: 'pipa' }, { h: 'Nguồn', k: 'source', w: 10 }, { h: 'Âm khác', k: 'diff', w: 12 }], pairs);

const lv = [1, 2, 3, 4, 5].map((l) => ({ level: Object.keys(m.difficulty_quota)[l - 1], quota: Object.values(m.difficulty_quota)[l - 1], actual: data.words.filter((w) => w.difficulty_level === l).length, sample: data.words.filter((w) => w.difficulty_level === l).slice(0, 15).map((w) => w.word).join(', ') }));
sheet('09 Difficulty', [{ h: 'Mức', k: 'level', w: 18 }, { h: 'Hạn ngạch', k: 'quota', w: 10 }, { h: 'Thực tế', k: 'actual', w: 10 }, { h: 'Ví dụ', k: 'sample', w: 90 }], lv);

sheet('10 Schema fields', [{ h: 'Trường', k: 'f', w: 32 }, { h: 'Kiểu', k: 't', w: 30 }, { h: 'Bắt buộc', k: 'r', w: 10 }],
  Object.entries(schema.properties).map(([f, d]) => ({ f, t: d.enum ? `enum: ${d.enum.join(', ')}` : Array.isArray(d.type) ? d.type.join(' | ') : d.type, r: schema.required.includes(f) ? 'Có' : '' })));

const QA = [
  'Phiên âm, nghĩa, từ loại, trọng âm và biến thể đã được duyệt',
  'Có audio từ đơn và ít nhất một câu ví dụ có audio hợp lệ, được cấp phép thương mại',
  'Hướng dẫn khẩu hình khớp với âm đang dạy (vị trí lưỡi, rung thanh, luồng hơi)',
  'Bài nghe có đáp án rõ ràng; cặp từ dễ nhầm được phân loại đúng',
  'Có bài tập áp dụng trong câu và cấu hình ôn tập',
  'Biến thể phát âm hợp lệ không bị coi là sai',
  'Không dùng cách viết tiếng Việt để phiên âm (ví dụ "thinh-kờ")',
  'Có người biên tập, người duyệt và lịch sử phiên bản',
];
sheet('11 QA checklist', [{ h: '#', k: 'n', w: 5 }, { h: 'Tiêu chí bắt buộc trước khi PUBLISHED', k: 'c', w: 90 }, { h: 'Người duyệt', k: 'who', w: 18 }, { h: 'Ngày', k: 'd', w: 12 }], QA.map((c, i) => ({ n: i + 1, c })));

sheet('12 Production plan', [{ h: 'Đợt', k: 'p', w: 8 }, { h: 'Tên', k: 'n', w: 26 }, { h: 'Phạm vi', k: 's', w: 90 }], [
  { p: '01', n: 'Gold Set – 30 từ chuẩn', s: 'Đã biên soạn nháp 30 bài (xem sheet 07). Cần duyệt ngữ âm, thu audio, minh hoạ khẩu hình.' },
  { p: '02', n: 'Pilot – 50 từ đầu tiên', s: 'G01 (Tuần 1). Kiểm thử trải nghiệm thật với người học: IPA, nghe, khẩu hình, ghi âm, ôn tập.' },
  { p: '03', n: 'Scale – 150 từ', s: 'G02–G03. Chuẩn hoá dây chuyền theo lô, tự kiểm schema, duyệt IPA chuyên môn.' },
  { p: '04', n: 'Production – 350 từ', s: 'G04–G10. Mở rộng toàn bộ nhóm lỗi, tái sử dụng minh hoạ khẩu hình và dạng bài nghe.' },
  { p: '05', n: 'Complete – 500 từ', s: 'Đủ câu ví dụ, audio, bài kiểm tra, liên kết lỗi và quy trình review.' },
  { p: '06', n: 'Release & Optimize', s: 'Kiểm thử với người học thật, theo dõi âm sai, mức độ nhớ lâu, cải thiện giáo trình.' },
]);

await wb.xlsx.writeFile(join(DOCS, 'IPA-Master-Curriculum.xlsx'));

/* ------------------------------ Markdown ------------------------------ */
const L = [];
L.push(`# IPA MASTER – Curriculum Blueprint ${m.schema_version}`, '');
L.push(`> ${m.status_note}`, '');
L.push('## 1. Số liệu', '', '| Hạng mục | Số lượng |', '| --- | --- |');
for (const [k, v] of Object.entries(m.counts)) L.push(`| ${k} | ${v} |`);
L.push('', '## 2. Phân bổ độ khó', '', '| Mức | Hạn ngạch | Thực tế |', '| --- | --- | --- |');
for (const r of lv) L.push(`| ${r.level} | ${r.quota} | ${r.actual} |`);
L.push('', 'Độ khó được xếp hạng tự động từ đặc trưng ngữ âm (âm khó với người Việt, cụm phụ âm, âm cuối hữu thanh, số âm tiết, schwa, chữ câm) rồi chia theo hạn ngạch. Cần hiệu chỉnh sau thử nghiệm với học viên thật.', '');
L.push('## 3. Bài học 8 thành phần', '', '1. Word Identity  2. IPA Breakdown  3. Mouth Guide  4. Native Audio  5. Contrast Practice  6. Recording  7. Sentence Practice  8. Mastery Review', '');
L.push('Ba khuôn mẫu sản xuất: âm khó (three), trọng âm và giảm âm (about), cặp từ dễ nhầm (ship/sheep).', '');
L.push('## 4. Mười nhóm lỗi VEI', '', '| Mã | Nhóm | Ví dụ | Số từ |', '| --- | --- | --- | --- |');
for (const e of data.error_patterns) L.push(`| ${e.code} | ${e.title} | ${e.examples.join(', ')} | ${e.word_ids.length} |`);
L.push('', 'Quy trình chữa lỗi: nghe nhận diện → luyện âm riêng → ghép từ → so sánh A/B → cụm từ và câu → kiểm tra lại sau 1 và 3 ngày.', '');
L.push('## 5. 50 cụm học × 10 từ', '');
for (const ch of data.chapters) {
  L.push(`### ${ch.chapter_id} · ${ch.title} (Tuần ${ch.week_number})`, '');
  for (const u of data.units.filter((x) => x.chapter_id === ch.chapter_id)) {
    const ws = u.word_ids.map((id) => data.words.find((w) => w.word_id === id));
    L.push(`**${u.unit_id} · ${WEEKDAYS[u.learning_day - 1]} · ${u.title}** — ${u.focus}`, '');
    L.push(ws.map((w) => `${w.word} ${w.ipa_primary_draft} (L${w.difficulty_level}${w.gold_set ? ', Gold' : ''})`).join(' · '), '');
  }
}
L.push('## 6. Gold Set – 30 bài chuẩn', '');
for (const g of data.gold_set) {
  const w = data.words.find((x) => x.lemma === g.slug);
  L.push(`### ${w.word} ${w.ipa_primary_draft} — ${g.focus}`, '');
  L.push(`- Mã lỗi: ${g.codes.join(', ')}`);
  L.push(`- Giải mã: ${g.breakdown.map((b) => `/${b.sym}/ ${b.label} (${b.note})`).join('; ')}`);
  L.push(`- So với tiếng Việt: ${g.vnContrast}`);
  L.push(`- Lỗi cần tránh: ${g.errors.join(' ')}`);
  L.push(`- Bài ghép âm: ${g.drill.join(' → ')}`);
  L.push(`- Câu: ${g.sentences.map((s) => `${s.en} (${s.vi})`).join(' / ')}`);
  L.push(`- Tiêu chí đạt: ${g.criteria}`, '');
}
L.push('## 7. Quy định nghiệm thu', '');
QA.forEach((q, i) => L.push(`${i + 1}. ${q}`));
L.push('', 'Hệ thống phải chặn publish nếu thiếu học liệu bắt buộc (xem điều kiện `allOf` trong word.schema.json).', '');
writeFileSync(join(DOCS, 'curriculum-blueprint.md'), L.join('\n'), 'utf8');

console.log(`✓ docs/: IPA-Master-Curriculum.xlsx (${wb.worksheets.length} sheet), curriculum-blueprint.md, curriculum.v2.json (${data.words.length} từ, ${Object.keys(data.words[0]).length} trường/từ), word.schema.json`);
