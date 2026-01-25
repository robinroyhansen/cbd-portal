/**
 * Cache-Control Header Utilities for API Response Optimization
 *
 * Provides consistent caching strategies across API routes.
 * Supports static content caching, dynamic content with revalidation,
 * and private user-specific caching.
 *
 * Usage:
 * ```typescript
 * import { CACHE_PROFILES, buildCacheControl, withCaching } from '@/lib/api/cache-control';
 *
 * // Use preset profiles
 * return NextResponse.json(data, {
 *   headers: { 'Cache-Control': CACHE_PROFILES.staticContent }
 * });
 *
 * // Build custom cache control
 * const cacheControl = buildCacheControl({
 *   maxAge: 300,
 *   staleWhileRevalidate: 600
 * });
 *
 * // Wrap response with caching
 * return withCaching(data, CACHE_PROFILES.dynamicContent);
 * ```
 */

import { NextResponse } from 'next/server';

export interface CacheControlOptions {
  /** Whether response is private (user-specific) */
  isPrivate?: boolean;
  /** Whether response can be stored in public caches */
  isPublic?: boolean;
  /** Maximum time (seconds) response is fresh for browser */
  maxAge?: number;
  /** Maximum time (seconds) response is fresh for CDN/proxy */
  sMaxAge?: number;
  /** Time (seconds) stale content can be served while revalidating */
  staleWhileRevalidate?: number;
  /** Time (seconds) stale content can be served if origin errors */
  staleIfError?: number;
  /** Response must not be cached */
  noStore?: boolean;
  /** Response must not be served from cache without revalidation */
  noCache?: boolean;
  /** Response must not be transformed by intermediaries */
  noTransform?: boolean;
  /** Response must be revalidated once stale */
  mustRevalidate?: boolean;
  /** Similar to must-revalidate but for shared caches */
  proxyRevalidate?: boolean;
  /** Response is immutable and won't change */
  immutable?: boolean;
}

/**
 * Build Cache-Control header string from options
 *
 * @param options - Cache control configuration
 * @returns Cache-Control header value string
 */
export function buildCacheControl(options: CacheControlOptions): string {
  const directives: string[] = [];

  // Visibility directives (mutually exclusive)
  if (options.noStore) {
    directives.push('no-store');
  } else if (options.noCache) {
    directives.push('no-cache');
  } else if (options.isPrivate) {
    directives.push('private');
  } else if (options.isPublic !== false) {
    // Default to public unless explicitly set to false or private
    directives.push('public');
  }

  // Time-based directives
  if (options.maxAge !== undefined && !options.noStore) {
    directives.push(`max-age=${options.maxAge}`);
  }

  if (options.sMaxAge !== undefined && !options.noStore) {
    directives.push(`s-maxage=${options.sMaxAge}`);
  }

  // Stale directives
  if (options.staleWhileRevalidate !== undefined && !options.noStore) {
    directives.push(`stale-while-revalidate=${options.staleWhileRevalidate}`);
  }

  if (options.staleIfError !== undefined && !options.noStore) {
    directives.push(`stale-if-error=${options.staleIfError}`);
  }

  // Revalidation directives
  if (options.mustRevalidate) {
    directives.push('must-revalidate');
  }

  if (options.proxyRevalidate) {
    directives.push('proxy-revalidate');
  }

  // Other directives
  if (options.noTransform) {
    directives.push('no-transform');
  }

  if (options.immutable) {
    directives.push('immutable');
  }

  return directives.join(', ');
}

/**
 * Preset cache profiles for common use cases
 */
export const CACHE_PROFILES = {
  /**
   * Static content that rarely changes
   * - 1 hour browser cache
   * - 1 day CDN cache
   * - Serve stale for 1 week while revalidating
   */
  staticContent: buildCacheControl({
    isPublic: true,
    maxAge: 3600,        // 1 hour
    sMaxAge: 86400,      // 1 day
    staleWhileRevalidate: 604800, // 1 week
    staleIfError: 86400, // 1 day
  }),

  /**
   * Semi-static content (e.g., articles, conditions)
   * - 5 minutes browser cache
   * - 1 hour CDN cache
   * - Serve stale for 1 day while revalidating
   */
  semiStatic: buildCacheControl({
    isPublic: true,
    maxAge: 300,         // 5 minutes
    sMaxAge: 3600,       // 1 hour
    staleWhileRevalidate: 86400, // 1 day
    staleIfError: 3600,  // 1 hour
  }),

  /**
   * Dynamic content that changes frequently
   * - 1 minute browser cache
   * - 5 minutes CDN cache
   * - Serve stale for 1 hour while revalidating
   */
  dynamicContent: buildCacheControl({
    isPublic: true,
    maxAge: 60,          // 1 minute
    sMaxAge: 300,        // 5 minutes
    staleWhileRevalidate: 3600, // 1 hour
    staleIfError: 300,   // 5 minutes
  }),

  /**
   * Search results - short cache with quick revalidation
   * - 1 minute browser cache
   * - Serve stale for 10 minutes while revalidating
   */
  searchResults: buildCacheControl({
    isPublic: true,
    maxAge: 60,          // 1 minute
    staleWhileRevalidate: 600, // 10 minutes
  }),

  /**
   * List/index pages - moderate caching
   * - 2 minutes browser cache
   * - 10 minutes CDN cache
   * - Serve stale for 2 hours while revalidating
   */
  listPage: buildCacheControl({
    isPublic: true,
    maxAge: 120,         // 2 minutes
    sMaxAge: 600,        // 10 minutes
    staleWhileRevalidate: 7200, // 2 hours
    staleIfError: 600,   // 10 minutes
  }),

  /**
   * User-specific/private data
   * - No shared cache (CDN)
   * - Short browser cache
   */
  privateData: buildCacheControl({
    isPrivate: true,
    maxAge: 60,          // 1 minute
    mustRevalidate: true,
  }),

  /**
   * Real-time data - no caching
   */
  noCache: buildCacheControl({
    noStore: true,
  }),

  /**
   * Immutable assets (versioned files, etc.)
   * - 1 year cache
   * - Immutable flag
   */
  immutable: buildCacheControl({
    isPublic: true,
    maxAge: 31536000,    // 1 year
    immutable: true,
  }),
} as const;

/**
 * Create a JSON response with cache headers
 *
 * @param data - Response data
 * @param cacheControl - Cache-Control header value or options
 * @param additionalHeaders - Additional headers to include
 * @returns NextResponse with caching headers
 */
export function withCaching<T>(
  data: T,
  cacheControl: string | CacheControlOptions,
  additionalHeaders?: Record<string, string>
): NextResponse<T> {
  const cacheControlValue = typeof cacheControl === 'string'
    ? cacheControl
    : buildCacheControl(cacheControl);

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': cacheControlValue,
      ...additionalHeaders,
    },
  });
}

/**
 * Add Vary header for proper cache key variation
 *
 * Important for responses that vary based on request headers
 * (e.g., Accept-Language, Accept-Encoding)
 *
 * @param headers - Existing headers object
 * @param varyOn - Headers to vary cache on
 * @returns Updated headers with Vary header
 */
export function withVary(
  headers: Record<string, string>,
  varyOn: string[]
): Record<string, string> {
  return {
    ...headers,
    'Vary': varyOn.join(', '),
  };
}

/**
 * Get cache profile based on content type and freshness requirements
 *
 * @param contentType - Type of content being served
 * @returns Appropriate cache control string
 */
export function getCacheProfileForContent(
  contentType: 'static' | 'semiStatic' | 'dynamic' | 'search' | 'list' | 'private' | 'realtime'
): string {
  const profileMap: Record<string, string> = {
    static: CACHE_PROFILES.staticContent,
    semiStatic: CACHE_PROFILES.semiStatic,
    dynamic: CACHE_PROFILES.dynamicContent,
    search: CACHE_PROFILES.searchResults,
    list: CACHE_PROFILES.listPage,
    private: CACHE_PROFILES.privateData,
    realtime: CACHE_PROFILES.noCache,
  };

  return profileMap[contentType] || CACHE_PROFILES.dynamicContent;
}

/**
 * Determine appropriate cache duration based on data characteristics
 *
 * @param lastModified - When data was last modified
 * @param averageUpdateFrequency - How often data typically changes (hours)
 * @returns Recommended max-age in seconds
 */
export function calculateCacheDuration(
  lastModified?: Date,
  averageUpdateFrequency: number = 24
): number {
  if (!lastModified) {
    // Conservative default for unknown freshness
    return 300; // 5 minutes
  }

  const ageMs = Date.now() - lastModified.getTime();
  const ageHours = ageMs / (1000 * 60 * 60);

  // If recently updated, use shorter cache
  if (ageHours < 1) {
    return 60; // 1 minute
  }

  // If not updated recently relative to frequency, use longer cache
  if (ageHours > averageUpdateFrequency * 2) {
    return Math.min(3600, averageUpdateFrequency * 60 * 60); // Up to frequency duration
  }

  // Default moderate cache
  return 300; // 5 minutes
}
