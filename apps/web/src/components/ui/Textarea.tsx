import { useId, type TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({
  label,
  error,
  id,
  className = '',
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id || generatedId;

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-[13px] font-medium text-ink"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        aria-invalid={Boolean(error)}
        className={`w-full rounded-[6px] bg-surface border px-3 py-2 text-[14px] text-ink placeholder:text-muted/70 transition-colors duration-150 focus:outline-none focus:border-accent resize-y ${
          error ? 'border-status-rejected' : 'border-hairline'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-[12px] text-status-rejected" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
