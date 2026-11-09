import { EVIDENCE_LABEL, type Evidence } from '@/lib/store';

const CLS: Record<Evidence, string> = {
  not_tested: 'bg-surface-2 text-muted',
  assessing: 'border border-dashed border-line bg-surface text-muted',
  practicing: 'bg-warn-soft text-warn',
  observed_error: 'bg-danger-soft text-danger',
  confirmed_strength: 'bg-accent-soft text-accent',
};

/** Nhãn mức bằng chứng: chưa kiểm tra, đang đánh giá, đang luyện, lỗi đã quan sát, đã kiểm tra ổn. */
export function EvidencePill({ level, detail, className = '' }: { level: Evidence; detail?: string; className?: string }) {
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ${CLS[level]} ${className}`}>
      {EVIDENCE_LABEL[level]}{detail ? <span className="font-normal tabular-nums opacity-80">· {detail}</span> : null}
    </span>
  );
}
