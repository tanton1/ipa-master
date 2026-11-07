/**
 * 50 cụm học × 10 từ. Cụm thứ u của nhóm g = Tuần g, Ngày u (Thứ 2 → Thứ 6).
 * Tên cụm đặt theo nội dung thật của 10 từ trong content/words/NN.txt.
 */
export interface Unit {
  id: string; // "G01-U1"
  group: number;
  index: number; // 1..5
  title: string;
  focus: string;
}

const RAW: [number, string, string][][] = [
  [
    [1, 'Mạo từ, từ chỉ định và I, you, he', 'Âm /ð/ và dạng yếu của the, a, an'],
    [2, 'Đại từ nhân xưng và my', '/ʃ/ trong she, /ð/ trong they, them'],
    [3, 'Từ sở hữu và từ để hỏi', 'Âm cuối /z/ trong his, /ɹ/ trong your, their'],
    [4, 'How và giới từ', 'Dạng yếu của to, of, for, from; /θ/ trong with'],
    [5, 'Từ nối và lượng từ', 'Schwa trong about; âm cuối /l/ trong all'],
  ],
  [
    [1, 'Động từ cốt lõi', '/θ/ trong think, âm cuối /v/ trong have, give'],
    [2, 'Nhận thức và mong muốn', 'Âm cuối /v/ trong love, cụm cuối /sk/ trong ask'],
    [3, 'Giao tiếp và học tập', 'Chữ câm trong talk, listen, write; /tʃ/ cuối'],
    [4, 'Hành động hằng ngày', '/ɪ/–/i/ trong sit, cụm đầu /st/'],
    [5, 'Hoạt động thường ngày', 'Âm cuối /z/ trong use, /ɪ/–/i/ trong live'],
  ],
  [
    [1, 'Số đếm 1–10', '/θɹ/ trong three, âm cuối /v/, /ks/'],
    [2, 'Số lớn và số thứ tự', '/θ/ trong thirty, third, thousand; trọng âm'],
    [3, 'Ngày và buổi', 'Trọng âm today, tomorrow; schwa'],
    [4, 'Giờ, tháng, thứ', '/nθ/ trong month, h câm trong hour'],
    [5, 'Mùa và tần suất', 'Trọng âm từ hai âm tiết, /ɚ/ cuối'],
  ],
  [
    [1, 'Người và gia đình', '/ð/ trong mother, father; /æ/ trong man'],
    [2, 'Các mối quan hệ', '/ð/ trong brother; chữ gh câm trong daughter'],
    [3, 'Nghề nghiệp và khuôn mặt', '/θ/ cuối trong mouth, tooth; /tʃ/'],
    [4, 'Bộ phận cơ thể', '/θ/ cuối trong teeth; /ɹ/ và /l/'],
    [5, 'Cơ thể và đời sống', 'k câm trong knee; âm cuối /dʒ/, /s/'],
  ],
  [
    [1, 'Nhà và phòng', '/ɛ/–/æ/ trong bed; âm cuối /ɹ/'],
    [2, 'Vật dụng', 'Âm cuối /g/ trong bag; /ks/ trong box'],
    [3, 'Thiết bị và đồ bếp', 'Âm vỗ /ɾ/ trong water, bottle; k câm trong knife'],
    [4, 'Đồ dùng cá nhân', 'Âm cuối /z/ trong shoes, clothes; /ʃ/'],
    [5, 'Sinh hoạt trong nhà', 'Cụm cuối /mp/, /ɹz/; trọng âm từ hai âm tiết'],
  ],
  [
    [1, 'Nơi chốn và tự nhiên', 'Cụm /stɹ/ trong street; /dʒ/ cuối'],
    [2, 'Địa điểm trong thành phố', 'Cụm /sk/ trong school; trọng âm hotel'],
    [3, 'Công trình và phương tiện', '/tʃ/ trong church; /ʃ/ trong station'],
    [4, 'Du lịch và phương hướng', '/ɹ/–/l/ trong right; /θ/ cuối trong north'],
    [5, 'Hướng và di chuyển', '/v/–/w/ trong west; cụm /ɹld/ trong world'],
  ],
  [
    [1, 'Bữa ăn', '/i/–/ɪ/ trong eat; /s/–/z/ trong rice'],
    [2, 'Món ăn', '/ʃ/ trong fish; trọng âm banana, vegetable'],
    [3, 'Đồ uống và sinh hoạt', 'Cụm cuối /lk/ trong milk; /ʃ/ trong wash'],
    [4, 'Sức khỏe', '/lθ/ trong healthy; trọng âm medicine'],
    [5, 'Hương vị và vệ sinh', '/lθ/ cuối trong health; /ð/ trong breathe'],
  ],
  [
    [1, 'Cảm xúc', '/æ/ trong happy, sad, bad; cụm cuối /zd/'],
    [2, 'Kích thước và trạng thái', '/ld/ trong old, cold; /ŋ/ cuối'],
    [3, 'Đặc điểm và so sánh', 'Trọng âm beautiful, difficult; /tʃ/'],
    [4, 'Đánh giá', 'Trọng âm important, interesting; w câm trong wrong'],
    [5, 'Tính cách và cảm nhận', 'Cụm /stɹ/ trong strong; /aɪ/'],
  ],
  [
    [1, 'Ngôn ngữ và lớp học', '/ŋg/ trong English, language; /tʃ/ trong question'],
    [2, 'Học tập', 'Trọng âm vocabulary, pronunciation; /gz/ trong exam'],
    [3, 'Môn học và internet', 'Trọng âm university, history; /dʒ/ cuối'],
    [4, 'Thiết bị số', 'Cụm /skɹ/ trong screen; trọng âm từ ghép'],
    [5, 'Công nghệ', 'Trọng âm technology; /ʃ/ trong machine'],
  ],
  [
    [1, 'Lời nói thường dùng', 'Trọng âm hello; /θ/ trong thank; ngữ điệu'],
    [2, 'Từ nối và từ đọc bất quy tắc', 'though, through, thought, tough'],
    [3, 'Chữ câm và nguyên âm dễ nhầm', 'l câm trong would; /ɪ/–/i/ ship–sheep'],
    [4, 'Phụ âm dễ nhầm', '/s/–/z/ (price–prize), /θ/ cuối (bath, path), /f/–/v/ (fan–van)'],
    [5, 'Tổng ôn cặp từ tối thiểu', '/ʊ/–/u/, /ɪ/–/i/, /æ/–/ʌ/, /ð/–/d/'],
  ],
];

export const UNITS: Unit[] = RAW.flatMap((units, gi) =>
  units.map(([index, title, focus]) => ({
    id: `G${String(gi + 1).padStart(2, '0')}-U${index}`,
    group: gi + 1,
    index,
    title,
    focus,
  })),
);

export function getUnit(id: string): Unit | undefined {
  return UNITS.find((u) => u.id === id);
}

export const WEEKDAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6'];
export const WEEKDAY_ACTIVITY = [
  'Học mới + nghe phân biệt',
  'Học mới + luyện khẩu hình',
  'Học mới + đọc trong câu',
  'Học mới + luyện sửa lỗi',
  'Học mới + ôn tập',
];
