/**
 * Admin Feature API
 * API functions for admin-specific operations using standardized apiClient
 */

import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type {
  ApiResponse,
  PageResponse,
  AdminDashboardStats,
  AdminUser,
  UserRole,
  UserFilters,
  AdminCategory,
  CategoryRequest,
  CategoryReviewRequest,
  AdminShop,
  ShopFilters,
  AdminOrder,
  OrderStatus,
  OrderFilters,
  AdminProduct,
  ProductStatus,
  ProductFilters,
  StockUpdateRequest,
  AdminAnalytics,
} from './types';

// Dashboard API
export async function getDashboardStats() {
  const response = await fetch(API_ENDPOINTS.DASHBOARD.ADMIN);
  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard stats: ${response.statusText}`);
  }
  const result = await response.json();
  return result.data || result;
}

// User Management API
export async function getUsers(filters?: UserFilters) {
  const response = await apiClient.get<ApiResponse<PageResponse<AdminUser>>>(API_ENDPOINTS.USERS.LIST, {
    params: filters
  });
  return response.data.data;
}

export async function getUsersByRole(role: string, filters?: Omit<UserFilters, 'role'>) {
  const response = await apiClient.get<ApiResponse<PageResponse<AdminUser>>>(API_ENDPOINTS.USERS.BY_ROLE(role), {
    params: filters
  });
  return response.data.data;
}

export async function updateUserStatus(id: number, active: boolean) {
  const endpoint = active ? API_ENDPOINTS.USERS.ACTIVATE(id) : API_ENDPOINTS.USERS.DEACTIVATE(id);
  const response = await apiClient.put<ApiResponse<AdminUser>>(endpoint, {});
  return response.data.data;
}

export async function updateUserRole(id: number, role: UserRole) {
  const response = await apiClient.put<ApiResponse<AdminUser>>(API_ENDPOINTS.USERS.SET_ROLE(id), { role });
  return response.data.data;
}

// Category Management API
export async function getCategories() {
  const response = await apiClient.get<ApiResponse<AdminCategory[]>>(API_ENDPOINTS.CATEGORIES.LIST);
  return response.data.data;
}

export async function createCategory(name: string) {
  const response = await apiClient.post<ApiResponse<AdminCategory>>(API_ENDPOINTS.CATEGORIES.ADMIN_CREATE, { name });
  return response.data.data;
}

export async function deleteCategory(id: number) {
  await apiClient.delete(API_ENDPOINTS.CATEGORIES.DELETE(id));
}

export async function getPendingCategoryRequests() {
  const response = await apiClient.get<ApiResponse<CategoryRequest[]>>(API_ENDPOINTS.CATEGORIES.PENDING_REQUESTS);
  return response.data.data;
}

export async function reviewCategoryRequest(requestId: number, data: CategoryReviewRequest) {
  const response = await apiClient.put<ApiResponse<any>>(API_ENDPOINTS.CATEGORIES.REVIEW_REQUEST(requestId), data);
  return response.data.data;
}

// Store/Shop Management API
export async function getShops(filters?: ShopFilters) {
  const response = await apiClient.get<ApiResponse<PageResponse<AdminShop>>>(API_ENDPOINTS.SHOPS.LIST, {
    params: filters
  });
  return response.data.data;
}

export async function searchShops(keyword: string, filters?: Omit<ShopFilters, 'keyword'>) {
  const response = await apiClient.get<ApiResponse<PageResponse<AdminShop>>>(API_ENDPOINTS.SHOPS.SEARCH, {
    params: { ...filters, keyword }
  });
  return response.data.data;
}

// Order Management API
export async function getOrders(filters?: OrderFilters) {
  const response = await apiClient.get<ApiResponse<PageResponse<AdminOrder>>>(API_ENDPOINTS.ORDERS.LIST, {
    params: filters
  });
  return response.data.data;
}

export async function getOrderById(id: number) {
  const response = await apiClient.get<ApiResponse<AdminOrder>>(API_ENDPOINTS.ORDERS.DETAIL(id));
  return response.data.data;
}

export async function updateOrderStatus(id: number, status: OrderStatus | string) {
  const response = await apiClient.put<ApiResponse<AdminOrder>>(API_ENDPOINTS.ORDERS.UPDATE_STATUS(id), { status });
  return response.data.data;
}

// Product & Inventory API
export async function getProducts(filters?: ProductFilters) {
  const response = await apiClient.get<ApiResponse<PageResponse<AdminProduct>>>(API_ENDPOINTS.PRODUCTS.LIST, {
    params: filters
  });
  return response.data.data;
}

export async function updateProductStock(id: number, data: StockUpdateRequest) {
  const response = await apiClient.patch<ApiResponse<AdminProduct>>(API_ENDPOINTS.PRODUCTS.UPDATE_STOCK(id), data);
  return response.data.data;
}

export async function getProductById(id: number) {
  const response = await apiClient.get<ApiResponse<AdminProduct>>(API_ENDPOINTS.PRODUCTS.DETAIL(id));
  return response.data.data;
}

export async function updateProductStatus(id: number, status: ProductStatus) {
  const response = await apiClient.put<ApiResponse<AdminProduct>>(API_ENDPOINTS.PRODUCTS.UPDATE_STATUS(id), { status });
  return response.data.data;
}

export async function toggleProductFeatured(id: number, isFeatured: boolean) {
  const response = await apiClient.put<ApiResponse<AdminProduct>>(API_ENDPOINTS.PRODUCTS.TOGGLE_FEATURED(id), { isFeatured });
  return response.data.data;
}

// Analytics API
export async function getAdminAnalytics(period: string = 'month') {
  const url = API_ENDPOINTS.ANALYTICS.PAYMENT(period);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch analytics: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data || result;
}
