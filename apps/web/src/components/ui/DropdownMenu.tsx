import { useEffect, useRef, useState, type ReactNode } from 'react';

export interface DropdownItem {
  label: string;
  onClick: () => void;
  danger?: boolean;
  icon?: ReactNode;
}

export interface DropdownMenuProps {
  trigger: ReactNode;
  items: DropdownItem[];
  header?: ReactNode;
  align?: 'left' | 'right';
}

export function DropdownMenu({
  trigger,
  items,
  header,
  align = 'right',
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative inline-block">
      <div onClick={() => setOpen((p) => !p)}>{trigger}</div>
      {open && (
        <div
          role="menu"
          style={{ boxShadow: 'var(--popover-shadow)' }}
          className={`absolute z-50 mt-2 w-52 rounded-[8px] bg-surface border border-hairline py-1.5 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {header && (
            <div className="px-3 py-2 border-b border-hairline mb-1">{header}</div>
          )}
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-left text-[13px] transition-colors cursor-pointer ${
                item.danger
                  ? 'text-status-rejected hover:bg-status-rejected-bg'
                  : 'text-ink hover:bg-subtle'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
