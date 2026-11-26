import { useEffect, useState, useCallback, useRef } from 'react';
import { Columns3, Download } from 'lucide-react';
import { api } from './lib/api';
import { useAuthStore } from './store/authStore';
import { useToast } from './components/Toast';
import { CardSkeleton } from './components/Skeleton';
import {
  Button,
  Checkbox,
  DataTable,
  EmptyState,
  Input,
  PageHeader,
  Panel,
  Select,
  type DataTableColumn,
} from './components/ui';

interface StudentRow {
  id: string;
  email: string;
  isActive: boolean;
  streak: number;
  fullName: string | null;
  department: string | null;
  cgpa: number | null;
  graduationYear: number | null;
  skills: string[] | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface VisibleCols {
  department: boolean;
  cgpa: boolean;
  skills: boolean;
  streak: boolean;
}

const DEFAULT_COLS: VisibleCols = {
  department: true,
  cgpa: true,
  skills: true,
  streak: true,
};

const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, '') ||
  'http://localhost:5000';

export default function StudentDatabase() {
  const token = useAuthStore((s) => s.token);
  const { showToast } = useToast();

  const [students, setStudents] = useState<StudentRow[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('ALL');
  const [minCgpa, setMinCgpa] = useState('');
  const [skills, setSkills] = useState('');
  const [page, setPage] = useState(1);

  const [colsOpen, setColsOpen] = useState(false);
  const colsRef = useRef<HTMLDivElement>(null);
  const [visibleCols, setVisibleCols] = useState<VisibleCols>(() => {
    try {
      const saved = localStorage.getItem('hiresphere_student_cols');
      return saved ? (JSON.parse(saved) as VisibleCols) : DEFAULT_COLS;
    } catch {
      return DEFAULT_COLS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('hiresphere_student_cols', JSON.stringify(visibleCols));
    } catch {
      // ignore storage errors
    }
  }, [visibleCols]);

  useEffect(() => {
    if (!colsOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (colsRef.current && !colsRef.current.contains(e.target as Node)) {
        setColsOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [colsOpen]);

  const buildQueryString = useCallback(
    (targetPage: number) => {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (department !== 'ALL') params.set('department', department);
      if (minCgpa.trim()) params.set('minCgpa', minCgpa.trim());
      if (skills.trim()) params.set('skills', skills.trim());
      params.set('page', String(targetPage));
      params.set('limit', '15');
      return params.toString();
    },
    [search, department, minCgpa, skills]
  );

  const loadStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const qs = buildQueryString(page);
      const res = await api.get<{ students: StudentRow[]; pagination: Pagination }>(
        `/api/students?${qs}`
      );
      setStudents(res.students || []);
      setPagination(res.pagination);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to load students', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [buildQueryString, page, showToast]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handleExportCsv = async () => {
    try {
      const qs = buildQueryString(1);
      const res = await fetch(`${API_BASE}/api/students/export.csv?${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'students.csv';
      a.click();
      URL.revokeObjectURL(url);
      showToast('Exported students.csv.', 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'CSV export failed', 'error');
    }
  };

  const columns: DataTableColumn<StudentRow>[] = [
    {
      key: 'student',
      header: 'Student',
      sortValue: (s) => s.fullName || s.email,
      render: (s) => (
        <div>
          <span className="font-medium text-ink">{s.fullName || s.email.split('@')[0]}</span>
          <span className="font-mono text-[12px] text-muted ml-2">{s.email}</span>
        </div>
      ),
    },
    ...(visibleCols.department
      ? [
          {
            key: 'department',
            header: 'Branch',
            sortValue: (s: StudentRow) => s.department || '',
            render: (s: StudentRow) => (
              <span className="font-mono text-[12px] text-ink">{s.department || '—'}</span>
            ),
          },
        ]
      : []),
    ...(visibleCols.cgpa
      ? [
          {
            key: 'cgpa',
            header: 'CGPA',
            align: 'right' as const,
            sortValue: (s: StudentRow) => s.cgpa ?? 0,
            render: (s: StudentRow) => (
              <span className="font-mono tabular-nums">{(s.cgpa ?? 0).toFixed(2)}</span>
            ),
          },
        ]
      : []),
    ...(visibleCols.skills
      ? [
          {
            key: 'skills',
            header: 'Skills',
            render: (s: StudentRow) => (
              <span className="text-[12px] text-muted">
                {(s.skills || []).slice(0, 4).join(', ') || '—'}
              </span>
            ),
          },
        ]
      : []),
    ...(visibleCols.streak
      ? [
          {
            key: 'streak',
            header: 'DSA Streak',
            align: 'right' as const,
            sortValue: (s: StudentRow) => s.streak,
            render: (s: StudentRow) => (
              <span className="font-mono text-[12px] text-accent tabular-nums">{s.streak}d</span>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Student Database"
        description="Filter registered students by branch, CGPA cutoff, or skills, and export shortlists."
        actions={
          <>
            <div ref={colsRef} className="relative">
              <Button variant="secondary" onClick={() => setColsOpen((p) => !p)}>
                <Columns3 className="h-4 w-4" strokeWidth={1.75} />
                Columns
              </Button>
              {colsOpen && (
                <div
                  style={{ boxShadow: 'var(--popover-shadow)' }}
                  className="absolute right-0 mt-2 w-48 rounded-[8px] bg-surface border border-hairline p-3 space-y-2 z-40"
                >
                  <Checkbox
                    label="Branch"
                    checked={visibleCols.department}
                    onChange={(e) =>
                      setVisibleCols((c) => ({ ...c, department: e.target.checked }))
                    }
                  />
                  <Checkbox
                    label="CGPA"
                    checked={visibleCols.cgpa}
                    onChange={(e) =>
                      setVisibleCols((c) => ({ ...c, cgpa: e.target.checked }))
                    }
                  />
                  <Checkbox
                    label="Skills"
                    checked={visibleCols.skills}
                    onChange={(e) =>
                      setVisibleCols((c) => ({ ...c, skills: e.target.checked }))
                    }
                  />
                  <Checkbox
                    label="DSA Streak"
                    checked={visibleCols.streak}
                    onChange={(e) =>
                      setVisibleCols((c) => ({ ...c, streak: e.target.checked }))
                    }
                  />
                </div>
              )}
            </div>
            <Button variant="secondary" onClick={handleExportCsv}>
              <Download className="h-4 w-4" strokeWidth={1.75} />
              Export CSV
            </Button>
          </>
        }
      />

      {/* Filter Bar */}
      <Panel className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Input
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Search name or email..."
          aria-label="Search students"
        />
        <Select
          value={department}
          aria-label="Filter by department"
          onChange={(e) => {
            setPage(1);
            setDepartment(e.target.value);
          }}
        >
          <option value="ALL">All branches</option>
          <option value="CSE">CSE</option>
          <option value="IT">IT</option>
          <option value="ECE">ECE</option>
          <option value="MECH">MECH</option>
        </Select>
        <Input
          type="number"
          step="0.1"
          min="0"
          max="10"
          value={minCgpa}
          aria-label="Minimum CGPA"
          onChange={(e) => {
            setPage(1);
            setMinCgpa(e.target.value);
          }}
          placeholder="Min CGPA (e.g. 7.5)"
          className="font-mono tabular-nums"
        />
        <Input
          value={skills}
          aria-label="Filter by skills"
          onChange={(e) => {
            setPage(1);
            setSkills(e.target.value);
          }}
          placeholder="Skills (e.g. React, Python)"
        />
      </Panel>

      <Panel padded={false} className="overflow-hidden">
        {isLoading ? (
          <div className="p-4">
            <CardSkeleton rows={5} />
          </div>
        ) : (
          <DataTable
            columns={columns}
            rows={students}
            rowKey={(s) => s.id}
            emptyState={
              <div className="p-4">
                <EmptyState
                  message="No students match the current filters."
                  action={
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setSearch('');
                        setDepartment('ALL');
                        setMinCgpa('');
                        setSkills('');
                        setPage(1);
                      }}
                    >
                      Clear filters
                    </Button>
                  }
                />
              </div>
            }
          />
        )}

        <div className="px-4 py-3 border-t border-hairline flex items-center justify-between text-[12px] text-muted bg-subtle/30">
          <span className="font-mono tabular-nums">
            Page {pagination.page} / {pagination.totalPages} ({pagination.total} students)
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </Panel>
    </div>
  );
}
