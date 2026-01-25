/**
 * API Utilities - Central Export
 *
 * Provides utilities for API response optimization including:
 * - ETag generation and validation
 * - Field selection for payload optimization
 * - Cache-Control header management
 */

export {
  generateETag,
  checkETagMatch,
  notModifiedResponse,
  withETag,
  generateCombinedETag,
  type ETagOptions,
  type WithETagOptions,
} from './etag';

export {
  parseFieldsParam,
  selectFields,
  selectFieldsArray,
  excludeFields,
  excludeFieldsArray,
  validateFields,
  calculateSizeReduction,
  FIELD_PRESETS,
  type FieldList,
} from './field-selection';

export {
  buildCacheControl,
  withCaching,
  withVary,
  getCacheProfileForContent,
  calculateCacheDuration,
  CACHE_PROFILES,
  type CacheControlOptions,
} from './cache-control';
