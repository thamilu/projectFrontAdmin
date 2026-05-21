'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useCallback, useMemo } from 'react';
import type { AdminDashboardData, DateRange } from '@/features/admin/analytics/types';
import type { ApiError } from '@/types/api';
import { axiosClient } from '@/infrastructure/http/client';
import type { ApiResponse } from '@/features/admin/types';
import { API_ENDPOINTS } from '@/constants';

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
    if (dateRange.from) params.from = dateRange.from.toISOString();
    if (dateRange.to) params.to = dateRange.to.toISOString();
    if (dateRange.preset) {
      params.preset = dateRange.preset;
    }
  }

  const response = await axiosClient.get<ApiResponse<AdminDashboardData>>(API_ENDPOINTS.DASHBOARD.ADMIN, { params });

  if (!response.data || !response.data.success || !response.data.data) {
    throw (response.data as unknown as Record<string, unknown>)?.error || {
      code: 'FETCH_ERROR',
      message: 'Failed to fetch dashboard data',
    };
  }

  return response.data.data;
}

export function useAdminDashboard(
  options: UseAdminDashboardOptions = {}
): UseAdminDashboardReturn {
  const {
    dateRange,
    refreshInterval = 5 * 60 * 1000, // 5 minutes
    enabled = true,
  } = options;

  const queryClient = useQueryClient();
  const { status: sessionStatus } = useSession();
  const sessionReady = sessionStatus === 'authenticated';

  // Create stable query key
  const queryKey = useMemo(
    () => ['admin-dashboard', dateRange?.from?.toISOString(), dateRange?.to?.toISOString()],
    [dateRange]
  );

  const query = useQuery<AdminDashboardData, ApiError>({
    queryKey,
    queryFn: () => fetchDashboardData(dateRange),
    enabled: enabled && sessionReady,
    refetchInterval: refreshInterval,
    staleTime: 60 * 1000,    // 1 minute
    gcTime: 300000,          // 5 minutes
    retry: (failureCount, error) => {
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
