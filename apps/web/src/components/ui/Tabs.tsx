export interface TabOption {
  value: string;
  label: string;
  count?: number;
}

export interface TabsProps {
  options: TabOption[];
  value: string;
  onChange: (value: string) => void;
}

export function Tabs({ options, value, onChange }: TabsProps) {
  return (
    <div
      role="tablist"
      className="inline-flex items-center gap-1 border-b border-hairline w-full overflow-x-auto"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={`relative px-3 py-2 text-[13px] font-medium whitespace-nowrap transition-colors duration-150 cursor-pointer ${
              active ? 'text-ink' : 'text-muted hover:text-ink'
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              <span>{opt.label}</span>
              {opt.count !== undefined && (
                <span className="font-mono text-[11px] tabular-nums text-muted">
                  {opt.count}
                </span>
              )}
            </span>
            {active && (
              <span
                className="absolute inset-x-0 bottom-0 h-[2px] bg-accent"
                aria-hidden="true"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
