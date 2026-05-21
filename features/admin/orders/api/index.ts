/**
 * Orders Feature API
 */

import { axiosClient } from '@/infrastructure/http/client';
import { API_ENDPOINTS } from '@/constants';
import type { ApiResponse, PageResponse } from '@/features/admin/types';
import type { AdminOrder, OrderFilters, OrderStatus } from '../types';

export async function getOrders(filters?: OrderFilters) {
  const response = await axiosClient.get<ApiResponse<PageResponse<AdminOrder>>>(API_ENDPOINTS.ORDERS.LIST, {
    params: filters
  });
  return response.data.data;
}

export async function getOrderById(id: number) {
  const response = await axiosClient.get<ApiResponse<AdminOrder>>(API_ENDPOINTS.ORDERS.DETAIL(id));
  return response.data.data;
}

export async function updateOrderStatus(id: number, status: OrderStatus | string) {
  const response = await axiosClient.put<ApiResponse<AdminOrder>>(API_ENDPOINTS.ORDERS.UPDATE_STATUS(id), { status });
  return response.data.data;
}
