import type { ReactNode } from 'react';

export interface TooltipProps {
  content: string;
  children: ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  return (
    <span className="relative inline-flex group">
      {children}
      <span
        role="tooltip"
        style={{ boxShadow: 'var(--popover-shadow)' }}
        className="pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 rounded-[6px] bg-surface border border-hairline text-[12px] text-ink whitespace-nowrap z-50"
      >
        {content}
      </span>
    </span>
  );
}
