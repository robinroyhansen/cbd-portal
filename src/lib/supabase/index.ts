/**
 * Supabase Client Module
 *
 * This module provides optimized Supabase clients for the CBD Portal.
 *
 * Usage Guidelines:
 *
 * 1. Server Components & API Routes (with user context):
 *    ```typescript
 *    import { createClient } from '@/lib/supabase/server';
 *    const supabase = await createClient();
 *    ```
 *
 * 2. Server-side Admin Operations (bypass RLS):
 *    ```typescript
 *    import { createServiceClient } from '@/lib/supabase/server';
 *    const supabase = createServiceClient();
 *    ```
 *
 * 3. Browser Components:
 *    ```typescript
 *    import { createClient } from '@/lib/supabase/client';
 *    const supabase = createClient();
 *    ```
 *
 * 4. Batch Operations:
 *    ```typescript
 *    import { batchQueries, parallelQueries } from '@/lib/supabase/batch';
 *    const results = await parallelQueries(supabase, { ... });
 *    ```
 *
 * Configuration:
 * - All clients use optimized settings from config.ts
 * - Server service client uses singleton pattern for connection reuse
 * - Browser client uses singleton for session consistency
 *
 * @see /docs/supabase-connection-guide.md for detailed documentation
 */

// Server-side clients
export {
  createClient as createServerClient,
  createServiceClient,
  createAdminClient as createServerAdminClient,
  createFreshServiceClient,
  resetServiceClient,
} from './server';

// Browser clients
export {
  createClient as createBrowserClient,
  getBrowserClient,
  resetBrowserClient,
  createFreshBrowserClient,
} from './client';

// Batch utilities
export {
  batchQueries,
  parallelQueries,
  batchInsert,
  batchUpdate,
  batchDelete,
  type BatchQuery,
  type BatchResult,
  type BatchOptions,
} from './batch';

// Configuration
export {
  SUPABASE_CONFIG,
  CONNECTION_CONFIG,
  REALTIME_CONFIG,
  BROWSER_CLIENT_CONFIG,
  SERVER_CLIENT_CONFIG,
  SERVICE_CLIENT_CONFIG,
} from './config';
