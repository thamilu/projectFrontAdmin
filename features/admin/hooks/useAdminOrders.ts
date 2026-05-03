/**
 * Admin Orders Hook
 * Hook for managing orders in the admin panel
 */

'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { getOrders, getOrderById, updateOrderStatus } from '../api';
import type { AdminOrder, OrderFilters, OrderStatus } from '../types';
import { usePagedResource } from './use-paged-resource';
import { useMutationHandlers } from './mutation-factory';

export const ADMIN_ORDERS_QUERY_KEY = ['admin', 'orders'];

export function useAdminOrders(initialFilters: OrderFilters = { page: 0, size: 10 }) {
  const { onSuccess, onError } = useMutationHandlers(ADMIN_ORDERS_QUERY_KEY);

  const { items: orders, ...tableState } = usePagedResource<OrderFilters, AdminOrder>({
    queryKey: ADMIN_ORDERS_QUERY_KEY,
    queryFn: getOrders,
    initialFilters,
    filterKeys: { status: initialFilters.status },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus | string }) =>
      updateOrderStatus(id, status),
    onSuccess: onSuccess('Order status updated'),
    onError: onError('Failed to update order status'),
  });

  return {
    orders,
    ...tableState,
    updateStatus: updateStatusMutation.mutate,
    isUpdating: updateStatusMutation.isPending,
  };
}

export function useAdminOrder(id: number) {
  const orderQuery = useQuery<AdminOrder, Error>({
    queryKey: [ADMIN_ORDERS_QUERY_KEY, id],
    queryFn: () => getOrderById(id),
    enabled: !!id,
  });

  return {
    order: orderQuery.data,
    isLoading: orderQuery.isLoading,
    isError: orderQuery.isError,
    error: orderQuery.error,
  };
}
