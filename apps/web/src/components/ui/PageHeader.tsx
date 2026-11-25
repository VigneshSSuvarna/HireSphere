import type { ReactNode } from 'react';

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-hairline">
      <div>
        <h2 className="font-display text-[28px] leading-[1.2] font-medium text-ink tracking-[-0.015em]">
          {title}
        </h2>
        {description && (
          <p className="text-[14px] text-muted mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
    </div>
  );
}
