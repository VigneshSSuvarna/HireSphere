import type { HTMLAttributes, ReactNode } from 'react';

export interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padded?: boolean;
}

export function Panel({ children, padded = true, className = '', ...props }: PanelProps) {
  return (
    <div
      className={`bg-surface border border-hairline rounded-[8px] ${
        padded ? 'p-5' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
