import React from 'react';
import { MagnifyingGlass, CaretUp, CaretDown } from '@phosphor-icons/react';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  searchValue?: string;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
  };
  emptyTitle?: string;
  emptySubtitle?: string;
  emptyAction?: React.ReactNode;
  keyExtractor: (row: T) => string;
}

export function DataTable<T>({
  data,
  columns,
  loading = false,
  searchPlaceholder = 'Search...',
  onSearch,
  searchValue = '',
  filters,
  actions,
  pagination,
  emptyTitle = 'No data found',
  emptySubtitle = 'Try adjusting your search or filters',
  emptyAction,
  keyExtractor,
}: DataTableProps<T>) {
  return (
    <div className="w-full flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative">
          {onSearch && (
            <>
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2" size={18} weight="regular" style={{ color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearch(e.target.value)}
                className="w-full border px-10 pr-4 py-2.5 text-sm outline-none transition-colors duration-150 sm:w-72"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--border-default)',
                  color: 'var(--text-primary)',
                  borderRadius: 'var(--radius-lg)',
                }}
              />
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          {filters}
          {actions}
        </div>
      </div>

      {/* Table container */}
      <div className="overflow-hidden overflow-x-auto border" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
        <table className="w-full border-collapse">
          <thead style={{ backgroundColor: 'var(--color-neutral-50)', borderBottom: '1px solid var(--border-default)' }}>
            <tr>
              {columns.map((col, i) => (
                <th
                  key={i}
                  className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <div className="flex items-center gap-1 cursor-default">
                    {col.header}
                    {col.sortable && (
                      <div className="flex flex-col">
                        <CaretUp size={12} weight="regular" style={{ color: 'var(--text-tertiary)' }} />
                        <CaretDown size={12} className="-mt-1" weight="regular" style={{ color: 'var(--text-tertiary)' }} />
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b" style={{ borderColor: 'var(--border-default)' }}>
                  {columns.map((__, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 w-3/4 animate-pulse rounded" style={{ backgroundColor: 'var(--color-neutral-200)' }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <MagnifyingGlass size={48} className="mb-4" weight="regular" style={{ color: 'var(--text-tertiary)' }} />
                    <h3 className="mb-1 text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{emptyTitle}</h3>
                    <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>{emptySubtitle}</p>
                    {emptyAction}
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={keyExtractor(row)}
                  className="border-b transition-colors duration-150 hover:bg-[var(--color-neutral-50)]"
                  style={{ borderColor: 'var(--border-default)' }}
                >
                  {columns.map((col, j) => (
                    <td key={j} className="px-6 py-4 text-sm" style={{ color: 'var(--text-primary)' }}>
                      {typeof col.accessor === 'function'
                        ? col.accessor(row)
                        : (row[col.accessor] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && data.length > 0 && !loading && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
          <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}-
            {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
            {pagination.totalItems} results
          </div>
          <div className="flex gap-1">
            <button
              disabled={pagination.currentPage === 1}
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              className="rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', borderColor: 'var(--border-default)' }}
            >
              Previous
            </button>
            {Array.from({ length: pagination.totalPages }).map((_, i) => {
              const page = i + 1;
              // Simple pagination logic for demonstration (could be improved with ellipsis for large number of pages)
              if (
                page === 1 ||
                page === pagination.totalPages ||
                (page >= pagination.currentPage - 1 && page <= pagination.currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => pagination.onPageChange(page)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors duration-150 ${
                      pagination.currentPage === page
                        ? 'border text-white'
                        : 'border'
                    }`}
                    style={pagination.currentPage === page ? { backgroundColor: 'var(--color-primary-600)', borderColor: 'var(--color-primary-600)' } : { backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', borderColor: 'var(--border-default)' }}
                  >
                    {page}
                  </button>
                );
              }
              if (page === pagination.currentPage - 2 || page === pagination.currentPage + 2) {
                return <span key={page} className="px-1 py-1.5" style={{ color: 'var(--text-tertiary)' }}>...</span>;
              }
              return null;
            })}
            <button
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              className="rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', borderColor: 'var(--border-default)' }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
