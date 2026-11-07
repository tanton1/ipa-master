/**
 * Xuất dữ liệu giáo trình v2 (Product Data Specification) cho backend / CMS.
 * Mỗi bản ghi từ là DỮ LIỆU NỘI DUNG dùng chung; tiến độ học viên lưu ở bảng riêng.
 */
import { WORDS } from './curriculum';
import { articulationSteps, wordIssues } from './errors';
import { displayIpa } from './ipa-display';
import { getPhoneme, PHONEMES } from '@/data/phonemes';
import { UNITS } from '@/data/units';
import { GROUPS } from '@/data/groups';
import { VEI } from '@/data/vei';
import { GOLD, getGold } from '@/data/gold';
import { CONTRAST_LESSONS } from '@/data/contrast';
import { DIFFICULTY_LABEL, DIFFICULTY_QUOTA } from './classify';

export const SCHEMA_VERSION = '2.0.0';

const LESSON_FLOW = ['identity', 'ipa_breakdown', 'mouth_guide', 'native_audio', 'contrast_practice', 'recording', 'sentence_practice', 'mastery_review'];

export function wordRecordV2(w: (typeof WORDS)[number]) {
  const gold = getGold(w.slug);
  const id = `W${String(w.id).padStart(3, '0')}`;
  const sym = (ids: string[]) => ids.map((x) => getPhoneme(x)?.symbol ?? x);
  return {
    word_id: id,
    word: w.word,
    lemma: w.slug,
    chapter_id: `G${String(w.group).padStart(2, '0')}`,
    unit_id: w.unit,
    unit_title: UNITS.find((u) => u.id === w.unit)?.title ?? null,
    week_number: w.week,
    learning_day: w.day,
    learning_order: w.id,
    meaning_vi: w.meaning,
    part_of_speech: w.pos,
    frequency_tier: null as string | null,
    frequency_rank: w.frequencyRank,
    frequency_source: null as string | null,
    difficulty_level: w.difficulty,
    difficulty_score: w.difficultyScore,
    accent: 'en-US',
    ipa_primary_draft: `/${w.ipa}/`,
    ipa_dictionary_style_draft: `/${displayIpa(w.ipa, 'dictionary')}/`,
    phonemes_draft: sym(w.phonemes),
    phoneme_ids: w.phonemes,
    syllable_count_draft: w.syllables,
    stress_syllable_draft: w.syllables > 1 ? w.stress + 1 : null,
    initial_consonants: sym(w.initial),
    nucleus_vowel: getPhoneme(w.nucleus)?.symbol ?? null,
    final_consonants: sym(w.final),
    candidate_error_codes: w.errorCodes,
    mouth_guide_vi_draft: gold ? gold.breakdown.map((b) => `/${b.sym}/: ${b.label} – ${b.note}`) : articulationSteps(w).map((s) => `/${s.symbol}/: ${s.text}`),
    vietnamese_error_hint_draft: gold ? [gold.vnContrast, ...gold.errors] : wordIssues(w).map((i) => `${i.code ? `[${i.code}] ` : ''}${i.title}`),
    blend_drill_vi: gold?.drill ?? null,
    sample_sentence_en: gold?.sentences[0].en ?? w.exampleEn,
    sample_sentence_vi: gold?.sentences[0].vi ?? w.exampleVi,
    extra_sentences: gold ? gold.sentences.slice(1) : [],
    minimal_pairs: [...(w.pair ? [{ word: w.pair.word, ipa: `/${w.pair.ipa}/`, source: 'editor' }] : []), ...w.minimalPairs.filter((m) => m.slug !== w.pair?.slug).slice(0, 6).map((m) => ({ word: m.word, ipa: `/${m.ipa}/`, source: 'auto', diff: sym(m.diff) }))],
    homophones: w.homophones,
    assessment_prompt_vi: gold?.criteria ?? null,
    lesson_flow_ids: LESSON_FLOW,
    word_audio_asset_id: null as string | null,
    example_context_audio_asset_id: null as string | null,
    articulation_visual_asset_id: null as string | null,
    gold_set: w.gold,
    lesson_template: gold?.type ?? null,
    content_status: w.status,
    source_tag: 'ipa-master-draft-v1',
    editorial_notes: w.note ?? null,
    content_version: 1,
  };
}

export function buildCurriculum() {
  const words = WORDS.map(wordRecordV2);
  return {
    meta: {
      name: 'IPA MASTER – Core 500 Curriculum',
      schema_version: SCHEMA_VERSION,
      accent: 'en-US (General American)',
      generated_from: 'content/words/*.txt + src/data/*',
      status_note: 'Toàn bộ nội dung là bản nháp (draft). IPA, trọng âm và hướng dẫn khẩu hình cần giáo viên ngữ âm duyệt trước khi xuất bản. Chưa có audio và minh hoạ; tần suất NGSL-Spoken chưa được gắn.',
      counts: {
        words: words.length,
        chapters: GROUPS.length,
        units: UNITS.length,
        phonemes: PHONEMES.length,
        error_patterns: VEI.length,
        gold_set: GOLD.length,
        contrast_lessons: CONTRAST_LESSONS.length,
        sentences: words.length + GOLD.length,
        audio_assets: 0,
        reviewed_ipa: 0,
      },
      difficulty_quota: Object.fromEntries(DIFFICULTY_LABEL.map((l, i) => [l, DIFFICULTY_QUOTA[i]])),
    },
    chapters: GROUPS.map((g) => ({ chapter_id: `G${g.slug}`, title: g.title, focus: g.focus, week_number: g.id })),
    units: UNITS.map((u) => ({ unit_id: u.id, chapter_id: `G${String(u.group).padStart(2, '0')}`, index: u.index, title: u.title, focus: u.focus, week_number: u.group, learning_day: u.index, word_ids: words.filter((w) => w.unit_id === u.id).map((w) => w.word_id) })),
    phonemes: PHONEMES.map((p) => ({ id: p.id, ipa: p.symbol, alt: p.alt ?? null, type: p.type, name_vi: p.name, voiced: p.voiced ?? null, place: p.place ?? null, manner: p.manner ?? null, priority_for_vietnamese: p.priority, examples: p.examples, spellings: p.spellings, articulation_vi: p.how, vietnamese_comparison_vi: p.vnCompare, common_errors_vi: p.errors, tip_vi: p.tip, contrast_lesson_id: p.contrastId ?? null })),
    error_patterns: VEI.map((e) => ({ code: e.code, title: e.title, short: e.short, examples: e.examples, phoneme_ids: e.phonemes, contrast_lesson_id: e.contrastId ?? null, why_vi: e.why, fix_vi: e.fix, region_note_vi: e.region ?? null, remediation: { identify: e.identify, isolate: e.isolate, blend: e.blend, phrases: e.phrases, sentences: e.sentences, retest_days: [1, 3] }, word_ids: words.filter((w) => w.candidate_error_codes.includes(e.code)).map((w) => w.word_id) })),
    contrast_lessons: CONTRAST_LESSONS,
    gold_set: GOLD,
    words,
  };
}

const str = { type: 'string' };
const strOrNull = { type: ['string', 'null'] };
const arrStr = { type: 'array', items: str };

/** JSON Schema (draft 2020-12) cho một bản ghi từ v2. */
export function wordSchema() {
  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: 'https://ipa-master-vn.vercel.app/data/word.schema.json',
    title: 'IPA Master – Word record v2',
    description: 'Dữ liệu nội dung của một từ. Không chứa tiến độ học viên. Trường *_draft phải qua kiểm duyệt trước khi content_status = published.',
    type: 'object',
    additionalProperties: false,
    required: ['word_id', 'word', 'lemma', 'chapter_id', 'unit_id', 'week_number', 'learning_day', 'meaning_vi', 'part_of_speech', 'difficulty_level', 'accent', 'ipa_primary_draft', 'phonemes_draft', 'syllable_count_draft', 'candidate_error_codes', 'sample_sentence_en', 'sample_sentence_vi', 'lesson_flow_ids', 'content_status', 'content_version'],
    properties: {
      word_id: { type: 'string', pattern: '^W\\d{3}$' },
      word: str, lemma: str,
      chapter_id: { type: 'string', pattern: '^G(0[1-9]|10)$' },
      unit_id: { type: 'string', pattern: '^G(0[1-9]|10)-U[1-5]$' },
      unit_title: strOrNull,
      week_number: { type: 'integer', minimum: 1, maximum: 10 },
      learning_day: { type: 'integer', minimum: 1, maximum: 5 },
      learning_order: { type: 'integer', minimum: 1, maximum: 500 },
      meaning_vi: str,
      part_of_speech: { enum: ['n', 'v', 'adj', 'adv', 'pron', 'det', 'prep', 'conj', 'num', 'interj', 'modal'] },
      frequency_tier: { enum: ['core', 'high', 'extended', null] },
      frequency_rank: { type: ['integer', 'null'] },
      frequency_source: strOrNull,
      difficulty_level: { type: 'integer', minimum: 1, maximum: 5 },
      difficulty_score: { type: 'number' },
      accent: { enum: ['en-US', 'en-GB'] },
      ipa_primary_draft: { type: 'string', pattern: '^/.+/$' },
      ipa_dictionary_style_draft: { type: 'string', pattern: '^/.+/$' },
      phonemes_draft: arrStr, phoneme_ids: arrStr,
      syllable_count_draft: { type: 'integer', minimum: 1 },
      stress_syllable_draft: { type: ['integer', 'null'], minimum: 1 },
      initial_consonants: arrStr, nucleus_vowel: strOrNull, final_consonants: arrStr,
      candidate_error_codes: { type: 'array', items: { enum: VEI.map((e) => e.code) }, uniqueItems: true },
      mouth_guide_vi_draft: arrStr,
      vietnamese_error_hint_draft: arrStr,
      blend_drill_vi: { type: ['array', 'null'], items: str },
      sample_sentence_en: str, sample_sentence_vi: str,
      extra_sentences: { type: 'array', items: { type: 'object', properties: { en: str, vi: str }, required: ['en', 'vi'] } },
      minimal_pairs: { type: 'array', items: { type: 'object', properties: { word: str, ipa: str, source: { enum: ['editor', 'auto'] }, diff: arrStr }, required: ['word', 'ipa', 'source'] } },
      homophones: arrStr,
      assessment_prompt_vi: strOrNull,
      lesson_flow_ids: { type: 'array', items: { enum: LESSON_FLOW } },
      word_audio_asset_id: strOrNull, example_context_audio_asset_id: strOrNull, articulation_visual_asset_id: strOrNull,
      gold_set: { type: 'boolean' },
      lesson_template: { enum: ['hard-sound', 'stress', 'pair', null] },
      content_status: { enum: ['draft', 'phonetics_review', 'audio_review', 'pedagogy_review', 'published'] },
      source_tag: str, editorial_notes: strOrNull,
      content_version: { type: 'integer', minimum: 1 },
    },
    allOf: [
      {
        description: 'Điều kiện xuất bản: chặn publish nếu thiếu học liệu bắt buộc.',
        if: { properties: { content_status: { const: 'published' } } },
        then: { properties: { word_audio_asset_id: str, example_context_audio_asset_id: str }, required: ['word_audio_asset_id', 'example_context_audio_asset_id', 'assessment_prompt_vi'] },
      },
    ],
  };
}
