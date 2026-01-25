import { createBrowserClient, type CookieOptions } from '@supabase/ssr';
import { BROWSER_CLIENT_CONFIG, SUPABASE_CONFIG } from './config';

// Use 'any' for Database type to avoid complex generic issues with placeholder types
// Once proper types are generated via `npm run db:generate`, this can be made stricter
type SupabaseClientType = ReturnType<typeof createBrowserClient>;

/**
 * Singleton instance for browser client
 * Reused across component renders to maintain session state
 */
let browserClientInstance: SupabaseClientType | null = null;

/**
 * Creates or returns the singleton browser Supabase client
 *
 * This client:
 * - Maintains user session in localStorage
 * - Auto-refreshes tokens before expiry
 * - Handles OAuth callbacks
 * - Is safe to use in React components
 *
 * Singleton benefits:
 * - Consistent session state across components
 * - Single realtime connection
 * - Reduced memory overhead
 *
 * @returns Browser Supabase client
 */
export function createClient(): SupabaseClientType {
  // Return existing instance if available
  if (browserClientInstance) {
    return browserClientInstance;
  }

  // Create singleton instance
  browserClientInstance = createBrowserClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.anonKey,
    {
      ...BROWSER_CLIENT_CONFIG,
      cookies: {
        get(name: string) {
          if (typeof document === 'undefined') return undefined;
          const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
          return match ? decodeURIComponent(match[2]) : undefined;
        },
        set(name: string, value: string, options: CookieOptions) {
          if (typeof document === 'undefined') return;
          let cookie = `${name}=${encodeURIComponent(value)}`;
          if (options.maxAge) cookie += `; max-age=${options.maxAge}`;
          if (options.path) cookie += `; path=${options.path}`;
          if (options.domain) cookie += `; domain=${options.domain}`;
          if (options.sameSite) cookie += `; samesite=${options.sameSite}`;
          if (options.secure) cookie += '; secure';
          document.cookie = cookie;
        },
        remove(name: string, options: CookieOptions) {
          if (typeof document === 'undefined') return;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${options.path || '/'}`;
        },
      },
    }
  );

  return browserClientInstance;
}

/**
 * Gets the current browser client instance without creating a new one
 *
 * Useful for checking if a client exists before operations
 *
 * @returns Browser client if exists, null otherwise
 */
export function getBrowserClient(): SupabaseClientType | null {
  return browserClientInstance;
}

/**
 * Resets the browser client singleton
 *
 * Use when:
 * - User logs out (to clear session state)
 * - Configuration changes
 * - Testing
 */
export function resetBrowserClient(): void {
  if (browserClientInstance) {
    // Remove all realtime subscriptions
    browserClientInstance.removeAllChannels();
  }
  browserClientInstance = null;
}

/**
 * Creates a fresh browser client (bypasses singleton)
 *
 * Use only when you need an isolated client instance,
 * such as for specific operations that shouldn't share state.
 *
 * @returns New browser Supabase client
 */
export function createFreshBrowserClient(): SupabaseClientType {
  return createBrowserClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.anonKey,
    BROWSER_CLIENT_CONFIG
  );
}
