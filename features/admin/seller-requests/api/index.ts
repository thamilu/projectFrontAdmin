import { axiosClient } from '@/infrastructure/http/client';
import { API_ENDPOINTS } from '@/constants';
import type { ApiResponse, PageResponse } from '@/features/admin/types';
import type { AdminShop, ShopFilters } from '../types';

export async function getShops(filters?: ShopFilters) {
  const response = await axiosClient.get<ApiResponse<PageResponse<AdminShop>>>(API_ENDPOINTS.SHOPS.LIST, {
    params: filters
  });
  return response.data.data;
}

export async function searchShops(keyword: string, filters?: Omit<ShopFilters, 'keyword'>) {
  const response = await axiosClient.get<ApiResponse<PageResponse<AdminShop>>>(API_ENDPOINTS.SHOPS.SEARCH, {
    params: { ...filters, keyword }
  });
  return response.data.data;
}
