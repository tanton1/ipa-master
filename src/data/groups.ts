import type { WordGroup } from './types';

export const GROUPS: WordGroup[] = [
  { id: 1, slug: '01', title: 'Đại từ, mạo từ, giới từ', short: 'Từ chức năng', description: 'Những từ xuất hiện trong gần như mọi câu nói. Đọc nhẹ, đúng âm /ð/ và dạng yếu.', examples: ['the', 'a', 'this', 'with'], focus: 'Âm /ð/, dạng yếu và schwa', tone: 'indigo' },
  { id: 2, slug: '02', title: 'Động từ thiết yếu', short: 'Động từ', description: 'Động từ dùng hằng ngày. Chú ý âm cuối /v/, /k/, /z/ và cụm phụ âm.', examples: ['have', 'make', 'think', 'read'], focus: 'Âm cuối và /θ/', tone: 'violet' },
  { id: 3, slug: '03', title: 'Số đếm, thời gian', short: 'Số & thời gian', description: 'Số và các mốc thời gian. Luyện /θ/ trong three, thirty và trọng âm từ nhiều âm tiết.', examples: ['three', 'today', 'month'], focus: 'Trọng âm và /θ/', tone: 'sky' },
  { id: 4, slug: '04', title: 'Con người, gia đình, cơ thể', short: 'Con người', description: 'Từ chỉ người và bộ phận cơ thể. Nhiều âm /ð/ (mother, father) và âm cuối /θ/.', examples: ['woman', 'children', 'mouth'], focus: '/ð/ giữa từ và /θ/ cuối', tone: 'rose' },
  { id: 5, slug: '05', title: 'Nhà cửa, đồ vật', short: 'Đồ vật', description: 'Đồ vật quanh nhà. Luyện âm cuối /g/, /z/ và âm vỗ /ɾ/ trong water, bottle.', examples: ['room', 'phone', 'water'], focus: 'Âm cuối hữu thanh', tone: 'amber' },
  { id: 6, slug: '06', title: 'Địa điểm, giao thông', short: 'Đi lại', description: 'Nơi chốn và phương tiện. Cụm phụ âm đầu /stɹ/ và âm /ɹ/ kiểu Mỹ.', examples: ['city', 'airport', 'travel'], focus: 'Cụm phụ âm và /ɹ/', tone: 'teal' },
  { id: 7, slug: '07', title: 'Ăn uống, sinh hoạt, sức khỏe', short: 'Sinh hoạt', description: 'Thức ăn, sinh hoạt và sức khỏe. Phân biệt /ɪ/–/i/, /s/–/z/ trong rice, rise, eat.', examples: ['breakfast', 'healthy', 'eat'], focus: '/ɪ/–/i/ và /s/–/z/', tone: 'lime' },
  { id: 8, slug: '08', title: 'Tính từ, cảm xúc', short: 'Tính từ', description: 'Tính từ miêu tả và cảm xúc. Nguyên âm dễ nhầm /æ/–/ɛ/ và cụm cuối /ld/, /ŋ/.', examples: ['happy', 'different', 'strong'], focus: '/æ/–/ɛ/', tone: 'orange' },
  { id: 9, slug: '09', title: 'Học tập, công nghệ', short: 'Học & công nghệ', description: 'Từ nhiều âm tiết về học tập và công nghệ. Luyện trọng âm và nguyên âm yếu.', examples: ['English', 'sentence', 'practice'], focus: 'Trọng âm từ dài', tone: 'cyan' },
  { id: 10, slug: '10', title: 'Giao tiếp, từ dễ nhầm', short: 'Từ dễ nhầm', description: 'Từ giao tiếp và các cặp từ tối thiểu kinh điển: ship–sheep, rice–rise, right–light.', examples: ['though', 'through', 'ship', 'sheep'], focus: 'Cặp từ tối thiểu', tone: 'fuchsia' },
];

export function getGroup(idOrSlug: number | string): WordGroup | undefined {
  return GROUPS.find((g) => g.id === Number(idOrSlug) || g.slug === idOrSlug);
}
