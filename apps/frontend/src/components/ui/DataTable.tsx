import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Download,
  CheckSquare,
  Square,
  AlertCircle,
  Inbox
} from 'lucide-react';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  bulkActions?: {
    label: string;
    action: (selectedRows: T[]) => void;
    variant?: 'danger' | 'primary' | 'secondary';
  }[];
  exportFilename?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  searchPlaceholder = 'Search records...',
  isLoading = false,
  isError = false,
  errorMessage = 'Failed to load data',
  bulkActions = [],
  exportFilename = 'export.csv',
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  // Search filter
  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const query = search.toLowerCase();
    return data.filter((item) =>
      Object.values(item).some((val) =>
        String(val ?? '').toLowerCase().includes(query)
      )
    );
  }, [data, search]);

  // Sort
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      const res = aVal > bVal ? 1 : -1;
      return sortOrder === 'asc' ? res : -res;
    });
  }, [filteredData, sortKey, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key?: keyof T, sortable?: boolean) => {
    if (!key || sortable === false) return;
    if (sortKey === key) {
      if (sortOrder === 'asc') setSortOrder('desc');
      else {
        setSortKey(null);
        setSortOrder('asc');
      }
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIndices.size === paginatedData.length) {
      setSelectedIndices(new Set());
    } else {
      const all = new Set(paginatedData.map((_, i) => i));
      setSelectedIndices(all);
    }
  };

  const toggleSelectRow = (idx: number) => {
    const next = new Set(selectedIndices);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setSelectedIndices(next);
  };

  const exportCSV = () => {
    if (sortedData.length === 0) return;
    const headers = columns.map((c) => c.header).join(',');
    const rows = sortedData.map((row) =>
      columns
        .map((c) => {
          const val = c.accessorKey ? row[c.accessorKey] : '';
          return `"${String(val ?? '').replace(/"/g, '""')}"`;
        })
        .join(',')
    );
    const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', exportFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedRows = useMemo(() => {
    return Array.from(selectedIndices).map((idx) => paginatedData[idx]);
  }, [selectedIndices, paginatedData]);

  return (
    <div className="glass-panel rounded-2xl border border-theme bg-surface-theme p-5 shadow-2xl backdrop-blur-xl">
      {/* Header controls: Search, Export & Bulk Actions */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-theme" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={searchPlaceholder}
            className="w-full rounded-xl border border-theme bg-card-theme pl-10 pr-4 py-2 text-sm text-primary-theme placeholder-muted-theme transition-all focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {selectedIndices.size > 0 && bulkActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => action.action(selectedRows)}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                action.variant === 'danger'
                  ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30'
                  : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/30'
              }`}
            >
              {action.label} ({selectedIndices.size})
            </button>
          ))}

          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-theme bg-card-theme px-3.5 py-2 text-xs font-medium text-secondary-theme hover:text-primary-theme hover:bg-hover-theme transition-all"
          >
            <Download className="h-3.5 w-3.5 text-cyan-400" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Table container */}
      <div className="overflow-x-auto rounded-xl border border-theme bg-card-theme">
        <table className="w-full text-left text-sm text-secondary-theme">
          <thead className="border-b border-theme bg-surface-theme text-xs uppercase tracking-wider text-muted-theme font-medium">
            <tr>
              {bulkActions.length > 0 && (
                <th className="w-10 px-4 py-3.5 text-center">
                  <button onClick={toggleSelectAll} className="text-muted-theme hover:text-primary-theme">
                    {selectedIndices.size === paginatedData.length && paginatedData.length > 0 ? (
                      <CheckSquare className="h-4 w-4 text-cyan-400" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                </th>
              )}
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  onClick={() => handleSort(col.accessorKey, col.sortable)}
                  className={`px-4 py-3.5 select-none ${col.sortable !== false ? 'cursor-pointer hover:text-primary-theme' : ''}`}
                >
                  <div className="flex items-center gap-1.5 font-semibold">
                    {col.header}
                    {col.sortable !== false && col.accessorKey && sortKey === col.accessorKey && (
                      sortOrder === 'asc' ? <ChevronUp className="h-3.5 w-3.5 text-cyan-400" /> : <ChevronDown className="h-3.5 w-3.5 text-cyan-400" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-theme">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {bulkActions.length > 0 && <td className="px-4 py-4"><div className="h-4 w-4 rounded bg-hover-theme" /></td>}
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="px-4 py-4"><div className="h-4 w-full max-w-[120px] rounded bg-hover-theme" /></td>
                  ))}
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td colSpan={columns.length + (bulkActions.length ? 1 : 0)} className="py-12 text-center text-rose-400">
                  <AlertCircle className="mx-auto h-8 w-8 mb-2 opacity-80" />
                  <p className="font-medium text-sm">{errorMessage}</p>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (bulkActions.length ? 1 : 0)} className="py-12 text-center text-muted-theme">
                  <Inbox className="mx-auto h-8 w-8 mb-2 opacity-40" />
                  <p className="text-sm font-medium">No records found</p>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className={`transition-colors hover:bg-hover-theme ${selectedIndices.has(rIdx) ? 'bg-cyan-500/10' : ''}`}
                >
                  {bulkActions.length > 0 && (
                    <td className="px-4 py-3.5 text-center">
                      <button onClick={() => toggleSelectRow(rIdx)} className="text-muted-theme hover:text-primary-theme">
                        {selectedIndices.has(rIdx) ? (
                          <CheckSquare className="h-4 w-4 text-cyan-400" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                  )}
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className="px-4 py-3.5 font-normal text-primary-theme">
                      {col.cell ? col.cell(row) : String(col.accessorKey ? row[col.accessorKey] ?? '-' : '-')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer & Pagination */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-theme">
        <div>
          Showing {paginatedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
          {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} entries
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded-lg border border-theme bg-card-theme px-2 py-1 text-primary-theme focus:outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-lg p-1.5 hover:bg-hover-theme disabled:opacity-30 disabled:hover:bg-transparent text-primary-theme"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-semibold text-primary-theme">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg p-1.5 hover:bg-hover-theme disabled:opacity-30 disabled:hover:bg-transparent text-primary-theme"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
