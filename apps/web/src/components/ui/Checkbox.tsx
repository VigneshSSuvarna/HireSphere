import { useId, type InputHTMLAttributes } from 'react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

export function Checkbox({ label, id, className = '', ...props }: CheckboxProps) {
  const generatedId = useId();
  const checkboxId = id || generatedId;

  return (
    <label
      htmlFor={checkboxId}
      className={`inline-flex items-center gap-2 text-[13px] text-muted hover:text-ink cursor-pointer select-none ${className}`}
    >
      <input
        id={checkboxId}
        type="checkbox"
        className="h-4 w-4 rounded-[4px] border border-hairline accent-[var(--accent-primary)] cursor-pointer"
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}
