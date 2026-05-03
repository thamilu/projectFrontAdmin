/**
 * Request Validation Utilities
 * 
 * Provides reusable validation patterns for API routes
 * Eliminates duplicate validation logic
 * 
 * @module lib/api/request-validation
 */

import { NextResponse } from 'next/server';
import { z, ZodSchema, ZodError } from 'zod';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

/**
 * Validates request body against a Zod schema
 * Returns standardized validation result
 * 
 * @example
 * ```ts
 * const schema = z.object({ email: z.string().email() });
 * const result = await validateRequest(request, schema);
 * 
 * if (!result.success) {
 *   return NextResponse.json({ errors: result.errors }, { status: 400 });
 * }
 * 
 * const { email } = result.data;
 * ```
 */
export async function validateRequest<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<ValidationResult<T>> {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    
    return {
      success: true,
      data,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        errors: error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      };
    }

    return {
      success: false,
      errors: [
        {
          field: 'body',
          message: 'Invalid request body',
        },
      ],
    };
  }
}

/**
 * Validates request and returns error response if validation fails
 * Returns null if validation succeeds
 * 
 * @example
 * ```ts
 * const schema = z.object({ email: z.string().email() });
 * const errorResponse = await validateOrError(request, schema, requestId);
 * 
 * if (errorResponse) {
 *   return errorResponse; // Early return with error
 * }
 * 
 * // Continue with validated data
 * const body = await request.json();
 * ```
 */
export async function validateOrError<T>(
  request: Request,
  schema: ZodSchema<T>,
  requestId?: string
): Promise<NextResponse | null> {
  const result = await validateRequest(request, schema);

  if (!result.success) {
    const headers: Record<string, string> = {};
    if (requestId) {
      headers['X-Request-ID'] = requestId;
    }

    return NextResponse.json(
      {
        error: 'Validation failed',
        details: result.errors,
        requestId,
      },
      {
        status: 400,
        headers,
      }
    );
  }

  return null;
}

/**
 * Validates request and returns data or throws error
 * Useful for cleaner async/await patterns
 * 
 * @example
 * ```ts
 * const schema = z.object({ email: z.string().email() });
 * const data = await validateOrThrow(request, schema);
 * // data is typed as the schema output
 * ```
 */
export async function validateOrThrow<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<T> {
  const result = await validateRequest(request, schema);

  if (!result.success) {
    throw new RequestValidationError('Validation failed', result.errors);
  }

  return result.data as T;
}

/**
 * Validates query parameters from URL
 * 
 * @example
 * ```ts
 * const schema = z.object({ 
 *   page: z.coerce.number().min(1),
 *   limit: z.coerce.number().max(100)
 * });
 * 
 * const params = validateQueryParams(request, schema);
 * ```
 */
export function validateQueryParams<T>(
  request: Request,
  schema: ZodSchema<T>
): ValidationResult<T> {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    const data = schema.parse(params);

    return {
      success: true,
      data,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        errors: error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      };
    }

    return {
      success: false,
      errors: [
        {
          field: 'queryParams',
          message: 'Invalid query parameters',
        },
      ],
    };
  }
}

/**
 * Extracts and parses JSON body safely
 * Returns null if body is empty or invalid
 */
export async function parseRequestBody<T = any>(
  request: Request
): Promise<T | null> {
  const contentType = request.headers.get('content-type') || '';
  
  if (!contentType.includes('application/json')) {
    return null;
  }

  try {
    return await request.json();
  } catch {
    return null;
  }
}

// Custom Error Class
export class RequestValidationError extends Error {
  constructor(
    message: string,
    public errors?: ValidationError[]
  ) {
    super(message);
    this.name = 'RequestValidationError';
  }
}
