/**
 * Admin Analytics Hook
 * Hook for fetching and managing period-based admin analytics data
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { getAdminAnalytics } from '../api';
import type { AdminAnalytics } from '../types';

export const ADMIN_ANALYTICS_QUERY_KEY = 'admin-analytics';

export function useAdminAnalytics(period: AdminAnalytics['period'] = 'month') {
  const analyticsQuery = useQuery<AdminAnalytics, Error>({
    queryKey: [ADMIN_ANALYTICS_QUERY_KEY, period],
    queryFn: () => getAdminAnalytics(period),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  return {
    analytics: analyticsQuery.data,
    isLoading: analyticsQuery.isLoading,
    isError: analyticsQuery.isError,
    error: analyticsQuery.error,
    refetch: analyticsQuery.refetch,
  };
}
