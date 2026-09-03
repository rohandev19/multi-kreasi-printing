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
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} weight="regular" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearch(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-full sm:w-72 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm placeholder:text-slate-400 transition-all outline-none"
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
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {columns.map((col, i) => (
                <th
                  key={i}
                  className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider"
                >
                  <div className="flex items-center gap-1 cursor-default">
                    {col.header}
                    {col.sortable && (
                      <div className="flex flex-col">
                        <CaretUp size={12} className="text-slate-400" weight="regular" />
                        <CaretDown size={12} className="-mt-1 text-slate-400" weight="regular" />
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
                <tr key={i} className="border-b border-slate-100">
                  {columns.map((__, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <MagnifyingGlass size={48} className="text-slate-300 mb-4" weight="regular" />
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{emptyTitle}</h3>
                    <p className="text-slate-500 mb-4">{emptySubtitle}</p>
                    {emptyAction}
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={keyExtractor(row)}
                  className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                >
                  {columns.map((col, j) => (
                    <td key={j} className="px-6 py-4 text-sm text-slate-700">
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
          <div className="text-sm text-slate-500 font-medium">
            Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}-
            {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
            {pagination.totalItems} results
          </div>
          <div className="flex gap-1">
            <button
              disabled={pagination.currentPage === 1}
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              className="px-3 py-1.5 bg-white text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
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
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      pagination.currentPage === page
                        ? 'bg-primary-600 text-white border-primary-600 border'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              }
              if (page === pagination.currentPage - 2 || page === pagination.currentPage + 2) {
                return <span key={page} className="px-1 py-1.5 text-slate-400">...</span>;
              }
              return null;
            })}
            <button
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              className="px-3 py-1.5 bg-white text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
