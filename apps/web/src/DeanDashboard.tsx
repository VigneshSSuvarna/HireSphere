import { useEffect, useState, useCallback } from 'react';
import type { AdminDashboardStats, UserRole } from '@hiresphere/shared';
import { api } from './lib/api';
import { useAuthStore } from './store/authStore';
import { useToast } from './components/Toast';
import { CardSkeleton, StatSkeleton } from './components/Skeleton';
import {
  Button,
  DataTable,
  EmptyState,
  PageHeader,
  Panel,
  Select,
  StatBlock,
  StatusTag,
  type DataTableColumn,
} from './components/ui';

interface AdminUserRow {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  streak: number;
  createdAt: string;
}

interface HealthResponse {
  status: string;
  database: string;
  latencyMs: number;
}

export default function DeanDashboard() {
  const currentUser = useAuthStore((s) => s.user);
  const { showToast } = useToast();

  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsRes, healthRes, usersRes] = await Promise.all([
        api.get<AdminDashboardStats>('/api/stats/admin'),
        api.get<HealthResponse>('/api/health', { skipAuth: true }),
        api.get<{ users: AdminUserRow[] }>('/api/admin/users'),
      ]);
      setStats(statsRes);
      setHealth(healthRes);
      setUsers(usersRes.users || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load admin overview');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRoleChange = async (userId: string, role: UserRole) => {
    try {
      await api.patch(`/api/admin/users/${userId}/role`, { role });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
      showToast(`Role updated to ${role}.`, 'success');
      loadData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to update role', 'error');
    }
  };

  const handleToggleActive = async (user: AdminUserRow) => {
    try {
      const next = !user.isActive;
      await api.patch(`/api/admin/users/${user.id}/active`, { isActive: next });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isActive: next } : u))
      );
      showToast(next ? 'Account activated.' : 'Account deactivated.', 'info');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to update status', 'error');
    }
  };

  const totalUsers =
    (stats?.usersByRole.STUDENT ?? 0) +
    (stats?.usersByRole.COORDINATOR ?? 0) +
    (stats?.usersByRole.ADMIN ?? 0);

  const userColumns: DataTableColumn<AdminUserRow>[] = [
    {
      key: 'email',
      header: 'User',
      sortValue: (u) => u.email,
      render: (u) => <span className="font-medium text-ink">{u.email}</span>,
    },
    {
      key: 'role',
      header: 'Role',
      render: (u) => (
        <div className="w-40">
          <Select
            value={u.role}
            aria-label={`Role for ${u.email}`}
            onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
          >
            <option value="STUDENT">STUDENT</option>
            <option value="COORDINATOR">COORDINATOR</option>
            <option value="ADMIN">ADMIN</option>
          </Select>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (u) => <StatusTag status={u.isActive ? 'ACTIVE' : 'INACTIVE'} />,
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'right',
      render: (u) => (
        <Button
          size="sm"
          variant="secondary"
          disabled={u.id === currentUser?.id}
          onClick={() => handleToggleActive(u)}
        >
          {u.isActive ? 'Deactivate' : 'Activate'}
        </Button>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Dean & Admin Overview"
        description="Department placement outcomes, system database latency, and role governance."
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
          <StatBlock
            label="Registered Users"
            value={totalUsers}
            delta={`${stats?.usersByRole.STUDENT ?? 0}S · ${stats?.usersByRole.COORDINATOR ?? 0}C · ${stats?.usersByRole.ADMIN ?? 0}A`}
          />
          <StatBlock
            label="Open Drives"
            value={stats?.openDrives ?? 0}
            delta={`of ${stats?.totalDrives ?? 0} total`}
          />
          <StatBlock
            label="Placed Students"
            value={stats?.totalPlacements ?? 0}
            deltaTone="positive"
          />
          <StatBlock
            label="Database Latency"
            value={health?.latencyMs !== undefined ? `${health.latencyMs} ms` : '—'}
            delta={health?.database === 'connected' ? 'Connected' : 'Error'}
            deltaTone={health?.database === 'connected' ? 'positive' : 'negative'}
          />
        </div>
      )}

      {/* Placement Rate by Department (Minimal Accent Chart) */}
      <Panel className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h3 className="text-[14px] font-semibold text-ink">
            Placement Rate by Department
          </h3>
          <span className="font-mono text-[12px] text-muted">Offers / Registered</span>
        </div>

        {isLoading ? (
          <CardSkeleton rows={3} />
        ) : !stats?.placementRateByDepartment.length ? (
          <EmptyState message="No student profile data available yet." />
        ) : (
          <div className="space-y-3 border-t border-hairline pt-4">
            {stats.placementRateByDepartment.map((dept) => (
              <div key={dept.department} className="grid grid-cols-12 items-center gap-3">
                <span className="col-span-2 sm:col-span-1 font-mono text-[12px] font-medium text-ink">
                  {dept.department}
                </span>
                <div className="col-span-7 sm:col-span-9 h-2.5 rounded-[3px] bg-subtle border border-hairline overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all duration-150"
                    style={{ width: `${dept.rate}%` }}
                  />
                </div>
                <span className="col-span-3 sm:col-span-2 text-right font-mono text-[12px] text-muted tabular-nums">
                  {dept.placedStudents}/{dept.totalStudents} ({dept.rate}%)
                </span>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* User & Role Management */}
      <Panel padded={false} className="overflow-hidden">
        <div className="px-4 py-3 border-b border-hairline bg-subtle/40">
          <h3 className="text-[14px] font-semibold text-ink">User &amp; Role Management</h3>
        </div>
        {isLoading ? (
          <div className="p-4">
            <CardSkeleton rows={4} />
          </div>
        ) : (
          <DataTable
            columns={userColumns}
            rows={users}
            rowKey={(u) => u.id}
            emptyState={
              <div className="p-4">
                <EmptyState message="No users found." />
              </div>
            }
          />
        )}
      </Panel>
    </div>
  );
}
