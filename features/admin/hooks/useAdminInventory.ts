/**
 * Admin Inventory Hook
 * Hook for managing product stock and inventory in the admin panel
 */

'use client';

import { useMutation } from '@tanstack/react-query';
import { getProducts, updateProductStock } from '../api';
import type { AdminProduct, ProductFilters, StockUpdateRequest } from '../types';
import { usePagedResource } from './use-paged-resource';
import { useMutationHandlers } from './mutation-factory';

export const ADMIN_INVENTORY_QUERY_KEY = ['admin', 'inventory'];
const ADMIN_PRODUCTS_QUERY_KEY = ['admin', 'products'];

export function useAdminInventory(
  initialFilters: ProductFilters = { page: 0, size: 50, sortBy: 'stockQuantity' }
) {
  const { onSuccess, onError } = useMutationHandlers(ADMIN_INVENTORY_QUERY_KEY);

  const { items: inventory, ...tableState } = usePagedResource<ProductFilters, AdminProduct>({
    queryKey: ADMIN_INVENTORY_QUERY_KEY,
    queryFn: getProducts,
    initialFilters,
    initialSortBy: initialFilters.sortBy,
    filterKeys: {
      lowStockOnly: initialFilters.lowStockOnly,
      status: initialFilters.status,
    },
  });

  const stockMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: StockUpdateRequest }) =>
      updateProductStock(id, data),
    // Invalidates both inventory AND products (extra key)
    onSuccess: onSuccess('Inventory updated successfully', [ADMIN_PRODUCTS_QUERY_KEY]),
    onError: onError('Failed to update stock'),
  });

  return {
    inventory,
    ...tableState,
    updateStock: stockMutation.mutate,
    isUpdating: stockMutation.isPending,
  };
}
