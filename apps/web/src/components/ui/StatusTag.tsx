export type StatusTone = 'applied' | 'shortlisted' | 'interview' | 'offered' | 'rejected' | 'neutral';

const STATUS_MAP: Record<string, { label: string; tone: StatusTone }> = {
  APPLIED: { label: 'Applied', tone: 'applied' },
  SHORTLISTED: { label: 'Shortlisted', tone: 'shortlisted' },
  INTERVIEW: { label: 'Interview', tone: 'interview' },
  OFFERED: { label: 'Offered', tone: 'offered' },
  REJECTED: { label: 'Rejected', tone: 'rejected' },
  OPEN: { label: 'Open', tone: 'offered' },
  CLOSED: { label: 'Closed', tone: 'shortlisted' },
  COMPLETED: { label: 'Completed', tone: 'neutral' },
  ACTIVE: { label: 'Active', tone: 'offered' },
  INACTIVE: { label: 'Inactive', tone: 'rejected' },
  PPT: { label: 'PPT', tone: 'applied' },
  TEST: { label: 'Test', tone: 'shortlisted' },
  OTHER: { label: 'Other', tone: 'neutral' },
  ELIGIBLE: { label: 'Eligible', tone: 'offered' },
  INELIGIBLE: { label: 'Ineligible', tone: 'shortlisted' },
};

const TONE_STYLES: Record<StatusTone, { text: string; bg: string; dot: string }> = {
  applied: {
    text: 'text-status-applied',
    bg: 'bg-status-applied-bg',
    dot: 'bg-status-applied',
  },
  shortlisted: {
    text: 'text-status-shortlisted',
    bg: 'bg-status-shortlisted-bg',
    dot: 'bg-status-shortlisted',
  },
  interview: {
    text: 'text-status-interview',
    bg: 'bg-status-interview-bg',
    dot: 'bg-status-interview',
  },
  offered: {
    text: 'text-status-offered',
    bg: 'bg-status-offered-bg',
    dot: 'bg-status-offered',
  },
  rejected: {
    text: 'text-status-rejected',
    bg: 'bg-status-rejected-bg',
    dot: 'bg-status-rejected',
  },
  neutral: {
    text: 'text-muted',
    bg: 'bg-subtle',
    dot: 'bg-muted',
  },
};

export interface StatusTagProps {
  status: string;
  label?: string;
  tone?: StatusTone;
  variant?: 'tag' | 'dot';
}

export function StatusTag({ status, label, tone, variant = 'tag' }: StatusTagProps) {
  const mapped = STATUS_MAP[status.toUpperCase()];
  const resolvedTone = tone || mapped?.tone || 'neutral';
  const resolvedLabel = label || mapped?.label || status;
  const styles = TONE_STYLES[resolvedTone];

  if (variant === 'dot') {
    return (
      <span className={`inline-flex items-center gap-1.5 text-[12px] font-medium ${styles.text}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} aria-hidden="true" />
        {resolvedLabel}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[5px] text-[12px] font-medium whitespace-nowrap ${styles.bg} ${styles.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} aria-hidden="true" />
      {resolvedLabel}
    </span>
  );
}
