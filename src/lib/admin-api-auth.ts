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

// Get the admin password from environment
// Set ADMIN_PASSWORD in Vercel environment variables
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;

/**
 * Check if request has valid admin authentication
 * Returns null if authenticated, NextResponse error if not
 */
export function requireAdminAuth(request: NextRequest): NextResponse | null {
  // Allow in development without auth for testing
  if (process.env.NODE_ENV === 'development' && !ADMIN_PASSWORD) {
    console.warn('[Admin Auth] Running without ADMIN_PASSWORD in development mode');
    return null;
  }

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

  // Validate token
  if (token !== ADMIN_PASSWORD) {
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
 * (e.g., Vercel cron jobs, server-side calls)
 */
export function isInternalRequest(request: NextRequest): boolean {
  // Check for Vercel cron secret
  const cronSecret = request.headers.get('x-cron-secret');
  if (cronSecret && cronSecret === process.env.CRON_SECRET) {
    return true;
  }

  // Check for internal API calls (same origin with service key)
  const serviceKey = request.headers.get('x-service-key');
  if (serviceKey && serviceKey === process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return true;
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
