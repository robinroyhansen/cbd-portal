/**
 * Field Selection Utility for API Response Optimization
 *
 * Allows clients to request only specific fields, reducing payload size
 * and improving performance. Supports nested field selection and presets.
 *
 * Usage:
 * ```typescript
 * import { selectFields, parseFieldsParam, FIELD_PRESETS } from '@/lib/api/field-selection';
 *
 * // Parse fields from query param
 * const fields = parseFieldsParam(searchParams.get('fields'));
 *
 * // Apply field selection to data
 * const optimizedData = selectFields(data, fields);
 *
 * // Use presets
 * const listFields = FIELD_PRESETS.conditions.list;
 * ```
 */

export type FieldList = string[];

/**
 * Parse comma-separated fields parameter into array
 *
 * @param fieldsParam - Comma-separated field names from query string
 * @returns Array of field names, or undefined if no fields specified
 */
export function parseFieldsParam(fieldsParam: string | null): FieldList | undefined {
  if (!fieldsParam || fieldsParam.trim() === '') {
    return undefined;
  }

  return fieldsParam
    .split(',')
    .map(f => f.trim())
    .filter(f => f.length > 0);
}

/**
 * Select specific fields from an object
 *
 * Supports nested field selection using dot notation (e.g., "author.name")
 * Always includes 'id' and 'slug' fields if they exist for safety.
 *
 * @param data - The source object
 * @param fields - Array of field names to include
 * @returns New object with only selected fields
 */
export function selectFields<T extends Record<string, unknown>>(
  data: T,
  fields?: FieldList
): Partial<T> {
  // If no fields specified, return original data
  if (!fields || fields.length === 0) {
    return data;
  }

  const result: Record<string, unknown> = {};

  // Always include identifier fields if they exist
  const safeFields = new Set(['id', 'slug', ...fields]);

  for (const field of safeFields) {
    if (field.includes('.')) {
      // Handle nested field (e.g., "author.name")
      const value = getNestedValue(data, field);
      if (value !== undefined) {
        setNestedValue(result, field, value);
      }
    } else if (field in data) {
      result[field] = data[field];
    }
  }

  return result as Partial<T>;
}

/**
 * Select fields from an array of objects
 *
 * @param dataArray - Array of objects
 * @param fields - Fields to select from each object
 * @returns Array of objects with selected fields
 */
export function selectFieldsArray<T extends Record<string, unknown>>(
  dataArray: T[],
  fields?: FieldList
): Partial<T>[] {
  if (!fields || fields.length === 0) {
    return dataArray;
  }

  return dataArray.map(item => selectFields(item, fields));
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    if (typeof current === 'object') {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }

  return current;
}

/**
 * Set nested value in object using dot notation
 */
function setNestedValue(
  obj: Record<string, unknown>,
  path: string,
  value: unknown
): void {
  const parts = path.split('.');
  let current = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current) || typeof current[part] !== 'object') {
      current[part] = {};
    }
    current = current[part] as Record<string, unknown>;
  }

  current[parts[parts.length - 1]] = value;
}

/**
 * Remove specified fields from an object
 *
 * Useful for removing large or sensitive fields before sending response.
 *
 * @param data - The source object
 * @param fieldsToRemove - Array of field names to exclude
 * @returns New object without excluded fields
 */
export function excludeFields<T extends Record<string, unknown>>(
  data: T,
  fieldsToRemove: FieldList
): Partial<T> {
  const result = { ...data };

  for (const field of fieldsToRemove) {
    if (field.includes('.')) {
      // Handle nested field removal
      deleteNestedValue(result, field);
    } else {
      delete result[field];
    }
  }

  return result;
}

/**
 * Remove fields from array of objects
 */
export function excludeFieldsArray<T extends Record<string, unknown>>(
  dataArray: T[],
  fieldsToRemove: FieldList
): Partial<T>[] {
  return dataArray.map(item => excludeFields(item, fieldsToRemove));
}

/**
 * Delete nested value from object
 */
function deleteNestedValue(obj: Record<string, unknown>, path: string): void {
  const parts = path.split('.');
  let current: Record<string, unknown> = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current) || typeof current[part] !== 'object') {
      return;
    }
    current = current[part] as Record<string, unknown>;
  }

  delete current[parts[parts.length - 1]];
}

/**
 * Predefined field presets for common API responses
 *
 * Use these to ensure consistent field selection across the API
 * and reduce payload sizes for listing endpoints.
 */
export const FIELD_PRESETS = {
  /** Condition field presets */
  conditions: {
    /** Minimal fields for list views */
    list: ['id', 'slug', 'name', 'display_name', 'short_description', 'category', 'research_count', 'is_featured'],
    /** Fields for search/autocomplete */
    search: ['id', 'slug', 'name', 'display_name', 'category'],
    /** Card display fields */
    card: ['id', 'slug', 'name', 'display_name', 'short_description', 'category', 'research_count'],
    /** Fields to exclude for list responses */
    excludeForList: ['description', 'content', 'seo_title', 'seo_description', 'topic_keywords', 'created_at', 'updated_at'],
  },

  /** Glossary field presets */
  glossary: {
    /** Minimal fields for list views */
    list: ['id', 'slug', 'term', 'display_name', 'short_definition', 'category'],
    /** Fields for search/autocomplete */
    search: ['id', 'slug', 'term', 'display_name', 'synonyms'],
    /** Card display fields */
    card: ['id', 'slug', 'term', 'display_name', 'short_definition', 'category', 'pronunciation'],
    /** Fields to exclude for list responses */
    excludeForList: ['full_definition', 'etymology', 'related_research', 'created_at', 'updated_at'],
  },

  /** Article field presets */
  articles: {
    /** Minimal fields for list views */
    list: ['id', 'slug', 'title', 'excerpt', 'featured_image', 'published_at', 'author_id', 'category_id'],
    /** Fields for search results */
    search: ['id', 'slug', 'title', 'excerpt'],
    /** Card display fields */
    card: ['id', 'slug', 'title', 'excerpt', 'featured_image', 'published_at', 'reading_time'],
    /** Fields to exclude for list responses */
    excludeForList: ['content', 'seo_title', 'seo_description', 'schema_markup', 'created_at', 'updated_at'],
  },

  /** Research/Study field presets */
  research: {
    /** Minimal fields for list views */
    list: ['id', 'slug', 'title', 'display_title', 'year', 'source', 'relevance_score'],
    /** Fields for search results */
    search: ['id', 'slug', 'title', 'display_title', 'year'],
    /** Card display fields */
    card: ['id', 'slug', 'title', 'display_title', 'year', 'source', 'study_type', 'study_subject', 'relevance_score'],
  },
} as const;

/**
 * Validate that requested fields are allowed
 *
 * @param requestedFields - Fields requested by client
 * @param allowedFields - List of fields that are allowed
 * @returns Filtered array containing only allowed fields
 */
export function validateFields(
  requestedFields: FieldList | undefined,
  allowedFields: FieldList
): FieldList | undefined {
  if (!requestedFields) {
    return undefined;
  }

  const allowedSet = new Set(allowedFields);
  return requestedFields.filter(f => allowedSet.has(f));
}

/**
 * Calculate approximate size reduction percentage
 *
 * @param original - Original data size
 * @param optimized - Optimized data size
 * @returns Percentage reduction (0-100)
 */
export function calculateSizeReduction(
  original: unknown,
  optimized: unknown
): number {
  const originalSize = JSON.stringify(original).length;
  const optimizedSize = JSON.stringify(optimized).length;

  if (originalSize === 0) return 0;

  return Math.round(((originalSize - optimizedSize) / originalSize) * 100);
}
