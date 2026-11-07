'use client';

import { useAppState, type IpaStyle } from '@/lib/store';

import { displayIpa } from '@/lib/ipa-display';

export { displayIpa };

export function useIpaStyle(): IpaStyle {
  return useAppState().profile.ipaStyle;
}

export function Ipa({ value, className = '', slashes = true }: { value: string; className?: string; slashes?: boolean }) {
  const style = useIpaStyle();
  const text = displayIpa(value, style);
  return <span className={`ipa ${className}`}>{slashes ? `/${text}/` : text}</span>;
}
