import { useState, useEffect, useCallback } from 'react';
import { Pencil, Plus, Trash2, Users } from 'lucide-react';
import type {
  ApplicationStatus,
  CoordinatorDashboardStats,
  DriveStatus,
} from '@hiresphere/shared';
import { api } from './lib/api';
import { useToast } from './components/Toast';
import { CardSkeleton, StatSkeleton } from './components/Skeleton';
import {
  Button,
  DataTable,
  EmptyState,
  Input,
  Modal,
  PageHeader,
  Panel,
  Select,
  StatBlock,
  StatusTag,
  Textarea,
  type DataTableColumn,
} from './components/ui';

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
        showToast('Drive updated.', 'success');
      } else {
        await api.post('/api/drives', payload);
        showToast('Drive created.', 'success');
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
      showToast('Drive deleted.', 'info');
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
      showToast(`Updated status to ${status}.`, 'success');
      loadData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to update status', 'error');
    }
  };

  const columns: DataTableColumn<CoordinatorDrive>[] = [
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
      key: 'criteria',
      header: 'Criteria',
      render: (d) => (
        <span className="font-mono text-[12px] text-muted tabular-nums">
          ≥ {d.minCgpa.toFixed(1)} ·{' '}
          {d.allowedDepartments.length ? d.allowedDepartments.join(', ') : 'All'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (d) => <StatusTag status={d.status} />,
    },
    {
      key: 'applicants',
      header: 'Applicants',
      align: 'right',
      sortValue: (d) => d.applicantCount,
      render: (d) => (
        <button
          type="button"
          onClick={() => openApplicants(d)}
          className="inline-flex items-center gap-1.5 font-mono text-[12px] font-medium text-accent hover:underline cursor-pointer tabular-nums"
        >
          <Users className="h-3.5 w-3.5" strokeWidth={1.75} />
          {d.applicantCount}
        </button>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (d) => (
        <div className="inline-flex items-center gap-1">
          <button
            type="button"
            onClick={() => openEditModal(d)}
            aria-label={`Edit ${d.companyName}`}
            className="h-7 w-7 inline-flex items-center justify-center rounded-[6px] text-muted hover:text-ink hover:bg-subtle cursor-pointer"
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={() => handleDeleteDrive(d.id)}
            aria-label={`Delete ${d.companyName}`}
            className="h-7 w-7 inline-flex items-center justify-center rounded-[6px] text-muted hover:text-status-rejected hover:bg-status-rejected-bg cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Coordinator Portal"
        description="Manage campus drives, eligibility cutoffs, and round-by-round shortlists."
        actions={
          <Button onClick={openCreateModal}>
            <Plus className="h-4 w-4" strokeWidth={1.75} />
            New drive
          </Button>
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
          <StatBlock
            label="Open Drives"
            value={stats?.openDrives ?? 0}
            delta={`of ${stats?.totalDrives ?? 0} total`}
          />
          <StatBlock label="Total Applications" value={stats?.totalApplicants ?? 0} />
          <StatBlock
            label="Shortlisted & Interview"
            value={(stats?.funnel.SHORTLISTED ?? 0) + (stats?.funnel.INTERVIEW ?? 0)}
          />
          <StatBlock
            label="Offers Extended"
            value={stats?.funnel.OFFERED ?? 0}
            deltaTone="positive"
          />
        </div>
      )}

      <Panel padded={false} className="overflow-hidden">
        <div className="px-4 py-3 border-b border-hairline bg-subtle/40">
          <h3 className="text-[14px] font-semibold text-ink">All Campus Drives</h3>
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
                <EmptyState
                  message="No campus drives have been published yet."
                  action={
                    <Button size="sm" variant="secondary" onClick={openCreateModal}>
                      Create first drive
                    </Button>
                  }
                />
              </div>
            }
          />
        )}
      </Panel>

      {/* Create/Edit Drive Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDrive ? 'Edit Drive' : 'Create Placement Drive'}
        maxWidthClass="max-w-xl"
      >
        <form onSubmit={handleSaveDrive} className="space-y-4">
          {!editingDrive && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Existing company"
                value={form.companyId}
                onChange={(e) => setForm({ ...form, companyId: e.target.value })}
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
              <Input
                label="Or new company name"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                placeholder="Optional new company"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Role title"
              required
              value={form.roleTitle}
              onChange={(e) => setForm({ ...form, roleTitle: e.target.value })}
            />
            <Input
              label="Location"
              required
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Package (LPA)"
              type="number"
              step="0.5"
              required
              value={form.packageLpa}
              onChange={(e) => setForm({ ...form, packageLpa: e.target.value })}
              className="font-mono tabular-nums"
            />
            <Input
              label="Min CGPA"
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={form.minCgpa}
              onChange={(e) => setForm({ ...form, minCgpa: e.target.value })}
              className="font-mono tabular-nums"
            />
            <Select
              label="Status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as DriveStatus })}
            >
              <option value="OPEN">OPEN</option>
              <option value="CLOSED">CLOSED</option>
              <option value="COMPLETED">COMPLETED</option>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Allowed departments"
              value={form.allowedDepartments}
              onChange={(e) => setForm({ ...form, allowedDepartments: e.target.value })}
              placeholder="CSE, IT, ECE"
            />
            <Input
              label="Deadline"
              type="date"
              required
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />
          </div>

          <Textarea
            label="Role description"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save drive'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Applicants Drawer */}
      <Modal
        open={Boolean(selectedDrive)}
        onClose={() => setSelectedDrive(null)}
        variant="drawer"
        title={
          selectedDrive
            ? `${selectedDrive.companyName} — Applicants`
            : 'Applicants'
        }
        description={selectedDrive?.roleTitle}
      >
        {loadingApplicants ? (
          <CardSkeleton rows={4} />
        ) : applicants.length === 0 ? (
          <EmptyState message="No students have applied to this drive yet." />
        ) : (
          <div className="space-y-3">
            {applicants.map((app) => (
              <div
                key={app.id}
                className="p-3.5 rounded-[6px] bg-paper border border-hairline space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-ink truncate">
                      {app.fullName || app.email}
                    </p>
                    <p className="font-mono text-[11px] text-muted truncate">
                      {app.email} · {app.department || 'N/A'} · CGPA {(app.cgpa ?? 0).toFixed(2)}
                    </p>
                  </div>
                </div>
                <Select
                  value={app.status}
                  aria-label={`Application status for ${app.fullName || app.email}`}
                  onChange={(e) =>
                    handleStatusChange(app.id, e.target.value as ApplicationStatus)
                  }
                >
                  {APP_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
