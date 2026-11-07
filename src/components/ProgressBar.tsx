interface Props {
  value: number;
  max: number;
  color?: 'primary' | 'accent' | 'warn';
  className?: string;
  label?: string;
}

const COLOR = { primary: 'bg-primary', accent: 'bg-accent', warn: 'bg-warn' };

export function ProgressBar({ value, max, color = 'primary', className = '', label }: Props) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={label}
      className={`h-2.5 w-full overflow-hidden rounded-full bg-surface-2 ${className}`}
    >
      <div className={`h-full rounded-full ${COLOR[color]} transition-[width] duration-500`} style={{ width: `${pct}%` }} />
    </div>
  );
}
