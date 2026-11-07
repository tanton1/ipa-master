/**
 * Vietnamese Error Intelligence (VEI): 10 nhóm lỗi phát âm của người Việt.
 * Dùng làm giả thuyết học tập; cá nhân hoá bằng bài kiểm tra đầu vào và lịch sử luyện.
 */
export type ErrorCode = 'E01' | 'E02' | 'E03' | 'E04' | 'E05' | 'E06' | 'E07' | 'E08' | 'E09' | 'E10';

export interface PairItem { a: string; aIpa: string; b: string; bIpa: string; aSay?: string; bSay?: string }

export interface VeiError {
  code: ErrorCode;
  title: string;
  short: string;
  examples: string[];
  phonemes: string[];
  contrastId?: string;
  why: string;
  fix: string;
  region?: string;
  /** Nghe và nhận diện: cặp đúng / sai */
  identify: PairItem[];
  /** 'listen' khi giọng tổng hợp không tạo được bản lỗi để đố */
  identifyMode?: 'quiz' | 'listen';
  /** Luyện âm riêng lẻ */
  isolate: { focus: string; howTo: string; words: string[] };
  /** Ghép từ: từng bước */
  blend: { word: string; steps: string[] };
  /** Cụm từ và câu */
  phrases: string[];
  sentences: { en: string; vi: string }[];
}

export const VEI: VeiError[] = [
  {
    code: 'E01', title: 'Thay thế /θ/ và /ð/', short: 'Âm TH', examples: ['think', 'this', 'three', 'mother'],
    phonemes: ['th', 'dh'], contrastId: 'th',
    why: 'Tiếng Việt không có âm xát răng. Chữ "th" tiếng Việt là /t/ bật hơi, nên người học thay /θ/ bằng /t/, /s/ hoặc /f/, và thay /ð/ bằng /d/ hoặc /z/.',
    fix: 'Đầu lưỡi chạm nhẹ mép răng cửa trên, để hơi đi liên tục qua khe hẹp. /θ/ không rung, /ð/ có rung. Không chặn hơi.',
    region: 'Miền Bắc hay đọc /ð/ thành /z/; nhiều vùng đọc /θ/ thành /t/ bật hơi.',
    identify: [
      { a: 'think', aIpa: 'θɪŋk', b: 'sink', bIpa: 'sɪŋk' },
      { a: 'three', aIpa: 'θɹi', b: 'tree', bIpa: 'tɹi' },
      { a: 'then', aIpa: 'ðɛn', b: 'den', bIpa: 'dɛn' },
      { a: 'thin', aIpa: 'θɪn', b: 'tin', bIpa: 'tɪn' },
    ],
    isolate: { focus: '/θ/ rồi /ð/', howTo: 'Giữ đầu lưỡi ở mép răng, thổi hơi 3 giây cho /θ/. Giữ nguyên, thêm rung ở cổ cho /ð/. Đổi qua lại 5 lần.', words: ['thin', 'then'] },
    blend: { word: 'think', steps: ['Đặt lưỡi và thổi /θ/ kéo dài.', 'Không ngắt hơi, trượt sang /ɪ/ ngắn.', 'Nâng gốc lưỡi tạo /ŋ/ rồi chặn /k/.', 'Nói cả từ: think.'] },
    phrases: ['think so', 'three things', 'this one', 'the other'],
    sentences: [{ en: 'I think this is better.', vi: 'Tôi nghĩ cái này tốt hơn.' }, { en: 'Thank you for the three books.', vi: 'Cảm ơn vì ba cuốn sách.' }],
  },
  {
    code: 'E02', title: 'Nhầm nguyên âm', short: 'Nguyên âm', examples: ['ship', 'sheep', 'bad', 'bed'],
    phonemes: ['ih', 'i', 'ae', 'eh', 'uh', 'u'], contrastId: 'ih-i',
    why: 'Tiếng Việt chỉ có một "i", một "u" và không có /æ/. Người học dùng âm Việt gần nhất, nên ship = sheep, bad = bed, pull = pool.',
    fix: 'Học từng cặp bằng vị trí lưỡi, độ mở hàm và độ căng; độ dài chỉ là dấu hiệu phụ.',
    identify: [
      { a: 'ship', aIpa: 'ʃɪp', b: 'sheep', bIpa: 'ʃip' },
      { a: 'bad', aIpa: 'bæd', b: 'bed', bIpa: 'bɛd' },
      { a: 'pull', aIpa: 'pʊl', b: 'pool', bIpa: 'pul' },
      { a: 'live', aIpa: 'lɪv', b: 'leave', bIpa: 'liv' },
    ],
    isolate: { focus: '/ɪ/ – /i/ và /æ/ – /ɛ/', howTo: 'Nói /i/ căng như cười, rồi thả lỏng hàm thành /ɪ/. Nói "e" rồi hạ hàm thêm một đốt ngón tay thành /æ/.', words: ['it', 'eat', 'bad', 'bed'] },
    blend: { word: 'ship', steps: ['Nói /ʃ/ với môi hơi tròn.', 'Chuyển sang /ɪ/ ngắn, mặt thả lỏng.', 'Khép môi chặn /p/, không thêm "ờ".', 'Nói ship rồi sheep liên tiếp.'] },
    phrases: ['a big ship', 'the sheep', 'a bad bed', 'sit on the seat'],
    sentences: [{ en: 'The ship is very big.', vi: 'Con tàu rất to.' }, { en: 'The sheep are in the field.', vi: 'Những con cừu ở trên cánh đồng.' }],
  },
  {
    code: 'E03', title: 'Bỏ âm cuối', short: 'Âm cuối', examples: ['nice', 'have', 'five', 'world'],
    phonemes: ['s', 'z', 'v', 'f', 'l', 'd', 'g', 'k', 't'],
    why: 'Tiếng Việt chỉ có ít phụ âm cuối và chúng không bật ra. Người học bỏ hẳn âm cuối tiếng Anh hoặc nuốt mất, khiến nice nghe như "nai", five như "fai".',
    fix: 'Luyện âm cuối riêng, rồi ghép vào từ và giữ tư thế miệng của âm cuối cho đến hết từ. Nghe lại bản ghi để kiểm tra.',
    region: 'Miền Nam hay đổi /n/ cuối thành /ŋ/; nhiều người bỏ /l/ cuối hoặc đọc thành "u".',
    identify: [
      { a: 'nice', aIpa: 'naɪs', b: 'nigh', bIpa: 'naɪ' },
      { a: 'five', aIpa: 'faɪv', b: 'fie', bIpa: 'faɪ' },
      { a: 'feel', aIpa: 'fil', b: 'fee', bIpa: 'fi' },
      { a: 'bag', aIpa: 'bæg', b: 'back', bIpa: 'bæk' },
    ],
    isolate: { focus: 'Âm cuối /s/, /v/, /l/', howTo: 'Nói riêng /s/ 3 giây, /v/ 3 giây (có rung), /l/ với đầu lưỡi chạm lợi. Không thêm nguyên âm phía sau.', words: ['nice', 'have', 'all'] },
    blend: { word: 'nice', steps: ['Nói /naɪ/.', 'Không dừng, đưa lưỡi lên lợi trên và xì /s/.', 'Giữ /s/ rõ đến hết từ.', 'So sánh nice với bản đọc thiếu /s/.'] },
    phrases: ['nice day', 'five books', 'have a look', 'feel good'],
    sentences: [{ en: 'Have a nice day.', vi: 'Chúc một ngày tốt lành.' }, { en: 'I have five friends.', vi: 'Tôi có năm người bạn.' }],
  },
  {
    code: 'E04', title: 'Nhầm hữu thanh và vô thanh', short: 'Rung thanh', examples: ['rice', 'rise', 'bag', 'have'],
    phonemes: ['s', 'z', 'f', 'v', 'k', 'g', 't', 'd'], contrastId: 's-z',
    why: 'Ở cuối âm tiết tiếng Việt không phân biệt rung/không rung, nên /z/, /v/, /d/, /g/ cuối bị đọc thành /s/, /f/, /t/, /k/.',
    fix: 'Đặt tay lên cổ. Âm hữu thanh phải rung; nguyên âm đứng trước âm hữu thanh dài hơn một chút (rise dài hơn rice).',
    identify: [
      { a: 'rice', aIpa: 'ɹaɪs', b: 'rise', bIpa: 'ɹaɪz' },
      { a: 'price', aIpa: 'pɹaɪs', b: 'prize', bIpa: 'pɹaɪz' },
      { a: 'fan', aIpa: 'fæn', b: 'van', bIpa: 'væn' },
      { a: 'back', aIpa: 'bæk', b: 'bag', bIpa: 'bæg' },
    ],
    isolate: { focus: '/s/ – /z/ và /f/ – /v/', howTo: 'Giữ lưỡi yên, đổi s–z–s–z chỉ bằng dây thanh. Răng chạm môi dưới, đổi f–v–f–v.', words: ['bus', 'buzz'] },
    blend: { word: 'rise', steps: ['Nói /ɹaɪ/ và kéo nguyên âm dài hơn bình thường.', 'Chuyển sang /z/ có rung.', 'Kết thúc nhẹ, không thêm "ờ".', 'Nói rice rồi rise để so sánh.'] },
    phrases: ['the sun rises', 'a big prize', 'his bag', 'these shoes'],
    sentences: [{ en: 'The price of rice will rise.', vi: 'Giá gạo sẽ tăng.' }, { en: 'His shoes are in the bag.', vi: 'Giày của anh ấy ở trong túi.' }],
  },
  {
    code: 'E05', title: 'Chèn nguyên âm vào cụm phụ âm', short: 'Cụm phụ âm', examples: ['street', 'school', 'three', 'asked'],
    phonemes: ['s', 't', 'r', 'k', 'l', 'p'],
    why: 'Âm tiết tiếng Việt không có cụm phụ âm, nên người học chèn "ơ" để tách: street thành "sơ-trít", school thành "sơ-cun".',
    fix: 'Luyện ngược từ cuối cụm: /ɹit/ → /tɹit/ → /stɹit/. Nối liền các phụ âm, không có nguyên âm xen giữa.',
    identify: [
      { a: 'sport', aIpa: 'spɔɹt', b: 'support', bIpa: 'səˈpɔɹt' },
      { a: 'please', aIpa: 'pliz', b: 'police', bIpa: 'pəˈlis' },
      { a: 'tree', aIpa: 'tɹi', b: 'terry', bIpa: 'ˈtɛɹi' },
      { a: 'blow', aIpa: 'bloʊ', b: 'below', bIpa: 'bɪˈloʊ' },
    ],
    isolate: { focus: 'Cụm /st/, /stɹ/, /sk/', howTo: 'Giữ /s/ kéo dài rồi chặn /t/ ngay sau, không mở miệng giữa hai âm.', words: ['stop', 'street', 'school'] },
    blend: { word: 'street', steps: ['Nói /ɹit/.', 'Thêm /t/ phía trước: /tɹit/.', 'Thêm /s/ kéo dài: /sss-tɹit/.', 'Rút ngắn /s/ và nói liền: street.'] },
    phrases: ['street food', 'go to school', 'three trees', 'stand up'],
    sentences: [{ en: 'I walk to school on this street.', vi: 'Tôi đi bộ đến trường trên con phố này.' }, { en: 'She is strong.', vi: 'Cô ấy khỏe.' }],
  },
  {
    code: 'E06', title: 'Nhầm /ɹ/ và /l/', short: 'R và L', examples: ['right', 'light', 'world', 'three'],
    phonemes: ['r', 'l', 'er'], contrastId: 'r-l',
    why: '"r" tiếng Việt là âm rung hoặc /z/ tuỳ vùng; /l/ cuối từ không có trong tiếng Việt. Người học lẫn r/l, rung lưỡi hoặc bỏ /l/ cuối.',
    fix: '/l/: đầu lưỡi chạm lợi trên. /ɹ/: lưỡi cong hoặc thu về sau, không chạm, môi hơi tròn, không rung lưỡi.',
    region: 'Miền Bắc hay đọc r thành /z/ và lẫn l/n; miền Nam hay rung lưỡi.',
    identify: [
      { a: 'right', aIpa: 'ɹaɪt', b: 'light', bIpa: 'laɪt' },
      { a: 'read', aIpa: 'ɹid', b: 'lead', bIpa: 'lid' },
      { a: 'fry', aIpa: 'fɹaɪ', b: 'fly', bIpa: 'flaɪ' },
      { a: 'grass', aIpa: 'gɹæs', b: 'glass', bIpa: 'glæs' },
    ],
    isolate: { focus: '/l/ và /ɹ/', howTo: 'Chạm đầu lưỡi lên lợi cho /l/, rồi rời ra và cuộn lưỡi về sau cho /ɹ/. Đổi l–r–l–r chậm.', words: ['light', 'right'] },
    blend: { word: 'world', steps: ['Tròn môi cho /w/.', 'Chuyển sang /ɝ/: lưỡi cong, không chạm.', 'Đưa đầu lưỡi lên lợi cho /l/.', 'Chặn nhẹ /d/ ở cuối: world.'] },
    phrases: ['turn right', 'turn on the light', 'read a book', 'the real world'],
    sentences: [{ en: 'Turn right at the light.', vi: 'Rẽ phải ở chỗ đèn.' }, { en: 'English is spoken around the world.', vi: 'Tiếng Anh được nói khắp thế giới.' }],
  },
  {
    code: 'E07', title: 'Nhầm /ʃ/, /s/, /tʃ/', short: 'S – SH – CH', examples: ['she', 'see', 'cheap', 'ship'],
    phonemes: ['sh', 's', 'ch', 'jh'],
    why: 'Người miền Bắc thường không phân biệt "s" và "x", nên /ʃ/ bị đọc thành /s/. /tʃ/ cuối từ không có trong tiếng Việt nên hay thành /ʃ/ hoặc bị bỏ.',
    fix: '/s/: lưỡi gần lợi, môi dẹt. /ʃ/: lưỡi lùi hơn, môi tròn nhẹ. /tʃ/: chặn như /t/ rồi thả thành /ʃ/.',
    region: 'Miền Bắc hay đọc /ʃ/ thành /s/.',
    identify: [
      { a: 'she', aIpa: 'ʃi', b: 'see', bIpa: 'si' },
      { a: 'ship', aIpa: 'ʃɪp', b: 'chip', bIpa: 'tʃɪp' },
      { a: 'wash', aIpa: 'wɑʃ', b: 'watch', bIpa: 'wɑtʃ' },
      { a: 'shop', aIpa: 'ʃɑp', b: 'chop', bIpa: 'tʃɑp' },
    ],
    isolate: { focus: '/s/ → /ʃ/ → /tʃ/', howTo: 'Nói /s/, lùi lưỡi và tròn môi thành /ʃ/, rồi thêm điểm chặn ở đầu thành /tʃ/.', words: ['see', 'she', 'cheap'] },
    blend: { word: 'teach', steps: ['Nói /ti/ với /t/ bật hơi.', 'Đưa lưỡi chạm lợi chặn hơi.', 'Thả ra thành /ʃ/: /tʃ/.', 'Nói teach, không bỏ âm cuối.'] },
    phrases: ['she sees', 'a cheap shirt', 'watch TV', 'teach English'],
    sentences: [{ en: 'She teaches English.', vi: 'Cô ấy dạy tiếng Anh.' }, { en: 'We watch TV at night.', vi: 'Chúng tôi xem TV buổi tối.' }],
  },
  {
    code: 'E08', title: 'Đặt sai trọng âm', short: 'Trọng âm', examples: ['about', 'banana', 'hotel', 'present'],
    phonemes: [],
    why: 'Tiếng Việt dùng thanh điệu cho từng âm tiết và không có trọng âm từ. Người học đọc đều các âm tiết hoặc nhấn sai chỗ, khiến người nghe khó nhận ra từ.',
    fix: 'Âm tiết nhấn to hơn, dài hơn, cao hơn; các âm tiết khác nhỏ và nhanh. Gõ nhịp mạnh–yếu khi đọc.',
    identify: [
      { a: 'a PREsent (món quà)', aIpa: 'ˈpɹɛzənt', b: 'to preSENT (trình bày)', bIpa: 'pɹɪˈzɛnt', aSay: 'a present', bSay: 'to present' },
      { a: 'a REcord (bản ghi)', aIpa: 'ˈɹɛkɚd', b: 'to reCORD (ghi lại)', bIpa: 'ɹɪˈkɔɹd', aSay: 'a record', bSay: 'to record' },
      { a: 'DEsert (sa mạc)', aIpa: 'ˈdɛzɚt', b: 'deSSERT (tráng miệng)', bIpa: 'dɪˈzɝt', aSay: 'desert', bSay: 'dessert' },
      { a: 'an OBject (đồ vật)', aIpa: 'ˈɑbdʒɛkt', b: 'to obJECT (phản đối)', bIpa: 'əbˈdʒɛkt', aSay: 'an object', bSay: 'to object' },
    ],
    isolate: { focus: 'Nhịp mạnh – yếu', howTo: 'Đọc "da-DA-da" rồi "DA-da-da". Vỗ tay mạnh ở âm tiết nhấn.', words: ['banana', 'hotel', 'computer'] },
    blend: { word: 'banana', steps: ['Đọc từng âm tiết: /bə/ – /næ/ – /nə/.', 'Nhấn âm tiết giữa: to, dài, cao.', 'Hai âm tiết còn lại thu nhỏ thành /ə/.', 'Nói liền: baNAna.'] },
    phrases: ['a banana', 'at the hotel', 'my computer', 'a good idea'],
    sentences: [{ en: 'That is a good idea.', vi: 'Đó là một ý hay.' }, { en: 'We stay at a hotel.', vi: 'Chúng tôi ở khách sạn.' }],
  },
  {
    code: 'E09', title: 'Không giảm âm', short: 'Schwa', examples: ['about', 'banana', 'the', 'of'],
    phonemes: ['schwa', 'er'],
    identifyMode: 'listen',
    why: 'Tiếng Việt đọc rõ mọi nguyên âm. Tiếng Anh giảm nguyên âm ở âm tiết không nhấn thành /ə/, và từ chức năng có dạng yếu. Đọc đủ từng nguyên âm làm lời nói cứng và khó nghe.',
    fix: 'Coi /ə/ là âm "lười": hàm, môi, lưỡi thả lỏng, rất ngắn. Đọc từ chức năng (a, the, to, of, and) thật nhẹ.',
    identify: [
      { a: 'a cup of tea', aIpa: 'ə ˈkʌp əv ˈti', b: 'đọc đều từng từ (lỗi)', bIpa: 'eɪ ˈkʌp ˈʌv ˈti' },
      { a: 'about', aIpa: 'əˈbaʊt', b: 'đọc rõ chữ a (lỗi)', bIpa: 'ˈæˈbaʊt' },
      { a: 'go to school', aIpa: 'goʊ tə ˈskul', b: 'nhấn mạnh to (lỗi)', bIpa: 'goʊ ˈtu ˈskul' },
      { a: 'you and me', aIpa: 'ju ən ˈmi', b: 'đọc đủ and (lỗi)', bIpa: 'ju ˈænd ˈmi' },
    ],
    isolate: { focus: '/ə/', howTo: 'Mở miệng hé, thả lỏng toàn bộ, phát âm thật ngắn như tiếng thở có giọng.', words: ['a', 'the', 'about'] },
    blend: { word: 'about', steps: ['Nói /ə/ thật ngắn và nhẹ.', 'Nhấn mạnh /ˈbaʊ/.', 'Kết thúc bằng /t/ nhẹ.', 'Nói liền theo nhịp yếu–MẠNH: about.'] },
    phrases: ['a cup of tea', 'about you', 'go to school', 'you and me'],
    sentences: [{ en: 'Tell me about your day.', vi: 'Kể tôi nghe về ngày của bạn.' }, { en: 'A cup of tea, please.', vi: 'Cho tôi một tách trà.' }],
  },
  {
    code: 'E10', title: 'Ngữ điệu và nhịp điệu', short: 'Ngữ điệu', examples: ['really', 'what', 'hello', 'sorry'],
    phonemes: [],
    why: 'Người học dùng thói quen thanh điệu tiếng Việt cho từng từ, nên câu tiếng Anh nghe lên xuống thất thường hoặc đều đều. Câu hỏi có/không và câu hỏi Wh- có ngữ điệu khác nhau.',
    fix: 'Chia câu thành cụm nghĩa. Nhấn từ mang nghĩa, đọc nhẹ từ chức năng. Câu kể và câu hỏi Wh- thường xuống giọng cuối; câu hỏi có/không thường lên giọng.',
    identify: [
      { a: 'Really? (ngạc nhiên ↗)', aIpa: 'ˈɹili', b: 'Really. (khẳng định ↘)', bIpa: 'ˈɹili', aSay: 'Really?', bSay: 'Really.' },
      { a: 'Are you ready? ↗', aIpa: '', b: 'You are ready. ↘', bIpa: '', aSay: 'Are you ready?', bSay: 'You are ready.' },
      { a: 'Where are you from? ↘', aIpa: '', b: 'Are you from Hanoi? ↗', bIpa: '', aSay: 'Where are you from?', bSay: 'Are you from Hanoi?' },
      { a: 'Sorry? ↗ (xin nhắc lại)', aIpa: 'ˈsɑɹi', b: 'Sorry. ↘ (xin lỗi)', bIpa: 'ˈsɑɹi', aSay: 'Sorry?', bSay: 'Sorry.' },
    ],
    isolate: { focus: 'Lên giọng – xuống giọng', howTo: 'Nói "really" hai lần: một lần lên giọng như hỏi, một lần xuống giọng như khẳng định.', words: ['really', 'sorry', 'okay'] },
    blend: { word: 'hello', steps: ['Âm tiết đầu nhẹ: /hɛ/.', 'Nhấn âm tiết hai: /ˈloʊ/.', 'Xuống giọng ở cuối khi chào.', 'Thử lên giọng khi gọi người khác.'] },
    phrases: ['Really?', 'What is this?', 'Are you okay?', 'Thank you very much.'],
    sentences: [{ en: 'Where are you from?', vi: 'Bạn đến từ đâu?' }, { en: 'Are you free tonight?', vi: 'Tối nay bạn rảnh không?' }],
  },
];

export const VEI_BY_CODE: Record<string, VeiError> = Object.fromEntries(VEI.map((e) => [e.code, e]));

export function getVei(code: string): VeiError | undefined {
  return VEI_BY_CODE[code.toUpperCase()];
}

/** Bước của quy trình can thiệp (mục 13.3). */
export const REMEDIATION_STEPS = [
  { key: 'identify', title: 'Nghe và nhận diện', desc: 'Phân biệt bản đúng với bản lỗi.' },
  { key: 'isolate', title: 'Luyện âm riêng lẻ', desc: 'Tạo đúng âm trước khi ghép.' },
  { key: 'blend', title: 'Ghép vào từ', desc: 'Ghép từng bước, giữ âm rõ.' },
  { key: 'compare', title: 'So sánh A/B', desc: 'Nghe mẫu rồi nghe bản ghi của bạn.' },
  { key: 'phrase', title: 'Cụm từ và câu', desc: 'Giữ âm khi nói liền.' },
  { key: 'retest', title: 'Kiểm tra lại sau 1 và 3 ngày', desc: 'Xác nhận khả năng duy trì.' },
] as const;
