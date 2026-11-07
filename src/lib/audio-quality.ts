/**
 * Engine 1 – Audio Quality. Phân tích bản ghi thật trên trình duyệt để quyết định
 * có đủ rõ để đánh giá hay phải yêu cầu ghi lại (mục 17.4).
 */

export type QualityIssue = 'no-speech' | 'too-quiet' | 'clipping' | 'noisy' | 'cut-start' | 'cut-end' | 'too-short';

export interface AudioQuality {
  ok: boolean;
  /** lỗi khiến không nên đánh giá */
  blocking: QualityIssue[];
  /** lỗi nhẹ, vẫn dùng được */
  warnings: QualityIssue[];
  metrics: {
    durationMs: number;
    speechMs: number;
    peakDb: number;
    speechDb: number;
    noiseDb: number;
    snrDb: number;
    clipPct: number;
    leadMs: number;
    trailMs: number;
  };
}

export const QUALITY_MESSAGE: Record<QualityIssue, string> = {
  'no-speech': 'Không nghe thấy giọng nói. Kiểm tra micro rồi ghi lại.',
  'too-quiet': 'Giọng quá nhỏ. Nói to hơn hoặc để micro gần miệng hơn.',
  clipping: 'Âm bị rè vì quá to. Lùi micro ra xa một chút.',
  noisy: 'Tiếng ồn nền lớn so với giọng nói. Tìm chỗ yên tĩnh hơn.',
  'cut-start': 'Đầu bản ghi có thể bị mất. Bấm ghi, chờ một nhịp rồi mới nói.',
  'cut-end': 'Cuối bản ghi có thể bị cắt, dễ mất âm cuối. Nói xong, chờ một nhịp rồi mới dừng.',
  'too-short': 'Bản ghi quá ngắn để nghe rõ từng âm.',
};

const toDb = (x: number) => (x <= 0 ? -120 : 20 * Math.log10(x));

function percentile(sorted: number[], p: number): number {
  if (!sorted.length) return 0;
  const i = Math.min(sorted.length - 1, Math.max(0, Math.round((sorted.length - 1) * p)));
  return sorted[i];
}

export function analyzeSamples(data: Float32Array, sampleRate: number): AudioQuality {
  const frame = Math.max(1, Math.round(sampleRate * 0.02));
  const rms: number[] = [];
  let peak = 0;
  let clipped = 0;
  for (let i = 0; i < data.length; i += frame) {
    let sum = 0;
    const end = Math.min(data.length, i + frame);
    for (let j = i; j < end; j++) {
      const v = Math.abs(data[j]);
      if (v > peak) peak = v;
      if (v >= 0.985) clipped++;
      sum += data[j] * data[j];
    }
    rms.push(Math.sqrt(sum / Math.max(1, end - i)));
  }
  const sorted = [...rms].sort((a, b) => a - b);
  const noise = Math.max(percentile(sorted, 0.1), 1e-5);
  const speechLevel = percentile(sorted, 0.9);
  // Ngưỡng giọng nói nằm giữa nền ồn và mức giọng, để nền ồn lớn vẫn phát hiện được giọng (và báo "ồn").
  const threshold = Math.max(0.006, noise + (speechLevel - noise) * 0.35);
  const speechIdx = rms.map((v, i) => (v > threshold ? i : -1)).filter((i) => i >= 0);
  const durationMs = (data.length / sampleRate) * 1000;
  const speechMs = speechIdx.length * 20;
  const leadMs = speechIdx.length ? speechIdx[0] * 20 : durationMs;
  const trailMs = speechIdx.length ? durationMs - (speechIdx[speechIdx.length - 1] + 1) * 20 : durationMs;
  const metrics = {
    durationMs: Math.round(durationMs),
    speechMs,
    peakDb: Math.round(toDb(peak)),
    speechDb: Math.round(toDb(speechLevel)),
    noiseDb: Math.round(toDb(noise)),
    snrDb: Math.round(toDb(speechLevel) - toDb(noise)),
    clipPct: Math.round((1000 * clipped) / Math.max(1, data.length)) / 10,
    leadMs: Math.round(leadMs),
    trailMs: Math.round(trailMs),
  };

  const blocking: QualityIssue[] = [];
  const warnings: QualityIssue[] = [];
  if (!speechIdx.length || metrics.speechDb < -50) blocking.push('no-speech');
  else {
    if (metrics.speechDb < -36) blocking.push('too-quiet');
    else if (metrics.speechDb < -30) warnings.push('too-quiet');
    if (metrics.clipPct > 1) blocking.push('clipping');
    else if (metrics.clipPct > 0.2) warnings.push('clipping');
    if (metrics.snrDb < 10) blocking.push('noisy');
    else if (metrics.snrDb < 16) warnings.push('noisy');
    if (speechMs < 160) blocking.push('too-short');
    if (metrics.leadMs < 40) warnings.push('cut-start');
    if (metrics.trailMs < 60) blocking.push('cut-end');
  }
  return { ok: blocking.length === 0, blocking, warnings, metrics };
}

export async function analyzeBlob(blob: Blob): Promise<AudioQuality | null> {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const buf = await ctx.decodeAudioData(await blob.arrayBuffer());
    const ch = buf.getChannelData(0);
    const q = analyzeSamples(ch, buf.sampleRate);
    ctx.close().catch(() => undefined);
    return q;
  } catch {
    return null;
  }
}
