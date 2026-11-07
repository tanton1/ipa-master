# IPA MASTER 2.0 – Kiến trúc và hợp đồng dữ liệu

Tài liệu này ghi lại phần nào của đặc tả 2.0 đã chạy trong ứng dụng hiện tại (Next.js xuất tĩnh, dữ liệu trên thiết bị) và hợp đồng cho phần cần backend.

## 1. Trạng thái triển khai

| Hạng mục đặc tả | Trạng thái | Vị trí |
| --- | --- | --- |
| 6 cấp độ IPA Foundation (12.1) | Đã có trang lộ trình, liên kết tới bài tương ứng | `src/app/levels` |
| Bảng âm theo nhóm cách tạo âm (12.2) | Đã có, 11 nhóm | `src/components/IpaChart.tsx` |
| Hai quy ước phiên âm (/i/ và /iː/) | Đã có, chọn trong Cá nhân | `src/lib/ipa-display.ts` |
| Thư viện lỗi VEI E01–E10 (13) | Đã có, quy trình 6 bước, kiểm tra lại ngày 1 và 3 | `src/data/vei.ts`, `src/app/errors` |
| 5 chiều phân loại 500 từ (14.1) | Chủ đề, ngữ âm, độ khó, mã lỗi: có. Tần suất: để trống (chưa gắn NGSL-Spoken) | `scripts/build-words.mts`, `src/lib/classify.ts` |
| Ma trận độ khó 100/125/125/100/50 (14.2) | Có, kiểm tra tự động khi build | như trên |
| Bài học 8 thành phần (15) | Có trong 5 bước; audio là giọng tổng hợp | `src/components/WordLesson.tsx` |
| 5 tab, 15 màn hình (16) | 14/15 có; màn hình 11 (AI Feedback) là phản hồi dựa trên tự đánh giá | `src/app/*` |
| Onboarding, bài kiểm tra đầu vào (16.1–16.2) | Có | `src/app/onboarding`, `src/app/diagnostic` |
| Bản đồ phát âm cá nhân (16.3) | Có, điểm làm mượt qua nhiều lần | `src/components/ProfileClient.tsx` |
| Engine Audio Quality (17) | Chạy thật trên trình duyệt | `src/lib/audio-quality.ts` |
| Engine Pronunciation Evaluator | Chưa có: cần backend và dịch vụ chấm | hợp đồng ở mục 4 |
| Engine Error Mapper + Pedagogical Feedback | Có, theo quy tắc 17.4 | `src/lib/coach.ts` |
| Engine Adaptive Planner | Có | `src/lib/planner.ts` |
| Word Mastery Score, lịch 1-3-7-14-30 (18) | Có | `src/lib/store.ts` |
| Firebase, đăng nhập đa thiết bị (19) | Chưa có: dữ liệu đang ở localStorage | mục 2–3 |
| CMS và quy trình duyệt (20) | Chưa có: trạng thái `content_status` đã có trong dữ liệu | mục 5 |

## 2. Collection Firestore đề xuất

| Collection | Khoá | Ghi chú |
| --- | --- | --- |
| `users/{uid}` | uid | `profile` (goal, level, region, ipaStyle, confidence, diagnosticAt), `settings` |
| `phonemes/{id}` | id âm vị (`th`, `ih`…) | Import từ `curriculum.v2.json › phonemes` |
| `error_patterns/{code}` | E01–E10 | `remediation` gồm identify, isolate, blend, phrases, sentences, retest_days |
| `words/{word_id}` | W001–W500 | Đúng schema `word.schema.json` |
| `word_pronunciations/{word_id}_{locale}` | | Tách khi có thêm en-GB và biến thể |
| `minimal_pairs/{pair_id}` | | `source: editor | auto`, `diff` |
| `lessons/{lesson_id}` | | Sinh từ `lesson_flow_ids` + Gold Set template |
| `practice_attempts/{uid}/items/{id}` | | Mỗi lần ghi âm: word_id, quality metrics, kết quả theo âm, nguồn (self/provider) |
| `user_word_progress/{uid}/words/{word_id}` | | Đúng kiểu `WordProgress` trong `src/lib/store.ts` |
| `review_queue/{uid}/items/{word_id}` | | `due`, `status` |
| `learning_paths/{uid}` | | Đầu ra Adaptive Planner |
| `content_versions/{word_id}/v/{n}` | | Lịch sử chỉnh sửa và người duyệt |

Nguyên tắc: bản ghi từ là dữ liệu nội dung dùng chung; tiến độ học viên luôn ở collection riêng theo `uid`.

## 3. API

| API | Mô tả | Hiện tại |
| --- | --- | --- |
| `GET /api/phonemes` | Bảng IPA | Tĩnh: `/data/curriculum.v2.json › phonemes` |
| `GET /api/words` | Lọc, tìm kiếm | Tĩnh: `/data/curriculum.v2.json › words` |
| `GET /api/words/:id` | Chi tiết từ | Tĩnh |
| `GET /api/lessons/:id` | Cấu trúc bài học | Tĩnh (`lesson_flow_ids`) |
| `POST /api/pronunciation/assess` | Gửi audio đánh giá | Chưa có |
| `POST /api/attempts` | Lưu kết quả luyện | localStorage |
| `GET /api/progress` | Tiến độ cá nhân | localStorage |
| `GET /api/reviews/today` | Danh sách ôn | localStorage |
| `POST /api/reviews/complete` | Cập nhật ôn | localStorage |
| `GET /api/learning-path` | Lộ trình | `planToday()` phía client |
| `POST /api/admin/content/publish` | Phát hành | Chưa có |

Các API ghi phải xác thực và phân quyền. Khoá dịch vụ chấm phát âm chỉ nằm ở server.

## 4. Hợp đồng Pronunciation Evaluator

Yêu cầu (server, không lộ khoá ra frontend):

```json
{ "word_id": "W055", "reference_text": "think", "locale": "en-US", "audio": "<webm/opus hoặc wav 16 kHz>", "consent_research": false }
```

Phản hồi đã chuẩn hoá về id âm vị nội bộ, để đưa thẳng vào `buildFeedback()`:

```json
{
  "provider": "azure-pronunciation-assessment",
  "overall": { "accuracy": 72, "fluency": null, "prosody": null },
  "phonemes": [
    { "phonemeId": "th", "score": 38, "confidence": 0.82, "source": "provider" },
    { "phonemeId": "ih", "score": 89, "confidence": 0.9, "source": "provider" }
  ]
}
```

Quy tắc bắt buộc (đã cài trong `src/lib/coach.ts`):

1. Bản ghi không qua Audio Quality → yêu cầu ghi lại, không chấm.
2. `confidence < 0.6` → bỏ qua; nếu không còn gì → "chưa xác định rõ".
3. Tối đa 2 âm ưu tiên mỗi lượt.
4. Không hạ điểm chỉ vì không giống hoàn toàn một giọng bản xứ.
5. Không khen trái với kết quả; khi đạt, nêu rõ âm đã kiểm và chuyển sang câu.

Điểm của nhà cung cấp là kết quả mô hình, không phải bằng chứng vị trí lưỡi. Cần đo Human Agreement với người đánh giá có chuyên môn trên người học Việt Nam trước khi dùng để xếp cấp độ.

## 5. Quy trình nội dung

`draft → phonetics_review → audio_review → pedagogy_review → published`. Schema chặn `published` nếu thiếu `word_audio_asset_id`, `example_context_audio_asset_id` hoặc `assessment_prompt_vi`.

## 6. Bản ghi âm và quyền riêng tư

Hiện tại bản ghi chỉ nằm trong bộ nhớ trang (object URL), không tải lên đâu. Khi có server: lưu ngắn hạn theo mặc định, cho phép xoá, và xin đồng ý riêng nếu dùng bản ghi cho nghiên cứu hoặc cải thiện mô hình.
