'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const PREFERRED = [
  'Google US English',
  'Microsoft Aria',
  'Microsoft Jenny',
  'Microsoft Ana',
  'Microsoft Guy',
  'Microsoft Zira',
  'Samantha',
  'Alex',
];

export function ttsSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

export function listEnglishVoices(): SpeechSynthesisVoice[] {
  if (!ttsSupported()) return [];
  return window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('en'));
}

export function pickVoice(voices: SpeechSynthesisVoice[], preferredURI?: string): SpeechSynthesisVoice | undefined {
  if (preferredURI) {
    const v = voices.find((x) => x.voiceURI === preferredURI);
    if (v) return v;
  }
  const us = voices.filter((v) => /en[-_]US/i.test(v.lang));
  for (const name of PREFERRED) {
    const v = us.find((x) => x.name.includes(name));
    if (v) return v;
  }
  return us[0] ?? voices[0];
}

export interface SpeakOptions {
  rate?: number;
  voiceURI?: string;
  onStart?: () => void;
  onEnd?: () => void;
}

/** Đọc một đoạn tiếng Anh bằng giọng tổng hợp của trình duyệt. */
export function speak(text: string, opts: SpeakOptions = {}): void {
  if (!ttsSupported()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = opts.rate ?? 1;
  u.pitch = 1;
  const voice = pickVoice(listEnglishVoices(), opts.voiceURI);
  if (voice) u.voice = voice;
  u.onstart = () => opts.onStart?.();
  u.onend = () => opts.onEnd?.();
  u.onerror = () => opts.onEnd?.();
  synth.speak(u);
}

export function stopSpeaking(): void {
  if (ttsSupported()) window.speechSynthesis.cancel();
}

/** Hook: theo dõi trạng thái đang đọc và danh sách giọng. */
export function useTts() {
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [supported, setSupported] = useState(true);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!ttsSupported()) { setSupported(false); return; }
    const update = () => setVoices(listEnglishVoices());
    update();
    window.speechSynthesis.addEventListener('voiceschanged', update);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', update);
  }, []);

  const say = useCallback((text: string, opts: SpeakOptions = {}) => {
    if (timer.current) window.clearTimeout(timer.current);
    speak(text, {
      ...opts,
      onStart: () => { setSpeaking(true); opts.onStart?.(); },
      onEnd: () => { setSpeaking(false); opts.onEnd?.(); },
    });
    // Phòng trường hợp trình duyệt không bắn onend
    timer.current = window.setTimeout(() => setSpeaking(false), 8000);
  }, []);

  const stop = useCallback(() => { stopSpeaking(); setSpeaking(false); }, []);

  return { say, stop, speaking, voices, supported };
}
