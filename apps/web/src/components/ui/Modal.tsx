import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  maxWidthClass?: string;
  variant?: 'modal' | 'drawer';
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  maxWidthClass = 'max-w-lg',
  variant = 'modal',
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/45 flex ${
        variant === 'drawer'
          ? 'justify-end items-stretch'
          : 'items-center justify-center p-4'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        style={{ boxShadow: 'var(--popover-shadow)' }}
        className={`bg-surface border border-hairline w-full ${
          variant === 'drawer'
            ? 'max-w-md h-full overflow-y-auto p-6 border-l'
            : `${maxWidthClass} rounded-[8px] max-h-[90vh] overflow-y-auto p-6`
        }`}
      >
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-hairline">
          <div>
            <h3 className="text-[16px] font-semibold text-ink">{title}</h3>
            {description && (
              <p className="text-[13px] text-muted mt-0.5">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="h-7 w-7 inline-flex items-center justify-center rounded-[6px] text-muted hover:text-ink hover:bg-subtle transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
        <div className="pt-4">{children}</div>
      </div>
    </div>
  );
}
