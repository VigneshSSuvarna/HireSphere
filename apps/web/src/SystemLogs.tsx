import { useEffect, useState, useCallback } from 'react';
import { api } from './lib/api';
import { useToast } from './components/Toast';
import { CardSkeleton } from './components/Skeleton';
import {
  Button,
  DataTable,
  EmptyState,
  Input,
  PageHeader,
  Panel,
  StatusTag,
  type DataTableColumn,
} from './components/ui';

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
  const [filter, setFilter] = useState('');
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

  const filteredLogs = logs.filter((l) => {
    if (!filter.trim()) return true;
    const q = filter.toLowerCase();
    return (
      l.action.toLowerCase().includes(q) ||
      l.entity.toLowerCase().includes(q) ||
      (l.actorEmail || '').toLowerCase().includes(q)
    );
  });

  const columns: DataTableColumn<AuditLogRow>[] = [
    {
      key: 'createdAt',
      header: 'Timestamp',
      sortValue: (l) => new Date(l.createdAt).getTime(),
      render: (l) => (
        <span className="font-mono text-[12px] text-muted tabular-nums whitespace-nowrap">
          {new Date(l.createdAt).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'actor',
      header: 'Actor',
      render: (l) => (
        <span className="font-mono text-[12px] text-ink">
          {l.actorEmail || l.actorId || 'System'}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (l) => <StatusTag status={l.action} label={l.action} tone="neutral" />,
    },
    {
      key: 'entity',
      header: 'Entity',
      render: (l) => <span className="font-mono text-[12px] text-muted">{l.entity}</span>,
    },
    {
      key: 'meta',
      header: 'Metadata',
      render: (l) => (
        <span className="font-mono text-[11px] text-muted block max-w-xs truncate">
          {JSON.stringify(l.meta)}
        </span>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="System Audit Logs"
        description="Append-only record of role updates, drive edits, and application transitions."
        actions={
          <div className="w-64">
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter action, entity, or actor..."
              aria-label="Filter audit logs"
            />
          </div>
        }
      />

      <Panel padded={false} className="overflow-hidden">
        {isLoading ? (
          <div className="p-4">
            <CardSkeleton rows={5} />
          </div>
        ) : (
          <DataTable
            columns={columns}
            rows={filteredLogs}
            rowKey={(l) => l.id}
            emptyState={
              <div className="p-4">
                <EmptyState message="No audit log entries match your filter." />
              </div>
            }
          />
        )}

        <div className="px-4 py-3 border-t border-hairline flex items-center justify-between text-[12px] text-muted bg-subtle/30">
          <span className="font-mono tabular-nums">
            Page {pagination.page} / {pagination.totalPages} ({pagination.total} entries)
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
