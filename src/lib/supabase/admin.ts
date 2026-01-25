/**
 * Admin Client Module
 *
 * This module provides the service role client for admin operations.
 * It re-exports from server.ts for backward compatibility.
 *
 * @deprecated Import createServiceClient from './server' instead
 */

import { createServiceClient } from './server';

/**
 * Creates an admin client for server-side operations that bypass RLS
 *
 * This function returns the singleton service client from server.ts
 * for consistent connection reuse across the application.
 *
 * @deprecated Use createServiceClient from './server' instead
 * @returns Singleton service role Supabase client
 */
export function createAdminClient() {
  return createServiceClient();
}

// Re-export for convenience
export { createServiceClient } from './server';
