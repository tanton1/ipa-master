# Rà soát nội dung và giao diện – 07/11/2026

Phạm vi: 500 từ trong `content/words`, nội dung bài học (Gold Set, VEI, Việt – Anh) và 15 màn hình chính ở khung 390 px, sáng và tối.

## 1. Nội dung

| Hạng mục | Kết quả kiểm tra | Xử lý |
| --- | --- | --- |
| Phiên âm 500 từ | Đúng hệ Anh-Mỹ, nhất quán ký hiệu (`ɹ`, `ɝ/ɚ`, không có dấu dài). Mọi từ nhiều âm tiết đều có dấu nhấn. | Giữ nguyên |
| Câu ví dụ | 500/500 câu chứa từ đích hoặc dạng chia của nó, không câu nào quá 12 từ. | Giữ nguyên |
| Nghĩa tiếng Việt | 4 cặp trùng nghĩa: to/arrive, from/word, not/no, five/year. Người học không phân biệt được trong bài nghe chọn nghĩa. | Thêm phần làm rõ, ví dụ "năm (số 5)" và "năm (thời gian)" |
| Tên cụm học | 4 tên không khớp từ bên trong: cụm có I/you/he nhưng tên là "Mạo từ", cụm có how nhưng tên là "Giới từ", cụm 10-4 ghi /θ/–/ð/ nhưng không có từ nào chứa /ð/. | Đổi tên và trọng tâm theo đúng 10 từ |
| Cách mô tả lỗi | 19 chỗ phiên cả từ tiếng Anh bằng chữ Việt ("sơ-trít", "ti-chơ", "a-bao", "phai"). Đặc tả cấm cách này. | Đổi sang IPA của dạng đọc sai, ví dụ street thành /sə.tɹit/. Giữ "ơ" khi nói về nguyên âm chèn thêm vì đó là đối chiếu âm Việt – Anh. |

## 2. Giao diện

| Vấn đề | Màn hình | Xử lý |
| --- | --- | --- |
| Nhãn tiếng Anh xen giữa giao diện tiếng Việt: Word detail, Lesson • VEI, Speaking Studio, Phoneme Mastery Map, Mastery TB, Gold Set | Bài học từ, Chữa lỗi, Luyện nói, Cá nhân | Việt hoá toàn bộ |
| Ngày dạng ISO "2026-10-29" | Luyện nói, Bài học từ | Hiển thị "hôm nay", "ngày mai", "3 ngày nữa", "29/10" |
| Ký hiệu IPA bị ngắt dòng thành "/" và "ð/" | Hôm nay, Chữa lỗi, Luyện nói | Giữ mỗi /…/ trên một dòng |
| Trạng thái từ chỉ thể hiện bằng chấm màu, không có chú giải | Danh sách từ | Nhãn chữ có màu: Đang học, Đang củng cố, Cần luyện lại, Thành thạo |
| Nhãn "Ưu tiên cao" gán theo thứ tự, âm 90 điểm vẫn có thể bị gắn | Hôm nay | Gán theo điểm: dưới 55, dưới 75, còn lại |
| Tên chủ đề dài bị cắt "Con người, gia đình, c…" | 500 từ | Cho xuống dòng, bỏ mã G01 trùng với nhãn tuần |
| Nút "Lưu lộ trình" mờ mà không nói thiếu gì | Thiết lập lộ trình | Báo mục còn thiếu ngay dưới nút |
| Nhãn "Không rung" bị đường vẽ thanh quản đè | Sơ đồ khẩu hình | Dời nhãn sang trái |
| Thẻ "Lộ trình 6 cấp độ" và tab "Phụ âm hữu thanh" bị tràn | Bảng IPA | Rút gọn chữ |

Không thấy tràn ngang ở màn hình nào. Giao diện tối có độ tương phản tốt.

## 3. Việc còn lại

- Giáo viên ngữ âm duyệt IPA, ghi chú và hướng dẫn khẩu hình. Toàn bộ vẫn ở trạng thái nháp.
- Ghi âm bằng micro thật trên điện thoại chưa được thử.
- Danh sách 50 từ trong một chủ đề khá dài. Có thể gập theo cụm nếu người học thấy khó theo dõi.

## 4. Nâng cấp theo bản đánh giá 08/11/2026

Triển khai các hạng mục P0 và phần UX có thể làm bằng mã nguồn. Phiên bản nội dung: 2026.11.08.

| Hạng mục trong bản đánh giá | Đã làm |
| --- | --- |
| 4.1 Dạy từ đơn nhưng chưa đủ cách đọc trong câu | Thêm `content/forms.txt`: 30 từ chức năng, 62 dạng đọc (mạnh, yếu, trước nguyên âm, mất /h/, rút gọn n't, biến thể /wɪθ – wɪð/), mỗi dạng có điều kiện dùng, ví dụ và phiên âm ví dụ. Bài học từ hiển thị thẻ "Đọc riêng lẻ khác đọc trong câu" ở bước Nghe (kèm bài nghe đố dạng nào) và bước Áp dụng (chọn cụm, ghi âm). Thẻ từ ghi rõ các dạng trong câu. |
| 4.1 Quy tắc a/an | Sửa nghĩa và ghi chú của "an": dùng trước ÂM nguyên âm (an hour, a university). Ghi chú "the" nêu cùng quy tắc. |
| 4.3 Nguy cơ và lỗi thực tế | Thêm mức bằng chứng: Chưa kiểm tra, Đang đánh giá (dưới 3 lượt), Đang luyện, Lỗi đã quan sát, Đã kiểm tra ổn. Dùng ở danh sách lỗi, trang lỗi, bản đồ nhóm lỗi, bản đồ âm (ô viền đứt khi chưa đủ lượt), trang Hôm nay. Số từ theo mã lỗi ghi là "có nguy cơ". E10 không còn được tính từ bài nghe từ đơn; trang E10 ghi rõ chỉ đánh giá ở cấp câu. |
| 4.4 Hướng dẫn chưa khớp mục tiêu | Bài đối chiếu chỉ gợi ý đặt tay lên cổ khi hai âm khác nhau về rung thanh; cặp /ɪ/–/i/ chuyển sang cảm nhận lưỡi, hàm và độ căng. Bài /ɝ/ và các hướng dẫn liên quan nêu cả hai cách tạo âm (cong đầu lưỡi hoặc gồ thân lưỡi). |
| 4.5 Công thức thành thạo | Thành phần chưa kiểm tra không tính là 0: điểm chuẩn hoá lại trên phần đã có dữ liệu, kèm số thành phần và cảnh báo "chưa đủ để kết luận" khi dưới 65% trọng số. Nhãn "Phát âm từ (tự chấm)", "Dùng trong câu (tự chấm)". |
| 7 UX Hôm nay | Một việc chính duy nhất kèm thời lượng ước tính, nút Bắt đầu; ba số liệu: từ hôm nay, từ đến hạn ôn, âm yếu. Các việc còn lại xếp vào "Việc tiếp theo". |
| 7 UX Từ vựng | Bộ lọc thêm "Đến hạn ôn" và "Đã lưu"; nút lưu từ trên thẻ từ; trang Cá nhân liên kết tới hai bộ lọc này. |
| 7 UX Cá nhân | Mục "Bạn đã làm được gì": nghe đúng x/y lần, tự chấm đạt x/y lần theo từng âm, kèm mức bằng chứng. |
| 8 Kiểm thử dữ liệu và phiên bản | Script build kiểm tra `forms.txt`: từ phải có trong 500 từ, ít nhất 2 dạng, IPA phân tích được, ví dụ phải chứa từ, một dạng phải trùng phiên âm chính. Thêm `CONTENT_VERSION`, xuất vào JSON/Excel (`context_forms`, `content_version`, schema 2.1.0). |

### Chưa làm, cần nguồn lực ngoài mã nguồn

- Giọng mẫu người thật hoặc audio đã kiểm duyệt (P0): vẫn dùng giọng tổng hợp của trình duyệt. Giọng tổng hợp đọc dạng yếu không ổn định, nên bài nghe đố dạng đọc đã ghi chú hạn chế này.
- Kiểm duyệt 500 phiên âm và 62 dạng đọc bởi giáo viên ngữ âm (P0): toàn bộ vẫn ở trạng thái nháp.
- Gắn thứ hạng tần suất NGSL-Spoken (P0): trường `frequencyRank` đã có trong schema nhưng chưa có dữ liệu; cần tải và đối chiếu danh sách có giấy phép CC BY-SA 4.0.
- Chấm phát âm tự động đã kiểm định (P1), tài khoản và đồng bộ (P2), kiểm chứng với người học thật (P3).

## 5. Mở rộng lên 3000 từ và cụm từ hay dùng (09/11/2026)

Phiên bản nội dung: 2026.11.09. Schema xuất dữ liệu: 2.2.0.

| Hạng mục | Đã làm |
| --- | --- |
| Số từ | 3000 từ trong 60 nhóm × 50 từ, chia 3 giai đoạn: Nền tảng (G01–G10, 500 từ cốt lõi giữ nguyên), Mở rộng (G11–G30, 1000 từ), Thành thạo (G31–G60, 1500 từ). Mỗi nhóm là một tuần, 5 cụm × 10 từ. |
| Nội dung từ mới | Mỗi từ có IPA Anh-Mỹ, loại từ, nghĩa, câu ví dụ kèm dịch, ghi chú phát âm khi cần (chữ câm, đổi trọng âm, đồng âm, đuôi -ed). Nhóm 11–60 khai báo tên, trọng tâm, mô tả và tên 5 cụm ngay trong `content/words/NN.txt` (dòng `@group` và `= cụm`). |
| Cụm từ hay dùng | `content/phrases/NN.txt`: 3203 cụm cho đủ 3000 từ ở thời điểm 09/11 (xem mục 6 cho bản bổ sung lên 6000 cụm). Danh từ thường có 2 cụm danh từ, các từ loại khác có 1 cụm kết hợp. Mỗi cụm có nghĩa, câu mẫu tiếng Anh và bản dịch. Bài học hiển thị thẻ "Cụm từ hay dùng" ở bước Hiểu và thẻ "Câu mẫu ứng dụng" (chọn cụm, nghe thường/chậm, ghi âm) ở bước Áp dụng. |
| Kiểm tra tự động | Build kiểm tra: đúng 50 từ và 5 cụm mỗi nhóm, không trùng từ, IPA phân tích được, từ nhiều âm tiết có đúng một trọng âm chính; cụm phải chứa từ gốc, câu mẫu phải chứa nguyên cụm, tối đa 3 cụm mỗi từ. Độ khó L1–L5 xếp hạng trong từng giai đoạn theo tỉ lệ 20/25/25/20/10 %. |
| Hiệu năng | Trình duyệt chỉ tải bản gọn `words-index.json` (khoảng 270 KB chưa nén). Bản đầy đủ `words.json` (cặp tối thiểu, đồng âm, ghi chú, cụm từ) chỉ dùng khi build trang từ và xuất tài liệu. |
| Giao diện | Thư viện từ nhóm theo giai đoạn, có tiến độ từng giai đoạn. Lộ trình trong trang Cá nhân thành 60 tuần. Các chỗ ghi cứng "500 từ" đổi sang số thực tế; tab dưới đổi tên "Từ vựng". |
| Tài liệu | Excel có sheet "13 Phrases"; JSON có `common_phrases`, `stage_id`, `meta.stages`. |

### Giới hạn của bản mở rộng

- 2500 từ mới được chọn theo chủ đề và ước lượng mức phổ biến, chưa đối chiếu với NGSL hay danh sách tần suất có giấy phép. Thứ tự học vì vậy chưa phản ánh tần suất thật.
- Toàn bộ phiên âm, cụm từ và câu mẫu là bản nháp do máy soạn, cần giáo viên duyệt. Build chỉ bắt được lỗi định dạng và ký hiệu, không bắt được phiên âm sai mà vẫn hợp lệ.
- Gold Set 30 bài chuẩn, bài đối chiếu và dạng đọc theo ngữ cảnh vẫn chỉ phủ phần 500 từ đầu.

## 6. Bổ sung cụm từ thứ hai cho mọi từ (10/11/2026)

Phiên bản nội dung: 2026.11.10.

| Hạng mục | Đã làm |
| --- | --- |
| Cụm từ hay dùng | Thêm 2797 cụm, nâng tổng số từ 3203 lên 6000. Cả 3000 từ giờ có đúng 2 cụm, mỗi cụm có nghĩa, câu mẫu tiếng Anh và bản dịch. Trước đó 2797 từ chỉ có 1 cụm. |
| Cách chọn cụm | Cụm thứ hai khác cụm thứ nhất về kiểu kết hợp (ví dụ danh từ + danh từ rồi động từ + danh từ) để người học thấy từ trong hai ngữ cảnh. Với từ đổi trọng âm theo từ loại (permit, protest, import, estimate, upgrade, graduate, separate, update), cụm dùng đúng từ loại của mục từ để phiên âm khớp với cách đọc trong câu. |
| Câu mẫu | Không câu mẫu mới nào trùng với câu ví dụ của từ, câu mẫu của cụm cũ, hay câu mẫu của một từ khác trong toàn bộ 3000 từ. |
| Kiểm tra tự động | Build báo lỗi nếu có từ dưới 2 cụm (`MIN_PHRASES = 2` trong `scripts/build-words.mts`), bên cạnh các kiểm tra cũ: cụm chứa từ gốc, câu mẫu chứa nguyên cụm, tối đa 3 cụm. |

### Vẫn còn mở

- 2797 cụm mới cũng là bản nháp do máy soạn, chưa có giáo viên duyệt. Kiểm tra tự động không đánh giá được độ tự nhiên của câu hay độ chính xác của bản dịch.
- Khoảng 2000 từ chưa có ghi chú phát âm riêng và khoảng 1550 từ chưa có cặp tối thiểu.
- Gold Set, bài đối chiếu và dạng đọc theo ngữ cảnh vẫn chỉ phủ 500 từ đầu.
