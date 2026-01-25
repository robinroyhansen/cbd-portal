/**
 * Supabase Connection Configuration
 *
 * Optimized settings for connection pooling, session management,
 * and realtime channel limits based on Supabase best practices.
 *
 * @see https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler
 */

// Environment validation
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!SUPABASE_ANON_KEY) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

/**
 * Connection timeout configuration
 * Based on Supabase best practices for connection management
 */
export const CONNECTION_CONFIG = {
  /**
   * Global fetch timeout for all Supabase requests
   * Default: 60 seconds (increased from default 10s for large queries)
   */
  globalFetchTimeout: 60000,

  /**
   * Realtime connection timeout
   * How long to wait before considering a connection failed
   */
  realtimeTimeout: 30000,

  /**
   * Maximum number of retries for failed requests
   */
  maxRetries: 3,

  /**
   * Base delay between retries (exponential backoff)
   */
  retryBaseDelay: 1000,
} as const;

/**
 * Browser client configuration
 * Used for client-side operations with user session
 */
export const BROWSER_CLIENT_CONFIG = {
  auth: {
    /**
     * Auto-refresh tokens before expiry
     * Enabled for browser to maintain user sessions
     */
    autoRefreshToken: true,

    /**
     * Persist session in localStorage
     * Enabled for browser to maintain sessions across page reloads
     */
    persistSession: true,

    /**
     * Detect session from URL (for OAuth callbacks)
     */
    detectSessionInUrl: true,

    /**
     * Storage key for session data
     */
    storageKey: 'cbd-portal-auth',

    /**
     * Flow type for authentication
     * PKCE is more secure for SPAs
     */
    flowType: 'pkce' as const,
  },

  global: {
    /**
     * Custom fetch implementation with timeout
     */
    fetch: (url: RequestInfo | URL, options?: RequestInit) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        CONNECTION_CONFIG.globalFetchTimeout
      );

      return fetch(url, {
        ...options,
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));
    },
  },

  realtime: {
    /**
     * Connection parameters for realtime subscriptions
     */
    params: {
      eventsPerSecond: 10,
    },
  },
};

/**
 * Server client configuration
 * Used for server-side operations with user context (via cookies)
 */
export const SERVER_CLIENT_CONFIG = {
  auth: {
    /**
     * Auto-refresh disabled on server
     * Server requests are short-lived, no need for token refresh
     */
    autoRefreshToken: false,

    /**
     * Session persistence disabled on server
     * Sessions are passed via cookies, not stored server-side
     */
    persistSession: false,

    /**
     * Don't detect session from URL on server
     */
    detectSessionInUrl: false,
  },

  global: {
    /**
     * Custom fetch with server-appropriate timeout
     */
    fetch: (url: RequestInfo | URL, options?: RequestInit) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        CONNECTION_CONFIG.globalFetchTimeout
      );

      return fetch(url, {
        ...options,
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));
    },
  },
};

/**
 * Service role client configuration
 * Used for admin operations that bypass RLS
 *
 * CRITICAL: Never expose service role key to the client!
 */
export const SERVICE_CLIENT_CONFIG = {
  auth: {
    /**
     * No token refresh needed for service role
     * Service role key doesn't expire
     */
    autoRefreshToken: false,

    /**
     * No session persistence needed
     * Service role doesn't use sessions
     */
    persistSession: false,

    /**
     * Don't detect session from URL
     */
    detectSessionInUrl: false,
  },

  global: {
    /**
     * Longer timeout for admin operations (potentially heavy queries)
     */
    fetch: (url: RequestInfo | URL, options?: RequestInit) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        CONNECTION_CONFIG.globalFetchTimeout * 2 // 2 minutes for admin ops
      );

      return fetch(url, {
        ...options,
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));
    },
  },
};

/**
 * Realtime configuration
 * Settings for managing realtime subscriptions
 */
export const REALTIME_CONFIG = {
  /**
   * Maximum number of realtime channels per client
   * Helps prevent connection exhaustion
   */
  maxChannels: 10,

  /**
   * Heartbeat interval in milliseconds
   */
  heartbeatInterval: 30000,

  /**
   * Reconnection settings
   */
  reconnect: {
    maxAttempts: 5,
    minDelay: 1000,
    maxDelay: 30000,
  },
} as const;

/**
 * Export validated environment variables
 */
export const SUPABASE_CONFIG = {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
  serviceKey: SUPABASE_SERVICE_KEY,
} as const;
