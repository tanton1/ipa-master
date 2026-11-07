import { getPhoneme } from '@/data/phonemes';

type Pt = [number, number];
type Lips = 'neutral' | 'round' | 'spread' | 'closed' | 'teeth-on-lip';
type Air = 'oral' | 'nasal' | 'blocked' | 'fricative';

interface Pose {
  tip: Pt; blade: Pt; body: Pt; back: Pt;
  jaw: number; lips: Lips; air: Air; voiced: boolean;
  /** điểm chặn/khe hẹp để vẽ đánh dấu */
  focus?: Pt;
  glide?: string;
}

const NEUTRAL = { tip: [96, 124] as Pt, blade: [116, 114] as Pt, body: [142, 108] as Pt, back: [170, 116] as Pt };

const POSES: Record<string, Pose> = {
  // Phụ âm
  th: { tip: [70, 101], blade: [100, 112], body: [136, 112], back: [170, 120], jaw: 0.25, lips: 'neutral', air: 'fricative', voiced: false, focus: [70, 101] },
  dh: { tip: [70, 101], blade: [100, 112], body: [136, 112], back: [170, 120], jaw: 0.25, lips: 'neutral', air: 'fricative', voiced: true, focus: [70, 101] },
  t: { tip: [86, 90], blade: [108, 104], body: [140, 110], back: [170, 118], jaw: 0.12, lips: 'neutral', air: 'blocked', voiced: false, focus: [86, 90] },
  d: { tip: [86, 90], blade: [108, 104], body: [140, 110], back: [170, 118], jaw: 0.12, lips: 'neutral', air: 'blocked', voiced: true, focus: [86, 90] },
  n: { tip: [86, 90], blade: [108, 104], body: [140, 110], back: [170, 118], jaw: 0.12, lips: 'neutral', air: 'nasal', voiced: true, focus: [86, 90] },
  l: { tip: [86, 90], blade: [108, 106], body: [140, 112], back: [170, 118], jaw: 0.18, lips: 'neutral', air: 'oral', voiced: true, focus: [86, 90] },
  s: { tip: [90, 97], blade: [108, 102], body: [140, 110], back: [170, 118], jaw: 0.08, lips: 'spread', air: 'fricative', voiced: false, focus: [88, 93] },
  z: { tip: [90, 97], blade: [108, 102], body: [140, 110], back: [170, 118], jaw: 0.08, lips: 'spread', air: 'fricative', voiced: true, focus: [88, 93] },
  sh: { tip: [100, 98], blade: [118, 92], body: [146, 100], back: [172, 114], jaw: 0.15, lips: 'round', air: 'fricative', voiced: false, focus: [112, 88] },
  zh: { tip: [100, 98], blade: [118, 92], body: [146, 100], back: [172, 114], jaw: 0.15, lips: 'round', air: 'fricative', voiced: true, focus: [112, 88] },
  ch: { tip: [96, 92], blade: [118, 90], body: [146, 100], back: [172, 114], jaw: 0.12, lips: 'round', air: 'blocked', voiced: false, focus: [104, 88] },
  jh: { tip: [96, 92], blade: [118, 90], body: [146, 100], back: [172, 114], jaw: 0.12, lips: 'round', air: 'blocked', voiced: true, focus: [104, 88] },
  k: { tip: [104, 130], blade: [126, 120], body: [156, 94], back: [172, 78], jaw: 0.2, lips: 'neutral', air: 'blocked', voiced: false, focus: [172, 78] },
  g: { tip: [104, 130], blade: [126, 120], body: [156, 94], back: [172, 78], jaw: 0.2, lips: 'neutral', air: 'blocked', voiced: true, focus: [172, 78] },
  ng: { tip: [104, 130], blade: [126, 120], body: [156, 94], back: [172, 78], jaw: 0.2, lips: 'neutral', air: 'nasal', voiced: true, focus: [172, 78] },
  r: { tip: [98, 100], blade: [112, 112], body: [140, 118], back: [168, 104], jaw: 0.2, lips: 'round', air: 'oral', voiced: true },
  er: { tip: [98, 102], blade: [112, 112], body: [140, 116], back: [168, 104], jaw: 0.22, lips: 'round', air: 'oral', voiced: true },
  f: { ...NEUTRAL, jaw: 0.1, lips: 'teeth-on-lip', air: 'fricative', voiced: false, focus: [62, 103] },
  v: { ...NEUTRAL, jaw: 0.1, lips: 'teeth-on-lip', air: 'fricative', voiced: true, focus: [62, 103] },
  p: { ...NEUTRAL, jaw: 0, lips: 'closed', air: 'blocked', voiced: false, focus: [52, 110] },
  b: { ...NEUTRAL, jaw: 0, lips: 'closed', air: 'blocked', voiced: true, focus: [52, 110] },
  m: { ...NEUTRAL, jaw: 0, lips: 'closed', air: 'nasal', voiced: true, focus: [52, 110] },
  w: { tip: [100, 126], blade: [124, 118], body: [152, 102], back: [174, 94], jaw: 0.1, lips: 'round', air: 'oral', voiced: true },
  y: { tip: [96, 112], blade: [116, 94], body: [142, 90], back: [170, 108], jaw: 0.1, lips: 'spread', air: 'oral', voiced: true },
  h: { ...NEUTRAL, jaw: 0.3, lips: 'neutral', air: 'oral', voiced: false },
  // Nguyên âm
  i: { tip: [96, 112], blade: [116, 96], body: [142, 92], back: [170, 110], jaw: 0.1, lips: 'spread', air: 'oral', voiced: true },
  ih: { tip: [96, 116], blade: [116, 102], body: [142, 100], back: [170, 112], jaw: 0.2, lips: 'neutral', air: 'oral', voiced: true },
  eh: { tip: [96, 122], blade: [118, 112], body: [144, 108], back: [170, 116], jaw: 0.35, lips: 'neutral', air: 'oral', voiced: true },
  ae: { tip: [96, 132], blade: [118, 124], body: [144, 120], back: [170, 122], jaw: 0.55, lips: 'spread', air: 'oral', voiced: true },
  aa: { tip: [100, 138], blade: [126, 135], body: [152, 130], back: [176, 124], jaw: 0.65, lips: 'neutral', air: 'oral', voiced: true },
  ao: { tip: [100, 132], blade: [126, 128], body: [154, 118], back: [176, 108], jaw: 0.45, lips: 'round', air: 'oral', voiced: true },
  uh: { tip: [100, 125], blade: [126, 118], body: [154, 106], back: [176, 100], jaw: 0.25, lips: 'round', air: 'oral', voiced: true },
  u: { tip: [100, 124], blade: [126, 116], body: [154, 98], back: [176, 92], jaw: 0.15, lips: 'round', air: 'oral', voiced: true },
  ah: { tip: [98, 128], blade: [122, 120], body: [148, 114], back: [172, 116], jaw: 0.4, lips: 'neutral', air: 'oral', voiced: true },
  schwa: { ...NEUTRAL, jaw: 0.25, lips: 'neutral', air: 'oral', voiced: true },
  ey: { tip: [96, 118], blade: [118, 106], body: [144, 102], back: [170, 114], jaw: 0.28, lips: 'neutral', air: 'oral', voiced: true, glide: 'lướt lên /ɪ/' },
  ay: { tip: [98, 134], blade: [122, 128], body: [148, 124], back: [172, 122], jaw: 0.6, lips: 'neutral', air: 'oral', voiced: true, glide: 'lướt lên /ɪ/' },
  ow: { tip: [100, 130], blade: [126, 124], body: [154, 112], back: [176, 104], jaw: 0.4, lips: 'round', air: 'oral', voiced: true, glide: 'tròn môi lướt sang /ʊ/' },
  aw: { tip: [100, 136], blade: [126, 132], body: [152, 128], back: [176, 122], jaw: 0.6, lips: 'neutral', air: 'oral', voiced: true, glide: 'tròn môi lướt sang /ʊ/' },
  oy: { tip: [100, 132], blade: [126, 128], body: [154, 118], back: [176, 108], jaw: 0.45, lips: 'round', air: 'oral', voiced: true, glide: 'lướt lên /ɪ/' },
};

function smooth(points: Pt[]): string {
  if (points.length < 2) return '';
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

interface Props {
  phonemeId: string;
  className?: string;
  showLabels?: boolean;
}

/** Sơ đồ mặt cắt khoang miệng (nhìn nghiêng, mặt quay sang trái). */
export function MouthDiagram({ phonemeId, className = '', showLabels = true }: Props) {
  const pose = POSES[phonemeId] ?? { ...NEUTRAL, jaw: 0.25, lips: 'neutral' as Lips, air: 'oral' as Air, voiced: true };
  const p = getPhoneme(phonemeId);
  const dy = pose.jaw * 24; // độ hạ hàm

  // Lưỡi: từ gốc → lưng → thân → mặt lưỡi → đầu lưỡi, rồi quay về đáy miệng
  const tongueTop: Pt[] = [[204, 150 + dy * 0.6], pose.back, pose.body, pose.blade, pose.tip];
  const tongueBottom: Pt[] = [[pose.tip[0] - 2, pose.tip[1] + 12 + dy * 0.3], [120, 150 + dy], [160, 160 + dy * 0.8], [204, 168 + dy * 0.6]];
  const tonguePath = `${smooth(tongueTop)} ${smooth(tongueBottom).replace('M', 'L')} Z`;

  // Môi
  const upperLipY = 103;
  const lowerLipY = 118 + dy;
  let lips: React.ReactNode;
  if (pose.lips === 'closed') {
    lips = <path d={`M 48 ${upperLipY - 6} q 4 10 0 ${(lowerLipY - upperLipY) + 12}`} className="stroke-ink" strokeWidth={3} fill="none" />;
  } else if (pose.lips === 'round') {
    lips = (
      <>
        <path d={`M 56 ${upperLipY - 8} q -14 4 -12 ${8}`} className="stroke-ink" strokeWidth={3} fill="none" />
        <path d={`M 56 ${lowerLipY + 8} q -14 -4 -12 -${8}`} className="stroke-ink" strokeWidth={3} fill="none" />
      </>
    );
  } else if (pose.lips === 'teeth-on-lip') {
    lips = (
      <>
        <path d={`M 56 ${upperLipY - 8} q -8 3 -6 ${8}`} className="stroke-ink" strokeWidth={3} fill="none" />
        <path d={`M 60 ${lowerLipY + 8} q -4 -12 4 -${lowerLipY - upperLipY + 2}`} className="stroke-ink" strokeWidth={3} fill="none" />
      </>
    );
  } else if (pose.lips === 'spread') {
    lips = (
      <>
        <path d={`M 58 ${upperLipY - 6} q -10 1 -8 ${6}`} className="stroke-ink" strokeWidth={3} fill="none" />
        <path d={`M 58 ${lowerLipY + 6} q -10 -1 -8 -${6}`} className="stroke-ink" strokeWidth={3} fill="none" />
      </>
    );
  } else {
    lips = (
      <>
        <path d={`M 56 ${upperLipY - 8} q -10 3 -7 ${8}`} className="stroke-ink" strokeWidth={3} fill="none" />
        <path d={`M 56 ${lowerLipY + 8} q -10 -3 -7 -${8}`} className="stroke-ink" strokeWidth={3} fill="none" />
      </>
    );
  }

  return (
    <figure className={`card overflow-hidden ${className}`}>
      <svg viewBox="0 0 260 210" role="img" aria-label={`Sơ đồ khẩu hình âm ${p?.symbol ?? phonemeId}`} className="block h-auto w-full text-ink">
        {/* Đường viền mặt: trán → mũi → môi trên */}
        <path d={`M 118 8 Q 70 20 58 56 Q 36 66 46 80 Q 54 86 56 ${upperLipY - 8}`} className="stroke-muted" strokeWidth={2} fill="none" />
        {/* Khoang mũi */}
        <path d="M 60 70 Q 120 20 200 36 L 230 36" className="stroke-muted" strokeWidth={2} fill="none" strokeDasharray="4 4" />
        {/* Vòm cứng → vòm mềm */}
        <path d="M 78 86 Q 120 60 172 74 Q 200 80 212 96" className="stroke-ink" strokeWidth={3} fill="none" />
        {/* Vòm mềm (lưỡi gà) */}
        <path d={`M 196 80 q 10 8 6 ${pose.air === 'nasal' ? 12 : 20}`} className="stroke-ink" strokeWidth={3} fill="none" />
        {/* Răng trên */}
        <rect x="66" y={upperLipY - 10} width="9" height="14" rx="2" className="fill-surface stroke-ink" strokeWidth={2} />
        {/* Răng dưới */}
        <rect x="66" y={lowerLipY - 4} width="9" height="14" rx="2" className="fill-surface stroke-ink" strokeWidth={2} />
        {/* Đáy miệng / hàm dưới */}
        <path d={`M 62 ${lowerLipY + 12} Q 120 ${158 + dy} 204 ${170 + dy * 0.6}`} className="stroke-ink" strokeWidth={3} fill="none" />
        {/* Họng */}
        <path d={`M 212 96 L 214 ${200}`} className="stroke-ink" strokeWidth={3} fill="none" />
        <path d={`M 204 ${170 + dy * 0.6} L 200 200`} className="stroke-ink" strokeWidth={3} fill="none" />
        {/* Lưỡi */}
        <path d={tonguePath} className="fill-rose-300/80 stroke-rose-600 dark:fill-rose-400/50 dark:stroke-rose-300" strokeWidth={2.5} />
        {lips}
        {/* Luồng hơi */}
        {pose.air === 'nasal' ? (
          <path d="M 232 36 L 248 36 M 242 30 l 6 6 -6 6" className="stroke-sky-500" strokeWidth={2.5} fill="none" />
        ) : pose.air === 'blocked' ? (
          pose.focus ? <circle cx={pose.focus[0]} cy={pose.focus[1]} r="6" className="fill-none stroke-sky-500" strokeWidth={2.5} /> : null
        ) : (
          <path d={`M 44 ${upperLipY + 6 + dy / 2} L 18 ${upperLipY + 6 + dy / 2} M 26 ${upperLipY + dy / 2} l -8 6 8 6`} className="stroke-sky-500" strokeWidth={2.5} fill="none" strokeDasharray={pose.air === 'fricative' ? '3 3' : undefined} />
        )}
        {pose.focus && pose.air === 'fricative' ? <circle cx={pose.focus[0]} cy={pose.focus[1]} r="5" className="fill-sky-400/40 stroke-sky-500" strokeWidth={1.5} /> : null}
        {/* Dây thanh */}
        {pose.voiced ? (
          <path d="M 200 186 q 3 -4 6 0 t 6 0 t 6 0" className="stroke-accent" strokeWidth={2.5} fill="none" />
        ) : (
          <path d="M 200 186 h 18" className="stroke-muted" strokeWidth={2.5} fill="none" />
        )}
        {showLabels ? (
          <g className="fill-muted" fontSize="9" fontFamily="inherit">
            <text x="150" y="30">Khoang mũi</text>
            <text x="110" y="56">Vòm miệng</text>
            <text x="30" y={lowerLipY + 36}>Răng · Môi</text>
            <text x="120" y={150 + dy * 0.6}>Lưỡi</text>
            <text x="194" y="189" textAnchor="end">{pose.voiced ? 'Dây thanh rung' : 'Không rung'}</text>
          </g>
        ) : null}
      </svg>
      <figcaption className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line px-3 py-2 text-xs text-muted">
        <span><span className="ipa font-semibold text-ink">/{p?.symbol ?? phonemeId}/</span> {p?.name}</span>
        <span>{pose.voiced ? 'Dây thanh rung' : 'Không rung'}</span>
        <span>
          {pose.air === 'nasal' ? 'Hơi qua mũi' : pose.air === 'blocked' ? 'Chặn hơi rồi bật' : pose.air === 'fricative' ? 'Hơi qua khe hẹp' : 'Hơi qua miệng'}
        </span>
        {pose.glide ? <span>Sau đó {pose.glide}</span> : null}
      </figcaption>
    </figure>
  );
}
