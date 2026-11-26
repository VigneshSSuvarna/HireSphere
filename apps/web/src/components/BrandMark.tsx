export function BrandMark({ subtitle }: { subtitle?: string }) {
  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0 text-accent"
      >
        <rect
          x="2"
          y="2"
          width="20"
          height="20"
          rx="4"
          stroke="currentColor"
          strokeWidth="1.75"
        />
        <path
          d="M7.5 7V17M16.5 7V17M7.5 12H16.5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
      <div className="leading-tight">
        <span className="font-display text-[17px] font-semibold tracking-[-0.02em] text-ink block">
          HireSphere
        </span>
        {subtitle && (
          <span className="text-[11px] text-muted block">{subtitle}</span>
        )}
      </div>
    </div>
  );
}
