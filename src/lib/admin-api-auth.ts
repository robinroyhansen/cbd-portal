import { NextRequest, NextResponse } from 'next/server';

/**
 * Admin API Authentication Utility
 *
 * Protects admin API routes with token-based authentication.
 *
 * Usage in API route:
 * ```
 * import { requireAdminAuth } from '@/lib/admin-auth';
 *
 * export async function POST(request: NextRequest) {
 *   const authError = requireAdminAuth(request);
 *   if (authError) return authError;
 *   // ... rest of handler
 * }
 * ```
 *
 * Environment variable required:
 *   ADMIN_PASSWORD - Secret token for admin API access
 *
 * Request must include header:
 *   Authorization: Bearer <ADMIN_PASSWORD>
 *
 * For browser-based admin pages, use session auth instead of this.
 */

import { timingSafeEqual } from 'crypto';

// Get the admin password from environment
// Set ADMIN_PASSWORD in Vercel environment variables
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const CRON_SECRET = process.env.CRON_SECRET;

/**
 * Timing-safe string comparison to prevent timing attacks
 */
function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  try {
    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

/**
 * Check if request has valid admin authentication
 * Returns null if authenticated, NextResponse error if not
 */
export function requireAdminAuth(request: NextRequest): NextResponse | null {
  // Check if ADMIN_PASSWORD is configured
  if (!ADMIN_PASSWORD) {
    console.error('[Admin Auth] ADMIN_PASSWORD not configured');
    return NextResponse.json(
      { error: 'Server misconfigured - admin auth not set up' },
      { status: 500 }
    );
  }

  // Get authorization header
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return NextResponse.json(
      { error: 'Unauthorized - missing authorization header' },
      { status: 401 }
    );
  }

  // Check Bearer token format
  if (!authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Unauthorized - invalid authorization format (expected Bearer token)' },
      { status: 401 }
    );
  }

  const token = authHeader.slice(7); // Remove "Bearer " prefix

  // Validate token with timing-safe comparison
  if (!safeCompare(token, ADMIN_PASSWORD)) {
    return NextResponse.json(
      { error: 'Unauthorized - invalid token' },
      { status: 401 }
    );
  }

  // Auth successful
  return null;
}

/**
 * Check if request is from a trusted internal source
 * (e.g., Vercel cron jobs)
 *
 * Security notes:
 * - Only validates CRON_SECRET if configured
 * - Uses timing-safe comparison to prevent timing attacks
 * - Does NOT accept service role key in headers (too dangerous)
 */
export function isInternalRequest(request: NextRequest): boolean {
  // Check for Vercel cron secret (set via Vercel dashboard)
  if (CRON_SECRET) {
    const cronHeader = request.headers.get('authorization');
    if (cronHeader?.startsWith('Bearer ') && safeCompare(cronHeader.slice(7), CRON_SECRET)) {
      return true;
    }
  }

  return false;
}

/**
 * Require admin auth OR internal request
 * Use this for APIs that can be called by crons/webhooks
 */
export function requireAdminOrInternal(request: NextRequest): NextResponse | null {
  if (isInternalRequest(request)) {
    return null;
  }
  return requireAdminAuth(request);
}
