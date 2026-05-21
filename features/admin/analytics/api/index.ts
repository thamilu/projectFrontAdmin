import { axiosClient } from '@/infrastructure/http/client';
import { API_ENDPOINTS } from '@/constants';
import type { ApiResponse } from '@/features/admin/types';
import type { AdminDashboardStats, AdminAnalytics } from '../types';

export async function getDashboardStats(): Promise<AdminDashboardStats> {
  const response = await axiosClient.get<ApiResponse<AdminDashboardStats>>(API_ENDPOINTS.DASHBOARD.ADMIN);
  return response.data.data || (response.data as unknown as AdminDashboardStats);
}

export async function getAdminAnalytics(period: string = 'month'): Promise<AdminAnalytics> {
  const url = API_ENDPOINTS.ANALYTICS.PAYMENT(period);
  const response = await axiosClient.get<ApiResponse<AdminAnalytics>>(url);
  return response.data.data || (response.data as unknown as AdminAnalytics);
}
