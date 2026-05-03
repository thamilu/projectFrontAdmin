/**
 * Mutation Factory
 *
 * Provides typed, reusable `onSuccess` and `onError` handlers for
 * `useMutation` calls across all admin hooks.
 *
 * Eliminates the 8-line boilerplate that was duplicated 10+ times:
 *
 *   onSuccess: () => {
 *     queryClient.invalidateQueries({ queryKey: KEY });
 *     toast.success('...');
 *   },
 *   onError: (error: any) => {
 *     toast.error(error.message || '...');
 *   }
 */

'use client';

import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils/error-handling';

/**
 * Returns typed `onSuccess` and `onError` handler factories bound to
 * the given `primaryQueryKey`.
 *
 * @param primaryQueryKey  The primary query key to invalidate on success.
 *
 * @example
 * ```ts
 * const { onSuccess, onError } = useMutationHandlers(ADMIN_USERS_QUERY_KEY);
 *
 * const updateStatus = useMutation({
 *   mutationFn: ...,
 *   onSuccess: onSuccess('User status updated'),
 *   onError: onError('Failed to update status'),
 * });
 * ```
 */
export function useMutationHandlers(primaryQueryKey: unknown[]) {
  const queryClient = useQueryClient();

  /**
   * Creates an `onSuccess` callback that:
   * 1. Invalidates `primaryQueryKey` (and any extra keys you pass)
   * 2. Shows a success toast
   *
   * @param successMessage   Toast message on success.
   * @param extraQueryKeys   Additional query keys that should also be invalidated.
   */
  const onSuccess =
    (successMessage: string, extraQueryKeys?: unknown[][]) =>
    () => {
      queryClient.invalidateQueries({ queryKey: primaryQueryKey });
      extraQueryKeys?.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: key })
      );
      toast.success(successMessage);
    };

  /**
   * Creates an `onError` callback that:
   * 1. Extracts the error message safely (works with ApiError, Error, and plain objects)
   * 2. Shows an error toast, falling back to `fallbackMessage`
   *
   * @param fallbackMessage  Toast message shown when the error has no message.
   */
  const onError =
    (fallbackMessage: string) =>
    (error: unknown) => {
      toast.error(getErrorMessage(error) || fallbackMessage);
    };

  return { onSuccess, onError, queryClient };
}
