/**
 * Error Handler
 * Centralized error handling logic
 */

import { AppError } from './custom-errors';
import { toast } from 'sonner';
import { logger } from '@/core/observability/logger';
import type { ApiError } from '@/core/errors/api-error';

export interface ErrorResponse {
  message: string;
  code: string;
  statusCode: number;
  fields?: Record<string, string>;
}

export interface ErrorDetails {
  message: string;
  statusCode?: number;
  field?: string;
  details?: unknown;
}

export function handleError(error: unknown): ErrorResponse {
  // Handle AppError instances
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fields: 'fields' in error ? (error as any).fields : undefined,
    };
  }

  // Handle Axios errors
  if (isAxiosError(error)) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.message || 'An error occurred';
    const code = error.response?.data?.code || 'UNKNOWN_ERROR';

    return {
      message,
      code,
      statusCode: status,
      fields: error.response?.data?.fields,
    };
  }

  // Handle generic errors
  if (error instanceof Error) {
    return {
      message: error.message || 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      statusCode: 500,
    };
  }

  // Handle unknown errors
  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    statusCode: 500,
  };
}

export function displayError(error: unknown): void {
  const errorResponse = handleError(error);
  
  // Display user-friendly error message
  toast.error(getUserFriendlyMessage(errorResponse));
  
  // Log error for debugging (only in development)
  if (process.env.NODE_ENV === 'development') {
    logger.error('Error:', { errorResponse });
  }
}

function getUserFriendlyMessage(error: ErrorResponse): string {
  const messages: Record<string, string> = {
    AUTHENTICATION_ERROR: 'Please log in to continue',
    AUTHORIZATION_ERROR: 'You do not have permission to perform this action',
    NOT_FOUND: 'The requested resource was not found',
    VALIDATION_ERROR: 'Please check your input and try again',
    NETWORK_ERROR: 'Network error. Please check your connection',
    RATE_LIMIT_ERROR: 'Too many requests. Please try again later',
    PAYMENT_ERROR: 'Payment failed. Please try again',
    INVENTORY_ERROR: 'Product is out of stock',
  };

  return messages[error.code] || error.message || 'An error occurred';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isAxiosError(error: any): error is { response?: { status: number; data: any }; message: string } {
  return error && error.isAxiosError === true;
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
 */
export function withErrorHandling<Args extends unknown[], Return>(
  fn: (...args: Args) => Promise<Return>,
  errorMessage?: string
): (...args: Args) => Promise<Return | null> {
  return async (...args: Args): Promise<Return | null> => {
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
  additionalInfo?: Record<string, unknown>
): void {
  const message = getErrorMessage(error);
  
  logger.error(`[${context}] ${message}`, {
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
  details?: unknown
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
