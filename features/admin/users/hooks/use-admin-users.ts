/**
 * Admin Users Hook
 * Hook for managing users in the admin panel
 */

'use client';

import { useMutation } from '@tanstack/react-query';
import { getUsers, updateUserStatus, updateUserRole } from '../api';
import type { AdminUser, UserFilters, UserRole } from '../types';
import { usePagedResource } from '@/features/admin/hooks/use-paged-resource';
import { useMutationHandlers } from '@/features/admin/hooks/mutation-factory';

export const ADMIN_USERS_QUERY_KEY = ['admin', 'users'];

export function useAdminUsers(initialFilters: UserFilters = { page: 0, size: 10 }) {
  const { onSuccess, onError } = useMutationHandlers(ADMIN_USERS_QUERY_KEY);

  const { items: users, ...tableState } = usePagedResource<UserFilters, AdminUser>({
    queryKey: ADMIN_USERS_QUERY_KEY,
    queryFn: getUsers,
    initialFilters,
    filterKeys: { role: initialFilters.role },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      updateUserStatus(id, active),
    onSuccess: onSuccess('User status updated'),
    onError: onError('Failed to update status'),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: UserRole }) =>
      updateUserRole(id, role),
    onSuccess: onSuccess('User role updated'),
    onError: onError('Failed to update role'),
  });

  return {
    users,
    ...tableState,
    updateStatus: updateStatusMutation.mutate,
    updateRole: updateRoleMutation.mutate,
    isUpdating: updateStatusMutation.isPending || updateRoleMutation.isPending,
  };
}
