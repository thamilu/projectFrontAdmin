/**
 * Reusable API Fetch Utilities for React Hooks
 * 
 * Provides standardized patterns for API calls in hooks
 * Eliminates duplicate fetch logic
 * 
 * @module hooks/utils/api-fetch
 */

import { toast } from 'sonner';

export interface FetchOptions extends RequestInit {
  showErrorToast?: boolean;
  errorMessage?: string;
}

/**
 * Makes a fetch request with standardized error handling
 * Automatically parses JSON and handles common errors
 * 
 * @example
 * ```ts
 * const data = await apiFetch<Product[]>('/api/v1/products');
 * ```
 */
export async function apiFetch<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    showErrorToast = false,
    errorMessage,
    ...fetchOptions
  } = options;

  try {
    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
      ...fetchOptions,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const message = error.message || error.error || `Request failed: ${response.status} ${response.statusText}`;
      
      if (showErrorToast) {
        toast.error(errorMessage || message);
      }
      
      throw new APIError(message, response.status, error);
    }

    return await response.json() as T;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : 'Network error';
    
    if (showErrorToast) {
      toast.error(errorMessage || message);
    }
    
    throw new APIError(message, 0, error);
  }
}

/**
 * Makes a GET request
 */
export async function apiGet<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: 'GET',
    ...options,
  });
}

/**
 * Makes a POST request
 */
export async function apiPost<T = any>(
  endpoint: string,
  data?: any,
  options: FetchOptions = {}
): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
}

/**
 * Makes a PUT request
 */
export async function apiPut<T = any>(
  endpoint: string,
  data?: any,
  options: FetchOptions = {}
): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
}

/**
 * Makes a PATCH request
 */
export async function apiPatch<T = any>(
  endpoint: string,
  data?: any,
  options: FetchOptions = {}
): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
}

/**
 * Makes a DELETE request
 */
export async function apiDelete<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: 'DELETE',
    ...options,
  });
}

/**
 * Transforms backend data array with a mapper function
 * Handles various response formats (data.data, data, etc.)
 * 
 * @example
 * ```ts
 * const data = await apiGet('/api/v1/users');
 * const users = transformBackendArray(data, (item) => ({
 *   id: item.id,
 *   name: item.fullName,
 * }));
 * ```
 */
export function transformBackendArray<T, R>(
  response: any,
  mapper: (item: T) => R
): R[] {
  const rawItems = response.data || response;
  
  if (!Array.isArray(rawItems)) {
    return [];
  }

  return rawItems.map(mapper);
}

/**
 * Creates a standard mutation error handler
 * Shows toast and logs error
 */
export function createMutationErrorHandler(
  defaultMessage: string = 'Operation failed'
) {
  return (error: unknown) => {
    const message = error instanceof APIError 
      ? error.message 
      : error instanceof Error 
        ? error.message 
        : defaultMessage;
    
    toast.error(message);
    console.error(message, error);
  };
}

/**
 * Creates a standard mutation success handler
 * Shows toast and invalidates queries
 */
export function createMutationSuccessHandler(
  message: string,
  queryClient: any,
  queryKeys: string[][]
) {
  return () => {
    toast.success(message);
    queryKeys.forEach((key) => {
      queryClient.invalidateQueries({ queryKey: key });
    });
  };
}

// Custom Error Class
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}
