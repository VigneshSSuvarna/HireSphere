import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { StudentDashboardStats } from '@hiresphere/shared';
import { api } from './lib/api';
import { useToast } from './components/Toast';
import { CardSkeleton, StatSkeleton } from './components/Skeleton';
import {
  Button,
  DataTable,
  EmptyState,
  PageHeader,
  Panel,
  StatBlock,
  StatusTag,
  Tooltip,
  type DataTableColumn,
} from './components/ui';

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
      showToast('Application submitted.', 'success');
      await loadData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to apply', 'error');
    } finally {
      setApplyingId(null);
    }
  };

  const columns: DataTableColumn<StudentDrive>[] = [
    {
      key: 'company',
      header: 'Company & Role',
      sortValue: (d) => d.companyName,
      render: (d) => (
        <div>
          <span className="font-medium text-ink">{d.companyName}</span>
          <span className="text-muted text-[12px] ml-2">
            {d.roleTitle} · {d.location}
          </span>
        </div>
      ),
    },
    {
      key: 'lpa',
      header: 'CTC (LPA)',
      align: 'right',
      sortValue: (d) => d.packageLpa,
      render: (d) => <span className="font-mono tabular-nums">{d.packageLpa.toFixed(1)}</span>,
    },
    {
      key: 'cgpa',
      header: 'Min CGPA',
      align: 'right',
      sortValue: (d) => d.minCgpa,
      render: (d) => <span className="font-mono tabular-nums">{d.minCgpa.toFixed(1)}</span>,
    },
    {
      key: 'eligibility',
      header: 'Status',
      render: (d) =>
        d.applied ? (
          <StatusTag status={d.applicationStatus || 'APPLIED'} />
        ) : d.eligible ? (
          <StatusTag status="ELIGIBLE" />
        ) : (
          <Tooltip content={d.ineligibilityReason || 'Criteria not met'}>
            <span>
              <StatusTag status="INELIGIBLE" />
            </span>
          </Tooltip>
        ),
    },
    {
      key: 'deadline',
      header: 'Deadline',
      sortValue: (d) => new Date(d.deadline).getTime(),
      render: (d) => (
        <span className="font-mono text-[12px] text-muted tabular-nums">
          {new Date(d.deadline).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
          })}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      align: 'right',
      render: (d) => {
        const disabled = d.applied || !d.eligible || applyingId === d.id;
        return (
          <Button
            size="sm"
            variant={d.applied ? 'secondary' : 'primary'}
            disabled={disabled}
            onClick={() => handleApply(d.id)}
            title={d.ineligibilityReason || undefined}
          >
            {d.applied ? 'Applied' : applyingId === d.id ? 'Applying...' : 'Apply'}
          </Button>
        );
      },
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Student Workspace"
        description="Eligible campus drives, application counts, and upcoming T&P cell schedules."
        actions={
          <Link to="/dashboard/profile">
            <Button variant="secondary">Update profile</Button>
          </Link>
        }
      />

      {error && (
        <Panel className="border-status-rejected/30 bg-status-rejected-bg flex items-center justify-between gap-4">
          <p className="text-[13px] text-status-rejected">{error}</p>
          <Button variant="secondary" size="sm" onClick={loadData}>
            Retry
          </Button>
        </Panel>
      )}

      {isLoading ? (
        <StatSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatBlock label="Applications Submitted" value={stats?.totalApplications ?? 0} />
          <StatBlock
            label="Interviews & Offers"
            value={
              (stats?.applicationsByStatus.INTERVIEW ?? 0) +
              (stats?.applicationsByStatus.OFFERED ?? 0)
            }
          />
          <StatBlock
            label="Average ATS Score"
            value={
              stats?.avgAtsScore !== null && stats?.avgAtsScore !== undefined
                ? `${stats.avgAtsScore}%`
                : '—'
            }
          />
          <StatBlock
            label="DSA Streak"
            value={`${stats?.dsaStreak ?? 0}d`}
            delta={`${stats?.dsaCounts.total ?? 0} solved`}
          />
        </div>
      )}

      <Panel padded={false} className="overflow-hidden">
        <div className="px-4 py-3 border-b border-hairline flex items-center justify-between bg-subtle/40">
          <h3 className="text-[14px] font-semibold text-ink">Open Campus Drives</h3>
          <Link
            to="/dashboard/tracker"
            className="text-[13px] font-medium text-accent hover:underline"
          >
            Open job tracker
          </Link>
        </div>

        {isLoading ? (
          <div className="p-4">
            <CardSkeleton rows={4} />
          </div>
        ) : (
          <DataTable
            columns={columns}
            rows={drives}
            rowKey={(d) => d.id}
            emptyState={
              <div className="p-4">
                <EmptyState message="No open campus drives are currently listed." />
              </div>
            }
          />
        )}
      </Panel>

      <Panel className="space-y-3">
        <h3 className="text-[14px] font-semibold text-ink">Upcoming Placement Events</h3>
        {isLoading ? (
          <CardSkeleton rows={2} />
        ) : !stats?.upcomingEvents.length ? (
          <EmptyState message="No upcoming placement talks, tests, or interviews scheduled." />
        ) : (
          <div className="divide-y divide-hairline border border-hairline rounded-[6px]">
            {stats.upcomingEvents.map((ev) => (
              <div
                key={ev.id}
                className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-surface"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <StatusTag status={ev.type} />
                  <span className="text-[13px] font-medium text-ink truncate">{ev.title}</span>
                </div>
                <span className="font-mono text-[12px] text-muted tabular-nums shrink-0">
                  {new Date(ev.startsAt).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
