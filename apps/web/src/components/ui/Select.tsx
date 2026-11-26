import { useId, type SelectHTMLAttributes, type ReactNode } from 'react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
}

export function Select({
  label,
  error,
  id,
  className = '',
  children,
  ...props
}: SelectProps) {
  const generatedId = useId();
  const selectId = id || generatedId;

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-[13px] font-medium text-ink"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        aria-invalid={Boolean(error)}
        className={`h-9 w-full rounded-[6px] bg-surface border px-3 text-[14px] text-ink transition-colors duration-150 focus:outline-none focus:border-accent disabled:opacity-50 cursor-pointer ${
          error ? 'border-status-rejected' : 'border-hairline'
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="text-[12px] text-status-rejected" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
