export interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES = {
  sm: 'h-8 w-8 text-[12px]',
  md: 'h-9 w-9 text-[13px]',
  lg: 'h-14 w-14 text-[18px]',
};

export function Avatar({ name, size = 'md' }: AvatarProps) {
  const initials = name
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
    .slice(0, 2) || 'U';

  return (
    <div
      className={`rounded-full bg-accent-soft text-accent border border-accent/25 font-semibold inline-flex items-center justify-center shrink-0 select-none ${SIZE_CLASSES[size]}`}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}
