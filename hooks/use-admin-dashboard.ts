'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import type { AdminDashboardData, DateRange } from '@/types/dashboard';
import type { ApiError } from '@/types/api';
import { api } from '@/lib/api-client';

interface UseAdminDashboardOptions {
  dateRange?: DateRange;
  refreshInterval?: number;
  enabled?: boolean;
}

interface UseAdminDashboardReturn {
  data: AdminDashboardData | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: ApiError | null;
  refresh: () => void;
  lastUpdated: Date | null;
}

async function fetchDashboardData(dateRange?: DateRange): Promise<AdminDashboardData> {
  const params: Record<string, string | number | boolean | undefined> = {};

  if (dateRange) {
    params.from = dateRange.from.toISOString();
    params.to = dateRange.to.toISOString();
    if (dateRange.preset) {
      params.preset = dateRange.preset;
    }
  }

  const response = await api.get<AdminDashboardData>('/dashboard/admin', { params });

  if (!response.success || !response.data) {
    throw response.error || {
      code: 'FETCH_ERROR',
      message: 'Failed to fetch dashboard data',
    };
  }

  return response.data;
}


export function useAdminDashboard(
  options: UseAdminDashboardOptions = {}
): UseAdminDashboardReturn {
  const {
    dateRange,
    refreshInterval = 5 * 60 * 1000, // 5 minutes — aggregate stats don't change per-second
    enabled = true,
  } = options;

  const queryClient = useQueryClient();

  // Create stable query key
  const queryKey = useMemo(
    () => ['admin-dashboard', dateRange?.from?.toISOString(), dateRange?.to?.toISOString()],
    [dateRange]
  );

  const query = useQuery<AdminDashboardData, ApiError>({
    queryKey,
    queryFn: () => fetchDashboardData(dateRange),
    enabled,
    refetchInterval: refreshInterval,
    staleTime: 60 * 1000,    // 1 minute — avoid background refetches on focus
    gcTime: 300000,           // 5 minutes garbage collection
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error.code === 'UNAUTHORIZED' || error.code === 'FORBIDDEN') {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
  }, [queryClient]);

  const lastUpdated = useMemo(() => {
    if (query.data?.lastUpdated) {
      return new Date(query.data.lastUpdated);
    }
    return query.dataUpdatedAt ? new Date(query.dataUpdatedAt) : null;
  }, [query.data?.lastUpdated, query.dataUpdatedAt]);

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refresh,
    lastUpdated,
  };
}
