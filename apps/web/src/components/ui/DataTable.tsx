import { useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  align?: 'left' | 'right';
  sortValue?: (row: T) => string | number;
  render: (row: T) => ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyState?: ReactNode;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyState,
  onRowClick,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (col: DataTableColumn<T>) => {
    if (!col.sortValue) return;
    if (sortKey === col.key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(col.key);
      setSortDir('asc');
    }
  };

  const sortedRows = (() => {
    if (!sortKey) return rows;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return rows;
    const getter = col.sortValue;
    return [...rows].sort((a, b) => {
      const av = getter(a);
      const bv = getter(b);
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  })();

  if (rows.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-[13px]">
        <thead className="sticky top-0 z-10 bg-subtle border-b border-hairline">
          <tr>
            {columns.map((col) => {
              const isSorted = sortKey === col.key;
              return (
                <th
                  key={col.key}
                  scope="col"
                  className={`h-9 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted select-none ${
                    col.align === 'right' ? 'text-right' : 'text-left'
                  } ${col.className || ''}`}
                >
                  {col.sortValue ? (
                    <button
                      type="button"
                      onClick={() => handleSort(col)}
                      className={`inline-flex items-center gap-1 hover:text-ink transition-colors cursor-pointer ${
                        col.align === 'right' ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <span>{col.header}</span>
                      {isSorted ? (
                        sortDir === 'asc' ? (
                          <ArrowUp className="h-3 w-3 text-accent" strokeWidth={1.75} />
                        ) : (
                          <ArrowDown className="h-3 w-3 text-accent" strokeWidth={1.75} />
                        )
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-50" strokeWidth={1.75} />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline">
          {sortedRows.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`h-10 transition-colors duration-150 hover:bg-subtle/60 ${
                onRowClick ? 'cursor-pointer' : ''
              }`}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-4 py-2 text-ink ${
                    col.align === 'right' ? 'text-right' : 'text-left'
                  } ${col.className || ''}`}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
