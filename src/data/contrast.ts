export interface PairWord { word: string; ipa: string }
export interface ContrastPair { a: PairWord; b: PairWord }

export interface ContrastLesson {
  id: string;
  /** Tiêu đề ngắn: "/θ/" hoặc "/ɪ/ – /i/" */
  label: string;
  /** Từ minh hoạ: "think" hoặc "ship / sheep" */
  sample: string;
  /** id âm vị liên quan (1 hoặc 2 âm) */
  sounds: string[];
  subtitle: string;
  summary: string;
  whyHard: string;
  steps: string[];
  feel: string;
  pairs: ContrastPair[];
  /** nhãn hai cột trong bài nghe phân biệt */
  columns: [string, string];
}

export const CONTRAST_LESSONS: ContrastLesson[] = [
  {
    id: 'th', label: '/θ/', sample: 'think', sounds: ['th'], columns: ['/θ/', '/t/ hoặc /s/'],
    subtitle: 'Âm vô thanh đặt lưỡi gần răng',
    summary: 'Đầu lưỡi chạm nhẹ mép răng trên hoặc đặt giữa hai hàm răng, để hơi đi qua khe hẹp. Không thay bằng /t/ hoặc /s/ chỉ vì nghe gần giống.',
    whyHard: 'Tiếng Việt không có âm xát răng. Chữ "th" trong tiếng Việt là âm /t/ bật hơi (thơ, thi), nên khi thấy "th" người Việt tự động dùng âm quen đó. Kết quả: think thành /tɪŋk/, three thành /tɹi/, mouth thành /maʊt/ hoặc /maʊ/.',
    steps: [
      'Mở miệng hé, đưa đầu lưỡi ra chạm nhẹ mép dưới của răng cửa trên (hoặc kẹp nhẹ giữa hai hàm răng).',
      'Thổi hơi liên tục qua khe giữa lưỡi và răng. Không được chặn hơi rồi bật như /t/.',
      'Đặt tay lên cổ: không có rung. Nếu rung, bạn đang nói /ð/.',
      'Giữ tư thế đó rồi nối sang nguyên âm: /θ/ + /ɪ/ + /ŋk/ → think.',
      'Luyện cặp think – sink, three – tree: cảm nhận lưỡi đổi vị trí từ răng (θ) sang lợi (s, t).',
    ],
    feel: 'Luồng hơi đi ra liên tục, mát trên ngón tay đặt trước miệng. Cổ không rung.',
    pairs: [
      { a: { word: 'think', ipa: 'θɪŋk' }, b: { word: 'sink', ipa: 'sɪŋk' } },
      { a: { word: 'thin', ipa: 'θɪn' }, b: { word: 'tin', ipa: 'tɪn' } },
      { a: { word: 'three', ipa: 'θɹi' }, b: { word: 'tree', ipa: 'tɹi' } },
      { a: { word: 'thank', ipa: 'θæŋk' }, b: { word: 'tank', ipa: 'tæŋk' } },
      { a: { word: 'mouth', ipa: 'maʊθ' }, b: { word: 'mouse', ipa: 'maʊs' } },
      { a: { word: 'bath', ipa: 'bæθ' }, b: { word: 'bat', ipa: 'bæt' } },
      { a: { word: 'path', ipa: 'pæθ' }, b: { word: 'pass', ipa: 'pæs' } },
      { a: { word: 'thought', ipa: 'θɔt' }, b: { word: 'taught', ipa: 'tɔt' } },
    ],
  },
  {
    id: 'dh', label: '/ð/', sample: 'this', sounds: ['dh'], columns: ['/ð/', '/d/ hoặc /z/'],
    subtitle: 'Âm hữu thanh đặt lưỡi gần răng',
    summary: 'Khẩu hình tương tự /θ/ nhưng dây thanh rung. Đặt tay lên cổ để cảm nhận rung và đối chiếu hai âm.',
    whyHard: 'Người Việt thay /ð/ bằng âm "đ" tiếng Việt (this thành /dɪs/) hoặc bằng /z/ như "d/gi" miền Bắc (this thành /zɪs/). Âm này xuất hiện trong những từ dùng nhiều nhất của tiếng Anh: the, this, that, they, there, mother.',
    steps: [
      'Đặt lưỡi đúng vị trí /θ/: đầu lưỡi chạm mép răng cửa trên.',
      'Bật dây thanh: tạo tiếng "ừ" liên tục trong khi hơi vẫn đi qua khe lưỡi-răng.',
      'Đặt tay lên cổ: phải thấy rung rõ. Đây là điểm khác duy nhất so với /θ/.',
      'Không chặn hơi hoàn toàn; nếu chặn bạn sẽ ra /d/.',
      'Luyện the, this, that liên tục với tay trên cổ; sau đó luyện cặp then – den.',
    ],
    feel: 'Rung mạnh ở cổ và cảm giác "ù" ở răng cửa. Hơi ra yếu hơn /θ/.',
    pairs: [
      { a: { word: 'then', ipa: 'ðɛn' }, b: { word: 'den', ipa: 'dɛn' } },
      { a: { word: 'they', ipa: 'ðeɪ' }, b: { word: 'day', ipa: 'deɪ' } },
      { a: { word: 'there', ipa: 'ðɛɹ' }, b: { word: 'dare', ipa: 'dɛɹ' } },
      { a: { word: 'those', ipa: 'ðoʊz' }, b: { word: 'doze', ipa: 'doʊz' } },
      { a: { word: 'though', ipa: 'ðoʊ' }, b: { word: 'dough', ipa: 'doʊ' } },
      { a: { word: 'breathe', ipa: 'bɹið' }, b: { word: 'breeze', ipa: 'bɹiz' } },
      { a: { word: 'worthy', ipa: 'ˈwɝði' }, b: { word: 'wordy', ipa: 'ˈwɝdi' } },
    ],
  },
  {
    id: 'ih-i', label: '/ɪ/ – /i/', sample: 'ship / sheep', sounds: ['ih', 'i'], columns: ['/ɪ/', '/i/'],
    subtitle: 'Khác nhau về chất âm, độ căng và độ dài',
    summary: '/ɪ/ có vị trí lưỡi thấp hơn và ít căng hơn /i/. Không chỉ đơn giản là đọc một âm ngắn và một âm dài.',
    whyHard: 'Tiếng Việt chỉ có một âm "i". Người Việt dùng "i" cho cả hai nên ship = sheep, sit = seat, live = leave. Người nghe bản ngữ phân biệt chủ yếu bằng chất âm (lưỡi, độ căng), không chỉ bằng độ dài.',
    steps: [
      'Nói /i/ như "i" tiếng Việt nhưng căng hơn: khóe miệng kéo sang hai bên, lưỡi cao, kéo dài.',
      'Giữ nguyên rồi thả lỏng hàm và môi, hạ lưỡi một chút: bạn đang ở /ɪ/.',
      'Nói ngắn và dứt khoát cho /ɪ/: ship, sit, it. Không kéo dài.',
      'Nói đổi qua lại: /i/ – /ɪ/ – /i/ – /ɪ/ và cảm nhận cơ hàm căng rồi lỏng.',
      'Luyện cặp ship – sheep, sit – seat trong câu: "The ship is big" / "The sheep is big".',
    ],
    feel: '/i/: cơ mặt căng, như đang cười. /ɪ/: mặt thả lỏng, miệng hé, âm ngắn.',
    pairs: [
      { a: { word: 'ship', ipa: 'ʃɪp' }, b: { word: 'sheep', ipa: 'ʃip' } },
      { a: { word: 'sit', ipa: 'sɪt' }, b: { word: 'seat', ipa: 'sit' } },
      { a: { word: 'live', ipa: 'lɪv' }, b: { word: 'leave', ipa: 'liv' } },
      { a: { word: 'fill', ipa: 'fɪl' }, b: { word: 'feel', ipa: 'fil' } },
      { a: { word: 'it', ipa: 'ɪt' }, b: { word: 'eat', ipa: 'it' } },
      { a: { word: 'chip', ipa: 'tʃɪp' }, b: { word: 'cheap', ipa: 'tʃip' } },
      { a: { word: 'hit', ipa: 'hɪt' }, b: { word: 'heat', ipa: 'hit' } },
      { a: { word: 'bit', ipa: 'bɪt' }, b: { word: 'beat', ipa: 'bit' } },
    ],
  },
  {
    id: 'ae-eh', label: '/æ/ – /ɛ/', sample: 'bad / bed', sounds: ['ae', 'eh'], columns: ['/æ/', '/ɛ/'],
    subtitle: 'Khác nhau về độ mở hàm và vị trí lưỡi',
    summary: 'Với /æ/, hàm mở rộng hơn và lưỡi đặt thấp hơn. Cần xem mặt nghiêng và mặt trước để nhận ra khác biệt.',
    whyHard: 'Tiếng Việt có "e" (gần /ɛ/) và "a" (lưỡi lùi) nhưng không có âm mở phía trước như /æ/. Người Việt thường kéo /æ/ về "e": bad → bed, man → men, had → head.',
    steps: [
      'Nói "e" tiếng Việt: đây là /ɛ/ (bed).',
      'Giữ lưỡi phía trước, hạ hàm xuống thêm khoảng một đốt ngón tay, khóe miệng kéo rộng: đây là /æ/ (bad).',
      'Soi gương: với /æ/ phải thấy miệng mở rõ hơn, răng dưới lộ ra.',
      'Nói /ɛ/ – /æ/ – /ɛ/ – /æ/ chỉ bằng cách hạ và nâng hàm, không di chuyển lưỡi ra sau.',
      'Luyện cặp bad – bed, man – men trong câu ngắn.',
    ],
    feel: '/æ/: hàm hạ thấp, cảm giác căng dưới cằm. /ɛ/: hàm hạ vừa, thoải mái.',
    pairs: [
      { a: { word: 'bad', ipa: 'bæd' }, b: { word: 'bed', ipa: 'bɛd' } },
      { a: { word: 'man', ipa: 'mæn' }, b: { word: 'men', ipa: 'mɛn' } },
      { a: { word: 'had', ipa: 'hæd' }, b: { word: 'head', ipa: 'hɛd' } },
      { a: { word: 'sat', ipa: 'sæt' }, b: { word: 'set', ipa: 'sɛt' } },
      { a: { word: 'pan', ipa: 'pæn' }, b: { word: 'pen', ipa: 'pɛn' } },
      { a: { word: 'bag', ipa: 'bæg' }, b: { word: 'beg', ipa: 'bɛg' } },
      { a: { word: 'land', ipa: 'lænd' }, b: { word: 'lend', ipa: 'lɛnd' } },
      { a: { word: 'dad', ipa: 'dæd' }, b: { word: 'dead', ipa: 'dɛd' } },
    ],
  },
  {
    id: 's-z', label: '/s/ – /z/', sample: 'rice / rise', sounds: ['s', 'z'], columns: ['/s/', '/z/'],
    subtitle: 'Phân biệt rung thanh và âm cuối',
    summary: '/s/ không rung thanh, /z/ có rung thanh. Phải luyện cả vị trí cuối từ vì bỏ âm này có thể khiến người nghe hiểu nhầm.',
    whyHard: 'Tiếng Việt không có /s/ hay /z/ ở cuối âm tiết, nên người Việt hay bỏ hẳn (rice thành /ɹaɪ/) hoặc đọc tất cả thành /s/ (rise → rice, his → hiss). Âm cuối /s/–/z/ mang nghĩa ngữ pháp: số nhiều, sở hữu, ngôi thứ ba.',
    steps: [
      'Nói "xxx" kéo dài như tiếng xì hơi: đây là /s/, cổ không rung.',
      'Giữ nguyên lưỡi, bật dây thanh thành "zzz" như tiếng ong: đây là /z/, cổ rung.',
      'Đặt tay lên cổ và đổi qua lại s–z–s–z mà không nhúc nhích lưỡi.',
      'Cuối từ: kéo dài nguyên âm trước /z/ hơn một chút (rise dài hơn rice) rồi mới kết thúc bằng /z/ ngắn.',
      'Luyện cặp rice – rise, price – prize, bus – buzz; sau đó đọc các từ số nhiều: shoes, these, his.',
    ],
    feel: '/s/: hơi xì mạnh, cổ im. /z/: cổ rung, hơi yếu hơn, nguyên âm trước đó dài hơn.',
    pairs: [
      { a: { word: 'rice', ipa: 'ɹaɪs' }, b: { word: 'rise', ipa: 'ɹaɪz' } },
      { a: { word: 'price', ipa: 'pɹaɪs' }, b: { word: 'prize', ipa: 'pɹaɪz' } },
      { a: { word: 'bus', ipa: 'bʌs' }, b: { word: 'buzz', ipa: 'bʌz' } },
      { a: { word: 'ice', ipa: 'aɪs' }, b: { word: 'eyes', ipa: 'aɪz' } },
      { a: { word: 'Sue', ipa: 'su' }, b: { word: 'zoo', ipa: 'zu' } },
      { a: { word: 'sip', ipa: 'sɪp' }, b: { word: 'zip', ipa: 'zɪp' } },
      { a: { word: 'loose', ipa: 'lus' }, b: { word: 'lose', ipa: 'luz' } },
      { a: { word: 'peace', ipa: 'pis' }, b: { word: 'peas', ipa: 'piz' } },
    ],
  },
  {
    id: 'r-l', label: '/ɹ/ – /l/', sample: 'right / light', sounds: ['r', 'l'], columns: ['/ɹ/', '/l/'],
    subtitle: 'Hai cách đặt lưỡi rất khác nhau',
    summary: 'Với /l/, đầu lưỡi tiếp xúc vùng lợi phía sau răng trên. Với /ɹ/ kiểu Anh-Mỹ, lưỡi thu hoặc cong về sau mà không tạo tiếp xúc tương tự.',
    whyHard: '"r" tiếng Việt khác hẳn: miền Bắc đọc như /z/, miền Nam rung lưỡi. /l/ cuối từ không có trong tiếng Việt nên hay bị bỏ hoặc biến thành "u". Người miền Bắc còn lẫn l/n.',
    steps: [
      '/l/: đặt đầu lưỡi chạm chắc vào lợi ngay sau răng cửa trên, hơi thoát ra hai bên lưỡi. Cảm nhận điểm chạm.',
      '/ɹ/: nói "ơ", rồi cuộn đầu lưỡi lên về phía vòm nhưng dừng lại trước khi chạm. Môi hơi tròn. Không rung lưỡi.',
      'Đổi qua lại l–r–l–r: lưỡi chạm (l) rồi rời khỏi vòm và cong lại (r).',
      '/l/ cuối từ (all, feel, people): đầu lưỡi vẫn phải chạm lợi trên khi kết thúc; không đổi thành "u".',
      'Luyện cặp right – light, read – lead, rock – lock trong câu: "Turn right" / "Turn on the light".',
    ],
    feel: '/l/: đầu lưỡi chạm lợi rõ ràng. /ɹ/: không chạm gì, cảm giác lưỡi "lơ lửng" và môi tròn nhẹ.',
    pairs: [
      { a: { word: 'right', ipa: 'ɹaɪt' }, b: { word: 'light', ipa: 'laɪt' } },
      { a: { word: 'read', ipa: 'ɹid' }, b: { word: 'lead', ipa: 'lid' } },
      { a: { word: 'rock', ipa: 'ɹɑk' }, b: { word: 'lock', ipa: 'lɑk' } },
      { a: { word: 'road', ipa: 'ɹoʊd' }, b: { word: 'load', ipa: 'loʊd' } },
      { a: { word: 'fry', ipa: 'fɹaɪ' }, b: { word: 'fly', ipa: 'flaɪ' } },
      { a: { word: 'pray', ipa: 'pɹeɪ' }, b: { word: 'play', ipa: 'pleɪ' } },
      { a: { word: 'grass', ipa: 'gɹæs' }, b: { word: 'glass', ipa: 'glæs' } },
      { a: { word: 'correct', ipa: 'kəˈɹɛkt' }, b: { word: 'collect', ipa: 'kəˈlɛkt' } },
    ],
  },
];

export function getContrast(id: string): ContrastLesson | undefined {
  return CONTRAST_LESSONS.find((c) => c.id === id);
}
