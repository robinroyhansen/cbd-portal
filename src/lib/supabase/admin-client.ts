/**
 * Admin Client Module (Browser)
 *
 * This module provides the browser client for admin operations.
 * For true admin operations (bypassing RLS), use createServiceClient from './server'.
 *
 * Note: Browser clients cannot bypass RLS. This module is for client-side
 * admin UI that still respects user permissions.
 */

import { createClient } from './client';

/**
 * Creates an admin client for browser-side admin operations
 *
 * IMPORTANT: This client respects RLS policies. It does NOT have
 * service role privileges. For operations that bypass RLS, use
 * API routes that call createServiceClient on the server.
 *
 * @returns Browser Supabase client
 */
export function createAdminClient() {
  return createClient();
}

// Re-export browser client utilities
export { createClient, getBrowserClient, resetBrowserClient } from './client';
