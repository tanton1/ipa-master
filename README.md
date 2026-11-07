# IPA MASTER – English From Vietnamese

Ứng dụng học phát âm tiếng Anh dành riêng cho người Việt. Bản MVP Giai đoạn 1 (IPA Foundation): hệ âm, đối chiếu Việt – Anh, khẩu hình, bộ 500 từ cốt lõi, ghi âm tự so sánh và ôn tập ngắt quãng. Chưa có AI chấm điểm (Giai đoạn 2).

## Chạy thử

```bash
npm install
npm run dev
```

Mở `http://localhost:3000` (hoặc cổng được in ra). Giao diện tối ưu cho điện thoại; trên máy tính hãy thu hẹp cửa sổ hoặc dùng chế độ mobile của DevTools.

Bản production (xuất tĩnh vào thư mục `out/`, deploy được lên Firebase Hosting, Vercel, Netlify, GitHub Pages…):

```bash
npm run build
```

## Cấu trúc

| Thư mục | Nội dung |
| --- | --- |
| `content/words/01.txt … 10.txt` | **Nguồn dữ liệu 500 từ** (10 nhóm × 50 từ). Mỗi dòng: `word\|ipa\|pos\|nghĩa\|câu EN\|câu VI\|cặp từ\|ghi chú`. Sửa ở đây rồi chạy `npm run words`. |
| `scripts/build-words.mts` | Đọc nguồn, phân tích IPA, kiểm tra (đủ 50 từ/nhóm, không trùng, ký hiệu hợp lệ, có trọng âm), tự tìm đồng âm và cặp tối thiểu, sinh `src/data/words.json`. |
| `src/data/phonemes/` | Thư viện 40 âm Anh-Mỹ: cách tạo âm, so với tiếng Việt, lỗi thường gặp, mẹo cảm nhận, chữ viết. |
| `src/data/contrast.ts` | 6 bài đối chiếu Việt – Anh (/θ/, /ð/, /ɪ/–/i/, /æ/–/ɛ/, /s/–/z/, /ɹ/–/l/) với cặp từ, bước sửa, cảm nhận. |
| `src/data/contrast-topics.ts` | 7 khác biệt hệ thống (thanh điệu, nguyên âm, âm cuối, cụm phụ âm, trọng âm, giảm âm, chính tả). |
| `src/lib/ipa.ts` | Bộ tách IPA → âm vị, đếm âm tiết, xác định trọng âm, chia âm tiết. |
| `src/lib/errors.ts` | **Vietnamese Pronunciation Error Library**: quy tắc theo âm vị + vị trí → sinh hướng dẫn từng bước và lỗi điển hình cho từng từ. |
| `src/lib/store.ts` | Tiến độ trên `localStorage`: trạng thái từ, ôn tập ngắt quãng (SM-2 rút gọn), âm hay sai, nhật ký ngày. |
| `src/lib/curriculum.ts` | Lộ trình 10 tuần (10 từ/ngày), bài hôm nay, từ theo nhóm/âm. |
| `src/components/MouthDiagram.tsx` | Sơ đồ mặt cắt khoang miệng (SVG) theo từng âm; thay thế tạm cho video khẩu hình 3D. |
| `src/app/` | Trang: `/` (hôm nay), `/ipa`, `/ipa/[id]`, `/contrast`, `/contrast/[id]`, `/words`, `/words/[group]`, `/words/[group]/[slug]`, `/review`. |

## Bài học 5 bước cho mỗi từ

Listen → Understand → Articulate → Record → Apply. Giọng mẫu hiện dùng Web Speech API của trình duyệt (en-US); ghi âm dùng MediaRecorder và chỉ lưu tạm trong phiên, không gửi đi đâu.

## Quy ước phiên âm

General American, ký hiệu: nguyên âm `i ɪ ɛ æ ɑ ɔ ʊ u ʌ ə ɝ ɚ`, nguyên âm đôi `eɪ aɪ oʊ aʊ ɔɪ`, phụ âm `p b t d k g f v θ ð s z ʃ ʒ h tʃ dʒ m n ŋ l ɹ w j`. Trọng âm chính `ˈ`, phụ `ˌ`. Âm vỗ /ɾ/ được ghi chú là biến thể của /t/.

## Việc cần làm trước khi phát hành

- Giáo viên ngữ âm đối soát toàn bộ IPA, cách đọc thay thế và trọng âm với Cambridge/Oxford.
- Thay giọng tổng hợp bằng audio người bản ngữ; thêm video khẩu hình 3 góc nhìn.
- Thử bài học trên người Việt thật và cập nhật thư viện lỗi.
- Giai đoạn 2: AI Pronunciation Coach (STT + đánh giá âm vị + phản hồi tiếng Việt có mức độ tin cậy).
