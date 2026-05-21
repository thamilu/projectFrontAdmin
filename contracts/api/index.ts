/**
 * E-Shop Admin Contracts - API Specifications
 *
 * Defines unified shapes for standard request parameters, paginated responses,
 * error payloads, and REST responses for the platform.
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiErrorPayload;
  meta?: ApiMeta;
}

export interface ApiErrorPayload {
  message: string;
  status: number;
  code?: string;
  details?: Record<string, string[]>;
  requestId?: string;
}

export class ApiContractError extends Error {
  public status: number;
  public code?: string;
  public details?: Record<string, string[]>;
  public requestId?: string;

  constructor(
    message: string,
    status: number,
    details?: Record<string, string[]>,
    code?: string,
    requestId?: string
  ) {
    super(message);
    this.name = 'ApiContractError';
    this.status = status;
    this.details = details;
    this.code = code;
    this.requestId = requestId;
  }

  public toJSON(): ApiErrorPayload {
    return {
      message: this.message,
      status: this.status,
      code: this.code,
      details: this.details,
      requestId: this.requestId,
    };
  }
}

export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
