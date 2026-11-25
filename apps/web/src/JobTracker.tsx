import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { ApplicationStatus } from '@hiresphere/shared';
import { api } from './lib/api';
import { CardSkeleton } from './components/Skeleton';
import { Button, EmptyState, PageHeader, Panel, StatusTag } from './components/ui';

interface MyApplication {
  id: string;
  driveId: string;
  status: ApplicationStatus;
  appliedAt: string;
  roleTitle: string;
  packageLpa: number;
  location: string;
  deadline: string;
  companyName: string;
}

const COLUMNS: Array<{ status: ApplicationStatus; label: string }> = [
  { status: 'APPLIED', label: 'Applied' },
  { status: 'SHORTLISTED', label: 'Shortlisted' },
  { status: 'INTERVIEW', label: 'Interview' },
  { status: 'OFFERED', label: 'Offered' },
  { status: 'REJECTED', label: 'Rejected' },
];

export default function JobTracker() {
  const [applications, setApplications] = useState<MyApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadApplications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<{ applications: MyApplication[] }>('/api/applications/mine');
      setApplications(res.applications || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Job Application Tracker"
        description="Status of every campus placement drive you have applied to."
        actions={
          <Link to="/dashboard">
            <Button variant="secondary">Browse drives</Button>
          </Link>
        }
      />

      {error && (
        <Panel className="border-status-rejected/30 bg-status-rejected-bg flex items-center justify-between gap-4">
          <p className="text-[13px] text-status-rejected">{error}</p>
          <Button variant="secondary" size="sm" onClick={loadApplications}>
            Retry
          </Button>
        </Panel>
      )}

      {isLoading ? (
        <CardSkeleton rows={4} />
      ) : applications.length === 0 ? (
        <EmptyState
          message="You have not applied to any campus drives yet."
          action={
            <Link to="/dashboard">
              <Button variant="secondary" size="sm">View open drives</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {COLUMNS.map((col) => {
            const items = applications.filter((a) => a.status === col.status);
            return (
              <Panel key={col.status} padded={false} className="flex flex-col min-h-[260px]">
                <div className="px-3.5 py-2.5 border-b border-hairline flex items-center justify-between bg-subtle/40">
                  <StatusTag status={col.status} label={col.label} variant="dot" />
                  <span className="font-mono text-[12px] text-muted tabular-nums">
                    {items.length}
                  </span>
                </div>

                <div className="p-2.5 space-y-2 flex-1">
                  {items.length === 0 ? (
                    <p className="text-[12px] text-muted text-center py-8">None</p>
                  ) : (
                    items.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-[6px] bg-paper border border-hairline space-y-1"
                      >
                        <p className="text-[13px] font-semibold text-ink truncate">
                          {item.companyName}
                        </p>
                        <p className="text-[12px] text-muted truncate">{item.roleTitle}</p>
                        <div className="flex items-center justify-between pt-1.5 font-mono text-[11px] text-muted tabular-nums">
                          <span>{item.packageLpa.toFixed(1)} LPA</span>
                          <span>
                            {new Date(item.appliedAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                            })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </div>
  );
}
