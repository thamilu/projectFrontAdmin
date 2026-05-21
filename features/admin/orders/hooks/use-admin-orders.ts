/**
 * Admin Orders Hook
 * Hook for managing orders in the admin panel
 */

'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { getOrders, getOrderById } from '../api';
import type { AdminOrder, OrderFilters, OrderStatus } from '../types';
import { OrdersService } from '../application/orders.service';
import { usePagedResource } from '@/features/admin/hooks/use-paged-resource';
import { useMutationHandlers } from '@/features/admin/hooks/mutation-factory';

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
    mutationFn: async ({ id, status }: { id: number; status: OrderStatus }) => {
      // Resolve current status from active hook dataset to protect invariants
      const order = orders.find((o) => o.id === id);
      const current = (order?.status as OrderStatus) || 'PENDING';
      return OrdersService.transitionStatus(id, current, status);
    },
    onSuccess: onSuccess('Order status updated successfully'),
    onError: (err: Error) => onError(err.message || 'Failed to update order status'),
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
