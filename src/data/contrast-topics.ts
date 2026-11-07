export interface ContrastTopic {
  id: string;
  topic: string;
  vietnamese: string;
  english: string;
  error: string;
  fix: string;
}

/** Bảy khác biệt hệ thống giữa tiếng Việt và tiếng Anh cần dạy ngay từ đầu. */
export const CONTRAST_TOPICS: ContrastTopic[] = [
  {
    id: 'tone', topic: 'Thanh điệu',
    vietnamese: 'Thanh điệu phân biệt nghĩa của âm tiết (ma, mà, má, mạ…).',
    english: 'Không có thanh điệu. Trọng âm từ và ngữ điệu câu mới mang thông tin.',
    error: 'Nhấn đều mọi âm tiết hoặc lên xuống giọng sai chỗ.',
    fix: 'Mỗi từ dài chỉ có một âm tiết nổi bật: to hơn, dài hơn, cao hơn. Các âm tiết còn lại thu nhỏ.',
  },
  {
    id: 'vowel', topic: 'Nguyên âm',
    vietnamese: 'Có hệ nguyên âm và nguyên âm đôi riêng; không có /ɪ/, /æ/, /ʊ/, /ɝ/.',
    english: 'Có những đối lập như /i/–/ɪ/, /æ/–/ɛ/, /u/–/ʊ/ phân biệt nghĩa.',
    error: 'Dùng âm Việt gần giống để thay thế (ship = sheep, bad = bed).',
    fix: 'Học từng cặp đối lập bằng khẩu hình, không chỉ bằng độ dài.',
  },
  {
    id: 'final', topic: 'Âm cuối',
    vietnamese: 'Tập hợp phụ âm cuối bị giới hạn (p, t, c, ch, m, n, ng, nh) và không bật ra.',
    english: 'Có nhiều âm cuối như /s/, /z/, /v/, /θ/, /dʒ/, /l/ và các cụm cuối (/st/, /ld/).',
    error: 'Nuốt hoặc bỏ hẳn âm cuối (five → "fai", feel → "phiu").',
    fix: 'Kết thúc mỗi từ bằng tư thế miệng của âm cuối và nghe lại bản ghi của mình.',
  },
  {
    id: 'cluster', topic: 'Cụm phụ âm',
    vietnamese: 'Không có cụm phụ âm đầu kiểu /str/, /spl/, /skɹ/.',
    english: 'Có thể xuất hiện hai, ba phụ âm liên tiếp ở đầu và cuối từ.',
    error: 'Chèn thêm nguyên âm (street → "sờ-trít", school → "sờ-cun").',
    fix: 'Luyện từ phụ âm cuối cụm lùi dần về trước: /t/ → /st/ → /stɹ/ → street, không thêm "ờ".',
  },
  {
    id: 'stress', topic: 'Trọng âm từ',
    vietnamese: 'Không có trọng âm từ theo cùng cơ chế; mọi âm tiết nặng ngang nhau.',
    english: 'Từ nhiều âm tiết có một trọng âm rõ; đặt sai có thể khiến người nghe không hiểu.',
    error: 'Đọc đều tất cả âm tiết (ba-na-na thay vì ba-NA-na).',
    fix: 'Gõ nhịp khi đọc: âm tiết nhấn gõ mạnh, các âm tiết khác gõ nhẹ.',
  },
  {
    id: 'reduction', topic: 'Giảm âm',
    vietnamese: 'Không tương ứng hoàn toàn với schwa /ə/; nguyên âm luôn đọc đầy đủ.',
    english: 'Âm không nhấn thường giảm thành /ə/; từ chức năng (a, the, to, of) có dạng yếu.',
    error: 'Đọc đầy đủ từng nguyên âm theo mặt chữ, nghe cứng và chậm.',
    fix: 'Coi schwa là "ơ" rất ngắn và lười. Đọc "a cup of tea" với a và of thật nhẹ.',
  },
  {
    id: 'spelling', topic: 'Chính tả',
    vietnamese: 'Chữ viết tương đối phản ánh cách đọc: nhìn chữ là đọc được.',
    english: 'Cùng một chữ có thể biểu diễn nhiều âm (though, through, tough, thought).',
    error: 'Đọc tiếng Anh theo mặt chữ (know → "k-now", would → "wu-l-d").',
    fix: 'Luôn học từ mới kèm IPA; coi phiên âm là "chữ viết thật" của từ.',
  },
];
