import React from 'react';
import { Search, ChevronUp, ChevronDown, Inbox } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string | number;
  
  // Search & Filters
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  
  // Actions
  actionButton?: React.ReactNode;
  
  // Sorting
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string) => void;
  
  // Pagination
  currentPage?: number;
  totalPages?: number;
  totalResults?: number;
  onPageChange?: (page: number) => void;
  
  // State
  loading?: boolean;
  emptyStateTitle?: string;
  emptyStateSubtitle?: string;
  emptyStateAction?: React.ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  
  searchTerm,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters,
  actionButton,
  
  sortColumn,
  sortDirection,
  onSort,
  
  currentPage = 1,
  totalPages = 1,
  totalResults = 0,
  onPageChange,
  
  loading = false,
  emptyStateTitle = 'No results found',
  emptyStateSubtitle = 'Try adjusting your search or filters',
  emptyStateAction,
}: DataTableProps<T>) {
  
  const handleSort = (column: Column<T>) => {
    if (column.sortable && typeof column.accessor === 'string' && onSort) {
      onSort(column.accessor as string);
    }
  };

  const renderSortIcon = (column: Column<T>) => {
    if (!column.sortable || typeof column.accessor !== 'string') return null;
    
    const isSorted = sortColumn === column.accessor;
    if (!isSorted) {
      return (
        <div className="flex flex-col ml-2 opacity-30 group-hover:opacity-100 transition-opacity">
          <ChevronUp size={10} className="-mb-1" />
          <ChevronDown size={10} />
        </div>
      );
    }
    
    return (
      <div className="ml-2 text-indigo-600">
        {sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header Bar */}
      {(onSearchChange !== undefined || filters || actionButton) && (
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-slate-50/50">
          <div className="flex-1 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {onSearchChange !== undefined && (
              <div className="relative w-full sm:w-72">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm || ''}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder:text-slate-400 transition-shadow"
                />
              </div>
            )}
            
            {filters && (
              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
                {filters}
              </div>
            )}
          </div>
          
          {actionButton && (
            <div className="w-full sm:w-auto shrink-0">
              {actionButton}
            </div>
          )}
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  onClick={() => handleSort(col)}
                  className={`px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider ${col.sortable ? 'cursor-pointer select-none group hover:bg-slate-100/50 transition-colors' : ''} ${col.className || ''}`}
                >
                  <div className="flex items-center">
                    {col.header}
                    {renderSortIcon(col)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              // Loading Skeleton
              Array.from({ length: 5 }).map((_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`} className="animate-pulse">
                  {columns.map((_, colIndex) => (
                    <td key={`skeleton-col-${colIndex}`} className="px-6 py-5">
                      <div className="h-4 bg-slate-200 rounded w-full max-w-[80%]"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                      <Inbox size={32} className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{emptyStateTitle}</h3>
                    <p className="text-sm text-slate-500 mb-6">{emptyStateSubtitle}</p>
                    {emptyStateAction}
                  </div>
                </td>
              </tr>
            ) : (
              // Data Rows
              data.map((row) => (
                <tr key={keyExtractor(row)} className="hover:bg-slate-50/70 transition-colors group">
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className={`px-6 py-4 text-sm text-slate-700 ${col.className || ''}`}>
                      {typeof col.accessor === 'function' ? col.accessor(row) : (row[col.accessor] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && data.length > 0 && onPageChange && totalPages > 1 && (
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm font-medium text-slate-500">
            Showing <span className="text-slate-700 font-bold">{(currentPage - 1) * 10 + 1}</span> to{' '}
            <span className="text-slate-700 font-bold">
              {Math.min(currentPage * 10, totalResults || data.length)}
            </span>{' '}
            of <span className="text-slate-700 font-bold">{totalResults || data.length}</span> results
          </div>
          
          <div className="flex gap-1">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm font-medium rounded-lg text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNumber = idx + 1;
              
              // Simple pagination display logic (show few pages around current)
              if (
                totalPages > 5 &&
                pageNumber !== 1 &&
                pageNumber !== totalPages &&
                Math.abs(currentPage - pageNumber) > 1
              ) {
                if (pageNumber === 2 || pageNumber === totalPages - 1) {
                  return <span key={idx} className="px-2 py-1.5 text-slate-400">...</span>;
                }
                return null;
              }
              
              return (
                <button
                  key={idx}
                  onClick={() => onPageChange(pageNumber)}
                  className={`px-3 py-1.5 text-sm font-bold rounded-lg transition-colors ${
                    currentPage === pageNumber
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
            
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm font-medium rounded-lg text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
