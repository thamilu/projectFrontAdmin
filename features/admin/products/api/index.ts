/**
 * Products Feature API
 */

import { axiosClient } from '@/infrastructure/http/client';
import { API_ENDPOINTS } from '@/constants';
import type { ApiResponse, PageResponse } from '@/features/admin/types';
import type { AdminProduct, ProductFilters, ProductStatus, StockUpdateRequest, AdminCategory, CategoryRequest, CategoryReviewRequest } from '../types';

export async function getProducts(filters?: ProductFilters) {
  const response = await axiosClient.get<ApiResponse<PageResponse<AdminProduct>>>(API_ENDPOINTS.PRODUCTS.LIST, {
    params: filters
  });
  return response.data.data;
}

export async function getProductById(id: number) {
  const response = await axiosClient.get<ApiResponse<AdminProduct>>(API_ENDPOINTS.PRODUCTS.DETAIL(id));
  return response.data.data;
}

export async function updateProductStock(id: number, data: StockUpdateRequest) {
  const response = await axiosClient.patch<ApiResponse<AdminProduct>>(API_ENDPOINTS.PRODUCTS.UPDATE_STOCK(id), data);
  return response.data.data;
}

export async function updateProductStatus(id: number, status: ProductStatus) {
  const response = await axiosClient.put<ApiResponse<AdminProduct>>(API_ENDPOINTS.PRODUCTS.UPDATE_STATUS(id), { status });
  return response.data.data;
}

export async function toggleProductFeatured(id: number, isFeatured: boolean) {
  const response = await axiosClient.put<ApiResponse<AdminProduct>>(API_ENDPOINTS.PRODUCTS.TOGGLE_FEATURED(id), { isFeatured });
  return response.data.data;
}

export async function getCategories() {
  const response = await axiosClient.get<ApiResponse<AdminCategory[]>>(API_ENDPOINTS.CATEGORIES.LIST);
  return response.data.data;
}

export async function createCategory(name: string) {
  const response = await axiosClient.post<ApiResponse<AdminCategory>>(API_ENDPOINTS.CATEGORIES.ADMIN_CREATE, { name });
  return response.data.data;
}

export async function deleteCategory(id: number) {
  await axiosClient.delete(API_ENDPOINTS.CATEGORIES.DELETE(id));
}

export async function getPendingCategoryRequests() {
  const response = await axiosClient.get<ApiResponse<CategoryRequest[]>>(API_ENDPOINTS.CATEGORIES.PENDING_REQUESTS);
  return response.data.data;
}

export async function reviewCategoryRequest(requestId: number, data: CategoryReviewRequest) {
  const response = await axiosClient.put<ApiResponse<unknown>>(API_ENDPOINTS.CATEGORIES.REVIEW_REQUEST(requestId), data);
  return response.data.data;
}
