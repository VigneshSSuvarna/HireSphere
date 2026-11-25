import { useEffect, useState, useCallback } from 'react';
import type { AdminDashboardStats, UserRole } from '@hiresphere/shared';
import { api } from './lib/api';
import { useAuthStore } from './store/authStore';
import { useToast } from './components/Toast';
import { CardSkeleton, StatSkeleton } from './components/Skeleton';

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
      showToast(`Role updated to ${role}`, 'success');
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
      showToast(next ? 'User activated' : 'User deactivated', 'info');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to update status', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Dean &amp; Admin Portal
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          Platform health, placement metrics by department, and user role governance.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/40 text-red-400 p-4 rounded-xl flex justify-between items-center">
          <span className="text-sm">{error}</span>
          <button
            type="button"
            onClick={loadData}
            className="text-xs font-bold px-3 py-1 rounded bg-red-500/20"
          >
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <StatSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow">
            <p className="text-xs text-slate-500 uppercase font-semibold">Total Users</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
              {(stats?.usersByRole.STUDENT ?? 0) +
                (stats?.usersByRole.COORDINATOR ?? 0) +
                (stats?.usersByRole.ADMIN ?? 0)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {stats?.usersByRole.STUDENT ?? 0} Students • {stats?.usersByRole.COORDINATOR ?? 0}{' '}
              Coord • {stats?.usersByRole.ADMIN ?? 0} Admin
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow">
            <p className="text-xs text-slate-500 uppercase font-semibold">Placement Drives</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">
              {stats?.openDrives ?? 0}{' '}
              <span className="text-sm text-slate-500 font-normal">
                open / {stats?.totalDrives ?? 0}
              </span>
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow">
            <p className="text-xs text-slate-500 uppercase font-semibold">Placed Students</p>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {stats?.totalPlacements ?? 0}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow">
            <p className="text-xs text-slate-500 uppercase font-semibold">Database Health</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {health?.database === 'connected' ? 'Connected' : 'Error'}
            </p>
            <p className="text-xs text-emerald-500 mt-1">
              Latency: {health?.latencyMs ?? '—'} ms
            </p>
          </div>
        </div>
      )}

      {/* Placement Rate by Department */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          Placement Rate by Department
        </h3>
        {isLoading ? (
          <CardSkeleton rows={3} />
        ) : !stats?.placementRateByDepartment.length ? (
          <p className="text-sm text-slate-500">No student profile data yet.</p>
        ) : (
          <div className="space-y-4">
            {stats.placementRateByDepartment.map((dept) => (
              <div key={dept.department} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">
                    {dept.department} ({dept.placedStudents} / {dept.totalStudents} placed)
                  </span>
                  <span className="text-purple-600 dark:text-purple-400">{dept.rate}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-emerald-500 rounded-full"
                    style={{ width: `${dept.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User & Role Management */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            User &amp; Role Management
          </h3>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6">
              <CardSkeleton rows={4} />
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3.5 font-bold">Email</th>
                  <th className="px-6 py-3.5 font-bold">Role</th>
                  <th className="px-6 py-3.5 font-bold">Status</th>
                  <th className="px-6 py-3.5 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-slate-200/70 dark:border-slate-800/60"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                      {u.email}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                        className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold"
                      >
                        <option value="STUDENT">STUDENT</option>
                        <option value="COORDINATOR">COORDINATOR</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          u.isActive
                            ? 'bg-emerald-500/15 text-emerald-500'
                            : 'bg-red-500/15 text-red-500'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        disabled={u.id === currentUser?.id}
                        onClick={() => handleToggleActive(u)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-40"
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
