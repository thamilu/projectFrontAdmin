/**
 * Inventory Feature API
 */

import { axiosClient } from '@/infrastructure/http/client';
import { API_ENDPOINTS } from '@/constants';
import type { ApiResponse, PageResponse } from '@/features/admin/types';
import type { AdminProduct, ProductFilters, StockUpdateRequest } from '../types';

export async function getProducts(filters?: ProductFilters) {
  const response = await axiosClient.get<ApiResponse<PageResponse<AdminProduct>>>(API_ENDPOINTS.PRODUCTS.LIST, {
    params: filters
  });
  return response.data.data;
}

export async function updateProductStock(id: number, data: StockUpdateRequest) {
  const response = await axiosClient.patch<ApiResponse<AdminProduct>>(API_ENDPOINTS.PRODUCTS.UPDATE_STOCK(id), data);
  return response.data.data;
}
