/**
 * Admin Categories Hook
 * Hook for managing categories and category requests in the admin panel
 */

'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import {
  getCategories,
  createCategory,
  deleteCategory,
  getPendingCategoryRequests,
  reviewCategoryRequest,
} from '../api';
import type {
  AdminCategory,
  CategoryRequest,
  CategoryReviewRequest,
} from '../types';
import { useMutationHandlers } from '@/features/admin/hooks/mutation-factory';

export const ADMIN_CATEGORIES_QUERY_KEY = ['admin', 'categories'];
export const ADMIN_CATEGORY_REQUESTS_QUERY_KEY = ['admin', 'category-requests'];

export function useAdminCategories() {
  const { onSuccess, onError } = useMutationHandlers(ADMIN_CATEGORIES_QUERY_KEY);

  const categoriesQuery = useQuery<AdminCategory[], Error>({
    queryKey: ADMIN_CATEGORIES_QUERY_KEY,
    queryFn: getCategories,
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => createCategory(name),
    onSuccess: onSuccess('Category created successfully'),
    onError: onError('Failed to create category'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: onSuccess('Category deleted successfully'),
    onError: onError('Failed to delete category'),
  });

  return {
    categories: categoriesQuery.data ?? [],
    isLoading: categoriesQuery.isLoading,
    isError: categoriesQuery.isError,
    error: categoriesQuery.error,
    create: createMutation.mutate,
    remove: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useAdminCategoryRequests() {
  const { onError, queryClient } = useMutationHandlers(
    ADMIN_CATEGORY_REQUESTS_QUERY_KEY
  );

  const requestsQuery = useQuery<CategoryRequest[], Error>({
    queryKey: ADMIN_CATEGORY_REQUESTS_QUERY_KEY,
    queryFn: getPendingCategoryRequests,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, review }: { id: number; review: CategoryReviewRequest }) =>
      reviewCategoryRequest(id, review),
    onSuccess: (_, variables) => {
      // Use the factory's invalidation logic, then conditionally also refresh categories
      queryClient.invalidateQueries({ queryKey: ADMIN_CATEGORY_REQUESTS_QUERY_KEY });
      if (variables.review.approved) {
        queryClient.invalidateQueries({ queryKey: ADMIN_CATEGORIES_QUERY_KEY });
      }
      const action = variables.review.approved ? 'approved' : 'rejected';
      // toast shown inline here because message is dynamic
      import('sonner').then(({ toast }) =>
        toast.success(`Request ${action} successfully`)
      );
    },
    onError: onError('Action failed'),
  });

  return {
    requests: requestsQuery.data ?? [],
    isLoading: requestsQuery.isLoading,
    isError: requestsQuery.isError,
    review: reviewMutation.mutate,
    isReviewing: reviewMutation.isPending,
  };
}
