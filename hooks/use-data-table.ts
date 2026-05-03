/**
 * useDataTable Hook
 * 
 * A generic hook to manage state for data tables:
 * - Pagination (page, size)
 * - Sorting (sortBy, sortDir)
 * - Searching (keyword)
 * - Custom filters
 * 
 * Designed to work seamlessly with TanStack Query.
 */

import { useState, useCallback } from 'react';

export interface TableState<TFilters = any> {
  page: number;
  size: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  keyword?: string;
  filters: TFilters;
}

export interface UseDataTableOptions<TFilters = any> {
  initialPage?: number;
  initialSize?: number;
  initialSortBy?: string;
  initialSortDir?: 'asc' | 'desc';
  initialKeyword?: string;
  initialFilters?: TFilters;
}

export function useDataTable<TFilters = any>(options: UseDataTableOptions<TFilters> = {}) {
  const [state, setState] = useState<TableState<TFilters>>({
    page: options.initialPage ?? 0,
    size: options.initialSize ?? 10,
    sortBy: options.initialSortBy,
    sortDir: options.initialSortDir ?? 'desc',
    keyword: options.initialKeyword ?? '',
    filters: options.initialFilters ?? ({} as TFilters),
  });

  const setPage = useCallback((page: number) => {
    setState(prev => ({ ...prev, page }));
  }, []);

  const setSize = useCallback((size: number) => {
    setState(prev => ({ ...prev, size, page: 0 })); // Reset to first page on size change
  }, []);

  const setSort = useCallback((sortBy: string, sortDir?: 'asc' | 'desc') => {
    setState(prev => ({
      ...prev,
      sortBy,
      sortDir: sortDir ?? (prev.sortBy === sortBy && prev.sortDir === 'desc' ? 'asc' : 'desc'),
      page: 0
    }));
  }, []);

  const setKeyword = useCallback((keyword: string) => {
    setState(prev => ({ ...prev, keyword, page: 0 }));
  }, []);

  const setFilters = useCallback((filters: Partial<TFilters>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...filters },
      page: 0
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      page: options.initialPage ?? 0,
      size: options.initialSize ?? 10,
      sortBy: options.initialSortBy,
      sortDir: options.initialSortDir ?? 'desc',
      keyword: options.initialKeyword ?? '',
      filters: options.initialFilters ?? ({} as TFilters),
    });
  }, [options]);

  return {
    ...state,
    setPage,
    setSize,
    setSort,
    setKeyword,
    setFilters,
    reset,
    // Helper for easier API param spreading
    queryParams: {
      page: state.page,
      size: state.size,
      sortBy: state.sortBy,
      sortDir: state.sortDir,
      keyword: state.keyword,
      ...state.filters
    }
  };
}
