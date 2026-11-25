import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { StudentDashboardStats } from '@hiresphere/shared';
import { api } from './lib/api';
import { useToast } from './components/Toast';
import { CardSkeleton, StatSkeleton } from './components/Skeleton';

interface StudentDrive {
  id: string;
  companyName: string;
  roleTitle: string;
  packageLpa: number;
  location: string;
  minCgpa: number;
  allowedDepartments: string[];
  deadline: string;
  status: string;
  eligible: boolean;
  ineligibilityReason: string | null;
  applied: boolean;
  applicationStatus: string | null;
}

export default function StudentDashboard() {
  const { showToast } = useToast();
  const [stats, setStats] = useState<StudentDashboardStats | null>(null);
  const [drives, setDrives] = useState<StudentDrive[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applyingId, setApplyingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsRes, drivesRes] = await Promise.all([
        api.get<StudentDashboardStats>('/api/stats/student'),
        api.get<{ drives: StudentDrive[] }>('/api/drives'),
      ]);
      setStats(statsRes);
      setDrives(drivesRes.drives || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load workspace');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApply = async (driveId: string) => {
    setApplyingId(driveId);
    try {
      await api.post(`/api/drives/${driveId}/apply`);
      showToast('Application submitted!', 'success');
      await loadData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to apply', 'error');
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="bg-gradient-to-r from-purple-300 via-purple-200 to-indigo-200 dark:from-purple-900/50 dark:via-purple-950/40 dark:to-slate-900 p-6 sm:p-8 rounded-2xl border border-purple-300 dark:border-purple-500/20 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
            Welcome to your Workspace
          </h2>
          <p className="text-purple-950 dark:text-slate-300 text-sm sm:text-base font-medium">
            Track your applications, discover eligible drives, and prepare for placements.
          </p>
        </div>
        <Link
          to="/dashboard/profile"
          className="px-4 py-2 rounded-lg bg-white/80 dark:bg-slate-900/80 text-purple-700 dark:text-purple-300 text-sm font-semibold border border-purple-300 dark:border-purple-500/30 hover:bg-white dark:hover:bg-slate-800 transition-colors self-start sm:self-auto"
        >
          Update Profile →
        </Link>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/40 text-red-600 dark:text-red-300 p-4 rounded-xl flex items-center justify-between">
          <span className="text-sm font-medium">{error}</span>
          <button
            type="button"
            onClick={loadData}
            className="text-xs font-bold px-3 py-1.5 rounded bg-red-500/20 hover:bg-red-500/30"
          >
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <StatSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md">
            <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">
              Total Applications
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {stats?.totalApplications ?? 0}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md">
            <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">
              Interviews & Offers
            </p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {(stats?.applicationsByStatus.INTERVIEW ?? 0) +
                (stats?.applicationsByStatus.OFFERED ?? 0)}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md">
            <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">
              Avg ATS Score
            </p>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats?.avgAtsScore !== null && stats?.avgAtsScore !== undefined
                ? `${stats.avgAtsScore}%`
                : '—'}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md">
            <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">
              DSA Streak / Solved
            </p>
            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
              {stats?.dsaStreak ?? 0}d{' '}
              <span className="text-sm font-medium text-slate-500">
                ({stats?.dsaCounts.total ?? 0})
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Campus Drives Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Open Campus Drives
          </h3>
          <Link
            to="/dashboard/tracker"
            className="text-sm text-purple-600 dark:text-purple-400 hover:underline font-semibold"
          >
            View Job Tracker →
          </Link>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6">
              <CardSkeleton rows={4} />
            </div>
          ) : drives.length === 0 ? (
            <div className="p-10 text-center text-slate-500 dark:text-slate-400 text-sm">
              No open placement drives right now. Check back soon!
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-800 dark:text-slate-300">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-bold">Company & Role</th>
                  <th className="px-6 py-4 font-bold">Package</th>
                  <th className="px-6 py-4 font-bold">Eligibility</th>
                  <th className="px-6 py-4 font-bold">Deadline</th>
                  <th className="px-6 py-4 text-right font-bold">Action</th>
                </tr>
              </thead>
              <tbody>
                {drives.map((drive) => {
                  const disabled = drive.applied || !drive.eligible || applyingId === drive.id;
                  return (
                    <tr
                      key={drive.id}
                      className="border-b border-slate-200/70 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900 dark:text-slate-100">
                          {drive.companyName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {drive.roleTitle} • {drive.location}
                        </p>
                      </td>
                      <td className="px-6 py-4 font-semibold">{drive.packageLpa} LPA</td>
                      <td className="px-6 py-4">
                        {drive.applied ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-500 border border-blue-500/20">
                            {drive.applicationStatus || 'APPLIED'}
                          </span>
                        ) : drive.eligible ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
                            Eligible
                          </span>
                        ) : (
                          <div>
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-500 border border-amber-500/20">
                              Ineligible
                            </span>
                            {drive.ineligibilityReason && (
                              <p className="text-xs text-slate-500 mt-1">
                                {drive.ineligibilityReason}
                              </p>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                        {new Date(drive.deadline).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleApply(drive.id)}
                          disabled={disabled}
                          title={drive.ineligibilityReason || undefined}
                          className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors ${
                            disabled
                              ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                              : 'bg-purple-600 text-white hover:bg-purple-700'
                          }`}
                        >
                          {drive.applied
                            ? 'Applied'
                            : applyingId === drive.id
                            ? 'Applying...'
                            : 'Apply Now'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
          Upcoming Placement Events
        </h3>
        {isLoading ? (
          <CardSkeleton rows={2} />
        ) : !stats?.upcomingEvents.length ? (
          <p className="text-sm text-slate-500">No upcoming events scheduled.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.upcomingEvents.map((ev) => (
              <div
                key={ev.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4"
              >
                <div>
                  <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-purple-500/15 text-purple-500">
                    {ev.type}
                  </span>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mt-1">
                    {ev.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {new Date(ev.startsAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
