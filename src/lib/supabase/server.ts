import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import {
  SUPABASE_CONFIG,
  SERVER_CLIENT_CONFIG,
  SERVICE_CLIENT_CONFIG,
} from './config';

// Use ReturnType to infer client type, avoiding complex generic issues
type ServerClientType = Awaited<ReturnType<typeof createServerClientInternal>>;
type ServiceClientType = ReturnType<typeof createSupabaseClient>;

/**
 * Singleton instance for service role client
 * Reused across requests to minimize connection overhead
 *
 * This follows Supabase best practices for connection pooling:
 * - Single connection reused across requests
 * - No session persistence (service role doesn't need it)
 * - No token refresh (service key doesn't expire)
 *
 * @see https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler
 */
let serviceClientInstance: ServiceClientType | null = null;

/**
 * Internal helper to create server client
 */
async function createServerClientInternal() {
  const cookieStore = await cookies();

  return createServerClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.anonKey,
    {
      ...SERVER_CLIENT_CONFIG,
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

/**
 * Creates a server-side Supabase client with user session context
 *
 * This client:
 * - Uses cookies for session management
 * - Respects Row Level Security (RLS) policies
 * - Is appropriate for user-authenticated requests
 *
 * Note: Creates a new instance per request to handle different user contexts
 *
 * @returns Server Supabase client with cookie-based auth
 */
export async function createClient(): Promise<ServerClientType> {
  return createServerClientInternal();
}

/**
 * Creates or returns the singleton service role client
 *
 * This client:
 * - Bypasses Row Level Security (RLS)
 * - Should only be used for admin operations
 * - Is safe to reuse across requests (stateless)
 *
 * SECURITY: Never expose this client or service key to the browser!
 *
 * Connection pooling benefits:
 * - Reuses existing connection instead of creating new ones
 * - Reduces connection overhead (1-3MB RAM per connection)
 * - Prevents connection exhaustion under load
 *
 * @returns Singleton service role Supabase client
 * @throws Error if SUPABASE_SERVICE_ROLE_KEY is not configured
 */
export function createServiceClient(): ServiceClientType {
  // Return existing instance if available
  if (serviceClientInstance) {
    return serviceClientInstance;
  }

  // Validate service key exists
  if (!SUPABASE_CONFIG.serviceKey) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY environment variable. ' +
        'Service client requires admin credentials.'
    );
  }

  // Create singleton instance
  serviceClientInstance = createSupabaseClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.serviceKey,
    SERVICE_CLIENT_CONFIG
  );

  return serviceClientInstance;
}

/**
 * Alias for createServiceClient for backward compatibility
 * @deprecated Use createServiceClient instead
 */
export function createAdminClient(): ServiceClientType {
  return createServiceClient();
}

/**
 * Gets a fresh service client (bypasses singleton)
 *
 * Use this only when you need a completely fresh connection,
 * such as after configuration changes or for isolated operations.
 *
 * @returns New service role Supabase client
 */
export function createFreshServiceClient(): ServiceClientType {
  if (!SUPABASE_CONFIG.serviceKey) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY environment variable.'
    );
  }

  return createSupabaseClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.serviceKey,
    SERVICE_CLIENT_CONFIG
  );
}

/**
 * Resets the singleton service client
 *
 * Useful for testing or when you need to force a new connection.
 * Use sparingly - reconnection has overhead.
 */
export function resetServiceClient(): void {
  serviceClientInstance = null;
}
