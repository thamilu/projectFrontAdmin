/**
 * Error Handling Utilities
 * 
 * Provides reusable error handling patterns
 * Eliminates duplicate error handling logic
 * 
 * @module lib/utils/error-handling
 */

import { toast } from 'sonner';
import type { ApiError } from '@/lib/errors/api-error';

export interface ErrorDetails {
  message: string;
  statusCode?: number;
  field?: string;
  details?: unknown;
}

/**
 * Extracts error message from various error types.
 * Handles ApiError, plain Error, objects with a message field, and strings.
 */
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error;

  // ApiError and all Error subclasses
  if (error instanceof Error) return error.message;

  // Plain objects with a message or error field (raw backend JSON)
  if (error && typeof error === 'object') {
    if ('message' in error && typeof (error as Record<string, unknown>).message === 'string') {
      return (error as { message: string }).message;
    }
    if ('error' in error && typeof (error as Record<string, unknown>).error === 'string') {
      return (error as { error: string }).error;
    }
  }

  return 'An unexpected error occurred';
}

/**
 * Type guard — returns true if the error is an ApiError.
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    error !== null &&
    typeof error === 'object' &&
    'name' in error &&
    (error as { name: string }).name === 'ApiError'
  );
}


/**
 * Shows error toast with standardized formatting
 * 
 * @example
 * ```ts
 * catch (error) {
 *   showErrorToast(error);
 * }
 * ```
 */
export function showErrorToast(
  error: unknown,
  defaultMessage: string = 'An error occurred'
): void {
  const message = getErrorMessage(error) || defaultMessage;
  toast.error(message);
}

/**
 * Shows success toast with standardized formatting
 */
export function showSuccessToast(message: string): void {
  toast.success(message);
}

/**
 * Handles async operation with try-catch and toast notifications
 * 
 * @example
 * ```ts
 * const result = await handleAsyncOperation(
 *   async () => await apiCall(),
 *   'Operation successful',
 *   'Operation failed'
 * );
 * 
 * if (result.success) {
 *   console.log(result.data);
 * }
 * ```
 */
export async function handleAsyncOperation<T>(
  operation: () => Promise<T>,
  successMessage?: string,
  errorMessage?: string
): Promise<{ success: boolean; data?: T; error?: unknown }> {
  try {
    const data = await operation();
    
    if (successMessage) {
      showSuccessToast(successMessage);
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Async operation failed:', error);
    
    if (errorMessage) {
      showErrorToast(error, errorMessage);
    }
    
    return { success: false, error };
  }
}

/**
 * Wraps an async function with error handling
 * Returns a safe version that won't throw
 * 
 * @example
 * ```ts
 * const safeApiCall = withErrorHandling(
 *   async () => await fetch('/api/data'),
 *   'Failed to fetch data'
 * );
 * 
 * const result = await safeApiCall();
 * ```
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  errorMessage?: string
): (...args: Parameters<T>) => Promise<ReturnType<T> | null> {
  return async (...args: Parameters<T>): Promise<ReturnType<T> | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error('Operation failed:', error);
      
      if (errorMessage) {
        showErrorToast(error, errorMessage);
      }
      
      return null;
    }
  };
}

/**
 * Logs error with context information
 * Useful for debugging and monitoring
 */
export function logError(
  error: unknown,
  context: string,
  additionalInfo?: Record<string, any>
): void {
  const message = getErrorMessage(error);
  
  console.error(`[${context}] ${message}`, {
    error,
    ...additionalInfo,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Creates a standardized error object
 */
export function createError(
  message: string,
  statusCode?: number,
  details?: any
): ErrorDetails {
  return {
    message,
    statusCode,
    details,
  };
}

/**
 * Checks if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }
  
  if (error && typeof error === 'object' && 'name' in error) {
    return error.name === 'NetworkError' || error.name === 'FetchError';
  }
  
  return false;
}

/**
 * Checks if error is an authorization error
 */
export function isAuthError(error: unknown): boolean {
  if (error && typeof error === 'object') {
    if ('statusCode' in error) {
      return error.statusCode === 401 || error.statusCode === 403;
    }
    
    const message = getErrorMessage(error).toLowerCase();
    return message.includes('unauthorized') || message.includes('forbidden');
  }
  
  return false;
}

/**
 * Retries an async operation with exponential backoff
 * 
 * @example
 * ```ts
 * const data = await retryOperation(
 *   () => fetch('/api/data'),
 *   { maxRetries: 3, delay: 1000 }
 * );
 * ```
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    delay?: number;
    backoff?: number;
    onRetry?: (attempt: number, error: unknown) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = 2,
    onRetry,
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries) {
        const waitTime = delay * Math.pow(backoff, attempt);
        
        if (onRetry) {
          onRetry(attempt + 1, error);
        }
        
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError;
}
