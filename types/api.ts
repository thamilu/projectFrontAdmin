/**
 * Legacy API Types Facade
 * 
 * Re-exports structures from the centralized Contracts layer to preserve 
 * backward compatibility across existing services and UI components.
 */

import { 
  ApiResponse as ContractApiResponse, 
  ApiMeta as ContractApiMeta, 
  PaginationParams as ContractPaginationParams 
} from '@/contracts';

export type ApiResponse<T> = ContractApiResponse<T>;
export type ApiMeta = ContractApiMeta;
export type PaginationParams = ContractPaginationParams;

export class ApiError extends Error {
  public status: number;
  public code?: string;
  public details?: Record<string, string[]>;
  public requestId?: string;

  constructor(
    message: string,
    status: number,
    details?: Record<string, string[]>,
    code?: string
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
    this.code = code;
  }
}
