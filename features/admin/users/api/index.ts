/**
 * Users Feature API
 */

import { axiosClient } from '@/infrastructure/http/client';
import { API_ENDPOINTS } from '@/constants';
import type { ApiResponse, PageResponse } from '@/features/admin/types';
import type { AdminUser, UserFilters, UserRole } from '../types';

function unwrapPageData<T>(payload: unknown): PageResponse<T> {
  if (!payload || typeof payload !== 'object') {
    throw { code: 'FETCH_ERROR', message: 'Invalid users response' };
  }

  const record = payload as Record<string, unknown>;

  if (record.data && typeof record.data === 'object') {
    const inner = record.data as Record<string, unknown>;
    if (Array.isArray(inner.content)) {
      return inner as PageResponse<T>;
    }
  }

  if (Array.isArray(record.content)) {
    return record as PageResponse<T>;
  }

  throw { code: 'FETCH_ERROR', message: 'Failed to parse users page response' };
}

function unwrapEntity<T>(payload: unknown): T {
  if (!payload || typeof payload !== 'object') {
    throw { code: 'FETCH_ERROR', message: 'Invalid user response' };
  }

  const record = payload as Record<string, unknown>;
  if (record.data !== undefined) {
    return record.data as T;
  }

  return payload as T;
}

export async function getUsers(filters?: UserFilters) {
  const response = await axiosClient.get(API_ENDPOINTS.USERS.LIST, {
    params: filters,
  });
  return unwrapPageData<AdminUser>(response.data);
}

export async function getUsersByRole(role: string, filters?: Omit<UserFilters, 'role'>) {
  const response = await axiosClient.get(API_ENDPOINTS.USERS.BY_ROLE(role), {
    params: filters,
  });
  return unwrapPageData<AdminUser>(response.data);
}

export async function updateUserStatus(id: number, active: boolean) {
  const endpoint = active ? API_ENDPOINTS.USERS.ACTIVATE(id) : API_ENDPOINTS.USERS.DEACTIVATE(id);
  const response = await axiosClient.put<ApiResponse<AdminUser>>(endpoint, {});
  return unwrapEntity<AdminUser>(response.data);
}

export async function updateUserRole(id: number, role: UserRole) {
  const response = await axiosClient.put<ApiResponse<AdminUser>>(
    API_ENDPOINTS.USERS.SET_ROLE(id),
    { role }
  );
  return unwrapEntity<AdminUser>(response.data);
}
