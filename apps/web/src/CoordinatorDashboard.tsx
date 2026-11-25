import { useState, useEffect, useCallback } from 'react';
import type {
  ApplicationStatus,
  CoordinatorDashboardStats,
  DriveStatus,
} from '@hiresphere/shared';
import { api } from './lib/api';
import { useToast } from './components/Toast';
import { CardSkeleton, StatSkeleton } from './components/Skeleton';

interface CompanyOption {
  id: string;
  name: string;
}

interface CoordinatorDrive {
  id: string;
  companyId: string;
  companyName: string;
  roleTitle: string;
  description: string;
  packageLpa: number;
  location: string;
  minCgpa: number;
  allowedDepartments: string[];
  deadline: string;
  status: DriveStatus;
  applicantCount: number;
}

interface DriveApplicant {
  id: string;
  studentId: string;
  status: ApplicationStatus;
  appliedAt: string;
  email: string;
  fullName: string | null;
  department: string | null;
  cgpa: number | null;
  skills: string[] | null;
}

const APP_STATUSES: ApplicationStatus[] = [
  'APPLIED',
  'SHORTLISTED',
  'INTERVIEW',
  'OFFERED',
  'REJECTED',
];

export default function CoordinatorDashboard() {
  const { showToast } = useToast();
  const [stats, setStats] = useState<CoordinatorDashboardStats | null>(null);
  const [drives, setDrives] = useState<CoordinatorDrive[]>([]);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create/Edit Drive Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDrive, setEditingDrive] = useState<CoordinatorDrive | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    companyId: '',
    companyName: '',
    roleTitle: '',
    description: '',
    packageLpa: '12',
    location: 'Bengaluru',
    minCgpa: '7.0',
    allowedDepartments: 'CSE, IT',
    deadline: '',
    status: 'OPEN' as DriveStatus,
  });

  // Applicants Modal
  const [selectedDrive, setSelectedDrive] = useState<CoordinatorDrive | null>(null);
  const [applicants, setApplicants] = useState<DriveApplicant[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsRes, drivesRes, companiesRes] = await Promise.all([
        api.get<CoordinatorDashboardStats>('/api/stats/coordinator'),
        api.get<{ drives: CoordinatorDrive[] }>('/api/drives'),
        api.get<{ companies: CompanyOption[] }>('/api/companies'),
      ]);
      setStats(statsRes);
      setDrives(drivesRes.drives || []);
      setCompanies(companiesRes.companies || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load coordinator data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreateModal = () => {
    setEditingDrive(null);
    const defaultDeadline = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
    setForm({
      companyId: companies[0]?.id || '',
      companyName: '',
      roleTitle: '',
      description: '',
      packageLpa: '12',
      location: 'Bengaluru',
      minCgpa: '7.0',
      allowedDepartments: 'CSE, IT',
      deadline: defaultDeadline,
      status: 'OPEN',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (drive: CoordinatorDrive) => {
    setEditingDrive(drive);
    setForm({
      companyId: drive.companyId,
      companyName: '',
      roleTitle: drive.roleTitle,
      description: drive.description || '',
      packageLpa: String(drive.packageLpa),
      location: drive.location,
      minCgpa: String(drive.minCgpa),
      allowedDepartments: (drive.allowedDepartments || []).join(', '),
      deadline: new Date(drive.deadline).toISOString().slice(0, 10),
      status: drive.status,
    });
    setIsModalOpen(true);
  };

  const handleSaveDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        ...(form.companyName.trim()
          ? { companyName: form.companyName.trim() }
          : { companyId: form.companyId }),
        roleTitle: form.roleTitle,
        description: form.description,
        packageLpa: Number(form.packageLpa),
        location: form.location,
        minCgpa: Number(form.minCgpa),
        allowedDepartments: form.allowedDepartments
          .split(',')
          .map((d) => d.trim().toUpperCase())
          .filter(Boolean),
        deadline: new Date(form.deadline).toISOString(),
        status: form.status,
      };

      if (editingDrive) {
        await api.put(`/api/drives/${editingDrive.id}`, payload);
        showToast('Drive updated!', 'success');
      } else {
        await api.post('/api/drives', payload);
        showToast('Drive created!', 'success');
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to save drive', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDrive = async (id: string) => {
    try {
      await api.delete(`/api/drives/${id}`);
      showToast('Drive deleted', 'info');
      await loadData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to delete drive', 'error');
    }
  };

  const openApplicants = async (drive: CoordinatorDrive) => {
    setSelectedDrive(drive);
    setLoadingApplicants(true);
    try {
      const res = await api.get<{ applications: DriveApplicant[] }>(
        `/api/drives/${drive.id}/applications`
      );
      setApplicants(res.applications || []);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to load applicants', 'error');
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleStatusChange = async (applicationId: string, status: ApplicationStatus) => {
    try {
      await api.patch(`/api/applications/${applicationId}`, { status });
      setApplicants((prev) =>
        prev.map((a) => (a.id === applicationId ? { ...a, status } : a))
      );
      showToast(`Updated status to ${status}`, 'success');
      loadData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to update status', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Placement Coordinator Portal
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Manage campus drives, track the placement funnel, and review applicants.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-lg shadow-purple-500/20 self-start sm:self-auto"
        >
          + New Placement Drive
        </button>
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

      {/* Funnel Stats */}
      {isLoading ? (
        <StatSkeleton />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow">
            <p className="text-xs text-slate-500 uppercase font-semibold">Open Drives</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">
              {stats?.openDrives ?? 0}{' '}
              <span className="text-sm text-slate-500 font-normal">
                / {stats?.totalDrives ?? 0}
              </span>
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow">
            <p className="text-xs text-slate-500 uppercase font-semibold">Total Applications</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
              {stats?.totalApplicants ?? 0}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow">
            <p className="text-xs text-slate-500 uppercase font-semibold">Shortlisted / Interview</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {(stats?.funnel.SHORTLISTED ?? 0) + (stats?.funnel.INTERVIEW ?? 0)}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow">
            <p className="text-xs text-slate-500 uppercase font-semibold">Offers Extended</p>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {stats?.funnel.OFFERED ?? 0}
            </p>
          </div>
        </div>
      )}

      {/* Drives Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            All Campus Drives
          </h3>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6">
              <CardSkeleton rows={4} />
            </div>
          ) : drives.length === 0 ? (
            <div className="p-10 text-center text-slate-500 text-sm">
              No placement drives created yet. Click &quot;+ New Placement Drive&quot; to add one.
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-800 dark:text-slate-300">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-bold">Company & Role</th>
                  <th className="px-6 py-4 font-bold">Package</th>
                  <th className="px-6 py-4 font-bold">Criteria</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Applicants</th>
                  <th className="px-6 py-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {drives.map((drive) => (
                  <tr
                    key={drive.id}
                    className="border-b border-slate-200/70 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/30"
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
                    <td className="px-6 py-4 text-xs text-slate-500">
                      CGPA ≥ {drive.minCgpa} •{' '}
                      {drive.allowedDepartments.length
                        ? drive.allowedDepartments.join(', ')
                        : 'All Depts'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          drive.status === 'OPEN'
                            ? 'bg-emerald-500/15 text-emerald-500'
                            : drive.status === 'CLOSED'
                            ? 'bg-amber-500/15 text-amber-500'
                            : 'bg-slate-500/15 text-slate-400'
                        }`}
                      >
                        {drive.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => openApplicants(drive)}
                        className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
                      >
                        View ({drive.applicantCount})
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(drive)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDrive(drive.id)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create/Edit Drive Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingDrive ? 'Edit Drive' : 'Create New Drive'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDrive} className="space-y-4">
              {!editingDrive && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">
                      Existing Company
                    </label>
                    <select
                      value={form.companyId}
                      onChange={(e) => setForm({ ...form, companyId: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm"
                    >
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">
                      Or New Company Name
                    </label>
                    <input
                      type="text"
                      value={form.companyName}
                      onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                      placeholder="Optional new company"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Role Title
                  </label>
                  <input
                    type="text"
                    required
                    value={form.roleTitle}
                    onChange={(e) => setForm({ ...form, roleTitle: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    required
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Package (LPA)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={form.packageLpa}
                    onChange={(e) => setForm({ ...form, packageLpa: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Min CGPA
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={form.minCgpa}
                    onChange={(e) => setForm({ ...form, minCgpa: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as DriveStatus })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="CLOSED">CLOSED</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Allowed Departments (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={form.allowedDepartments}
                    onChange={(e) => setForm({ ...form, allowedDepartments: e.target.value })}
                    placeholder="CSE, IT, ECE"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Deadline
                  </label>
                  <input
                    type="date"
                    required
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm bg-slate-200 dark:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-lg text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Drive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Applicants Modal */}
      {selectedDrive && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Applicants — {selectedDrive.companyName} ({selectedDrive.roleTitle})
                </h3>
                <p className="text-xs text-slate-500">Update candidate status across rounds</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDrive(null)}
                className="text-slate-500 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            {loadingApplicants ? (
              <CardSkeleton rows={3} />
            ) : applicants.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">
                No students have applied to this drive yet.
              </p>
            ) : (
              <div className="space-y-3">
                {applicants.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {app.fullName || app.email}
                      </p>
                      <p className="text-xs text-slate-500">
                        {app.email} • {app.department || 'N/A'} • CGPA: {app.cgpa ?? 0}
                      </p>
                    </div>
                    <select
                      value={app.status}
                      onChange={(e) =>
                        handleStatusChange(app.id, e.target.value as ApplicationStatus)
                      }
                      className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold"
                    >
                      {APP_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
