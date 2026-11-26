import type { ReactNode } from 'react';

export interface EmptyStateProps {
  message: string;
  action?: ReactNode;
}

export function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <div className="py-10 px-6 text-center border border-dashed border-hairline rounded-[8px] bg-subtle/40">
      <p className="text-[13px] text-muted max-w-md mx-auto">{message}</p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
