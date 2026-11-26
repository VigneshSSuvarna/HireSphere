import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismiss = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{ boxShadow: 'var(--popover-shadow)' }}
            className="pointer-events-auto flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-[8px] bg-surface border border-hairline text-[13px] text-ink transition-opacity duration-150"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {toast.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 text-status-offered shrink-0" strokeWidth={1.75} />
              ) : toast.type === 'error' ? (
                <AlertCircle className="h-4 w-4 text-status-rejected shrink-0" strokeWidth={1.75} />
              ) : (
                <Info className="h-4 w-4 text-accent shrink-0" strokeWidth={1.75} />
              )}
              <span className="truncate">{toast.message}</span>
            </div>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
              className="text-muted hover:text-ink cursor-pointer shrink-0"
            >
              <X className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}
