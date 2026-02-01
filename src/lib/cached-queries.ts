/**
 * Cached versions of common database queries
 * Uses the in-memory LRU cache for improved performance
 *
 * Cache TTLs:
 * - Conditions: 1 hour
 * - Glossary terms: 1 hour
 * - Articles: 30 minutes
 * - Research studies: 1 hour
 */

import { createClient } from '@/lib/supabase/server';
import {
  getCache,
  createCacheKey,
  CacheKeys,
  TTL,
  cached,
  cachedSWR,
  invalidateOnEvent,
  type InvalidationEvent,
} from './cache';
import type { LanguageCode } from './translation-service';

// ============================================================================
// Types
// ============================================================================

export interface CachedCondition {
  id: string;
  slug: string;
  name: string;
  display_name: string | null;
  short_description: string | null;
  meta_title: string | null;
  meta_description: string | null;
  category: string;
  research_count: number;
  is_featured: boolean;
  topic_keywords: string[];
  display_order: number;
}

export interface CachedGlossaryTerm {
  id: string;
  slug: string;
  term: string;
  definition: string;
  short_definition: string | null;
  category: string;
  synonyms: string[] | null;
  pronunciation: string | null;
  related_terms: string[] | null;
  view_count: number;
}

export interface CachedArticle {
  id: string;
  slug: string;
  title: string;
  content: string;
  meta_description: string | null;
  meta_title: string | null;
  status: string;
  published_at: string | null;
  updated_at: string | null;
  author_name: string | null;
  reading_time_minutes: number | null;
  condition_slug: string | null;
  category_id: string | null;
  category?: {
    name: string;
    slug: string;
  } | null;
  citations?: Array<{
    id: string;
    title: string;
    authors: string | null;
    publication: string | null;
    year: number | null;
    url: string | null;
    doi: string | null;
    pmid: string | null;
    slug: string | null;
  }>;
}

export interface CachedResearchStudy {
  id: string;
  title: string;
  abstract: string | null;
  plain_summary: string | null;
  year: number | null;
  study_type: string | null;
  study_subject: string | null;
  sample_size: number | null;
  quality_score: number | null;
  primary_topic: string | null;
  relevant_topics: string[] | null;
  doi: string | null;
  pmid: string | null;
  slug: string | null;
  source: string | null;
}

// ============================================================================
// Internal Fetch Functions (without caching)
// ============================================================================

async function fetchConditionsBase(language: LanguageCode): Promise<CachedCondition[]> {
  const supabase = await createClient();

  const { data: conditions, error } = await supabase
    .from('kb_conditions')
    .select(`
      id, slug, name, display_name, short_description,
      meta_title_template, meta_description_template,
      category, research_count, is_featured, topic_keywords, display_order
    `)
    .eq('is_published', true)
    .order('display_order', { ascending: true });

  if (error || !conditions) {
    console.error('Error fetching conditions:', error);
    return [];
  }

  // If English, return as-is
  if (language === 'en') {
    return conditions.map(c => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      display_name: c.display_name,
      short_description: c.short_description,
      meta_title: c.meta_title_template,
      meta_description: c.meta_description_template,
      category: c.category,
      research_count: c.research_count,
      is_featured: c.is_featured,
      topic_keywords: c.topic_keywords || [],
      display_order: c.display_order,
    }));
  }

  // Fetch translations
  const conditionIds = conditions.map(c => c.id);
  const { data: translations } = await supabase
    .from('condition_translations')
    .select('condition_id, name, display_name, short_description, meta_title, meta_description')
    .eq('language', language)
    .in('condition_id', conditionIds);

  const translationMap = new Map(
    (translations || []).map(t => [t.condition_id, t])
  );

  return conditions.map(c => {
    const trans = translationMap.get(c.id);
    return {
      id: c.id,
      slug: c.slug,
      name: trans?.name || c.name,
      display_name: trans?.display_name || c.display_name,
      short_description: trans?.short_description || c.short_description,
      meta_title: trans?.meta_title || c.meta_title_template,
      meta_description: trans?.meta_description || c.meta_description_template,
      category: c.category,
      research_count: c.research_count,
      is_featured: c.is_featured,
      topic_keywords: c.topic_keywords || [],
      display_order: c.display_order,
    };
  });
}

async function fetchGlossaryTermsBase(language: LanguageCode): Promise<CachedGlossaryTerm[]> {
  const supabase = await createClient();

  const { data: terms, error } = await supabase
    .from('kb_glossary')
    .select(`
      id, slug, term, definition, short_definition,
      category, synonyms, pronunciation, related_terms, view_count
    `)
    .order('term', { ascending: true })
    .limit(1000);

  if (error || !terms) {
    console.error('Error fetching glossary terms:', error);
    return [];
  }

  if (language === 'en') {
    return terms.map(t => ({
      id: t.id,
      slug: t.slug,
      term: t.term,
      definition: t.definition,
      short_definition: t.short_definition,
      category: t.category,
      synonyms: t.synonyms,
      pronunciation: t.pronunciation,
      related_terms: t.related_terms,
      view_count: t.view_count || 0,
    }));
  }

  // Fetch translations
  const termIds = terms.map(t => t.id);
  const { data: translations } = await supabase
    .from('glossary_translations')
    .select('term_id, term, definition, simple_definition')
    .eq('language', language)
    .in('term_id', termIds);

  const translationMap = new Map(
    (translations || []).map(t => [t.term_id, t])
  );

  return terms.map(t => {
    const trans = translationMap.get(t.id);
    return {
      id: t.id,
      slug: t.slug,
      term: trans?.term || t.term,
      definition: trans?.definition || t.definition,
      short_definition: trans?.simple_definition || t.short_definition,
      category: t.category,
      synonyms: t.synonyms,
      pronunciation: t.pronunciation,
      related_terms: t.related_terms,
      view_count: t.view_count || 0,
    };
  });
}

async function fetchArticleBySlugBase(slug: string, language: LanguageCode = 'en'): Promise<CachedArticle | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('kb_articles')
    .select(`
      id, slug, title, content, meta_description, meta_title,
      status, published_at, updated_at, author_name,
      reading_time_minutes, condition_slug, category_id,
      category:kb_categories(name, slug),
      citations:kb_citations(id, title, authors, publication, year, url, doi, pmid, slug)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !data) {
    if (error && error.code !== 'PGRST116') { // Not found is not an error
      console.error('Error fetching article:', error);
    }
    return null;
  }

  // If English, return as-is
  if (language === 'en') {
    return {
      id: data.id,
      slug: data.slug,
      title: data.title,
      content: data.content,
      meta_description: data.meta_description,
      meta_title: data.meta_title,
      status: data.status,
      published_at: data.published_at,
      updated_at: data.updated_at,
      author_name: data.author_name,
      reading_time_minutes: data.reading_time_minutes,
      condition_slug: data.condition_slug,
      category_id: data.category_id,
      category: data.category as CachedArticle['category'],
      citations: data.citations as CachedArticle['citations'],
    };
  }

  // Fetch translation for non-English languages
  const { data: translation } = await supabase
    .from('article_translations')
    .select('title, meta_description, excerpt')
    .eq('article_id', data.id)
    .eq('language', language)
    .single();

  return {
    id: data.id,
    slug: data.slug,
    title: translation?.title || data.title,
    content: data.content, // Content stays in English for now
    meta_description: translation?.meta_description || data.meta_description,
    meta_title: data.meta_title,
    status: data.status,
    published_at: data.published_at,
    updated_at: data.updated_at,
    author_name: data.author_name,
    reading_time_minutes: data.reading_time_minutes,
    condition_slug: data.condition_slug,
    category_id: data.category_id,
    category: data.category as CachedArticle['category'],
    citations: data.citations as CachedArticle['citations'],
  };
}

async function fetchResearchStudiesBase(
  topic?: string,
  limit: number = 50
): Promise<CachedResearchStudy[]> {
  const supabase = await createClient();

  let query = supabase
    .from('kb_research_queue')
    .select(`
      id, title, abstract, plain_summary, year,
      study_type, study_subject, sample_size, quality_score,
      primary_topic, relevant_topics, doi, pmid, slug, source
    `)
    .eq('status', 'approved')
    .order('quality_score', { ascending: false })
    .limit(limit);

  if (topic) {
    query = query.or(`primary_topic.eq.${topic},relevant_topics.cs.{${topic}}`);
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error('Error fetching research studies:', error);
    return [];
  }

  return data.map(s => ({
    id: s.id,
    title: s.title,
    abstract: s.abstract,
    plain_summary: s.plain_summary,
    year: s.year,
    study_type: s.study_type,
    study_subject: s.study_subject,
    sample_size: s.sample_size,
    quality_score: s.quality_score,
    primary_topic: s.primary_topic,
    relevant_topics: s.relevant_topics,
    doi: s.doi,
    pmid: s.pmid,
    slug: s.slug,
    source: s.source,
  }));
}

// ============================================================================
// Cached Query Functions
// ============================================================================

/**
 * Get all conditions with translations - cached for 1 hour
 */
export async function getConditions(language: LanguageCode = 'en'): Promise<CachedCondition[]> {
  const cache = getCache('conditions');
  const cacheKey = createCacheKey(CacheKeys.CONDITIONS, language);

  // Check cache
  const cached = cache.get<CachedCondition[]>(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  // Fetch and cache
  const conditions = await fetchConditionsBase(language);
  cache.set(cacheKey, conditions, { ttl: TTL.LONG });

  return conditions;
}

/**
 * Get a single condition by slug with translation - cached for 1 hour
 */
export async function getConditionBySlug(
  slug: string,
  language: LanguageCode = 'en'
): Promise<CachedCondition | null> {
  const cache = getCache('conditions');
  const cacheKey = createCacheKey(CacheKeys.CONDITION, slug, language);

  // Check cache
  const cached = cache.get<CachedCondition | null>(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  // Try to find in conditions list first (more efficient)
  const conditions = await getConditions(language);
  const condition = conditions.find(c => c.slug === slug) || null;

  cache.set(cacheKey, condition, { ttl: TTL.LONG });
  return condition;
}

/**
 * Get featured conditions - cached for 1 hour
 */
export async function getFeaturedConditions(
  language: LanguageCode = 'en',
  limit: number = 12
): Promise<CachedCondition[]> {
  const conditions = await getConditions(language);
  return conditions
    .filter(c => c.is_featured)
    .slice(0, limit);
}

/**
 * Get conditions by category - cached for 1 hour
 */
export async function getConditionsByCategory(
  category: string,
  language: LanguageCode = 'en'
): Promise<CachedCondition[]> {
  const conditions = await getConditions(language);
  return conditions.filter(c => c.category === category);
}

/**
 * Get all glossary terms with translations - cached for 1 hour
 */
export async function getGlossaryTerms(language: LanguageCode = 'en'): Promise<CachedGlossaryTerm[]> {
  const cache = getCache('glossary');
  const cacheKey = createCacheKey(CacheKeys.GLOSSARY, language);

  // Check cache
  const cached = cache.get<CachedGlossaryTerm[]>(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  // Fetch and cache
  const terms = await fetchGlossaryTermsBase(language);
  cache.set(cacheKey, terms, { ttl: TTL.LONG });

  return terms;
}

/**
 * Get a single glossary term by slug - cached for 1 hour
 */
export async function getGlossaryTermBySlug(
  slug: string,
  language: LanguageCode = 'en'
): Promise<CachedGlossaryTerm | null> {
  const cache = getCache('glossary');
  const cacheKey = createCacheKey(CacheKeys.GLOSSARY_TERM, slug, language);

  // Check cache
  const cached = cache.get<CachedGlossaryTerm | null>(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  // Try to find in full list first (more efficient if list is already cached)
  const terms = await getGlossaryTerms(language);
  const term = terms.find(t => t.slug === slug) || null;

  cache.set(cacheKey, term, { ttl: TTL.LONG });
  return term;
}

/**
 * Get glossary terms for auto-linking - optimized minimal data
 */
export async function getGlossaryTermsForLinking(
  language: LanguageCode = 'en'
): Promise<Array<{ term: string; slug: string; short_definition: string; synonyms: string[] }>> {
  const terms = await getGlossaryTerms(language);
  return terms.map(t => ({
    term: t.term,
    slug: t.slug,
    short_definition: t.short_definition || '',
    synonyms: t.synonyms || [],
  }));
}

/**
 * Get popular glossary terms - cached for 1 hour
 */
export async function getPopularGlossaryTerms(
  language: LanguageCode = 'en',
  limit: number = 15
): Promise<CachedGlossaryTerm[]> {
  const terms = await getGlossaryTerms(language);
  return terms
    .filter(t => t.view_count > 0)
    .sort((a, b) => b.view_count - a.view_count)
    .slice(0, limit);
}

/**
 * Get article by slug - cached for 30 minutes
 */
export async function getArticleBySlug(
  slug: string,
  language: LanguageCode = 'en'
): Promise<CachedArticle | null> {
  const cache = getCache('articles');
  const cacheKey = createCacheKey(CacheKeys.ARTICLE, slug, language);

  // Check cache
  const cached = cache.get<CachedArticle | null>(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  // Fetch and cache
  const article = await fetchArticleBySlugBase(slug, language);
  cache.set(cacheKey, article, { ttl: TTL.ARTICLE });

  return article;
}

/**
 * Get research studies - cached for 1 hour
 */
export async function getResearchStudies(
  topic?: string,
  limit: number = 50
): Promise<CachedResearchStudy[]> {
  const cache = getCache('research');
  const cacheKey = createCacheKey(CacheKeys.RESEARCH, topic || 'all', limit.toString());

  // Check cache
  const cached = cache.get<CachedResearchStudy[]>(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  // Fetch and cache
  const studies = await fetchResearchStudiesBase(topic, limit);
  cache.set(cacheKey, studies, { ttl: TTL.LONG });

  return studies;
}

/**
 * Get research studies for a specific condition - cached for 1 hour
 */
export async function getResearchForCondition(
  conditionSlug: string,
  limit: number = 20
): Promise<CachedResearchStudy[]> {
  // Map slug to topic key (e.g., "anxiety-disorder" -> "anxiety")
  const topicKey = conditionSlug.split('-')[0];
  return getResearchStudies(topicKey, limit);
}

/**
 * Get total research count - cached for 1 hour
 */
export async function getTotalResearchCount(): Promise<number> {
  const cache = getCache('stats');
  const cacheKey = createCacheKey(CacheKeys.STATS, 'total-research');

  // Check cache
  const cached = cache.get<number>(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  // Fetch count
  const supabase = await createClient();
  const { count, error } = await supabase
    .from('kb_research_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');

  if (error) {
    console.error('Error fetching research count:', error);
    return 0;
  }

  const totalCount = count || 0;
  cache.set(cacheKey, totalCount, { ttl: TTL.LONG });

  return totalCount;
}

/**
 * Get article counts per condition - cached for 1 hour
 */
export async function getArticleCountsByCondition(): Promise<Record<string, number>> {
  const cache = getCache('stats');
  const cacheKey = createCacheKey(CacheKeys.STATS, 'article-counts');

  // Check cache
  const cached = cache.get<Record<string, number>>(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  // Fetch counts
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('kb_articles')
    .select('condition_slug')
    .eq('status', 'published')
    .not('condition_slug', 'is', null);

  if (error) {
    console.error('Error fetching article counts:', error);
    return {};
  }

  const counts: Record<string, number> = {};
  data?.forEach(article => {
    if (article.condition_slug) {
      counts[article.condition_slug] = (counts[article.condition_slug] || 0) + 1;
    }
  });

  cache.set(cacheKey, counts, { ttl: TTL.LONG });
  return counts;
}

// ============================================================================
// Cache Invalidation Helpers
// ============================================================================

/**
 * Invalidate condition caches
 */
export function invalidateConditionCache(slug?: string): void {
  invalidateOnEvent(slug ? 'condition:updated' : 'condition:deleted', slug);
}

/**
 * Invalidate glossary caches
 */
export function invalidateGlossaryCache(slug?: string): void {
  invalidateOnEvent(slug ? 'glossary:updated' : 'glossary:deleted', slug);
}

/**
 * Invalidate article caches
 */
export function invalidateArticleCache(slug?: string): void {
  invalidateOnEvent(slug ? 'article:updated' : 'article:deleted', slug);
}

/**
 * Invalidate research caches
 */
export function invalidateResearchCache(): void {
  invalidateOnEvent('research:approved');
}

/**
 * Invalidate all content caches (for bulk updates)
 */
export function invalidateAllContentCaches(): void {
  invalidateOnEvent('content:bulk-update');
}

// ============================================================================
// Preload Functions (for warming cache)
// ============================================================================

/**
 * Preload common cached data
 * Call this during server startup or on first request
 */
export async function preloadCommonData(language: LanguageCode = 'en'): Promise<void> {
  await Promise.all([
    getConditions(language),
    getGlossaryTerms(language),
    getTotalResearchCount(),
  ]);
}

/**
 * Preload data for all supported languages
 */
export async function preloadAllLanguages(): Promise<void> {
  const languages: LanguageCode[] = ['en', 'da', 'sv', 'no', 'de', 'nl', 'fi', 'fr', 'it'];

  await Promise.all(
    languages.map(lang => preloadCommonData(lang))
  );
}

// ============================================================================
// SWR-style cached queries (for non-critical data)
// ============================================================================

/**
 * Get conditions using stale-while-revalidate pattern
 * Returns stale data immediately while fetching fresh data in background
 */
export const getConditionsSWR = cachedSWR(
  fetchConditionsBase,
  {
    store: 'conditions',
    ttl: TTL.LONG,
    staleTime: TTL.MEDIUM,
    keyPrefix: 'conditions-swr',
  }
);

/**
 * Get glossary terms using stale-while-revalidate pattern
 */
export const getGlossaryTermsSWR = cachedSWR(
  fetchGlossaryTermsBase,
  {
    store: 'glossary',
    ttl: TTL.LONG,
    staleTime: TTL.MEDIUM,
    keyPrefix: 'glossary-swr',
  }
);
