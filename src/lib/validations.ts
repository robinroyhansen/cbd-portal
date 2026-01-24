import { z } from 'zod';

/**
 * Reusable validation schemas for API inputs
 * Using zod for runtime type checking and validation
 */

// ============================================
// Common field schemas
// ============================================

/** Safe string that strips HTML and limits length */
export const safeString = (maxLength = 1000) =>
  z.string()
    .max(maxLength, `Must be ${maxLength} characters or less`)
    .transform(s => s.trim());

/** Email validation */
export const email = z
  .string()
  .email('Invalid email address')
  .max(254)
  .transform(s => s.toLowerCase().trim());

/** URL validation */
export const url = z
  .string()
  .url('Invalid URL')
  .max(2000)
  .optional()
  .nullable();

/** Slug validation (lowercase, alphanumeric, hyphens) */
export const slug = z
  .string()
  .min(2, 'Slug must be at least 2 characters')
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only')
  .optional();

/** UUID validation */
export const uuid = z.string().uuid('Invalid ID format');

/** Positive integer */
export const positiveInt = z.number().int().positive();

/** Score (0-100) */
export const score = z.number().int().min(0).max(100);

// ============================================
// Comments API
// ============================================

export const commentCreateSchema = z.object({
  article_id: uuid,
  author_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be 100 characters or less')
    .transform(s => s.trim()),
  author_email: email,
  comment_text: z
    .string()
    .min(10, 'Comment must be at least 10 characters')
    .max(5000, 'Comment must be 5000 characters or less')
    .transform(s => s.trim()),
  parent_id: uuid.optional().nullable(),
  honeypot: z.string().optional(), // Spam trap field
});

export type CommentCreate = z.infer<typeof commentCreateSchema>;

// ============================================
// Authors API
// ============================================

export const authorCreateSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100)
    .transform(s => s.trim()),
  slug: slug,
  title: safeString(100).optional().nullable(),
  email: email.optional().nullable(),
  bio_short: safeString(500).optional().nullable(),
  bio_full: safeString(10000).optional().nullable(),
  image_url: url,
  website_url: url,
  linkedin_url: url,
  twitter_url: url,
  credentials: z.array(z.string().max(100)).optional().nullable(),
  expertise_areas: z.array(z.string().max(100)).optional().nullable(),
  is_primary: z.boolean().optional().default(false),
});

export const authorUpdateSchema = authorCreateSchema.partial();

export type AuthorCreate = z.infer<typeof authorCreateSchema>;
export type AuthorUpdate = z.infer<typeof authorUpdateSchema>;

// ============================================
// Brands API
// ============================================

export const brandCreateSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100)
    .transform(s => s.trim()),
  slug: slug,
  website_url: url,
  logo_url: url,
  headquarters_country: z.string().max(2).optional().nullable(), // ISO country code
  founded_year: z.number().int().min(1900).max(2100).optional().nullable(),
  short_description: safeString(500).optional().nullable(),
  description: safeString(5000).optional().nullable(),
  certifications: z.array(z.string().max(100)).optional().nullable(),
  is_published: z.boolean().optional().default(false),
});

export const brandUpdateSchema = brandCreateSchema.partial();

export type BrandCreate = z.infer<typeof brandCreateSchema>;
export type BrandUpdate = z.infer<typeof brandUpdateSchema>;

// ============================================
// Brand Reviews API
// ============================================

/** Review score for a single criterion */
export const brandReviewScoreSchema = z.object({
  criterion_id: uuid,
  score: z.number().int().min(0).max(100),
  sub_scores: z.record(z.string(), z.number()).optional().default({}),
  ai_reasoning: safeString(5000).optional().nullable(),
  author_notes: safeString(5000).optional().nullable(),
});

export const brandReviewCreateSchema = z.object({
  brand_id: uuid,
  author_id: uuid.optional().nullable(),
  summary: safeString(1000).optional().nullable(),
  full_review: safeString(50000).optional().nullable(),
  section_content: z.record(z.string(), z.string()).optional().default({}),
  pros: z.array(z.string().max(200)).optional().default([]),
  cons: z.array(z.string().max(200)).optional().default([]),
  verdict: safeString(500).optional().nullable(),
  sources_researched: z.array(z.string().max(500)).optional().default([]),
  trustpilot_score: z.number().min(0).max(5).optional().nullable(),
  trustpilot_count: z.number().int().min(0).optional().nullable(),
  google_score: z.number().min(0).max(5).optional().nullable(),
  google_count: z.number().int().min(0).optional().nullable(),
  meta_title: safeString(70).optional().nullable(),
  meta_description: safeString(160).optional().nullable(),
  certifications: z.array(z.string().max(100)).optional().default([]),
  scores: z.array(brandReviewScoreSchema).optional().default([]),
});

export const brandReviewUpdateSchema = brandReviewCreateSchema.partial().extend({
  id: uuid,
  is_published: z.boolean().optional(),
  scheduled_publish_at: z.string().datetime().optional().nullable(),
});

export type BrandReviewScore = z.infer<typeof brandReviewScoreSchema>;
export type BrandReviewCreate = z.infer<typeof brandReviewCreateSchema>;
export type BrandReviewUpdate = z.infer<typeof brandReviewUpdateSchema>;

// ============================================
// Glossary API
// ============================================

export const glossaryTermSchema = z.object({
  term: z
    .string()
    .min(2, 'Term must be at least 2 characters')
    .max(100)
    .transform(s => s.trim()),
  display_name: safeString(100).optional().nullable(),
  definition: z
    .string()
    .min(10, 'Definition must be at least 10 characters')
    .max(10000)
    .transform(s => s.trim()),
  short_definition: z
    .string()
    .min(10, 'Short definition must be at least 10 characters')
    .max(500)
    .transform(s => s.trim()),
  category: z
    .string()
    .min(1, 'Category is required')
    .max(50),
  synonyms: z.array(z.string().max(100)).optional().default([]),
  related_terms: z.array(z.string().max(100)).optional().default([]),
  related_research: z.array(z.string()).optional().default([]),
  sources: z.array(z.string().max(500)).optional().default([]),
});

export const glossaryTermUpdateSchema = glossaryTermSchema.partial().extend({
  id: uuid,
});

export type GlossaryTerm = z.infer<typeof glossaryTermSchema>;
export type GlossaryTermUpdate = z.infer<typeof glossaryTermUpdateSchema>;

// ============================================
// Articles API
// ============================================

export const articleCreateSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200)
    .transform(s => s.trim()),
  slug: slug,
  excerpt: safeString(500).optional().nullable(),
  content: safeString(100000).optional().nullable(),
  author_id: uuid.optional().nullable(),
  category_id: uuid.optional().nullable(),
  featured_image: url,
  meta_title: safeString(70).optional().nullable(),
  meta_description: safeString(160).optional().nullable(),
  status: z.enum(['draft', 'published', 'archived']).optional().default('draft'),
  tags: z.array(z.string().max(50)).optional().nullable(),
});

export const articleUpdateSchema = articleCreateSchema.partial();

export type ArticleCreate = z.infer<typeof articleCreateSchema>;
export type ArticleUpdate = z.infer<typeof articleUpdateSchema>;

// ============================================
// Search API
// ============================================

export const searchQuerySchema = z.object({
  q: z
    .string()
    .min(2, 'Query must be at least 2 characters')
    .max(200)
    .transform(s => s.trim()),
  type: z.enum(['study', 'article', 'glossary', 'brand']).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;

// ============================================
// Validation helper
// ============================================

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

/**
 * Validate input against a schema
 * Returns typed data or formatted error messages
 */
export function validate<T>(
  schema: z.ZodSchema<T>,
  input: unknown
): ValidationResult<T> {
  const result = schema.safeParse(input);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = result.error.errors.map(err => {
    const path = err.path.join('.');
    return path ? `${path}: ${err.message}` : err.message;
  });

  return { success: false, errors };
}
