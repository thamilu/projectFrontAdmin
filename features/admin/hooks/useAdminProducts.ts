/**
 * Admin Products Hook
 * Hook for managing products in the admin panel
 */

'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import {
  getProducts,
  getProductById,
  updateProductStatus,
  toggleProductFeatured,
} from '../api';
import type { AdminProduct, ProductFilters, ProductStatus } from '../types';
import { usePagedResource } from './use-paged-resource';
import { useMutationHandlers } from './mutation-factory';

export const ADMIN_PRODUCTS_QUERY_KEY = ['admin', 'products'];

export function useAdminProducts(initialFilters: ProductFilters = { page: 0, size: 10 }) {
  const { onSuccess, onError } = useMutationHandlers(ADMIN_PRODUCTS_QUERY_KEY);

  const { items: products, ...tableState } = usePagedResource<ProductFilters, AdminProduct>({
    queryKey: ADMIN_PRODUCTS_QUERY_KEY,
    queryFn: getProducts,
    initialFilters,
    filterKeys: {
      status: initialFilters.status,
      categoryId: initialFilters.categoryId,
      isFeatured: initialFilters.isFeatured,
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: ProductStatus }) =>
      updateProductStatus(id, status),
    onSuccess: onSuccess('Product status updated'),
    onError: onError('Failed to update product status'),
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: ({ id, isFeatured }: { id: number; isFeatured: boolean }) =>
      toggleProductFeatured(id, isFeatured),
    onSuccess: onSuccess('Featured status updated'),
    onError: onError('Failed to update featured status'),
  });

  return {
    products,
    ...tableState,
    updateStatus: updateStatusMutation.mutate,
    toggleFeatured: toggleFeaturedMutation.mutate,
    isUpdating: updateStatusMutation.isPending || toggleFeaturedMutation.isPending,
  };
}

export function useAdminProduct(id: number) {
  const productQuery = useQuery<AdminProduct, Error>({
    queryKey: [ADMIN_PRODUCTS_QUERY_KEY, id],
    queryFn: () => getProductById(id),
    enabled: !!id,
  });

  return {
    product: productQuery.data,
    isLoading: productQuery.isLoading,
    isError: productQuery.isError,
    error: productQuery.error,
  };
}
