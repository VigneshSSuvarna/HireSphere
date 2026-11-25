import { useEffect, useState, useCallback } from 'react';
import type { ApplicationStatus } from '@hiresphere/shared';
import { api } from './lib/api';
import { CardSkeleton } from './components/Skeleton';

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

const COLUMNS: Array<{ status: ApplicationStatus; label: string; badgeClass: string }> = [
  { status: 'APPLIED', label: 'Applied', badgeClass: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
  { status: 'SHORTLISTED', label: 'Shortlisted', badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  { status: 'INTERVIEW', label: 'Interview', badgeClass: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
  { status: 'OFFERED', label: 'Offered', badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  { status: 'REJECTED', label: 'Rejected', badgeClass: 'bg-red-500/15 text-red-400 border-red-500/30' },
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
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Job Application Tracker
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Track every campus drive application across stages in real time.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/40 text-red-400 p-4 rounded-xl flex justify-between items-center">
          <span className="text-sm">{error}</span>
          <button
            type="button"
            onClick={loadApplications}
            className="text-xs font-bold px-3 py-1 rounded bg-red-500/20"
          >
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <CardSkeleton rows={4} />
      ) : applications.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500">
          You haven&apos;t applied to any campus drives yet. Head to My Workspace to apply!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {COLUMNS.map((col) => {
            const items = applications.filter((a) => a.status === col.status);
            return (
              <div
                key={col.status}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col min-h-[260px]"
              >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${col.badgeClass}`}>
                    {col.label}
                  </span>
                  <span className="text-xs font-bold text-slate-500">{items.length}</span>
                </div>

                <div className="space-y-3 flex-1">
                  {items.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-8">No applications</p>
                  ) : (
                    items.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5"
                      >
                        <p className="font-bold text-sm text-slate-900 dark:text-slate-100">
                          {item.companyName}
                        </p>
                        <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                          {item.roleTitle}
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                          <span>{item.packageLpa} LPA</span>
                          <span>{new Date(item.appliedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
