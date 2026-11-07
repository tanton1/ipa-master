'use client';

import { useTts } from '@/lib/tts';
import { useAppState } from '@/lib/store';
import { IconPlay, IconSlow, IconStop, IconVolume } from './icons';

interface Props {
  text: string;
  /** 'slow' đọc chậm ~0.6x */
  mode?: 'normal' | 'slow';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'soft' | 'ghost';
  label?: string;
  className?: string;
  ariaLabel?: string;
}

const SIZE = { sm: 'size-9', md: 'size-12', lg: 'size-16' };
const ICON = { sm: 16, md: 20, lg: 28 };

export function PlayButton({ text, mode = 'normal', size = 'md', variant = 'soft', label, className = '', ariaLabel }: Props) {
  const { say, stop, speaking, supported } = useTts();
  const { settings } = useAppState();
  const rate = mode === 'slow' ? 0.6 : settings.rate;

  const base =
    variant === 'primary'
      ? 'bg-primary text-primary-ink shadow-sm'
      : variant === 'soft'
        ? 'bg-primary-soft text-primary'
        : 'bg-transparent text-primary hover:bg-surface-2';

  const Icon = speaking ? IconStop : mode === 'slow' ? IconSlow : size === 'sm' ? IconVolume : IconPlay;

  const button = (
    <button
      type="button"
      disabled={!supported}
      onClick={() => (speaking ? stop() : say(text, { rate }))}
      aria-label={ariaLabel ?? (mode === 'slow' ? `Nghe chậm: ${text}` : `Nghe: ${text}`)}
      title={!supported ? 'Trình duyệt không hỗ trợ đọc văn bản' : undefined}
      className={`tap inline-flex ${SIZE[size]} shrink-0 items-center justify-center rounded-full disabled:opacity-40 ${base} ${label ? '' : className}`}
    >
      <Icon size={ICON[size]} />
    </button>
  );

  if (!label) return button;
  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      {button}
      <span className="text-xs text-muted">{label}</span>
    </div>
  );
}
