import { useEffect, useState, useCallback } from 'react';
import { api } from './lib/api';
import { useToast } from './components/Toast';
import { CardSkeleton } from './components/Skeleton';

interface AuditLogRow {
  id: string;
  actorId: string | null;
  actorEmail: string | null;
  action: string;
  entity: string;
  meta: Record<string, unknown>;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function SystemLogs() {
  const { showToast } = useToast();
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get<{ logs: AuditLogRow[]; pagination: Pagination }>(
        `/api/admin/logs?page=${page}&limit=20`
      );
      setLogs(res.logs || []);
      setPagination(res.pagination);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to load logs', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [page, showToast]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          System Audit Logs
        </h2>
        <p className="text-sm text-slate-500">
          Immutable trail of role changes, drive updates, and application status transitions.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6">
              <CardSkeleton rows={5} />
            </div>
          ) : logs.length === 0 ? (
            <div className="p-10 text-center text-slate-500 text-sm">No audit logs recorded yet.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3.5 font-bold">Timestamp</th>
                  <th className="px-6 py-3.5 font-bold">Actor</th>
                  <th className="px-6 py-3.5 font-bold">Action</th>
                  <th className="px-6 py-3.5 font-bold">Entity</th>
                  <th className="px-6 py-3.5 font-bold">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-slate-200/70 dark:border-slate-800/60"
                  >
                    <td className="px-6 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5 font-medium">
                      {log.actorEmail || log.actorId || 'System'}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-500/15 text-purple-500">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-500">{log.entity}</td>
                    <td className="px-6 py-3.5 text-xs font-mono text-slate-500 max-w-xs truncate">
                      {JSON.stringify(log.meta)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} entries)
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
