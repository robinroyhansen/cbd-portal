/**
 * Knowledge Base Data Layer
 * Central module for all data fetching with built-in caching
 *
 * This module provides a unified API for accessing:
 * - Conditions (with translations)
 * - Glossary terms (with translations)
 * - Articles (with citations)
 * - Research studies
 *
 * All queries use the in-memory LRU cache for improved performance.
 */

import { createClient } from '@/lib/supabase/server';
import { cache } from 'react';
import {
  getConditions,
  getConditionBySlug,
  getFeaturedConditions,
  getConditionsByCategory,
  getGlossaryTerms,
  getGlossaryTermBySlug,
  getGlossaryTermsForLinking,
  getPopularGlossaryTerms,
  getArticleBySlug,
  getResearchStudies,
  getResearchForCondition,
  getTotalResearchCount,
  getArticleCountsByCondition,
  invalidateConditionCache,
  invalidateGlossaryCache,
  invalidateArticleCache,
  invalidateResearchCache,
  invalidateAllContentCaches,
  preloadCommonData,
  preloadAllLanguages,
  type CachedCondition,
  type CachedGlossaryTerm,
  type CachedArticle,
  type CachedResearchStudy,
} from './cached-queries';
import type { LanguageCode } from './translation-service';

// ============================================================================
// Re-export types
// ============================================================================

export type {
  CachedCondition,
  CachedGlossaryTerm,
  CachedArticle,
  CachedResearchStudy,
};

// ============================================================================
// Condition Queries (Cached)
// ============================================================================

/**
 * Get all published conditions with translations
 * Cache TTL: 1 hour
 */
export const getKBConditions = cache(
  async (language: LanguageCode = 'en') => {
    return getConditions(language);
  }
);

/**
 * Get a single condition by slug
 * Cache TTL: 1 hour
 */
export const getKBConditionBySlug = cache(
  async (slug: string, language: LanguageCode = 'en') => {
    return getConditionBySlug(slug, language);
  }
);

/**
 * Get featured conditions (limited set for homepage, etc.)
 * Cache TTL: 1 hour
 */
export const getKBFeaturedConditions = cache(
  async (language: LanguageCode = 'en', limit: number = 12) => {
    return getFeaturedConditions(language, limit);
  }
);

/**
 * Get conditions grouped by category
 * Cache TTL: 1 hour (derived from getConditions)
 */
export const getKBConditionsByCategory = cache(
  async (language: LanguageCode = 'en') => {
    const conditions = await getConditions(language);

    const grouped: Record<string, CachedCondition[]> = {};
    conditions.forEach(condition => {
      const category = condition.category || 'other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(condition);
    });

    return grouped;
  }
);

// ============================================================================
// Glossary Queries (Cached)
// ============================================================================

/**
 * Get all glossary terms with translations
 * Cache TTL: 1 hour
 */
export const getKBGlossaryTerms = cache(
  async (language: LanguageCode = 'en') => {
    return getGlossaryTerms(language);
  }
);

/**
 * Get a single glossary term by slug
 * Cache TTL: 1 hour
 */
export const getKBGlossaryTermBySlug = cache(
  async (slug: string, language: LanguageCode = 'en') => {
    return getGlossaryTermBySlug(slug, language);
  }
);

/**
 * Get glossary terms optimized for auto-linking
 * Returns minimal data needed for the linker
 * Cache TTL: 1 hour
 */
export const getKBGlossaryTermsForLinking = cache(
  async (language: LanguageCode = 'en') => {
    return getGlossaryTermsForLinking(language);
  }
);

/**
 * Get popular glossary terms (by view count)
 * Cache TTL: 1 hour
 */
export const getKBPopularGlossaryTerms = cache(
  async (language: LanguageCode = 'en', limit: number = 15) => {
    return getPopularGlossaryTerms(language, limit);
  }
);

/**
 * Get glossary terms grouped by category
 * Cache TTL: 1 hour (derived from getGlossaryTerms)
 */
export const getKBGlossaryByCategory = cache(
  async (language: LanguageCode = 'en') => {
    const terms = await getGlossaryTerms(language);

    const grouped: Record<string, CachedGlossaryTerm[]> = {};
    terms.forEach(term => {
      const category = term.category || 'other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(term);
    });

    return grouped;
  }
);

/**
 * Get glossary terms grouped by first letter
 * Cache TTL: 1 hour (derived from getGlossaryTerms)
 */
export const getKBGlossaryByLetter = cache(
  async (language: LanguageCode = 'en') => {
    const terms = await getGlossaryTerms(language);

    const grouped: Record<string, CachedGlossaryTerm[]> = {};
    terms.forEach(term => {
      const letter = term.term.charAt(0).toUpperCase();
      if (!grouped[letter]) {
        grouped[letter] = [];
      }
      grouped[letter].push(term);
    });

    return grouped;
  }
);

// ============================================================================
// Article Queries (Cached)
// ============================================================================

/**
 * Get article by slug with all related data
 * Cache TTL: 30 minutes
 */
export const getKBArticleBySlug = cache(
  async (slug: string, language: LanguageCode = 'en') => {
    return getArticleBySlug(slug, language);
  }
);

/**
 * Get recent published articles
 * Uses React cache for request deduplication
 */
export const getKBRecentArticles = cache(
  async (language: LanguageCode = 'en', limit: number = 10) => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('kb_articles')
      .select(`
        id, slug, title, meta_description,
        published_at, updated_at, author_name,
        reading_time_minutes, condition_slug
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent articles:', error);
      return [];
    }

    return data || [];
  }
);

/**
 * Get articles for a specific condition
 */
export const getKBArticlesForCondition = cache(
  async (conditionSlug: string, language: LanguageCode = 'en', limit: number = 12) => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('kb_articles')
      .select(`
        id, slug, title, excerpt, featured_image,
        published_at, reading_time_minutes
      `)
      .eq('condition_slug', conditionSlug)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching condition articles:', error);
      return [];
    }

    return data || [];
  }
);

// ============================================================================
// Research Queries (Cached)
// ============================================================================

/**
 * Get approved research studies
 * Cache TTL: 1 hour
 */
export const getKBResearchStudies = cache(
  async (topic?: string, limit: number = 50) => {
    return getResearchStudies(topic, limit);
  }
);

/**
 * Get research for a specific condition
 * Cache TTL: 1 hour
 */
export const getKBResearchForCondition = cache(
  async (conditionSlug: string, limit: number = 20) => {
    return getResearchForCondition(conditionSlug, limit);
  }
);

/**
 * Get research study by slug
 * Uses React cache for request deduplication
 */
export const getKBResearchBySlug = cache(
  async (slug: string) => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('kb_research_queue')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'approved')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching research study:', error);
    }

    return data || null;
  }
);

// ============================================================================
// Statistics Queries (Cached)
// ============================================================================

/**
 * Get total count of approved research studies
 * Cache TTL: 1 hour
 */
export const getKBTotalResearchCount = cache(
  async () => {
    return getTotalResearchCount();
  }
);

/**
 * Get article counts per condition
 * Cache TTL: 1 hour
 */
export const getKBArticleCountsByCondition = cache(
  async () => {
    return getArticleCountsByCondition();
  }
);

/**
 * Get comprehensive KB statistics
 */
export const getKBStats = cache(
  async (language: LanguageCode = 'en') => {
    const [conditions, glossaryTerms, researchCount, articleCounts] = await Promise.all([
      getConditions(language),
      getGlossaryTerms(language),
      getTotalResearchCount(),
      getArticleCountsByCondition(),
    ]);

    const totalArticles = Object.values(articleCounts).reduce((sum, count) => sum + count, 0);

    return {
      conditionCount: conditions.length,
      glossaryTermCount: glossaryTerms.length,
      researchCount,
      articleCount: totalArticles,
      featuredConditionCount: conditions.filter(c => c.is_featured).length,
    };
  }
);

// ============================================================================
// Cache Management
// ============================================================================

/**
 * Invalidate condition-related caches
 */
export function invalidateKBConditionCache(slug?: string): void {
  invalidateConditionCache(slug);
}

/**
 * Invalidate glossary-related caches
 */
export function invalidateKBGlossaryCache(slug?: string): void {
  invalidateGlossaryCache(slug);
}

/**
 * Invalidate article-related caches
 */
export function invalidateKBArticleCache(slug?: string): void {
  invalidateArticleCache(slug);
}

/**
 * Invalidate research-related caches
 */
export function invalidateKBResearchCache(): void {
  invalidateResearchCache();
}

/**
 * Invalidate all KB caches
 * Use when performing bulk content updates
 */
export function invalidateAllKBCaches(): void {
  invalidateAllContentCaches();
}

/**
 * Preload common KB data for a specific language
 * Call during server startup or warm-up
 */
export async function preloadKBData(language: LanguageCode = 'en'): Promise<void> {
  await preloadCommonData(language);
}

/**
 * Preload KB data for all supported languages
 */
export async function preloadAllKBData(): Promise<void> {
  await preloadAllLanguages();
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Search across conditions and glossary terms
 */
export const searchKB = cache(
  async (query: string, language: LanguageCode = 'en', limit: number = 20) => {
    const normalizedQuery = query.toLowerCase().trim();

    if (!normalizedQuery || normalizedQuery.length < 2) {
      return { conditions: [], glossaryTerms: [] };
    }

    const [conditions, glossaryTerms] = await Promise.all([
      getConditions(language),
      getGlossaryTerms(language),
    ]);

    // Search conditions
    const matchingConditions = conditions
      .filter(c =>
        c.name.toLowerCase().includes(normalizedQuery) ||
        c.display_name?.toLowerCase().includes(normalizedQuery) ||
        c.short_description?.toLowerCase().includes(normalizedQuery) ||
        c.topic_keywords.some(k => k.toLowerCase().includes(normalizedQuery))
      )
      .slice(0, limit);

    // Search glossary terms
    const matchingTerms = glossaryTerms
      .filter(t =>
        t.term.toLowerCase().includes(normalizedQuery) ||
        t.definition.toLowerCase().includes(normalizedQuery) ||
        t.synonyms?.some(s => s.toLowerCase().includes(normalizedQuery))
      )
      .slice(0, limit);

    return {
      conditions: matchingConditions,
      glossaryTerms: matchingTerms,
    };
  }
);

/**
 * Get sitemap data for all published content
 */
export const getKBSitemapData = cache(
  async () => {
    const supabase = await createClient();

    const [conditions, glossary, articles, research] = await Promise.all([
      supabase
        .from('kb_conditions')
        .select('slug, updated_at')
        .eq('is_published', true),

      supabase
        .from('kb_glossary')
        .select('slug, updated_at'),

      supabase
        .from('kb_articles')
        .select('slug, updated_at')
        .eq('status', 'published'),

      supabase
        .from('kb_research_queue')
        .select('slug, updated_at')
        .eq('status', 'approved')
        .not('slug', 'is', null),
    ]);

    return {
      conditions: conditions.data || [],
      glossary: glossary.data || [],
      articles: articles.data || [],
      research: research.data || [],
    };
  }
);
