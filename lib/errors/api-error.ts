/**
 * ApiError — typed error class for API call failures.
 *
 * Replaces `error: any` across all admin hooks, giving TypeScript
 * full visibility into the error shape coming from backend responses.
 */
export class ApiError extends Error {
  /** HTTP status code (e.g. 400, 401, 403, 404, 500) */
  status?: number;
  /** Application-level error code from the backend (e.g. 'USER_NOT_FOUND') */
  code?: string;
  /** Additional details from the backend response body */
  details?: unknown;

  constructor(message: string, status?: number, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    // Required for 'instanceof' checks to work correctly in transpiled code
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /** Creates an ApiError from a raw backend response JSON object */
  static fromResponse(data: unknown, status: number): ApiError {
    if (typeof data === 'object' && data !== null) {
      const d = data as Record<string, unknown>;
      return new ApiError(
        String(d.message || d.error || `Request failed with status ${status}`),
        status,
        typeof d.code === 'string' ? d.code : undefined,
        d.details
      );
    }
    return new ApiError(`Request failed with status ${status}`, status);
  }

  /** True if this is an authentication/authorization error */
  get isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  /** True if this is a client-side validation error */
  get isValidationError(): boolean {
    return this.status === 400 || this.status === 422;
  }
}
