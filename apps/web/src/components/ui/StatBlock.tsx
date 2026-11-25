export interface StatBlockProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaTone?: 'positive' | 'negative' | 'neutral';
}

export function StatBlock({
  label,
  value,
  delta,
  deltaTone = 'neutral',
}: StatBlockProps) {
  const deltaColor =
    deltaTone === 'positive'
      ? 'text-status-offered'
      : deltaTone === 'negative'
      ? 'text-status-rejected'
      : 'text-muted';

  return (
    <div className="bg-surface border border-hairline rounded-[8px] px-4 py-3.5">
      <p className="text-[12px] text-muted font-medium">{label}</p>
      <div className="flex items-baseline justify-between gap-2 mt-1.5">
        <span className="font-mono text-[24px] leading-[1.15] font-semibold text-ink tabular-nums">
          {value}
        </span>
        {delta && (
          <span className={`text-[12px] font-medium tabular-nums ${deltaColor}`}>
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}
