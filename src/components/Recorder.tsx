'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { IconMic, IconPlay, IconStop, IconRefresh, IconAlert, IconCheck } from './icons';
import { PlayButton } from './PlayButton';
import { analyzeBlob, QUALITY_MESSAGE, type AudioQuality } from '@/lib/audio-quality';
import { speak } from '@/lib/tts';
import { useAppState } from '@/lib/store';

interface Props {
  /** Văn bản mẫu để so sánh (nút "Nghe mẫu" và A/B). */
  modelText?: string;
  onRecorded?: (url: string, quality: AudioQuality | null) => void;
  /** Gọi khi người học đã nghe A/B ít nhất một lần */
  onListenedAB?: () => void;
  compact?: boolean;
}

type Status = 'idle' | 'recording' | 'analyzing' | 'recorded' | 'denied' | 'unsupported';

export function Recorder({ modelText, onRecorded, onListenedAB, compact = false }: Props) {
  const [status, setStatus] = useState<Status>('idle');
  const [url, setUrl] = useState<string | null>(null);
  const [levels, setLevels] = useState<number[]>(() => Array(16).fill(0));
  const [seconds, setSeconds] = useState(0);
  const [playing, setPlaying] = useState<'none' | 'own' | 'ab-model' | 'ab-own'>('none');
  const [quality, setQuality] = useState<AudioQuality | null>(null);
  const { settings } = useAppState();

  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const tickRef = useRef<number | null>(null);
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setStatus('unsupported');
    }
    return () => {
      cleanup();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  function cleanup() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (tickRef.current) window.clearInterval(tickRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    ctxRef.current?.close().catch(() => undefined);
    ctxRef.current = null;
  }

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      streamRef.current = stream;
      chunksRef.current = [];
      const rec = new MediaRecorder(stream);
      recRef.current = rec;
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = async () => {
        cleanup();
        setLevels(Array(16).fill(0));
        setStatus('analyzing');
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || 'audio/webm' });
        const u = URL.createObjectURL(blob);
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        urlRef.current = u;
        setUrl(u);
        const q = await analyzeBlob(blob);
        setQuality(q);
        setStatus('recorded');
        onRecorded?.(u, q);
      };
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      ctxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      src.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const loop = () => {
        analyser.getByteFrequencyData(data);
        const bars: number[] = [];
        for (let i = 0; i < 16; i++) bars.push(data[Math.min(data.length - 1, i * 2)] / 255);
        setLevels(bars);
        rafRef.current = requestAnimationFrame(loop);
      };
      loop();
      setSeconds(0);
      setQuality(null);
      tickRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
      rec.start();
      setStatus('recording');
      window.setTimeout(() => { if (recRef.current?.state === 'recording') recRef.current.stop(); }, 15000);
    } catch {
      setStatus('denied');
      cleanup();
    }
  }, [onRecorded]);

  const stop = useCallback(() => {
    if (recRef.current && recRef.current.state === 'recording') recRef.current.stop();
  }, []);

  const playOwn = useCallback((then?: () => void) => {
    if (!url) return;
    if (!audioRef.current) audioRef.current = new Audio();
    const a = audioRef.current;
    a.src = url;
    a.onended = () => { setPlaying('none'); then?.(); };
    a.play().catch(() => setPlaying('none'));
  }, [url]);

  const playAB = useCallback(() => {
    if (!modelText || !url) return;
    setPlaying('ab-model');
    speak(modelText, {
      rate: settings.rate,
      voiceURI: settings.voiceURI,
      onEnd: () => {
        window.setTimeout(() => {
          setPlaying('ab-own');
          playOwn(() => onListenedAB?.());
        }, 350);
      },
    });
  }, [modelText, url, playOwn, settings.rate, settings.voiceURI, onListenedAB]);

  const reset = useCallback(() => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    setUrl(null);
    setQuality(null);
    setStatus('idle');
    setSeconds(0);
  }, []);

  if (status === 'unsupported') {
    return <p className="rounded-xl bg-warn-soft p-3 text-sm text-warn">Trình duyệt này không hỗ trợ ghi âm. Hãy mở bằng Chrome, Edge hoặc Safari mới.</p>;
  }
  if (status === 'denied') {
    return (
      <div className="rounded-xl bg-danger-soft p-3 text-sm text-danger">
        Không truy cập được micro. Hãy cho phép quyền micro trong trình duyệt rồi thử lại.
        <button type="button" onClick={() => setStatus('idle')} className="ml-2 font-semibold underline">Thử lại</button>
      </div>
    );
  }

  const recorded = status === 'recorded' && url;

  return (
    <div className={`flex flex-col items-center gap-3 ${compact ? '' : 'py-2'}`}>
      <div className="flex h-10 items-end gap-1" aria-hidden>
        {levels.map((v, i) => (
          <span key={i} className={`w-1.5 rounded-full transition-[height] duration-75 ${status === 'recording' ? 'bg-danger' : 'bg-line'}`} style={{ height: `${Math.max(6, v * 40)}px` }} />
        ))}
      </div>

      <div className="flex items-start gap-4">
        {modelText ? <PlayButton text={modelText} size="md" variant="soft" label="Nghe mẫu" /> : null}

        {status === 'recording' ? (
          <div className="flex flex-col items-center gap-1">
            <button type="button" onClick={stop} aria-label="Dừng ghi âm" className="tap recording-ring relative flex size-16 items-center justify-center rounded-full bg-danger text-white shadow-md">
              <IconStop size={26} />
            </button>
            <span className="text-xs tabular-nums text-danger">Đang ghi {seconds}s</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <button type="button" onClick={start} disabled={status === 'analyzing'} aria-label={recorded ? 'Ghi âm lại' : 'Bắt đầu ghi âm'} className="tap flex size-16 items-center justify-center rounded-full bg-primary text-primary-ink shadow-md disabled:opacity-60">
              {recorded ? <IconRefresh size={26} /> : <IconMic size={28} />}
            </button>
            <span className="text-xs text-muted">{status === 'analyzing' ? 'Đang kiểm tra…' : recorded ? 'Ghi lại' : 'Ghi âm'}</span>
          </div>
        )}

        {recorded ? (
          <div className="flex flex-col items-center gap-1">
            <button type="button" onClick={() => { setPlaying('own'); playOwn(); }} aria-label="Nghe lại bản ghi của bạn" className="tap flex size-12 items-center justify-center rounded-full bg-accent-soft text-accent">
              {playing === 'own' ? <IconStop size={20} /> : <IconPlay size={20} />}
            </button>
            <span className="text-xs text-muted">Của bạn</span>
          </div>
        ) : null}
      </div>

      {recorded && modelText ? (
        <button type="button" onClick={playAB} disabled={playing !== 'none'} className="tap inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold disabled:opacity-70">
          <span className={`rounded px-1.5 text-xs ${playing === 'ab-model' ? 'bg-primary text-primary-ink' : 'bg-surface-2'}`}>A</span>
          Nghe A/B: mẫu rồi bạn
          <span className={`rounded px-1.5 text-xs ${playing === 'ab-own' ? 'bg-accent text-white' : 'bg-surface-2'}`}>B</span>
        </button>
      ) : null}

      {recorded && quality ? (
        quality.ok ? (
          <p className="flex items-start gap-1.5 text-xs text-accent">
            <IconCheck size={14} className="mt-0.5 shrink-0" />
            <span>Bản ghi đủ rõ để đánh giá{quality.warnings.length ? `. Lưu ý: ${quality.warnings.map((w) => QUALITY_MESSAGE[w]).join(' ')}` : '.'}</span>
          </p>
        ) : (
          <p className="flex items-start gap-1.5 rounded-xl bg-warn-soft p-2.5 text-xs text-warn">
            <IconAlert size={14} className="mt-0.5 shrink-0" />
            <span>{quality.blocking.map((w) => QUALITY_MESSAGE[w]).join(' ')}</span>
          </p>
        )
      ) : null}

      {recorded ? <button type="button" onClick={reset} className="text-xs text-muted underline">Xoá bản ghi</button> : null}
      {status === 'idle' ? <p className="text-center text-xs text-muted">Bản ghi chỉ lưu tạm trong phiên này và không được gửi đi đâu.</p> : null}
    </div>
  );
}
