import { useEffect, useState, useCallback } from 'react';
import { api } from './lib/api';
import { useAuthStore } from './store/authStore';
import { useToast } from './components/Toast';
import { CardSkeleton } from './components/Skeleton';

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
      showToast('Exported students.csv', 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'CSV export failed', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Student Database
          </h2>
          <p className="text-sm text-slate-500">
            Filter candidates by department, CGPA, and skills, or export to CSV.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExportCsv}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow self-start sm:self-auto"
        >
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Search name or email..."
          className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm"
        />
        <select
          value={department}
          onChange={(e) => {
            setPage(1);
            setDepartment(e.target.value);
          }}
          className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm"
        >
          <option value="ALL">All Departments</option>
          <option value="CSE">CSE</option>
          <option value="IT">IT</option>
          <option value="ECE">ECE</option>
          <option value="MECH">MECH</option>
        </select>
        <input
          type="number"
          step="0.1"
          min="0"
          max="10"
          value={minCgpa}
          onChange={(e) => {
            setPage(1);
            setMinCgpa(e.target.value);
          }}
          placeholder="Min CGPA (e.g. 7.5)"
          className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm"
        />
        <input
          type="text"
          value={skills}
          onChange={(e) => {
            setPage(1);
            setSkills(e.target.value);
          }}
          placeholder="Skills (e.g. React, Python)"
          className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6">
              <CardSkeleton rows={5} />
            </div>
          ) : students.length === 0 ? (
            <div className="p-10 text-center text-slate-500 text-sm">
              No students match the current filters.
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3.5 font-bold">Student</th>
                  <th className="px-6 py-3.5 font-bold">Dept</th>
                  <th className="px-6 py-3.5 font-bold">CGPA</th>
                  <th className="px-6 py-3.5 font-bold">Skills</th>
                  <th className="px-6 py-3.5 font-bold">DSA Streak</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-slate-200/70 dark:border-slate-800/60"
                  >
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 dark:text-slate-100">
                        {s.fullName || s.email.split('@')[0]}
                      </p>
                      <p className="text-xs text-slate-500">{s.email}</p>
                    </td>
                    <td className="px-6 py-4 font-medium">{s.department || '—'}</td>
                    <td className="px-6 py-4 font-semibold">{s.cgpa ?? 0}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(s.skills || []).slice(0, 4).map((sk) => (
                          <span
                            key={sk}
                            className="text-[11px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-300"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-amber-500 font-bold">{s.streak}d</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} students)
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 rounded bg-slate-100 dark:bg-slate-800 disabled:opacity-40"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded bg-slate-100 dark:bg-slate-800 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
