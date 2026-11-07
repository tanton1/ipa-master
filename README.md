# IPA MASTER – English From Vietnamese

Hệ thống huấn luyện phát âm tiếng Anh dành cho người Việt. Bản hiện tại triển khai phần chạy được trên thiết bị của đặc tả 2.0: IPA Foundation 6 cấp độ, thư viện lỗi Việt – Anh (VEI E01–E10), giáo trình 500 từ có phân loại 5 chiều, Gold Set 30 bài chuẩn, bài kiểm tra đầu vào, bản đồ phát âm cá nhân, Word Mastery và ôn tập 1 → 3 → 7 → 14 → 30 ngày. Chưa có AI chấm âm vị, đăng nhập đa thiết bị và CMS (cần backend, xem `docs/architecture.md`).

Bản đang chạy: https://ipa-master-vn.vercel.app

## Lệnh

```bash
npm install
npm run dev        # máy chủ phát triển
npm run words      # kiểm tra content/words/*.txt và sinh src/data/words.json
npm run build      # build tĩnh vào out/ (gồm /data/curriculum.v2.json và /data/word.schema.json)
npm run docs       # sau build: sinh docs/ (Excel 13 sheet, Markdown blueprint, JSON v2, schema)
npm test           # kiểm thử engine chất lượng bản ghi
```

## Cấu trúc chính

| Đường dẫn | Nội dung |
| --- | --- |
| `content/words/01.txt … 10.txt` | Nguồn 500 từ (10 chủ đề × 50). Mỗi dòng: `word\|ipa\|pos\|nghĩa\|câu EN\|câu VI\|cặp từ\|ghi chú`. |
| `scripts/build-words.mts` | Kiểm tra dữ liệu, gắn cụm học, tuần/ngày, mã lỗi E01–E10, độ khó L1–L5 theo hạn ngạch 100/125/125/100/50, cặp tối thiểu. |
| `src/data/units.ts` | 50 cụm học × 10 từ, tuần = chủ đề, ngày = cụm. |
| `src/data/vei.ts` | Thư viện lỗi E01–E10 và quy trình chữa 6 bước. |
| `src/data/gold/` | Gold Set 30 bài chuẩn theo 3 khuôn mẫu: âm khó, trọng âm/giảm âm, cặp từ dễ nhầm. |
| `src/lib/classify.ts` | Phân loại ngữ âm, mã lỗi, điểm độ khó. |
| `src/lib/store.ts` | Tiến độ trên thiết bị: Word Mastery, lịch ôn, thống kê theo âm và nhóm lỗi, hồ sơ. |
| `src/lib/audio-quality.ts` | Engine 1: kiểm tra bản ghi (im lặng, quá nhỏ, ồn, rè, bị cắt). |
| `src/lib/coach.ts` | Engine 3–4: ghép lỗi vào E01–E10 và phản hồi tiếng Việt theo quy tắc 17.4. |
| `src/lib/planner.ts` | Engine 5: chọn việc tiếp theo trong ngày. |
| `src/lib/export.ts` | Dữ liệu giáo trình v2 (46 trường/từ) và JSON Schema. |
| `docs/` | Tài liệu bàn giao cho đội biên soạn và backend. |

## Màn hình

5 tab: Hôm nay, IPA, 500 từ, Luyện nói, Cá nhân. Các màn hình khác nằm trong luồng: Onboarding, Kiểm tra đầu vào, Chi tiết âm, Việt – Anh, Lộ trình 6 cấp độ, Thư viện từ có bộ lọc, Bài học từ 5 bước, Chữa lỗi E01–E10, Trung tâm ôn tập, Speaking Studio có nghe A/B, Bản đồ phát âm.

## Quy ước phiên âm

Hệ nội bộ là âm vị Anh-Mỹ phổ thông: `i ɪ ɛ æ ɑ ɔ ʊ u ʌ ə ɝ ɚ`, `eɪ aɪ oʊ aʊ ɔɪ`, `p b t d k g f v θ ð s z ʃ ʒ h tʃ dʒ m n ŋ l ɹ w j`. Người học có thể chuyển sang kiểu từ điển (`/ʃiːp/`, `/θriː/`); hai kiểu chỉ khác ký hiệu.

## Trước khi phát hành

- Toàn bộ nội dung đang ở trạng thái `draft`: cần giáo viên ngữ âm duyệt IPA, trọng âm, biến thể và hướng dẫn khẩu hình.
- Thay giọng tổng hợp bằng audio bản ngữ có giấy phép; thêm minh hoạ khẩu hình đã kiểm duyệt.
- Gắn tần suất NGSL-Spoken (CC BY-SA 4.0) nếu cần phân biệt "500 từ tuyển chọn" với "500 từ phổ biến nhất".
- Kiểm thử với người học Việt thật; đo Human Agreement trước khi dùng điểm AI để xếp cấp độ.
