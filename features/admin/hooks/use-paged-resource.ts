/**
 * usePagedResource
 *
 * Generic base hook that encapsulates the repeated paged query pattern
 * used across all admin list hooks.
 *
 * Eliminates 15-line boilerplate that was duplicated 5 times:
 *
 *   const table = useDataTable<TFilters>({ ... });
 *   const query = useQuery({ queryKey: [...], queryFn: () => queryFn(params) });
 *   return {
 *     items: query.data?.content ?? [],
 *     totalElements: query.data?.totalElements ?? 0,
 *     totalPages: query.data?.totalPages ?? 0,
 *     isLoading: query.isLoading,
 *     isError: query.isError,
 *     ...table,
 *   };
 */

'use client';

import { useQuery, type QueryKey } from '@tanstack/react-query';
import { useDataTable } from '@/shared/table/use-data-table';

/** Minimal shape expected from paginated backend responses */
interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number?: number;
  size?: number;
}

interface UsePagedResourceOptions<TFilters extends object, TItem> {
  /** Query key base (will be combined with params for cache keys) */
  queryKey: QueryKey;
  /** The API function to call — given current table params */
  queryFn: (params: TFilters) => Promise<PageResponse<TItem>>;
  /**
   * Initial pagination + filter values.
   * page and size are required at runtime but may be typed as optional
   * in the filter interface, so we widen to allow both.
   */
  initialFilters: TFilters & { page?: number; size?: number };
  /** Subset of filters to pass to useDataTable as named filter state */
  filterKeys?: Record<string, unknown>;
  /** Optional sort override */
  initialSortBy?: string;
  /** Optional initial keyword */
  initialKeyword?: string;
}

/**
 * Generic hook for paginated admin resources.
 *
 * @example
 * ```ts
 * export function useAdminShops(initialFilters = { page: 0, size: 10 }) {
 *   const { items: shops, ...rest } = usePagedResource({
 *     queryKey: ADMIN_SHOPS_QUERY_KEY,
 *     queryFn: getShops,
 *     initialFilters,
 *   });
 *   return { shops, ...rest };
 * }
 * ```
 */
export function usePagedResource<TFilters extends object, TItem>({
  queryKey,
  queryFn,
  initialFilters,
  filterKeys,
  initialSortBy,
  initialKeyword,
}: UsePagedResourceOptions<TFilters, TItem>) {
  const table = useDataTable<TFilters>({
    initialPage: initialFilters.page,
    initialSize: initialFilters.size,
    // Cast to satisfy useDataTable's TFilters constraint — the record shape is compatible at runtime
    initialFilters: filterKeys as TFilters | undefined,
    initialSortBy,
    initialKeyword,
  });

  const query = useQuery({
    queryKey: [queryKey, table.queryParams],
    queryFn: () => queryFn(table.queryParams as TFilters),
  });

  return {
    /** Flattened array of the current page items (never null) */
    items: (query.data?.content ?? []) as TItem[],
    totalElements: query.data?.totalElements ?? 0,
    totalPages: query.data?.totalPages ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    /** Re-fetch the current page (useful for manual refresh buttons) */
    refetch: query.refetch,
    /** All table state and actions from useDataTable */
    ...table,
  };
}
