import { NextResponse } from 'next/server';

/**
 * Standardized API Error Response Utilities
 *
 * Usage:
 * ```typescript
 * import { badRequest, unauthorized, notFound, serverError } from '@/lib/api-errors';
 *
 * // In API route:
 * if (!id) return badRequest('ID is required');
 * if (!item) return notFound('Article');
 * ```
 */

export interface ApiErrorResponse {
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

/**
 * Create a standardized JSON error response
 */
export function apiError(
  message: string,
  status: number,
  options?: { code?: string; details?: Record<string, unknown> }
): NextResponse<ApiErrorResponse> {
  const body: ApiErrorResponse = { error: message };
  if (options?.code) body.code = options.code;
  if (options?.details) body.details = options.details;

  return NextResponse.json(body, { status });
}

/**
 * 400 Bad Request - Invalid input or missing required fields
 */
export function badRequest(message: string, details?: Record<string, unknown>): NextResponse<ApiErrorResponse> {
  return apiError(message, 400, { code: 'BAD_REQUEST', details });
}

/**
 * 401 Unauthorized - Missing or invalid authentication
 */
export function unauthorized(message = 'Unauthorized'): NextResponse<ApiErrorResponse> {
  return apiError(message, 401, { code: 'UNAUTHORIZED' });
}

/**
 * 403 Forbidden - Authenticated but not allowed
 */
export function forbidden(message = 'Forbidden'): NextResponse<ApiErrorResponse> {
  return apiError(message, 403, { code: 'FORBIDDEN' });
}

/**
 * 404 Not Found - Resource doesn't exist
 */
export function notFound(resource: string): NextResponse<ApiErrorResponse> {
  return apiError(`${resource} not found`, 404, { code: 'NOT_FOUND' });
}

/**
 * 409 Conflict - Resource already exists or state conflict
 */
export function conflict(message: string): NextResponse<ApiErrorResponse> {
  return apiError(message, 409, { code: 'CONFLICT' });
}

/**
 * 422 Unprocessable Entity - Validation failed
 */
export function validationError(
  message: string,
  errors?: Record<string, string[]>
): NextResponse<ApiErrorResponse> {
  return apiError(message, 422, { code: 'VALIDATION_ERROR', details: errors ? { errors } : undefined });
}

/**
 * 429 Too Many Requests - Rate limit exceeded
 */
export function rateLimited(retryAfter?: number): NextResponse<ApiErrorResponse> {
  const response = apiError('Rate limit exceeded', 429, { code: 'RATE_LIMITED' });
  if (retryAfter) {
    response.headers.set('Retry-After', String(retryAfter));
  }
  return response;
}

/**
 * 500 Internal Server Error - Unexpected server error
 */
export function serverError(message = 'Internal server error'): NextResponse<ApiErrorResponse> {
  return apiError(message, 500, { code: 'INTERNAL_ERROR' });
}

/**
 * 503 Service Unavailable - Temporary service issue
 */
export function serviceUnavailable(message = 'Service temporarily unavailable'): NextResponse<ApiErrorResponse> {
  return apiError(message, 503, { code: 'SERVICE_UNAVAILABLE' });
}

/**
 * Handle Supabase errors and return appropriate response
 */
export function handleSupabaseError(
  error: { code?: string; message?: string },
  resourceName = 'Resource'
): NextResponse<ApiErrorResponse> {
  // Unique constraint violation
  if (error.code === '23505') {
    return conflict(`${resourceName} already exists`);
  }

  // Foreign key violation
  if (error.code === '23503') {
    return badRequest(`Invalid reference - related ${resourceName.toLowerCase()} doesn't exist`);
  }

  // Check constraint violation
  if (error.code === '23514') {
    return badRequest('Data validation failed');
  }

  // Table doesn't exist
  if (error.code === '42P01') {
    console.error(`Table doesn't exist:`, error.message);
    return serverError('Database configuration error');
  }

  // Default server error
  console.error(`Supabase error [${error.code}]:`, error.message);
  return serverError(`Failed to process ${resourceName.toLowerCase()}`);
}
