'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { IconMic, IconPlay, IconStop, IconRefresh } from './icons';
import { PlayButton } from './PlayButton';

interface Props {
  /** Văn bản mẫu để so sánh (nút "Nghe mẫu"). */
  modelText?: string;
  onRecorded?: (url: string) => void;
  compact?: boolean;
}

type Status = 'idle' | 'recording' | 'recorded' | 'denied' | 'unsupported';

export function Recorder({ modelText, onRecorded, compact = false }: Props) {
  const [status, setStatus] = useState<Status>('idle');
  const [url, setUrl] = useState<string | null>(null);
  const [levels, setLevels] = useState<number[]>(() => Array(16).fill(0));
  const [seconds, setSeconds] = useState(0);
  const [playing, setPlaying] = useState(false);

  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setStatus('unsupported');
    }
    return () => {
      cleanup();
      if (url) URL.revokeObjectURL(url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || 'audio/webm' });
        const u = URL.createObjectURL(blob);
        setUrl((old) => { if (old) URL.revokeObjectURL(old); return u; });
        setStatus('recorded');
        onRecorded?.(u);
        cleanup();
        setLevels(Array(16).fill(0));
      };
      // Mức âm lượng trực quan
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
      tickRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
      rec.start();
      setStatus('recording');
      // Tự dừng sau 15 giây
      window.setTimeout(() => { if (recRef.current?.state === 'recording') recRef.current.stop(); }, 15000);
    } catch {
      setStatus('denied');
      cleanup();
    }
  }, [onRecorded]);

  const stop = useCallback(() => {
    if (recRef.current && recRef.current.state === 'recording') recRef.current.stop();
  }, []);

  const play = useCallback(() => {
    if (!url) return;
    if (!audioRef.current) audioRef.current = new Audio();
    const a = audioRef.current;
    a.src = url;
    a.onended = () => setPlaying(false);
    a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, [url]);

  const reset = useCallback(() => {
    if (url) URL.revokeObjectURL(url);
    setUrl(null);
    setStatus('idle');
    setSeconds(0);
  }, [url]);

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

  return (
    <div className={`flex flex-col items-center gap-3 ${compact ? '' : 'py-2'}`}>
      <div className="flex h-10 items-end gap-1" aria-hidden>
        {levels.map((v, i) => (
          <span
            key={i}
            className={`w-1.5 rounded-full transition-[height] duration-75 ${status === 'recording' ? 'bg-danger' : 'bg-line'}`}
            style={{ height: `${Math.max(6, v * 40)}px` }}
          />
        ))}
      </div>

      <div className="flex items-center gap-4">
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
            <button type="button" onClick={start} aria-label={status === 'recorded' ? 'Ghi âm lại' : 'Bắt đầu ghi âm'} className="tap flex size-16 items-center justify-center rounded-full bg-primary text-primary-ink shadow-md">
              {status === 'recorded' ? <IconRefresh size={26} /> : <IconMic size={28} />}
            </button>
            <span className="text-xs text-muted">{status === 'recorded' ? 'Ghi lại' : 'Ghi âm'}</span>
          </div>
        )}

        {status === 'recorded' && url ? (
          <div className="flex flex-col items-center gap-1">
            <button type="button" onClick={play} aria-label="Nghe lại bản ghi của bạn" className="tap flex size-12 items-center justify-center rounded-full bg-accent-soft text-accent">
              {playing ? <IconStop size={20} /> : <IconPlay size={20} />}
            </button>
            <span className="text-xs text-muted">Của bạn</span>
          </div>
        ) : null}
      </div>

      {status === 'recorded' ? <button type="button" onClick={reset} className="text-xs text-muted underline">Xoá bản ghi</button> : null}
      {status === 'idle' ? <p className="text-center text-xs text-muted">Bản ghi chỉ lưu tạm trong phiên này và không được gửi đi đâu.</p> : null}
    </div>
  );
}
