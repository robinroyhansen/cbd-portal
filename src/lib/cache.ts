/**
 * In-memory LRU cache with TTL support
 * Production-ready caching layer for the CBD Portal
 *
 * Features:
 * - LRU (Least Recently Used) eviction policy
 * - Configurable TTL (Time To Live) per entry
 * - Type-safe get/set methods
 * - Cache key generation utilities
 * - No external dependencies
 */

// ============================================================================
// Types
// ============================================================================

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
}

export interface CacheOptions {
  /** Time to live in milliseconds */
  ttl: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  maxSize: number;
  hitRate: number;
}

// ============================================================================
// LRU Cache Implementation
// ============================================================================

/**
 * LRU Cache with TTL support
 * Uses a Map for O(1) access and maintains insertion order for LRU eviction
 */
export class LRUCache<T = unknown> {
  private cache: Map<string, CacheEntry<T>>;
  private maxSize: number;
  private defaultTTL: number;
  private hits: number = 0;
  private misses: number = 0;

  constructor(maxSize: number = 1000, defaultTTLMs: number = 60 * 60 * 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTLMs;
  }

  /**
   * Get a value from the cache
   * Returns undefined if not found or expired
   */
  get<V extends T = T>(key: string): V | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return undefined;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return undefined;
    }

    // Move to end (most recently used) by deleting and re-adding
    this.cache.delete(key);
    this.cache.set(key, entry);

    this.hits++;
    return entry.value as V;
  }

  /**
   * Set a value in the cache with optional TTL
   */
  set<V extends T = T>(key: string, value: V, options?: Partial<CacheOptions>): void {
    const ttl = options?.ttl ?? this.defaultTTL;
    const now = Date.now();

    // Delete if exists to update position in Map
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Evict LRU items if at capacity
    while (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    const entry: CacheEntry<T> = {
      value: value as T,
      expiresAt: now + ttl,
      createdAt: now,
    };

    this.cache.set(key, entry);
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a specific key from the cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Delete all keys matching a pattern (prefix match)
   * @param pattern The prefix to match against keys
   * @returns Number of keys deleted
   */
  deletePattern(pattern: string): number {
    let deleted = 0;
    for (const key of this.cache.keys()) {
      if (key.startsWith(pattern)) {
        this.cache.delete(key);
        deleted++;
      }
    }
    return deleted;
  }

  /**
   * Clear all entries from the cache
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get the current size of the cache
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: total > 0 ? this.hits / total : 0,
    };
  }

  /**
   * Clean up expired entries
   * Call periodically to free memory from expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Get all keys (for debugging/testing)
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get entry metadata without affecting LRU order
   */
  peek(key: string): { expiresAt: number; createdAt: number; ttlRemaining: number } | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return {
      expiresAt: entry.expiresAt,
      createdAt: entry.createdAt,
      ttlRemaining: entry.expiresAt - now,
    };
  }
}

// ============================================================================
// Cache Key Generation Utilities
// ============================================================================

/**
 * Generate a cache key from function name and arguments
 */
export function generateCacheKey(namespace: string, ...args: unknown[]): string {
  const argsKey = args
    .map(arg => {
      if (arg === null) return 'null';
      if (arg === undefined) return 'undefined';
      if (typeof arg === 'object') {
        try {
          // Sort object keys for consistent hashing
          return JSON.stringify(arg, Object.keys(arg as object).sort());
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    })
    .join(':');

  return argsKey ? `${namespace}:${argsKey}` : namespace;
}

/**
 * Cache key prefixes for different data types
 */
export const CacheKeys = {
  CONDITIONS: 'conditions',
  CONDITION: 'condition',
  GLOSSARY: 'glossary',
  GLOSSARY_TERM: 'glossary-term',
  ARTICLES: 'articles',
  ARTICLE: 'article',
  RESEARCH: 'research',
  STATS: 'stats',
} as const;

export type CacheKeyType = typeof CacheKeys[keyof typeof CacheKeys];

/**
 * Helper to create namespaced cache keys
 */
export function createCacheKey(type: CacheKeyType, ...identifiers: (string | number | undefined)[]): string {
  const filtered = identifiers.filter(id => id !== undefined);
  return generateCacheKey(type, ...filtered);
}

// ============================================================================
// TTL Presets (in milliseconds)
// ============================================================================

export const TTL = {
  /** 5 minutes - for frequently changing data */
  SHORT: 5 * 60 * 1000,
  /** 15 minutes - for moderately changing data */
  MEDIUM: 15 * 60 * 1000,
  /** 30 minutes - for article content */
  ARTICLE: 30 * 60 * 1000,
  /** 1 hour - for conditions and glossary */
  LONG: 60 * 60 * 1000,
  /** 6 hours - for rarely changing data */
  VERY_LONG: 6 * 60 * 60 * 1000,
  /** 24 hours - for static data */
  DAY: 24 * 60 * 60 * 1000,
} as const;

// ============================================================================
// Global Cache Instances
// ============================================================================

// Separate caches for different data types to allow independent eviction
const caches = {
  conditions: new LRUCache(100, TTL.LONG),
  glossary: new LRUCache(500, TTL.LONG),
  articles: new LRUCache(200, TTL.ARTICLE),
  research: new LRUCache(100, TTL.LONG),
  stats: new LRUCache(50, TTL.MEDIUM),
  general: new LRUCache(500, TTL.LONG),
} as const;

export type CacheStore = keyof typeof caches;

/**
 * Get a specific cache store
 */
export function getCache(store: CacheStore = 'general'): LRUCache {
  return caches[store];
}

/**
 * Get all cache instances (for global operations)
 */
export function getAllCaches(): typeof caches {
  return caches;
}

// ============================================================================
// Cached Function Wrapper
// ============================================================================

/**
 * Options for the cached function wrapper
 */
export interface CachedFunctionOptions {
  /** Cache store to use */
  store?: CacheStore;
  /** TTL in milliseconds (overrides store default) */
  ttl?: number;
  /** Key prefix/namespace */
  keyPrefix?: string;
}

/**
 * Wrap an async function with caching
 * @param fn The async function to cache
 * @param options Caching options
 * @returns A wrapped function that caches results
 */
export function cached<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  options: CachedFunctionOptions = {}
): (...args: TArgs) => Promise<TResult> {
  const { store = 'general', ttl, keyPrefix = fn.name || 'anonymous' } = options;
  const cache = getCache(store);

  return async (...args: TArgs): Promise<TResult> => {
    const key = generateCacheKey(keyPrefix, ...args);

    // Check cache first
    const cached = cache.get<TResult>(key);
    if (cached !== undefined) {
      return cached;
    }

    // Execute function and cache result
    const result = await fn(...args);
    cache.set(key, result, ttl ? { ttl } : undefined);

    return result;
  };
}

/**
 * Decorator-style caching for class methods
 * Use: const cachedMethod = withCache(this.method.bind(this), options)
 */
export const withCache = cached;

// ============================================================================
// Cache Invalidation Utilities
// ============================================================================

/**
 * Invalidation events that can trigger cache clearing
 */
export type InvalidationEvent =
  | 'condition:created'
  | 'condition:updated'
  | 'condition:deleted'
  | 'glossary:created'
  | 'glossary:updated'
  | 'glossary:deleted'
  | 'article:created'
  | 'article:updated'
  | 'article:deleted'
  | 'article:published'
  | 'research:approved'
  | 'research:rejected'
  | 'content:bulk-update';

/**
 * Invalidate cache based on an event
 */
export function invalidateOnEvent(event: InvalidationEvent, identifier?: string): void {
  switch (event) {
    case 'condition:created':
    case 'condition:deleted':
      // Clear all conditions cache (list needs to refresh)
      caches.conditions.deletePattern(CacheKeys.CONDITIONS);
      if (identifier) {
        caches.conditions.delete(createCacheKey(CacheKeys.CONDITION, identifier));
      }
      break;

    case 'condition:updated':
      // Clear specific condition and list
      caches.conditions.deletePattern(CacheKeys.CONDITIONS);
      if (identifier) {
        caches.conditions.delete(createCacheKey(CacheKeys.CONDITION, identifier));
      }
      break;

    case 'glossary:created':
    case 'glossary:deleted':
      caches.glossary.deletePattern(CacheKeys.GLOSSARY);
      if (identifier) {
        caches.glossary.delete(createCacheKey(CacheKeys.GLOSSARY_TERM, identifier));
      }
      break;

    case 'glossary:updated':
      caches.glossary.deletePattern(CacheKeys.GLOSSARY);
      if (identifier) {
        caches.glossary.delete(createCacheKey(CacheKeys.GLOSSARY_TERM, identifier));
      }
      break;

    case 'article:created':
    case 'article:published':
      // Clear article lists
      caches.articles.deletePattern(CacheKeys.ARTICLES);
      break;

    case 'article:updated':
    case 'article:deleted':
      caches.articles.deletePattern(CacheKeys.ARTICLES);
      if (identifier) {
        caches.articles.delete(createCacheKey(CacheKeys.ARTICLE, identifier));
      }
      break;

    case 'research:approved':
    case 'research:rejected':
      caches.research.clear();
      caches.stats.clear();
      break;

    case 'content:bulk-update':
      // Clear everything
      clearAllCaches();
      break;
  }
}

/**
 * Clear all caches
 */
export function clearAllCaches(): void {
  Object.values(caches).forEach(cache => cache.clear());
}

/**
 * Clear caches for a specific store
 */
export function clearCache(store: CacheStore): void {
  caches[store].clear();
}

/**
 * Get combined stats from all caches
 */
export function getAllCacheStats(): Record<CacheStore, CacheStats> {
  const stats: Record<string, CacheStats> = {};
  for (const [name, cache] of Object.entries(caches)) {
    stats[name] = cache.getStats();
  }
  return stats as Record<CacheStore, CacheStats>;
}

/**
 * Run cleanup on all caches
 * Call this periodically (e.g., every 5 minutes) to free memory
 */
export function cleanupAllCaches(): number {
  let totalCleaned = 0;
  for (const cache of Object.values(caches)) {
    totalCleaned += cache.cleanup();
  }
  return totalCleaned;
}

// ============================================================================
// Stale-While-Revalidate Pattern
// ============================================================================

/**
 * Options for stale-while-revalidate caching
 */
export interface SWROptions extends CachedFunctionOptions {
  /** Stale time in ms - data is fresh before this */
  staleTime?: number;
}

/**
 * Implement stale-while-revalidate pattern
 * Returns cached data immediately (even if stale) while revalidating in background
 */
export function cachedSWR<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  options: SWROptions = {}
): (...args: TArgs) => Promise<TResult> {
  const {
    store = 'general',
    ttl = TTL.LONG,
    staleTime = TTL.MEDIUM,
    keyPrefix = fn.name || 'anonymous'
  } = options;
  const cache = getCache(store);
  const revalidating = new Set<string>();

  return async (...args: TArgs): Promise<TResult> => {
    const key = generateCacheKey(keyPrefix, ...args);
    const metadata = cache.peek(key);
    const cached = cache.get<TResult>(key);

    // If we have cached data
    if (cached !== undefined && metadata) {
      const age = Date.now() - metadata.createdAt;

      // If data is fresh, return it
      if (age < staleTime) {
        return cached;
      }

      // Data is stale but valid - return it and revalidate in background
      if (!revalidating.has(key)) {
        revalidating.add(key);
        fn(...args)
          .then(result => {
            cache.set(key, result, { ttl });
          })
          .catch(console.error)
          .finally(() => {
            revalidating.delete(key);
          });
      }

      return cached;
    }

    // No cached data - fetch and cache
    const result = await fn(...args);
    cache.set(key, result, { ttl });
    return result;
  };
}

// ============================================================================
// Periodic Cleanup Setup
// ============================================================================

// Set up periodic cleanup in non-edge environments
if (typeof setInterval !== 'undefined' && typeof process !== 'undefined') {
  // Clean up every 5 minutes
  const CLEANUP_INTERVAL = 5 * 60 * 1000;

  // Only set up in server environment, not during build
  if (process.env.NODE_ENV !== 'test') {
    setInterval(() => {
      const cleaned = cleanupAllCaches();
      if (cleaned > 0 && process.env.NODE_ENV === 'development') {
        console.log(`[Cache] Cleaned up ${cleaned} expired entries`);
      }
    }, CLEANUP_INTERVAL).unref?.(); // unref() prevents interval from keeping process alive
  }
}
