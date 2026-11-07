/**
 * Kiểm thử engine Audio Quality bằng tín hiệu giả lập.
 * Chạy: node scripts/test-audio-quality.mts
 */
import { analyzeSamples } from '../src/lib/audio-quality.ts';

const SR = 16000;

function make(o: { lead: number; speech: number; trail: number; amp: number; noise: number; clip?: boolean }): Float32Array {
  const n = Math.round((o.lead + o.speech + o.trail) * SR);
  const d = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let v = (Math.random() * 2 - 1) * o.noise;
    if (t >= o.lead && t < o.lead + o.speech) v += o.amp * Math.sin(2 * Math.PI * 180 * t) * (0.6 + 0.4 * Math.sin(2 * Math.PI * 3 * t));
    if (o.clip) v = Math.max(-1, Math.min(1, v * 3));
    d[i] = v;
  }
  return d;
}

const cases: [string, Float32Array, boolean, string?][] = [
  ['tốt', make({ lead: 0.4, speech: 0.8, trail: 0.4, amp: 0.3, noise: 0.003 }), true],
  ['quá nhỏ', make({ lead: 0.4, speech: 0.8, trail: 0.4, amp: 0.012, noise: 0.0005 }), false, 'too-quiet'],
  ['nhiều ồn', make({ lead: 0.4, speech: 0.8, trail: 0.4, amp: 0.1, noise: 0.06 }), false, 'noisy'],
  ['cắt cuối', make({ lead: 0.4, speech: 0.8, trail: 0, amp: 0.3, noise: 0.003 }), false, 'cut-end'],
  ['bị rè', make({ lead: 0.4, speech: 0.8, trail: 0.4, amp: 0.9, noise: 0.003, clip: true }), false, 'clipping'],
  ['im lặng', make({ lead: 1, speech: 0, trail: 0.5, amp: 0, noise: 0.001 }), false, 'no-speech'],
];

let fail = 0;
for (const [name, data, expectOk, expectIssue] of cases) {
  const q = analyzeSamples(data, SR);
  const pass = q.ok === expectOk && (!expectIssue || q.blocking.includes(expectIssue as never));
  if (!pass) fail++;
  console.log(`${pass ? '✓' : '✗'} ${name.padEnd(9)} ok=${q.ok} chặn=[${q.blocking.join(',')}] cảnh báo=[${q.warnings.join(',')}] snr=${q.metrics.snrDb}dB giọng=${q.metrics.speechDb}dBFS`);
}
if (fail) { console.error(`${fail} trường hợp sai`); process.exit(1); }
