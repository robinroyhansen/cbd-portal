import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

/**
 * ETag Utility for API Response Caching
 *
 * Generates ETags from response data and handles If-None-Match validation.
 * ETags enable efficient caching by allowing clients to validate if cached
 * content is still fresh without re-downloading the entire response.
 *
 * Usage:
 * ```typescript
 * import { generateETag, checkETagMatch, withETag } from '@/lib/api/etag';
 *
 * // Simple usage with withETag wrapper
 * const data = await fetchData();
 * return withETag(request, data, { maxAge: 300 });
 *
 * // Manual usage
 * const etag = generateETag(data);
 * if (checkETagMatch(request, etag)) {
 *   return new Response(null, { status: 304 });
 * }
 * return NextResponse.json(data, { headers: { 'ETag': etag } });
 * ```
 */

export interface ETagOptions {
  /** Whether this is a weak ETag (prefix with W/) */
  weak?: boolean;
  /** Additional data to include in ETag hash (e.g., version number) */
  salt?: string;
}

/**
 * Generate an ETag from data
 *
 * Uses MD5 hash for fast computation. For API responses, this provides
 * sufficient uniqueness while being performant.
 *
 * @param data - The data to generate ETag from (will be JSON stringified if object)
 * @param options - ETag generation options
 * @returns ETag string in format "hash" or W/"hash" for weak ETags
 */
export function generateETag(data: unknown, options: ETagOptions = {}): string {
  const { weak = false, salt = '' } = options;

  // Convert data to string for hashing
  const content = typeof data === 'string'
    ? data
    : JSON.stringify(data);

  // Create hash including optional salt
  const hash = createHash('md5')
    .update(salt + content)
    .digest('hex');

  // Format as weak or strong ETag
  return weak ? `W/"${hash}"` : `"${hash}"`;
}

/**
 * Check if request's If-None-Match header matches the ETag
 *
 * Supports multiple ETags in If-None-Match (comma-separated)
 * and the wildcard "*" value.
 *
 * @param request - The incoming request
 * @param etag - The current ETag value
 * @returns true if ETag matches (client cache is valid)
 */
export function checkETagMatch(request: NextRequest, etag: string): boolean {
  const ifNoneMatch = request.headers.get('if-none-match');

  if (!ifNoneMatch) {
    return false;
  }

  // Handle wildcard
  if (ifNoneMatch === '*') {
    return true;
  }

  // Parse multiple ETags (comma-separated)
  const clientETags = ifNoneMatch
    .split(',')
    .map(tag => tag.trim());

  // Check for match (handle both weak and strong comparison)
  return clientETags.some(clientTag => {
    // Remove W/ prefix for weak comparison (RFC 7232)
    const normalizedClient = clientTag.replace(/^W\//, '');
    const normalizedServer = etag.replace(/^W\//, '');
    return normalizedClient === normalizedServer;
  });
}

/**
 * Create a 304 Not Modified response
 *
 * @param etag - The ETag to include in response
 * @param headers - Additional headers to include
 * @returns NextResponse with 304 status
 */
export function notModifiedResponse(
  etag: string,
  headers?: Record<string, string>
): NextResponse {
  const responseHeaders: Record<string, string> = {
    'ETag': etag,
    ...headers,
  };

  return new NextResponse(null, {
    status: 304,
    headers: responseHeaders,
  });
}

export interface WithETagOptions extends ETagOptions {
  /** Cache-Control max-age in seconds (default: 0) */
  maxAge?: number;
  /** Cache-Control s-maxage in seconds for CDN caching */
  sMaxAge?: number;
  /** Enable stale-while-revalidate (seconds) */
  staleWhileRevalidate?: number;
  /** Enable stale-if-error (seconds) */
  staleIfError?: number;
  /** Whether the response is private (user-specific) */
  isPrivate?: boolean;
  /** Additional headers to include */
  headers?: Record<string, string>;
}

/**
 * Create a JSON response with ETag and Cache-Control headers
 *
 * This is the recommended high-level API for most use cases.
 * Automatically handles If-None-Match validation and returns 304
 * when appropriate.
 *
 * @param request - The incoming request (for If-None-Match check)
 * @param data - The response data
 * @param options - ETag and caching options
 * @returns NextResponse with appropriate status, ETag, and Cache-Control
 */
export function withETag<T>(
  request: NextRequest,
  data: T,
  options: WithETagOptions = {}
): NextResponse<T> | NextResponse<null> {
  const {
    weak = false,
    salt,
    maxAge = 0,
    sMaxAge,
    staleWhileRevalidate,
    staleIfError,
    isPrivate = false,
    headers = {},
  } = options;

  // Generate ETag
  const etag = generateETag(data, { weak, salt });

  // Check for conditional request
  if (checkETagMatch(request, etag)) {
    return notModifiedResponse(etag, headers);
  }

  // Build Cache-Control header
  const cacheDirectives: string[] = [];

  if (isPrivate) {
    cacheDirectives.push('private');
  } else {
    cacheDirectives.push('public');
  }

  cacheDirectives.push(`max-age=${maxAge}`);

  if (sMaxAge !== undefined) {
    cacheDirectives.push(`s-maxage=${sMaxAge}`);
  }

  if (staleWhileRevalidate !== undefined) {
    cacheDirectives.push(`stale-while-revalidate=${staleWhileRevalidate}`);
  }

  if (staleIfError !== undefined) {
    cacheDirectives.push(`stale-if-error=${staleIfError}`);
  }

  const responseHeaders: Record<string, string> = {
    'ETag': etag,
    'Cache-Control': cacheDirectives.join(', '),
    ...headers,
  };

  return NextResponse.json(data, { headers: responseHeaders });
}

/**
 * Create ETag from multiple data sources
 *
 * Useful when response depends on multiple queries/sources
 *
 * @param sources - Array of data sources to include in ETag
 * @param options - ETag options
 * @returns Combined ETag
 */
export function generateCombinedETag(
  sources: unknown[],
  options: ETagOptions = {}
): string {
  const combined = sources.map(s =>
    typeof s === 'string' ? s : JSON.stringify(s)
  ).join('|');

  return generateETag(combined, options);
}
