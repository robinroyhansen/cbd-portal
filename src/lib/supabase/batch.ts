import type { SupabaseClient } from '@supabase/supabase-js';
import { CONNECTION_CONFIG } from './config';

// Use generic SupabaseClient type for flexibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = SupabaseClient<any, any, any>;

/**
 * Batch Query Types
 */
export type BatchQuery<T = unknown> = {
  /** Unique identifier for this query in the batch */
  id: string;
  /** The query execution function */
  execute: (client: AnySupabaseClient) => Promise<T>;
};

export type BatchResult<T = unknown> = {
  /** Query identifier */
  id: string;
  /** Query result data */
  data: T | null;
  /** Error if query failed */
  error: Error | null;
  /** Execution time in milliseconds */
  executionTime: number;
};

export type BatchOptions = {
  /** Maximum number of concurrent queries */
  concurrency?: number;
  /** Whether to continue on error (default: true) */
  continueOnError?: boolean;
  /** Timeout per query in milliseconds */
  queryTimeout?: number;
  /** Number of retries for failed queries */
  maxRetries?: number;
};

const DEFAULT_BATCH_OPTIONS: Required<BatchOptions> = {
  concurrency: 5,
  continueOnError: true,
  queryTimeout: CONNECTION_CONFIG.globalFetchTimeout,
  maxRetries: CONNECTION_CONFIG.maxRetries,
};

/**
 * Executes multiple Supabase queries in parallel with controlled concurrency
 *
 * Benefits:
 * - Reduces total execution time by running queries in parallel
 * - Prevents connection exhaustion with concurrency limits
 * - Provides consistent error handling across batch
 * - Includes automatic retry with exponential backoff
 *
 * @example
 * ```typescript
 * const results = await batchQueries(supabase, [
 *   {
 *     id: 'articles',
 *     execute: (client) => client.from('articles').select('*').limit(10)
 *   },
 *   {
 *     id: 'categories',
 *     execute: (client) => client.from('categories').select('*')
 *   },
 *   {
 *     id: 'tags',
 *     execute: (client) => client.from('tags').select('*').limit(20)
 *   }
 * ]);
 *
 * const articles = results.find(r => r.id === 'articles')?.data;
 * const categories = results.find(r => r.id === 'categories')?.data;
 * ```
 *
 * @param client - Supabase client instance
 * @param queries - Array of queries to execute
 * @param options - Batch execution options
 * @returns Array of results with data or error for each query
 */
export async function batchQueries<T = unknown>(
  client: AnySupabaseClient,
  queries: BatchQuery<T>[],
  options?: BatchOptions
): Promise<BatchResult<T>[]> {
  const opts = { ...DEFAULT_BATCH_OPTIONS, ...options };
  const results: BatchResult<T>[] = [];
  const queue = [...queries];

  // Process queries in batches based on concurrency limit
  while (queue.length > 0) {
    const batch = queue.splice(0, opts.concurrency);
    const batchPromises = batch.map((query) =>
      executeQueryWithRetry(client, query, opts)
    );

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }

  return results;
}

/**
 * Executes a single query with retry logic and timeout
 */
async function executeQueryWithRetry<T>(
  client: AnySupabaseClient,
  query: BatchQuery<T>,
  options: Required<BatchOptions>
): Promise<BatchResult<T>> {
  const startTime = performance.now();
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      // Add delay for retries (exponential backoff)
      if (attempt > 0) {
        const delay = CONNECTION_CONFIG.retryBaseDelay * Math.pow(2, attempt - 1);
        await sleep(delay);
      }

      // Execute with timeout
      const result = await Promise.race([
        query.execute(client),
        timeout(options.queryTimeout, `Query '${query.id}' timed out`),
      ]);

      return {
        id: query.id,
        data: result as T,
        error: null,
        executionTime: performance.now() - startTime,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on certain errors
      if (isNonRetryableError(lastError)) {
        break;
      }
    }
  }

  return {
    id: query.id,
    data: null,
    error: lastError,
    executionTime: performance.now() - startTime,
  };
}

/**
 * Parallel query helper for common patterns
 *
 * Executes multiple table queries in parallel and returns typed results
 *
 * @example
 * ```typescript
 * const { articles, categories, authors } = await parallelQueries(supabase, {
 *   articles: (client) => client.from('articles').select('*').limit(10),
 *   categories: (client) => client.from('categories').select('*'),
 *   authors: (client) => client.from('authors').select('id, name'),
 * });
 * ```
 */
export async function parallelQueries<T extends Record<string, unknown>>(
  client: AnySupabaseClient,
  queries: {
    [K in keyof T]: (client: AnySupabaseClient) => Promise<{ data: T[K] | null; error: Error | null }>;
  },
  options?: BatchOptions
): Promise<{ [K in keyof T]: T[K] | null }> {
  const queryEntries = Object.entries(queries) as [keyof T, (client: AnySupabaseClient) => Promise<{ data: T[keyof T] | null; error: Error | null }>][];

  const queryList: BatchQuery<{ data: T[keyof T] | null; error: Error | null }>[] = queryEntries.map(
    ([id, execute]) => ({
      id: id as string,
      execute,
    })
  );

  const results = await batchQueries(client, queryList, options);

  const output = {} as { [K in keyof T]: T[K] | null };
  for (const result of results) {
    const key = result.id as keyof T;
    if (result.error) {
      console.error(`Query '${result.id}' failed:`, result.error.message);
      output[key] = null;
    } else {
      const queryResult = result.data as { data: T[keyof T] | null; error: Error | null } | null;
      output[key] = queryResult?.data ?? null;
    }
  }

  return output;
}

/**
 * Batch insert helper with chunking
 *
 * Inserts large datasets in chunks to prevent timeout and memory issues
 *
 * @example
 * ```typescript
 * const result = await batchInsert(supabase, 'articles', articles, {
 *   chunkSize: 100,
 *   onProgress: (progress) => console.log(`${progress.completed}/${progress.total}`)
 * });
 * ```
 */
export async function batchInsert<T extends Record<string, unknown>>(
  client: AnySupabaseClient,
  table: string,
  rows: T[],
  options?: {
    chunkSize?: number;
    onProgress?: (progress: { completed: number; total: number; failed: number }) => void;
  }
): Promise<{
  success: boolean;
  inserted: number;
  failed: number;
  errors: Array<{ chunk: number; error: Error }>;
}> {
  const chunkSize = options?.chunkSize || 100;
  const chunks: T[][] = [];

  for (let i = 0; i < rows.length; i += chunkSize) {
    chunks.push(rows.slice(i, i + chunkSize));
  }

  let inserted = 0;
  let failed = 0;
  const errors: Array<{ chunk: number; error: Error }> = [];

  for (let i = 0; i < chunks.length; i++) {
    try {
      const { error } = await client.from(table).insert(chunks[i]);

      if (error) {
        throw error;
      }

      inserted += chunks[i].length;
    } catch (error) {
      failed += chunks[i].length;
      errors.push({
        chunk: i,
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }

    options?.onProgress?.({
      completed: inserted + failed,
      total: rows.length,
      failed,
    });
  }

  return {
    success: failed === 0,
    inserted,
    failed,
    errors,
  };
}

/**
 * Batch update helper with chunking
 *
 * Updates large datasets in chunks based on a match column
 */
export async function batchUpdate<T extends Record<string, unknown>>(
  client: AnySupabaseClient,
  table: string,
  updates: Array<{ match: Record<string, unknown>; data: Partial<T> }>,
  options?: {
    concurrency?: number;
    onProgress?: (progress: { completed: number; total: number }) => void;
  }
): Promise<{
  success: boolean;
  updated: number;
  failed: number;
  errors: Array<{ index: number; error: Error }>;
}> {
  const concurrency = options?.concurrency || 5;
  let updated = 0;
  let failed = 0;
  const errors: Array<{ index: number; error: Error }> = [];

  // Process in batches based on concurrency
  for (let i = 0; i < updates.length; i += concurrency) {
    const batch = updates.slice(i, i + concurrency);

    const results = await Promise.allSettled(
      batch.map((update, batchIndex) => {
        let query = client.from(table).update(update.data);

        for (const [column, value] of Object.entries(update.match)) {
          query = query.eq(column, value);
        }

        return query.then((result) => {
          if (result.error) throw result.error;
          return { index: i + batchIndex, result };
        });
      })
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        updated++;
      } else {
        failed++;
        errors.push({
          index: i,
          error: result.reason instanceof Error ? result.reason : new Error(String(result.reason)),
        });
      }
    }

    options?.onProgress?.({
      completed: updated + failed,
      total: updates.length,
    });
  }

  return {
    success: failed === 0,
    updated,
    failed,
    errors,
  };
}

/**
 * Batch delete helper with chunking
 */
export async function batchDelete(
  client: AnySupabaseClient,
  table: string,
  column: string,
  values: unknown[],
  options?: {
    chunkSize?: number;
    onProgress?: (progress: { completed: number; total: number }) => void;
  }
): Promise<{
  success: boolean;
  deleted: number;
  failed: number;
}> {
  const chunkSize = options?.chunkSize || 100;
  let deleted = 0;
  let failed = 0;

  for (let i = 0; i < values.length; i += chunkSize) {
    const chunk = values.slice(i, i + chunkSize);

    try {
      const { error } = await client.from(table).delete().in(column, chunk);

      if (error) throw error;
      deleted += chunk.length;
    } catch {
      failed += chunk.length;
    }

    options?.onProgress?.({
      completed: deleted + failed,
      total: values.length,
    });
  }

  return {
    success: failed === 0,
    deleted,
    failed,
  };
}

// Utility functions

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function timeout<T>(ms: number, message: string): Promise<T> {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error(message)), ms)
  );
}

function isNonRetryableError(error: Error): boolean {
  const message = error.message.toLowerCase();

  // Don't retry on validation errors, permission errors, or resource not found
  return (
    message.includes('invalid') ||
    message.includes('permission') ||
    message.includes('not found') ||
    message.includes('already exists') ||
    message.includes('violates')
  );
}
